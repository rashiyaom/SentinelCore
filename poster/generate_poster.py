from pathlib import Path

import qrcode
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "Project-I_Exhibition_Poster_A3_Template.pptx"
OUTPUT = ROOT / "SentinelCore_Exhibition_Poster_A3_Final.pptx"
ASSET_DIR = ROOT / "poster" / "assets"

NAVY = "102A43"
NAVY_2 = "173F5F"
BLUE = "1F6AA5"
CYAN = "31A8D4"
RED = "B50933"
GREEN = "0B8F72"
AMBER = "D9891B"
INK = "15202B"
MUTED = "52606D"
PALE = "F4F7FA"
PALE_BLUE = "EAF4FB"
LINE = "CDD8E2"
WHITE = "FFFFFF"


def rgb(hex_value: str) -> RGBColor:
    return RGBColor.from_string(hex_value)


def remove_slide_content(slide):
    for shape in list(slide.shapes):
        slide.shapes._spTree.remove(shape._element)


def set_margins(text_frame, left=0.09, right=0.09, top=0.05, bottom=0.04):
    text_frame.margin_left = Inches(left)
    text_frame.margin_right = Inches(right)
    text_frame.margin_top = Inches(top)
    text_frame.margin_bottom = Inches(bottom)


def add_text(
    slide,
    x,
    y,
    w,
    h,
    text="",
    *,
    size=10,
    color=INK,
    bold=False,
    font="Arial",
    align=PP_ALIGN.LEFT,
    valign=MSO_ANCHOR.TOP,
    margin=0.04,
    fit=False,
):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.vertical_anchor = valign
    set_margins(tf, margin, margin, margin, margin)
    p = tf.paragraphs[0]
    p.alignment = align
    p.space_before = Pt(0)
    p.space_after = Pt(0)
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = rgb(color)
    if fit:
        tf.fit_text(font_family=font, max_size=Pt(size))
    return box


def add_rect(
    slide,
    x,
    y,
    w,
    h,
    *,
    fill=WHITE,
    line=LINE,
    radius=True,
    line_width=0.8,
):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shape = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb(fill)
    shape.line.color.rgb = rgb(line)
    shape.line.width = Pt(line_width)
    return shape


def add_card(slide, x, y, w, h, title, *, accent=BLUE, fill=WHITE, title_size=11.5):
    card = add_rect(slide, x, y, w, h, fill=fill, line=LINE, radius=True)
    add_rect(slide, x, y, 0.07, h, fill=accent, line=accent, radius=False, line_width=0)
    add_text(
        slide,
        x + 0.18,
        y + 0.08,
        w - 0.34,
        0.28,
        title.upper(),
        size=title_size,
        color=NAVY,
        bold=True,
        margin=0,
        valign=MSO_ANCHOR.MIDDLE,
    )
    add_rect(slide, x + 0.18, y + 0.40, w - 0.34, 0.012, fill=LINE, line=LINE, radius=False, line_width=0)
    return card


def add_bullets(slide, x, y, w, h, items, *, size=9.0, color=INK, bullet_color=BLUE, spacing=2.4):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    set_margins(tf, 0.02, 0.02, 0.01, 0.01)
    for idx, item in enumerate(items):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.space_before = Pt(0)
        p.space_after = Pt(spacing)
        p.line_spacing = 1.0
        p.level = 0
        p.text = ""
        dot = p.add_run()
        dot.text = "• "
        dot.font.name = "Arial"
        dot.font.size = Pt(size + 0.4)
        dot.font.bold = True
        dot.font.color.rgb = rgb(bullet_color)
        run = p.add_run()
        run.text = item
        run.font.name = "Arial"
        run.font.size = Pt(size)
        run.font.color.rgb = rgb(color)
    return box


def add_metric(slide, x, y, w, number, label, *, accent=BLUE):
    add_rect(slide, x, y, w, 0.52, fill=PALE_BLUE, line="D3E6F3", radius=True)
    add_text(slide, x + 0.08, y + 0.04, 0.55, 0.25, number, size=14, color=accent, bold=True, margin=0)
    add_text(slide, x + 0.65, y + 0.06, w - 0.72, 0.32, label, size=7.7, color=MUTED, bold=True, margin=0)


