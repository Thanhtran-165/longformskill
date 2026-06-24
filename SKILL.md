---
name: longform
description: Báo cáo tự nghiên cứu dạng article HTML dài (15-40 chương, Chart.js + minimap + chế độ trình chiếu) tổng hợp từ 5 mẫu thực tế (bdong-tien, ttck-trung-quoc, bao-cao-bds-trung-quoc, giao-duc-trung-quoc, boom-tien-vixomo). Use khi người dùng yêu cầu "viết bài research dài", "báo cáo article", "longform", "longform report", "tự nghiên cứu chuyên sâu", "phân tích nhiều chương", "báo cáo dạng article", hoặc khi cần bài dài nhiều chương với dark theme + chart + mục lục + trình chiếu. Cốt lõi = template HTML self-contained (CORE components + Chart.js + nav kit + refs) + workflow 5 bước + QA Playwright. (Alias: /longform-report)
---

# Longform Report

Báo cáo tự nghiên cứu dạng **article HTML dài** — 15-40 chương, dark theme slate-900, Chart.js charts, minimap TOC, progress bar, và chế độ trình chiếu (slideshow). Tổng hợp pattern từ 5 báo cáo thực tế đã làm, tái sử dụng được cho **bất kỳ chủ đề nào** (tài chính VN, kinh tế Trung Quốc, giáo dục, xã hội...).

## Điều kiện tiên quyết

Không phụ thuộc skill khác. Input cần:
- **Chủ đề** bài (VD: "BĐS dòng tiền", "Thị trường chứng khoán TQ 2015", "Giáo dục đại học TQ").
- **Số chương** dự kiến + **dàn ý** sơ bộ (user cung cấp hoặc brainstorm cùng AI).
- **Nguồn số liệu** (optional — có thì tốt, không có vẫn viết được bài tư duy/quantitative).

Bổ sung tốt khi có:
- `vn-news-digest` — thời sự 30 ngày cho enrich số liệu VN.
- `vn-macro-monthly` — context vĩ mô nếu bài về kinh tế VN.
- `vn-research-dashboard` — KHÔNG thay thế — dashboard là equity 1 cổ phiếu, longform-report là bài tư duy nhiều chương.

## Hai trục phân tích (nguyên tắc cốt lõi)

Mọi phân tích trong bài longform phải đứng vững trên **hai trục song song**:

| Trục | Nghĩa | Kiểm chứng |
|---|---|---|
| **1. Số liệu thật** | Mỗi con số (tỷ lệ, số tiền, ngày hiệu lực, chỉ số BCTC) có nguồn cụ thể, đối chiếu được — không bịa, không "ước tính" trá hình. | Bước 5: Fact-check số liệu (`references/fact_check.md`) |
| **2. Học thuật thật** | Mỗi khung giải thích/lý thuyết dẫn nguồn gốc (tác giả, tác phẩm, năm, cơ quan ban hành) — không khẩu hiệu "theo nghiên cứu", không bịa tên lý thuyết. | Bước 4.5b: Fact-check lý thuyết học thuật (`references/academic_foundations.md`) |

> ⚠️ **Bài "tự nghiên cứu" mà thiếu một trong hai trục = mất uy tín.** Bài quan sát hiện tượng mà không có khung lý thuyết giải thích → chỉ là ý kiến cá nhân. Bài dẫn lý thuyết mà sai tên/sai tác giả/sai nội dung → còn tệ hơn không dẫn.

### Khi nào bắt buộc có nền tảng học thuật

Không phải bài nào cũng cần lý thuyết — nhưng **các loại bài sau bắt buộc phải có khung học thuật** (để biến "quan sát" thành "giải thích vì sao"):

- Bài phân tích **hành vi con người** (nhà đầu tư, tiêu dùng, nhân viên) → bắt buộc dùng **tâm lý học hành vi** (behavioral psychology) hoặc **tài chính hành vi** (behavioral finance). Xem catalog `references/academic_foundations.md`.
- Bài phân tích **cơ chế / nhân quả** (tại sao X dẫn đến Y) → cần lý thuyết kinh tế / tổ chức / động lực học.
- Bài **chính sách pháp lý** → cần dẫn văn bản gốc (đã có trong fact-check số liệu).
- Bài **lịch sử / sự kiện** → cần nguồn chính thống + đối chiếu ngày tháng.

