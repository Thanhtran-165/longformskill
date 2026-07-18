# Longform Report — Skill (2 mode: article + atlas)

Skill tạo **báo cáo tự nghiên cứu HTML** với **2 mode** tùy theo nhu cầu:

| Mode | Khi nào | Tech | Output |
|------|---------|------|--------|
| **article** (mặc định) | Bài tư duy dài 15-40 chương, đọc tuần tự | Chart.js + minimap TOC + trình chiếu | 1 file HTML self-contained |
| **atlas** (mới) | Interactive research atlas/dashboard, nhiều view, multi-chart, data tách rời | SPA + hash router + ECharts/Cytoscape/SVG + JSON data | SPA + data/ + dist/ build self-contained |

## Khi nào chọn mode nào?

- **Article**: "bài research dài", "phân tích chương", "báo cáo" → đọc tuần tự như sách.
- **Atlas**: "atlas", "dashboard research", "bản đồ ngành", "interactive" → click đổi view, data nhiều bảng quan hệ.

Mỗi sản phẩm đều đứng trên **hai trục song song**:
- **Số liệu thật** — mỗi con số có nguồn, đối chiếu được (Bước 5 / A3).
- **Học thuật thật** — mỗi lý thuyết dẫn đúng tác giả/năm/nội dung gốc (Bước 5b).

> Đây là gói skill dành cho các agent (Codex / ZCode / Codex CLI...). Trong agent, skill được gọi qua `/longform-report` (alias `/longform`).

---

## So sánh 2 mode

| Khía cạnh | Article | Atlas |
|---|---|---|
| **Output** | 1 file HTML self-contained (~50-200 KB) | SPA + data/ + dist/index.html (~500KB-1MB) |
| **Architecture** | HTML dài có section tuần tự | SPA shell + hash router + lazy render |
| **Chart library** | Chart.js | ECharts + Cytoscape + custom SVG |
| **Theme** | Dark-only (slate-900 + 6 accent) | Dark/light parity (`[data-theme]` + CSS variable) |
| **Data** | Nhồi trong `<script>` HTML | JSON tách rời + validate + build script |
| **QA** | 8 check Playwright (qa_article.js) | 9 check (qa_atlas.js) + validate data 5 gate |
| **Pitfall đã gặp** | 10 (số liệu, lý thuyết, dịch, báo cáo ngụy tạo...) | + 5 atlas-specific (session note, router, theme parity, dead code, dangling refs) |
| **Mẫu tham chiếu** | bdong-tien, ttck-trung-quoc, bao-cao-bds-trung-quoc, giao-duc-trung-quoc, boom-tien-vixomo | china-ai-industrial-atlas, global-ai-industry-atlas |
| **Chia sẻ** | 1 file → gửi email/deploy tĩnh | URL shareable (`#/route/param`) hoặc self-contained build |

---

## Cấu trúc

```
longformskill/
├── SKILL.md                          # Header "Chọn mode" + Workflow 7 bước article + Workflow A1-A7 atlas + 15 pitfall
├── assets/
│   ├── article_template.html         # Template CORE article self-contained ({{TOKEN}} placeholder)
│   └── atlas_template/               # ⭐ MỚI — Template SPA atlas kickoff tối thiểu
│       ├── index.html                # Shell CSS Grid 3 vùng + hash router + 3 view mẫu
│       ├── styles.css                # Tokens + dark/light parity + view primitives + chart wrapper
│       └── app.js                    # IIFE + el() + Promise.all loadData + renderRoute dispose-first
├── references/
│   ├── components.md                 # Article: Catalog component (CORE + nâng cao)
│   ├── chart_recipes.md              # Article: Recipe Chart.js 4.4.1 cho dark theme
│   ├── themes.md                     # Article: Family Amber/Blue + bảng hero gradient mood
│   ├── navigation.md                 # Article: Minimap + progress + presentation
│   ├── citations.md                  # Article: 2 chế độ trích nguồn (numerated vs plain)
│   ├── fact_check.md                 # Article: ⭐ Hậu kiểm số liệu (trục "số liệu thật")
│   ├── academic_foundations.md       # Article: ⭐ Nền tảng học thuật + fact-check lý thuyết
│   ├── translation_vi.md             # Article: ⭐ Hậu kỳ dịch Anh–Việt
│   ├── source_mapping.md             # Article: ⭐ Bản đồ cấu trúc nguồn PDF
│   ├── atlas_architecture.md         # ⭐ MỚI — Atlas: SPA + router + state + el() + dispose + dark/light
│   ├── atlas_charts.md               # ⭐ MỚI — Atlas: ECharts + Cytoscape + 4 SVG builders + chartWrapper
│   ├── atlas_data_schema.md          # ⭐ MỚI — Atlas: 13 file schema + tier A/B/C + confidence 4 mức
│   └── atlas_build_pipeline.md       # ⭐ MỚI — Atlas: build.js + validate 5 gate + check-links
├── scripts/
│   ├── qa_article.js                 # Article: Playwright QA (8 check)
│   ├── translation_check.py          # Article: Hậu kỳ dịch lint
│   ├── qa_atlas.js                   # ⭐ MỚI — Atlas: Playwright QA (9 check) + JS syntax all files + router + dark/light
│   └── validate_atlas_data.js        # ⭐ MỚI — Atlas: Schema validate 5 gate + dangling ref
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

### Mode ARTICLE (mặc định)

```
/longform-report "BĐS dòng tiền VN" 15 chương
```

Workflow 7 bước article (agent tự chạy theo `SKILL.md`):

| Bước | Việc | Bắt buộc |
|---|---|---|
| 1 | Chốt outline + theme (family Amber/Blue, hero mood) | ✅ |
| 2 | Copy template + fill hero/meta tokens | ✅ |
| 3 | Viết các section (component density 2–4/chương) | ✅ |
| 4 | Tài liệu tham khảo + đồng bộ minimap (3 chỗ khớp nhau) | ✅ |
| **5** | **Fact-check số liệu** — trích claim định lượng → grep mâu thuẫn nội bộ → đối chiếu nguồn ngoài | ✅ (bài có ≥10 con số) |
| **5b** | **Fact-check lý thuyết học thuật** — tên/tác giả/năm/nội dung, chạy song song Bước 5 | ✅ (bài phân tích hành vi, ≥3 lý thuyết) |
| 6 | Verify kỹ thuật (JS parse, canvas count, Playwright QA) | ✅ |

### Mode ATLAS (mới)

```
/longform-report atlas "Bản đồ ngành AI Việt Nam"
```

Workflow 7 bước atlas (A1-A7):

| Bước | Việc | Bắt buộc |
|---|---|---|
| **A1** | Chốt schema data (JSON files) + view (routes) | ✅ |
| **A2** | Copy template atlas (`atlas_template/`) + setup project | ✅ |
| **A3** | Viết data layer theo schema + chạy `validate_atlas_data.js` (5 gate) | ✅ |
| **A4** | Viết views + charts (mỗi chart 4 thành phần: title+takeaway+source+confidence) | ✅ |
| **A5** | Build self-contained (`build_atlas.js` → dist/index.html) | optional |
| **A6** | QA atlas (`qa_atlas.js` — 9 check: JS syntax/router/chart/dangling/dark-light) | ✅ |
| **A7** | Verify nội dung bằng công cụ (không đếm bằng đầu) | ✅ |

**Tone cốt lõi (cả 2 mode):** *"Người kể chuyện số liệu, KHÔNG cho ý kiến"* — mô tả quan sát và tỷ lệ, không khuyên mua/bán.

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
