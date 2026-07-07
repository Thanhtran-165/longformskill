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

### ⚠️ Khi nguồn là PDF tiếng Anh lớn hoặc sách

Khi user cung cấp tài liệu PDF tiếng Anh lớn (báo cáo nghiên cứu 100+ trang, sách, white paper) làm nguồn cho bài longform, **BẮT BUỘC thực hiện Bước 0 — Dịch & đối chiếu nguồn — TRƯỚC khi viết bài hoặc build bất kỳ output nào**. Bỏ qua bước này dẫn đến mismatch số liệu giữa các output (HTML vs PDF), sai baseline/glossary giữa chương, và phải sửa lại toàn bộ.

**Bước 0: Dịch & đối chiếu nguồn (BẮT BUỘC khi nguồn tiếng Anh lớn)**

1. **Trích text đầy đủ** từ PDF (`pdftotext -layout file.pdf out.txt`). Kiểm tra file output: ≥10.000 dòng = nguồn lớn, cần Bước 0 đầy đủ.
   - **Khi nguồn có bảng/biểu đồ/số liệu cần page-anchor** → dùng thêm **skill `pdf-evidence`** (xem Candidate A): `python3 ~/.zcode/skills/pdf-evidence/scripts/extract.py file.pdf --alias <alias> --json > source.extract.json`. Skill emit text + `table_id`/`chart_id` + `units`/`period` + `parse_confidence` **kèm page number cho từng snippet/bảng** — cái mà `pdftotext -layout` mất. Output này là nguồn evidence có page-anchor cho Bước 5d (đối chiếu nguồn PDF) và Bước 4 (citation có `[file, page, section, quote]` / `[file, page, table_id, row/col]`).
   - **Phân loại tài liệu** trước khi chọn extractor: `python3 ~/.zcode/skills/pdf-evidence/scripts/classify.py file.pdf` → nếu `doc_type_guess=scanned` → extract.py sẽ trả text rỗng → cần OCR ngoài (v0.3 chưa cài OCR; báo user).
2. **Lập bản đồ cấu trúc** (xem `references/source_mapping.md`) — đánh dòng bắt đầu/kết thúc từng chương, phần chính vs phụ, chương dài nhất/ngắn nhất. Dùng Agent Explore để map nhanh. Nếu đã có `source.extract.json` từ pdf-evidence → dùng page anchors thay vì line markers (chính xác hơn khi user thay đổi bản dịch).
3. **Dịch từng chương đầy đủ** — dùng **skill `vietnamese-document-translation-skill`** làm động cơ dịch chính. KHÔNG tóm tắt, KHÔNG dịch song song mà không review.
   - **Mode Decision trước khi dịch** (xem `adaptive_train_protocol.md` của skill dịch): tính novelty score → chọn `production_translation` (dịch nhanh, không patch) hoặc `train_skill` (dịch + học lỗi + patch termbase nếu gặp thuật ngữ/idiom mới).
   - Pipeline dịch 7 bước: intake → parsing → glossary (inject termbase 219 thuật ngữ) → translation → editorial (`financial_research_vi` mode mặc định cho tài chính/vĩ mô) → MQM review → post-edit.
   - **Nguyên tắc dịch ý không dịch chữ** giữ nguyên (xem `references/translation_vi.md` cho catalog lỗi thật đã gặp).
   - **Termbase override**: thuật ngữ đã có trong `termbase/finance_macro_en_vi.csv` của skill dịch → dùng gloss đó, KHÔNG tự đổi giữa các chương.
4. **Chạy `translation_check.py` trên mỗi chương** — script quét 8 nhóm lỗi (xem Bước 5c). Script là lớp lint tự động **bổ sung** cho MQM review của skill dịch, không thay thế.
5. **Đối chiếu số liệu chéo** — sau khi dịch, kiểm tra 20-30 con số chính xem nhất quán giữa các chương. Dùng Agent Explore: *"Đối chiếu TẤT CẢ con số then chốt giữa chương X và Y, báo MATCH/MISMATCH"*.
6. **Chỉ sau khi Bước 0 xong** → bắt đầu viết bài longform (Bước 1-7) hoặc build PDF output.