### Cách tích hợp lý thuyết vào bài (không tách rời)

**Rải vào lập luận** (ưu tiên) — mỗi cơ chế/hiện tượng kèm 1 callout nhỏ "🧠 Góc nhìn tâm lý / 📐 Góc nhìn lý thuyết" giải thích bias/lý thuyết tương ứng. Lý thuyết hòa vào dòng chảy lập luận, không thành chương lý thuyết riêng tẻ.

```html
<div class="callout info">
  <h4>🧠 Góc nhìn tâm lý — <tên bias></h4>
  <p><giải thích bias đời thường + ví dụ VN cụ thể>.<sup class="ref">N</sup></p>
</div>
```

**Khi nào tách chương riêng**: chỉ khi lý thuyết phức tạp cần 1 chương giới thiệu đầy đủ trước khi áp dụng (vd bài giới thiệu 1 framework mới). Hầu hết trường hợp → **rải callout** gọn hơn.

## Workflow 6 bước

### Bước 1: Xác định outline + theme (BẮT BUỘC)

Trước khi viết, chốt 3 thứ:

1. **Dàn ý chương** — số chương + tiêu đề từng chương + nhóm minimap (thường 3-5 group: "Mở đầu", "Phân tích chính", "Case study", "Kết").
2. **Family theme** — Amber (bài tự nghiên cứu/nhân quả, num badge glow) vs Blue (bài policy/dữ liệu, tone down). Xem `references/themes.md`.
3. **Hero gradient mood** — 1 dòng CSS theo chủ đề (BĐS-nóng, TQ-cyan, giáo dục-rêu...). Xem `references/themes.md` cho bảng mood.

```
User: /longform-report "BĐS dòng tiền VN" 15 chương
  ↓
Outline: Mở đầu (1) · 7 đánh tráo (7) · Phân tích CFO (3) · 5 case (2) · Kết (2)
Family: Amber (tự nghiên cứu cá nhân)
Mood: nâu đất-navy (#422006 → #1e3a8a → #312e81)
Citation mode: Numerated (bài dài nhiều số liệu)
```

### Bước 2: Copy template + fill hero/meta

```bash
# SKILL_DIR = thư mục chứa skill này (longform-report). Phụ thuộc trình cài đặt:
#   - Codex/ZCode: ${CODEX_HOME:-$HOME/.codex}/skills/longform-report
#     (ZCode mặc định: $HOME/.zcode/skills/longform-report)
# Thay $SKILL_DIR bằng đường dẫn thực tế trên máy bạn.
mkdir -p {project}/{slug}/
cp "$SKILL_DIR/assets/article_template.html" {project}/{slug}/index.html
```

Replace placeholder bằng nội dung thật (string replace đơn giản — không f-string):

```bash
# Tokens cần fill (xem references/components.md cho danh sách đầy đủ):
# {{HERO_TITLE}}  {{BADGE}}  {{HERO_SUB}}
# {{UPDATE_DATE}}  {{META_SCOPE}}  {{META_CHAPTERS}}
# {{FOOTER_TITLE}}
```

→ Xem `references/components.md` cho **Placeholder tokens** section — danh sách đầy đủ + ví dụ.

### Bước 3: Viết các section

Mỗi chương = 1 `<section>`. Pattern:

```html
<section id="chuong-N">
  <h2 class="section-title"><span class="num">N</span>Tiêu đề chương</h2>
  <p>Đoạn mở đầu...</p>
  <!-- Component theo nhu cầu: kpi-grid / compare / callout / chart-box / timeline / tbl -->
</section>
```

Recipe HTML từng component trong `references/components.md`. Chart recipe (bar/line/radar/mixed) trong `references/chart_recipes.md`.

**Tone — "Người kể chuyện số liệu, KHÔNG cho ý kiến"** (kế thừa từ `vn-macro-monthly`):

