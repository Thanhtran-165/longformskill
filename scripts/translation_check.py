#!/usr/bin/env python3
"""
Translation Check — Hậu kỳ dịch Anh–Việt cho longform report
Chạy Bước 5c (xem SKILL.md). Kiểm tra lỗi dịch sâu hơn grep thủ công.

Usage:
  python3 translation_check.py /path/to/report.html
  python3 translation_check.py /path/to/report.html --strict   # exit 1 nếu có warning

Checks (8 nhóm):
  1. Thuật ngữ Anh không gloss (lần đầu phải có gloss VN)
  2. Cụm kỳ quặc đã biết (catalog lỗi thật)
  3. Câu dịch máy (cấu trúc: "sự + V", "đã được + V", "về mặt + adj")
  4. Câu quá dài / nhiều gạch ngang (dấu hiệu dịch sát)
  5. Lặp từ trong đoạn (tài sản, vàng, NHTW > 3 lần)
  6. Tag HTML không khớp (mở em/đóng strong)
  7. Ký tự CJK / typo thường gặp
  8. Idiom/ẩn dụ Mỹ-Âu không gloss

Output:
  - Mỗi issue: dòng + loại + gợi ý sửa
  - Exit code: 0 = pass, 1 = có warning (--strict), 2 = có error

Cập nhật catalog lỗi: xem references/translation_vi.md
"""

import re
import sys
from pathlib import Path

# ============================================================
# CATALOG LỖI (cập nhật khi gặp lỗi mới — xem translation_vi.md)
# ============================================================

# 1. Thuật ngữ Anh tài chính — cần gloss tiếng Việt khi xuất hiện (lần đầu)
# Format: (term, gloss_vi, note)
GLOSSARY_REQUIRED = [
    # Vĩ mô / tiền tệ
    ("monetary base", "cơ sở tiền (M0)", "KHÔNG 'base tiền'"),
    ("balance sheet", "bảng cân đối kế toán", ""),
    ("custody holdings", "số dư lưu ký", "'lưu ký' chuẩn hơn 'ký gửi'"),
    ("basis trade", "giao dịch chênh lệch đòn bẩy", ""),
    ("quantitative easing", "nới lỏng định lượng", "QE"),
    ("yield curve control", "kiểm soát đường cong lợi suất", "YCC"),
    ("financial repression", "trấn áp tài chính", ""),
    ("fiat money", "tiền pháp định", ""),
    ("helicopter money", "tiền trực thăng", ""),
    ("velocity of money", "tốc độ lưu thông tiền", ""),
    ("stagflation", "lạm phát đình trệ", "giữ 'stagflation' + gloss 'đình trệ'"),
    ("real yield", "lãi suất thực", "thị trường VN dùng 'lãi suất thực'"),
    ("malinvestment", "đầu tư sai lầm", "rõ hơn 'sai lệch'"),
    ("time preference", "tỷ lệ ưu tiên thời gian", "sát nghĩa Mises"),
    # CK / kỳ hoán
    ("margin call", "lệnh ký quỹ", ""),
    ("drawdown", "sụt giảm từ đỉnh", ""),
    ("capitulation", "bỏ cuộc / đầu hàng", ""),
    ("short squeeze", "đợt bóp short", "VN cũng dùng 'bóp short'"),
    ("crowded trade", "vị thế đông đúc", "KHÔNG 'giao dịch đông đúc'"),
    ("price taker", "chấp nhận giá thụ động", "rõ hơn 'người chịu giá'"),
    ("price maker", "người định giá", ""),
    ("multiple expansion", "mở rộng bội số", "chuẩn kinh tế VN — rõ hơn 'giãn đa số'"),
    ("safe haven", "trú ẩn an toàn", ""),
    ("tailwind", "gió thuận", "idiom kinh tế"),
    ("headwind", "gió ngược", "idiom kinh tế"),
    # Vàng / khai khoáng
    ("bullion", "vàng thỏi", ""),
    ("allocated gold", "vàng phân bổ", ""),
    ("unallocated gold", "vàng không phân bổ", ""),
    ("paper gold", "vàng giấy", ""),
    ("all-in sustaining cost", "chi phí duy trì toàn phần", "AISC"),
    ("royalty", "quyền thu phí", ""),
    ("streaming", "dòng sản lượng", ""),
    ("off-take", "hợp đồng bao tiêu", ""),
    ("hallmarking", "đóng dấu xác thực", "rõ hơn 'chứng nhận'"),
    ("grade", "hàm lượng quặng", "khai khoáng"),
    # Địa chính trị
    ("land power", "quyền lực đất liền", ""),
    ("sea power", "quyền lực biển", ""),
    ("reserve currency", "tiền dự trữ", ""),
    ("hegemon", "cường quốc bá quyền", ""),
]