> ⚠️ **Pitfall thực tế** (xem Pitfall 10): Dịch 27 chương song song mà không đọc kỹ cấu trúc trước → mismatch số liệu (USD −85,3% thiếu, shadow gold 20.900 thiếu, silver 121 thiếu) → phải sửa lại sau khi build. Chi phí sửa sau = 3x chi phí dịch đúng ngay từ đầu. **Luôn Bước 0 trước.**

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


## `--quick` flag (v0.2 fix premortem — target audience-aware)

**Mặc định**: full pipeline (Bước 0-7 + 4 lớp fact-check).
**`--quick`**: skip Bước 0 (dịch PDF) + Bước 5b (academic) + Bước 5d (PDF verify). Giữ fact-check số liệu + QA.

```bash
/longform-report "chủ đề" --quick
# → Skip: Bước 0 (PDF dịch), 5b (academic theory), 5d (PDF cite verify)
# → Giữ: 5 (fact-check numbers), 5c (translation lint), 6 (QA), 7 (content verify)
# → Thời gian: ~30 phút (vs 60-90 phút full khi có PDF source)
```

**Khi nào `--quick`**:
- Bài tư duy/quantitative không cần PDF source
- Bài ngắn (<10 chương)
- User cần draft nhanh, sẽ review sâu sau
- Không có lý thuyết học thuật (skip 5b)

**Khi nào full**:
- Nguồn PDF tiếng Anh lớn (BẮT BUỘC Bước 0)
- Bài phân tích hành vi (BẮT BUỘC 5b academic)
- Publish chính thức

## Workflow 7 bước

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


## ⚠️ Template Clean Verify (v0.2 fix premortem — BẮT BUỘC)

Template `assets/article_template.html` phải **chỉ chứa tokens + structure**, KHÔNG chứa content từ sample reports trước.

### Verify trước khi copy template:

```bash
# Check template không có hardcoded content từ samples
grep -ciE "bdong|tien vixomo|trung quoc|giao duc|bao cao bds" assets/article_template.html
# Phải = 0

# Check template không có Oracle/ORCL/HPG/etc (cross-contamination)
grep -ciE "oracle|orcl|hpg|nemo|newmont|coteccons|ctd" assets/article_template.html
# Phải = 0

# Check chỉ có tokens + structure
grep -oE "{{[A-Z_0-9]+}}" assets/article_template.html | sort -u | wc -l
# Phải > 5 (có tokens để fill)
```

**Nếu template có hardcoded content**: DÙNG, tạo template sạch mới. KHÔNG copy template có content sample.

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
- **Page-anchored** (khi nguồn chính là PDF user cung cấp): mỗi `<li>` trong `ol.refs` kèm `[file/alias, page, section, quote]` (text claim) hoặc `[file, page, table_id/chart_id, row/col]` (bảng/biểu đồ) — lấy thẳng từ output của skill `pdf-evidence` (Bước 0). Xem `references/citations.md` "Page-anchored (PDF source)".

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

### Bước 5c: Hậu kỳ dịch Anh–Việt (BẮT BUỘC khi nguồn tiếng Anh)

Khi bài dịch/tổng hợp từ tài liệu tiếng Anh (báo cáo IGWT, báo CK quốc tế, vĩ mô), chạy bước này **trước** khi QA kỹ thuật. Có **2 lớp QA dịch** chạy song song:

- **Lớp 1 — Skill dịch `vietnamese-document-translation-skill`**: dùng `prompts/mqm_reviewer.md` (9 nhóm lỗi: accuracy/terminology/fluency/style/number_unit/named_entity/formatting/omission_addition/hallucination + severity Critical/Major/Minor) review từng section. Nếu MQM Weighted Score > 5/1.000 words hoặc có Critical → chạy `post_editor.md` sửa.
- **Lớp 2 — Script `translation_check.py`** (local lint): quét tự động 8 nhóm lỗi pattern cố định. Bổ sung cho MQM review, không thay thế.
- **Catalog lỗi thật + glossary + checklist** trong `references/translation_vi.md` (kế thừa từ các bài longform trước — IGWT, báo CK, vĩ mô).

**Quy trình 5 bước:**