| ❌ Tránh | ✅ Làm |
|---|---|
| "BĐS dòng tiền là lừa đảo" | "Trong 5 case nghiên cứu, 2 case có dòng tiền âm sau khi trừ nợ vay — tỷ lệ 40%" |
| "Nhà đầu tư nên tránh" | "DSCR < 1.0 xuất hiện ở 2/5 case, nghĩa là tài sản không tự nuôi nổi nợ vay" |

### Bước 4: Tài liệu tham khảo + minimap

**Tài liệu tham khảo** — chọn 1 trong 2 chế độ (xem `references/citations.md`):

- **Numerated** (`.ref` + `ol.refs`): bài dài nhiều số liệu, cần truy nguồn. `<sup class="ref">N</sup>` inline + `ol.refs` cuối bài.
- **Plain** (`.src` + `.sources`): bài policy tổng hợp, link dotted inline + list không đánh số.

**Minimap** — đồng bộ với sections (3 chỗ phải khớp — xem `references/navigation.md`):
1. `<section id="X">` trong body.
2. `<a href="#X">` trong đúng minimap group.
3. `SLIDES[]` entry trong script presentation (nếu muốn slide cho section đó).

### Bước 5: Fact-check số liệu (BẮT BUỘC cho bài nhiều số liệu)

Sau khi viết xong, **trước khi verify kỹ thuật** — rà soát toàn bộ số liệu trong bài. Bài "tự nghiên cứu" sai số liệu = mất uy tín, nhất là khi kêu gọi người đọc đối chiếu báo cáo công ty chứng khoán.

**Khi nào BẮT BUỘC chạy bước này:**
- Bài có **≥10 con số** (ngày/tỷ lệ/số tiền/Điều luật).
- Bài về **chính sách pháp luật** (ngày hiệu lực, Điều khoản — sai là nghiêm trọng).
- Bài **kêu gọi đối chiếu báo cáo CK** (phải chính xác hơn bài thường).
- User đặt **câu hỏi về 1 con số cụ thể** (dấu hiệu nên rà toàn bộ).

**Quy trình 4 bước** (chi tiết + checklist + script rà soát tự động → `references/fact_check.md`):

1. **Trích xuất toàn bộ claim định lượng** — text + chart data (JavaScript). Dùng Agent Explore: *"Trích xuất TẤT CẢ claim có con số, ghi số dòng + claim + loại."*
2. **Phát hiện mâu thuẫn nội bộ** — grep các từ khóa số liệu, xem có chỗ nào bài tự mâu thuẫn không (cùng 1 chỉ số nhiều giá trị, số chương hero vs slide, chart data vs text...). Không cần search ngoài.
3. **Đối chiếu nguồn ngoài cho claim quan trọng** — theo thứ tự ưu tiên: văn bản pháp luật chính thức → báo cáo CK → báo chính thống → nguồn quốc tế (Wikipedia/Reuters). Khi không verify được → **không bịa số**, dùng range hoặc ghi rõ thời điểm nguồn.
4. **Sửa + verify lại** — sửa text + chart data (phải cùng bộ số), chạy lại QA Bước 6.

> ⚠️ **Bẫy thường gặp** (xem đầy đủ `references/fact_check.md`): gán nhầm nguồn cho con số ("theo chuẩn Basel"), gộp lộ trình nhiều văn bản vào 1, dùng số liệu cũ làm "hiện tại", nhầm tháng sự kiện quốc tế, mâu thuẫn chart data vs text.

### Bước 5b: Fact-check lý thuyết học thuật (BẮT BUỘC khi bài có lý thuyết)

Cùng cấp với Bước 5 — chạy song song. Bài dẫn lý thuyết mà sai tên/sai tác giả/sai nội dung còn tệ hơn không dẫn. **Trục "học thuật thật"** yêu cầu mỗi lý thuyết phải verify từ nguồn gốc.

**Khi nào BẮT BUỘC chạy bước này:**
- Bài có **≥3 lý thuyết/bias** dẫn trong nội dung.
- Bài về **hành vi con người** (phải dùng tâm lý học hành vi / tài chính hành vi).
- User **đặt câu hỏi về 1 lý thuyết cụ thể** (dấu hiệu nên rà toàn bộ).
- Bài **kêu gọi tính chính xác học thuật** (giáo dục, chuyên ngành).