# 2. Cụm kỳ quặc đã gặp (format: cụm sai → gợi ý sửa)
AWKWARD_PHRASES = {
    "xoáy nợ": "đẩy nợ vào vòng xoáy",
    "kìm bond": "kìm giá trái phiếu",
    "siết kinh tế": "siết chặt kinh tế",
    "chiếu hạ tầng": "dự phóng hạ tầng",
    "vô luận về giá": "không quan tâm giá",
    "người cầu vô co giãn": "nhóm cầu không co giãn theo giá",
    "rời cõi lý thuyết": "vượt ra ngoài lý thuyết suông",
    "mang tính chương trình": "mang tính định hướng chính sách",
    "toàn光谱": "trên mọi mặt",
    "toàn spectrumre": "trên mọi mặt",
    "BảnCompact": "Bản Compact",
    "giao dịch đông đúc": "vị thế đông đúc (crowded trade)",
    "vận hành mounting": "vận hành ngày càng trầm trọng",
    "mainstream hoài nghi": "giới phân tích chính thống hoài nghi",
    "khi đóng nhịp": "khi chốt phiên / tính đến đáy",
    "tài sản trú ẩn thất bại": "tài sản trú ẩn đã thất bại",
    "thuốc đồng cân": "từng liều nhỏ (kiểu homeopathic)",
    "lời ái ngãi": "cái gật đầu vinh danh",
    "cú gạt đầu": "cú chốt hạ",
    "trói buộc kinh tế": "áp lực kinh tế",
    "sự bàn giao": "sự chuyển giao vai trò",
    "base tiền": "cơ sở tiền (M0)",
    "phá vỡ lịch sử": "tái định giá mang tầm lịch sử",
    "không phải mặc dù": "không phải vì [yếu] mà chính vì [dễ bán]",
}

# 3. Idiom/ẩn dụ Mỹ-Âu cần gloss
IDIOMS_NEED_GLOSS = [
    "Tom Hanks COVID",
    "Wile E. Coyote",
    "Hautacam",
    "domestique",
    "Kobayashi Maru",
    "Mallorca",
    "for want of a nail",
    "Reverse Perestroika",
    "DragonBear",
    "Bretton Woods III",
    "Pax Americana",
    "Gilded Age",
    "Great Moderation",
    "Lost decade",
    "Suez Crisis",
    "Stairway to Heaven",
    "Highway to Hell",
]

# 4. Typo thường gặp
KNOWN_TYPOS = ["revisi", "spectrumre", "mounting ", "hallmarking bắt buộc"]

# 5. Pattern dấu hiệu dịch máy (regex)
MACHINE_TRANSLATION_PATTERNS = [
    (r"\bSự (bào mòn|rời bỏ|sụp đổ|đóng băng|tích lũy|luân chuyển|đảm bảo|phát hành|khẳng định|chuyển dịch|bàn giao)\b",
     "'sự + V' trừu tượng — thử đổi sang chủ động"),
    (r"\bđã được (chứng minh|xây dựng|tích lũy|thảo luận|ghi nhận)\b",
     "'đã được + V' bị động — thử bỏ 'được'"),
    (r"\bđang được (định hình|thảo luận|theo dõi)\b",
     "'đang được + V' bị động"),
    (r"\bvề mặt [a-zạảầẩẫậắằẳẵặẹẻẽếềểễệịỉọỏốồổỗộớờởỡợụủứừửữự]{3,}\b",
     "'về mặt + tính từ' — cố vấn Anh"),
    (r"\bsẽ\b.*\bsẽ\b.*\bsẽ\b",
     "lặp 'sẽ' 3+ lần (dịch 'will')"),
]


# ============================================================
# CHECK FUNCTIONS
# ============================================================

def load_html_text(html_path):
    """Đọc HTML, tách text hiển thị (bỏ CSS/JS/tags)."""
    html = Path(html_path).read_text(encoding="utf-8")
    # Bỏ <style>, <script>
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S | re.I)
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.S | re.I)
    # Bỏ comments
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    return html


def get_line_number(html, position):
    """Tìm số dòng của position trong HTML."""
    return html.count("\n", 0, position) + 1


def check_awkward_phrases(html, issues):
    """Check 2: Cụm kỳ quặc đã biết."""
    for phrase, suggestion in AWKWARD_PHRASES.items():
        for m in re.finditer(re.escape(phrase), html, re.I):
            line = get_line_number(html, m.start())
            issues.append({
                "line": line,
                "type": "CỤM KỲ QUẶC",
                "severity": "error",
                "text": phrase,
                "hint": f"→ {suggestion}",
            })


def check_machine_translation(html, issues):
    """Check 3: Pattern dịch máy."""
    for pattern, hint in MACHINE_TRANSLATION_PATTERNS:
        for m in re.finditer(pattern, html, re.I):
            line = get_line_number(html, m.start())
            issues.append({
                "line": line,
                "type": "DỊCH MÁY",
                "severity": "warning",
                "text": m.group(0)[:60],
                "hint": hint,
            })