1. **Chạy skill dịch MQM review** — với mỗi section có nguồn tiếng Anh, chạy `prompts/mqm_reviewer.md` (của `vietnamese-document-translation-skill`) trên cặp (source EN, translation VN). Output: JSON MQM report + translator's notes. Target: **MQM Weighted Score ≤ 5/1.000 words, 0 Critical, 0 hallucination**.
2. **Post-edit theo MQM report** — chạy `prompts/post_editor.md` (của skill dịch). Chỉ sửa lỗi được MQM flag, KHÔNG rewrite tự tiện (rule chống editorial overreach).
3. **Chạy script `scripts/translation_check.py`** — quét tự động 8 nhóm lỗi: thuật ngữ Anh không gloss, cụm kỳ quặc đã biết, câu dịch máy ("sự + V", "đã được + V", "về mặt + adj"), câu dài/gạch ngang, lặp từ, tag HTML sai, ký tự CJK/typo, idiom Mỹ-Âu không gloss.

   ```bash
   python3 "$SKILL_DIR/scripts/translation_check.py" {project}/{slug}/index.html
   # Exit: 0 = pass, 1 = warning (--strict), 2 = error (sửa trước khi done)
   ```

4. **Sửa tất cả error (exit 2)** — đây là lỗi thật: ký tự CJK lẫn vào, tag HTML sai (mở em/đóng strong), typo đã biết, cụm kỳ quặc trong catalog. **Không được bỏ qua**.
5. **Sửa warning ưu tiên** — gloss thiếu (thêm gloss tiếng Việt), idiom không gloss (thêm giải nghĩa), dịch máy (đổi câu chủ động). Lặp từ "vàng"/"tài sản" > 3 lần/đoạn là style, có thể bỏ qua.
6. **Đọc ý, không đọc chữ** (manual review) — script + MQM chỉ bắt được lỗi pattern cố định. Câu "dịch đúng từng chữ nhưng vẫn kỳ khi đọc" (vd "không phải mặc dù... mà chính vì...") cần đọc lại bằng mắt. Idiom/ẩn dụ Mỹ-Âu (Tom Hanks COVID, Wile E. Coyote, Mallorca towel) → gloss hoặc thay tương đương VN.
7. **Re-run script + MQM** cho đến khi 0 error, MQM ≤ 5, warning tối thiểu, rồi chạy QA Bước 6.

> ⚠️ **Giới hạn script**: chỉ bắt lỗi pattern cố định + cấu trúc. Câu "dịch đúng mà kỳ" cần người đọc cảm nhận — nếu user gửi đoạn tối nghĩa cụ thể, sửa từng cái chính xác (hiệu quả hơn quét tự động). **Ưu tiên đường A** (user review từng đoạn) cho chất lượng cuối.

> ⚠️ **Nguyên tắc gloss thuật ngữ**: thuật ngữ tài chính Anh (margin call, basis trade, Treasury, AISC) lần đầu xuất hiện phải có gloss tiếng Việt trong ngoặc, ví dụ "trái phiếu chính phủ Mỹ (Treasury)". Lần sau có thể giữ nguyên nếu đã phổ biến (ETF, stablecoin, margin call).

### Bước 5d: Đối chiếu nguồn PDF (BẮT BUỘC khi bài cite PDF có page)

Cùng cấp với Bước 5/5b/5c — chạy khi bài có claim dẫn nguồn từ PDF user cung cấp (báo cáo CK, IGWT, văn bản pháp lý, white paper). Củng cố Bước 5 bước 3 ("đối chiếu nguồn ngoài") cho trường hợp nguồn là **file PDF có page**, không phải URL.

**Khi nào BẮT BUỘC**:
- Bước 0 đã chạy `pdf-evidence/scripts/extract.py` → có `source.extract.json`; HOẶC
- Bài có ≥ 3 claim cite dạng `[file, page, section, quote]` hoặc `[file, page, table_id, row/col]`.

**Quy trình** (dùng **skill `pdf-evidence`** ở RUN mode):
1. Với mỗi 🔴-priority claim (số liệu tài chính, điều khoản pháp lý, dự báo) → yêu cầu pdf-evidence trả lời cùng câu hỏi trên cùng PDF, có citation theo page.
2. So sánh:
   - **MATCH** (claim trong bài + citation pdf-evidence trùng page + quote) → giữ.
   - **MISMATCH page** (claim đúng nhưng page sai) → sửa page theo pdf-evidence.
   - **MISMATCH value** (số liệu khác) → ưu tiên pdf-evidence nếu `parse_confidence ≥ 0.7`; nếu `parse_confidence < 0.7` → flag, không tự结论 (Pitfall 6 "không bịa số").
   - **ABSTAIN** (pdf-evidence trả `abstention_flag=true` hoặc `partial_abstentions[]` có claim đó) → claim không có evidence trong PDF → **xóa claim hoặc đánh dấu "không verify được"**. KHÔNG bịa source thay thế.
