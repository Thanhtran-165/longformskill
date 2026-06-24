# Fact-check — Hậu kiểm số liệu & phát hiện mâu thuẫn

Bước **sau khi viết xong, trước khi publish**. Bài tự nghiên cứu dài (15-40 chương) thường chứa **hàng chục con số** (ngày ban hành, tỷ lệ %, số Điều, số liệu BCTC, số tiền, sự kiện lịch sử). Sai số liệu trong bài "tự nghiên cứu" = mất uy tín ngay — đặc biệt khi bài kêu gọi người đọc đối chiếu với báo cáo công ty chứng khoán.

> Rút từ session thực tế: bài TT 25/2026 phát hiện **6 nhóm lỗi** chỉ sau khi user đặt câu hỏi "Basel là 30 hay 40%?" — chứng tỏ không có bước hậu kiểm số liệu trong workflow cũ.

## Mục lục

- [Quy trình 4 bước](#quy-trình-4-bước)
- [Checklist phát hiện mâu thuẫn nội bộ](#checklist-mâu-thuẫn)
- [Đối chiếu nguồn khi có mâu thuẫn](#đối-chiếu-nguồn)
- [Các bẫy điển hình (từ case thực tế)](#các-bẫy-điển-hình)
- [Script rà soát tự động](#script-rà-soát)

---

<a id="quy-trình-4-bước"></a>
## Quy trình 4 bước

### Bước 1 — Trích xuất toàn bộ claim định lượng

Đọc lại file HTML **đã viết xong**, trích xuất TẤT CẢ claim có chứa con số. Không chỉ text — **chart data trong JavaScript cũng chứa số liệu** (data array), phải kiểm tra cả.

Phân loại theo 6 nhóm:

| Nhóm | Ví dụ | Độ ưu tiên fact-check |
|---|---|---|
| **Ngày ban hành/hiệu lực** văn bản luật | "TT 25/2026 ban hành 22/06/2026, hiệu lực 01/07/2026" | 🔴 Cao |
| **Tỷ lệ %** (tỷ lệ an toàn, CAR, NIM, room tín dụng...) | "CAR ≥ 8%", "NIM VPBank 5,43%" | 🔴 Cao |
| **Số Điều/khoản** pháp luật | "Điều 16.5", "35 Điều", "4 Điều" | 🔴 Cao |
| **Số liệu BCTC** ngân hàng/doanh nghiệp | NIM, LDR, tỷ lệ vốn ngắn hạn từng NH | 🟡 Trung bình |
| **Sự kiện lịch sử** (ngày tháng) | "SCB 10/2022", "Three Red Lines 8/2020", "Evergrande thanh lý 29/01/2024" | 🟡 Trung bình |
| **Số tiền/quy mô/tăng trưởng** | "GDP VN 430 tỷ USD", "gói 120.000 tỷ", "tăng trưởng 15%" | 🟡 Trung bình |

> 💡 Dùng Agent (Explore) để trích xuất nhanh — prompt: *"Trích xuất TẤT CẢ claim có con số/ngày/định lượng trong file X, ghi số dòng + claim + loại. Đọc cả chart data trong JavaScript."*

### Bước 2 — Phát hiện mâu thuẫn nội bộ (xem [Checklist](#checklist-mâu-thuẫn))

Trước khi đối chiếu nguồn ngoài, **dò mâu thuẫn trong chính bài** — đây là lỗi dễ bắt nhất, không cần search.

### Bước 3 — Đối chiếu nguồn ngoài cho các claim quan trọng (xem [Đối chiếu](#đối-chiếu-nguồn))

Web search cross-check với nguồn chính thức cho **top claim** (ưu tiên nhóm 🔴).

### Bước 4 — Sửa + verify lại

Sau khi sửa text + chart data, chạy lại QA (Playwright + JS parse) — sửa số liệu có thể vô tình break chart (thêm/bớt phần tử mảng, dấu ngoặc).

---

<a id="checklist-mâu-thuẫn"></a>
## Checklist phát hiện mâu thuẫn nội bộ

**Chạy grep các từ khóa số liệu, xem có chỗ nào bài tự mâu thuẫn không:**

```bash
FILE="{project}/{slug}/index.html"

# 1. Cùng một chỉ số nhưng nhiều giá trị khác nhau xuất hiện
#    VD: room tín dụng xuất hiện 14% chỗ này, 15% chỗ khác, 18% chỗ khác
grep -nE "room.{0,30}(14|15|18)%|~14%|~15%" "$FILE"

# 2. Số chương/section khớp nhau ở các nơi khai báo
grep -nE "chương phân tích|[0-9]+ chương" "$FILE"
grep -c '<section ' "$FILE"   # so sánh với số khai báo

# 3. Số Điều/khoản văn bản — kiểm tra khai báo ở nhiều chỗ
grep -nE "Điều [0-9]+|[0-9]+ Điều|[0-9]+ Chương" "$FILE"

# 4. Số tiền lớn (gói tín dụng, GDP...) có nhất quán
grep -nE "[0-9]{3}\.[0-9]{3} tỷ|[0-9]+ tỷ USD|[0-9]+ tỷ đồng" "$FILE"

# 5. Ngày ban hành/hiệu lực của cùng văn bản
grep -nE "TT [0-9]+/[0-9]+|Nghị định [0-9]+|[0-9]{2}/[0-9]{2}/[0-9]{4}" "$FILE"
```

**Quy tắc phát hiện mâu thuẫn:**

| Dấu hiệu mâu thuẫn | Ví dụ thực tế | Cách xử lý |
|---|---|---|
| **Cùng 1 chỉ số, nhiều giá trị** | Room tín dụng: 14% (chương XVI) vs 15% (chương XXII) vs 18% (SSI) | Phân biệt rõ: "chỉ tiêu NHNN ~15%" vs "dự phóng SSI ~18%" |
| **Số chương sai giữa hero vs slide** | Hero "26 chương", slide title "22 chương" | Đếm thực tế `<section>` → thống nhất 1 con số |
| **Chart data mâu thuẫn text** | Text "lộ trình 40→30%", chart data `[60,55,50,45,40]` | Chart và text phải cùng bộ số |
| **Ref meta cũ hơn claim mới** | Ref #16 ghi "83 tỷ giải ngân 2023", nhưng text dùng số 2025 | Cập nhật ref meta hoặc ghi rõ thời điểm số liệu |
| **LDR/NIM giới hạn range không khớp** | "NIM tư nhân 3,8-4,2%" nhưng bảng có VPBank 5,43% | Mở rộng range hoặc sửa mô tả |
| **Chart mốc nội suy che giấu** | Chart "1928-2025" 8 mốc, nhưng chỉ đầu/cuối có data, giữa là nội suy | Ghi "nội suy" trong label trục + giảm mốc xuống chỉ giữ data thực |
| **Tài sản không có data minh bạch** | "Yield căn hộ HCM 3%" nhưng BĐS VN không có index chính thức | Loại bỏ số cụ thể, hoặc dùng line nét đứt + cảnh báo mô phỏng |
| **Sai bản chất tài sản** | "Vàng yield 7%/năm" — vàng không có yield cố định | Phân loại đúng: tài sản dòng tiền (yield) vs tài sản tăng vốn |
| **Data quốc tế trong bài VN** | Chart S&P 500 cho bài tài chính VN, ref trỏ Damodaran nhưng data VN | Ưu tiên data VN (VN-Index, SJC, CPI, SBV) — check ref khớp data |

---

<a id="đối-chiếu-nguồn"></a>
## Đối chiếu nguồn khi có mâu thuẫn

Khi phát hiện claim **không chắc** hoặc **mâu thuẫn**, đối chiếu theo thứ tự ưu tiên nguồn:

### Thứ tự ưu tiên nguồn (tài chính VN)

1. **Văn bản pháp luật chính thức** — thuvienphapluat.vn, luatvietnam.vn, vbpl.vn, sbv.gov.vn (NHNN), chinhphu.vn. **Gold standard cho ngày ban hành/hiệu lực/Điều khoản.**
2. **Báo cáo công ty chứng khoán** — SSI Research, VNDIRECT, VCBS, BSC, MBS, HSC, Fiigroup. **Cho số liệu BCTC ngân hàng, dự phóng ngành.**
3. **Báo chính thống VN** — VnExpress, CafeF, Vietstock, VnEconomy, Dân trí, Nhân Dân, Tạp chí Ngân hàng. **Cho số liệu sự kiện gần.**
4. **Nguồn quốc tế** — Wikipedia (cho sự kiện lịch sử như Evergrande/Three Red Lines), Reuters/Bloomberg, BIS (cho chuẩn Basel). **Cross-check cho claim quốc tế.**

### Quy tắc đối chiếu

- **Ngày ban hành/hiệu lực văn bản** → chỉ tin văn bản chính thức (nhóm 1). Báo chí có thể sai vài ngày.
- **Tỷ lệ % quy định** → đọc trực tiếp văn bản (nhóm 1). Đừng tin "theo chuẩn Basel 30%" nếu không cite được điều khoản BIS cụ thể.
- **Số liệu BCTC ngân hàng** → cross-check 2 nguồn (báo CK + báo chính thống). Nếu chênh >5%, ưu tiên báo CK có cite BCTC.
- **Sự kiện lịch sử quốc tế** (Three Red Lines, Evergrande...) → Wikipedia + Reuters, **kiểm tra tháng/năm chính xác** (dễ nhầm 8/2020 vs 12/2020).

### Khi không rõ nguồn → QUAN TRỌNG

> **Không bịa số thay thế.** 3 lựa chọn an toàn:
> 1. **Ghi rõ thời điểm + nguồn** — "số liệu đầu giai đoạn 2023 (NhaDauTu), đến 2025 cập nhật X"
> 2. **Dùng range thay vì số chính xác** — "giải ngân dưới 1%" thay vì "0,07%" khi không chắc
> 3. **Xóa claim nếu không verify được** — an toàn hơn đưa số sai

---

<a id="các-bẫy-điển-hình"></a>
## Các bẫy điển hình (từ case thực tế TT 25/2026)

### Bẫy 1 — Gán nhầm nguồn cho con số

❌ *"Giữ 40% = nới hơn chuẩn Basel"* (gán 30% là "chuẩn Basel")
✅ **Basel III không có 30%/40%.** Đó là quy định riêng VN. Basel giải quyết qua NSFR ≥100%.

**Bài học:** Khi viết "theo chuẩn X", phải cite được điều khoản/thông số cụ thể của chuẩn đó. Không gán nhãn nguồn cho con số nếu không verify.

### Bẫy 2 — Lộ trình thuộc văn bản nào?

❌ *"TT 22/2019 lộ trình 60%→30%"* (sai — 60% là của TT 06/2016 cũ)
✅ TT 22/2019 ban hành 2019 đã áp dụng 40% ngay từ 2020 (giảm 40→37→34→31→30%). Con số 60% là của văn bản **trước đó**.

**Bài học:** Con số "lộ trình" phải gắn với **văn bản cụ thể ban hành năm nào**. Lộ trình cũ có thể bị thay — kiểm tra văn bản gốc, không gộp nhiều giai đoạn vào 1 văn bản.

### Bẫy 3 — Số liệu cũ được dùng làm "hiện tại"

❌ *"Gói 120.000 tỷ giải ngân chỉ 83 tỷ = 0,07%"* (số liệu 2023, nhưng bài cập nhật 2026)
✅ Đến 2025: giải ngân ~1.000+ tỷ, 16 dự án/36 tỉnh, vẫn dưới 1%.

**Bài học:** Số liệu có thời điểm. Ref cũ (2023) **không được dùng làm claim "hiện tại"** trong bài cập nhật 2026. Cập nhật hoặc ghi rõ "số liệu giai đoạn đầu".

### Bẫy 4 — Tháng/năm sự kiện quốc tế dễ nhầm

❌ *"Three Red Lines 12/2020"*
✅ **Tháng 8/2020** (Wikipedia, BBC, CKGSB — 3 nguồn khớp).

**Bài học:** Sự kiện quốc tế (khủng hoảng, quy định) — **cross-check tháng cụ thể** qua ≥2 nguồn quốc tế. Dễ nhầm quý/tháng.

### Bẫy 5 — Cùng 1 chỉ số, nhiều giá trị trong bài

❌ Room tín dụng: 14% / 15% / 18% lộn xộn không phân biệt
✅ Nhất quán **~15%** (chỉ tiêu NHNN giao), phân biệt rõ **~18%** (dự phóng SSI Research).

**Bài học:** Khi 1 chỉ số có nhiều "góc nhìn" (chỉ tiêu vs thực tế vs dự phóng), **phải ghi rõ ngữ cảnh** mỗi lần nhắc — không để số trần trề gây hiểu nhầm.

### Bẫy 6 — Chart data mâu thuẫn text đã sửa

❌ Sửa text "lộ trình 40→30%" nhưng quên sửa chart data `[60,55,50,...]`
✅ Sau khi sửa text về số liệu, **phải check chart data array** tương ứng.

**Bài học:** Chart và text phải **cùng bộ số**. Khi sửa số liệu trong text, grep chart `data:[...]` xem cần sửa theo không.

### Bẫy 7 — Dữ liệu thực vs mô phỏng/nội suy che giấu trong chart

❌ Chart "lịch sử lợi suất 1928-2025" vẽ 8 mốc (1928,1945,1965,1985,2000,2010,2020,2025) → người đọc tưởng toàn bộ là data lịch sử thực, nhưng thực ra chỉ có mốc đầu/cuối là data thực, các mốc giữa là **tự nội suy để đường cong đẹp**.
❌ Chart "sức mua 100đ 2015-2025" vẽ 7 mốc每年的 → tưởng data đo thực từng năm, thực ra chỉ có 3 mốc chính có nguồn, 4 mốc giữa bịa.
❌ Desc ghi chung "số liệu ước tính" — che giấu phần nào ước tính, phần nào data thực.

✅ **Phân biệt rõ trong chart:**
- **Data thực** → ghi nguồn cụ thể (vd: "Vàng SJC 33tr→95tr/lượng²")
- **Nội suy/mô phỏng** → ghi rõ "nội suy" ngay trong label trục (vd: `labels:['1928','1965 (nội suy)','2025']`) và trong axis title (vd: "trục log — mốc giữa nội suy")
- **Mục đích minh họa** → nói rõ "chart chỉ minh họa hape phân kỳ, không dùng để ra quyết định"
- Giảm số mốc: ưu tiên chỉ giữ mốc có data thực (3-4 mốc đủ cho thấy xu hướng), bỏ các mốc nội suy "cho đẹp"

**Bài học:** Mỗi điểm trên chart phải biết rõ nó là data thực hay nội suy. **Không che giấu mô phỏng dưới vỏ "ước tính"**. Người đọc có quyền biết đâu là sự thật, đâu là minh họa.

### Bẫy 8 — Tài sản không có data minh bạch (BĐS VN, coin OTC)

❌ Dùng "yield căn hộ HCM 3%/năm" làm cột trong chart so sánh lợi suất — nhưng **BĐS VN không có index chính thức / hệ thống data giao dịch công khai minh bạch**. Mọi con số "lợi suất BĐS" lan truyền đều là ước tính từng vùng, dễ sai và dễ bị thao túng.
❌ Dùng "lãi suất vàng 7%/năm" — **vàng không có yield cố định** (giá trị nằm ở tăng vốn), đó là sai bản chất tài sản.
❌ Chart "Case B đất vay vốn" vẽ đường data "như thực" nhưng thực ra không có data BĐS index.

✅ **Xử lý theo 3 lựa chọn:**
1. **Loại bỏ số liệu cụ thể** — nếu tài sản không có nguồn data chính thức (BĐS VN, coin OTC, hàng nóng). Thay bằng mô tả cơ chế.
2. **Phân loại tài sản đúng bản chất** — tài sản có dòng tiền định kỳ (TK, trái phiếu, cho thuê) mới có "yield cố định". Tài sản tăng vốn (vàng, cổ phiếu, BĐS, coin) không có yield cố định → không nằm chung 1 chart "lợi suất %/năm".
3. **Đánh dấu rõ ràng nếu phải dùng** — dùng line nét đứt (`borderDash:[8,4]`) + label "kịch bản mô phỏng" + callout cảnh báo ngay đầu section.

**Bài học:** Trước khi dùng số liệu 1 tài sản, hỏi: **"Tài sản này có index chính thức không? Có data giao dịch công khai không?"** Nếu không → không dùng số cụ thể. Cổ phiếu có VN-Index, vàng có giá SJC niêm yết, lãi TK có SBV công bố — những thứ này OK. BĐS VN, coin OTC, hàng nóng — KHÔNG OK.

### Bẫy 9 — Data quốc tế dùng cho bài VN (xa lạ với người đọc)

❌ Bài về tài chính VN nhưng dùng chart "$100 S&P 500 1928-2025 → $1.15 triệu" hoặc "S&P -18% năm 2022" — người đọc VN thấy xa lạ, khó kết nối với trải nghiệm thật.
❌ Desc trỏ ref S&P 500 (Damodaran) nhưng chart có cả đường vàng SJC VN (mâu thuẫn nguồn — ref S&P không hỗ trợ data VN).

✅ **Ưu tiên data VN cho bài VN:**
- VN có đủ data chính thức: VN-Index (CafeF/Investing), Vàng SJC (sjc.com.vn), CPI (GSO/NSO), Lãi TK & điều hành (SBV)
- Tính toán từ data thực: vd sức mua 100đ 2015→2025 = ×1,28 (CPI tích lũy), ×2,9 (Vàng), ×1,8 (TK), ×3,08 (VN-Index)
- Chỉ dùng data quốc tế khi: bài về chủ đề quốc tế, hoặc cần benchmark so sánh (vd "S&P vs VN-Index")
- Đảm bảo mỗi đường trong chart có **ref VN riêng**, không trộm ref quốc tế

**Bài học:** Bài VN → data VN. Người đọc dễ kết nối với VN-Index -32,78% (2022) hơn là S&P -18% (cùng năm nhưng xa lạ). Check ref khớp với data thực tế trong chart.

---

<a id="script-rà-soát"></a>
## Script rà soát tự động

Script hỗ trợ phát hiện mâu thuẫn nhanh (chạy sau Bước 1 trích xuất):

```bash
#!/usr/bin/env bash
# usage: ./scan_claims.sh path/to/index.html
FILE="${1:?cần file html}"
set -u

echo "=== 1. Số liệu room/tỷ lệ % xuất hiện nhiều giá trị ==="
grep -noE "~?[0-9]+%|~?[0-9]+,[0-9]+%" "$FILE" | sort | uniq -c | sort -rn | head -20

echo ""
echo "=== 2. Số chương khai báo vs số section thực tế ==="
echo "Khai báo 'N chương':"
grep -nE "[0-9]+ chương phân tích|[0-9]+ chương" "$FILE" || echo "(không thấy)"
echo "Số <section>: $(grep -c '<section ' "$FILE")"

echo ""
echo "=== 3. Ngày ban hành/hiệu lực trùng lặp văn bản ==="
grep -nE "TT [0-9]+/[0-9]+/TT-NHNN|Nghị định [0-9]+/[0-99]+/NĐ-CP" "$FILE" | sort -t: -k2 | uniq -f1 -c | sort -rn | head

echo ""
echo "=== 4. Chart data arrays (kiểm tra mâu thuẫn với text) ==="
grep -nE "data:\s*\[" "$FILE" | head -20

echo ""
echo "=== 5. Ref meta có số liệu cũ (năm cũ)? ==="
grep -nE "src-meta.*2023|src-meta.*2022" "$FILE" | head -10
```

> Script chỉ **flag** điểm đáng nghi — con người vẫn phải đọc context quyết định có mâu thuẫn thật không.

## Tích hợp vào workflow chính

Bước fact-check này chèn vào **giữa Bước 4 (citations) và Bước 5 (verify kỹ thuật)** của SKILL.md:

```
Bước 1: Outline + theme
Bước 2: Copy template + fill hero
Bước 3: Viết các section
Bước 4: Tài liệu tham khảo + minimap
► Bước 4.5: Fact-check số liệu (file này) ◄  ← MỚI
Bước 5: Verify kỹ thuật (JS parse, Playwright)
```

**Khi nào BẮT BUỘC chạy Bước 4.5:**
- Bài có **≥10 con số** (ngày/tỷ lệ/số tiền).
- Bài về **chính sách pháp luật** (ngày hiệu lực, Điều khoản — sai là nghiêm trọng).
- Bài **kêu gọi người đọc đối chiếu báo cáo CK** (phải chính xác hơn bài thông thường).
- User đặt **câu hỏi về 1 con số cụ thể** (dấu hiệu nên rà toàn bộ).
