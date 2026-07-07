# Navigation — Minimap + Progress + Presentation

Skill `longform-report` có sẵn JS navigation generic trong template (Script 2). File này giải thích cơ chế + cách đồng bộ + cách customize.

## Mục lục

- [Tổng quan các thành phần](#tổng-quan-các-thành-phần)
- [Minimap (floating TOC)](#minimap-floating-toc)
- [Progress bar + floating buttons](#progress-bar--floating-buttons)
- [Scrollspy (active link)](#scrollspy-active-link)
- [Search filter](#search-filter)
- [Mobile mode](#mobile-mode)
- [Presentation mode](#presentation-mode)
- [Đồng bộ khi thêm/xóa section](#đồng-bộ-khi-thêmxóa-section)

---

## Tổng quan các thành phần

| Thành phần | Selector | Vai trò |
|---|---|---|
| Minimap | `aside.minimap` | Floating TOC top-right, group collapse, search |
| Progress bar | `.progress-bar` | Thanh 3px top, fill gradient theo % scroll |
| To-top button | `.to-top` | Nút lên đầu trang (bottom-left) |
| MM-fab | `.mm-fab` | Nút mở minimap (mobile bottom-right) |
| Pres-btn | `.pres-btn` | Nút trình chiếu (top-left) |
| Pres-overlay | `.pres-overlay` | Full-screen slideshow stage |

Tất cả đều `position:fixed`, chỉ hiện khi `body.nav-active` (scrollY > 400) hoặc `body.loaded` (800ms sau load).

---

## Minimap (floating TOC)

Cấu trúc HTML (trong template có sẵn mẫu 2 group):

```html
<aside class="minimap" id="minimap" aria-label="Mục lục điều hướng">
  <div class="mm-head">
    <span class="mm-title">Mục lục</span>
    <span class="mm-pct" id="mmPct">0%</span>
  </div>
  <div class="mm-search">
    <input type="text" id="mmSearch" placeholder="Lọc mục lục..." autocomplete="off">
  </div>
  <button class="mm-overlay-close" id="mmClose" aria-label="Đóng">✕</button>

  <!-- Mỗi group = 1 cụm chủ đề -->
  <div class="mm-group open" data-group="b">
    <button class="mm-group-head"><span class="chev">▶</span> Mở đầu <span class="gcount">3</span></button>
    <ul class="mm-items">
      <li><a href="#mo-dau"><span class="dot"></span>Mở đầu</a></li>
      <li><a href="#ch1"><span class="dot"></span>I — Doanh thu ≠ Dòng tiền</a></li>
      <li><a href="#ch2"><span class="dot"></span>II — Dương ≠ Hấp dẫn</a></li>
    </ul>
  </div>

  <div class="mm-group" data-group="cs">
    <button class="mm-group-head"><span class="chev">▶</span> 7 đánh tráo <span class="gcount">5</span></button>
    <ul class="mm-items">
      <li><a href="#ch3"><span class="dot"></span>III — Dòng tiền vs Tăng giá</a></li>
      <!-- ... -->
    </ul>
  </div>

  <div class="mm-no-result" id="mmNoResult">Không tìm thấy mục nào.</div>
</aside>
```

### Quy ước

- `data-group="X"` — định danh group (bất kỳ string unique: `b`, `cs`, `pt`, `n`...). Dùng cho filter logic nếu cần.
- `.gcount` — số mục trong group (hiển thị badge phải). Phải khớp số `<li>` thực tế.
- Group đầu tiên thường `class="mm-group open"` (mở sẵn). Các group khác collapsed mặc định.
- `<a href="#ID">` — `ID` phải khớp `id` của một `<section>` (HOẶC element có `scroll-margin-top:90px`).
- ✅ Tên group ngắn: "Mở đầu", "Phân tích", "Kết". Không quá 4-5 group.

---

## Progress bar + floating buttons

```html
<button class="mm-fab" id="mmFab" aria-label="Mở mục lục">☰</button>
<button class="to-top" id="toTop" aria-label="Lên đầu trang">↑</button>
<button class="pres-btn" id="presBtn" aria-label="Trình chiếu" title="Trình chiếu">📽️</button>
<div class="progress-bar" id="progressBar"></div>
```

JS (đã có sẵn trong template) tự cập nhật:
- `progressBar.style.width` = % scroll.
- `mmPct.textContent` = % scroll (trong minimap head).
- Toggle `body.nav-active` + `.to-top.show` khi `scrollY > 400`.

---

## Scrollspy (active link)

JS dùng `IntersectionObserver` với `rootMargin:'-90px 0px -70% 0px'`:

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const id = entry.target.id;
      const found = sections.find(s => s.id === id);
      if (found){
        sections.forEach(s => s.link.classList.remove('active'));
        found.link.classList.add('active');
        openGroupContaining(found.link);  // tự mở group chứa
      }
    }
  });
}, { rootMargin:'-90px 0px -70% 0px' });
```

- `rootMargin:'-90px top ... -70% bottom'` — section được "active" khi nó ở vị trí 90px từ top đến 30% viewport. Cảm giác tự nhiên.
- Tự mở group chứa section active (để user thấy mình đang ở đâu).
- `.mm-items a.active` → highlight amber + dot phát sáng.

---

## Search filter

Input `#mmSearch` lọc link theo text:

```js
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  minimap.classList.toggle('searching', !!q);
  let anyVisible = false;
  allLinks.forEach(a => {
    const text = a.textContent.toLowerCase();
    const match = !q || text.includes(q);
    a.style.display = match ? '' : 'none';
    if (match) anyVisible = true;
    if (match && q) openGroupContaining(a);  // mở group chứa match
  });
  noResult.classList.toggle('show', !anyVisible);
});
```

- Khi có query: ẩn link không match, mở mọi group có match.
- `.mm-no-result.show` hiện khi 0 match.

---

## Mobile mode

- `<1024px`: minimap ẩn, `.mm-fab` hiện (bottom-right).
- Click `.mm-fab` → `body.nav-mobile-open` → minimap full-screen overlay.
- `.mm-overlay-close` (✕) → đóng.
- Click bất kỳ link → tự đóng (để user thấy section).

```css
@media(max-width:1023px){
  .mm-fab{display:flex}
  .minimap{display:none; top:0; right:0; left:0; bottom:0; width:auto; max-height:none; border-radius:0; border:none;}
  body.nav-mobile-open .minimap{display:block; opacity:1; transform:translateY(0); pointer-events:auto}
  body.nav-mobile-open .mm-fab{display:none}
}
```

---

## Presentation mode

Full-screen slideshow. Bấm `.pres-btn` (hoặc script gọi `open()`).

### SLIDES array schema

Định nghĩa thủ công trong Script 2. Mỗi slide = 1 object:

```js
const SLIDES = [
  // type: 'title' — slide mở đầu
  { type:'title', badge:'🏠 Tự nghiên cứu',
    title:'Tiêu đề bài (có thể dài)',
    sub:'1-2 câu tóm tắt',
    meta:'Cập nhật 06/2026 · 15 chương' },

  // type: 'section' — slide chia chương
  { type:'section', num:'I', label:'Đánh tráo 1', title:'Có doanh thu ≠ Có dòng tiền' },

  // type: 'list' — slide danh sách (kicker + title + items)
  { type:'list', kicker:'Bóc tách', title:'Doanh thu → dòng tiền ròng',
    items:[
      {t:'💵 <strong>Doanh thu</strong> 30tr × 12'},
      {t:'⏳ Trừ trống khách · môi giới · thuế'},
      {t:'✅ <strong>= Dòng tiền ròng ~2%</strong>'}
    ]},

  // type: 'quote' — slide trích dẫn/câu chốt
  { type:'quote', q:'"Có người thuê chưa đủ gọi là cỗ máy in tiền"',
    source:'Câu hỏi đúng: sau chi phí còn bao nhiêu tiền thật?' }
];
```

### Loại slide

| type | Dùng cho | Trường bắt buộc |
|---|---|---|
| `title` | Slide mở đầu (1/cày) | `badge`, `title`, `sub`, `meta` |
| `section` | Chia chương | `num`, `label`, `title` |
| `list` | Danh sách điểm chính | `kicker`, `title`, `items[]` (mỗi `{t: '...'}`) |
| `quote` | Câu chốt / insight | `q`, `source` |

### Điều khiển

| Phím | Hành động |
|---|---|
| `→` / `Space` / `PageDown` | Slide sau |
| `←` / `PageUp` | Slide trước |
| `Home` / `End` | Đầu / cuối |
| `Esc` | Thoát |
| Click overlay | Thoát |
| Dot dưới | Nhảy tới slide |

### HTML overlay (đã có sẵn trong template)

```html
<div class="pres-overlay" id="presOverlay" aria-hidden="true">
  <div class="pres-top">
    <div class="pres-progress-bg"><div class="pres-progress-fill" id="presProgress"></div></div>
    <div class="pres-counter"><b id="presCurrent">1</b> / <span id="presTotal">14</span></div>
    <button class="pres-exit" id="presExit">✕ Thoát (ESC)</button>
  </div>
  <div class="pres-stage" id="presStage"></div>
  <div class="pres-hint">← → để chuyển slide · ESC để thoát</div>
  <div class="pres-bottom">
    <button class="pres-nav" id="presPrev" aria-label="Slide trước">←</button>
    <div class="pres-dots" id="presDots"></div>
    <button class="pres-nav" id="presNext" aria-label="Slide sau">→</button>
  </div>
</div>
```

JS build slide động từ `SLIDES[]` khi mở overlay lần đầu (`built` flag tránh rebuild).

---

## Đồng bộ khi thêm/xóa section

⚠️ **Đây là nguồn bug phổ biến nhất.** Khi sửa section, phải cập nhật 3 chỗ:

### 1. Section trong body
```html
<section id="ch4">
  <h2 class="section-title"><span class="num">IV</span>Tiêu đề</h2>
  ...
</section>
```

### 2. Minimap entry (trong đúng group)
```html
<li><a href="#ch4"><span class="dot"></span>IV — Tiêu đề rút gọn</a></li>
```
→ Tăng `.gcount` của group chứa.

### 3. SLIDES array (nếu muốn slide cho section mới)
```js
{ type:'section', num:'IV', label:'Chương 4', title:'Tiêu đề' },
```

### Checklist đồng bộ

- [ ] Mỗi `<section id="X">` có đúng 1 `<a href="#X">` trong minimap.
- [ ] `gcount` mỗi group = số `<li>` trong group đó.
- [ ] `SLIDES.length` ≈ số section chính (verify sau khi thêm/bớt).
- [ ] `totalEl` (= `SLIDES.length`) tự update, nhưng nếu hardcode trong HTML thì sửa.