3. Forecast/dự báo: kiểm tra pdf-evidence đã khai báo horizon (F-FORECAST-001) — nếu bài trộn target/dự báo/khoảng xác suất không nhãn → sửa theo chính sách forecast của pdf-evidence.
4. Bảng/biểu đồ: citation bài phải có `table_id`/`chart_id` khi claim bắt nguồn từ visual (F-TABLE-001) — sửa nếu thiếu.

> ⚠️ pdf-evidence ở **RUN mode** không tự sửa skill (chỉ trả answer + citation + có thể ghi learning_candidate). Longform dùng output của pdf-evidence làm evidence; việc sửa bài longform là của Longform, không phải pdf-evidence.


### Bước 5e: Automated Number Citation Check (v0.2 fix premortem — BẮT BUỘC)

Fact-check Bước 5 = LLM manual. **Thêm script verify độc lập** — regex extract mọi số, flag số không có citation:

```bash
python3 scripts/verify_numbers.py {project}/{slug}/index.html
```

**Script spec:**
```python
import re, sys

html = open(sys.argv[1]).read()

# Extract mọi số ≥3 chữ số (bỏ ngày tháng 2 chữ số)
numbers = re.findall(r'(?<!\d)(\d{3,}[.,]?\d*)%?', html)

# Extract mọi <sup class="ref">N</sup> hoặc <a class="src">
cited = re.findall(r'class="(?:ref|src)"', html)

# Flag: số mà không có citation gần (trong cùng <p> hoặc <td>)
# → có thể chưa verify
uncited = []
for p in re.findall(r'<p[^>]*>.*?</p>', html, re.S):
    nums_in_p = re.findall(r'\d{3,}[.,]?\d*', p)
    has_cite = 'class="ref"' in p or 'class="src"' in p
    if nums_in_p and not has_cite:
        uncited.append(f"Paragraph có {len(nums_in_p)} số nhưng KHÔNG citation: {p[:80]}...")

if uncited:
    print(f"⚠️ {len(uncited)} paragraph có số liệu chưa cite nguồn:")
    for u in uncited[:5]:
        print(f"  {u}")
    print(f"  → Review manual: có phải số này cần citation không?")
else:
    print("✅ Mọi số liệu ≥3 chữ số đều có citation")
```

**Verdict**: WARNING (không BLOCK) — một số số không cần cite (vd số chương, số phần tr饵 mô tả). Nhưng flag cho review manual.

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


#### Canvas render verification (v0.2 fix premortem — QA mở rộng)

Ngoài check "canvas count = new Chart count", thêm check **canvas thực sự render** (không rỗng):

```javascript
// Trong qa_article.js — thêm check:
const canvases = document.querySelectorAll('canvas');
let emptyCanvases = 0;
for (const c of canvases) {
  try {
    const data = c.toDataURL();
    if (data.length < 1000) emptyCanvases++; // canvas rỗng hoặc fail render
  } catch(e) { emptyCanvases++; }
}
if (emptyCanvases > 0) {
  console.log(`⚠️ ${emptyCanvases}/${canvases.length} canvas có thể fail render`);
}
```

**Lý do**: Chart.js CDN fail offline → canvas rỗng nhưng QA PASS (canvas element tồn tại). Check `toDataURL` bắt được.

#### Citation mode consistency check (v0.2 fix premortem)

```bash
python3 -c "
import re
html = open('report.html').read()
ref_count = len(re.findall(r'class="ref"', html))
src_count = len(re.findall(r'class="src"', html))

if ref_count > 0 and src_count > 0:
    print(f'⚠️ MIXED citation modes: {ref_count} ref + {src_count} src')
    print('   → Nên dùng 1 mode duy nhất (numerated HOẶC plain, không mix)')
elif ref_count == 0 and src_count == 0:
    print('⚠️ NO citations found — bài có số liệu nhưng không cite?')
else:
    mode = 'numerated (ref)' if ref_count > 0 else 'plain (src)'
    print(f'✅ Citation mode consistent: {mode} ({max(ref_count, src_count)} citations)')
"
```

