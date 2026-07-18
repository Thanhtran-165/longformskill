/* ============================================================================
   LONGFORM ATLAS — App Core (router + state + el() + render samples)
   ============================================================================
   Wrapped trong IIFE duy nhất — không global leak (chỉ window.__nav debug hook).
   Source pattern:
   - Hash router + dispose-first (china-ai-industrial-atlas/app.js:202-269)
   - el() DOM hyperscript (china-ai-industrial-atlas/app.js:137-159)
   - makeCytoscape wrapper pattern (china-ai-industrial-atlas/app.js:1524-1584)
   - Promise.all data load (KHÔNG sequential fetch — Pitfall 14)
   - chartWrapper editorial (global-ai-industry-atlas/assets/js/atlas.js:1466-1475)
   ============================================================================ */
(function () {
  'use strict';

  /* ============================================================
     STATE — 1 object tập trung trong IIFE closure
     ============================================================ */
  const state = {
    data: {},            // data loaded từ data/*.json
    currentPage: 'home', // route hiện tại
    activeCharts: [],    // ECharts instances — dispose khi đổi view
    _cyInstances: [],    // Cytoscape instances — destroy khi đổi view
  };

  /* ============================================================
     DATA LAYER — Promise.all (KHÔNG sequential fetch)
     ============================================================
     Pitfall 14: `for (const f of files) { await fetch(f) }` chậm không cần thiết.
     ✅ Dùng Promise.all để load song song.
     */
  const DATA_FILES = ['segments', 'companies', 'founders', 'sources'];
  // ↑ Sửa danh sách này theo schema project. Xem references/atlas_data_schema.md

  async function loadData() {
    // Promise.all — song song, nhanh hơn 3-5x với 9+ file
    const entries = await Promise.all(
      DATA_FILES.map(async (key) => {
        try {
          const res = await fetch(`data/${key}.json`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          return [key, json];
        } catch (err) {
          console.warn(`[atlas] load fail data/${key}.json:`, err.message);
          // Fail mềm — không crash app, render empty-state
          return [key, { meta: { error: err.message }, [key]: [] }];
        }
      })
    );
    state.data = Object.fromEntries(entries);
  }

  /* ============================================================
     el() — DOM hyperscript builder (23 dòng thay React.createElement)
     ============================================================
     Usage:
       el('div', {class:'card', onclick: handler}, [
         el('h3', {text: 'Tiêu đề'}),
         el('p',  {html: '<em>nội dung</em> được chèn raw'}),
         null,  // null bị bỏ qua — tiện conditional
         'text node cũng OK'
       ])
     */
  function el(tag, attrs, children) {
    attrs = attrs || {};
    const node = document.createElement(tag);
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'dataset') Object.assign(node.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'style' && typeof v === 'object') {
        Object.assign(node.style, v);
      } else node.setAttribute(k, v);
    }
    appendChildren(node, children);
    return node;
  }

  function appendChildren(parent, children) {
    if (children == null) return;
    if (!Array.isArray(children)) children = [children];
    for (const c of children) {
      if (c == null || c === false) continue;
      parent.appendChild(typeof c === 'string' || typeof c === 'number'
        ? document.createTextNode(String(c))
        : c);
    }
  }

  /* ============================================================
     LAYOUT HELPERS — section / subsection / chartContainer / emptyState
     ============================================================ */
  function section(id, title, num, bodyChildren) {
    return el('section', { class: 'section', id },
      el('h2', { class: 'section-title' }, [
        num ? el('span', { class: 'num', text: num }) : null,
        title,
      ]),
      bodyChildren
    );
  }

  function subsection(title, bodyChildren) {
    return el('div', { class: 'subsection' }, [
      el('h3', { class: 'subsection-title', text: title }),
      ...(Array.isArray(bodyChildren) ? bodyChildren : [bodyChildren]),
    ]);
  }

  function emptyState(message) {
    return el('div', { class: 'empty-state' }, [
      el('div', { class: 'icon', text: '📭' }),
      el('p', { text: message || 'Không có dữ liệu.' }),
    ]);
  }

  /* chartContainer — DOM wrapper cho ECharts (chỉ tạo container, KHÔNG init chart)
     Agent phải gọi echarts.init + push vào state.activeCharts trong render<View>. */
  function chartContainer(id, title, takeaway, sourceText, confidence) {
    return el('div', { class: 'chart' }, [
      el('div', { class: 'chart__title', text: title }),
      takeaway ? el('div', { class: 'chart__takeaway', text: takeaway }) : null,
      el('div', { class: 'chart__body', id }),
      el('div', { class: 'chart__footer' }, [
        el('span', { text: sourceText || 'Nguồn: đang cập nhật' }),
        confidence
          ? el('span', { class: `conf-tag conf-${confidence}`, text: confidence })
          : el('span', { text: '' }),
      ]),
    ]);
  }

  /* chartWrapper — HTML string wrapper cho SVG tự viết
     (rút từ global-ai-industry-atlas/assets/js/atlas.js:1466-1475)
     Usage: chartWrapper('Title', 'Takeaway', '<svg>...</svg>', 'S001, S002', 'Verified') */
  function chartWrapper(title, takeaway, svgHtml, sourceText, confidence) {
    const conf = confidence
      ? `<span class="conf-tag conf-${confidence}">${confidence}</span>`
      : '';
    return `
      <div class="chart">
        <div class="chart__title">${title}</div>
        ${takeaway ? `<div class="chart__takeaway">${takeaway}</div>` : ''}
        <div class="chart__body">${svgHtml}</div>
        <div class="chart__footer">
          <span>${sourceText || 'Nguồn: đang cập nhật'}</span>
          ${conf}
        </div>
      </div>`;
  }

  /* ============================================================
     CONFIDENCE + SOURCE HELPERS
     ============================================================ */
  function confidenceTag(level) {
    return el('span', { class: `conf-tag conf-${level || 'Unknown'}`, text: level || 'Unknown' });
  }

  function sourceRefs(sourceIds) {
    if (!sourceIds || !sourceIds.length) return null;
    const wrap = el('span', { class: 'source-refs' });
    sourceIds.forEach((sid) => {
      wrap.appendChild(el('a', {
        class: 'src-ref',
        href: '#/methodology',
        title: `Source ${sid} — xem chi tiết ở mục Phương pháp`,
        'data-nav': 'methodology',
        text: sid,
      }));
    });
    return wrap;
  }

  /* ============================================================
     ROUTER — Hash router (shareable URL, refresh-safe)
     ============================================================
     Pitfall 12: Nếu chỉ `state.currentPage + innerHTML` (Global Atlas pattern) →
     refresh mất page, back button không hoạt động. ✅ Dùng hashchange.
     */
  const ROUTES = {
    home:      { title: 'Trang chính',  render: renderHome },
    explorer:  { title: 'Khám phá',     render: renderExplorer },
    // Thêm route mới tại đây — vd companies, founders, geography, insights...
    // companies: { title: 'Công ty', render: renderCompanies },
    methodology: { title: 'Phương pháp', render: renderMethodology },
  };

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, ''); // bỏ leading "#/" hoặc "#"
    const [route, param] = h.split('/');
    return { route: route || 'home', param: param || null };
  }

  function navigate(route, param) {
    const hash = `#/${route}${param ? '/' + param : ''}`;
    if (location.hash === hash) {
      renderRoute(); // cùng hash → vẫn re-render (xử lý click cùng route)
    } else {
      location.hash = hash; // → trigger hashchange → renderRoute
    }
  }

  async function renderRoute() {
    // ✅ DISPOSE-FIRST — cleanup chart/cy TRƯỚC khi render view mới
    // (bắt buộc nếu dùng third-party viz lib — tránh memory leak)
    state.activeCharts.forEach((c) => { try { c.dispose(); } catch (e) {} });
    state._cyInstances.forEach((c) => { try { c.destroy(); } catch (e) {} });
    state.activeCharts = [];
    state._cyInstances = [];

    const { route, param } = parseHash();
    const routeDef = ROUTES[route] || ROUTES.home;
    state.currentPage = route;

    // Update breadcrumb + active link
    const bcCurrent = document.getElementById('bcCurrent');
    if (bcCurrent) bcCurrent.textContent = routeDef.title;
    document.querySelectorAll('.rail-link').forEach((a) => {
      a.classList.toggle('active', a.dataset.nav === route);
    });

    // Clear + render
    const main = document.getElementById('main');
    main.innerHTML = '';
    try {
      await routeDef.render(main, param);
    } catch (err) {
      console.error(`[atlas] renderRoute fail (${route}):`, err);
      main.appendChild(emptyState(`Lỗi render view "${route}": ${err.message}`));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ============================================================
     VIEW SAMPLES — 3 view tối thiểu
     ============================================================
     Agent copy pattern này để thêm view mới.
     Mỗi view = 1 async function `render<View>(root, param)`.
     */

  async function renderHome(root) {
    const segs = state.data.segments?.segments || [];
    const companies = state.data.companies?.companies || [];
    const founders = state.data.founders?.founders || [];
    const sources = state.data.sources?.sources || [];

    root.appendChild(el('header', { class: 'view-header' }, [
      el('h1', { class: 'view-title', text: '{{ATLAS_TITLE}}' }),  // ← replace trong app.js nữa (xem comment index.html)
      el('div', { class: 'view-sub', text: `Cập nhật {{ATLAS_DATE}} · ${segs.length} segments · ${companies.length} entities` }),  // ← replace trong app.js
    ]));

    root.appendChild(section('overview', 'Tổng quan', '1', [
      el('div', { class: 'kpi-grid' }, [
        kpi('SEGMENTS', String(segs.length), 'lớp chuỗi giá trị'),
        kpi('ENTITIES', String(companies.length), 'công ty / tổ chức'),
        kpi('FOUNDERS', String(founders.length), 'nhà sáng lập'),
        kpi('SOURCES', String(sources.length), 'nguồn dẫn'),
      ]),
      el('p', {
        html: 'Bản đồ nghiên cứu tương tác — mỗi số liệu kèm <strong>source ID + confidence tier</strong>. '
            + 'Click vào từng mục trong bảng điều hướng bên trái để khám phá.',
      }),
    ]));

    // Chart mẫu dùng chartContainer (ECharts)
    root.appendChild(section('sample-chart', 'Biểu đồ mẫu (ECharts)', '2', [
      p('Pattern chuẩn: tạo <code>chartContainer</code>, init ECharts, push vào <code>state.activeCharts</code>.'),
      chartContainer('chart-sample', 'Phân bố theo segment', 'Takeaway: thay bằng insight thực', 'S001', 'Triangulated'),
      // Chart init chạy sau khi DOM đã render — setTimeout 50ms
      setTimeout(() => initSampleChart(), 50),
    ]));
  }

  function kpi(label, value, sub) {
    return el('div', { class: 'kpi' }, [
      el('div', { class: 'kpi-label', text: label }),
      el('div', { class: 'kpi-value', text: value }),
      el('div', { class: 'kpi-sub', text: sub }),
    ]);
  }

  function p(html) {
    return el('p', { html });
  }

  function initSampleChart() {
    const node = document.getElementById('chart-sample');
    if (!node || typeof echarts === 'undefined') return;
    // ✅ Đọc CSS variable runtime — Pitfall 13: KHÔNG hex cứng
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--accent-oxblood').trim() || '#7a1f2b';
    const ink = cs.getPropertyValue('--ink-secondary').trim() || '#4a463e';
    const line = cs.getPropertyValue('--line').trim() || '#ccc';

    const segs = state.data.segments?.segments || [];
    const chart = echarts.init(node);
    state.activeCharts.push(chart);
    chart.setOption({
      grid: { left: 50, right: 30, top: 30, bottom: 60, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: cs.getPropertyValue('--bg-card').trim(),
        borderColor: line,
        textStyle: { color: ink },
      },
      xAxis: {
        type: 'category',
        data: segs.map((s) => s.id || s.name || '?').slice(0, 10),
        axisLabel: { color: ink, fontSize: 11, rotate: 35 },
        axisLine: { lineStyle: { color: line } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: ink },
        axisLine: { lineStyle: { color: line } },
        splitLine: { lineStyle: { color: line, opacity: 0.5 } },
      },
      series: [{
        type: 'bar',
        data: segs.slice(0, 10).map((s, i) => ({
          value: (s.companyIds?.length || (10 - i)),
          itemStyle: { color: accent },
        })),
      }],
    });
  }

  async function renderExplorer(root) {
    const segs = state.data.segments?.segments || [];
    root.appendChild(el('header', { class: 'view-header' }, [
      el('h1', { class: 'view-title', text: 'Khám phá chuỗi giá trị' }),
      el('div', { class: 'view-sub', text: `${segs.length} segments — click vào segment để xem chi tiết` }),
    ]));

    if (!segs.length) {
      root.appendChild(emptyState('Chưa có data segments. Thêm data/segments.json theo schema.'));
      return;
    }

    // Bảng segments mẫu
    const table = el('table', { class: 'tbl' }, [
      el('thead', {}, el('tr', {}, [
        el('th', { text: 'ID' }),
        el('th', { text: 'Tên' }),
        el('th', { text: 'Tier' }),
        el('th', { text: 'Entities' }),
        el('th', { text: 'Confidence' }),
      ])),
      el('tbody', {}, segs.map((s) => el('tr', {}, [
        el('td', {}, el('code', { text: s.id || '—' })),
        el('td', { text: s.name || s.nameEn || '—' }),
        el('td', {}, tierBadge(s.tier)),
        el('td', { text: String(s.companyIds?.length || 0) }),
        el('td', {}, confidenceTag(s.confidence || 'Unknown')),
      ]))),
    ]);
    root.appendChild(section('segments-table', 'Danh sách segments', null, [table]));
  }

  function tierBadge(tier) {
    const t = (tier || '').toUpperCase().includes('A') ? 'A'
            : (tier || '').toUpperCase().includes('B') ? 'B'
            : (tier || '').toUpperCase().includes('C') ? 'C'
            : null;
    return t
      ? el('span', { class: `tier-badge tier-${t}`, text: t })
      : el('span', { text: tier || '—' });
  }

  async function renderMethodology(root) {
    root.appendChild(el('header', { class: 'view-header' }, [
      el('h1', { class: 'view-title', text: 'Phương pháp nghiên cứu' }),
      el('div', { class: 'view-sub', text: 'Hệ thống confidence tier + nguồn dẫn' }),
    ]));

    root.appendChild(section('confidence', 'Hệ thống độ tin cậy', '1', [
      p('Mọi claim trong atlas đi kèm <strong>confidence tier</strong> 4 mức:'),
      el('ul', { class: 'bul-list' }, [
        confItem('Verified', 'Công bố chính thức — BCTC, văn bản pháp luật, paper peer-reviewed.'),
        confItem('Triangulated', '≥2 nguồn độc lập khớp nhau — vd 2 báo CK + 1 báo chính thống.'),
        confItem('Estimated', '1 nguồn + phương pháp nội suy/ước tính minh bạch.'),
        confItem('Unknown', 'Chưa đủ thông tin verify — dùng tạm, flag để bổ sung.'),
      ]),
    ]));

    root.appendChild(section('sources', 'Nguồn dẫn', '2', [
      p('Mỗi entity có mảng <code>source_ids[]</code> tham chiếu tới <code>data/sources.json</code>. '
       + 'Hover vào S001 → xem tên nguồn. Click → quay về mục này.'),
      p('Số nguồn hiện có: ' + (state.data.sources?.sources?.length || 0)),
    ]));
  }

  function confItem(level, desc) {
    return el('li', {}, [
      confidenceTag(level),
      ' — ',
      desc,
    ]);
  }

  /* ============================================================
     NAV — wire rail links + theme toggle + global search
     ============================================================ */
  function wireNav() {
    // Rail links từ ROUTES — sinh động qua JS (KHÔNG hardcode trong HTML)
    const nav = document.getElementById('railNav');
    if (nav) {
      Object.entries(ROUTES).forEach(([key, def]) => {
        nav.appendChild(el('a', {
          class: 'rail-link',
          href: `#/${key}`,
          'data-nav': key,
          text: def.title,
        }));
      });
    }

    // Click delegation cho data-nav (link nội bộ) — Pitfall 14 anti-pattern:
    // ✅ Dùng delegation 1 chỗ, KHÔNG inline onclick rải rác.
    document.body.addEventListener('click', (e) => {
      const t = e.target.closest('[data-nav]');
      if (!t) return;
      e.preventDefault();
      navigate(t.dataset.nav);
    });

    // Hashchange listener
    window.addEventListener('hashchange', renderRoute);

    // Theme toggle — Pitfall 13: chart phải follow theme
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Global search — shortcut "/"
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('globalSearch')?.focus();
      }
    });
  }

  function initTheme() {
    const saved = localStorage.getItem('atlas-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('atlas-theme', next);

    // ✅ Re-render charts để follow theme mới — Pitfall 13
    state.activeCharts.forEach((c) => {
      try {
        const cs = getComputedStyle(document.documentElement);
        // Cách đơn giản: dispose + re-init bằng cách re-render view
        c.dispose();
      } catch (e) {}
    });
    state.activeCharts = [];
    renderRoute(); // re-render cả view → chart được init lại với CSS var mới
  }

  /* ============================================================
     BOOT
     ============================================================ */
  async function boot() {
    initTheme();
    wireNav();
    await loadData();
    updateFooter();
    await renderRoute();

    // Debug hook (bỏ qua khi production)
    if (window.location.hostname === 'localhost') {
      window.__nav = navigate;
      window.__state = state;
      console.log('[atlas] ready. window.__nav(route, param), window.__state để debug.');
    }
  }

  function updateFooter() {
    const foot = document.getElementById('footKpi');
    if (!foot) return;
    const segs = state.data.segments?.segments?.length || 0;
    const comps = state.data.companies?.companies?.length || 0;
    const sources = state.data.sources?.sources?.length || 0;
    foot.textContent = `${segs} segments · ${comps} entities · ${sources} sources`;
  }

  // Boot khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
