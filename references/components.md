# Components — Catalog HTML cho longform report

Danh sách đầy đủ component CORE (có sẵn trong `assets/article_template.html`) + component NÂNG CAO (paste vào `<style>` khi cần). Mỗi component có: mục đích, code snippet, ❌ sai / ✅ đúng.

## Mục lục

- [Placeholder tokens (BẮT BUỘC đọc trước)](#placeholder-tokens)
- [CORE components](#core-components)
  - [Hero + meta](#hero--meta)
  - [section-title + num badge](#section-title--num-badge)
  - [Typography: p / strong / em / bul / numlist](#typography)
  - [KPI grid](#kpi-grid)
  - [Compare (before/after)](#compare-beforeafter)
  - [Table](#table)
  - [Callout](#callout)
  - [Chart box](#chart-box)
  - [Timeline](#timeline)
  - [Two-col](#two-col)
- [Component NÂNG CAO (paste CSS khi cần)](#component-nâng-cao)
  - [Flow diagram `.fd`](#flow-diagram-fd)
  - [Obligation grid](#obligation-grid)
  - [Risk list `.rl`](#risk-list-rl)
  - [Policy timeline `.ptl`](#policy-timeline-ptl)
  - [Collapsible sources `.sources`](#collapsible-sources-sources)
  - [Glossary panel](#glossary-panel)
- [Checklist trước khi Done](#checklist-trước-khi-done)

---

## Placeholder tokens

Template dùng `{{TOKEN}}` (UPPER_SNAKE). Khi fill, **replace string đơn giản** (không f-string). Danh sách token trong template:

| Token | Ví dụ | Ghi chú |
|---|---|---|
| `{{HERO_TITLE}}` | `"Bất động sản dòng tiền..."` | Tiêu đề chính, có thể chứa `<br>` |
| `{{BADGE}}` | `"🏠 Tự nghiên cứu · Đầu tư BĐS"` | Pill trên hero, uppercase auto |
| `{{HERO_SUB}}` | `"Bóc tách 7 sự đánh tráo..."` | 1-2 câu tóm tắt |
| `{{UPDATE_DATE}}` | `"06/2026"` | Format MM/YYYY |
| `{{META_SCOPE}}` | `"Đầu tư BĐS dòng tiền tại VN"` | Phạm vi |
| `{{META_CHAPTERS}}` | `"15 chương · 7 đánh tráo · số liệu"` | Mô tả quy mô |
| `{{FOOTER_TITLE}}` | `"Tự nghiên cứu · BĐS dòng tiền"` | Dòng 1 footer |
| `{{SECTION_1_TITLE}}` | `"Doanh thu ≠ Dòng tiền"` | Tiêu đề section mẫu |
| `{{SECTION_1_SHORT}}` | `"Doanh thu ≠ Dòng tiền"` | Bản rút gọn cho minimap |
| `{{SRC_N_AUTHOR/TITLE/DATE/URL/DOMAIN/META}}` | — | Nguồn tham chiếu thứ N |

⚠️ **Verify cuối (BẮT BUỘC):**
```bash
grep -oE "{{[A-Z_0-9]+}}" /path/to/report.html | sort -u
# Phải trả EMPTY. Nếu còn → sót token.
```

---

## CORE components

(Có sẵn CSS trong template — dùng ngay)

### Hero + meta

```html
<header class="hero">
  <span class="badge">{{BADGE}}</span>
  <h1>{{HERO_TITLE}}</h1>
  <p class="sub">{{HERO_SUB}}</p>
  <div class="meta">
    <span>🗓️ Cập nhật: {{UPDATE_DATE}}</span>
    <span>📐 Phạm vi: {{META_SCOPE}}</span>
    <span>📚 {{META_CHAPTERS}}</span>
  </div>
</header>
```

- ✅ Badge tự uppercase, hero gradient mood đổi 1 dòng CSS (xem `themes.md`).
- ❌ Không để title dài quá 2 dòng — dùng `<br>` để ngắt nhịp.

### section-title + num badge

```html
<h2 class="section-title"><span class="num">I</span>Tiêu đề section</h2>
```

- `.num` chứa: số La Mã (`I`, `II`, `III`), số (`1`, `2`), emoji (`★`, `📚`, `🔑`), hoặc chữ.
- ✅ Mỗi section bắt đầu bằng đúng 1 `h2.section-title`.
- ✅ `id` của section phải khớp với `href` trong minimap.

### Typography

```html
<p>Đoạn văn. <strong>strong</strong> = trắng đậm. <em>em</em> = vàng highlight (KHÔNG in nghiêng).</p>

<ul class="bul">
  <li>Mục bullet — marker màu amber tự động</li>
</ul>

<ol class="numlist">
  <li>Mục numbered</li>
</ol>

<a class="src" href="..." target="_blank" rel="noopener">link dotted blue</a>
```

- `em` **không in nghiêng** — nó là highlight vàng. Đây là quy ước của template.
- ✅ Dùng `<em>` cho thuật ngữ quan trọng / số liệu nhấn mạnh.
- ❌ Không lạm dụng `<strong>` + `<em>` cùng 1 đoạn — rối mắt.

### KPI grid

```html
<div class="kpi-grid">
  <div class="kpi red"><div class="val">2,4%</div><div class="lab">Gross Yield tài sản A</div></div>
  <div class="kpi green"><div class="val">6,0%</div><div class="lab">Gross Yield tài sản B</div></div>
  <div class="kpi"><div class="val">50 tỷ</div><div class="lab">Giá vốn A (amber mặc định)</div></div>
  <div class="kpi cyan"><div class="val">3 tỷ</div><div class="lab">Giá vốn B</div></div>
  <div class="kpi violet"><div class="val">+249tr</div><div class="lab">Dòng tiền ròng B/năm</div></div>
</div>
```

- Modifier màu: `.kpi.red` (tiêu cực/thấp), `.kpi.green` (tích cực/cao), `.kpi.cyan`, `.kpi.violet`. Mặc định = amber.
- ✅ Dùng `.val` cho SỐ (lớn, bold), `.lab` cho NHÃN (nhỏ, muted).
- ✅ Grid `auto-fit minmax(180px,1fr)` → responsive tự collapse.
- ❌ Không để `.val` quá dài (vd: "199.254 tỷ VNĐ") — thu gọn ("₫199,3K tỷ").

### Compare (before/after)

```html
<div class="compare">
  <div class="col before">
    <h4>Tiền thuê tuyệt đối <span class="tag">Quy mô</span></h4>
    <ul class="bul">
      <li>Tài sản A: 100tr/tháng</li>
    </ul>
  </div>
  <div class="col after">
    <h4>Gross Yield <span class="tag">Hiệu quả</span></h4>
    <ul class="bul">
      <li>Tài sản A: 2,4%/năm</li>
    </ul>
  </div>
</div>
```

- `.before` (cyan) vs `.after` (amber) — cặp tương phản.
- ✅ Tiêu đề có `<span class="tag">` pill bên phải để gắn nhãn góc nhìn.
- ✅ Collapse thành 1 cột khi `<720px`.

### Table

```html
<table class="tbl">
  <thead><tr><th>Tài sản</th><th>Tiền thuê</th><th>Yield</th></tr></thead>
  <tbody>
    <tr><td><strong>A</strong></td><td>100tr</td><td>2,4%</td></tr>
    <tr><td><strong>B</strong></td><td>15tr</td><td>6,0%</td></tr>
  </tbody>
</table>
```

- Zebra row tự động + hover highlight amber.
- ✅ `<td><strong>` → vàng (`#fcd34d`) cho cell quan trọng.
- ✅ Header có accent bar trái (`::before`) cho cột đầu.

### Callout

```html
<div class="callout warn">
  <h4>⚠️ Tiêu đề callout</h4>
  <p>Nội dung. Border-left gradient, hover lift nhẹ.</p>
</div>

<div class="callout good"><h4>✅ Tích cực</h4><p>...</p></div>
<div class="callout info"><h4>💡 Thông tin</h4><p>...</p></div>
<!-- mặc định (không modifier) = violet -->
```

- Modifier: `.warn` (red — cảnh báo), `.good` (green — tích cực), `.info` (blue — thông tin), mặc định (violet — insight).
- ✅ Bắt đầu `<h4>` bằng emoji phù hợp (⚠️ ✅ 💡 🔑).
- ✅ 1-2 câu, không dài.

### Chart box

```html
<div class="chart-box">
  <h4>📊 Tiêu đề chart</h4>
  <div class="desc">Chú thích — nguồn số liệu, cách đọc. Italic muted.</div>
  <div class="chart-wrap"><canvas id="chartXxx"></canvas></div>
</div>
```

- `.chart-wrap` = 320px cao; `.chart-wrap.tall` = 380px cho chart dày.
- ✅ Mỗi `<canvas>` phải có `id` duy nhất + đúng 1 `new Chart(...)` trỏ tới.
- ✅ Recipe Chart.js trong `chart_recipes.md`.
- ❌ Không quên `Chart.defaults` setup ở đầu `<script>` đầu tiên.

### Timeline

```html
<div class="timeline">
  <div class="tl-item green"><div class="tl-year">2020</div><div class="tl-body">Giai đoạn khởi đầu.</div></div>
  <div class="tl-item amber"><div class="tl-year">2023</div><div class="tl-body">Yield giảm.</div></div>
  <div class="tl-item red"><div class="tl-year">2025</div><div class="tl-body">Nhiều dự án yield dưới 2%.</div></div>
</div>
```

- Modifier: `.red` (sự kiện tiêu cực), `.green` (tích cực), mặc định amber.
- ✅ Rail dọc gradient amber→line. Dot tròn phát sáng.

### Two-col

```html
<div class="two-col">
  <div><p>Cột trái</p></div>
  <div><p>Cột phải</p></div>
</div>
```

- Layout 2 cột đơn giản (không style như `.compare`). Collapse `<720px`.

---

## Component NÂNG CAO

(KHÔNG có sẵn trong template. Copy CSS vào `<style>` + HTML vào body khi cần. Nguồn: báo cáo thực tế bdong-tien / bao-cao-bds-trung-quoc / ttck-trung-quoc.)

### Flow diagram `.fd`

Dùng cho sơ đồ nhân quả / chuỗi dòng tiền / decision tree. **CSS dài** — chỉ paste khi thực sự cần (bài phân tích nhân quả phức tạp). Xem CSS đầy đủ trong `bdong-tien/index.html` dòng 119-175.

```html
<div class="fd">
  <div class="fd-phase green">
    <div class="fd-phase-head">
      <span class="fd-badge">💵</span>
      <span class="fd-phase-title">Giai đoạn 1: Thu tiền</span>
      <span class="fd-phase-sub">30tr/tháng × 12</span>
    </div>
    <div class="fd-chain">
      <span class="fd-node">Thuê A</span><span class="fd-arrow">→</span>
      <span class="fd-node">Thuê B</span><span class="fd-arrow">→</span>
      <span class="fd-node">Tổng 360tr</span>
    </div>
    <div class="fd-result">= Doanh thu danh nghĩa 360tr/năm</div>
  </div>

  <div class="fd-trans">
    <div class="fd-trans-line"><span class="fd-trans-badge">Trừ chi phí</span></div>
  </div>

  <div class="fd-phase amber">
    <div class="fd-phase-head">
      <span class="fd-badge">⏳</span>
      <span class="fd-phase-title">Giai đoạn 2: Trừ chi phí</span>
    </div>
    <div class="fd-chain">
      <span class="fd-node">Trống khách</span><span class="fd-arrow">+</span>
      <span class="fd-node">Môi giới</span><span class="fd-arrow">+</span>
      <span class="fd-node">Thuế</span>
    </div>
    <div class="fd-result">≈ Dòng tiền ròng 2%/năm</div>
  </div>
</div>
```

- `.fd-phase` modifier: `.green` (tích cực), `.amber` (cảnh báo), `.red` (tiêu cực), `.blue` (trung tính).
- `.fd-chain` + `.fd-node` + `.fd-arrow` = chuỗi ngang `A → B → C`.
- `.fd-trans` = transition giữa phase (badge pill + line).
- ✅ Dùng cho chuỗi nhân quả nhiều giai đoạn — power-user, không lạm dụng.

### Obligation grid

Card hạng mục với border-left màu, dùng cho list hạng mục/cam kết.

```html
<div class="obligation-grid">
  <div class="obligation-card" style="border-left-color:#f59e0b">
    <h4>📌 Hạng mục 1</h4>
    <p>Mô tả ngắn.</p>
    <ul class="bul"><li>Điều kiện 1</li><li>Điều kiện 2</li></ul>
  </div>
  <div class="obligation-card" style="border-left-color:#ef4444">
    <h4>⚠️ Hạng mục 2</h4>
    <p>...</p>
  </div>
</div>
```

- CSS có sẵn trong template (dòng 108-117). Border-left đổi qua inline `style`.
- ✅ Dùng cho grid hạng mục đối xứng (VD: 4 nghĩa vụ của nhà đầu tư).

### Risk list `.rl`

Card rủi ro border-left red. (Nguồn: bao-cao-bds-trung-quoc). Paste CSS:

```css
.rl-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:20px 0}
.rl{background:linear-gradient(180deg,var(--card),rgba(15,23,42,.6));border:1px solid var(--line);border-left:3px solid var(--red);border-radius:12px;padding:16px 18px;transition:.22s}
.rl:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.25)}
.rl-n{font-size:.68rem;color:var(--red);text-transform:uppercase;letter-spacing:.1em;font-weight:700}
.rl-t{font-size:.95rem;color:#fff;font-weight:700;margin:4px 0}
.rl-v{font-size:.82rem;color:var(--muted)}
```

```html
<div class="rl-grid">
  <div class="rl"><div class="rl-n">Rủi ro 1</div><div class="rl-t">Liquidity trap</div><div class="rl-v">Không bán được khi cần</div></div>
</div>
```

### Policy timeline `.ptl`

Timeline NGANG nâng cao cho chính sách thắt/nới, có filter toggle. (Nguồn: bao-cao-bds-trung-quoc). **Phức tạp** — chỉ dùng cho bài policy dài cần filter. CSS + JS xem `bao-cao-bds-trung-quoc.html`.

```html
<div class="ptl-wrap">
  <div class="ptl-legend"><span class="tight">Siết</span><span class="loose">Nới</span></div>
  <div class="ptl-filter">
    <button class="all active" data-f="all">Tất cả</button>
    <button class="tight" data-f="tight">Siết</button>
    <button class="loose" data-f="loose">Nới</button>
  </div>
  <div class="ptl">
    <div class="ptl-axis"></div>
    <div class="ptl-list">
      <div class="ptl-item tight"><span class="ptl-year">2022</span><div class="ptl-card tight"><span class="ptl-tag">Siết</span><div class="ptl-desc">Siết tín dụng BĐS</div></div></div>
    </div>
  </div>
</div>
```

### Collapsible sources `.sources`

List nguồn có nút mở/đóng, đặc biệt in (print-friendly). (Nguồn: báo cáo Trung Quốc). Paste CSS:

```css
.sources{margin:22px 0}
.src-toggle{background:var(--bg2);border:1px solid var(--line);color:var(--txt);padding:10px 18px;border-radius:10px;cursor:pointer;font-size:.9rem;width:100%;text-align:left;transition:.2s}
.src-toggle:hover{border-color:var(--amber);color:#fbbf24}
.src-preview{color:var(--muted);font-size:.85rem;margin-top:8px;font-style:italic}
.src-body{max-height:0;overflow:hidden;transition:max-height .4s ease;margin-top:0}
.src-body.open{max-height:2000px;margin-top:12px}
.src-body ol{counter-reset:src;list-style:none;padding-left:0}
.src-body ol li{counter-increment:src;padding:8px 0 8px 32px;position:relative;font-size:.86rem;border-bottom:1px dashed var(--line)}
.src-body ol li::before{content:counter(src);position:absolute;left:0;top:8px;min-width:24px;height:24px;border-radius:6px;background:var(--bg2);color:var(--muted);font-size:.75rem;display:flex;align-items:center;justify-content:center;font-weight:700}
@media print{.src-body{max-height:none!important;overflow:visible!important}}
```

```html
<div class="sources">
  <button class="src-toggle" onclick="this.nextElementSibling.classList.toggle('open')">📂 Mở danh sách nguồn (N mục)</button>
  <div class="src-body">
    <ol>
      <li>Tên nguồn — <a class="src" href="..." target="_blank" rel="noopener">domain.com</a></li>
    </ol>
  </div>
</div>
```

### Glossary panel

Panel thuật ngữ có search + filter category. (Nguồn: ttck-trung-quoc). **Phức tạp** — chỉ dùng cho bài có nhiều thuật ngữ nước ngoài cần giải thích. Xem `ttck-trung-quoc/index.html` cho CSS + JS điền động.

```html
<button class="glo-btn" id="gloBtn">📖 Thuật ngữ</button>
<div class="glo-panel" id="gloPanel">
  <input class="glo-search" placeholder="Tìm thuật ngữ...">
  <div class="glo-filters">
    <button data-cat="all" class="active">Tất cả</button>
    <button data-cat="cn">Hán Việt</button>
    <button data-cat="fin">Tài chính</button>
  </div>
  <div class="glo-list"><!-- JS điền --></div>
</div>
```

---

## Checklist trước khi Done

- [ ] Mọi `{{TOKEN}}` đã replace — `grep -oE "{{[A-Z_0-9]+}}" report.html | sort -u` trả EMPTY.
- [ ] Mỗi `<section id="X">` có 1 entry `<a href="#X">` trong minimap.
- [ ] `new Chart(...)` count = `<canvas>` count.
- [ ] Chart.js setup (`Chart.defaults.color/font/borderColor`) ở đầu `<script>` đầu tiên.
- [ ] `SLIDES.length` trong script presentation ≈ số section chính (verify sau khi sửa section).
- [ ] Hero gradient mood phù hợp chủ đề (xem `themes.md`).
- [ ] `node --check` cho JS không lỗi syntax.
- [ ] `node scripts/qa_article.js --url=file://...` → `✅ PASS`.
- [ ] Footer có dòng "ghi chép tự nghiên cứu, không phải khuyến nghị đầu tư".