### Bước 7: Verify nội dung + báo cáo trung thực (BẮT BUỘC)

Sau khi Bước 6 (kỹ thuật) pass, **kiểm tra nội dung bằng công cụ** — KHÔNG đếm/suy đoán bằng đầu. Đây là bước chống ngụy tạo báo cáo (xem Pitfall 8).

```bash
# Kiểm tra nội dung bằng script, không suy đoán — vd đếm pattern có chart:
python3 -c "
import re
html=open('{project}/{slug}/index.html').read()
for sid,body in re.findall(r'<section id=\"([^\"]+)\"[^>]*>(.*?)</section>', html, re.S):
    # thay logic đếm theo loại nội dung cần verify
    has = 'class=\"pp\"' in body or 'class=\"ppb\"' in body
    print(f'{sid}: {\"✅\" if has else \"❌\"}')
"
```

**Quy tắc báo cáo hoàn thành (bắt buộc — xem Pitfall 8):**

1. **Kiểm tra thật bằng công cụ** trước khi viết câu "đã làm X". Đếm bằng `grep`/Python loop, KHÔNG đếm bằng đầu.
2. **Báo số liệu thật** — "15/22 mô hình, còn thiếu 7: [danh sách]" tốt hơn "gần hết". Còn thiếu = nói thẳng.
3. **Dán bằng chứng** (output lệnh) khi báo PASS / hoàn thành — không khẳng định suông.
4. **Phân biệt "đã làm" vs "chưa"** — không gộp kế hoạch vào kết quả.
5. **Khi user chỉ ra báo cáo sai** → kiểm tra lại bằng công cụ, công nhận, sửa, báo số thật. Không phòng thủ.

> ⚠️ Sai kỹ thuật sửa được. Sai số liệu sửa được. **Báo cáo ngụy tạo mất niềm tin vĩnh viễn.** Xem Pitfall 8.


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
| `pdf-evidence` | Evidence-first PDF QA (page citation + table/chart extraction + partial abstention) | **PDF engine** — Bước 0 (extract có page-anchor thay `pdftotext`), Bước 4 (citation `[file, page, section, quote]`), Bước 5d (đối chiếu nguồn PDF) |
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

### Pitfall 8 — ⚠️ Báo cáo sai sự thật / ngụy tạo kết quả (NGHIÊM TRỌNG)

❌ Báo cáo "đã làm X" hoặc "đạt Y%" mà **không kiểm tra thực tế bằng công cụ** — đây là lỗi nghiêm trọng nhất, phá vỡ lòng tin. Các dạng điển hình đã gặp:
- Báo "đã thêm đồ thị cho **tất cả** mô hình" khi thực tế chỉ làm **15/22** (68%) — vì đếm bằng đầu/suy đoán thay vì `grep`.
- Báo "QA PASS" nhưng bỏ qua bước QA, hoặc QA báo FAIL mà vẫn viết "PASS".
- Báo "tất cả số liệu đã fact-check" khi chỉ mới kiểm 2-3 con số.
- Báo "đã sửa lỗi" mà không chạy lại verify → lỗi vẫn còn.
- Khẳng định "100% bao phủ" / "không còn lỗi" mà không có bằng chứng kiểm tra được.

✅ **Nguyên tắc: KHÔNG BAO GIỜ báo cáo điều gì chưa kiểm tra được.** Mỗi câu "đã làm X" phải đi kèm **bằng chứng kiểm tra được** (output lệnh, số đếm từ `grep`/script, screenshot).

**Quy tắc bắt buộc khi báo cáo trạng thái hoàn thành:**

1. **Kiểm tra bằng công cụ trước khi viết** — KHÔNG đếm/suy đoán bằng đầu:
   - Báo "tất cả N mô hình có X" → phải chạy script đếm thực tế (vd Python loop qua sections), in ra danh sách, rồi mới báo.
   - Báo "QA PASS" → phải dán output QA thực tế, đọc dòng `Result:`.
   - Báo "đã sửa lỗi" → chạy lại verify để xác nhận lỗi hết.