**Quy trình 4 bước** (chi tiết + catalog lý thuyết → `references/academic_foundations.md`):

1. **Trích xuất mọi claim lý thuyết** — tên lý thuyết + tác giả + nội dung tóm tắt. Dùng Agent Explore: *"Trích xuất TẤT CẢ claim về lý thuyết/bias/khái niệm học thuật, ghi số dòng + tên + tác giả được nhắc."*
2. **Phát hiện sai/nhầm nguồn** — kiểm tra: tên lý thuyết có đúng không? Tác giả đúng người không? Số liệu minh họa (vd "loss aversion ~2:1") có đúng không?
3. **Đối chiếu nguồn gốc học thuật** — theo thứ tự ưu tiên: tác phẩm gốc (sách/journal) → Wikipedia (xác nhận tên + tác giả) → Investopedia/Cornell LII (cho khái niệm). **Không dẫn "theo nghiên cứu..." mà không có tên cụ thể.**
4. **Sửa + thêm vào refs** — mỗi lý thuyết phải có entry riêng trong `ol.refs` (nhóm "Lý thuyết / Tâm lý học hành vi"), với link tới nguồn gốc.

> ⚠️ **Bẫy thường gặp** (xem `references/academic_foundations.md`): (1) gán nhầm tác giả (Cialdini vs Kahneman cho "thuyết triển vọng"); (2) sai số liệu minh họa (loss aversion ~2:1, không phải 3:1); (3) nhầm năm tác phẩm (Kahneman *Thinking Fast and Slow* 2011, không phải 2002 — 2002 là năm nhận Nobel); (4) bịa tên bias không tồn tại; (5) dẫn "6 nguyên tắc Cialdini" mà quên nguyên tắc thứ 7 (Unity, bản cập nhật 2016).

### Bước 6: Verify kỹ thuật (BẮT BUỘC)

```bash
# 1. JS syntax check — extract <script> ra file tạm, node --check
# 2. No raw placeholder
grep -oE "{{[A-Z_0-9]+}}" {project}/{slug}/index.html | sort -u
# Phải trả EMPTY.

# 3. Canvas count = new Chart count
grep -c "<canvas" {project}/{slug}/index.html
grep -c "new Chart" {project}/{slug}/index.html
# Phải bằng nhau.

# 4. Playwright QA (install 1 lần: npm install playwright --prefix /tmp/qa-runner && npx playwright install chromium)
node "$SKILL_DIR/scripts/qa_article.js" \
  --url=file://{project}/{slug}/index.html \
  --output=/tmp/qa-shots
# Phải trả "✅ PASS" hoặc "⚠️ PASS WITH WARNINGS".
```

Exit code: `0` = pass, `1` = warnings, `2` = errors (sửa trước khi done).

## Style guide

**Dark theme cố định** — slate-900 (`#0f172a`) nền + 6 accent ngữ nghĩa (red=tiêu cực, amber=accent chính, green=tích cực, blue/violet/cyan=info). KHÔNG đổi `:root` — đổi family/mood qua `references/themes.md`.

**Typography quy ước:**
- `<strong>` = trắng đậm (emphasis).
- `<em>` = **vàng highlight, KHÔNG in nghiêng** — đây là quy ước của template, dùng cho thuật ngữ/số liệu nhấn mạnh.
- `<a class="src">` = link dotted blue.

**Component density:** Mỗi chương nên có 2-4 component xen kẽ (vd: p → kpi-grid → chart-box → callout) — tránh toàn text dài đơn điệu.

**Chart:**
- Luôn setup `Chart.defaults` ở đầu `<script>` đầu tiên.
- Dùng `rgba(R,G,B,.65)` cho fill, hex cho border/point.
- **KHÔNG dùng doughnut/pie** — khó đọc ở dark theme, dùng bar.
- Mixed chart: line `order:1`, bar `order:2` (line trên, không bị che).
- Tooltip callback dùng `function(c){...}` KHÔNG dùng arrow `c => ...`.

