# Academic Foundations — Nền tảng học thuật & Fact-check lý thuyết

Bước **Bước 5b** trong workflow longform — song song với Bước 5 (fact-check số liệu). Bài phân tích hành vi/cơ chế mà dẫn lý thuyết sai tên, sai tác giả, sai nội dung → còn tệ hơn không dẫn. **Trục "học thuật thật"** yêu cầu mỗi lý thuyết phải verify từ nguồn gốc.

> Rút từ session thực tế: bài "Môi giới đa cấp" bổ sung Kahneman/Cialdini/Shefrin/Dunning-Kruger — nếu không fact-check sẽ dễ gán nhầm tác giả, sai số liệu minh họa, nhầm năm tác phẩm.

## Mục lục

- [Khi nào bắt buộc nền tảng học thuật](#khi-nào-bắt-buộc)
- [Catalog lý thuyết đã verify (dùng được ngay)](#catalog-lý-thuyết)
- [Quy trình Bước 5b — fact-check lý thuyết](#quy-trình-5b)
- [Các bẫy điển hình khi dẫn lý thuyết](#các-bẫy)
- [Pattern tích hợp lý thuyết vào bài](#pattern-tích-hợp)

---

<a id="khi-nào-bắt-buộc"></a>
## Khi nào bắt buộc nền tảng học thuật

**BẮT BUỘC** có khung học thuật (để biến "quan sát" thành "giải thích vì sao"):

| Loại bài | Khung lý thuyết ưu tiên |
|---|---|
| **Hành vi nhà đầu tư / tiêu dùng / nhân viên** | Tâm lý học hành vi + Tài chính hành vi (xem catalog) |
| **Cơ chế nhân quả** (tại sao X dẫn đến Y) | Lý thuyết kinh tế / tổ chức / động lực học |
| **Chính sách pháp lý** | Văn bản gốc (đã có trong fact_check.md) |
| **Lịch sử / sự kiện** | Nguồn chính thống + đối chiếu ngày tháng |

**KHÔNG cần** (bài thuần dữ liệu/report không phân tích cơ chế): bài equity dashboard, bài tổng hợp số liệu vĩ mô, bài news digest.

---

<a id="catalog-lý-thuyết"></a>
## Catalog lý thuyết đã verify (dùng được ngay)

Catalog dưới đây đã verify từ nguồn gốc. **Khi dùng, copy đúng tên + tác giả + năm** — không sửa, không diễn giải sai. Link nguồn cho `ol.refs`.

### A. Tâm lý học hành vi (behavioral psychology)

| Lý thuyết / hiệu ứng | Tác giả + tác phẩm gốc | Nội dung cốt lõi | Nguồn verify |
|---|---|---|---|
| **System 1 vs System 2** | Daniel Kahneman, *Thinking, Fast and Slow* (2011) | 2 chế độ tư duy: System 1 nhanh/trực giác/tự động (~96% quyết định), System 2 chậm/phân tích/cố ý | [Wikipedia](https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow) |
| **Prospect Theory** | Kahneman & Tversky, "Prospect Theory: An Analysis of Decision under Risk" (*Econometrica*, 1979) | Con người đánh giá kết quả theo điểm tham chiếu, không tuyệt đối; hàm giá trị hình S, dốc hơn ở miền lỗ | [Wikipedia](https://en.wikipedia.org/wiki/Prospect_theory) |
| **Loss aversion** | Kahneman & Tversky (1979) | Nỗi đau mất tiền mạnh hơn niềm vui được cùng số — tỷ lệ ≈ **2:1** (KHÔNG phải 3:1) | [The Decision Lab](https://thedecisionlab.com/reference-guide/psychology/loss-aversion) |
| **Anchoring** | Tversky & Kahneman (1974) | Dựa quá nhiều vào thông tin đầu tiên ("mỏ neo") khi đánh giá sau | [Wikipedia](https://en.wikipedia.org/wiki/Anchoring_effect) |
| **6 (thực ra 7) nguyên tắc thuyết phục** | Robert Cialdini, *Influence: The Psychology of Persuasion* (1984; bản sửa 2016 thêm Unity) | Reciprocity, Commitment & Consistency, Social Proof, Authority, Liking, Scarcity, **Unity** (2016) | [influenceatwork.com](https://www.influenceatwork.com/7-principles-of-persuasion/) |
| **Dunning-Kruger effect** | Kruger & Dunning, "Unskilled and Unaware of It" (*JPSP*, 1999) | Người thiếu kỹ năng không đủ trình độ nhận ra mình thiếu → tự tin sai lệch | [APA PsycNet](https://psycnet.apa.org/record/2000-03938-003) |
| **Cognitive dissonance** | Leon Festinger, *A Theory of Cognitive Dissonance* (1957) | Bất hòa tâm lý khi giữ 2 niềm mâu thuẫn → thay đổi thái độ/hành vi để giảm | [Wikipedia](https://en.wikipedia.org/wiki/Cognitive_dissonance) |
| **Sunk cost fallacy** | (khái niệm kinh tế học cổ điển; phổ biến hóa qua Arkes & Blumer 1985) | Tiếp tục đầu tư vì đã đầu tư nhiều rồi, dù không hợp lý | [Wikipedia](https://en.wikipedia.org/wiki/Sunk_cost) |

### B. Tài chính hành vi (behavioral finance)

| Bias | Tác giả + tác phẩm gốc | Nội dung | Nguồn verify |
|---|---|---|---|
| **Disposition effect** | Shefrin & Statman, "The Disposition to Sell Winners Too Early and Ride Losers Too Long" (*Journal of Finance*, 1985) | Bán cổ phiếu lãi quá sớm, ôm cổ phiếu lỗ quá lâu | [Wiley](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.1985.tb05002.x) |
| **Herding** | (nhiều tác giả; phổ biến qua Banerjee 1992, Bikhchandani 1992) | Đi theo đám đông thay vì phân tích độc lập | [Investopedia](https://www.investopedia.com/terms/h/herding-instinct.asp) |
| **Overconfidence bias** | (hạt nhân behavioral finance qua Thaler, Barber & Odean 2001) | Tự tin quá mức vào kiến thức/khả năng → giao dịch quá mức, đánh giá thấp rủi ro | [Investopedia](https://www.investopedia.com/terms/o/overconfidencebias.asp) |
| **FOMO (Fear of Missing Out)** | (thuật ngữ phổ biến; nghiên cứu đầu уз qua Hodgkins 2016, McGillivray 2018) | Quyết định bốc đồng vì sợ lỡ cơ hội người khác đang có | [Investopedia](https://www.investopedia.com/terms/f/fomo.asp) |
| **Recency bias** | (Tversky & Kahneman 1974 — availability heuristic) | Đánh giá quá cao sự kiện gần, bỏ qua dài hạn | [Wikipedia](https://en.wikipedia.org/wiki/Availability_heuristic) |
| **Mental accounting** | Richard Thaler, "Mental Accounting and Consumer Choice" (*Marketing Science*, 1985) | Con người phân loại tiền vào các "tài khoản tâm lý" khác nhau, vi phạm tính thay thế của tiền | [Wikipedia](https://en.wikipedia.org/wiki/Mental_accounting) |

### C. Kinh tế học / tổ chức (cho bài cơ chế nhân quả)

| Lý thuyết | Tác giả + tác phẩm | Ứng dụng |
|---|---|---|
| **Principal-agent problem** | Jensen & Meckling, "Theory of the Firm" (*Journal of Financial Economics*, 1976) | Xung đột lợi ích giữa người ủy quyền (khách hàng) và người đại diện (môi giới) |
| **Incentive structure / perverse incentives** | (Buchanan, Tullock — public choice) | Cấu trúc phần thưởng định hình hành vi — thưởng sai → hành vi sai |
| **Information asymmetry** | Akerlof 1970 ("Market for Lemons"), Stiglitz | Môi giới biết nhiều hơn khách → quyền lực thao túng |
| **Gresham's law (chọn lọc ngược)** | (Thomas Gresham, 16th century) | "Tiền xấu đẩy tiền tốt ra lưu thông" —类比 chọn lọc ngược trong tổ chức |

> **Cách dùng catalog**: chọn lý thuyết phù hợp cơ chế bài → dẫn đúng tên + tác giả + năm → thêm entry `ol.refs` với link cột cuối. **Không sửa nội dung lý thuyết** — nếu diễn giải, ghi rõ "diễn giải theo...".

---

<a id="quy-trình-5b"></a>
## Quy trình Bước 5b — fact-check lý thuyết

Song song Bước 5 (số liệu). Chạy **sau khi viết xong, trước khi verify kỹ thuật**.

### Bước 5b.1 — Trích xuất mọi claim lý thuyết

Đọc lại file HTML đã viết, trích xuất TẤT CẢ claim về lý thuyết/bias/khái niệm học thuật.

Phân loại theo 4 nhóm:

| Nhóm | Ví dụ | Độ ưu tiên |
|---|---|---|
| **Tên lý thuyết + tác giả** | "Loss aversion (Kahneman)", "6 nguyên tắc Cialdini" | 🔴 Cao — sai tên/tác giả = nghiêm trọng |
| **Số liệu minh họa lý thuyết** | "loss aversion ~2:1", "System 1 ~96% quyết định" | 🔴 Cao — sai số = mất uy tín |
| **Năm tác phẩm/sự kiện học thuật** | "Thinking Fast and Slow 2011", "Dunning-Kruger 1999" | 🟡 Trung bình — dễ nhầm (vd Nobel năm vs năm sách) |
| **Nội dung tóm tắt lý thuyết** | "người chưa giỏi tự tin sai lệch" | 🟡 Trung bình — diễn giải có thể lệch |

> 💡 Dùng Agent (Explore): *"Trích xuất TẤT CẢ claim về lý thuyết học thuật trong file X, ghi số dòng + tên lý thuyết + tác giả + nội dung. Đọc cả callout."*

### Bước 5b.2 — Phát hiện sai/nhầm nguồn

So từng claim với catalog trên + nguồn gốc. Checklist:

```bash
FILE="{project}/{slug}/index.html"

# 1. Mỗi tên lý thuyết có tác giả không?
grep -nE "loss aversion|prospect theory|disposition effect|dunning|cialdini|kahneman|herding" "$FILE"
# → mỗi cái phải đi kèm tác giả hoặc sup ref

# 2. Số liệu minh họa lý thuyết có đúng không?
grep -nE "[0-9]+:[0-9]+|~[0-9]+%|[0-9]+ phần trăm" "$FILE" | grep -iE "aversion|system|bias"
# → loss aversion ~2:1 (không 3:1); System 1 ~96% (không 90%)

# 3. Năm tác phẩm
grep -nE "1979|1984|1985|1999|2011|2016" "$FILE"
# → Kahneman TFS 2011 (Nobel 2002 — KHÔNG nhầm); Cialdini Influence 1984 (Unity 2016)
```

### Bước 5b.3 — Đối chiếu nguồn gốc học thuật

Thứ tự ưu tiên nguồn (ngược với fact-check số liệu — vì lý thuyết verify từ học thuật, không phải báo chí):

1. **Tác phẩm gốc** — sách (Amazon/Google Books) hoặc journal (Wiley/ScienceDirect/JSTOR). **Gold standard.**
2. **Wikipedia** — xác nhận tên chính xác + tác giả + năm. Cross-check 2-3 ngôn ngữ.
3. **Investopedia / Cornell LII / Stanford Encyclopedia of Philosophy** — cho khái niệm tài chính/pháp lý/triết học.
4. **Trang chính thức của tác giả** — influenceatwork.com (Cialdini), princeton.edu (Kahneman).

> ❌ **KHÔNG dẫn "theo nghiên cứu..."** mà không có tên cụ thể. Nếu không verify được tên/tác giả → **bỏ lý thuyết đó**, thay bằng phân tích thuần quan sát + ghi rõ "quan sát này chưa có khung lý thuyết cụ thể".

### Bước 5b.4 — Sửa + thêm vào refs

Mỗi lý thuyết verify xong → **entry riêng trong `ol.refs`** (nhóm "Lý thuyết / Tâm lý học hành vi"), với link nguồn gốc:

```html
<h3>V. Tâm lý học hành vi &amp; tài chính hành vi</h3>
<ol class="refs" start="12">
  <li>
    <div>
      <strong>Daniel Kahneman</strong> — <em>Thinking, Fast and Slow</em> (Farrar, Straus and Giroux, 2011)
      <a href="https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow" target="_blank" rel="noopener">wikipedia.org</a>
      <span class="src-meta">Dùng cho Chương X — System 1/2, loss aversion</span>
    </div>
  </li>
</ol>
```

Verify cuối:
```bash
# Mỗi sup class="ref" N phải có entry N trong ol.refs
grep -oE 'class="ref">[0-9]+' {file} | grep -oE '[0-9]+' | sort -n | tail -1
# Phải ≤ tổng số <li> trong ol.refs
```

---

<a id="các-bẫy"></a>
## Các bẫy điển hình khi dẫn lý thuyết

### Bẫy 1 — Gán nhầm tác giả

❌ *"Thuyết thuyết phục của Kahneman"* (sai — thuyết phục là Cialdini; Kahneman là tư duy/quyết định)
❌ *"Disposition effect của Kahneman"* (sai — là Shefrin & Statman 1985)
✅ Verify tác giả từ catalog hoặc Wikipedia trước khi gán.

### Bẫy 2 — Sai số liệu minh họa

❌ *"Loss aversion 3:1"* (sai — tỷ lệ thực nghiệm ≈ **2:1**, có nghiên cứu đo 1.5-2.5 nhưng KHÔNG 3)
❌ *"System 1 xử lý 99% quyết định"* (sai — phổ biến là **~96%**, có nguồn ghi 95%)
✅ Dùng range khi không chắc: "một ước tính phổ biến ~95-96%".

### Bẫy 3 — Nhầm năm (Nobel vs năm tác phẩm)

❌ *"Thinking Fast and Slow (Kahneman 2002)"* — 2002 là **năm nhận Nobel**, sách xuất bản **2011**
❌ *"Cialdini Influence 1984 với 7 nguyên tắc"* — 1984 có **6**, Unity thêm bản **2016** (Pre-Suasion era)
✅ Phân biệt: năm nhận giải ≠ năm xuất bản. Check Wikipedia "Publication date".

### Bẫy 4 — Bịa tên bias không tồn tại

❌ *"Bandwagon-financial effect"*, *"broker trust bias"* — không tồn tại trong tài liệu chuẩn
✅ Dùng tên chuẩn từ catalog hoặc Wikipedia. Nếu quan sát chưa có tên lý thuyết → ghi "hiện tượng này tương tự..." chứ không bịa tên.

### Bẫy 5 — Diễn giải sai nội dung lý thuyết

❌ *"Dunning-Kruger: người giỏi thì khiêm tốn, người kém thì tự tin"* — **sai**. DK nói về **người thiếu kỹ năng không đủ trình độ nhận ra thiếu** (một chiều), không nói người giỏi luôn khiêm tốn.
✅ Đọc định nghĩa gốc, không rút gọn sai. Khi diễn giải → "theo..." + giữ nguyên ý.

### Bẫy 6 — Trộn 2 lý thuyết thành 1

❌ *"Authority bias (Cialdini)"* — authority là **nguyên tắc thuyết phục** của Cialdini; "authority bias" (thuật ngữ tâm lý riêng) có nguồn khác (Milgram). Trộn gây nhầm.
✅ Dùng đúng thuật ngữ đúng ngữ cảnh: Cialdini authority (thuyết phục) vs authority bias (nhận thức).

---

<a id="pattern-tích-hợp"></a>
## Pattern tích hợp lý thuyết vào bài

### Pattern A — Rải callout (ƯU TIÊN)

Mỗi cơ chế/hiện tượng kèm 1 callout nhỏ "🧠 Góc nhìn tâm lý" / "📐 Góc nhìn lý thuyết" — lý thuyết hòa vào dòng chảy lập luận:

```html
<div class="callout info">
  <h4>🧠 Góc nhìn tâm lý — <em>disposition effect</em></h4>
  <p>Tại sao khách hàng "bình quân giá khi lỗ, đảo hàng khi hòa"? Vì <em>disposition effect</em> — bán lãi quá sớm, ôm lỗ quá lâu<sup class="ref">N</sup>. Gốc rễ là <em>loss aversion</em> của Kahneman: nỗi đau mất tiền mạnh ~2 lần niềm vui được<sup class="ref">N</sup>.</p>
</div>
```

- ✅ Gọn, lý thuyết phục vụ lập luận (không ngắt mạch).
- ✅ Mỗi cơ chế 1 callout → bài có nhịp "hiện tượng → giải thích tâm lý".
- ✅ Dùng cho bài dài nhiều cơ chế (như bài môi giới đa cấp).

### Pattern B — Chương riêng (chỉ khi cần)

Chỉ dùng khi: lý thuyết phức tạp cần giới thiệu đầy đủ trước khi áp dụng, hoặc bài giới thiệu 1 framework mới chưa phổ biến.

```html
<section id="chuong-ly-thuyet">
  <h2 class="section-title"><span class="num">X</span>Lăng kính lý thuyết</h2>
  <p>Giới thiệu khung lý thuyết đầy đủ...</p>
  <!-- rồi các chương sau mới áp dụng -->
</section>
```

- ❌ Tránh: bài ngắn mà tách chương lý thuyết → rời rạc, reader mất kết nối.
- ✅ Hầu hết trường hợp → **Pattern A rải callout** gọn hơn.

### Quy ước biểu tượng callout lý thuyết

| Biểu tượng | Nghĩa |
|---|---|
| 🧠 | Góc nhìn tâm lý học hành vi |
| 📐 | Góc nhìn lý thuyết kinh tế/tổ chức |
| 🧪 | Góc nhìn khoa học/thực nghiệm |
| 📚 | Nguồn học thuật |

→ Dùng `.callout info` (blue) cho callout lý thuyết, phân biệt với `.callout warn` (cảnh báo đỏ) và `.callout good` (tích cực).

## Tích hợp vào workflow chính

Bước fact-check lý thuyết này chèn **cùng cấp với Bước 5 (số liệu)**, chạy song song:

```
Bước 1: Outline + theme
Bước 2: Copy template + fill hero
Bước 3: Viết các section (kèm callout lý thuyết nếu phân tích hành vi)
Bước 4: Tài liệu tham khảo + minimap (thêm nhóm "Lý thuyết / Tâm lý học hành vi")
► Bước 5: Fact-check số liệu (fact_check.md)      ◄
► Bước 5b: Fact-check lý thuyết học thuật (file này) ◄  ← song song
Bước 6: Verify kỹ thuật (JS parse, Playwright)
```

**Khi nào BẮT BUỘC chạy Bước 5b:**
- Bài có **≥3 lý thuyết/bias** dẫn trong nội dung.
- Bài về **hành vi con người** (phải dùng tâm lý học hành vi / tài chính hành vi).
- User **đặt câu hỏi về 1 lý thuyết cụ thể** (dấu hiệu nên rà toàn bộ).
- Bài **kêu gọi tính chính xác học thuật** (giáo dục, chuyên ngành).