def check_long_awkward_sentences(html, issues):
    """Check 4: Câu dài + nhiều gạch ngang (dấu hiệu dịch sát)."""
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", html, re.S)
    para_offset = 0
    for p in paragraphs:
        full_p = f"<p>{p}</p>"
        para_start = html.find(full_p, para_offset)
        if para_start < 0:
            para_offset = 0
            continue
        para_offset = para_start + 1
        text = re.sub(r"<[^>]+>", "", p)
        text = re.sub(r"\s+", " ", text).strip()
        # Câu dài > 250 ký tự
        if len(text) > 250:
            line = get_line_number(html, para_start)
            issues.append({
                "line": line,
                "type": "CÂU DÀI",
                "severity": "info",
                "text": text[:80] + "...",
                "hint": f"câu {len(text)} ký tự — xem xét tách",
            })
        # Nhiều gạch ngang
        if text.count("—") >= 2 or text.count(" – ") >= 2:
            line = get_line_number(html, para_start)
            issues.append({
                "line": line,
                "type": "GẠCH NGANG",
                "severity": "info",
                "text": text[:80] + "...",
                "hint": "≥2 gạch ngang — có thể dịch sát nhiều mệnh đề",
            })


def check_word_repetition(html, issues):
    """Check 5: Lặp từ trong đoạn."""
    paragraphs = re.findall(r"<p[^>]*>(.*?)</p>", html, re.S)
    para_offset = 0
    repeat_words = ["tài sản", "vàng", "NHTW", "thị trường", "giá vàng"]
    for p in paragraphs:
        full_p = f"<p>{p}</p>"
        para_start = html.find(full_p, para_offset)
        if para_start < 0:
            para_offset = 0
            continue
        para_offset = para_start + 1
        text = re.sub(r"<[^>]+>", "", p)
        for word in repeat_words:
            count = len(re.findall(r"\b" + re.escape(word) + r"\b", text, re.I))
            if count >= 4:
                line = get_line_number(html, para_start)
                issues.append({
                    "line": line,
                    "type": "LẶP TỪ",
                    "severity": "warning",
                    "text": f"'{word}' x{count}",
                    "hint": f"xuất hiện {count} lần — dùng đại từ/đồng nghĩa",
                })


def check_html_tag_mismatch(html, issues):
    """Check 6: Tag HTML không khớp (mở em / đóng strong)."""
    # Mở <em> đóng </strong> hoặc ngược lại
    for m in re.finditer(r"<em>([^<]*)</strong>", html):
        line = get_line_number(html, m.start())
        issues.append({
            "line": line,
            "type": "TAG HTML",
            "severity": "error",
            "text": m.group(0)[:60],
            "hint": "mở <em> nhưng đóng </strong> — sửa tag",
        })
    for m in re.finditer(r"<strong>([^<]*)</em>", html):
        line = get_line_number(html, m.start())
        issues.append({
            "line": line,
            "type": "TAG HTML",
            "severity": "error",
            "text": m.group(0)[:60],
            "hint": "mở <strong> nhưng đóng </em> — sửa tag",
        })


def check_cjk_and_typos(html, issues):
    """Check 7: Ký tự CJK + typo."""
    # CJK
    for m in re.finditer(r"[一-龯]", html):
        line = get_line_number(html, m.start())
        issues.append({
            "line": line,
            "type": "KÝ TỰ CJK",
            "severity": "error",
            "text": m.group(0),
            "hint": "ký tự Trung Quốc lẫn vào — xóa/sửa",
        })
    # Typo
    for typo in KNOWN_TYPOS:
        for m in re.finditer(re.escape(typo), html):
            line = get_line_number(html, m.start())
            issues.append({
                "line": line,
                "type": "TYPO",
                "severity": "error",
                "text": typo,
                "hint": "typo đã biết — sửa",
            })


def check_idioms_without_gloss(html, issues):
    """Check 8: Idiom Mỹ-Âu không gloss.
    Gloss pattern công nhận: 'Idiom (VN)' HOẶC 'Idiom — VN' HOẶC 'Idiom, VN,'.
    """
    for idiom in IDIOMS_NEED_GLOSS:
        for m in re.finditer(re.escape(idiom), html, re.I):
            # Kiểm tra ±150 ký tự quanh idiom
            context = html[max(0, m.start() - 80):m.end() + 150]
            # Đã có gloss nếu có chữ Việt không dấu (≥4 ký tự) trong ±80 ký tự
            has_gloss = bool(re.search(
                r"[a-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữự]{4,}",
                context, re.I
            ))
            if not has_gloss:
                line = get_line_number(html, m.start())
                issues.append({
                    "line": line,
                    "type": "IDIOM KHÔNG GLOSS",
                    "severity": "warning",
                    "text": idiom,
                    "hint": "ẩn dụ Mỹ-Âu — thêm gloss tiếng Việt",
                })


