#!/usr/bin/env node
/**
 * QA Atlas — Automated QA cho longform mode "atlas" (SPA + router + multi-chart)
 *
 * Mở rộng từ qa_article.js cho atlas-specific checks:
 *   1. JS syntax check ALL files (app.js + mọi file assets/js/*.js)
 *      — Pitfall 11: bắt SyntaxError trước runtime (không tin session note)
 *   2. No raw {{TOKEN}} placeholder (BẮT BUỘC)
 *   3. SPA structure (rail + topnav + main + footer, hash router)
 *   4. Router works — click 3 route qua data-nav, verify state.currentPage đổi
 *   5. Chart init không empty — mỗi .chart__body có content sau render
 *   6. Dangling ref check — gọi validate_atlas_data.js tích hợp
 *   7. Dark/light toggle — click nút theme, verify [data-theme] đổi + chart follow
 *   8. No JS console errors
 *   9. Screenshots — home + 1 view detail, dark + light
 *
 * Usage:
 *   node qa_atlas.js --url=file:///path/to/atlas/index.html
 *   node qa_atlas.js --url=http://localhost:8080/ --output=./qa-shots
 *   node qa_atlas.js --url=file:///path/ --skip-validate  // bỏ qua check-links
 *
 * Install Playwright (1 lần):
 *   npm install playwright --prefix /tmp/qa-runner
 *   npx playwright install chromium
 *
 * Exit code: 0 = pass, 1 = warning, 2 = error.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function runQA() {
  const args = process.argv.slice(2);
  const urlArg = args.find((a) => a.startsWith('--url='));
  const outputArg = args.find((a) => a.startsWith('--output='));
  const skipValidate = args.includes('--skip-validate');

  if (!urlArg) {
    console.error('❌ Usage: node qa_atlas.js --url=file:///path/to/atlas/index.html [--output=./qa-shots] [--skip-validate]');
    process.exit(1);
  }

  const url = urlArg.replace('--url=', '');
  const outputDir = outputArg ? outputArg.replace('--output=', '') : './qa-shots';

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Resolve project dir từ URL (file://.../atlas/index.html)
  const projectDir = url.startsWith('file://')
    ? path.dirname(url.replace('file://', ''))
    : null;

  console.log(`🔍 QA Atlas — Testing: ${url}`);
  console.log(`📁 Output: ${outputDir}\n`);

  const errors = [];
  const warnings = [];
  const passes = [];

  /* ============================================================
     CHECK 1: JS syntax check ALL files (Pitfall 11)
     ============================================================ */
  console.log('🔎 Check 1: JS syntax check all files...');
  if (projectDir && fs.existsSync(projectDir)) {
    const jsFiles = [];
    // app.js ở root
    const rootJs = path.join(projectDir, 'app.js');
    if (fs.existsSync(rootJs)) jsFiles.push(rootJs);
    // assets/js/*.js
    const jsDir = path.join(projectDir, 'assets/js');
    if (fs.existsSync(jsDir)) {
      fs.readdirSync(jsDir)
        .filter((f) => f.endsWith('.js'))
        .forEach((f) => jsFiles.push(path.join(jsDir, f)));
    }

    let syntaxOk = 0;
    let syntaxFail = 0;
    for (const f of jsFiles) {
      try {
        execSync(`node --check "${f}"`, { stdio: 'pipe' });
        syntaxOk++;
      } catch (e) {
        syntaxFail++;
        errors.push(`JS syntax FAIL: ${path.relative(projectDir, f)}\n  ${e.stderr?.toString() || e.message}`);
      }
    }
    if (syntaxFail === 0) {
      passes.push(`All ${jsFiles.length} JS files syntax OK ✓`);
    } else {
      errors.push(`${syntaxFail}/${jsFiles.length} JS files have syntax errors`);
    }
  } else {
    warnings.push('Cannot check JS syntax (URL is remote or project dir not accessible)');
  }

  /* ============================================================
     LAUNCH BROWSER
     ============================================================ */
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1480, height: 900 } });

  // Collect console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`Page error: ${err.message}`));

  // Navigate
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000); // wait for data load + chart init
  } catch (e) {
    errors.push(`Navigation: ${e.message}`);
  }

  /* ============================================================
     CHECK 2: No raw {{TOKEN}} placeholder
     ============================================================ */
  console.log('🔎 Check 2: Raw {{TOKEN}} placeholder...');
  const bodyText = await page.evaluate(() => document.documentElement.outerHTML);
  const tokenMatches = bodyText.match(/{{[A-Z_0-9]+}}/g) || [];
  if (tokenMatches.length > 0) {
    const unique = [...new Set(tokenMatches)];
    errors.push(`Raw placeholder(s) NOT replaced: ${unique.join(', ')} (${tokenMatches.length} total)`);
  } else {
    passes.push('No raw {{TOKEN}} placeholder ✓');
  }

  /* ============================================================
     CHECK 3: SPA structure (rail + topnav + main + footer)
     ============================================================ */
  console.log('🏗️  Check 3: SPA structure...');
  const structure = await page.evaluate(() => {
    const has = (sel) => !!document.querySelector(sel);
    return {
      rail: has('.rail') || has('aside'),
      topnav: has('.topnav') || has('header'),
      main: has('#main') || has('main'),
      footer: has('.footer') || has('footer'),
      themeAttr: document.documentElement.getAttribute('data-theme'),
    };
  });
  const missing = Object.entries(structure)
    .filter(([k, v]) => k !== 'themeAttr' && !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    errors.push(`Missing SPA structure: ${missing.join(', ')}`);
  } else {
    passes.push(`SPA structure OK (rail + topnav + main + footer, theme=${structure.themeAttr}) ✓`);
  }

  /* ============================================================
     CHECK 4: Router works — click rail links, verify state
     ============================================================ */
  console.log('🔗 Check 4: Router works...');
  const routerTest = await page.evaluate(async () => {
    const railLinks = Array.from(document.querySelectorAll('[data-nav]'));
    if (railLinks.length === 0) return { tested: 0, ok: 0, fail: 'no rail links found' };

    const results = [];
    // Test 3 route đầu
    for (const link of railLinks.slice(0, 3)) {
      const route = link.dataset.nav;
      const beforeHash = location.hash;
      link.click();
      // Đợi hashchange + render
      await new Promise((r) => setTimeout(r, 800));
      const afterHash = location.hash;
      const bcText = document.querySelector('#bcCurrent, .bc-current')?.textContent || '';
      const hasContent = (document.querySelector('#main, main')?.children.length || 0) > 0;
      const ok = afterHash.includes(route) && hasContent;
      results.push({ route, beforeHash, afterHash, bcText, hasContent, ok });
    }
    return { tested: results.length, ok: results.filter((r) => r.ok).length, results };
  });

  if (routerTest.fail) {
    warnings.push(`Router test: ${routerTest.fail}`);
  } else if (routerTest.tested === 0) {
    warnings.push('Router test: no rail links found to test');
  } else if (routerTest.ok === routerTest.tested) {
    passes.push(`Router works (${routerTest.ok}/${routerTest.tested} routes) ✓`);
  } else {
    const failed = routerTest.results.filter((r) => !r.ok);
    errors.push(`Router FAIL: ${failed.length}/${routerTest.tested} routes broken: ${JSON.stringify(failed)}`);
  }

  /* ============================================================
     CHECK 5: Chart init không empty
     ============================================================ */
  console.log('📊 Check 5: Chart rendered...');
  const chartCheck = await page.evaluate(() => {
    const charts = Array.from(document.querySelectorAll('.chart__body'));
    if (charts.length === 0) return { total: 0, empty: 0, msg: 'no chart containers' };
    const empty = charts.filter((c) => {
      // Chart empty nếu: không có child, hoặc chỉ có text "Loading..."
      const html = c.innerHTML.trim();
      return html === '' || /loading|đang tải/i.test(html) || c.children.length === 0;
    });
    return { total: charts.length, empty: empty.length, charts };
  });
  if (chartCheck.total === 0) {
    warnings.push('No chart containers found (acceptable if view has no chart)');
  } else if (chartCheck.empty === 0) {
    passes.push(`All ${chartCheck.total} charts rendered ✓`);
  } else {
    errors.push(`${chartCheck.empty}/${chartCheck.total} chart containers empty`);
  }

  /* ============================================================
     CHECK 6: Dangling ref check (optional, chạy validate_atlas_data.js)
     ============================================================ */
  if (!skipValidate && projectDir) {
    console.log('🔗 Check 6: Dangling ref check (validate_atlas_data.js)...');
    const dataDir = path.join(projectDir, 'data');
    const validateScript = path.join(__dirname, 'validate_atlas_data.js');
    if (fs.existsSync(dataDir) && fs.existsSync(validateScript)) {
      try {
        execSync(`node "${validateScript}" "${dataDir}"`, { stdio: 'pipe' });
        passes.push('Dangling ref check PASS (0 fail) ✓');
      } catch (e) {
        const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
        if (e.status === 1) {
          warnings.push(`Dangling ref WARN:\n${out.split('\n').slice(0, 10).join('\n')}`);
        } else {
          errors.push(`Dangling ref FAIL:\n${out.split('\n').slice(0, 15).join('\n')}`);
        }
      }
    } else {
      warnings.push('Skip dangling ref check (no data/ dir or validate script missing)');
    }
  }

  /* ============================================================
     CHECK 7: Dark/light toggle
     ============================================================ */
  console.log('🌓 Check 7: Dark/light toggle...');
  const themeToggleTest = await page.evaluate(async () => {
    const btn = document.querySelector('#themeToggle, .theme-toggle');
    if (!btn) return { ok: false, msg: 'no theme toggle button' };
    const before = document.documentElement.getAttribute('data-theme');
    btn.click();
    await new Promise((r) => setTimeout(r, 500));
    const after = document.documentElement.getAttribute('data-theme');
    return { ok: before !== after, before, after };
  });
  if (themeToggleTest.ok) {
    passes.push(`Theme toggle works (${themeToggleTest.before} → ${themeToggleTest.after}) ✓`);
  } else if (themeToggleTest.msg) {
    warnings.push(`Theme toggle: ${themeToggleTest.msg}`);
  } else {
    errors.push('Theme toggle FAIL: data-theme did not change');
  }

  /* ============================================================
     CHECK 8: No JS console errors (đã collect ở on('console'))
     ============================================================ */
  console.log('🚨 Check 8: JS console errors...');
  // errors[] đã có console errors — chỉ phân loại
  const consoleErrors = errors.filter((e) => e.startsWith('Console:') || e.startsWith('Page error'));
  if (consoleErrors.length === 0) {
    passes.push('No JS console errors ✓');
  } else {
    errors.push(`${consoleErrors.length} JS console errors (xem danh sách trên)`);
  }

  /* ============================================================
     CHECK 9: Screenshots — home + 1 detail, dark + light
     ============================================================ */
  console.log('📸 Check 9: Screenshots...');
  try {
    // Về home + chụp dark
    await page.evaluate(() => { location.hash = '#/home'; });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, '01-home-dark.png'), fullPage: false });

    // Toggle sang light + chụp
    await page.evaluate(() => document.querySelector('#themeToggle, .theme-toggle')?.click());
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, '02-home-light.png'), fullPage: false });

    // Vào explorer + chụp light
    await page.evaluate(() => { location.hash = '#/explorer'; });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, '03-explorer-light.png'), fullPage: false });

    passes.push('Screenshots saved ✓');
  } catch (e) {
    warnings.push(`Screenshot fail: ${e.message}`);
  }

  await browser.close();

  /* ============================================================
     REPORT
     ============================================================ */
  console.log('\n' + '='.repeat(60));
  console.log('📊 QA ATLAS REPORT');
  console.log('='.repeat(60));
  console.log(`\n✅ PASS (${passes.length}):`);
  passes.forEach((p) => console.log(`  ${p}`));
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARN (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ${w}`));
  }
  if (errors.length > 0) {
    console.log(`\n❌ FAIL (${errors.length}):`);
    errors.forEach((e) => console.log(`  ${e}`));
  }

  console.log('\n' + '='.repeat(60));
  let result, exitCode;
  if (errors.length > 0) {
    result = `❌ FAIL (${errors.length} errors)`;
    exitCode = 2;
  } else if (warnings.length > 0) {
    result = `⚠️  PASS WITH WARNINGS (${warnings.length} warnings)`;
    exitCode = 1;
  } else {
    result = '✅ PASS';
    exitCode = 0;
  }
  console.log(`Result: ${result}`);
  process.exit(exitCode);
}

runQA().catch((e) => {
  console.error('Fatal:', e);
  process.exit(2);
});
