# Citations — 2 chế độ trích nguồn

Template hỗ trợ 2 chế độ trích nguồn song song. Chọn 1 cho toàn bài (không trộn).

## Mục lục

- [Chế độ 1: Numerated (`.ref` + `ol.refs`)](#chế-1-numerated)
- [Chế độ 2: Plain source list (`.src` + `.sources`)](#chế-2-plain)
- [Khi nào chọn cái nào](#khi-nào-chọn)
- [Pattern chia nhóm tham chiếu](#pattern-chia-nhóm)

---

<a id="chế-1-numerated"></a>
## Chế độ 1: Numerated (`.ref` + `ol.refs`)

**Dùng cho bài dài cần truy nguồn số liệu cụ thể.** Mỗi số liệu/nhận định quan trọng có superscript `[N]` trỏ về entry số N trong danh sách cuối bài. Phù hợp bài tự nghiên cứu 15+ chương.

### Inline citation

```html
<p>Yield tham chiếu HCM ~3,8%<sup class="ref">1</sup>, Bình Dương 4,1–7,5%<sup class="ref">4</sup>. Sự chênh lệch phản ánh quy mô<sup class="ref">12</sup>.</p>
```

- `.ref` = pill nhỏ vàng, `vertical-align:super`, hover lift.
- ✅ Đặt `<sup class="ref">N</sup>` ngay sau số liệu/claim nó hỗ trợ.
- ✅ N = số thứ tự trong `ol.refs` (bắt đầu 1, tăng dần).

### Danh sách nguồn cuối bài

```html
<section id="tai-lieu-tham-khao">
  <h2 class="section-title"><span class="num">📚</span>Tài liệu tham khảo</h2>
  <p>Danh sách nguồn số liệu viện dẫn. Các tham chiếu <sup class="ref">1</sup>–<sup class="ref">11</sup> trỏ về đây.</p>

  <h3>I. Số liệu thị trường</h3>
  <ol class="refs">
    <li>
      <div>
        <strong>VnExpress</strong> — "Tỷ suất cho thuê căn hộ TP HCM chạm đáy" (08/2025)
        <a href="https://vnexpress.net/..." target="_blank" rel="noopener">vnexpress.net/...</a>
        <span class="src-meta">Yield căn hộ HCM 2,8–4,2% · dùng cho Case 1, chart theo địa phương</span>
      </div>
    </li>
    <li>
      <div>
        <strong>Global Property Guide</strong> — Vietnam Residential Property Market Analysis (2026)
        <a href="https://www.globalpropertyguide.com/..." target="_blank" rel="noopener">globalpropertyguide.com/...</a>
        <span class="src-meta">Lợi suất theo địa phương · phương pháp Gross/Net Yield</span>
      </div>
    </li>
  </ol>
</section>
```

### Anatomy 1 entry

```html
<li>
  <div>
    <strong>{TÁC GIẢ/NHÀ XUẤT BẢN}</strong> — "{TÊN BÀI/CHỦ ĐỀ}" ({NGÀY})
    <a href="{URL}" target="_blank" rel="noopener">{DOMAIN}</a>
    <span class="src-meta">{CÁCH DÙNG SỐ LIỆU — vd: "Yield HCM 2,8–4,2% · dùng cho Case 1"}</span>
  </div>
</li>
```

- Badge số tự động qua `counter-reset:ref` + `::before{content:counter(ref)}`.
- `<a>` = link dotted blue, hover đổi vàng.
- `.src-meta` = dòng muted giải thích **cách dùng** số liệu (không phải tóm tắt nguồn) — giúp người đọc biết số liệu nào trong bài đến từ nguồn nào.

### Đặc điểm

- ✅ Truy nguồn chính xác — click `[4]` biết ngay số liệu từ đâu.
- ✅ Phù hợp bài dài nhiều số liệu.
- ❌ Phải giữ N đồng nhất: nếu thêm nguồn ở giữa → phải renumber TẤT CẢ `<sup>` phía sau. **Dễ sai.**
- ✅ Solution: thêm nguồn mới → append vào cuối `ol.refs` + dùng N tiếp theo.

---

<a id="chế-2-plain"></a>
## Chế độ 2: Plain source list (`.src` + `.sources`)

**Dùng cho bài policy tổng hợp / nhiều nguồn không cần đánh số.** Link dotted inline + danh sách nguồn cuối bài không đánh số. Phù hợp bài ngắn hơn hoặc bài tổng hợp policy.

### Inline link

```html
<p>Thị trường chứng khoán TQ sập 2015 (<a class="src" href="https://..." target="_blank" rel="noopener">reuters.com</a>), mất ~5 nghìn tỷ USD giá trị vốn hóa.</p>
```

- `.src` = link dotted blue (không pill, không số).
- ✅ Đặt domain hiển thị (không toàn URL) để gọn.

### Danh sách nguồn cuối bài

Dùng `.sources` collapsible (CSS trong `components.md`):

```html
<div class="sources">
  <button class="src-toggle" onclick="this.nextElementSibling.classList.toggle('open')">📂 Mở danh sách nguồn (12 mục)</button>
  <div class="src-body">
    <ol>
      <li>Reuters — China stock crash 2015 — <a class="src" href="..." target="_blank" rel="noopener">reuters.com</a></li>
      <li>NBER — Demystifying ... — <a class="src" href="...">journals.uchicago.edu</a> <em>(3,6 m² 1978)</em></li>
      <li>Chicago Booth Review — Stock Market Crashes — <a class="src" href="...">chicagobooth.edu</a></li>
    </ol>
  </div>
</div>
```

Hoặc đơn giản hơn — `ol.numlist` thường (không badge gradient):

```html
<section id="tai-lieu-tham-khao">
  <h2 class="section-title"><span class="num">📚</span>Tài liệu tham khảo</h2>
  <ul class="bul">
    <li>Reuters — China stock crash 2015 — <a class="src" href="..." target="_blank" rel="noopener">reuters.com</a></li>
    <li>NBER — Demystifying China's growth — <a class="src" href="...">journals.uchicago.edu</a></li>
  </ul>
</section>
```

### Đặc điểm

- ✅ Đơn giản — không cần đánh số, không lo renumber.
- ✅ Phù hợp bài policy tổng hợp (nhiều nguồn, không claim cụ thể cần truy nguồn).
- ❌ Khó truy nguồn số liệu cụ thể — phải tự tìm trong text.
- ❌ Inline link rải rác nhiều → rối đoạn văn.

---

## Page-anchored (PDF source) — mở rộng Chế độ 1

Khi nguồn chính của bài là **PDF user cung cấp** (báo cáo CK, IGWT, văn bản pháp lý, white paper, sách), Chế độ 1 Numerated được mở rộng: mỗi `<li>` trong `ol.refs` mang thêm **page anchor** lấy từ output của skill `pdf-evidence` (Bước 0). Điều này giải quyết Pitfall 10 (mismatch số liệu vì `pdftotext` mất page) và Pitfall 6 ("không bịa số" — giờ verify được từng số tới page).

### Citation format

| Loại claim | Format | Ví dụ |
|------------|--------|-------|
| Text claim (số liệu, điều khoản, quote) | `[alias, p.X, "section", "quote"]` | `[igwt_2026, p.38, "Quo Vadis, Aurum?", "decade target of USD 4,800 by 2030"]` |
| Bảng | `[alias, p.X, pN.tI, row/col]` | `[abc_2026, p.7, p7.t1, row 'Doanh thu' / col 'Q1/2026 (tỷ VNĐ)']` |
| Biểu đồ | `[alias, p.X, pN.cI, "chart title", "~value"]` | `[igwt_2026, p.28, p28.c1, "Gold Price 2045 Range", "~USD 6,900 lower bound"]` |

`alias` = tên file ngắn do user đặt ở Bước 0 (vd `igwt_2026`, `abc_2026`). `pN.tI` / `pN.cI` = global id do `pdf-evidence/scripts/extract.py` emit (page-prefixed).

### Entry anatomy (mở rộng anatomy 1 entry)

```html
<li>
  <span class="src-author">Incrementum AG</span>,
  <span class="src-title">In Gold We Trust 2026 — Compact</span>,
  <span class="src-date">2026</span>,
  <span class="src-pdf">PDF <code>[igwt_2026]</code></span>
  <a class="src-anchor" href="#ev-igwt-p38">p.38, "Quo Vadis, Aurum?"</a>
  <span class="src-meta">decade target USD 4,800/oz by 2030</span>
</li>
```

- `src-pdf` khai báo alias của PDF (định danh file).
- `src-anchor` chứa page + section — có thể link tới footnote/embedded evidence hiển thị quote gốc.
- `src-meta` ghi usage note (con số/ý chính dẫn từ page đó).

### Khi nào dùng page-anchored

| Điều kiện | Dùng page-anchored? |
|-----------|---------------------|
| Bước 0 đã chạy `pdf-evidence/scripts/extract.py` → có `source.extract.json` | ✅ CÓ — đây là default cho bài nguồn PDF |
| Nguồn chỉ là URL web (không PDF) | ❌ Giữ Chế độ 1/2 URL-based cũ |
| PDF scanned không có text layer (pdf-evidence trả `doc_type=scanned`) | ⚠️ Cần OCR ngoài (v0.3 chưa cài); tạm dùng `pdftotext` + ghi chú "page không verify được" |
| Bảng parse_confidence < 0.7 | ⚠️ Citation kèm `note: "uncertain parse — verify"` + giảm confidence |

### Liên kết với Bước 5d

Mỗi entry page-anchored phải pass Bước 5d (đối chiếu nguồn PDF): pdf-evidence trả citation cùng page → MATCH mới giữ entry. Nếu pdf-evidence ABSTAIN → claim không có trong PDF → **xóa entry hoặc đánh dấu "không verify được"** (Pitfall 8 — không bịa).

---

<a id="khi-nào-chọn"></a>
## Khi nào chọn cái nào

| Tiêu chí | Chế độ 1 (Numerated) | Chế độ 2 (Plain) | Page-anchored (PDF) |
|---|---|---|---|
| Độ dài bài | 15+ chương | <15 chương hoặc policy | bất kỳ (khi nguồn chính là PDF) |
| Số nguồn | 10-40 nguồn | <15 nguồn | 1 vài PDF lớn + URL phụ |
| Cần truy nguồn số liệu? | ✅ CÓ — mỗi số có [N] | ❌ Không cần | ✅ CÓ — mỗi số có [N] + page anchor |
| Loại bài | Tự nghiên cứu / tư duy | Policy tổng hợp / tổng quan | Tóm tắt/phân tích 1 báo cáo PDF cụ thể |
| Ví dụ thực tế | bdong-tien, boom-tien | ttck-trung-quoc, giao-duc-trung-quoc | bài phân tích IGWT 2026, bài tóm tắt BCTC |

**Quy tắc cập nhật:**
- Nếu bài có nhiều số liệu cụ thể cần minh bạch nguồn → Chế độ 1.
- Nếu bài là tổng hợp quan điểm/policy → Chế độ 2.
- **Nếu nguồn chính là PDF user cung cấp và cần đối chiếu theo page → Page-anchored (mở rộng Chế độ 1, evidence lấy từ `pdf-evidence`).**

---

<a id="pattern-chia-nhóm"></a>
## Pattern chia nhóm tham chiếu

Khi `ol.refs` dài (>15 entry), chia nhóm theo loại nguồn. Dùng `start="N"` để tiếp tục đánh số:

```html
<h3>I. Số liệu thị trường</h3>
<ol class="refs">
  <li>... (1)</li>
  <li>... (2)</li>
  <!-- ... đến 11 -->
</ol>

<h3>II. Lý thuyết &amp; phương pháp luận</h3>
<ol class="refs" start="12">
  <li>... (12)</li>
  <li>... (13)</li>
  <!-- ... tiếp tục -->
</ol>

<h3>III. Ghi chú</h3>
<ul class="bul">
  <li>Toàn bộ số yield là lợi suất gộp chưa trừ chi phí.</li>
  <li>5 case study là kịch bản minh họa, không phải tài sản cụ thể.</li>
</ul>
```

- `ol start="12"` → counter tiếp tục từ 12 (KHÔNG reset).
- ✅ Nhóm theo loại: "Số liệu thị trường" / "Lý thuyết" / "Pháp lý" / "Ghi chú".
- ✅ Cuối cùng thêm `.callout info` "💡 Bản chất báo cáo" — disclaim đây là tự nghiên cứu, không phải khuyến nghị đầu tư.

### Verify cuối

```bash
# Đếm số <sup class="ref">N tối đa
grep -oE 'class="ref">[0-9]+' report.html | grep -oE '[0-9]+' | sort -n | tail -1
# Phải ≤ số <li> trong ol.refs tổng cộng.
```