def add_chevron(slide, x, y, w=0.22, h=0.42, color=CYAN):
    shp = slide.shapes.add_shape(MSO_SHAPE.CHEVRON, Inches(x), Inches(y), Inches(w), Inches(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = rgb(color)
    shp.line.fill.background()
    return shp


def add_process_box(slide, x, y, w, h, number, title, detail, *, fill=NAVY_2):
    add_rect(slide, x, y, w, h, fill=fill, line=fill, radius=True, line_width=0)
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x + 0.10), Inches(y + 0.11), Inches(0.34), Inches(0.34))
    circle.fill.solid()
    circle.fill.fore_color.rgb = rgb(CYAN)
    circle.line.fill.background()
    add_text(slide, x + 0.10, y + 0.105, 0.34, 0.34, number, size=9.2, color=WHITE, bold=True, align=PP_ALIGN.CENTER, valign=MSO_ANCHOR.MIDDLE, margin=0)
    add_text(slide, x + 0.50, y + 0.10, w - 0.58, 0.27, title, size=9.3, color=WHITE, bold=True, margin=0)
    add_text(slide, x + 0.12, y + 0.48, w - 0.24, h - 0.54, detail, size=7.4, color="DCEAF3", margin=0, align=PP_ALIGN.CENTER)


def add_picture_crop(slide, path, x, y, w, h):
    with Image.open(path) as img:
        img_ratio = img.width / img.height
    box_ratio = w / h
    pic = slide.shapes.add_picture(str(path), Inches(x), Inches(y), width=Inches(w), height=Inches(h))
    if img_ratio > box_ratio:
        visible = box_ratio / img_ratio
        crop = (1 - visible) / 2
        pic.crop_left = crop
        pic.crop_right = crop
    elif img_ratio < box_ratio:
        visible = img_ratio / box_ratio
        crop = (1 - visible) / 2
        pic.crop_top = crop
        pic.crop_bottom = crop
    pic.line.color.rgb = rgb(LINE)
    pic.line.width = Pt(0.8)
    return pic


def add_reference_text(slide, x, y, w, h):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    set_margins(tf, 0, 0, 0, 0)
    refs = [
        "[1] NIST SP 800-61 Rev. 3, Incident Response Recommendations, 2025.",
        "[2] OISF, Suricata 8 EVE JSON Output documentation.",
        "[3] SentinelCore repository, commit 593e4da (20 Oct 2026).",
    ]
    for idx, item in enumerate(refs):
        p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
        p.text = item
        p.space_before = Pt(0)
        p.space_after = Pt(1.5)
        p.line_spacing = 0.92
        for run in p.runs:
            run.font.name = "Arial"
            run.font.size = Pt(6.8)
            run.font.color.rgb = rgb(MUTED)
    return box