2. **Báo theo số liệu thật, kể cả khi xấu:**
   - ✅ "Đã thêm 15/22 mô hình, còn thiếu 7: ch6, ch8, ch14..." — trung thực, có kế hoạch.
   - ❌ "Đã thêm đồ thị cho tất cả mô hình" — khi chỉ làm 68%.
   - Nếu còn thiếu/thất bại → **nói thẳng**, không che giấu bằng từ ngữ mập mờ ("gần hết", "phần lớn", "cơ bản xong").

3. **Phân biệt rõ "đã làm" vs "sẽ làm" vs "chưa làm":**
   - Không gộp kế hoạch vào kết quả. "Sẽ bổ sung" ≠ "đã bổ sung".
   - Khi user yêu cầu "làm X" → chỉ báo "đã làm X" khi X thật sự nằm trong file và đã verify.

4. **Khi phát hiện báo cáo trước đó sai → sửa ngay + xin lỗi:**
   - Nếu user chỉ ra báo cáo không khớp thực tế → kiểm tra lại bằng công cụ, công nhận sai, sửa file, báo lại số liệu thật. Không phòng thủ.

> ⚠️ **Đây là lỗi duy nhất khiến user mất niềm tin hoàn toàn** — hơn cả sai số liệu (số liệu sai có thể sửa), hơn cả lỗi kỹ thuật (lỗi có thể fix). Báo cáo ngụy tạo = phá vỡ hợp đồng tin cậy cốt lõi. **Luôn ưu tiên trung thực hơn là "có vẻ hoàn chỉnh".**

### Pitfall 9 — Dịch sát nghĩa sai ngữ cảnh / giữ nguyên tiếng Anh không gloss

❌ Dịch tài liệu tiếng Anh sang tiếng Việt mà **dịch đúng từng chữ nhưng sai ý** ("by the textbook, opposite effect" → "theo sách giáo khoa lẽ ra phải có tác dụng ngược" — tối nghĩa, người Việt không rõ "tác dụng ngược" theo chiều nào), hoặc **giữ nguyên thuật ngữ Anh không gloss** ("base tiền", "kìm bond", "vận hành mounting", "vô luận về giá", "rời cõi lý thuyết"). Cụm kỳ quặc / ẩn dụ Mỹ-Âu không gloss ("Tom Hanks COVID moment", "Wile E. Coyote", "domestique", "ai đặt khăn trước ghế tốt nhất"). → Bài đọc "kỳ", mất uy tín, đặc biệt bài tài chính chuyên ngành.

✅ (1) **Dịch ý, không dịch chữ** — đọc thành tiếng, câu nào nghe kỳ viết lại. (2) **Gloss thuật ngữ lần đầu** — "trái phiếu chính phủ Mỹ (Treasury)", "người chịu giá (price taker)"; lần sau có thể giữ Eng nếu phổ biến (ETF, stablecoin). (3) **Ẩn dụ/idiom** → gloss tiếng Việt trong ngoặc hoặc thay tương đương VN. (4) Chạy **Bước 5c: Hậu kỳ dịch** — skill dịch `vietnamese-document-translation-skill` (MQM review 9 nhóm lỗi) + script `translation_check.py` quét pattern cố định (xem `references/translation_vi.md` mục "Quét grep").

> ⚠️ **Quét grep có giới hạn** — chỉ bắt được lỗi pattern cố định (typo, từ Anh lai, "sự + V"). MQM review của skill dịch bắt lỗi ngữ nghĩa/terminology/number_unit sâu hơn nhưng cũng không thay thế người đọc. Câu "dịch đúng mà kỳ khi đọc" cần người đọc cảm nhận. Nếu user gửi đoạn tối nghĩa cụ thể → sửa từng cái chính xác (hiệu quả hơn quét tự động). **Ưu tiên đường A** (user review từng đoạn) cho chất lượng cuối.

→ Xem **Bước 5c** + skill `vietnamese-document-translation-skill` (termbase 219 thuật ngữ + 6 prompt MQM/post-edit) + catalog đầy đủ `references/translation_vi.md` (lỗi thật đã gặp + glossary thuật ngữ tài chính/vĩ mô/địa chính trị/học thuật).

### Pitfall 10 — ⚠️ Bỏ qua Bước 0 khi dịch PDF/sách tiếng Anh lớn

