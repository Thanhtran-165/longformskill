# Atlas Data Schema — 13 file JSON + Tier + Confidence

Schema dữ liệu cho **mode atlas** (skill `longform`). Rút chủ yếu từ **Global AI Industry Atlas** (13 file) + confidence tier từ **China AI Industrial Atlas**.

> ⚠️ Đọc trước khi viết `data/*.json`. Chạy `node "$SKILL_DIR/scripts/validate_atlas_data.js" data/` để verify 5 gate.

## Mục lục

- [§1 Pattern `{meta, <plural_key>}` wrapper](#1-pattern-meta-plural_key-wrapper)
- [§2 13 file + entity schema](#2-13-file--entity-schema)
- [§3 Tier system (A/B/C)](#3-tier-system-abc)
- [§4 Confidence tier (4 mức)](#4-confidence-tier-4-mức)
- [§5 Source registry + citation pattern](#5-source-registry--citation-pattern)
- [§6 CHOKEPOINT / BOTTLENECK flag (normalize enum)](#6-chokepoint--bottleneck-flag-normalize-enum)
- [§7 Claim vs Insight vs Scenario — 3 lớp phân biệt](#7-claim-vs-insight-vs-scenario--3-lớp-phân-biệt)

---

## §1 Pattern `{meta, <plural_key>}` wrapper

**Mọi JSON file** bắt đầu bằng 2 key:

```json
{
  "meta": {
    "version": "1.0.0",
    "last_updated": "2026-07-18",
    "count": 22,
    "description": "22 segments lớp chuỗi giá trị AI",
    "notes": "Có thể có note phụ"
  },
  "segments": [ ... ]
}
```

| Key meta | Bắt buộc | Ý nghĩa |
|---|---|---|
| `version` | ✅ | Semver của data |
| `last_updated` | ✅ | YYYY-MM-DD |
| `count` | ✅ | Số entity trong file (để validate) |
| `description` | ✅ | 1 câu mô tả nội dung file |
| `notes` | optional | Ghi chú phương pháp collect |

**Key data** = plural của entity type (`segments`, `companies`, `founders`, `sources`...).

### Mẫu thực tế tham chiếu
- **Global Atlas** `data/segments.json:1-5` — `{version, lastUpdated, description, segments[]}`.
- **China Atlas** `data/companies.json` — `{meta: {...}, companies: [...]}` cùng pattern.

---

## §2 13 file + entity schema

Danh sách 13 file chuẩn (rút từ Global Atlas). Project nhỏ có thể **chỉ cần 4-5 file** (segments + companies + sources + founders). Thêm bớt tùy scope.

| File | Count (Global) | Plural key | Entity chính |
|---|---|---|---|
| `_summary.json` | 1 | coverage + qaStatus | metadata tổng |
| `segments.json` | 22 | `segments[]` | Lớp chuỗi giá trị |
| `companies.json` (Tier A) | 57 | `companies[]` | Entity chính, full schema |
| `companies-tier-b.json` | 186 | `companies[]` | Schema gọn hơn |
| `companies-tier-c.json` | 34 | `companies[]` | Schema ngắn nhất |
| `founders.json` | 105 | `founders[]` | Người sáng lập |
| `sources.json` | 723 | `sources[]` | Nguồn dẫn (registry) |
| `concepts.json` | 60 | `concepts[]` | Khái niệm/lý thuyết |
| `insights.json` | 25 | `insights[]` | Finding + mechanism |
| `scenarios.json` | 7 | `scenarios[]` | Kịch bản tương lai |
| `countries.json` | 14 | `countries[]` | Quốc gia/vùng |
| `relationships.json` | 348 | `relationships[]` | Edge giữa entities |
| `claims.json` | 307 | `claims[]` | Evidence hạt (định lượng) |

### Schema segment
```json
{
  "id": "layer-08-ai-accelerators",
  "layer": 8,
  "name": "AI Accelerator / Custom Silicon",
  "nameEn": "AI Accelerator",
  "category": "hardware",
  "definition": "Chip thiết kế riêng cho AI workload (training + inference). Bao gồm GPU datacenter, ASIC, FPGA.",
  "role": "Cung cấp năng lực tính toán cho AI",
  "bottleneck": "Nvidia chiếm ~80% thị phần training, tạo ra single-point-of-failure",
  "keyMetrics": ["market_share", "compute_density", "energy_efficiency"],
  "economics": "Margin 70-80% cho leader, 12-25% cho ODM",
  "risks": ["Geopolitics", "Concentration risk", "Energy constraint"],
  "companyIds": ["COMP_NVDA", "COMP_AVGO", "COMP_AMD"],
  "tier": "chokepoint-core",
  "attractivenessScore": 9,
  "attractivenessConfidence": "Verified",
  "lastVerified": "2026-06-15"
}
```

### Schema company (Tier A — full)
```json
{
  "id": "COMP_NVDA",
  "name": "Nvidia",
  "legalName": "NVIDIA Corporation",
  "tier": "A",
  "country": "US",
  "region": "North America",
  "hq": "Santa Clara, CA",
  "founded": 1993,
  "status": "public",
  "ticker": "NVDA",
  "exchange": "NASDAQ",
  "website": "https://nvidia.com",
  "segments": ["layer-08-ai-accelerators", "layer-09-networking"],
  "founderIds": ["FOUND_JEN_HSON_HUANG"],
  "ceoId": "FOUND_JEN_HSON_HUANG",
  "ceoFounderLed": true,
  "description": "Leader in GPU/AI accelerators...",
  "products": ["H100", "B100", "Hopper", "Blackwell"],
  "customers": ["Microsoft", "Google", "Meta", "Amazon"],
  "financials": {
    "revenueUSD": {
      "fy2024": { "value": 60.9, "unit": "B", "fiscalYear": 2024, "sourceIds": ["S001"], "confidence": "Verified" }
    },
    "grossMargin": { "value": 73.1, "unit": "%", "asOf": "fy2024", "sourceIds": ["S001"], "confidence": "Verified" },
    "marketCapUSD": { "value": 3100, "unit": "B", "asOf": "2026-06-15", "sourceIds": ["S012"], "confidence": "Triangulated" },
    "employees": { "value": 29600, "asOf": "fy2024", "sourceIds": ["S001"] }
  },
  "valueChainPosition": {
    "inputs": ["layer-05-foundry (TSMC)", "layer-06-memory-hbm (SK Hynix)"],
    "customers": ["Microsoft", "Google", "Meta"],
    "keyBottleneck": "TSMC leading-edge capacity",
    "dependsOn": ["layer-05-foundry", "layer-06-memory-hbm", "layer-07-advanced-packaging"],
    "dependedUponBy": ["layer-13-hyperscaler-cloud", "layer-17-foundation-models"]
  },
  "moats": ["CUDA ecosystem", "Brand", "Scale R&D"],
  "risks": ["Geopolitics China", "Competition custom silicon"],
  "sourceIds": ["S001", "S012", "S033"],
  "confidence": "Verified",
  "lastVerified": "2026-06-15"
}
```

### Schema company (Tier B — gọn hơn)
```json
{
  "id": "COMP_EXAMPLE",
  "name": "Example Corp",
  "tier": "B",
  "country": "US",
  "region": "North America",
  "segments": ["layer-08-ai-accelerators"],
  "status": "public",
  "ticker": "EXMP",
  "tags": ["ASIC", "custom_silicon"],
  "founded": 2018,
  "description": "...",
  "financials": {},
  "valueChainPosition": {},
  "moats": [],
  "risks": []
}
```

### Schema company (Tier C — ngắn nhất)
```json
{
  "id": "COMP_SMALL",
  "name": "Small Startup",
  "tier": "C",
  "country": "US",
  "region": "North America",
  "segments": ["layer-08-ai-accelerators"],
  "status": "private",
  "parent": "Some Parent Co",
  "tags": ["startup"]
}
```

### Schema founder
```json
{
  "id": "FOUND_JEN_HSON_HUANG",
  "name": "Jensen Huang",
  "nameVi": "Jensen Hoàng",
  "companyIds": ["COMP_NVDA"],
  "role": "CEO & Founder",
  "stillRunning": true,
  "nationality": "US (born Taiwan)",
  "yearOfBirth": 1963,
  "education": [
    { "degree": "BSEE", "institution": "Oregon State University", "field": "Electrical Engineering", "year": 1984, "sourceIds": ["S045"], "confidence": "Verified" },
    { "degree": "MSEE", "institution": "Stanford University", "field": "Electrical Engineering", "year": 1992, "sourceIds": ["S045"], "confidence": "Verified" }
  ],
  "formerEmployers": [
    { "company": "AMD", "role": "Marketing", "years": "1984-1985" },
    { "company": "LSI Logic", "role": "Director", "years": "1985-1993" }
  ],
  "notableWork": "Pioneered GPU computing with CUDA (2007)",
  "sourceIds": ["S045", "S046"],
  "tags": ["founder_factory_stanford", "engineer_turned_ceo"]
}
```

### Schema source (registry)
```json
{
  "id": "S001",
  "title": "Nvidia FY2024 10-K Annual Report",
  "publisher": "SEC EDGAR",
  "url": "https://www.sec.gov/...",
  "publicationDate": "2024-02-21",
  "accessDate": "2026-06-15",
  "tier": "T1",
  "documentType": "annual_report",
  "notes": "BCTC chính thức — Verified tier"
}
```

| Source tier | Ý nghĩa |
|---|---|
| **T1** | Văn bản chính thức (BCTC, văn bản pháp luật, paper peer-reviewed) |
| **T2** | Báo cáo CK / research report uy tín |
| **T3** | Báo chính thống (Reuters, Bloomberg, FT) |
| **T4** | Blog / Wikipedia / source không peer-review |

### Schema relationship (edge)
```json
{
  "id": "REL_001",
  "fromCompanyId": "COMP_SK_HYNIX",
  "toCompanyId": "COMP_NVDA",
  "type": "supplier",
  "subtype": "HBM_supplier",
  "details": "SK Hynix cung cấp HBM3 cho Nvidia H100",
  "sourceIds": ["S067", "S089"],
  "confidence": "Verified",
  "lastVerified": "2026-06-15"
}
```

`type` ∈ `{supplier, investor, customer, competitor, partner, founded, studied_at, worked_at}`.

### Mẫu thực tế tham chiếu
- **Global Atlas** `data/companies.json:5-...` — Tier A full schema.
- **Global Atlas** `data/companies-tier-b.json:7-25` — Tier B empty-object placeholder (bảo toàn shape).
- **China Atlas** `data/companies.json` — schema sâu hơn (`customers_verified`, `confidence` per field).

---

## §3 Tier system (A/B/C)

**3 lớp company** với depth giảm dần. Merge tại runtime (`state.data.companies_all`).

| Tier | Depth | Khi nào dùng | Count (Global) |
|---|---|---|---|
| **A** | Full schema (financials đầy đủ, value chain position, moats) | Top players — phân tích sâu | 57 |
| **B** | Schema gọn (segments + ticker + description) | Mid-tier — reference table | 186 |
| **C** | Schema ngắn nhất (id + name + segments + tags) | Long tail — để có complete registry | 34 |

### Merge tại runtime
```js
// app.js sau khi loadData
state.data.companies_all = [
  ...(state.data.companies?.companies || []),
  ...(state.data['companies-tier-b']?.companies || []),
  ...(state.data['companies-tier-c']?.companies || []),
];
```

### Build script merge
**Global Atlas** `build.js:68-71` merge 3 tier thành `data.companies_all` khi build self-contained.

### Tại sao tách 3 tier?
- Tránh **1 file quá lớn** (Tier A 178KB với 57 entity — nếu gộp với 277 entity thì ~1MB khó edit).
- **Validate khác nhau** — Tier A check financials đầy đủ, Tier C chỉ check id + name.
- **Render khác nhau** — Tier A có full profile view, Tier C chỉ liệt kê trong table.

### Mẫu thực tế tham chiếu
- **Global Atlas** `data/companies.json` + `companies-tier-b.json` + `companies-tier-c.json` — 3 file pattern.

---

## §4 Confidence tier (4 mức)

**Mọi claim định lượng** (revenue, market share, founded year, education...) phải có `confidence` field.

| Tier | Ý nghĩa | CSS color | Điều kiện |
|---|---|---|---|
| **Verified** | Công bố chính thức | `--conf-verified` (mint teal) | BCTC, văn bản pháp luật, paper peer-reviewed |
| **Triangulated** | ≥2 nguồn độc lập khớp | `--conf-triangulated` (cyan) | Vd 2 báo CK + 1 báo chính thống |
| **Estimated** | 1 nguồn + phương pháp | `--conf-estimated` (gold) | Nội suy/ước tính minh bạch |
| **Unknown** | Chưa đủ thông tin | `--conf-unknown` (slate) | Dùng tạm, **flag để bổ sung** |

### Apply ở 2 cấp
1. **Per-claim** (trong financials/education): `"confidence": "Verified"` trên từng số.
2. **Per-entity** (top-level): `"confidence": "Triangulated"` cho toàn entity.

### CSS class
```css
.conf-Verified     { color: var(--conf-verified); }
.conf-Triangulated { color: var(--conf-triangulated); }
.conf-Estimated    { color: var(--conf-estimated); }
.conf-Unknown      { color: var(--conf-unknown); }
```

### Render helper
```js
function confidenceTag(level) {
  return el('span', { class: `conf-tag conf-${level || 'Unknown'}`, text: level || 'Unknown' });
}
```

### Mẫu thực tế tham chiếu
- **China Atlas** `data/companies.json` meta `confidence_legend` — định nghĩa 4 mức.
- **China Atlas** `app.js:182-186` — `relConfidenceTag(c)` helper.
- **China Atlas** `styles.css:75-78` — 4 CSS color token.

### ❌ Không có confidence = không có dữ liệu
Nếu không verify được → **không bịa**, ghi `Unknown` + flag để bổ sung. **Pitfall 6 article mode vẫn áp dụng** cho atlas.

---

## §5 Source registry + citation pattern

**Mọi entity** có mảng `sourceIds[]` tham chiếu tới `data/sources.json`.

### Pattern citation xuyên suốt
```
claim trong entity → sourceIds: ["S001", "S012"]
                         ↓
data/sources.json → { id: "S001", title: "Nvidia 10-K", url: "...", tier: "T1" }
                         ↓
UI: <a class="src-ref" data-nav="methodology">S001</a>
     tooltip: "Source S001 — Nvidia 10-K (SEC EDGAR)"
     click → navigate('methodology')
```

### Render `sourceRefs(sourceIds)`
```js
function sourceRefs(sourceIds) {
  if (!sourceIds || !sourceIds.length) return null;
  const wrap = el('span', { class: 'source-refs' });
  sourceIds.forEach((sid) => {
    const src = state.data.sources?.sources?.find((s) => s.id === sid);
    wrap.appendChild(el('a', {
      class: 'src-ref',
      href: '#/methodology',
      title: src ? `Source ${sid} — ${src.title}` : `Source ${sid}`,
      'data-nav': 'methodology',
      text: sid,
    }));
  });
  return wrap;
}
```

### Mẫu thực tế tham chiếu
- **China Atlas** `data/sources.json` — registry ~200 source với `{id: "S001", name, type, publisher, url, date}`.
- **China Atlas** `app.js:188-195` — `sourceRefs(ids)` render với tooltip.

### ❌ Không có source = không có dữ liệu
**Pitfall 6 article mode**: nếu claim không có source → **không bịa số**. Dùng range hoặc ghi rõ "chưa xác minh" + flag.

---

## §6 CHOKEPOINT / BOTTLENECK flag (normalize enum)

**Pitfall thực tế từ Global Atlas** — `tier` field dạng string free-form → highlight logic sai.

### ❌ Sai (Global Atlas `atlas.js:117`)
```js
const isChokepoint = (s.tier || '').includes('chokepoint');
// → bỏ sót 'bottleneck-material' và 'emerging-bottleneck'
```

### ✅ Normalize enum
```json
{
  "tier": "chokepoint-core"
}
```

Enum chuẩn (mở rộng theo scope project):

| Giá trị tier | Ý nghĩa | Highlight |
|---|---|---|
| `chokepoint-core` | Nút thắt cốt lõi (Nvidia GPU, TSMC leading-edge) | Gold border + ⚠️ icon |
| `chokepoint` | Nút thắt đáng kể | Gold border |
| `bottleneck-material` | Nút thắt vật liệu (HBM, photoresist) | Amber border |
| `emerging-bottleneck` | Nút thắt đang hình thành | Dashed amber |
| `core-platform` | Layer nền tảng (cloud, model) | No highlight |
| `application` | Layer ứng dụng | No highlight |
| `enabling` | Layer enabling (data, dev tools) | No highlight |

### Check chuẩn
```js
function isBottleneck(seg) {
  const t = seg.tier || '';
  return t === 'chokepoint-core' || t === 'chokepoint'
      || t === 'bottleneck-material' || t === 'emerging-bottleneck';
}
```

### Validate schema
`validate_atlas_data.js` sẽ FAIL nếu `tier` không thuộc enum.

---

## §7 Claim vs Insight vs Scenario — 3 lớp phân biệt

3 file JSON dễ nhầm. Phân biệt rõ:

### Claim — evidence hạt (định lượng)
```json
{
  "id": "CLM_001",
  "content": "Nvidia FY2024 revenue đạt 60.9 tỷ USD",
  "companyId": "COMP_NVDA",
  "segmentId": "layer-08-ai-accelerators",
  "sourceId": "S001",
  "sourceTier": "T1",
  "publicationDate": "2024-02-21",
  "accessDate": "2026-06-15",
  "confidence": "Verified",
  "conflict": false,
  "notes": "BCTC 10-K chính thức"
}
```

### Insight — finding + mechanism (rút từ nhiều claim)
```json
{
  "id": "INS_001",
  "name": "Profit pool tập trung ở chokepoint",
  "category": "economic_structure",
  "tags": ["margin", "bottleneck"],
  "finding": "Margin leader (Nvidia/Broadcom/Synopsys) đạt 50-80%, ODM chỉ 12-25%",
  "supportingData": [
    { "company": "COMP_NVDA", "metric": "grossMargin", "value": 73.1, "sourceIds": ["S001"], "confidence": "Verified" },
    { "company": "COMP_AVGO", "metric": "grossMargin", "value": 74.0, "sourceIds": ["S033"], "confidence": "Verified" }
  ],
  "mechanism": "Bottleneck = ít substitute → pricing power → margin cao. ODM = commodity competition → margin thấp.",
  "companyIds": ["COMP_NVDA", "COMP_AVGO"],
  "segmentIds": ["layer-08-ai-accelerators"],
  "conditionsTrue": ["Bottleneck có 1-3 supplier chính", "Customer không thể backward integrate"],
  "confidence": "Triangulated",
  "sourceIds": ["S001", "S033"]
}
```

### Scenario — forecast có điều kiện invalidate
```json
{
  "id": "SCN_001",
  "name": "Taiwan conflict disrupts TSMC",
  "category": "geopolitical",
  "probability": "low-medium",
  "trigger": "Xung đột quân sự hoặc blockade Đài Loan",
  "assumptions": [
    "TSMC ~90% leading-edge capacity bị gián đoạn >6 tháng",
    "Inventory buffer client 3-6 tháng không đủ"
  ],
  "winners": ["COMP_INTEL (foundry alternative)", "COMP_SAMSUNG"],
  "losers": ["COMP_NVDA", "COMP_APPLE", "COMP_AMD"],
  "bottlenecks": ["Leading-edge foundry", "CoWoS packaging"],
  "financialEffects": [
    "Global AI capex giảm 40-60% trong 12-18 tháng",
    "Semiconductor price spike 2-3x"
  ],
  "metricsToWatch": ["TSMC utilization rate", "Geopolitical tension index"],
  "invalidationConditions": [
    "TSMC Arizona fab đạt 4nm production trước xung đột",
    "Diplomatic resolution"
  ]
}
```

### So sánh
| Lớp | Bản chất | Có mechanism? | Có forecast? | Có invalidate? |
|---|---|---|---|---|
| **Claim** | Fact đơn lẻ | ❌ | ❌ | ❌ |
| **Insight** | Pattern từ claim | ✅ | ❌ (hiện tại) | ❌ |
| **Scenario** | Kịch bản tương lai | ✅ (implicit) | ✅ | ✅ |

### Validate gate
`validate_atlas_data.js` Content Gate bắt buộc:
- Claim: `content` field không rỗng.
- Insight: `mechanism` field ≥20 chars (chống rỗng/lorem).
- Scenario: `trigger` + `assumptions[]` không rỗng.

### Mẫu thực tế tham chiếu
- **Global Atlas** `data/claims.json:7-20` — claim schema (1 `sourceId` single, không mảng).
- **Global Atlas** `data/insights.json` — insight schema (finding + supportingData + mechanism).
- **Global Atlas** `data/scenarios.json` — scenario schema (trigger + assumptions + winners/losers + invalidationConditions).

---

## Checklist trước khi done data

- [ ] Mọi file có `{meta, <plural_key>}` wrapper với `version, last_updated, count, description`.
- [ ] Mọi entity có `id` unique trong file.
- [ ] Mọi claim định lượng có `sourceIds[]` + `confidence` (Verified/Triangulated/Estimated/Unknown).
- [ ] `tier` field của segment thuộc enum chuẩn (không free-form).
- [ ] `sources.json` có entry cho mọi `S***` ID được reference.
- [ ] Company Tier A có financials đầy đủ; Tier B/C schema gọn hơn (empty-object placeholder).
- [ ] Chạy `node "$SKILL_DIR/scripts/validate_atlas_data.js" data/` → PASS 5 gate.
- [ ] Chạy `node "$SKILL_DIR/scripts/qa_atlas.js"` → 0 dangling ref FAIL.