## Phối hợp hệ sinh thái skill

| Skill | Vai trò | Relation |
|---|---|---|
| `longform-report` (skill này) | Bài tự nghiên cứu/tư duy dài nhiều chương | Core |
| `vn-research-dashboard` | Equity dashboard 1 cổ phiếu | KHÁC — dashboard = 1 cổ phiếu ngắn, longform = nhiều chương tư duy |
| `vn-macro-monthly` | Báo cáo vĩ mô VN hàng tháng | Enrich — số liệu vĩ mô làm context cho bài tài chính VN |
| `vn-news-digest` | Thời sự 30 ngày | Enrich — số liệu sự kiện gần cho bài VN |
| `imagegen` | Tạo cover image | Optional — hero image cho bài quan trọng |

## Pitfalls thực tế

### Pitfall 1 — Inline `a.src` rải rác khó truy nguồn

❌ Đặt `<a class="src">` sau mỗi số liệu inline → đoạn văn rối, không có index truy nguồn.
✅ Bài dài nhiều số liệu → dùng **chế độ numerated** (`<sup class="ref">N</sup>` + `ol.refs`). Bài policy tổng hợp ngắn → mới dùng plain `.src`.

→ Xem `references/citations.md` "Khi nào chọn cái nào".

### Pitfall 2 — Chart.js CDN fail offline

❌ Mở file không có mạng → chart trống, KHÔNG có lỗi console (im lặng fail).
✅ Bài quan trọng → download `chart.umd.min.js` local, đổi `<script src>` thành relative path. Hoặc thêm `<noscript>` fallback text "Cần kết nối mạng để hiển thị chart".

### Pitfall 3 — Presentation `SLIDES` không đồng bộ section

❌ Thêm/bớt section nhưng quên update `SLIDES[]` → trình chiếu thiếu/thừa slide, hoặc slide trỏ section đã xóa.
✅ Verify sau khi sửa section:
```bash
grep -c "type:'section'" {project}/{slug}/index.html  # số slide section
grep -c '<section ' {project}/{slug}/index.html        # số section
# Slide section nên ≈ số section chính (không tính refs/footer).
```

→ Xem `references/navigation.md` "Đồng bộ khi thêm/xóa section".

### Pitfall 4 — Sót `{{TOKEN}}` placeholder

❌ Quên replace 1 token (vd `{{META_CHAPTERS}}`) → hiển thị raw `{{META_CHAPTERS}}` trên trang đã publish.
✅ Luôn chạy `grep -oE "{{[A-Z_0-9]+}}" report.html | sort -u` trước khi done — phải trả EMPTY. QA script Check 1 cũng bắt được.

### Pitfall 5 — `gcount` minimap sai

❌ Thêm/xóa `<li>` trong group nhưng quên update `<span class="gcount">N</span>` → badge số sai.
✅ Verify: `gcount` = số `<li>` trong group đó.

### Pitfall 6 — Mâu thuẫn số liệu nội bộ + sai nguồn

❌ Bài tự nghiên cứu có **hàng chục con số** nhưng không rà soát trước publish → 9 kiểu lỗi điển hình (xem `references/fact_check.md` "Các bẫy điển hình"): (1) gán nhầm nguồn ("theo chuẩn Basel 30%"); (2) gộp lộ trình nhiều văn bản; (3) dùng số liệu cũ làm "hiện tại"; (4) nhầm tháng sự kiện quốc tế; (5) cùng 1 chỉ số nhiều giá trị không phân biệt; (6) mâu thuẫn chart data vs text; (7) **che giấu nội suy/mô phỏng dưới vỏ "ước tính" trong chart**; (8) **dùng data tài sản không minh bạch (BĐS VN, coin OTC) như data chính thức**; (9) **dùng data quốc tế (S&P 500) cho bài VN**. Sai số liệu = mất uy tín ngay, nhất khi bài kêu gọi đối chiếu báo cáo CK.

