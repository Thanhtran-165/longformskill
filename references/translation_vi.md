# Hậu kỳ dịch Anh–Việt (tài chính / vĩ mô / địa chính trị / học thuật)

Tài liệu này tổng hợp **lỗi dịch thật đã gặp** khi chuyển tài liệu tiếng Anh (báo cáo IGWT, báo CK, vĩ mô) sang tiếng Việt — kèm cách sửa. Dùng cho mọi bài longform có nguồn tiếng Anh.

> ⚠️ **Khi nào dùng**: bài longform dịch/tổng hợp từ tài liệu tiếng Anh. Chạy Bước "Fact-check dịch" (xem cuối file) trước khi QA kỹ thuật.

> 🔗 **Mối quan hệ với skill `vietnamese-document-translation-skill`** (`~/.zcode/skills/vietnamese-document-translation-skill/`):
> - **Skill dịch** = động cơ dịch chính (pipeline 7 bước + MQM review 9 nhóm lỗi + termbase 219 thuật ngữ + adaptive mode decision). Dùng cho **Bước 0** (dịch nguồn) và **lớp 1 Bước 5c** (MQM review).
> - **File này** (`references/translation_vi.md`) = **catalog lỗi thật đã gặp cụ thể trong các bài longform trước** (IGWT, báo CK, vĩ mô) + glossary + script grep. Dùng cho **lớp 2 Bước 5c** (lint pattern cố định) + reference nhanh khi review tay.
> - **Phân công**: skill dịch bắt lỗi ngữ nghĩa sâu (accuracy/terminology/number_unit/hallucination); file này + `translation_check.py` bắt lỗi pattern cố định (CJK, tag HTML, "sự + V", idiom đã biết). Hai lớp **bổ sung** cho nhau, không thay thế.
> - **Termbase**: thuật ngữ đã có trong `termbase/finance_macro_en_vi.csv` của skill dịch → dùng gloss đó. File này giữ glossary như catalog lịch sử + bổ sung thuật ngữ longform-specific chưa đưa vào termbase.

> 📚 **Nguồn glossary**: thuật ngữ chuẩn thị trường tài chính VN (đối chiếu nhiều nguồn: báo CK VN, tài liệu NHNN, báo cáo vĩ mô). Glossary này độc lập với bất kỳ dự án cụ thể nào — cập nhật khi gặp thuật ngữ/cách dịch mới.

## Mục lục