def build():
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    qr_path = ASSET_DIR / "sentinelcore_repository_qr.png"
    qr = qrcode.QRCode(version=3, box_size=10, border=2)
    qr.add_data("https://github.com/rashiyaom/SentinelCore")
    qr.make(fit=True)
    qr.make_image(fill_color="#102A43", back_color="white").save(qr_path)

    prs = Presentation(str(TEMPLATE))
    slide = prs.slides[0]
    remove_slide_content(slide)

    # Replace the template master's two-line course label with a complete,
    # single-line version so the second line cannot be obscured by the title.
    add_rect(slide, 0, 1.13, 11.689, 0.36, fill="35465A", line="35465A", radius=False, line_width=0)
    add_text(slide, 0.30, 1.17, 11.09, 0.22, "PROJECT-I (CEUP 301)", size=12.3, color=WHITE, bold=True, font="Georgia", align=PP_ALIGN.CENTER, valign=MSO_ANCHOR.MIDDLE, margin=0)

    # Title block below the template's institution banner.
    add_rect(slide, 0, 1.47, 11.689, 1.55, fill=NAVY, line=NAVY, radius=False, line_width=0)
    add_rect(slide, 0.40, 1.72, 0.08, 0.92, fill=RED, line=RED, radius=False, line_width=0)
    add_text(slide, 0.60, 1.64, 8.65, 0.63, "SENTINELCORE", size=29, color=WHITE, bold=True, margin=0, valign=MSO_ANCHOR.MIDDLE)
    add_text(
        slide,
        0.60,
        2.26,
        8.65,
        0.46,
        "An Explainable Network Detection & Incident Response Platform",
        size=12.2,
        color="CFE4F2",
        bold=True,
        margin=0,
        valign=MSO_ANCHOR.MIDDLE,
    )
    add_text(
        slide,
        0.60,
        2.70,
        8.65,
        0.22,
        "Self-hosted · rule-driven · auditable · reversible containment",
        size=8.2,
        color="A9C9DC",
        margin=0,
    )
    add_rect(slide, 9.40, 1.69, 1.88, 0.95, fill=NAVY_2, line="3A6682", radius=True)
    add_text(slide, 9.55, 1.79, 1.58, 0.19, "PROJECT-I · CEUP301", size=7.5, color="BBD6E7", bold=True, align=PP_ALIGN.CENTER, margin=0)
    add_text(slide, 9.55, 2.03, 1.58, 0.31, "TEAM CS26084", size=13, color=WHITE, bold=True, align=PP_ALIGN.CENTER, margin=0)
    add_text(slide, 9.55, 2.37, 1.58, 0.16, "CSPIT · CSE", size=7.3, color="BBD6E7", align=PP_ALIGN.CENTER, margin=0)

    # Author and guide strip.
    add_rect(slide, 0.40, 3.14, 10.89, 0.62, fill=PALE, line=LINE, radius=True)
    add_text(slide, 0.61, 3.25, 5.35, 0.20, "OM RASHIYA · 24CS084     |     YASH PATEL · 24CS082", size=10.0, color=NAVY, bold=True, margin=0)
    add_text(slide, 0.61, 3.49, 5.20, 0.14, "Department of Computer Science & Engineering", size=7.4, color=MUTED, margin=0)
    add_rect(slide, 6.15, 3.25, 0.015, 0.31, fill=LINE, line=LINE, radius=False, line_width=0)
    add_text(slide, 6.38, 3.23, 4.55, 0.21, "FACULTY GUIDE · PROF. AKSHITA KADAM", size=9.6, color=NAVY, bold=True, align=PP_ALIGN.RIGHT, margin=0)
    add_text(slide, 6.38, 3.49, 4.55, 0.14, "CSE Department · CSPIT, CHARUSAT", size=7.4, color=MUTED, align=PP_ALIGN.RIGHT, margin=0)

    # Research summary row.
    col_w = 3.50
    gap = 0.20
    xs = [0.40, 0.40 + col_w + gap, 0.40 + 2 * (col_w + gap)]
    y = 3.93
    h = 1.77

    add_card(slide, xs[0], y, col_w, h, "Research problem", accent=RED)
    add_text(
        slide,
        xs[0] + 0.20,
        y + 0.50,
        col_w - 0.36,
        1.13,
        "Small networks need detection, investigation and response without assembling a costly multi-product SOC stack. SentinelCore converts local network telemetry into explainable incidents while keeping privileged actions isolated and every response reversible.",
        size=8.9,
        color=INK,
        margin=0,
    )

    add_card(slide, xs[1], y, col_w, h, "Objectives", accent=BLUE)
    add_bullets(
        slide,
        xs[1] + 0.20,
        y + 0.49,
        col_w - 0.37,
        1.16,
        [
            "Discover assets and exposed services.",
            "Normalize, deduplicate and search EVE events.",
            "Correlate signals into analyst-ready incidents.",
            "Contain safely; preserve evidence and auditability.",
        ],
        size=8.4,
        spacing=1.8,
    )

    add_card(slide, xs[2], y, col_w, h, "System contribution", accent=GREEN)
    add_metric(slide, xs[2] + 0.20, y + 0.51, 1.42, "12", "integrated\nmodules", accent=GREEN)
    add_metric(slide, xs[2] + 1.76, y + 0.51, 1.42, "7", "Docker\nservices", accent=BLUE)
    add_metric(slide, xs[2] + 0.20, y + 1.09, 1.42, "4", "correlation\nevaluators", accent=AMBER)
    add_metric(slide, xs[2] + 1.76, y + 1.09, 1.42, "3", "RBAC\nroles", accent=RED)

    # Architecture — dominant visual.
    ay = 5.89
    ah = 2.62
    add_card(slide, 0.40, ay, 10.89, ah, "System architecture & data flow", accent=CYAN, fill=PALE)
    add_text(slide, 0.60, ay + 0.50, 1.07, 0.18, "DETECTION PATH", size=7.0, color=MUTED, bold=True, margin=0)
    bx = [1.46, 3.43, 5.40, 7.37, 9.34]
    bw, bh, by = 1.68, 0.98, ay + 0.57
    add_process_box(slide, bx[0], by, bw, bh, "1", "TRAFFIC", "Mirror interface\nor uploaded PCAP", fill=NAVY_2)
    add_process_box(slide, bx[1], by, bw, bh, "2", "SURICATA", "Readable signatures\n→ EVE JSON", fill=BLUE)
    add_process_box(slide, bx[2], by, bw, bh, "3", "PIPELINE", "Normalize · dedupe\npartition · enrich", fill=NAVY_2)
    add_process_box(slide, bx[3], by, bw, bh, "4", "ANALYTICS", "Search · correlation\nIOC matching", fill=BLUE)
    add_process_box(slide, bx[4], by, bw, bh, "5", "RESPONSE", "Incidents · reports\nTTL containment", fill=NAVY_2)
    for left in [3.15, 5.12, 7.09, 9.06]:
        add_chevron(slide, left, by + 0.28)

    add_text(slide, 0.60, ay + 1.73, 1.07, 0.18, "CONTROL PLANE", size=7.0, color=MUTED, bold=True, margin=0)
    labels = [
        (1.46, 1.53, "Analyst browser", PALE_BLUE),
        (3.17, 1.58, "Nginx + React", WHITE),
        (4.94, 1.52, "FastAPI · RBAC", PALE_BLUE),
        (6.65, 1.66, "PostgreSQL + Redis", WHITE),
        (8.50, 2.52, "root helper via Unix socket → Nmap · sensor · firewall", "FFF5E7"),
    ]
    for x0, w0, label, fill in labels:
        add_rect(slide, x0, ay + 1.69, w0, 0.43, fill=fill, line=LINE, radius=True)
        add_text(slide, x0 + 0.06, ay + 1.76, w0 - 0.12, 0.24, label, size=7.2, color=NAVY, bold=True, align=PP_ALIGN.CENTER, valign=MSO_ANCHOR.MIDDLE, margin=0)
    for x0 in [3.03, 4.81, 6.51, 8.36]:
        line = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x0), Inches(ay + 1.90), Inches(x0 + 0.10), Inches(ay + 1.90))
        line.line.color.rgb = rgb(CYAN)
        line.line.width = Pt(1.7)
    add_text(slide, 0.60, ay + 2.23, 10.38, 0.18, "Privileged operations cross one typed, validated boundary; the API itself holds no NET_ADMIN or NET_RAW capability.", size=7.2, color=MUTED, margin=0, align=PP_ALIGN.CENTER)

    # Method, security and evaluation.
    y2, h2 = 8.70, 2.20
    add_card(slide, xs[0], y2, col_w, h2, "Method", accent=BLUE)
    add_bullets(
        slide,
        xs[0] + 0.20,
        y2 + 0.50,
        col_w - 0.37,
        1.56,
        [
            "Workflow aligned to NIST Detect–Respond–Recover.",
            "Suricata EVE records form the traceable detection source.",
            "Rules-as-data implement threshold, sequence, rare and beacon logic.",
            "Monthly partitions and keyset pagination bound data access.",
        ],
        size=8.15,
        spacing=2.0,
    )

    add_card(slide, xs[1], y2, col_w, h2, "Security by design", accent=RED)
    add_bullets(
        slide,
        xs[1] + 0.20,
        y2 + 0.50,
        col_w - 0.37,
        1.58,
        [
            "Unprivileged API; narrow root helper on a 0660 Unix socket.",
            "Firewall blocks require 60 s–24 h TTL and protect gateway/DNS/self.",
            "Append-only audit table plus SHA-256 tamper-evident chain.",
            "PCAP tools run unprivileged with argv-only execution and limits.",
        ],
        size=8.05,
        spacing=1.8,
        bullet_color=RED,
    )

    add_card(slide, xs[2], y2, col_w, h2, "Evaluation status", accent=AMBER, fill="FFFCF6")
    add_text(slide, xs[2] + 0.20, y2 + 0.50, col_w - 0.36, 0.50, "Platform verification covers authentication/RBAC and all functional modules through unit, API and browser suites.", size=8.25, color=INK, margin=0)
    add_rect(slide, xs[2] + 0.20, y2 + 1.09, col_w - 0.40, 0.70, fill="FFF3D9", line="F1D199", radius=True)
    add_text(slide, xs[2] + 0.32, y2 + 1.17, col_w - 0.64, 0.15, "SCIENTIFIC LIMITATION", size=7.1, color="8B5B00", bold=True, margin=0)
    add_text(slide, xs[2] + 0.32, y2 + 1.38, col_w - 0.64, 0.31, "Isolated-lab attack accuracy and fixed-resource throughput campaigns are prepared but not yet executed; no unsupported performance claim is made.", size=7.45, color="704A00", margin=0)
    add_text(slide, xs[2] + 0.20, y2 + 1.89, col_w - 0.38, 0.14, "Planned metrics: detection rate · alert latency · FP rate · reduction ratio · p95 lag · packet loss", size=6.6, color=MUTED, bold=True, margin=0, align=PP_ALIGN.CENTER)

    # Screenshots.
    sy, sh = 11.08, 3.14
    add_card(slide, 0.40, sy, 10.89, sh, "Implementation evidence", accent=GREEN, fill=PALE)
    screen_paths = [
        ROOT / "reports/weekly/evidence/week04_dashboard.png",
        ROOT / "reports/weekly/evidence/week06_sensor.png",
        ROOT / "reports/weekly/evidence/week11_firewall.png",
    ]
    captions = [
        ("01 · OPERATIONAL OVERVIEW", "Guided triage, health and high-severity visibility"),
        ("02 · SENSOR CONTROL", "Ruleset lifecycle, version and packet-drop telemetry"),
        ("03 · SAFE CONTAINMENT", "TTL-bounded blocks, reconciliation and audit history"),
    ]
    img_y, img_w, img_h = sy + 0.53, 3.34, 1.88
    img_xs = [0.61, 4.17, 7.73]
    for path, x0, (cap_title, cap_body) in zip(screen_paths, img_xs, captions):
        add_picture_crop(slide, path, x0, img_y, img_w, img_h)
        add_text(slide, x0, img_y + 1.97, img_w, 0.16, cap_title, size=7.3, color=NAVY, bold=True, margin=0)
        add_text(slide, x0, img_y + 2.18, img_w, 0.25, cap_body, size=6.9, color=MUTED, margin=0)

    # Conclusion and references.
    fy, fh = 14.39, 1.43
    add_card(slide, 0.40, fy, 7.43, fh, "Conclusion & next study", accent=CYAN)
    add_text(
        slide,
        0.60,
        fy + 0.50,
        6.98,
        0.50,
        "SentinelCore demonstrates an end-to-end, explainable security workflow in a compact local deployment while isolating privileged operations. The next research step is to execute the frozen A1–A8 attack matrix and controlled load study, then publish detection, latency, loss and resource results.",
        size=8.15,
        color=INK,
        margin=0,
    )
    add_rect(slide, 0.60, fy + 1.07, 3.05, 0.24, fill=NAVY, line=NAVY, radius=True, line_width=0)
    add_text(slide, 0.68, fy + 1.105, 2.89, 0.13, "TARGET SECTOR · SMEs · EDUCATION · CYBERSECURITY LABS", size=6.4, color=WHITE, bold=True, margin=0, align=PP_ALIGN.CENTER)
    add_text(slide, 3.89, fy + 1.09, 3.64, 0.16, "Lab-only: monitor or test only systems you own or are authorized to assess.", size=6.5, color=RED, bold=True, margin=0, align=PP_ALIGN.RIGHT)

    add_card(slide, 8.03, fy, 3.26, fh, "References & repository", accent=BLUE)
    add_reference_text(slide, 8.23, fy + 0.49, 2.10, 0.73)
    add_picture_crop(slide, qr_path, 10.43, fy + 0.49, 0.67, 0.67)
    add_text(slide, 10.35, fy + 1.20, 0.83, 0.10, "SCAN FOR SOURCE", size=5.5, color=MUTED, bold=True, align=PP_ALIGN.CENTER, margin=0)

    # Accessibility names for key visual regions.
    slide.shapes[0].name = "SentinelCore title background"
    prs.core_properties.title = "SentinelCore — A3 Exhibition Research Poster"
    prs.core_properties.subject = "Project-I exhibition poster, Team CS26084"
    prs.core_properties.author = "Om Rashiya and Yash Patel"
    prs.core_properties.comments = "Faculty guide: Prof. Akshita Kadam. Generated from the supplied A3 template."
    prs.save(str(OUTPUT))
    print(OUTPUT)


if __name__ == "__main__":
    build()
