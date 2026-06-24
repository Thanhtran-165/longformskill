# Chart Recipes — Chart.js 4.4.1 cho dark theme

Recipe cho 4 loại chart phổ biến (bar / line / radar / mixed bar+line). Tất cả dùng cùng palette dark theme + cùng setup. Mỗi recipe tự chứa — copy + đổi data là chạy được.

## Mục lục

- [Setup bắt buộc](#setup-bắt-buộc)
- [Quy ước màu dark theme](#quy-ước-màu-dark-theme)
- [Recipe 1: Bar (so sánh nhóm)](#recipe-1-bar)
- [Recipe 2: Line (chuỗi thời gian)](#recipe-2-line)
- [Recipe 3: Mixed bar + line (2 trục / 2 đơn vị)](#recipe-3-mixed-bar--line)
- [Recipe 4: Radar (đánh giá nhiều chiều)](#recipe-4-radar)
- [Pitfalls](#pitfalls)

---

## Setup bắt buộc

Ở đầu `<script>` đầu tiên (chỉ 1 lần cho toàn bài):

```js
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = '-apple-system, Segoe UI, Roboto, sans-serif';
Chart.defaults.borderColor = '#334155';
```

- `#94a3b8` = `--muted` → text legend/axis/label.
- `#334155` = `--line` → grid line.

✅ Thiếu setup → chart hiện text đen trên nền tối, không đọc được.

---

## Quy ước màu dark theme

6 accent ngữ nghĩa (trùng CSS `:root`). Dùng pattern `rgba(R,G,B, alpha)` cho fill (mờ), hex cho border/point (đậm):

| Vai trò | Hex | Fill pattern | Khi dùng |
|---|---|---|---|
| Red (tiêu cực/thấp/rủi ro) | `#ef4444` | `rgba(239,68,68,.65)` | DSCR thấp, yield dưới lạm phát |
| Amber (accent chính) | `#f59e0b` / `#fbbf24` | `rgba(245,158,11,.65)` | Số liệu chính |
| Green (tích cực/cao) | `#22c55e` | `rgba(34,197,94,.65)` | Yield cao, CoC tốt |
| Blue (info/trung tính) | `#3b82f6` | `rgba(59,130,246,.65)` | Data 2 trong compare |
| Violet (info2) | `#8b5cf6` | `rgba(139,92,246,.65)` | Data 3 |
| Cyan (info3) | `#06b6d4` | `rgba(6,182,212,.65)` | Data 4 |

⚠️ **KHÔNG dùng doughnut/pie/polarArea** — không phù hợp style, khó đọc ở dark theme. Dùng bar thay cho pie.

---

## Recipe 1: Bar

So sánh nhóm / phân loại. Phổ biến nhất.

```js
new Chart(document.getElementById('chartBar'), {
  type:'bar',
  data:{ labels:['Căn hộ HCM','Căn hộ HN','Căn hộ BD','Nhà phố','Phòng trọ'],
    datasets:[
      { label:'Gross Yield (%)', data:[3.8,4.0,6.5,3.0,18],
        backgroundColor:'rgba(59,130,246,.65)', borderRadius:5 }
    ]
  },
  options:{ responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:true, position:'top', labels:{color:'#e2e8f0', font:{size:11}}},
      tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+c.parsed.y+'%';}}} },
    scales:{ y:{ beginAtZero:true, grid:{color:'#334155'}, title:{display:true, text:'% / năm', color:'#94a3b8'} },
      x:{ grid:{display:false}, ticks:{font:{size:10}} } }
  }
});
```

- So sánh 2 dataset → thêm 1 object vào `datasets[]` với màu khác (vd red vs green).
- `borderRadius:5` = bo góc bar — trông mềm hơn.
- ✅ `y.beginAtZero:true` cho bar (tránh hiểu lầm tỷ lệ).

## Recipe 2: Line

Chuỗi thời gian / xu hướng.

```js
new Chart(document.getElementById('chartLine'), {
  type:'line',
  data:{ labels:['2021','2022','2023','2024','2025'],
    datasets:[
      { label:'Giá căn hộ HCM (tỷ/căn)', data:[2.8,3.5,4.2,5.0,5.5],
        borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,.15)',
        tension:.3, borderWidth:3, pointRadius:5, pointBackgroundColor:'#f59e0b', fill:true },
      { label:'Tiền thuê (tr/tháng)', data:[10,11,12,13,14],
        borderColor:'#22c55e', backgroundColor:'rgba(34,197,94,.15)',
        tension:.3, borderWidth:3, pointRadius:5, pointBackgroundColor:'#22c55e', fill:true }
    ]
  },
  options:{ responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:true, position:'top', labels:{color:'#e2e8f0', font:{size:11}}},
      tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+c.parsed.y;}}} },
    scales:{ y:{ beginAtZero:false, grid:{color:'#334155'} },
      x:{ grid:{display:false}, ticks:{font:{size:10}} } }
  }
});
```

- `tension:.3` = đường cong nhẹ (không gãy khúc).
- `fill:true` + `backgroundColor` mờ = vùng fill dưới đường.
- `pointRadius:5` + `pointBackgroundColor` = chấm to dễ thấy.

## Recipe 3: Mixed bar + line

2 dataset khác type trong cùng chart — vd yield (bar) + benchmark (line đỏ). **Pattern phổ biến nhất** trong báo cáo thực tế.

```js
new Chart(document.getElementById('chartMixed'), {
  type:'bar',
  data:{ labels:['HCM','HN','BD','Nhà phố','DV','Phòng trọ'],
    datasets:[
      { label:'Gross Yield (%)', type:'bar', data:[3.8,4.0,6.5,3.0,10,18],
        backgroundColor:'rgba(59,130,246,.65)', borderRadius:5, order:2 },
      { label:'Lạm phát (benchmark)', type:'line', data:[4.5,4.5,4.5,4.5,4.5,4.5],
        borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.15)',
        tension:0, borderWidth:2, borderDash:[6,4], pointRadius:0, fill:false, order:1 }
    ]
  },
  options:{ responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:true, position:'top', labels:{color:'#e2e8f0', font:{size:11}}},
      tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+c.parsed.y+'%';}}} },
    scales:{ y:{ beginAtZero:true, grid:{color:'#334155'}, title:{display:true, text:'% / năm', color:'#94a3b8'} },
      x:{ grid:{display:false}, ticks:{font:{size:10}} } }
  }
});
```

- `order:1` (line) hiển thị **trên** `order:2` (bar) — line không bị bar che.
- ✅ Benchmark dùng `type:'line'` + `borderDash:[6,4]` (nét đứt) + `pointRadius:0` (không chấm) = đường tham chiếu rõ ràng.
- ✅ Tooltip callback: dùng `function(c){...}` KHÔNG dùng arrow `c => ...` (tránh parser edge case).

## Recipe 4: Radar

Đánh giá nhiều chiều (5-7 trục). Dùng cho "profile" tài sản / đánh giá tổng hợp.

```js
new Chart(document.getElementById('chartRadar'), {
  type:'radar',
  data:{ labels:['Yield','Thanh khoản','An toàn','Tăng giá','Vận hành','Thuế'],
    datasets:[
      { label:'Căn hộ HCM', data:[3,7,6,8,4,5],
        borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,.2)',
        borderWidth:2, pointBackgroundColor:'#3b82f6', pointRadius:4 },
      { label:'Phòng trọ', data:[9,5,5,3,8,7],
        borderColor:'#22c55e', backgroundColor:'rgba(34,197,94,.2)',
        borderWidth:2, pointBackgroundColor:'#22c55e', pointRadius:4 }
    ]
  },
  options:{ responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:true, position:'top', labels:{color:'#e2e8f0', font:{size:11}}} },
    scales:{ r:{ beginAtZero:true, max:10, suggestedMin:0,
        grid:{color:'#334155'}, angleLines:{color:'#334155'},
        pointLabels:{color:'#cbd5e1', font:{size:11}},
        ticks:{color:'#94a3b8', backdropColor:'transparent', font:{size:9}} } }
  }
});
```

- Radar dùng `scales.r` (không phải `scales.y/x`).
- ✅ 5-7 trục là sweet spot. Quá nhiều → rối.
- ✅ 2-3 dataset overlay để so sánh profile.

---

## Pitfalls

### Pitfall 1 — Quên setup `Chart.defaults`
❌ Mỗi chart tự set `color`/`font` riêng → không đồng nhất, lặp code.
✅ Set 1 lần ở đầu script đầu tiên. Tất cả chart inherit.

### Pitfall 2 — Tooltip arrow function parser issue
❌ `callbacks:{label:c=>c.dataset.label+': '+c.parsed.y}` — một số edge case parser fail.
✅ `callbacks:{label:function(c){return c.dataset.label+': '+c.parsed.y;}}` — luôn chạy được.

### Pitfall 3 — `<canvas>` count ≠ `new Chart` count
❌ Canvas rỗng (trắng) vì quên `new Chart`, hoặc 2 `new Chart` trùng id.
✅ Verify:
```bash
grep -c "<canvas" report.html   # số canvas
grep -c "new Chart" report.html  # số new Chart
# Phải bằng nhau.
```

### Pitfall 4 — Mixed chart line bị bar che
❌ Không set `order` → line nằm dưới bar, không thấy.
✅ Line `order:1`, bar `order:2` (số nhỏ hơn = z-index cao hơn).

### Pitfall 5 — Chart CDN fail offline
❌ Mở file không có mạng → chart trống không có lỗi console.
✅ Đối với bài quan trọng, download `chart.umd.min.js` local và đổi `<script src>` thành relative path. Hoặc thêm `<noscript>` fallback text.

### Pitfall 6 — `maintainAspectRatio:false` thiếu
❌ Chart chiếm cao khổng lồ hoặc bị crop.
✅ Luôn set `maintainAspectRatio:false` + bọc `<canvas>` trong `.chart-wrap` (height 320px).
