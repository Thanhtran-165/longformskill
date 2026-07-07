# Themes — Hero gradient mood + Amber/Blue family

2 quyết định theme cho mỗi bài: (1) **family** Amber vs Blue, (2) **hero gradient mood** theo chủ đề. Cả 2 đều chỉ đổi 1 vài dòng CSS — không động vào `:root`.

## Mục lục

- [Family: Amber vs Blue](#family-amber-vs-blue)
- [Hero gradient mood (theo chủ đề)](#hero-gradient-mood)
- [Khi nào chọn cái nào](#khi-nào-chọn-cái-nào)

---

## Family: Amber vs Blue

`:root` palette **cố định** (slate-900 nền + 6 accent ngữ nghĩa) — không đổi. Điểm khác biệt giữa 2 family nằm ở 3 chỗ:

### 1. `.section-title .num` badge

**AMBER** (mặc định trong template — bài tự nghiên cứu/nhân quả):
```css
h2.section-title .num{
  background:linear-gradient(135deg,var(--amber),#d97706);
  box-shadow:0 4px 12px rgba(245,158,11,.3),inset 0 1px 0 rgba(255,255,255,.2);
}
```

**BLUE** (bài policy/Trung Quốc — tone down):
```css
h2.section-title .num{
  background:var(--blue);
  box-shadow:0 4px 12px rgba(59,130,246,.3),inset 0 1px 0 rgba(255,255,255,.2);
}
```

### 2. `.kpi` card

**AMBER** (mặc định — nền gradient amber glow):
```css
.kpi{background:linear-gradient(180deg,rgba(245,158,11,.06),rgba(30,41,59,.6));border:1px solid rgba(245,158,11,.25)}
.kpi::before{background:linear-gradient(90deg,var(--amber),transparent)}
```

**BLUE** (đơn giản hơn — nền phẳng):
```css
.kpi{background:var(--card);border:1px solid var(--line)}
.kpi::before{background:linear-gradient(90deg,var(--blue),transparent)}
.kpi:hover{border-color:var(--blue);box-shadow:0 8px 24px rgba(59,130,246,.15)}
```

### 3. `ol.refs` badge (chỉ relevant khi dùng numerated refs)

**AMBER**: badge gradient (như template mặc định).
**BLUE**: đổi `.ol.refs li::before{background:var(--blue)}`.

---

## Hero gradient mood

Hero gradient là chỗ duy nhất thể hiện "mood" chủ đề bài. Đổi 1 dòng `.hero{background:...}`. Pattern: 3-stop linear gradient 135deg.

| Chủ đề | Gradient | Mood |
|---|---|---|
| **BĐS dòng tiền / tài chính VN** | `linear-gradient(135deg,#422006 0%,#1e3a8a 50%,#312e81 100%)` | Nâu đất → navy (đậm, tài chính) |
| **Vĩ mô / tiền tệ** | `linear-gradient(135deg,#422006 0%,#1e3a8a 50%,#312e81 100%)` | Giống trên (cùng cụm vĩ mô) |
| **Thị trường chứng khoán TQ** | `linear-gradient(135deg,#0c4a6e 0%,#1e3a8a 50%,#312e81 100%)` | Cyan đậm → navy (lạnh, dữ liệu) |
| **Giáo dục TQ** | `linear-gradient(135deg,#064e3b 0%,#1e3a8a 50%,#312e81 100%)` | Xanh lục rêu → navy (phát triển) |
| **BĐS TQ (thị trường nóng)** | `linear-gradient(135deg,#1e3a8a 0%,#7c2d12 50%,#7f1d1d 100%)` | Navy → cam đất → đỏ đất (nóng, cảnh báo) |
| **Chính sách / khủng hoảng** | `linear-gradient(135deg,#7f1d1d 0%,#450a0a 50%,#1c1917 100%)` | Đỏ → đen (khủng hoảng) |
| **Tăng trưởng / lạc quan** | `linear-gradient(135deg,#064e3b 0%,#155e75 50%,#1e3a8a 100%)` | Xanh → teal → navy (lạc quan) |
| **Trung tính (mặc định)** | `linear-gradient(135deg,#1e293b 0%,#1e3a8a 50%,#312e81 100%)` | Slate → navy (an toàn) |

⚠️ Luôn kết thúc bằng tone tối (`#312e81` navy hoặc `#1c1917` gần đen) — để text trắng trên hero dễ đọc.

---

## Khi nào chọn cái nào

### Chọn family AMBER khi:
- Bài **tự nghiên cứu / tư duy cá nhân** — cần "accent chủ đạo" nổi bật.
- Bài phân tích **nhân quả / đánh tráo khái niệm** — num badge glow thu hút sự chú ý.
- Bài dài 15+ chương — kpi glow tạo nhịp điệu.
- Dùng flow diagram `.fd` (CSS fd phối với amber family).
- **Ví dụ thực tế:** bdong-tien, boom-tien-vixomo.

### Chọn family BLUE khi:
- Bài **policy tổng hợp / dữ liệu nhiều** — cần tone down, để data nói.
- Bài về **Trung Quốc** — xanh navy + cyan phù hợp mood dữ liệu lạnh.
- Bài có risk list `.rl` + policy timeline `.ptl` nhiều.
- **Ví dụ thực tế:** ttck-trung-quoc, giao-duc-trung-quoc, bao-cao-bds-trung-quoc.

### Chọn hero mood theo:
- **Tài chính/tiền** → nâu đất (#422006).
- **Chứng khoán/dữ liệu** → cyan đậm (#0c4a6e).
- **Giáo dục/phát triển** → rêu (#064e3b).
- **BĐS nóng/khủng hoảng** → cam-đỏ (#7c2d12 → #7f1d1d).
- **Lạc quan/tăng trưởng** → xanh-teal (#155e75).
- **Trung tính** → slate-navy (mặc định).

### Combo đề xuất

| Loại bài | Family | Mood |
|---|---|---|
| Tự nghiên cứu tài chính cá nhân VN | Amber | Nâu đất-navy |
| Báo cáo policy vĩ mô | Blue | Cyan-navy |
| Khủng hoảng thị trường | Blue | Đỏ-đen |
| BĐS / đầu tư dài hạn | Amber | BĐS-nóng (cam-đỏ) |
| Giáo dục / xu hướng xã hội | Blue | Rêu-navy |

→ Cuối cùng là **vấn đề thị hiếu**. Mood chỉ là gợi ý — đổi 1 dòng CSS, test thử, giữ cái nào hợp nhất.
