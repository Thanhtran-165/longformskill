# Bản đồ cấu trúc nguồn — cho PDF/sách tiếng Anh lớn

Dùng trong **Bước 0: Dịch & đối chiếu nguồn** (xem SKILL.md). Khi user cung cấp PDF tiếng Anh lớn (báo cáo 100+ trang, sách, white paper), lập bản đồ cấu trúc TRƯỚC khi dịch bất kỳ chương nào.

> ⚠️ **Khi nào dùng**: nguồn tiếng Anh ≥10.000 dòng text (sau `pdftotext`), hoặc ≥20 chương. Nguồn nhỏ hơn không cần.

## Mục lục

- [Quy trình lập bản đồ](#quy-trình-lập-bản-đồ)
- [Cấu trúc bản đồ](#cấu-trúc-bản-đồ)
- [Script tạo bản đồ tự động](#script-tạo-bản-đồ-tự-động)
- [Ví dụ thực tế — IGWT 2026](#ví-dụ-thực-tế--igwt-2026)

---

## Quy trình lập bản đồ

### Bước 1: Trích text đầy đủ

```bash
pdftotext -layout source.pdf /tmp/source.txt
wc -l /tmp/source.txt  # ≥10.000 dòng = nguồn lớn, cần bản đồ
```

#### Tuỳ chọn 1b — Trích có page-anchor bằng skill `pdf-evidence` (khuyên dùng khi có bảng/số liệu)

`pdftotext -layout` mất page number, table structure, chart markers. Khi bài longform sẽ cite số liệu/bảng từ PDF → chạy thêm `pdf-evidence/scripts/extract.py`:

```bash
# Phân loại trước
python3 ~/.zcode/skills/pdf-evidence/scripts/classify.py source.pdf
# → doc_type_guess: digital_text | scanned | mixed | table_heavy | legal | financial | academic | ...

# Extract có page-anchor + table_id/chart_id + units/period + parse_confidence
python3 ~/.zcode/skills/pdf-evidence/scripts/extract.py source.pdf --alias <alias> --json > /tmp/source.extract.json
```

Output `source.extract.json` schema (v0.2.0+):
```json
{
  "schema_version": "0.2.0",
  "pages": [
    {"page": 7, "text": "...", "tables": [
      {"table_id": "p7.t1", "page": 7, "headers": [...], "rows": [...],
       "units": "tỷ VNĐ", "period": "Q1/2026", "parse_confidence": 1.0,
       "table_uncertainty_disclosure": false}
    ], "charts": [
      {"chart_id": "p7.c1", "page": 7, "parse_confidence": 0.4,
       "table_uncertainty_disclosure": true}
    ]}
  ]
}
```

**Lợi ích so với `pdftotext`**:
- Mỗi snippet/bảng có **page number** → Bước 5d verify từng số tới page được.
- Bảng có `headers` + `units` + `period` + `parse_confidence` → biết bảng nào parse chắc, bảng nào cần verify thủ công (`table_uncertainty_disclosure=true`).
- `table_id`/`chart_id` dùng cho citation format page-anchored (`references/citations.md`).
- `doc_type_guess=scanned` → extract.py trả text rỗng → cần OCR ngoài (v0.3 chưa cài OCR; báo user).

**Khi nào bỏ qua 1b**: nguồn PDF thuần text không có bảng/biểu đồ/số liệu cần page-anchor → `pdftotext` đủ.

### Bước 2: Tìm marker chương

Dùng Agent Explore để grep tiêu đề chương:
- Tìm "Chapter", "Chương", số La Mã (I, II, III...), số Ả Rập (1, 2, 3...)
- Tìm tên chương đặc thù (vd "Introduction", "Conclusion", "About")
- Tìm page marker (vd "TRANG NGUỒN X/464", footer trang)

### Bước 3: Lập bảng dòng bắt đầu/kết thúc

Cho mỗi chương, ghi:
- **STT** + **Tên chương** (Anh + VN dự kiến)
- **Dòng bắt đầu** + **dòng kết thúc** trong text
- **Số dòng** (đo độ dài tương đối)
- **Phần chính vs phụ** (cần dịch hay bỏ qua)

### Bước 4: Phân loại ưu tiên

- **Lô 1** (chương ngắn <600 dòng): test workflow, dịch nhanh
- **Lô 2** (chương vừa 600-1500 dòng): dịch chính
- **Lô 3** (chương dài >1500 dòng): chia nhỏ hoặc dịch theo section

---

## Cấu trúc bản đồ

Format bảng (Markdown):

| STT | Tên chương (Anh) | Tên chương (VN dự kiến) | Dòng bắt đầu | Dòng kết thúc | Số dòng | Loại |
|---|---|---|---:|---:|---:|---|
| 0 | Introduction | Lời giới thiệu | 234 | 1315 | 1081 | Chính |
| 1 | Status Quo of Gold | Hiện trạng vàng | 1316 | 2077 | 761 | Chính |
| ... | ... | ... | ... | ... | ... | ... |
| — | About Us | Về chúng tôi | 30007 | 30075 | 68 | Phụ |

**Loại**: "Chính" = cần dịch đầy đủ; "Phụ" = bỏ qua hoặc hậu kiểm nhẹ (About us, Premium Partner, Disclaimer).

---

## Script tạo bản đồ tự động

```python
#!/usr/bin/env python3
"""Tự động phát hiện marker chương trong text nguồn."""
import re

text = open('/tmp/source.txt').read()
lines = text.split('\n')

# Pattern marker chương
patterns = [
    r'^\s*(?:Chapter|Chương)\s+(\d+)',  # "Chapter 1" / "Chương 1"
    r'^\s*(\d+)\.\s+[A-Z]',              # "1. Title"
    r'^\s*(I{1,3}|IV|V|VI{0,3})\.\s+',   # "I. Title" (La Mã)
    r'^\s*(Introduction|Conclusion|About|References|Appendix)\b',
]

markers = []
for i, line in enumerate(lines, 1):
    for pat in patterns:
        if re.match(pat, line, re.I):
            markers.append((i, line.strip()[:80]))
            break

print(f"Tìm thấy {len(markers)} marker chương:")
for line_num, text in markers:
    print(f"  Dòng {line_num}: {text}")
```

---

## Ví dụ thực tế — IGWT 2026

Bản đồ cấu trúc In Gold We Trust 2026 (460 trang, 30.275 dòng):

| STT | Chương (Anh) | Chương (VN) | Bắt đầu | Kết thúc | Dòng |
|---|---|---|---:|---:|---:|
| 0 | Introduction | Lời giới thiệu | 234 | 1315 | 1081 |
| 1 | Status Quo of Gold | Hiện trạng vàng | 1316 | 2077 | 761 |
| 2 | Gold vs Assets | Vàng so tài sản | 2078 | 2896 | 818 |
| 3 | Status Quo of Debt | Hiện trạng nợ | 2897 | 4393 | 1496 |
| 4 | Inflation Dynamics | Động lực lạm phát | 4394 | 6254 | 1860 |
| 5 | Supply/Demand | Cung cầu vàng | 6255 | 7775 | 1520 |
| 6 | Renaissance of Allocation | Phục hưng phân bổ | 7776 | 9896 | 2120 |
| 7 | Two Systems One World | Hai hệ thống | 9897 | 11228 | 1331 |
| 8 | Gromen vs Tindale | Gromen tranh biện | 11229 | 11668 | 439 |
| 9 | End of USD Standard | Kết thúc chuẩn USD | 11669 | 12852 | 1183 |
| 10 | Mackinder Heartland | Heartland Mackinder | 12853 | 13792 | 939 |
| 11 | Six Vectors | Sáu vector | 13793 | 14624 | 831 |
| 12 | Judy Shelton | Judy Shelton | 14625 | 15139 | 514 |
| 13 | Tokenization | Token hóa | 15140 | 15662 | 522 |
| 14 | Tether | Tether | 15663 | 17450 | 1787 |
| 15 | Psychology | Tâm lý | 17451 | 18636 | 1185 |
| 16 | India | Ấn Độ | 18637 | 20164 | 1527 |
| 17 | Commodity Beta | Beta hàng hóa | 20165 | 21567 | 1402 |
| 18 | Bitcoin | Bitcoin | 21568 | 23003 | 1435 |
| 19 | Silver | Bạc | 23004 | 24306 | 1302 |
| 20 | AI Mining | AI khai thác | 24307 | 24822 | 515 |
| 21 | Innovate or Terminate | Đổi mới hoặc kết thúc | 24823 | 25447 | 624 |
| 22 | Corporate Gold Standard | Tiêu chuẩn vàng doanh nghiệp | 25448 | 26114 | 666 |
| 23 | Problem Child to Model Student | Từ vấn đề đến gương mẫu | 26115 | 27326 | 1211 |
| 24 | Technical Analysis | Phân tích kỹ thuật | 27327 | 28294 | 967 |
| 25 | Quo Vadis Aurum | Vàng đi về đâu | 28295 | 30006 | 1711 |
| — | About Us | Về chúng tôi | 30007 | 30075 | 68 | Phụ |
| — | Premium Partner | Đối tác cao cấp | 30076 | 30275 | 199 | Phụ |

**Phần chính**: dòng 234 → 30006 (~29.773 dòng, 98,3%).
**Chương dài nhất**: Renaissance of Allocation (2.120 dòng).
**Chương ngắn nhất**: Gromen debate (439 dòng).

---

## Sau khi có bản đồ

1. **Chia lô dịch** theo độ dài (Lô 1: ngắn, Lô 2: vừa, Lô 3: dài).
2. **Dịch từng chương** theo nguyên tắc `references/translation_vi.md`.
3. **Chạy `translation_check.py`** trên mỗi chương.
4. **Đối chiếu số liệu chéo** giữa các chương (20-30 con số chính).
5. **Chỉ sau khi tất cả chương dịch xong + đối chiếu** → viết bài longform hoặc build PDF output.
