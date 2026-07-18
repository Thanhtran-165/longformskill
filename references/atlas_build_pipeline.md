# Atlas Build Pipeline — Self-contained Build + Validate + Check-links

Pipeline build cho **mode atlas** (skill `longform`). 3 script Node.js không phụ thuộc npm package ngoài (chỉ `fs`, `path`). Rút từ **Global AI Industry Atlas**.

> ⚠️ Đọc trước khi chạy Bước A3 (validate data) + A5 (build self-contained).

## Mục lục

- [§1 `build_atlas.js` — build self-contained](#1-build_atlasjs--build-self-contained)
- [§2 JSON inline pattern](#2-json-inline-pattern)
- [§3 `validate_atlas_data.js` — 5 gate](#3-validate_atlas_datajs--5-gate)
- [§4 `check-links.js` — dangling reference check](#4-check-linkjs--dangling-reference-check)
- [§5 Pitfalls build (regex loadData mỏng, double-replace)](#5-pitfalls-build-regex-loaddata-mỏng-double-replace)

---

## §1 `build_atlas.js` — build self-contained

**Mục đích**: gom `index.html` + `styles.css` + `app.js` + `data/*.json` thành 1 file `dist/index.html` duy nhất, chạy được bằng `file://` (không cần http-server).

### Pipeline (rút từ Global Atlas `build.js:1-118`)
1. Đọc `assets/css/styles.css`.
2. Concat JS: `app.js` (và `charts.js`, `motion.js` nếu có, ngăn bằng `;\n`).
3. Đọc + parse 13 JSON, gom vào `dataBlobs` object.
4. String-replace function `loadData()` trong JS bằng phiên bản đọc từ `window.__ATLAS_EMBEDDED_DATA__`.
5. Inline JSON: gắn như JS literal `window.__ATLAS_EMBEDDED_DATA__ = {...}`.
6. Replace `<link rel="stylesheet">` → `<style>...</style>`.
7. Replace `<script src>` → 1 thẻ `<script>${embeddedDataScript}\n${js}</script>`.
8. Sửa title (+ ` (Self-contained Build)`), ghi `dist/index.html`, log size.

### Pseudocode
```js
const fs = require('fs');
const path = require('path');

function build(projectDir) {
  const css = fs.readFileSync(path.join(projectDir, 'assets/css/styles.css'), 'utf8');
  const jsFiles = ['charts.js', 'motion.js', 'app.js'];  // thứ tự quan trọng
  const js = jsFiles
    .filter((f) => fs.existsSync(path.join(projectDir, 'assets/js', f)))
    .map((f) => fs.readFileSync(path.join(projectDir, 'assets/js', f), 'utf8'))
    .join('\n;\n');

  // Load 13 JSON
  const dataFiles = ['segments', 'companies', 'companies-tier-b', 'companies-tier-c',
                     'founders', 'sources', 'concepts', 'insights', 'scenarios',
                     'countries', 'relationships', 'claims', '_summary'];
  const dataBlobs = {};
  for (const f of dataFiles) {
    const p = path.join(projectDir, `data/${f}.json`);
    if (!fs.existsSync(p)) continue;
    dataBlobs[f.split('-').join('_')] = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  // Merge companies từ 3 tier → companies_all
  dataBlobs.companies_all = [
    ...(dataBlobs.companies?.companies || []),
    ...(dataBlobs.companies_tier_b?.companies || []),
    ...(dataBlobs.companies_tier_c?.companies || []),
  ];

  // Replace loadData() trong JS bằng phiên bản embedded
  const embeddedDataScript = `window.__ATLAS_EMBEDDED_DATA__ = ${JSON.stringify(dataBlobs)};`;
  const newLoadData = `async function loadData() {
    state.data = window.__ATLAS_EMBEDDED_DATA__ || {};
  }`;
  const jsPatched = js.replace(
    /async function loadData\(\) \{[\s\S]*?return[\s\S]*?\}/,
    newLoadData
  );

  // Đọc index.html template
  let html = fs.readFileSync(path.join(projectDir, 'index.html'), 'utf8');

  // Inline CSS
  html = html.replace(/<link rel="stylesheet" href="[^"]*styles\.css">/,
    `<style>\n${css}\n</style>`);

  // Inline JS — replace 3 thẻ <script src> thành 1 thẻ <script>
  html = html.replace(/<script src="[^"]*\/(charts|motion|app)\.js"><\/script>/g, '');
  html = html.replace(/<script src="app\.js"><\/script>/,
    `<script>\n${embeddedDataScript}\n${jsPatched}\n</script>`);

  // Sửa title
  html = html.replace(/<title>(.*?)<\/title>/, `<title>$1 (Self-contained Build)</title>`);

  // Ghi dist
  const distDir = path.join(projectDir, 'dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'index.html'), html);

  console.log(`✓ Built dist/index.html (${(html.length / 1024).toFixed(0)} KB)`);
}

build(process.argv[2] || '.');
```

### Mẫu thực tế tham chiếu
- **Global Atlas** `scripts/build.js:1-118` — full pipeline (~115 dòng).
- **Global Atlas** `scripts/build.js:54-80` — regex replace loadData.

---

## §2 JSON inline pattern

**2 cách inline JSON vào HTML**:

### ✅ JS literal (Global Atlas dùng)
```js
window.__ATLAS_EMBEDDED_DATA__ = ${JSON.stringify(dataBlobs)};
```
- **Ưu**: không cần parse lại, JS đọc object ngay.
- **Nhược**: lớn hơn 1 chút (JSON.stringify thêm dấu `"`).

### ⚠️ `<script type="application/json">`
```html
<script type="application/json" id="atlas-data">
  ${JSON.stringify(dataBlobs)}
</script>
```
```js
const data = JSON.parse(document.getElementById('atlas-data').textContent);
```
- **Ưu**: rõ ràng hơn về semantic, không biến JS scope.
- **Nhược**: cần `JSON.parse` runtime (chậm hơn 1 chút).

→ Skill dùng JS literal pattern (Global Atlas) cho đơn giản.

### Key mapping
JSON key có gạch (`companies-tier-b`) → JS key underscore (`companies_tier_b`):
```js
dataBlobs[f.split('-').join('_')] = JSON.parse(...);
```

→ Tránh syntax error khi dùng `state.data.companies-tier-b` (JS không cho phép `-` trong identifier).

---

## §3 `validate_atlas_data.js` — 5 gate

Schema-enforce mức trung bình (imperative check, không phải JSON Schema chính thức). Chia 5 nhóm:

### Gate 1 — Data Gate
Check **integrity nội bộ**:
- No duplicate company IDs (`COMP_NVDA` chỉ xuất hiện 1 lần).
- No duplicate founder IDs.
- Every company has ≥1 segment trong `segments[]`.
- Every revenue có `year + unit + sourceIds` — **source bắt buộc cho mọi số**.
- Every founder education có `source`.
- No valuation-as-revenue (phân biệt `marketCapUSD` vs `revenueUSD`).

### Gate 2 — Source Gate
Check `sources.json` registry:
- No placeholder URL (`example.com`, `placeholder`, `TODO`).
- Required fields `[id, title, publisher, url, tier, accessDate]`.
- Mỗi source ID duy nhất.

### Gate 3 — Content Gate
Check chất lượng nội dung (chống rỗng/lorem):
- Segment `definition` ≥20 chars.
- Insight `mechanism` ≥20 chars.
- Concept `simpleDefinition` ≥20 chars.
- Scenario có `trigger + assumptions[]`.

### Gate 4 — Cross-reference Gate
Check referential integrity:
- Company `segments[]` → tồn tại trong `segments.json`.
- Claim `sourceId` → tồn tại trong `sources.json`.
- Founder `companyIds[]` → tồn tại trong `companies*.json`.
- Relationship `fromCompanyId/toCompanyId` → tồn tại.

### Gate 5 — Coverage Gate
Check số lượng entity vs target spec:
- `segments >= 22` (config được)
- `companies >= 160`
- `founders >= 100`
- `sources >= 300`
- ... config theo scope project.

### Triple state
```js
const result = { pass: [], warn: [], fail: [] };
// ...
if (result.fail.length > 0) {
  console.error('❌ FAIL:', result.fail);
  process.exit(2);  // FAIL
} else if (result.warn.length > 0) {
  console.warn('⚠️ WARN:', result.warn);
  process.exit(1);  // warning
} else {
  console.log('✓ PASS all gates');
  process.exit(0);  // pass
}
```

### Mẫu thực tế tham chiếu
- **Global Atlas** `scripts/validate-data.js:1-240` — 5 gate hoàn chỉnh.
- **Global Atlas** `scripts/validate-data.js:79-99` — revenue source required check.
- **Global Atlas** `scripts/validate-data.js:127-150` — source placeholder URL check.

### Đánh giá schema-enforce
**Mạnh**:
- Source bắt buộc cho mọi con số → evidence-first.
- Referential integrity → bắt dangling ref.
- Content quality gate → chống rỗng.

**Yếu** (chấp nhận cho 1-shot report):
- Không check type (chỉ `if (!s[f])`).
- Không check enum (tier/confidence free-form — Pitfall từ §6 schema doc).
- Không check date format.

→ Đủ tốt cho atlas規模 vừa (<300 entities). Nếu cần strict hơn → nâng lên **JSON Schema正式 (ajv)**.

---

## §4 `check-links.js` — dangling reference check

Bidirectional dangling ref check (khác Gate 4 ở chỗ check **cả 2 chiều** và cho phép threshold).

### Build index sets
```js
const companyIds = new Set(state.data.companies_all.map((c) => c.id).filter((id) => id !== 'placeholder'));
const segmentIds = new Set(state.data.segments.map((s) => s.id));
const founderIds = new Set(state.data.founders.map((f) => f.id));
```

### 5 chiều check
1. **Company → segment** (FAIL): `company.segments[]` tồn tại trong `segmentIds`.
2. **Company → founder** (WARN): `company.founderIds[]` tồn tại.
3. **Founder → company** (WARN): `founder.companyIds[]` tồn tại.
4. **Insight → company** (WARN): `insight.companyIds[]` tồn tại.
5. **Relationship.from/to → company** (WARN): `relationship.fromCompanyId/toCompanyId` tồn tại.
6. **Segment.companyIds → company** (WARN): `segment.companyIds[]` tồn tại.

### Threshold-based FAIL
```js
const DANGLING_THRESHOLD = 20;  // > 20 dangling → FAIL
if (totalDangling > DANGLING_THRESHOLD) {
  result.fail.push(`Too many dangling refs: ${totalDangling} > ${DANGLING_THRESHOLD}`);
} else if (totalDangling > 0) {
  result.warn.push(`${totalDangling} dangling refs (acceptable)`);
}
```

### Pitfall 15 — chỉ WARN không FAIL
**Global Atlas** có 107 dangling refs, vì `check-links.js` exit 0 (chỉ WARN) → agent bỏ qua, deploy với link chết. **Fix**: đổi threshold → FAIL nếu > ngưỡng.

### Mẫu thực tế tham chiếu
- **Global Atlas** `scripts/check-links.js:1-96` — bidirectional check.
- **Global Atlas** `data/QA-REPORT.md:100-104` — giải thích 4 nhóm dangling (founder → outside scope, acquired/merged companies, AI Mafia chưa thêm, forward references).

---

## §5 Pitfalls build (regex loadData mỏng, double-replace)

### Pitfall A — regex replace `loadData()` mỏng
```js
// ❌ Regex dễ vỡ nếu sửa function signature
js.replace(/async function loadData\(\) \{[\s\S]*?return[\s\S]*?\}/, newLoadData);
```

Nếu agent đổi `loadData()` thành `async function loadDataAsync()` hoặc thêm param → regex không match → build output vẫn gọi `fetch('data/...')` (vỡ khi mở bằng `file://`).

**Fix**:
1. Comment rõ trong `app.js`: `// ⚠️ Build script dựa vào signature này — KHÔNG đổi tên function`.
2. Test sau build: mở `dist/index.html` bằng `file://` → verify data loaded (`window.__state.data`).
3. Hoặc dùng AST parser (esprima/acorn) thay regex — chính xác hơn nhưng phức tạp.

### Pitfall B — double-replace title (Global Atlas `build.js:99-108`)
```js
// ❌ Replace title 2 lần — dòng 99-102 vô dụng
html = html.replace(/<title>(.*?)<\/title>/, '<title>$1 v1</title>');
html = html.replace(/<title>(.*?)<\/title>/, '<title>$1 v2</title>');  // ghi đè dòng trên
```

**Fix**: chỉ replace 1 lần, comment rõ ý định:
```js
// ✅ Replace 1 lần
html = html.replace(/<title>(.*?)<\/title>/, '<title>$1 (Self-contained Build)</title>');
```

### Pitfall C — script tag không match nếu thêm module
```js
// ❌ Chỉ match app.js, bỏ sót nếu thêm charts.js
html.replace(/<script src="app\.js"><\/script>/, ...);
```

**Fix**: quét toàn bộ `<script src="assets/js/*.js">`:
```js
// ✅ Match mọi script src trong assets/js/
html = html.replace(/<script src="(?:\.\/)?assets\/js\/[\w-]+\.js"><\/script>/g, '');
// Sau đó thêm 1 thẻ <script> tổng
html = html.replace('</body>', `<script>${embeddedDataScript}\n${jsPatched}</script>\n</body>`);
```

### Pitfall D — dist size phình
Self-contained build có thể phình tới 700KB-1MB. **Ngưỡng cảnh báo**:
- <500KB: tốt.
- 500KB-1MB: chấp nhận cho atlas lớn.
- >1MB: cân nhắc lazy load data hoặc tách dist thành nhiều file.

Log size sau build để theo dõi:
```js
console.log(`✓ Built dist/index.html (${(html.length / 1024).toFixed(0)} KB)`);
```

---

## Checklist trước khi build

- [ ] `node "$SKILL_DIR/scripts/validate_atlas_data.js" data/` → PASS 5 gate.
- [ ] `node "$SKILL_DIR/scripts/check-links.js"` → 0 FAIL (WARN < 20 acceptable).
- [ ] `node --check app.js` (và mọi file trong `assets/js/`) → syntax OK.
- [ ] `index.html` không còn `{{TOKEN}}` placeholder.
- [ ] `data/*.json` đều parse được (`JSON.parse` không lỗi).
- [ ] Build: `node "$SKILL_DIR/scripts/build_atlas.js" .` → `dist/index.html` sinh ra.
- [ ] Mở `dist/index.html` bằng `file://` → data loaded, charts render, router hoạt động.
- [ ] `du -h dist/index.html` → log size.

→ Nếu mọi check pass → deploy lên Vercel/Netlify/Cloudflare.
