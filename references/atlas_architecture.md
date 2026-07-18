# Atlas Architecture — Pattern SPA + Router + State

Pattern architecture cho **mode atlas** (skill `longform`). Rút từ 2 sản phẩm thực tế:
- **China AI Industrial Atlas** — `/Users/bobo/ZCodeProject/china-ai-industrial-atlas/`
- **Global AI Industry Atlas** — `/Users/bobo/ZCodeProject/global-ai-industry-atlas/`

> ⚠️ File này là reference cho Workflow Atlas Bước A2 (copy template) + A4 (viết views). Đọc trước khi mở rộng template `assets/atlas_template/`.

## Mục lục

- [§1 SPA shell anatomy](#1-spa-shell-anatomy)
- [§2 Router pattern — hash router (shareable URL)](#2-router-pattern--hash-router-shareable-url)
- [§3 State management — 1 object tập trung](#3-state-management--1-object-tập-trung)
- [§4 `el()` DOM hyperscript builder](#4-el-dom-hyperscript-builder)
- [§5 Disposal pattern — cleanup trước khi render view mới](#5-disposal-pattern--cleanup-trước-khi-render-view-mới)
- [§6 Async data load — Promise.all (KHÔNG sequential)](#6-async-data-load--promiseall-không-sequential)
- [§7 Dark/light parity qua `[data-theme]`](#7-darklight-parity-qua-data-theme)
- [§8 Anti-patterns — tránh lặp lỗi 2 sản phẩm](#8-anti-patterns--tránh-lặp-lỗi-2-sản-phẩm)

---

## §1 SPA shell anatomy

Template `assets/atlas_template/index.html` có **3 vùng CSS Grid** + footer:

```
┌─────────────┬───────────────────────────────────┐
│             │  TOPNAV (breadcrumb + search)     │  56px
│             ├───────────────────────────────────┤
│   RAIL      │                                   │
│   (TOC)     │   MAIN (render target)            │  flex
│             │                                   │
│             ├───────────────────────────────────┤
│             │  FOOTER (KPI count + meta)        │  40px
└─────────────┴───────────────────────────────────┘
   260px                    1fr
```

CSS (`styles.css` `.app`):
```css
.app {
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: 56px 1fr 40px;
  grid-template-areas:
    "rail topnav"
    "rail main"
    "rail footer";
  min-height: 100vh;
}
```

**Vì sao tách 3 vùng?**
- **Rail** (TOC bên trái): cố định, sticky. User luôn thấy danh sách view để chuyển nhanh.
- **Topnav**: breadcrumb (user biết đang ở view nào) + search toàn cục.
- **Main**: render target — `innerHTML` bị clear + ghi lại mỗi lần đổi view.

### Mẫu thực tế tham chiếu
- **China Atlas** `index.html:76-117` — cùng pattern 3 vùng, glassmorphism backdrop-blur.
- **Global Atlas** `index.html:108-110` — 3 thẻ `<script src>` rời, build sẽ inline.

### Mobile (< 768px)
Rail collapse thành drawer off-screen (`.rail.open { left: 0 }`). Xem `styles.css` media query.

---

## §2 Router pattern — hash router (shareable URL)

**Chọn hash router** (`#/route/param` + `hashchange` listener) — Pitfall 12.

### Code pattern (`app.js`):
```js
const ROUTES = {
  home:      { title: 'Trang chính',   render: renderHome },
  explorer:  { title: 'Khám phá',      render: renderExplorer },
  company:   { title: 'Hồ sơ công ty', render: renderCompanyProfile },
  // thêm route tại đây...
};

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [route, param] = h.split('/');
  return { route: route || 'home', param: param || null };
}

function navigate(route, param) {
  const hash = `#/${route}${param ? '/' + param : ''}`;
  if (location.hash === hash) renderRoute();
  else location.hash = hash; // trigger hashchange → renderRoute
}

window.addEventListener('hashchange', renderRoute);
```

### Lợi ích hash router
| Tính năng | Hash router ✅ | State-only ❌ (Global Atlas) |
|---|---|---|
| Refresh giữ page | ✅ | ❌ mất |
| Back/forward button | ✅ | ❌ không hoạt động |
| Shareable URL (`?id=...#company/DEEPSEEK`) | ✅ | ❌ |
| Bookmark trang cụ thể | ✅ | ❌ |

### Mẫu thực tế tham chiếu
- **China Atlas** `app.js:202-269` — `parseHash + navigate + renderRoute` chuẩn, dùng `location.hash`.
- **Global Atlas** `atlas.js:2100-2125` — **chỉ** `state.currentPage + switch` không hashchange → refresh mất page. **Đây là Pitfall 12 — không bắt chước.**

### Click delegation — `data-nav` attribute

**Tất cả link nội bộ** gắn `data-nav="routeName"`:
```html
<a href="#/companies" data-nav="companies">Danh sách công ty</a>
```

1 event listener duy nhất ở `body`:
```js
document.body.addEventListener('click', (e) => {
  const t = e.target.closest('[data-nav]');
  if (!t) return;
  e.preventDefault();
  navigate(t.dataset.nav);
});
```

**Vì sao?** Pitfall 14 anti-pattern: nếu inline `onclick` rải rác + `data-nav` → 2 pattern trộn lẫn, khó maintain. ✅ Dùng 1 pattern duy nhất (`data-nav` delegation).

---

## §3 State management — 1 object tập trung

**Không dùng framework state (Redux/MobX)**. 1 object duy nhất trong IIFE closure:

```js
const state = {
  data: {},            // data loaded từ data/*.json
  currentPage: 'home', // route hiện tại
  activeCharts: [],    // ECharts instances — dispose khi đổi view
  _cyInstances: [],    // Cytoscape instances — destroy khi đổi view
};
```

### Nguyên tắc
- **Không global leak**: mọi state/function trong IIFE. Chỉ `window.__nav` (debug hook, localhost-only).
- **Array track instance**: `activeCharts` + `_cyInstances` để cleanup khi đổi view (xem §5).
- **State.data load 1 lần ở boot**: không reload khi đổi view (lazy render = mỗi view tự lấy data từ `state.data`).

### Mẫu thực tế tham chiếu
- **China Atlas** `app.js:11-21` — `state` object có `data, filters, activeCharts, _cyInstances`.
- **Global Atlas** `atlas.js:15` — `state.currentPage` + `state.data` (load ở `init()` `atlas.js:2525`).

---

## §4 `el()` DOM hyperscript builder

23 dòng thay thế `React.createElement` — không cần framework. Rút từ **China Atlas** `app.js:137-159`.

```js
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
```

### Usage
```js
el('div', { class: 'card', onclick: handler }, [
  el('h3', { text: 'Tiêu đề' }),
  el('p',  { html: '<em>nội dung</em> được chèn raw' }),
  null,           // null bị bỏ qua — tiện conditional
  hasExtra && el('span', { text: 'extra' }),
  'text node cũng OK',
])
```

### Ưu điểm
- **Type-safe**: không cần JSX, không cần build step.
- **Conditional dễ**: truyền `null`/`false` cho nhánh không render.
- **Event ngắn**: `onclick`, `onmouseenter` tự động bind.
- **Style object**: `style: { color: 'red' }` an toàn hơn string.

### Helper layout
```js
section(id, title, num, children)        // <section><h2.section-title>...
subsection(title, children)               // <div.subsection><h3>...
emptyState(message)                       // placeholder khi không data
chartContainer(id, title, takeaway, src, conf)  // ECharts wrapper
chartWrapper(title, takeaway, svgHtml, src, conf) // SVG wrapper (string)
```

### Mẫu thực tế tham chiếu
- **China Atlas** `app.js:137-159` — `el()` 23 dòng (chuẩn reference).
- **China Atlas** `app.js:2793-2824` — `section/subsection/profileSection/chartContainer` helpers.

---

## §5 Disposal pattern — cleanup trước khi render view mới

**Bắt buộc** nếu dùng third-party viz lib (ECharts, Cytoscape, D3...). Nếu không dispose → memory leak sau 5-10 lần đổi view.

### Pattern — dispose-first ở đầu `renderRoute()`
```js
async function renderRoute() {
  // ✅ DISPOSE TRƯỚC — cleanup instances của view cũ
  state.activeCharts.forEach((c) => { try { c.dispose(); } catch (e) {} });
  state._cyInstances.forEach((c) => { try { c.destroy(); } catch (e) {} });
  state.activeCharts = [];
  state._cyInstances = [];

  // ... sau đó mới render view mới
  const { route, param } = parseHash();
  await ROUTES[route].render(main, param);
}
```

### Khi init chart — push vào tracking array
```js
function initSampleChart() {
  const node = document.getElementById('chart-sample');
  if (!node) return;
  const chart = echarts.init(node);
  state.activeCharts.push(chart);   // ← push để dispose sau
  chart.setOption({ /* ... */ });
}
```

### Tương tự cho Cytoscape
```js
function makeCytoscape(containerId, elements) {
  const cy = cytoscape({ container: document.getElementById(containerId), elements, /* style, layout */ });
  state._cyInstances.push(cy);      // ← push để destroy sau
  return cy;
}
```

### Mẫu thực tế tham chiếu
- **China Atlas** `app.js:237-269` — `renderRoute()` dispose-first, chuẩn reference.
- **China Atlas** `app.js:1524-1584` — `makeCytoscape()` wrapper + `_cyInstances` tracking.

### Pitfall 14 — dead code sau refactor
Khi thay function cũ (vd `renderCytoscape`) bằng wrapper mới (`makeCytoscape`), **grep tên cũ trước khi commit**:
```bash
grep -rn "oldFunctionName" .
```
China Atlas có 73 dòng `renderCytoscape` mồ côi (`app.js:1717`) vì agent quên xóa sau refactor.

---

## §6 Async data load — Promise.all (KHÔNG sequential)

### ❌ Pitfall 14 — sequential fetch
```js
// SAI — 9 file load nối đuôi, chậm 3-5x
for (const f of files) {
  const res = await fetch(`data/${f}.json`);
  state.data[f] = await res.json();
}
```

### ✅ Promise.all — song song
```js
async function loadData() {
  const entries = await Promise.all(
    DATA_FILES.map(async (key) => {
      try {
        const res = await fetch(`data/${key}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return [key, await res.json()];
      } catch (err) {
        console.warn(`[atlas] load fail data/${key}.json:`, err.message);
        return [key, { meta: { error: err.message }, [key]: [] }]; // fail mềm
      }
    })
  );
  state.data = Object.fromEntries(entries);
}
```

### Đặc điểm quan trọng
- **Fail mềm**: 1 file fail không crash cả app → render empty-state cho view đó.
- **Try/catch per file**: log warning nhưng tiếp tục load file khác.
- **Load 1 lần ở boot**: không reload khi đổi view (state.data giữ trong memory).

### Mẫu thực tế tham chiếu
- **China Atlas** `app.js:98-124` — sequential (`for...of await`) — **đây là Pitfall 14, không bắt chước**.
- **Global Atlas** `atlas.js:52-81` — `Promise.all` đúng pattern.

---

## §7 Dark/light parity qua `[data-theme]`

### Pattern — CSS variable + attribute selector
```css
:root {
  --bg-paper: #f5f1e6;     /* light default */
  --ink-primary: #1a1814;
  --accent-oxblood: #7a1f2b;
}

[data-theme="dark"] {
  --bg-paper: #0d0b08;     /* chỉ override biến màu */
  --ink-primary: #e8e2d2;
  --accent-oxblood: #c9495a;
}
```

**Toàn bộ CSS rule dùng `var(--*)`** → tự động follow theme. **Không viết lại rule** trong dark selector.

### Toggle logic
```js
function initTheme() {
  const saved = localStorage.getItem('atlas-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('atlas-theme', next);

  // ✅ Re-render view để chart follow theme mới — Pitfall 13
  state.activeCharts.forEach((c) => { try { c.dispose(); } catch (e) {} });
  state.activeCharts = [];
  renderRoute();
}
```

### Pitfall 13 — chart library hex cứng
Chart library (`charts.js`) **phải đọc CSS variable runtime**, KHÔNG hex cứng:
```js
// ✅ ĐÚNG — đọc runtime
const cs = getComputedStyle(document.documentElement);
const accent = cs.getPropertyValue('--accent-oxblood').trim();

// ❌ SAI — hex cứng, không follow theme
const ACCENT = '#7a1f2b';
```

**Global Atlas** `charts.js:10` dùng hex cứng → dark/light parity vỡ trong chart. Đây là Pitfall 13 — phải sửa khi port.

### Mẫu thực tế tham chiếu
- **Global Atlas** `styles.css:10-93` — `:root` light tokens đầy đủ.
- **Global Atlas** `styles.css:96-127` — `[data-theme="dark"]` chỉ override biến.
- **Global Atlas** `atlas.js:2411-2422` — `initTheme/toggleTheme` với localStorage persist.

---

## §8 Anti-patterns — tránh lặp lỗi 2 sản phẩm

| Anti-pattern | Sản phẩm mắc | Fix |
|---|---|---|
| Router state-only (không sync URL) | Global Atlas `atlas.js:2100` | Hash router + `hashchange` (§2) |
| Inline `onclick` trộn `data-nav` | China Atlas `app.js:2144` | Chỉ `data-nav` delegation (§2) |
| Sequential fetch thay `Promise.all` | China Atlas `app.js:101` | `Promise.all` song song (§6) |
| Chart library hex cứng | Global Atlas `charts.js:10` | Đọc CSS variable runtime (§7) |
| Dead code mồ côi sau refactor | China Atlas `app.js:1717` (73 dòng) | `grep` tên cũ trước commit |
| Inline styles rải rác trong JS | China Atlas `app.js:1480-1487` | CSS class thay string style |
| Hardcoded SVG positions không scale | China Atlas `app.js:2027-2039` | Data array + forEach (xem `atlas_charts.md`) |
| Magic numbers không constants | China Atlas `app.js:1727` | `NODE_LIMIT_PER_TYPE` table tập trung |
| Bug `i*0` legend (logic sai) | Global Atlas `charts.js:545` | Review legend code sau khi viết |
| Dangling refs chỉ WARN không FAIL | Global Atlas (107 refs) | `validate_atlas_data.js` FAIL nếu > ngưỡng |

---

## Phối hợp các reference khác

| Topic | File |
|---|---|
| Chart recipe (ECharts/Cytoscape/SVG builders) | `references/atlas_charts.md` |
| Data schema (13 file + tier + confidence) | `references/atlas_data_schema.md` |
| Build pipeline (self-contained + validate) | `references/atlas_build_pipeline.md` |
| QA atlas (JS syntax + router + dangling) | `scripts/qa_atlas.js` |
| Validate data (5 gate) | `scripts/validate_atlas_data.js` |