❌ Khi user cung cấp PDF tiếng Anh lớn (báo cáo 100+ trang, sách) làm nguồn, **bắt đầu viết bài hoặc build output ngay** mà không dịch & đối chiếu nguồn trước. Hậu quả thực tế đã gặp:
- **Mismatch số liệu giữa các output**: HTML ghi "USD −85,3%", PDF thiếu con số này → phải sửa sau khi build.
- **Glossary không nhất quán**: chương A dịch "Treasury = trái phiếu chính phủ Mỹ", chương B dịch "Kho bạc Mỹ" → trùng lặp/thái quá.
- **Số liệu thiếu**: chương dịch song song có thể bỏ sót con số (silver 121 USD, shadow gold 20.900) → phát hiện muộn khi user review.
- **Chi phí sửa sau = 3x**: phải rebuild PDF, re-deploy, đối chiếu lại toàn bộ.

✅ **Bước 0 — Dịch & đối chiếu nguồn TRƯỚC** (xem mục "Khi nguồn là PDF tiếng Anh lớn" ở đầu SKILL.md):
1. Trích text đầy đủ (`pdftotext -layout`).
2. Lập bản đồ cấu trúc (đánh dòng từng chương — xem `references/source_mapping.md`).
3. **Dịch từng chương bằng skill `vietnamese-document-translation-skill`** (pipeline 7 bước + adaptive mode decision), chạy `translation_check.py` lint bổ sung.
4. Đối chiếu số liệu chéo giữa các chương (20-30 con số chính).
5. **Chỉ sau khi Bước 0 xong** → viết bài hoặc build output.

> ⚠️ **Nguyên tắc**: Dịch sai ngay từ đầu tốn 1 lần sửa. Dịch vội rồi phát hiện muộn tốn 3 lần (sửa + rebuild + re-deploy + mất niềm tin user). **Luôn Bước 0 trước.**

## Tham khảo

- `assets/article_template.html` — Template CORE ({{TOKEN}} placeholder, hero + 2 section mẫu + minimap + presentation + JS).
- `references/components.md` — Catalog đầy đủ component (CORE + nâng cao `.fd`/`.rl`/`.ptl`/`.sources`/glossary) + checklist.
- `references/chart_recipes.md` — Recipe Chart.js 4.4.1 (bar/line/radar/mixed) cho dark theme.
- `references/themes.md` — Family Amber/Blue + bảng hero gradient mood theo chủ đề.
- `references/navigation.md` — Cơ chế minimap + progress + presentation + đồng bộ section.
- `references/citations.md` — 2 chế độ trích nguồn (numerated vs plain) + khi nào chọn.
- `references/fact_check.md` — ⭐ **Hậu kiểm số liệu**: quy trình 4 bước + checklist mâu thuẫn nội bộ + đối chiếu nguồn + 6 bẫy điển hình + script rà soát. Chạy Bước 5 trước khi verify kỹ thuật.
- `references/academic_foundations.md` — ⭐ **Nền tảng học thuật + fact-check lý thuyết**: catalog lý thuyết tâm lý học hành vi / tài chính hành vi / kinh tế học (Kahneman, Cialdini, Shefrin, Dunning-Kruger...) với nguồn gốc verify + quy trình Bước 5b. Bắt buộc cho bài phân tích hành vi.
- `references/translation_vi.md` — ⭐ **Hậu kỳ dịch Anh–Việt**: catalog lỗi dịch thật (dịch sát sai ngữ cảnh, từ vựng Anh không gloss, cụm kỳ quặc, ẩn dụ Mỹ-Âu, dấu hiệu dịch máy) + glossary thuật ngữ tài chính/vĩ mô/địa chính trị/học thuật + script grep quét lỗi + checklist. Chạy Bước 5c khi nguồn tiếng Anh. **Bổ sung cho skill `vietnamese-document-translation-skill`** (skill dịch = động cơ dịch + MQM review; file này = catalog lỗi thật đã gặp cụ thể cho longform).
- `references/source_mapping.md` — ⭐ **Bản đồ cấu trúc nguồn**: quy trình lập bản đồ dòng bắt đầu/kết thúc từng chương khi dịch PDF/sách tiếng Anh lớn. Chạy Bước 0 trước khi dịch bất kỳ chương nào. Bỏ qua → mismatch số liệu, glossary không nhất quán, chi phí sửa 3x.
- `scripts/translation_check.py` — ⭐ **Script hậu kỳ dịch**: quét tự động 8 nhóm lỗi dịch (gloss thiếu, cụm kỳ quặc, dịch máy, câu dài, lặp từ, tag HTML, CJK, idiom không gloss). Exit 0/1/2. Chạy Bước 5c — **lớp lint bổ sung** cho MQM review của skill `vietnamese-document-translation-skill`, không thay thế.
- `scripts/qa_article.js` — Playwright QA (8 check: token/structure/sections/chart/nav/errors/screenshots).

