# Longform Report — Skill

Skill tạo **báo cáo tự nghiên cứu dạng article HTML dài** (15–40 chương): dark theme, Chart.js charts, minimap mục lục, progress bar và chế độ trình chiếu (slideshow). Tổng hợp pattern từ 5 báo cáo thực tế, tái sử dụng được cho **bất kỳ chủ đề nào** — tài chính VN, kinh tế Trung Quốc, giáo dục, xã hội...

Mỗi bài đều đứng trên **hai trục song song**:
- **Số liệu thật** — mỗi con số có nguồn, đối chiếu được (Bước 5).
- **Học thuật thật** — mỗi lý thuyết dẫn đúng tác giả/năm/nội dung gốc (Bước 5b).

> Đây là gói skill dành cho các agent (Codex / ZCode / Codex CLI...). Trong agent, skill được gọi qua `/longform-report` (alias `/longform`).

---

## Cấu trúc

```
longformskill/
├── SKILL.md                          # Workflow 6 bước + style guide + pitfalls
├── assets/
│   └── article_template.html         # Template CORE self-contained ({{TOKEN}} placeholder)
├── references/
│   ├── components.md                 # Catalog component (CORE + nâng cao) + checklist
│   ├── chart_recipes.md              # Recipe Chart.js 4.4.1 (bar/line/radar/mixed) cho dark theme
│   ├── themes.md                     # Family Amber/Blue + bảng hero gradient mood
│   ├── navigation.md                 # Minimap + progress + presentation + đồng bộ section
│   ├── citations.md                  # 2 chế độ trích nguồn (numerated vs plain)
│   ├── fact_check.md                 # ⭐ Hậu kiểm số liệu (trục "số liệu thật")
│   └── academic_foundations.md       # ⭐ Nền tảng học thuật + fact-check lý thuyết (trục "học thuật thật")
├── scripts/
│   └── qa_article.js                 # Playwright QA (8 check: token/structure/sections/chart/nav/errors/screenshots)
└── agents/
    └── openai.yaml                   # UI metadata (display_name, short_description, default_prompt)
```

---

## Cài đặt

Skill là một thư mục chứa `SKILL.md` + các tài nguyên đi kèm. Đặt vào thư mục skills mà agent quét:

### ZCode
```bash
git clone git@github.com:Thanhtran-165/longformskill.git \
  ~/.zcode/skills/longform-report
```

### Codex / Codex CLI
```bash
git clone git@github.com:Thanhtran-165/longformskill.git \
  "${CODEX_HOME:-$HOME/.codex}/skills/longform-report"
```

> ⚠️ **Tên thư mục phải là `longform-report`** để các lệnh copy template / chạy QA dùng `$SKILL_DIR` hoạt động đúng (xem phần *Đường dẫn* bên dưới).

Không cần build, không cần dependency ngoài — trừ khi chạy QA script:

```bash
npm install playwright --prefix /tmp/qa-runner
npx playwright install chromium
```

---

## Đường dẫn & portability

`SKILL.md` dùng biến `$SKILL_DIR` (thư mục chứa skill) cho mọi lệnh tham chiếu file nội bộ:

```bash
cp "$SKILL_DIR/assets/article_template.html" {project}/{slug}/index.html
node "$SKILL_DIR/scripts/qa_article.js" --url=file://{project}/{slug}/index.html --output=/tmp/qa-shots
```

- **ZCode**: `$SKILL_DIR` = `~/.zcode/skills/longform-report`
- **Codex**: `$SKILL_DIR` = `${CODEX_HOME:-~/.codex}/skills/longform-report`
- Nếu skill nằm chỗ khác → đặt `SKILL_DIR` bằng đường dẫn thực tế trên máy.

---

## Cách dùng (trong agent)

```
/longform-report "BĐS dòng tiền VN" 15 chương
```

Workflow 6 bước (agent tự chạy theo `SKILL.md`):

| Bước | Việc | Bắt buộc |
|---|---|---|
| 1 | Chốt outline + theme (family Amber/Blue, hero mood) | ✅ |
| 2 | Copy template + fill hero/meta tokens | ✅ |
| 3 | Viết các section (component density 2–4/chương) | ✅ |
| 4 | Tài liệu tham khảo + đồng bộ minimap (3 chỗ khớp nhau) | ✅ |
| **5** | **Fact-check số liệu** — trích claim định lượng → grep mâu thuẫn nội bộ → đối chiếu nguồn ngoài | ✅ (bài có ≥10 con số) |
| **5b** | **Fact-check lý thuyết học thuật** — tên/tác giả/năm/nội dung, chạy song song Bước 5 | ✅ (bài phân tích hành vi, ≥3 lý thuyết) |
| 6 | Verify kỹ thuật (JS parse, canvas count, Playwright QA) | ✅ |

**Tone cốt lõi:** *"Người kể chuyện số liệu, KHÔNG cho ý kiến"* — mô tả quan sát và tỷ lệ, không khuyên mua/bán.

---

## Hai trục chất lượng

| Trục | File | Đối tượng | Khi nào bắt buộc |
|---|---|---|---|
| **Số liệu thật** | `references/fact_check.md` | con số, ngày, tỷ lệ, Điều luật, chỉ số BCTC | Bài có ≥10 con số / bài pháp luật / bài kêu gọi đối chiếu báo cáo CK |
| **Học thuật thật** | `references/academic_foundations.md` | tên lý thuyết, tác giả, năm tác phẩm, số liệu minh họa | Bài phân tích hành vi người / bài cơ chế nhân quả / ≥3 lý thuyết |

Catalog lý thuyết đã verify sẵn trong `academic_foundations.md` (Kahneman, Cialdini, Shefrin & Statman, Dunning-Kruger, Festinger...) — kèm link nguồn gốc để copy đúng tên + tác giả + năm.

---

## Phối hợp hệ sinh thái skill (optional)

| Skill | Vai trò | Relation |
|---|---|---|
| `vn-macro-monthly` | Số liệu vĩ mô VN hàng tháng | Enrich context cho bài tài chính VN |
| `vn-news-digest` | Thời sự 30 ngày | Enrich số liệu sự kiện gần |
| `vn-research-dashboard` | Equity dashboard 1 cổ phiếu | KHÁC — dashboard = 1 cổ phiếu ngắn, longform = nhiều chương tư duy |
| `imagegen` | Tạo cover image | Optional — hero image cho bài quan trọng |

---

## License

Cung cấp nguyên mục đích chia sẻ / tái sử dụng. Bạn tự chịu trách nhiệm về tính chính xác của số liệu và lý thuyết trong các bài báo cáo mình tạo ra (skill có sẵn quy trình fact-check ở Bước 5 & 5b — hãy chạy nó).
