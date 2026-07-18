# Atlas Charts — Recipe ECharts + Cytoscape + Custom SVG

Recipe visualization cho **mode atlas** (skill `longform`). 3 lớp chart library + 4 custom SVG builder pattern. Rút từ 2 sản phẩm thực tế.

> ⚠️ Đọc trước khi thêm chart vào `app.js`. Mọi chart **bắt buộc 4 thành phần editorial**: title + takeaway + source + confidence (xem §4).

## Mục lục

- [§1 ECharts pattern](#1-echarts-pattern)
- [§2 Cytoscape pattern — network graphs](#2-cytoscape-pattern--network-graphs)
- [§3 Custom SVG builder — 4 pattern](#3-custom-svg-builder--4-pattern)
- [§4 `chartWrapper()` — editorial wrapper bắt buộc](#4-chartwrapper--editorial-wrapper-bắt-buộc)
- [§5 Dark mode parity cho chart library](#5-dark-mode-parity-cho-chart-library)
- [§6 Legend + color scale](#6-legend--color-scale)

---

## §1 ECharts pattern

Chart thư viện phổ biến nhất cho atlas — **CDN load** (đổi sang local nếu cần offline, xem Pitfall 2).

### Load
```html
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
```

### Wrapper `chartContainer` — chỉ tạo DOM, KHÔNG init chart
Agent phải gọi `echarts.init()` trong `render<View>` riêng (sau khi DOM đã render):

```js
function chartContainer(id, title, takeaway, sourceText, confidence) {
  return el('div', { class: 'chart' }, [
    el('div', { class: 'chart__title', text: title }),
    takeaway ? el('div', { class: 'chart__takeaway', text: takeaway }) : null,
    el('div', { class: 'chart__body', id }),  // ← container trống, init sau
    el('div', { class: 'chart__footer' }, [
      el('span', { text: sourceText || 'Nguồn: đang cập nhật' }),
      confidence
        ? el('span', { class: `conf-tag conf-${confidence}`, text: confidence })
        : null,
    ]),
  ]);
}
```

### Pattern init chart trong `render<View>`
```js
async function renderCompanies(root) {
  root.appendChild(chartContainer('chart-revenue', 'Doanh thu top 10', 'Takeaway: ...', 'S001', 'Verified'));
  // setTimeout 50ms để DOM render xong trước khi init
  setTimeout(() => initRevenueChart(), 50);
}

function initRevenueChart() {
  const node = document.getElementById('chart-revenue');
  if (!node || typeof echarts === 'undefined') return;  // guard

  // ✅ Đọc CSS variable runtime — Pitfall 13
  const cs = getComputedStyle(document.documentElement);
  const accent = cs.getPropertyValue('--accent-oxblood').trim();
  const ink = cs.getPropertyValue('--ink-secondary').trim();
  const line = cs.getPropertyValue('--line').trim();

  const chart = echarts.init(node);
  state.activeCharts.push(chart);  // ← tracking để dispose

  chart.setOption({
    grid: { left: 50, right: 30, top: 30, bottom: 60, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: cs.getPropertyValue('--bg-card').trim(),
      borderColor: line,
      textStyle: { color: ink },
    },
    xAxis: { /* ... */ },
    yAxis: { /* ... */ },
    series: [{ type: 'bar', data: [...], itemStyle: { color: accent } }],
  });
}
```

### Tooltip style nhất quán
Mọi ECharts trong atlas dùng chung style tooltip (đồng bộ với theme):
```js
tooltip: {
  trigger: 'axis',
  backgroundColor: 'var(--bg-card)',  // hoặc đọc runtime
  borderColor: 'var(--line)',
  textStyle: { color: 'var(--ink-primary)' },
}
```

### Tooltip callback — dùng `function`, KHÔNG arrow
```js
// ✅ ĐÚNG
tooltip: { callback: function(c) { return c.name + ': ' + c.value; } }

// ❌ SAI — arrow mất context `this`
tooltip: { callback: (c) => c.name + ': ' + c.value }
```

### Mẫu thực tế tham chiếu
- **China Atlas** `app.js:2120` — tooltip style nhất quán xuyên suốt.
- **China Atlas** `app.js:2304-2747` — 19 chartContainer + 17 chart functions trong gallery view.

### Chart types phổ biến (setOption recipe)
| Loại | Khi nào dùng | key setOption |
|---|---|---|
| Bar | Phân bố category, top N | `series: [{type:'bar'}]` |
| Line | Time series, trend | `series: [{type:'line'}]` |
| Stacked bar | Cấu trúc thành phần | `series: [{type:'bar', stack:'A'}]` |
| Scatter | 2D correlation | `series: [{type:'scatter'}]` |
| Radar | Multi-axis so sánh | `series: [{type:'radar'}]` |
| Stacked area | Cộng dồn thời gian | `series: [{type:'line', areaStyle:{}}]` |

> ⚠️ **KHÔNG dùng doughnut/pie** trong dark theme — khó đọc (cũng là rule của article mode, xem SKILL.md style guide).

---

## §2 Cytoscape pattern — network graphs

Dùng cho **founder network, supply chain, capital flow, academic lineage** — đồ thị có node + edge.

### Load
```html
<script src="https://cdn.jsdelivr.net/npm/cytoscape@3.28.1/dist/cytoscape.min.js"></script>
```

### `makeCytoscape()` wrapper — recipe đầy đủ

Rút từ **China Atlas** `app.js:1524-1584`. Wrapper nhận elements + style + layout, trả instance + tracking:

```js
function makeCytoscape(containerId, elements, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container || typeof cytoscape === 'undefined') return null;

  const defaultStyle = [
    { selector: 'node', style: {
      'label': 'data(label)', 'text-valign': 'center',
      'width': 'data(size)', 'height': 'data(size)',
      'font-size': 10, 'color': getCssVar('--ink-primary'),
    }},
    { selector: 'node[type="founder"]', style: {
      'shape': 'ellipse', 'background-color': getCssVar('--accent-ink-blue'),
    }},
    { selector: 'node[type="company"]', style: {
      'shape': 'rectangle', 'background-color': getCssVar('--accent-oxblood'),
    }},
    { selector: 'node[type="institution"]', style: {
      'shape': 'diamond', 'background-color': getCssVar('--accent-teal'),
    }},
    { selector: 'node[type="investor"]', style: {
      'shape': 'triangle', 'background-color': getCssVar('--accent-gold'),
    }},
    { selector: 'edge', style: {
      'width': 1.5, 'line-color': getCssVar('--line-strong'),
      'target-arrow-shape': 'triangle', 'arrow-scale': 0.8,
    }},
    { selector: 'edge[type="invested_in"]', style: { 'line-color': getCssVar('--accent-gold') }},
    { selector: 'edge[type="worked_at"]',    style: { 'line-color': getCssVar(--accent-ink-blue') }},
    { selector: 'edge[type="studied_at"]',   style: { 'line-color': getCssVar('--accent-teal') }},
    { selector: 'edge[type="supplied_to"]',  style: { 'line-color': getCssVar('--accent-oxblood') }},
  ];

  const cy = cytoscape({
    container,
    elements,
    style: [...defaultStyle, ...(opts.style || [])],
    layout: { name: opts.layout || 'cose', animate: true, animationDuration: 500,
              nodeRepulsion: 6000, idealEdgeLength: 80, ...(opts.layoutOpts || {}) },
  });

  state._cyInstances.push(cy);  // ← tracking để destroy

  // Tap delegation — click node → navigate tới profile
  cy.on('tap', 'node', (evt) => {
    const data = evt.target.data();
    if (data.type === 'founder') navigate('founder', data.id);
    else if (data.type === 'company') navigate('company', data.id);
  });

  return cy;
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
```

### Elements schema
```js
const elements = [
  // nodes
  { data: { id: 'FOUNDER_001', label: 'Liang Wenfeng', type: 'founder', size: 40 } },
  { data: { id: 'COMP_DEEPSEEK', label: 'DeepSeek', type: 'company', size: 50 } },
  { data: { id: 'UNIV_TSINGHUA', label: 'Tsinghua', type: 'institution', size: 30 } },
  // edges
  { data: { id: 'e1', source: 'FOUNDER_001', target: 'COMP_DEEPSEEK', type: 'founded' } },
  { data: { id: 'e2', source: 'FOUNDER_001', target: 'UNIV_TSINGHUA', type: 'studied_at' } },
];
```

### Layout thường dùng
- `cose` (force-directed, default) — graph tự do, network tổng quan.
- `breadthfirst` — hierarchy (org chart, family tree).
- `circle` — cluster nhỏ.
- `grid` — matrix view.

### 5 graph types từ China Atlas
1. **Founder↔University** — `renderFounderUnivGraph()` (China `app.js:1586`)
2. **Founder factory** (Big Tech alumni) — `renderBigTechAlumniGraph()` (China `app.js:1607`)
3. **Capital flow** (investor → company) — `renderCapitalFlowGraph()` (China `app.js:1637`)
4. **Supplier chain** (semiconductor chain) — `renderSupplierChainGraph()` (China `app.js:1661`)
5. **Customer network** (B2B) — `renderCustomerNetGraph()` (China `app.js:1681`)

### Pitfall 14 — dead code sau refactor
China Atlas có `renderCytoscape()` mồ côi 73 dòng (`app.js:1717`) — agent đã thay bằng `makeCytoscape` wrapper nhưng quên xóa function cũ. **Sau refactor → `grep` tên cũ**.

---

## §3 Custom SVG builder — 4 pattern

**SVG = string builder, không cần library**. Tích hợp qua `el('div', { html: svgString })` hoặc `chartWrapper(title, takeaway, svgString, source, confidence)`.

Pattern chung:
```js
function someSVG(data) {
  const W = 800, H = 300;  // viewBox
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs>${defsBlock()}</defs>`;
  svg += `<rect width="${W}" height="${H}" fill="var(--bg-card)"/>`;
  // forEach data → sinh elements
  data.forEach((d, i) => { svg += elementFor(d, i); });
  svg += `</svg>`;
  return svg;
}
```

### (a) Map silhouette — bản đồ nước/vùng

Rút từ **China Atlas** `chinaMapSVG()` `app.js:2024-2108`. Hardcoded path (đơn giản hóa, không phải GeoJSON thật) + city pins mảng data.

```js
function mapSVG(cities) {
  const W = 700, H = 580;
  // Path silhouette — đơn giản hóa cho 1-shot report. Nếu cần chính xác → dùng GeoJSON.
  const countryPath = "M100,200 Q200,150 300,180 L400,200 ...";  // chuỗi path dài
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs>
    <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--line)" stroke-width="0.5"/>
    </pattern>
    <filter id="pinGlow"><feGaussianBlur stdDeviation="3"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#mapGrid)"/>`;
  svg += `<path d="${countryPath}" fill="var(--bg-card)" stroke="var(--accent-oxblood)"
           stroke-width="1.5" stroke-dasharray="4,2" opacity="0.6"/>`;
  // Pins từ data array
  cities.forEach((c) => {
    svg += `<g transform="translate(${c.x},${c.y})">
      <circle r="14" fill="var(--accent-oxblood)" opacity="0.18" filter="url(#pinGlow)"/>
      <circle r="6" fill="var(--accent-oxblood)"/>
      <circle r="2" fill="var(--bg-card)"/>
      <text x="0" y="-20" text-anchor="middle" fill="var(--ink-primary)"
            font-family="var(--font-sans)" font-size="12" font-weight="600">${c.name}</text>
      ${c.nameLocal ? `<text x="0" y="-34" text-anchor="middle" fill="var(--ink-muted)"
        font-family="var(--font-mono)" font-size="10">${c.nameLocal}</text>` : ''}
    </g>`;
  });
  svg += `</svg>`;
  return svg;
}
```

**Data array**:
```js
const cities = [
  { x: 280, y: 180, name: 'Beijing', nameLocal: '北京' },
  { x: 460, y: 280, name: 'Shanghai', nameLocal: '上海' },
  // ...
];
```

### (b) Hero industrial stack — chuỗi giá trị

Rút từ **China Atlas** `heroVisualSVG()` `app.js:1929`. Stack các thanh ngang theo layer (L0-L15), độ dài tỷ lệ strategic weight, có value flow arrow + chokepoint callouts.

```js
function heroStackSVG(layers) {
  const W = 1200, H = 320;
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  // Background grid
  svg += `<defs><linearGradient id="stackBg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--bg-paper-deep)"/>
    <stop offset="100%" stop-color="var(--bg-paper)"/>
  </linearGradient></defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#stackBg)"/>`;
  // Title strip
  svg += `<text x="20" y="30" fill="var(--ink-muted)" font-family="var(--font-mono)"
           font-size="11" letter-spacing="2" text-transform="uppercase">INDUSTRIAL VALUE STACK</text>`;
  // Value flow arrow (vertical, left side)
  svg += `<line x1="30" y1="60" x2="30" y2="${H-30}" stroke="var(--accent-oxblood)" stroke-width="2"/>`;
  svg += `<polygon points="25,${H-25} 30,${H-15} 35,${H-25}" fill="var(--accent-oxblood)"/>`;
  svg += `<text x="15" y="${H/2}" fill="var(--accent-oxblood)" font-family="var(--font-mono)"
           font-size="10" transform="rotate(-90 15 ${H/2})">VALUE FLOW</text>`;
  // Bars từ data
  layers.forEach((layer, i) => {
    const y = 60 + i * 14;
    const w = layer.weight * 10;
    svg += `<rect x="60" y="${y}" width="${w}" height="10" fill="${layer.color}" opacity="0.8"/>`;
    svg += `<text x="${60 + w + 10}" y="${y+8}" fill="var(--ink-secondary)"
             font-family="var(--font-mono)" font-size="9">${layer.code} · ${layer.name}</text>`;
  });
  svg += `</svg>`;
  return svg;
}
```

**Data**:
```js
const layers = [
  { code: 'L0', name: 'Minerals', weight: 8, color: 'var(--tier-C)' },
  { code: 'L8', name: 'AI Chips', weight: 50, color: 'var(--accent-oxblood)' },
  // ...
];
```

### (c) Academic lineage timeline

Rút từ **China Atlas** `academicLineageSVG()` `app.js:1878-1926`. **Pattern clean nhất, đáng làm template default cho "founder timeline" component**.

5 stages: BACHELOR → MASTER → PHD → INDUSTRY → FOUNDED. Conditional render nếu thiếu data.

```js
function lineageSVG(founder) {
  const W = 800, H = 200;
  const stages = [
    { x: 80,  label: 'BACHELOR', value: founder.bachelor },
    { x: 240, label: 'MASTER',   value: founder.master },
    { x: 400, label: 'PHD',      value: founder.phd },
    { x: 560, label: 'INDUSTRY', value: founder.previousEmployers?.[0]?.company },
    { x: 720, label: 'FOUNDED',  value: founder.companyIds?.[0] },
  ];
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  // Connector line
  svg += `<line x1="${stages[0].x}" y1="100" x2="${stages[stages.length-1].x}" y2="100"
            stroke="var(--line-strong)" stroke-width="2" stroke-dasharray="4,3"/>`;
  stages.forEach((s) => {
    // Conditional: nếu không có value → vẽ node mờ
    const has = s.value && !/^(not|dropout|không|—|-)/.test(String(s.value));
    const r = has ? 12 : 8;
    const opacity = has ? 1 : 0.3;
    svg += `<circle cx="${s.x}" cy="100" r="${r}" fill="var(--accent-oxblood)" opacity="${opacity}"/>`;
    svg += `<text x="${s.x}" y="60" text-anchor="middle" fill="var(--ink-muted)"
             font-family="var(--font-mono)" font-size="10" letter-spacing="1">${s.label}</text>`;
    if (has) {
      svg += `<text x="${s.x}" y="135" text-anchor="middle" fill="var(--ink-primary)"
               font-family="var(--font-sans)" font-size="11">${escapeXml(s.value)}</text>`;
    }
  });
  svg += `</svg>`;
  return svg;
}

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
}
```

### (d) Mechanism diagram — cycle/flow

Rút từ **China Atlas** `mechanismDiagramSVG()` `app.js:1833-1875`. Cycle có arrow (ví dụ: DeepSeek capital cycle).

```js
function mechanismCycleSVG(nodes, arrows) {
  const W = 800, H = 240;
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  // Arrow marker
  svg += `<defs><marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-oxblood)"/>
  </marker></defs>`;
  // Arrows (Q-curve paths)
  arrows.forEach((a) => {
    svg += `<path d="M ${a.x1} ${a.y1} Q ${a.cx} ${a.cy} ${a.x2} ${a.y2}"
             fill="none" stroke="var(--accent-oxblood)" stroke-width="2"
             marker-end="url(#arrowhead)"/>`;
  });
  // Nodes
  nodes.forEach((n) => {
    svg += `<rect x="${n.x-60}" y="${n.y-20}" width="120" height="40" rx="6"
             fill="var(--bg-card)" stroke="var(--accent-oxblood)" stroke-width="1.5"/>`;
    svg += `<text x="${n.x}" y="${n.y+5}" text-anchor="middle" fill="var(--ink-primary)"
             font-family="var(--font-sans)" font-size="12" font-weight="600">${n.label}</text>`;
  });
  svg += `</svg>`;
  return svg;
}
```

**Data cycle DeepSeek**:
```js
const cycle = {
  nodes: [
    { x: 120, y: 120, label: 'High-Flyer\n(GPU hedge fund)' },
    { x: 400, y: 60,  label: 'GPU profit' },
    { x: 680, y: 120, label: 'DeepSeek\n(open-weight)' },
    { x: 400, y: 180, label: 'Subsidize R&D' },
  ],
  arrows: [
    { x1: 180, y1: 110, cx: 260, cy: 80,  x2: 340, y2: 65 },
    { x1: 460, y1: 65,  cx: 540, cy: 80,  x2: 620, y2: 110 },
    // ...
  ],
};
```

### Mẫu thực tế tham chiếu (4 builder)
- **China Atlas** `chinaMapSVG()` `app.js:2024-2108` — map.
- **China Atlas** `heroVisualSVG()` `app.js:1929-2023` — hero industrial stack.
- **China Atlas** `academicLineageSVG()` `app.js:1878-1926` — lineage timeline (clean nhất).
- **China Atlas** `mechanismDiagramSVG()` `app.js:1833-1875` — cycle diagram.

---

## §4 `chartWrapper()` — editorial wrapper bắt buộc

Mọi visualization **phải có 4 thành phần**:
1. **Title** — tên biểu đồ (ngắn, cụ thể).
2. **Takeaway** — 1 câu insight chính (bạn rút ra cái gì từ biểu đồ?).
3. **Source** — source IDs (`S001, S012`) hoặc mô tả ngắn.
4. **Confidence** — tier 1 trong 4 mức (Verified/Triangulated/Estimated/Unknown).

### HTML string version (cho SVG)
```js
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
```

### DOM version (cho ECharts/Cytoscape)
Dùng `chartContainer()` trong `app.js` template.

### Mẫu thực tế tham chiếu
- **Global Atlas** `atlas.js:1466-1475` — `chartWrapper(title, takeaway, svgHtml, sourceText, confidence)` gốc.

### ❌ Thiếu 1 trong 4 thành phần
- Thiếu takeaway → chart vô hồn, user không biết đọc cái gì.
- Thiếu source → mất uy tín (atlas = research product, không phải infographic).
- Thiếu confidence → user không biết độ tin cậy.

---

## §5 Dark mode parity cho chart library

**Pitfall 13** — chart library hex cứng không follow theme. Fix: đọc CSS variable runtime.

### ❌ Sai (Global Atlas `charts.js:10`)
```js
const ACCENT = '#7a1f2b';  // hex cứng
// → dark mode toggle: chart vẫn giữ màu light → vỡ parity
```

### ✅ Đúng
```js
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
const accent = getCssVar('--accent-oxblood');  // đọc runtime
```

### Khi toggle theme — re-render chart
Chart ECharts cần `dispose + init lại` để đọc CSS variable mới:
```js
function toggleTheme() {
  // ... flip [data-theme] ...
  state.activeCharts.forEach((c) => { try { c.dispose(); } catch (e) {} });
  state.activeCharts = [];
  renderRoute();  // re-render cả view → chart init lại với CSS var mới
}
```

### Mẫu thực tế tham chiếu
- **Global Atlas** `charts.js:10` — hex cứng (Pitfall 13, **phải fix khi port**).
- **China Atlas** `app.js:2120` — tooltip style nhất quán, nhưng có chỗ hex cứng (`backgroundColor: '#161a23'`) → fix tương tự.

---

## §6 Legend + color scale

### Categorical — PALETTE 10 màu
```js
const PALETTE = [
  '#7a1f2b', '#2a4858', '#2c5f5d', '#b8860b', '#5a3a6c',
  '#8c5e2a', '#3a5a3a', '#5a1f3a', '#1f4a5a', '#6c5a3a',
];
// Index theo i % PALETTE.length
```

### Sequential — cream → oxblood interpolate
```js
function sequentialColor(t) {  // t ∈ [0, 1]
  const start = [245, 241, 230];   // cream
  const end = [122, 31, 43];       // oxblood
  const r = Math.round(start[0] + (end[0] - start[0]) * t);
  const g = Math.round(start[1] + (end[1] - start[1]) * t);
  const b = Math.round(start[2] + (end[2] - start[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
```

### Legend vẽ thủ công
```js
function legendSVG(items) {
  // items = [{label, color}, ...]
  let svg = `<svg viewBox="0 0 200 ${items.length * 18}" xmlns="http://www.w3.org/2000/svg">`;
  items.forEach((item, i) => {
    const y = i * 18 + 9;
    svg += `<rect x="0" y="${y-6}" width="12" height="12" fill="${item.color}"/>`;
    svg += `<text x="18" y="${y}" fill="var(--ink-secondary)"
             font-family="var(--font-sans)" font-size="11">${item.label}</text>`;
  });
  svg += `</svg>`;
  return svg;
}
```

### Pitfall — bug `i*0` legend radar
**Global Atlas** `charts.js:543-549` có bug `y = H - 20 + i * 0` — `i*0` luôn 0, toàn bộ legend chồng nhau. **Review legend code sau khi viết**.

---

## Tóm tắt — khi nào dùng gì

| Cần biểu diễn | Dùng |
|---|---|
| Top N, phân bố category | ECharts bar |
| Time series, trend | ECharts line |
| 2D correlation (scatter quadrant) | ECharts scatter |
| Multi-axis so sánh | ECharts radar |
| Founder network, supply chain | Cytoscape |
| Bản đồ nước/vùng | Custom SVG map |
| Stack value chain | Custom SVG hero stack |
| Founder education timeline | Custom SVG lineage |
| Cycle / mechanism flow | Custom SVG mechanism |

→ Bất kể dùng gì — **bắt buộc 4 thành phần editorial** (§4).