**Skill phụ thuộc (load khi cần)**:
- `vietnamese-document-translation-skill` (`~/.zcode/skills/vietnamese-document-translation-skill/`) — ⭐ **Động cơ dịch Anh→Việt chính** cho Bước 0 + Bước 5c. Pipeline 7 bước (intake→parsing→glossary→translation→editorial→MQM→post-edit) + adaptive mode decision (production vs train) + termbase 219 thuật ngữ tài chính/vĩ mô/vàng + 6 prompt (intake/glossary/translator/editorial 5 mode/mqm_reviewer 9 nhóm lỗi/post_editor). Khi gặp tài liệu Anh lớn → invoke skill này thay vì dịch ad-hoc.
- `pdf-evidence` (`~/.zcode/skills/pdf-evidence/`) — ⭐ **PDF engine chính** cho Bước 0 + Bước 5d. Evidence-first QA với citation bắt buộc `[file, page, section, quote]` / `[file, page, table_id/chart_id, row/col]`, partial abstention (`partial_abstentions[]`), table/chart extraction có `parse_confidence` + `table_uncertainty_disclosure`, forecast-horizon disclosure (F-FORECAST-001). Scripts: `scripts/extract.py` (extract có page-anchor + table_id), `scripts/classify.py` (digital/scanned/table/legal/financial). 3 mode RUN/TRAIN/RELEASE — longform chỉ dùng RUN mode (pdf-evidence không tự sửa skill). Khi nguồn là PDF có bảng/số liệu cần page-anchor → invoke `extract.py` thay vì chỉ `pdftotext`.


> ⚠️ **Context budget** (v0.2 fix premortem): 5 sample reports có thể hàng MB. Khi LLM đọc skill, **KHÔNG mở sample reports** — chỉ đọc `references/components.md` cho pattern snippets. Samples ở đường dẫn máy tác giả, **KHÔNG load vào context** khi build bài mới. Nếu cần xem pattern cụ thể → đọc snippet trong references, không mở full HTML.

## ⭐ Pitfall 8 — Anti-fake-reporting (CROSS-SKILL PATTERN — port sang mọi skill)

> **Đây là rule mạnh nhất chống "ảo giác AI"** — recommend port sang TẤT CẢ skill khác.

### Rule cốt lõi (áp dụng mọi skill):

1. **KHÔNG BAO GIỜ báo cáo điều gì chưa kiểm tra được** — mỗi câu "đã làm X" phải có bằng chứng (grep output, script result, screenshot)
2. **Báo theo số liệu thật, kể cả khi xấu** — "15/22 done, còn thiếu 7" tốt hơn "gần hết"
3. **Phân biệt "đã làm" vs "sẽ làm"** — không gộp kế hoạch vào kết quả
4. **Khi phát hiện sai → sửa + xin lỗi** — không phòng thủ

### Skills cần port Pitfall 8:
- ✅ longform-report (source)
- ⬜ equity-research-vn (recommend add)
- ⬜ us-equity-research (recommend add)
- ⬜ vn-rates-weekly (recommend add)
- ⬜ vn-macro-monthly (recommend add)

**Nguồn pattern thực tế** (báo cáo mẫu tham khảo — đường dẫn ví dụ trên máy tác giả, người dùng khác thay bằng báo cáo của mình):
- `~/ZCodeProject/bdong-tien/index.html` — pattern Amber family + flow diagram `.fd`.
- `~/ZCodeProject/ttck-trung-quoc/index.html` — pattern Blue family + glossary panel.
- `~/ZCodeProject/bao-cao-bds-trung-quoc.html` — pattern policy timeline `.ptl` + risk list `.rl`.
- `~/ZCodeProject/giao-duc-trung-quoc.html` — pattern obligation grid.
- `~/ZCodeProject/boom-tien-vixomo/index.html` — pattern vĩ mô/tiền tệ.
