#!/usr/bin/env node
/**
 * Validate Atlas Data — Schema + referential integrity check
 *
 * 5 gate (rút từ global-ai-industry-atlas/scripts/validate-data.js):
 *   1. Data Gate    — no dup ID, entity có segment, revenue có sourceIds
 *   2. Source Gate  — no placeholder URL, required fields
 *   3. Content Gate — definition/mechanism ≥20 chars, scenario có trigger+assumptions
 *   4. CrossRef Gate — segments/companies/sources tồn tại khi reference
 *   5. Coverage Gate — count entity vs target
 *
 * Usage:
 *   node validate_atlas_data.js /path/to/data/
 *   node validate_atlas_data.js /path/to/data/ --strict  // warnings → fail
 *
 * Exit code: 0 = pass, 1 = warning, 2 = fail.
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIG — target counts (override theo scope project)
// ============================================================
const COVERAGE_TARGETS = {
  segments: { min: 5, warn: 10 },     // atlas nhỏ 5+, đầy đủ 22+
  companies: { min: 20, warn: 50 },   // 20+ tối thiểu
  founders: { min: 5, warn: 20 },
  sources: { min: 10, warn: 30 },
};

const DANGLING_THRESHOLD = 20;  // > 20 dangling refs → FAIL

const TIER_ENUM = [
  'chokepoint-core', 'chokepoint', 'bottleneck-material', 'emerging-bottleneck',
  'core-platform', 'core-AI', 'platform', 'application', 'vertical',
  'middleware', 'distribution-power', 'downstream-input',
  'emerging', 'financially-fragile', 'governance', 'platform-power',
  'real-estate', 'thin-margin-integrator', 'enabling',
];

const CONFIDENCE_ENUM = ['Verified', 'Triangulated', 'Estimated', 'Unknown'];

const SOURCE_TIER_ENUM = ['T1', 'T2', 'T3', 'T4'];

const PLACEHOLDER_PATTERNS = [
  /example\.com/i, /placeholder/i, /\bTODO\b/i, /\bTBD\b/i, /\bXXX\b/i, /^test$/i,
];

// ============================================================
// MAIN
// ============================================================
function main() {
  const args = process.argv.slice(2);
  const dataDir = args.find((a) => !a.startsWith('--'));
  const strict = args.includes('--strict');

  if (!dataDir) {
    console.error('❌ Usage: node validate_atlas_data.js /path/to/data/ [--strict]');
    process.exit(2);
  }

  if (!fs.existsSync(dataDir)) {
    console.error(`❌ Data dir not found: ${dataDir}`);
    process.exit(2);
  }

  console.log(`🔍 Validating: ${dataDir}\n`);

  // Load all JSON
  const data = {};
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    try {
      const key = f.replace(/\.json$/, '').split('-').join('_');
      data[key] = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
    } catch (e) {
      console.error(`❌ JSON parse fail: ${f} — ${e.message}`);
      process.exit(2);
    }
  }

  // Build merged companies (Tier A + B + C)
  const companiesAll = [
    ...(data.companies?.companies || []),
    ...(data.companies_tier_b?.companies || []),
    ...(data.companies_tier_c?.companies || []),
  ];
  data.companies_all = { companies: companiesAll };

  const result = { pass: [], warn: [], fail: [] };
  const pushFail = (msg) => result.fail.push(msg);
  const pushWarn = (msg) => result.warn.push(msg);
  const pushPass = (msg) => result.pass.push(msg);

  /* ============================================================
     GATE 1 — DATA GATE
     ============================================================ */
  console.log('━'.repeat(50));
  console.log('GATE 1: Data integrity');
  console.log('━'.repeat(50));

  // 1a. No duplicate company IDs
  const companyIds = companiesAll.map((c) => c.id).filter(Boolean);
  const dupCompany = findDup(companyIds);
  if (dupCompany.length > 0) {
    pushFail(`Duplicate company IDs: ${dupCompany.join(', ')}`);
  } else {
    pushPass(`No duplicate company IDs (${companyIds.length} companies)`);
  }

  // 1b. Every company has ≥1 segment (Tier A only — B/C optional)
  const noSegment = (data.companies?.companies || [])
    .filter((c) => !c.segments || c.segments.length === 0)
    .map((c) => c.id);
  if (noSegment.length > 0) {
    pushFail(`Tier A companies missing segments[]: ${noSegment.join(', ')}`);
  } else {
    pushPass('All Tier A companies have segments[]');
  }

  // 1c. Revenue có sourceIds + year + unit
  const badRevenue = [];
  (data.companies?.companies || []).forEach((c) => {
    if (!c.financials?.revenueUSD) return;
    Object.entries(c.financials.revenueUSD).forEach(([k, v]) => {
      if (!v.sourceIds || v.sourceIds.length === 0) {
        badRevenue.push(`${c.id}.revenueUSD.${k} missing sourceIds`);
      }
      if (!v.unit) badRevenue.push(`${c.id}.revenueUSD.${k} missing unit`);
    });
  });
  if (badRevenue.length > 0) {
    pushFail(`Revenue missing sourceIds/unit: ${badRevenue.slice(0, 5).join('; ')}${badRevenue.length > 5 ? ` (+${badRevenue.length - 5} more)` : ''}`);
  } else {
    pushPass('All revenue entries have sourceIds + unit');
  }

  // 1d. Founder education có source
  const badEdu = [];
  (data.founders?.founders || []).forEach((f) => {
    (f.education || []).forEach((e, i) => {
      if (!e.sourceIds || e.sourceIds.length === 0) {
        badEdu.push(`${f.id}.education[${i}] missing sourceIds`);
      }
    });
  });
  if (badEdu.length > 0) {
    pushWarn(`Education missing sourceIds: ${badEdu.slice(0, 3).join('; ')}${badEdu.length > 3 ? ` (+${badEdu.length - 3} more)` : ''}`);
  } else {
    pushPass('All education entries have sourceIds');
  }

  /* ============================================================
     GATE 2 — SOURCE GATE
     ============================================================ */
  console.log('\n' + '━'.repeat(50));
  console.log('GATE 2: Source registry');
  console.log('━'.repeat(50));

  const sources = data.sources?.sources || [];
  const sourceIds = new Set();
  const dupSource = [];
  const badSource = [];

  sources.forEach((s) => {
    if (sourceIds.has(s.id)) dupSource.push(s.id);
    sourceIds.add(s.id);

    const required = ['id', 'title', 'publisher', 'url', 'tier', 'accessDate'];
    const missing = required.filter((f) => !s[f]);
    if (missing.length > 0) badSource.push(`${s.id} missing ${missing.join(',')}`);

    if (s.url && PLACEHOLDER_PATTERNS.some((p) => p.test(s.url))) {
      badSource.push(`${s.id} placeholder URL: ${s.url}`);
    }

    if (s.tier && !SOURCE_TIER_ENUM.includes(s.tier)) {
      pushWarn(`Source ${s.id} non-standard tier: ${s.tier}`);
    }
  });

  if (dupSource.length > 0) pushFail(`Duplicate source IDs: ${dupSource.join(', ')}`);
  else pushPass(`No duplicate source IDs (${sources.length} sources)`);

  if (badSource.length > 0) {
    pushFail(`Source registry issues: ${badSource.slice(0, 5).join('; ')}${badSource.length > 5 ? ` (+${badSource.length - 5} more)` : ''}`);
  } else {
    pushPass('All sources have required fields + no placeholder URL');
  }

  /* ============================================================
     GATE 3 — CONTENT GATE
     ============================================================ */
  console.log('\n' + '━'.repeat(50));
  console.log('GATE 3: Content quality');
  console.log('━'.repeat(50));

  // Segment definition ≥20 chars
  const shortSeg = (data.segments?.segments || [])
    .filter((s) => !s.definition || s.definition.length < 20)
    .map((s) => s.id);
  if (shortSeg.length > 0) {
    pushFail(`Segment definition <20 chars: ${shortSeg.join(', ')}`);
  } else {
    pushPass('All segment definitions ≥20 chars');
  }

  // Insight mechanism ≥20 chars
  const shortMech = (data.insights?.insights || [])
    .filter((i) => !i.mechanism || i.mechanism.length < 20)
    .map((i) => i.id);
  if (shortMech.length > 0) {
    pushFail(`Insight mechanism <20 chars: ${shortMech.join(', ')}`);
  } else {
    pushPass('All insight mechanisms ≥20 chars');
  }

  // Scenario có trigger + assumptions
  const badScn = (data.scenarios?.scenarios || [])
    .filter((s) => !s.trigger || !s.assumptions || s.assumptions.length === 0)
    .map((s) => s.id);
  if (badScn.length > 0) {
    pushFail(`Scenario missing trigger/assumptions: ${badScn.join(', ')}`);
  } else {
    pushPass('All scenarios have trigger + assumptions');
  }

  /* ============================================================
     GATE 4 — CROSS-REFERENCE GATE
     ============================================================ */
  console.log('\n' + '━'.repeat(50));
  console.log('GATE 4: Cross-reference');
  console.log('━'.repeat(50));

  const segmentIds = new Set((data.segments?.segments || []).map((s) => s.id));
  const founderIds = new Set((data.founders?.founders || []).map((f) => f.id));

  // Tier enum check
  const badTier = (data.segments?.segments || [])
    .filter((s) => s.tier && !TIER_ENUM.includes(s.tier))
    .map((s) => `${s.id}: ${s.tier}`);
  if (badTier.length > 0) {
    pushFail(`Segment tier not in enum: ${badTier.slice(0, 5).join('; ')}${badTier.length > 5 ? ` (+${badTier.length - 5} more)` : ''}`);
  } else {
    pushPass('All segment tiers in enum');
  }

  // Confidence enum check
  const badConf = [];
  const checkConf = (val, ctx) => {
    if (val && !CONFIDENCE_ENUM.includes(val)) badConf.push(`${ctx}: ${val}`);
  };
  companiesAll.forEach((c) => checkConf(c.confidence, `company ${c.id}`));
  (data.founders?.founders || []).forEach((f) => {
    checkConf(f.confidence, `founder ${f.id}`);
    (f.education || []).forEach((e, i) => checkConf(e.confidence, `${f.id}.education[${i}]`));
  });
  (data.insights?.insights || []).forEach((i) => checkConf(i.confidence, `insight ${i.id}`));
  if (badConf.length > 0) {
    pushWarn(`Confidence not in enum: ${badConf.slice(0, 3).join('; ')}${badConf.length > 3 ? ` (+${badConf.length - 3} more)` : ''}`);
  } else {
    pushPass('All confidence values in enum');
  }

  // Company.segments[] tồn tại
  const brokenSeg = [];
  companiesAll.forEach((c) => {
    (c.segments || []).forEach((sid) => {
      if (!segmentIds.has(sid)) brokenSeg.push(`${c.id} → ${sid}`);
    });
  });
  if (brokenSeg.length > 0) {
    pushFail(`Broken segment refs (FAIL): ${brokenSeg.slice(0, 5).join('; ')}${brokenSeg.length > 5 ? ` (+${brokenSeg.length - 5} more)` : ''}`);
  } else {
    pushPass('All company.segments[] refs valid');
  }

  // Company sourceIds tồn tại
  const brokenSource = [];
  const checkSourceIds = (ids, ctx) => {
    (ids || []).forEach((sid) => {
      if (!sourceIds.has(sid)) brokenSource.push(`${ctx} → ${sid}`);
    });
  };
  companiesAll.forEach((c) => checkSourceIds(c.sourceIds, `company ${c.id}`));
  (data.founders?.founders || []).forEach((f) => checkSourceIds(f.sourceIds, `founder ${f.id}`));
  (data.claims?.claims || []).forEach((cl) => checkSourceIds([cl.sourceId], `claim ${cl.id}`));
  if (brokenSource.length > 0) {
    pushFail(`Broken source refs: ${brokenSource.slice(0, 5).join('; ')}${brokenSource.length > 5 ? ` (+${brokenSource.length - 5} more)` : ''}`);
  } else {
    pushPass('All sourceIds refs valid');
  }

  // Founder.companyIds[] tồn tại (WARN — có thể outside scope)
  const danglingFounder = [];
  (data.founders?.founders || []).forEach((f) => {
    (f.companyIds || []).forEach((cid) => {
      if (!companyIds.includes(cid) && cid !== 'placeholder') {
        danglingFounder.push(`${f.id} → ${cid}`);
      }
    });
  });
  // Company → founder
  const danglingCompanyFounder = [];
  companiesAll.forEach((c) => {
    (c.founderIds || []).forEach((fid) => {
      if (!founderIds.has(fid) && fid !== 'placeholder') {
        danglingCompanyFounder.push(`${c.id} → ${fid}`);
      }
    });
  });
  const totalDangling = danglingFounder.length + danglingCompanyFounder.length;
  if (totalDangling > DANGLING_THRESHOLD) {
    pushFail(`Too many dangling refs: ${totalDangling} > ${DANGLING_THRESHOLD} threshold`);
  } else if (totalDangling > 0) {
    pushWarn(`${totalDangling} dangling founder/company refs (acceptable, < threshold)`);
  } else {
    pushPass('No dangling founder/company refs');
  }

  /* ============================================================
     GATE 5 — COVERAGE GATE
     ============================================================ */
  console.log('\n' + '━'.repeat(50));
  console.log('GATE 5: Coverage vs target');
  console.log('━'.repeat(50));

  const counts = {
    segments: (data.segments?.segments || []).length,
    companies: companiesAll.length,
    founders: (data.founders?.founders || []).length,
    sources: sources.length,
  };
  Object.entries(counts).forEach(([k, n]) => {
    const t = COVERAGE_TARGETS[k];
    if (!t) return;
    if (n < t.min) {
      pushFail(`${k}: ${n} < min ${t.min}`);
    } else if (n < t.warn) {
      pushWarn(`${k}: ${n} < recommended ${t.warn}`);
    } else {
      pushPass(`${k}: ${n} ≥ ${t.warn}`);
    }
  });

  /* ============================================================
     REPORT
     ============================================================ */
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATE REPORT');
  console.log('='.repeat(60));

  console.log(`\n✅ PASS (${result.pass.length}):`);
  result.pass.forEach((m) => console.log(`  ${m}`));

  if (result.warn.length > 0) {
    console.log(`\n⚠️  WARN (${result.warn.length}):`);
    result.warn.forEach((m) => console.log(`  ${m}`));
  }
  if (result.fail.length > 0) {
    console.log(`\n❌ FAIL (${result.fail.length}):`);
    result.fail.forEach((m) => console.log(`  ${m}`));
  }

  console.log('\n' + '='.repeat(60));
  let exit;
  if (result.fail.length > 0) {
    console.log(`Result: ❌ FAIL (${result.fail.length} errors)`);
    exit = 2;
  } else if (result.warn.length > 0 && strict) {
    console.log(`Result: ❌ FAIL in strict mode (${result.warn.length} warnings)`);
    exit = 2;
  } else if (result.warn.length > 0) {
    console.log(`Result: ⚠️  WARN (${result.warn.length} warnings)`);
    exit = 1;
  } else {
    console.log('Result: ✅ PASS');
    exit = 0;
  }
  process.exit(exit);
}

function findDup(arr) {
  const seen = {};
  const dups = [];
  arr.forEach((x) => {
    if (seen[x]) dups.push(x);
    seen[x] = true;
  });
  return [...new Set(dups)];
}

main();