def check_glossary_first_use(html, issues):
    """Check 1: Thuật ngữ Anh cần gloss khi xuất hiện lần đầu.
    Gloss pattern công nhận: 'VN (Eng)' HOẶC 'Eng (VN)' HOẶC 'Eng — VN' HOẶC 'Eng, VN,'.
    """
    for term, gloss, note in GLOSSARY_REQUIRED:
        # Tìm tất cả vị trí xuất hiện
        positions = [m.start() for m in re.finditer(r"\b" + re.escape(term) + r"\b", html, re.I)]
        if not positions:
            continue
        # Lần đầu — kiểm tra gloss trong ±100 ký tự (cả trước và sau)
        first_pos = positions[0]
        context = html[max(0, first_pos - 100):first_pos + len(term) + 100]
        # Đã có gloss nếu:
        # - gloss VN xuất hiện trong context, HOẶC
        # - có pattern "(...)" chứa chữ Việt trong ±50 ký tự, HOẶC
        # - có pattern "— chữ Việt" trong ±80 ký tự
        gloss_lower = gloss.lower().split("(")[0].strip()  # bỏ note trong gloss
        has_gloss = (
            gloss_lower in context.lower() or
            bool(re.search(r"\([^)]*[a-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữự]{4,}[^)]*\)", context, re.I)) or
            bool(re.search(r"[—\-]\s*[a-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữự]{4,}", context[:120], re.I))
        )
        if not has_gloss and len(positions) >= 1:
            line = get_line_number(html, first_pos)
            issues.append({
                "line": line,
                "type": "GLOSS THIẾU",
                "severity": "warning" if len(positions) > 1 else "info",
                "text": term,
                "hint": f"lần đầu — thêm gloss '{gloss}'" + (f" ({note})" if note else ""),
            })


# ============================================================
# MAIN
# ============================================================

def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python3 translation_check.py /path/to/report.html [--strict]")
        sys.exit(2)

    html_path = sys.argv[1]
    strict = "--strict" in sys.argv

    if not Path(html_path).exists():
        print(f"❌ File không tồn tại: {html_path}")
        sys.exit(2)

    print(f"🔍 Translation Check — {html_path}\n")

    html = load_html_text(html_path)
    issues = []

    # Chạy 8 check
    check_glossary_first_use(html, issues)
    check_awkward_phrases(html, issues)
    check_machine_translation(html, issues)
    check_long_awkward_sentences(html, issues)
    check_word_repetition(html, issues)
    check_html_tag_mismatch(html, issues)
    check_cjk_and_typos(html, issues)
    check_idioms_without_gloss(html, issues)

    # Sắp xếp theo dòng
    issues.sort(key=lambda x: (x["line"], x["type"]))

    # Báo cáo
    errors = [i for i in issues if i["severity"] == "error"]
    warnings = [i for i in issues if i["severity"] == "warning"]
    infos = [i for i in issues if i["severity"] == "info"]

    if not issues:
        print("✅ PASS — không phát hiện lỗi dịch.\n")
        print("⚠️  Lưu ý: script chỉ bắt được lỗi pattern cố định.")
        print("   Câu 'dịch đúng mà kỳ khi đọc' cần người đọc cảm nhận.")
        sys.exit(0)

    print(f"📋 Tìm thấy {len(issues)} vấn đề ({len(errors)} lỗi, {len(warnings)} cảnh báo, {len(infos)} gợi ý)\n")
    print("=" * 70)

    for i, issue in enumerate(issues, 1):
        sev_icon = {"error": "❌", "warning": "⚠️ ", "info": "💡"}[issue["severity"]]
        print(f"\n{sev_icon} #{i} Dòng {issue['line']} — {issue['type']}")
        print(f"   Text: {issue['text']}")
        print(f"   Gợi ý: {issue['hint']}")

    print("\n" + "=" * 70)
    print(f"\n📊 Tổng kết: {len(errors)} lỗi / {len(warnings)} cảnh báo / {len(infos)} gợi ý")

    # Exit code
    if errors:
        print("\n❌ FAIL — có lỗi cần sửa trước khi QA kỹ thuật.")
        sys.exit(2)
    elif warnings and strict:
        print("\n⚠️  FAIL (--strict) — có cảnh báo.")
        sys.exit(1)
    elif warnings:
        print("\n⚠️  PASS WITH WARNINGS — nên xem xét các cảnh báo.")
        sys.exit(0)
    else:
        print("\n✅ PASS — chỉ có gợi ý info.")
        sys.exit(0)


if __name__ == "__main__":
    main()