- [Nguyên tắc dịch](#nguyên-tắc-dịch)
- [Loại lỗi 1 — Dịch sát nghĩa sai ngữ cảnh](#loại-lỗi-1--dịch-sát-nghĩa-sai-ngữ-cảnh)
- [Loại lỗi 2 — Giữ nguyên tiếng Anh không gloss](#loại-lỗi-2--giữ-nguyên-tiếng-anh-không-gloss)
- [Loại lỗi 3 — Cụm kỳ quặc / dịch máy](#loại-lỗi-3--cụm-kỳ-quặc--dịch-máy)
- [Loại lỗi 4 — Ẩn dụ/văn hóa Mỹ-Âu](#loại-lỗi-4--ẩn-dụvăn-hóa-mỹ-âư)
- [Loại lỗi 5 — Dấu hiệu câu dịch máy (cấu trúc)](#loại-lỗi-5--dấu-hiệu-câu-dịch-máy-cấu-trúc)
- [Glossary thuật ngữ](#glossary-thuật-ngữ)
- [Quét grep để tìm lỗi](#quét-grep-để-tìm-lỗi)
- [Checklist hậu kỳ dịch (BẮT BUỘC)](#checklist-hậu-kỳ-dịch-bắt-buộc)

---

## Nguyên tắc dịch

1. **Dịch ý, không dịch chữ** — "by the textbook, should have the opposite effect" → "theo logic thông thường lẽ ra phải đẩy giá lên" (KHÔNG "theo sách giáo khoa lẽ ra phải có tác dụng ngược").
2. **Thuật ngữ tài chính chuẩn**: giữ tiếng Anh nếu phổ biến trong tài chính VN (margin call, ETF, stablecoin) — nhưng lần đầu xuất hiện phải có gloss tiếng Việt trong ngoặc.
3. **Không dịch đen**: idiom/ẩn dụ cần hoặc giữ nguyên + gloss, hoặc thay bằng thành ngữ VN tương đương.
4. **Đọc lại thành tiếng** — nếu câu nghe "kỳ" khi đọc thành tiếng, cần viết lại.

---

## Loại lỗi 1 — Dịch sát nghĩa sai ngữ cảnh

Lỗi nguy hiểm nhất — từ đúng từng chữ nhưng sai ý trong ngữ cảnh.

| Tiếng Anh | ❌ Sai (dịch sát) | ✅ Đúng (dịch ý) | Ngữ cảnh |
|---|---|---|---|
| `the trigger for a healthy correction` | "cú gạt đầu của một nhịp điều chỉnh lành mạnh" | "cú chốt hạ mở đường cho một đợt điều chỉnh lành mạnh" | Vàng — "trigger" = chốt khởi động, không phải lừa gạt |
| `by the textbook, opposite effect` | "theo sách giáo khoa lẽ ra phải có tác dụng ngược" | "theo logic thông thường lẽ ra phải đẩy giá lên" | Chiến tranh vàng |
| `cinematic nod` | "lời ái ngãi điện ảnh" | "một cái gật đầu vinh danh điện ảnh" | Ái ngãi = khó chịu, hoàn toàn sai |
| `exorbitant burden` | (dịch đúng) "gánh nặng phi thường" | "gánh nặng phi thường" (giữ nguyên) | OK |
| `quiet QE` / `silent QE` | "QE thầm lặng" | "bơm tiền thầm lặng (quiet QE)" | Cần gloss |
| `kicking the can down the road` | "đá hộp xuống đường" | "trì hoãn, day dưa đối phó" | Idiom Mỹ |
| `gradually, then suddenly` | "dần dần, rồi đột ngột" | (giữ nguyên, đã rõ) | OK |
| `monetary science fiction` | "khoa học viễn tưởng tiền tệ" | "viễn tưởng tiền tệ" | OK |
| `coalescing into` | "kết đọng thành" | "kết tinh thành" | Tùy ngữ cảnh |
| `trói buộc kinh tế` (economic constraints) | "trói buộc kinh tế" | "áp lực kinh tế" / "ràng buộc kinh tế" | Khủng hoảng Suez — "áp lực" tự nhiên hơn |
| `reverse Perestroika` | (giữ nguyên) | "Perestroika ngược chiều" + gloss | Cần gloss |
| `Wile E. Coyote moment` | (giữ nguyên) | "khoảnh khắc Wile E. Coyote (sói chạy ra vách đá nhưng chưa rơi)" | Cần giải nghĩa |
| `Tom Hanks COVID moment` | (giữ nguyên) | "khoảnh khắc Tom Hanks COVID (nhận thức chậm rồi thị trường đóng băng)" | Cần giải nghĩa |
| `domestique` (đua xe đạp) | "domestique" | "tay đua hỗ trợ (domestique trong đua xe đạp)" | Cần gloss |
| `Hautacam moment` | "khoảnh khắc Hautacam" | "khoảnh khắc Hautacam (cú bứt phá)" | Cần gloss |
| `barbell strategy` | "chiến lược barbell" | "chiến lược đòn bẩy kép (barbell)" | Cần gloss |
| `bottleneck` (hàng hóa) | "bottleneck" | "thắt cổ chai (bottleneck)" | Cần gloss |
| `throughput` | "throughput" | "thông lượng (throughput)" | Cần gloss |
| `crowded trade` | "giao dịch đông đúc" | "vị thế đông đúc (crowded trade)" | Tài chính — KHÔNG phải giao dịch |
| `price taker → price maker` | "price taker → price maker" | "người chịu giá → người định giá" | Tài chính |
| `mounting` (giới hạn mounting) | "vận hành mounting" | "vận hành ngày càng trầm trọng" | Tối nghĩa nếu giữ Eng |
| `mainstream` | "mainstream" | "giới phân tích chính thống" / "dòng chính" | OK dịch |
| `homeopathic doses` | "thuốc đồng cân" | "từng liều nhỏ (kiểu homeopathic)" | "Đồng cân" là thuật y khoa khác |
| `infrastructure you build before you pull the capital-controls lever` | (giữ nguyên Eng) | "hạ tầng bạn xây trước khi kéo cần kiểm soát vốn" | Cần dịch |
| `not in spite of X, but because of X` | "không phải mặc dù X mà chính vì X" | tường minh thành 2 vế đối lập: "không phải vì [điều xấu], mà chính vì [điều tốt]" | Vàng bị bán tháo không phải vì nó yếu, mà vì nó dễ bán nhất — cấu trúc Anh mệnh đề "mặc dù/vì" nghe kỳ khi dịch sát |

---

## Loại lỗi 2 — Giữ nguyên tiếng Anh không gloss

Lần đầu xuất hiện thuật ngữ tài chính → phải có gloss tiếng Việt trong ngoặc. Lần sau có thể giữ nguyên.

| Tiếng Anh | Gloss tiếng Việt | Ghi chú |
|---|---|---|
| `base money` / `monetary base` | cơ sở tiền (M0) | KHÔNG "base tiền" |
| `balance sheet` | bảng cân đối kế toán | |
| `Treasury` / `Treasuries` / `UST` | trái phiếu Kho bạc Mỹ (Treasury/UST) | Cần gloss lần đầu — chuẩn thị trường VN dùng "Kho bạc Mỹ" |
| `T-bill` | tín phiếu kho bạc (T-bill) | Chuẩn thị trường VN |
| `custody` / `custody holdings` | lưu ký / số dư lưu ký (custody) | Chuẩn thị trường CK VN (thay "ký gửi") |
| `basis trade` | giao dịch chênh lệch đòn bẩy (basis trade) | |
| `margin call` | lệnh ký quỹ (margin call) | Phổ biến, có thể giữ sau lần đầu |
| `bullion` | vàng thỏi (bullion) | |
| `bullion treasury` | quỹ dự trữ vàng thỏi | |
| `downtime` | thời gian dừng máy | |
| `drawdown` | sụt giảm từ đỉnh (drawdown) | |
| `underweight` / `overweight` | dưới trọng số / trên trọng số | |
| `seed` / `sprout` (vốn) | vốn mầm / vốn nảy mầm | |
| `rollover` | tái cấp vốn (rollover) | |
| `yield curve control` | kiểm soát đường cong lợi suất (YCC) | "đường cong" tự nhiên hơn "đường lợi suất" |
| `quantitative easing` (QE) | nới lỏng định lượng (QE) | |
| `financial repression` | trấn áp tài chính | |
| `fiat` / `fiat money` | tiền pháp định (fiat) | |
| `petrodollar` / `petroyuan` / `petrogold` | (giữ nguyên — đã phổ biến VN) | |
| `debacle` | thảm họa / sự sụp đổ | |
| `grade` (khai khoáng) | hàm lượng quặng (grade) | |
| `regime` (tài chính) | chế độ (regime) | |
| `driver` (yếu tố thúc đẩy) | động lực | |
| `backing` / `backed by` | đảm bảo bằng | |
| `underlying` | cơ sở / nền tảng | |
| `hallmarking` | đóng dấu xác thực (hallmarking) | Rõ hơn "đóng dấu chứng nhận" |
| `off-take` | hợp đồng bao tiêu (off-take) | Dịch theo bối cảnh |
| `tailwind` / `headwind` | gió thuận / gió ngược | idiom kinh tế cần gloss |
| `canary in the coal mine` | con chim hoàng yến trong mỏ than | ẩn dụ cảnh báo sớm (Greenspan) |
| `short squeeze` | short squeeze (giữ) / đợt bíp short | VN thực tế cũng dùng "bíp short" |
| `stagflation` | stagflation (lạm phát đình trệ) | Giữ Anh + gloss "đình trệ" |
| `multiple expansion` | mở rộng bội số (multiple expansion) | Chuẩn kinh tế VN — rõ hơn "giãn đa số" |
| `price taker → price maker` | chấp nhận giá thụ động → người định giá | Rõ hơn "người chịu giá" |
| `real yield` | lãi suất thực (real yield) | Thị trường VN dùng "lãi suất thực" |
| `malinvestment` | đầu tư sai lầm (malinvestment) | Rõ hơn "đầu tư sai lệch" |
| `time preference` | tỷ lệ ưu tiên thời gian (time preference) | Sát nghĩa gốc Mises |
| `off-take` | hợp đồng bao tiêu (off-take) | |
| `royalty` / `streaming` (mỏ) | quyền thu phí / dòng sản lượng | |
| `shortfall` | khoản thiếu hụt | |
| `leverage` | đòn bẩy | |
| `paper gold` | vàng giấy | |
| `allocated` / `unallocated gold` | vàng phân bổ / vàng không phân bổ | |
| `settlement` | thanh toán bù trừ | |
| `vault` | két / hầm chứa | |
| `fractional reserve` | dự trữ phân đoạn | |
| `hard power` / `soft power` | quyền lực cứng / quyền lực mềm | |

---

## Loại lỗi 3 — Cụm kỳ quặc / dịch máy

Các cụm dịch ra nghe "kỳ" mà không phải sai chữ — cần viết lại tự nhiên.

| ❌ Cụm kỳ | ✅ Viết lại | Ghi chú |
|---|---|---|
| "xoáy nợ" | "đẩy nợ vào vòng xoáy" | "xoáy nợ" tối nghĩa |
| "kìm bond" | "kìm giá trái phiếu" | Từ vựng Anh lai |
| "siết kinh tế" | "siết chặt kinh tế" | |
| "chiếu hạ tầng đô la số" | "dự phóng sự thống trị của đồng đô la số" | "chiếu" sai ngữ cảnh |
| "vô luận về giá" | "không quan tâm giá" | Dịch sát sai |
| "người cầu vô co giãn" | "nhóm cầu không co giãn theo giá" | |
| "rời cõi lý thuyết" | "vượt ra ngoài lý thuyết suông" | Quá văn vẻ |
| "mang tính chương trình" | "mang tính định hướng chính sách" | Dịch sát sai |
| "toàn光谱" / "toàn spectrumre" | "trên mọi mặt" / "toàn diện" | Typo + ký tự lỗi |
| "BảnCompact" | "Bản Compact" | Dính chữ |
| "tài sản trú ẩn thất bại" | "tài sản trú ẩn đã thất bại" | Thiếu "đã" |
| "giao dịch đông đúc" | "vị thế đông đúc (crowded trade)" | Sai thuật ngữ |
| "phản ứng trầm lặng về mặt lịch sử gắn với kỳ vọng" | "sự trầm lặng chưa từng có trong lịch sử, gắn với kỳ vọng" | Câu lủng củng |
| "áp dụng vào tiền tệ" (chữ 'á' thường đầu câu) | "Áp dụng vào tiền tệ" | Lỗi viết hoa |
| "ai đặt khăn trước, ghế tốt nhất" | "Ai đặt khăn trước giữ ghế tốt nhất — như người Đức đặt khăn lên ghế bãi biển từ 6h sáng" | Cần gloss ẩn dụ |
| "sự bàn giao" (transfer of baton) | "sự chuyển giao vai trò" | "Bàn giao" mơ hồ |
| "nhận lại chiếc đũa thần" | "nhận lại 'chiếc đũa thần'" + gloss | Cần in nghiêng + gloss |
| "pha tham gia công众人" (ký tự lỗi) | "pha tham gia công chúng" | Ký tự TQ lẫn vào |
| "vận hành mounting" | "vận hành ngày càng trầm trọng" | Giữ Eng tối nghĩa |
| "mainstream hoài nghi" | "giới phân tích chính thống còn hoài nghi" | Anh lai |
| "khi đóng nhịp" | "tính đến đáy" / "khi chốt phiên" | Tùy ngữ cảnh |

---

## Loại lỗi 4 — Ẩn dụ/văn hóa Mỹ-Âu

Ẩn dụ đặc thù Mỹ-Âu cần hoặc gloss hoặc thay tương đương VN.

| Ẩn dụ | Nguồn | Cách xử lý |
|---|---|---|
| `Mallorca towel` | Người Đức đặt khăn lên ghế bãi biển từ 6h sáng để giữ chỗ | Giải nghĩa rõ |
| `for want of a nail` | Idiom: thiếu 1 đinh mất 1 vương quốc | "thiếu một đinh, mất một vương quốc" |
| `Tom Hanks COVID moment` | Diễn viên Tom Hanks dương tính sớm COVID, thị trường chậm nhận thức rồi đóng băng | Gloss |
| `Wile E. Coyote moment` | Sói trong hoạt hình Road Runner chạy ra vách đá, chưa rơi | "khoảnh khắc Wile E. Coyote (sói chạy ra vách đá nhưng chưa rơi)" |
| `Hautacam moment` | Tay đua France1998 bứt phá ở đèo Hautacam | "khoảnh khắc Hautacam (cú bứt phá)" |
| `domestique` | Tay đua hỗ trợ đội trưởng trong đua xe đạp | Gloss |
| `Kobayashi Maru` | Tình huống không-thể-thắng trong Star Trek | Gloss |
| `Marty McFly / DeLorean` | Phim Back to the Future | Có thể giữ (phổ biến) |
| `Doc Brown` | Phim Back to the Future | Có thể giữ |
| `Suez Crisis 1956` | Khủng hoảng kênh đào Suez | Có thể giữ (lịch sử) |
| `Bretton Woods I/II/III` | Hệ thống tiền tệ | Có thể giữ + gloss |
| `Dow Theory phases` (accumulation/public participation/distribution) | Phân tích kỹ thuật | Gloss: tích lũy / tham gia công chúng / phân phối |
| `Great Moderation` | Giai đoạn lạm phát thấp 1982–2021 | "Đại Tiết chế (Great Moderation)" |
| `Lost decade` | Thập kỷ mất mát | Có thể giữ |
| `Gilded Age` | Thời đại mạ vàng (Mỹ cuối 1800s) | "Thời đại Mạ Vàng (Gilded Age)" |

---

## Loại lỗi 5 — Dấu hiệu câu dịch máy (cấu trúc)

Cấu trúc ngữ pháp Anh dịch thẳng sang Việt → nghe "kỳ".

| Dấu hiệu | Ví dụ | Sửa |
|---|---|---|
| `sự + động từ trừu tượng` lặp | "Sự sụp đổ của niềm tin" | "Niềm tin sụp đổ" (chủ động) |
| `đã được + V` bị động | "đã được chứng minh" | "đã chứng minh" / "lịch sử đã chứng minh" |
| `đang được + V` | "đang được định hình" | "đang định hình" |
| `về mặt + tính từ` | "về mặt kỹ thuật" | "về kỹ thuật" |
| `mà ... mà ...` lặp | "không chỉ khả thi mà về mặt kỹ thuật đã quá hạn" | tách thành 2 câu |
| `—` (gạch ngang) >2 lần/câu | Dịch nhiều mệnh đề phụ | Tách câu |
| `tài sản` lặp >3 lần/đoạn | "asset" lặp trong Eng | Dùng đại từ / đồng nghĩa |
| `sẽ` lặp (dịch "will") | >3 "sẽ" trong đoạn | Rút gọn |
| `đó là` / `đây là` (this is) | Cố vấn Anh | Bỏ nếu thừa |
| `cái gì / cái đó` (this/that) | Cố vấn Anh | Dùng danh từ cụ thể |

---

## Glossary thuật ngữ

### Vĩ mô / tiền tệ

| Anh | Việt |
|---|---|
| `stagflation` | đình lạm (stagflation) |
| `inflation` | lạm phát |
| `deflation` | giảm phát |
| `disinflation` | giảm tốc lạm phát |
| `recession` | suy thoái |
| `depression` | khủng hoảng / đại suy thoái |
| `soft landing` | hạ cánh mềm |
| `hard landing` | hạ cánh cứng |
| `yield` | lợi suất |
| `yield curve` | đường lợi suất |
| `real yield` | lợi suất thực |
| `nominal yield` | lợi suất danh nghĩa |
| `interest rate` | lãi suất |
| `policy rate` | lãi suất chính sách |
| `benchmark rate` | lãi suất tham chiếu |
| `money supply` (M0/M1/M2) | cung tiền (M0/M1/M2) |
| `monetary base` | cơ sở tiền (M0) |
| `velocity of money` | tốc độ lưu thông tiền |
| `fiat money` | tiền pháp định (fiat) |
| `gold standard` | bản vị vàng |
| `Bretton Woods` | Bretton Woods (giữ) |
| `de-dollarization` | phi đô la hóa |
| `quantitative easing` (QE) | nới lỏng định lượng (QE) |
| `quantitative tightening` (QT) | thắt chặt định lượng (QT) |
| `yield curve control` (YCC) | kiểm soát đường lợi suất (YCC) |
| `financial repression` | trấn áp tài chính |
| `helicopter money` | tiền trực thăng |
| `MMT` | Lý thuyết Tiền tệ Hiện đại (MMT) |
| `Cantillon effect` | Hiệu ứng Cantillon |
| `malinvestment` | đầu tư sai lệch (malinvestment) |
| `time preference` | thiên kiến thời gian |
| `seigniorage` | lợi nhuận đúc tiền (seigniorage) |

### Thị trường chứng khoán / kỳ hoán

| Anh | Việt |
|---|---|
| `bull market` / `bear market` | thị trường bò / thị trường gấu |
| `correction` | điều chỉnh |
| `consolidation` | tích lũy / đi ngang |
| `rally` | nhịp tăng |
| `selloff` | nhịp bán tháo |
| `drawdown` | sụt giảm từ đỉnh |
| `ATH` (all-time high) | đỉnh lịch sử (ATH) |
| `capitulation` | bỏ cuộc / đầu hàng |
| `short squeeze` | bóp shorts |
| `short` / `long` | bán khống / mua dài hạn |
| `position` | vị thế |
| `leverage` | đòn bẩy |
| `margin call` | lệnh ký quỹ |
| `short selling` | bán khống |
| `ETF` | quỹ giao dịch chỉ số (ETF) |
| `ETP` | sản phẩm giao dịch sàn (ETP) |
| `AUM` | tài sản quản lý (AUM) |
| `P/E ratio` | tỉ số P/E |
| `market cap` | vốn hóa thị trường |
| `valuation` | định giá |
| `overvalued` / `undervalued` | định giá cao / định giá thấp |
| `multiple expansion` | giãn đa số |
| `sentiment` | tâm lý |
| `euphoria` | hưng phấn / cuồng phong |
| `bubble` | bong bóng |
| `crowded trade` | vị thế đông đúc |
| `consensus` | đồng thuận |

### Vàng / kim loại / khai khoáng

| Anh | Việt |
|---|---|
| `gold` | vàng |
| `silver` | bạc |
| `platinum` | bạch kim |
| `bullion` | vàng thỏi / kim loại thỏi |
| `allocated gold` | vàng phân bổ |
| `unallocated gold` | vàng không phân bổ |
| `paper gold` | vàng giấy |
| `reserve` | dự trữ |
| `official reserve` | dự trữ chính thức |
| `central bank` | ngân hàng trung ương (NHTW) |
| `safe haven` | trú ẩn an toàn |
| `safe-haven asset` | tài sản trú ẩn |
| `store of value` | kho lưu giá trị |
| `medium of exchange` | phương tiện trao đổi |
| `unit of account` | đơn vị tính toán |
| `AISC` (all-in sustaining cost) | chi phí duy trì toàn phần (AISC) |
| `mine production` | sản lượng mỏ |
| `recycling` (vàng) | tái chế |
| `offtake` | lượng tiêu thụ |
| `HUI Index` | chỉ số HUI (cổ phiếu mỏ vàng) |
| `GDX` | GDX (ETF mỏ vàng) |
| `royalty company` | công ty thu phí (royalty) |
| `streaming company` | công ty dòng sản lượng (streaming) |
| `grade` (quặng) | hàm lượng |
| `ore` | quặng |
| `tailings` | bùn thải / quặng đuôi |

### Địa chính trị

| Anh | Việt |
|---|---|
| `Heartland` | Heartland / Vùng Trục (giữ + gloss) |
| `Rimland` | Rimland / Vùng Vành đai |
| `land power` / `sea power` | quyền lực đất liền / quyền lực biển |
| `pivot area` | vùng trục |
| `World Island` | Đảo Thế giới (Á-Âu-Phi) |
| `hegemon` / `hegemony` | cường quốc bá quyền / bá quyền |
| `Pax Americana` | Pax Americana (Trật tự Mỹ) |
| `multipolar` | đa cực |
| `bipolar` | lưỡng cực |
| `unipolar` | đơn cực |
| `sanctions` | trừng phạt / cấm vận |
| `capital controls` | kiểm soát vốn |
| `trade surplus` / `deficit` | thặng dư / thâm hụt thương mại |
| `current account` | tài khoản vãng lai |
| `capital account` | tài khoản vốn |
| `balance of payments` | cán cân thanh toán |
| `reserve currency` | tiền dự trữ |
| `petrodollar` | petrodollar (giữ) |
| `OPEC` | OPEC (giữ) |
| `SWIFT` | SWIFT (giữ) |
| `CIPS` | CIPS (hệ thống thanh toán nội địa TQ) |
| `BRICS` | BRICS (giữ) |
| `SCO` | SCO (Tổ chức Hợp tác Thượng Hải) |
| `NATO` | NATO (giữ) |

### Học thuật (kinh tế học / tâm lý học hành vi)

| Anh | Việt | Nguồn gốc |
|---|---|---|
| `behavioral finance` | tài chính hành vi | |
| `negativity bias` | thiên kiến tiêu cực | Baumeister et al. 2001 |
| `loss aversion` | chán mất mát (~2:1) | Kahneman & Tversky 1979, *Prospect Theory* |
| `confirmation bias` | thiên kiến xác nhận | |
| `recency bias` | thiên kiến gần đây | |
| `herd behavior` | hành vi bầy đàn | |
| `bounded rationality` | lý trí hữu hạn | Herbert Simon 1978 |
| `satisficing` | hài lòng-đủ (satisficing) | Simon |
| `Austrian School` | Trường phái Kinh tế học Áo | |
| `Keynesian` | Keynesian | |
| `monetarist` | tiền tệ luận | Milton Friedman |
| `neoclassical` | tân cổ điển | |
| `neoliberal` | tân tự do | |
| `macroeconomics` | kinh tế vĩ mô | |
| `microeconomics` | kinh tế vi mô | |
| `econometrics` | kinh tế lượng | |
| `fiat` | tiền pháp định | |
| `Austrian Business Cycle Theory` | Lý thuyết Chu kỳ Kinh doanh Áo | |

---

## Quét script để tìm lỗi

**Chạy script Python** (thay grep thủ công — quét sâu hơn, báo cáo có cấu trúc):

```bash
python3 "$SKILL_DIR/scripts/translation_check.py" {file}
# Hoặc với strict (exit 1 nếu có warning):
python3 "$SKILL_DIR/scripts/translation_check.py" {file} --strict
```

**8 nhóm check** (script tự động, không cần grep thủ công):
1. Thuật ngữ Anh không gloss (lần đầu cần gloss VN)
2. Cụm kỳ quặc đã biết (catalog lỗi thật)
3. Câu dịch máy ("sự + V", "đã được + V", "về mặt + adj", lặp "sẽ")
4. Câu dài > 250 ký tự / nhiều gạch ngang (dấu hiệu dịch sát)
5. Lặp từ trong đoạn (vàng/tài sản/NHTW > 3 lần)
6. Tag HTML không khớp (mở em / đóng strong)
7. Ký tự CJK lẫn vào / typo đã biết
8. Idiom/ẩn dụ Mỹ-Âu không gloss

**Exit code**:
- `0` = pass (chỉ info/gợi ý)
- `1` = warning với `--strict`
- `2` = error (sửa trước khi QA kỹ thuật)

**Lưu ý**: script chỉ bắt lỗi pattern cố định. Câu "dịch đúng mà kỳ khi đọc" cần người đọc cảm nhận — chạy script xong vẫn phải review bằng mắt.

---

## Quét grep thủ công (backup)

Nếu script chưa có hoặc cần check nhanh 1 pattern cụ thể:

```bash
# 1. Tiếng Anh tài chính không gloss (lần đầu phải có gloss)
grep -oE "\b(fiat|basis trade|margin call|paper gold|bullion|treasury|UST|T-bill|custody|hallmarking|off-take|royalty|streaming|shortfall|underlying|leverage|debacle|drawdown|underweight|overweight)\b" {file} | sort | uniq -c | sort -rn

# 2. Câu dịch máy: "sự + động từ", "đã được + V", "về mặt + tính từ"
grep -nE "Sự (bào mòn|rời bỏ|sụp đổ|đóng băng|tích lũy|luân chuyển|đảm bảo|phát hành)" {file}
grep -nE "đã được (chứng minh|xây dựng|tích lũy|thảo luận|ghi nhận)|đang được (định hình|thảo luận|theo dõi)" {file}
grep -noE "về mặt [a-zA-Zạảầẩẫậắằẳẵặẹẻẽếềểễệịỉọỏốồổỗộớờởỡợụủứừửữự]+" {file}

# 3. Cụm kỳ quặc đã biết
grep -nE "xoáy nợ|kìm bond|siết kinh tế|chiếu hạ tầng|vô luận|base tiền|rời cõi|mang tính chương trình|toàn光谱|toàn spectrumre|BảnCompact|tài sản trú ẩn thất bại|giao dịch đông đúc|vận hành mounting|mainstream hoài nghi|khi đóng nhịp" {file}

# 4. Tag HTML sai (mở em / đóng strong)
grep -nE "<em>[^<]*</strong>|<strong>[^<]*</em>" {file}

# 5. Ký tự TQ/CJK lẫn vào
grep -nE "[一-龯]" {file}

# 6. Typo thường gặp
grep -nE "revisi|spectrumre|mounting |hallmarking bắt buộc" {file}
```

---

## Checklist hậu kỳ dịch (BẮT BUỘC)

Chạy sau khi viết xong nội dung, **trước** khi QA kỹ thuật.

### 1. Gloss thuật ngữ lần đầu
- [ ] Mỗi thuật ngữ tài chính Anh (margin call, basis trade, Treasury...) lần đầu xuất hiện có gloss tiếng Việt trong ngoặc.
- [ ] Lần sau có thể giữ nguyên (phổ biến) hoặc rút gọn.

### 2. Dịch ý, không dịch chữ
- [ ] Đọc thành tiếng các đoạn khó — câu nào nghe "kỳ" → viết lại.
- [ ] Idiom/ẩn dụ đặc thù Mỹ-Âu → gloss hoặc thay tương đương VN.

### 3. Quét grep (xem mục trên)
- [ ] Tất cả 6 lệnh grep → output rỗng hoặc đã xử lý.

### 4. Cấu trúc câu
- [ ] Không quá nhiều "sự + V", "đã được + V" (bị động).
- [ ] Gạch ngang "—" ≤ 2 / câu.
- [ ] "tài sản" / "vàng" / "NHTW" không lặp > 3 lần / đoạn — dùng đại từ.

### 5. Tag HTML
- [ ] Mở `<em>` đóng `</em>`, mở `<strong>` đóng `</strong>` — không lẫn.
- [ ] Không có ký tự CJK (一-龯) lẫn vào.

### 6. Người đọc cảm nhận (nếu có user)
- [ ] Nếu user gửi đoạn tối nghĩa cụ thể → sửa từng cái chính xác (hiệu quả hơn quét tự động).

---

## Ghi chú

- **Quét grep có giới hạn**: chỉ bắt được lỗi pattern cố định. Câu "dịch đúng từng chữ nhưng vẫn kỳ khi đọc" cần người đọc cảm nhận.
- **Ưu tiên đường A** (user gửi từng đoạn tối nghĩa) cho chất lượng cuối; quét grep cho phạm vi rộng.
- File này cập nhật mỗi lần gặp lỗi mới — ghi vào mục tương ứng.