✅ Chạy **Bước 5: Fact-check số liệu** trước khi verify kỹ thuật. Tối thiểu: (1) trích xuất toàn bộ claim định lượng (text + chart data); (2) grep mâu thuẫn nội bộ; (3) đối chiếu nguồn ngoài cho claim 🔴 quan trọng theo thứ tự ưu tiên (văn bản luật → báo CK → báo chính thống → nguồn quốc tế); (4) khi không verify được → **không bịa số**, dùng range/ghi rõ thời điểm nguồn; (5) **mỗi điểm chart phải biết rõ data thực hay nội suy** — ghi rõ trong label; (6) **check tài sản có index/data minh bạch không** trước khi dùng (BĐS VN/coin OTC = không).

### Pitfall 7 — Thiếu nền tảng học thuật / dẫn lý thuyết sai

❌ Bài phân tích hành vi người/cơ chế nhân quả mà **chỉ quan sát hiện tượng** ("môi giới đa cấp dụ dỗ nhà đầu tư") → chỉ là ý kiến, không giải thích được *vì sao* cơ chế đó hiệu quả. Hoặc dẫn lý thuyết mà **sai nguồn**: gán Kahneman cho "thuyết thuyết phục", nhầm "6 nguyên tắc Cialdini" (thực ra 7, có Unity), bịa bias không tồn tại, sai số liệu minh họa ("loss aversion 3:1" — thực ra ~2:1).

✅ (1) Mỗi phân tích về hành vi → có khung **tâm lý học hành vi / tài chính hành vi** giải thích cơ chế. (2) Mỗi lý thuyết dẫn → verify từ **nguồn gốc** (tác phẩm gốc + tác giả + năm) trước khi viết. (3) Rải lý thuyết vào callout "🧠 Góc nhìn tâm lý" trong từng cơ chế, không tách chương riêng trừ khi cần. (4) Mỗi lý thuyết có entry riêng trong `ol.refs`.

→ Xem **Bước 5b: Fact-check lý thuyết học thuật** + catalog `references/academic_foundations.md`.

## Tham khảo

- `assets/article_template.html` — Template CORE ({{TOKEN}} placeholder, hero + 2 section mẫu + minimap + presentation + JS).
- `references/components.md` — Catalog đầy đủ component (CORE + nâng cao `.fd`/`.rl`/`.ptl`/`.sources`/glossary) + checklist.
- `references/chart_recipes.md` — Recipe Chart.js 4.4.1 (bar/line/radar/mixed) cho dark theme.
- `references/themes.md` — Family Amber/Blue + bảng hero gradient mood theo chủ đề.
- `references/navigation.md` — Cơ chế minimap + progress + presentation + đồng bộ section.
- `references/citations.md` — 2 chế độ trích nguồn (numerated vs plain) + khi nào chọn.
- `references/fact_check.md` — ⭐ **Hậu kiểm số liệu**: quy trình 4 bước + checklist mâu thuẫn nội bộ + đối chiếu nguồn + 6 bẫy điển hình + script rà soát. Chạy Bước 5 trước khi verify kỹ thuật.
- `references/academic_foundations.md` — ⭐ **Nền tảng học thuật + fact-check lý thuyết**: catalog lý thuyết tâm lý học hành vi / tài chính hành vi / kinh tế học (Kahneman, Cialdini, Shefrin, Dunning-Kruger...) với nguồn gốc verify + quy trình Bước 5b. Bắt buộc cho bài phân tích hành vi.
- `scripts/qa_article.js` — Playwright QA (8 check: token/structure/sections/chart/nav/errors/screenshots).

**Nguồn pattern thực tế** (báo cáo mẫu tham khảo — đường dẫn ví dụ trên máy tác giả, người dùng khác thay bằng báo cáo của mình):
- `~/ZCodeProject/bdong-tien/index.html` — pattern Amber family + flow diagram `.fd`.
- `~/ZCodeProject/ttck-trung-quoc/index.html` — pattern Blue family + glossary panel.
- `~/ZCodeProject/bao-cao-bds-trung-quoc.html` — pattern policy timeline `.ptl` + risk list `.rl`.
- `~/ZCodeProject/giao-duc-trung-quoc.html` — pattern obligation grid.
- `~/ZCodeProject/boom-tien-vixomo/index.html` — pattern vĩ mô/tiền tệ.
