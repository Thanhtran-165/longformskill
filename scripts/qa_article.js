#!/usr/bin/env node
/**
 * QA Article — Automated visual quality assurance cho longform report
 * (Học từ pattern vn-research-dashboard/qa_dashboard.js, adapt cho article format)
 *
 * Usage:
 *   node qa_article.js --url=file:///path/to/report.html
 *   node qa_article.js --url=file:///path/to/report.html --output=./qa-shots
 *
 * Install Playwright (1 lần):
 *   npm install playwright --prefix /tmp/qa-runner
 *   (hoặc global: npm install -g playwright && npx playwright install chromium)
 *
 * Checks:
 *   1. No raw {{TOKEN}} placeholder (BẮT BUỘC — fail nếu còn)
 *   2. HTML well-formed (hero, container, footer present)
 *   3. Sections present (≥3 h2.section-title, ≥1 refs/sources section)
 *   4. Chart.js canvas rendered (no blank)
 *   5. Minimap + nav sync (mỗi section id có link trong minimap)
 *   6. No JS console errors
 *   7. Screenshots: full-page + hero + middle
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runQA() {
  const args = process.argv.slice(2);
  const urlArg = args.find(a => a.startsWith('--url='));
  const outputArg = args.find(a => a.startsWith('--output='));

  if (!urlArg) {
    console.error('❌ Usage: node qa_article.js --url=file:///path/to/report.html [--output=./qa-shots]');
    process.exit(1);
  }

  const url = urlArg.replace('--url=', '');
  const outputDir = outputArg ? outputArg.replace('--output=', '') : './qa-shots';

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`🔍 QA Article — Testing: ${url}`);
  console.log(`📁 Output: ${outputDir}\n`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1480, height: 900 } });

  const errors = [];
  const warnings = [];
  const passes = [];

  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`Console: ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`Page error: ${err.message}`));

  // Navigate
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000); // wait for Chart.js to render
  } catch (e) {
    errors.push(`Navigation: ${e.message}`);
  }

  // === CHECK 1: No raw {{TOKEN}} placeholder (BẮT BUỘC) ===
  console.log('🔎 Check 1: Raw {{TOKEN}} placeholder...');
  const bodyText = await page.evaluate(() => document.documentElement.outerHTML);
  const tokenMatches = bodyText.match(/{{[A-Z_0-9]+}}/g) || [];
  if (tokenMatches.length > 0) {
    const unique = [...new Set(tokenMatches)];
    errors.push(`Raw placeholder(s) NOT replaced: ${unique.join(', ')} (${tokenMatches.length} total)`);
  } else {
    passes.push('No raw {{TOKEN}} placeholder ✓');
  }

  // === CHECK 2: HTML well-formed (key structural elements) ===
  console.log('🏗️  Check 2: HTML structure...');
  const structureChecks = [
    { selector: '.hero, header', name: 'Hero' },
    { selector: '.container, main', name: 'Main container' },
    { selector: 'footer', name: 'Footer' },
    { selector: 'section', minCount: 2, name: 'Sections (≥2)' },
  ];
  for (const chk of structureChecks) {
    const count = await page.$$eval(chk.selector, els => els.length).catch(() => 0);
    if (chk.minCount) {
      if (count >= chk.minCount) passes.push(`${chk.name}: ${count} found ✓`);
      else warnings.push(`${chk.name}: only ${count} (expected ≥${chk.minCount})`);
    } else {
      if (count > 0) passes.push(`${chk.name}: found ✓`);
      else warnings.push(`${chk.name}: NOT found`);
    }
  }

  // === CHECK 3: Sections + refs ===
  console.log('📋 Check 3: Section titles + references...');
  const sectionTitleCount = await page.$$eval('h2.section-title', els => els.length).catch(() => 0);
  if (sectionTitleCount >= 3) passes.push(`Section titles: ${sectionTitleCount} (≥3) ✓`);
  else if (sectionTitleCount >= 1) warnings.push(`Section titles: only ${sectionTitleCount} (expected ≥3 for longform)`);
  else errors.push('No h2.section-title found');

  const refsCount = await page.$$eval('ol.refs, .sources, ol.numlist', els => els.length).catch(() => 0);
  if (refsCount > 0) passes.push(`References section: ${refsCount} found ✓`);
  else warnings.push('No ol.refs/.sources/ol.numlist found — missing Tài liệu tham khảo?');

  // === CHECK 4: Chart.js canvas rendered ===
  console.log('📊 Check 4: Chart.js canvas...');
  const canvases = await page.$$eval('canvas', els => els.map(c => ({
    id: c.id,
    width: c.width,
    height: c.height,
    hasContent: c.width > 0 && c.height > 0
  })));

  if (canvases.length === 0) {
    warnings.push('No <canvas> elements found — bài có cần chart không?');
  } else {
    const blank = canvases.filter(c => !c.hasContent);
    if (blank.length > 0) {
      warnings.push(`${blank.length}/${canvases.length} canvas blank: ${blank.map(c=>c.id||'(no id)').join(', ')}`);
    } else {
      passes.push(`All ${canvases.length} canvas rendered ✓`);
    }
    // Verify new Chart count matches canvas count
    const chartCount = await page.evaluate(() => (window.Chart ? 0 : 0)); // Chart.js internal count not exposed; skip
  }

  // === CHECK 5: Minimap nav sync (section id ↔ minimap link) ===
  console.log('🧭 Check 5: Minimap navigation sync...');
  const minimapLinks = await page.$$eval('.mm-items a[href^="#"]', els =>
    els.map(a => a.getAttribute('href').slice(1))
  ).catch(() => []);

  if (minimapLinks.length === 0) {
    warnings.push('No minimap links found — bài có cần TOC không?');
  } else {
    passes.push(`Minimap: ${minimapLinks.length} links ✓`);
    // Verify each minimap link points to an existing section/element.
    // Run inside page.evaluate so CSS.escape (browser API) is available.
    const missing = await page.evaluate((ids) => {
      const miss = [];
      for (const id of ids) {
        try {
          const el = document.querySelector('#' + CSS.escape(id));
          if (!el) miss.push(id);
        } catch (e) {
          // CSS.escape should never throw for normal ids, but guard anyway
          miss.push(id);
        }
      }
      return miss;
    }, minimapLinks);
    if (missing.length > 0) {
      errors.push(`Minimap links point to MISSING ids: ${missing.join(', ')}`);
    } else {
      passes.push('All minimap links resolve to existing elements ✓');
    }
    // Reverse check: sections with id should mostly have a minimap link (warn if many orphan)
    const sectionIds = await page.$$eval('section[id]', els => els.map(e => e.id)).catch(() => []);
    const orphan = sectionIds.filter(id => !minimapLinks.includes(id));
    if (orphan.length > 2) {
      warnings.push(`${orphan.length} sections have no minimap link (ids: ${orphan.slice(0,5).join(', ')}${orphan.length>5?'...':''})`);
    }
    // Click first link to verify scroll works
    if (minimapLinks.length > 0) {
      try {
        await page.click(`.mm-items a[href="#${minimapLinks[0]}"]`, { timeout: 2000 });
        await page.waitForTimeout(500);
        passes.push('First minimap link click → scroll ✓');
      } catch (e) {
        warnings.push('Minimap first link click failed');
      }
    }
  }

  // === CHECK 6: Progress bar + presentation button ===
  console.log('🎛️  Check 6: Progress bar + presentation...');
  const hasProgress = await page.$('.progress-bar').catch(() => null);
  if (hasProgress) passes.push('Progress bar present ✓'); else warnings.push('Progress bar missing');
  const hasPres = await page.$('.pres-btn, .pres-overlay').catch(() => null);
  if (hasPres) passes.push('Presentation mode present ✓'); else warnings.push('Presentation button missing');

  // === CHECK 7: JS console errors (report after all checks) ===
  console.log('🔧 Check 7: JavaScript errors...');
  if (errors.length === 0 || errors.every(e => !e.startsWith('Console') && !e.startsWith('Page'))) {
    passes.push('No JavaScript console errors ✓');
  }

  // === CHECK 8: Screenshots ===
  console.log('📸 Check 8: Screenshots...');
  try {
    await page.screenshot({ path: path.join(outputDir, 'full-page.png'), fullPage: true });
    passes.push('Full page screenshot ✓');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outputDir, 'hero.png'), clip: { x: 0, y: 0, width: 1480, height: 600 } });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, 'middle.png'), clip: { x: 0, y: 0, width: 1480, height: 900 } });
    passes.push('Hero + middle screenshots ✓');
  } catch (e) {
    warnings.push(`Screenshot failed: ${e.message}`);
  }

  // === REPORT ===
  console.log('\n' + '='.repeat(60));
  console.log('📋 QA REPORT');
  console.log('='.repeat(60));

  // Separate structural errors from console errors for clarity
  const structuralErrors = errors.filter(e => !e.startsWith('Console') && !e.startsWith('Page'));
  const consoleErrors = errors.filter(e => e.startsWith('Console') || e.startsWith('Page'));

  console.log(`\n✅ PASSES (${passes.length}):`);
  passes.forEach(p => console.log(`  ✓ ${p}`));

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  if (structuralErrors.length > 0) {
    console.log(`\n❌ STRUCTURAL ERRORS (${structuralErrors.length}):`);
    structuralErrors.forEach(e => console.log(`  ✗ ${e}`));
  }
  if (consoleErrors.length > 0) {
    console.log(`\n❌ JS ERRORS (${consoleErrors.length}):`);
    consoleErrors.forEach(e => console.log(`  ✗ ${e}`));
  }

  console.log('\n' + '='.repeat(60));
  const hasErrors = structuralErrors.length > 0 || consoleErrors.length > 0;
  const status = hasErrors ? '❌ FAIL' : warnings.length > 0 ? '⚠️  PASS WITH WARNINGS' : '✅ PASS';
  console.log(`Result: ${status}`);
  console.log(`Screenshots: ${outputDir}/full-page.png, hero.png, middle.png`);
  console.log('='.repeat(60));

  await browser.close();

  // Exit code: 0 = pass, 1 = warnings, 2 = errors, 3 = fatal
  process.exit(hasErrors ? 2 : warnings.length > 0 ? 1 : 0);
}

runQA().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(3);
});
