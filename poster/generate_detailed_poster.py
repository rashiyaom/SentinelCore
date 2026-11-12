"""Build the A3 poster using the Mermaid-rendered figures in diagrams/."""

from pathlib import Path

from PIL import Image
from pptx import Presentation
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN

from generate_poster import (
    AMBER, BLUE, CYAN, GREEN, INK, LINE, MUTED, NAVY, NAVY_2, PALE,
    RED, WHITE, add_bullets, add_card, add_picture_crop, add_rect,
    add_reference_text, add_text, remove_slide_content,
)
from pptx.util import Inches


ROOT = Path(__file__).resolve().parents[1]
DIAGRAMS = ROOT / "poster" / "diagrams"
OUTPUT = ROOT / "SentinelCore_Exhibition_Poster_A3_Detailed.pptx"


def contain(slide, path, x, y, w, h):
    with Image.open(path) as image:
        ratio = image.width / image.height
    if ratio > w / h:
        actual_w, actual_h = w, w / ratio
    else:
        actual_h, actual_w = h, h * ratio
    return slide.shapes.add_picture(
        str(path), Inches(x + (w - actual_w) / 2),
        Inches(y + (h - actual_h) / 2), width=Inches(actual_w), height=Inches(actual_h),
    )


def build():
    prs = Presentation(str(ROOT / "Project-I_Exhibition_Poster_A3_Template.pptx"))
    slide = prs.slides[0]
    remove_slide_content(slide)

    add_rect(slide, 0, 1.13, 11.689, 0.36, fill="35465A", line="35465A", radius=False, line_width=0)
    add_text(slide, 0.30, 1.17, 11.09, 0.22, "PROJECT-I (CEUP 301)", size=12.3, color=WHITE, bold=True, font="Georgia", align=PP_ALIGN.CENTER, valign=MSO_ANCHOR.MIDDLE, margin=0)
    add_rect(slide, 0, 1.47, 11.689, 1.43, fill=NAVY, line=NAVY, radius=False, line_width=0)
    add_rect(slide, 0.40, 1.70, 0.08, 0.87, fill=RED, line=RED, radius=False, line_width=0)
    add_text(slide, 0.60, 1.59, 8.65, 0.61, "SENTINELCORE", size=29, color=WHITE, bold=True, margin=0, valign=MSO_ANCHOR.MIDDLE)
    add_text(slide, 0.60, 2.20, 8.65, 0.39, "An Explainable Network Detection & Incident Response Platform", size=12, color="CFE4F2", bold=True, margin=0, valign=MSO_ANCHOR.MIDDLE)
    add_text(slide, 0.60, 2.61, 8.65, 0.16, "SELF-HOSTED  ·  RULE-DRIVEN  ·  AUDITABLE  ·  REVERSIBLE RESPONSE", size=7.8, color="A9C9DC", margin=0)
    add_rect(slide, 9.40, 1.69, 1.88, 0.90, fill=NAVY_2, line="3A6682")
    add_text(slide, 9.55, 1.80, 1.58, 0.16, "PROJECT-I · CEUP301", size=7.1, color="BBD6E7", bold=True, align=PP_ALIGN.CENTER, margin=0)
    add_text(slide, 9.55, 2.03, 1.58, 0.29, "TEAM CS26084", size=12.5, color=WHITE, bold=True, align=PP_ALIGN.CENTER, margin=0)
    add_text(slide, 9.55, 2.35, 1.58, 0.14, "CSPIT · CSE", size=7, color="BBD6E7", align=PP_ALIGN.CENTER, margin=0)

    add_rect(slide, 0.40, 3.00, 10.89, 0.56, fill=PALE, line=LINE)
    add_text(slide, 0.59, 3.10, 5.6, 0.19, "OM RASHIYA · 24CS084   |   YASH PATEL · 24CS082", size=9.5, color=NAVY, bold=True, margin=0)
    add_text(slide, 0.59, 3.33, 5.5, 0.12, "Department of Computer Science & Engineering", size=7.1, color=MUTED, margin=0)
    add_text(slide, 6.34, 3.09, 4.68, 0.19, "FACULTY GUIDE · PROF. AKSHITA KADAM", size=9.2, color=NAVY, bold=True, align=PP_ALIGN.RIGHT, margin=0)
    add_text(slide, 6.34, 3.33, 4.68, 0.12, "CSE Department · CSPIT, CHARUSAT", size=7.1, color=MUTED, align=PP_ALIGN.RIGHT, margin=0)

    add_card(slide, 0.40, 3.69, 6.45, 1.18, "Abstract & objective", accent=RED)
    add_text(slide, 0.60, 4.18, 6.04, 0.58,
        "SentinelCore is a self-hosted network detection and incident response prototype. It transforms Suricata telemetry into searchable evidence and explainable, rule-correlated incidents, giving analysts a connected path from asset context to investigation, reversible response and reporting.",
        size=8.35, color=INK, margin=0)
    add_card(slide, 7.05, 3.69, 4.24, 1.18, "Implemented scope", accent=GREEN)
    add_text(slide, 7.25, 4.18, 3.82, 0.16, "12 functional modules  ·  7 Compose services", size=8.1, color=INK, bold=True, margin=0)
    add_text(slide, 7.25, 4.37, 3.82, 0.16, "3 access roles  ·  4 correlation evaluators", size=8.1, color=INK, bold=True, margin=0)
    add_text(slide, 7.25, 4.56, 3.82, 0.16, "Rule-based detection  ·  60 s–24 h block TTL", size=8.1, color=INK, bold=True, margin=0)

    add_card(slide, 0.40, 5.00, 10.89, 3.03, "Architecture · data and control boundaries", accent=CYAN, fill=PALE)
    add_text(slide, 0.65, 5.50, 1.1, 0.14, "DATA PLANE", size=6.8, color=MUTED, bold=True, margin=0)
    contain(slide, DIAGRAMS / "architecture_data.png", 0.63, 5.68, 10.41, 0.84)
    add_text(slide, 0.65, 6.58, 1.4, 0.14, "CONTROL PLANE", size=6.8, color=MUTED, bold=True, margin=0)
    contain(slide, DIAGRAMS / "architecture_control.png", 0.63, 6.72, 10.41, 0.95)
    add_text(slide, 0.63, 7.78, 10.42, 0.13,
        "Fig. 1. The API has no NET_ADMIN / NET_RAW capability; uploaded PCAPs are parsed separately as an unprivileged process.",
        size=6.7, color=MUTED, margin=0, align=PP_ALIGN.CENTER)

    add_card(slide, 0.40, 8.16, 10.89, 2.05, "Detection to response flow", accent=BLUE, fill=PALE)
    contain(slide, DIAGRAMS / "response_flow.png", 0.59, 8.63, 10.48, 1.34)
    add_text(slide, 0.64, 10.02, 10.40, 0.11, "Fig. 2. Explainable evidence remains linked to analyst decisions.", size=6.4, color=MUTED, margin=0, align=PP_ALIGN.CENTER)
    add_card(slide, 0.40, 10.31, 10.89, 2.05, "First-login guidance & demo", accent=GREEN, fill=PALE)
    contain(slide, DIAGRAMS / "demo_flow.png", 0.59, 10.78, 10.48, 1.34)
    add_text(slide, 0.64, 12.17, 10.40, 0.11, "Fig. 3. Browser-only simulated data; no sensor or firewall changes.", size=6.4, color=MUTED, margin=0, align=PP_ALIGN.CENTER)

    xs, width = [0.40, 4.10, 7.80], 3.49
    add_card(slide, xs[0], 12.46, width, 1.42, "Technology stack", accent=BLUE)
    add_bullets(slide, xs[0] + 0.19, 12.96, width - 0.38, 0.80, [
        "React / Vite + Nginx user interface",
        "FastAPI, SQLAlchemy and PostgreSQL",
        "Redis streams and background workers",
        "Suricata, Nmap, tshark and Docker Compose",
    ], size=7.1, spacing=0.4)
    add_card(slide, xs[1], 12.46, width, 1.42, "Security by design", accent=RED)
    add_bullets(slide, xs[1] + 0.19, 12.96, width - 0.38, 0.80, [
        "Unprivileged API; validated helper socket",
        "Gateway, DNS and host IPs protected",
        "Expiring firewall rules with reconciliation",
        "Append-only audit log + SHA-256 chain",
    ], size=7.1, spacing=0.4, bullet_color=RED)
    add_card(slide, xs[2], 12.46, width, 1.42, "Evaluation & limits", accent=AMBER, fill="FFFCF6")
    add_text(slide, xs[2] + 0.20, 12.96, width - 0.38, 0.83,
        "Unit, API and browser suites cover the platform workflow. A corrected PCAP assertion requires the documented aggregate test total to be rerun. Attack detection accuracy and fixed-resource throughput studies are prepared but not yet executed; no benchmark claim is asserted.",
        size=6.8, color=INK, margin=0)

    add_card(slide, 0.40, 13.98, 3.49, 1.85, "Application evidence", accent=GREEN, fill=PALE)
    contain(slide, ROOT / "reports/weekly/evidence/week04_dashboard.png", 0.59, 14.47, 3.10, 1.02)
    add_text(slide, 0.61, 15.53, 3.05, 0.14, "Operational overview · incident and sensor status", size=6.4, color=MUTED, margin=0, align=PP_ALIGN.CENTER)

    add_card(slide, 4.09, 13.98, 4.17, 1.85, "Conclusion & next study", accent=CYAN)
    add_text(slide, 4.29, 14.47, 3.77, 0.70,
        "SentinelCore connects detection, evidence, analyst decisions and safe response in one local workflow. The next study will run the frozen A1–A8 lab matrix and controlled load campaign, then report detection rates, false positives, alert latency, packet loss and resource use.",
        size=7.2, color=INK, margin=0)
    add_rect(slide, 4.29, 15.20, 3.75, 0.27, fill=NAVY, line=NAVY, radius=True, line_width=0)
    add_text(slide, 4.36, 15.26, 3.61, 0.12, "TARGET: SMEs · EDUCATION · SECURITY LABS", size=6.5, color=WHITE, bold=True, margin=0, align=PP_ALIGN.CENTER)
    add_text(slide, 4.29, 15.57, 3.77, 0.13, "Monitor or test only authorized networks.", size=6.5, color=RED, bold=True, margin=0, align=PP_ALIGN.CENTER)

    add_card(slide, 8.46, 13.98, 2.83, 1.85, "References & source", accent=BLUE)
    add_text(slide, 8.65, 14.47, 2.42, 0.53,
        "[1] NIST SP 800-61 Rev. 3, 2025.\n[2] OISF, Suricata 8 EVE JSON Output.\n[3] SentinelCore project repository.",
        size=6.1, color=MUTED, margin=0)
    qr_path = ROOT / "poster/assets/sentinelcore_repository_qr.png"
    contain(slide, qr_path, 9.36, 14.95, 1.00, 0.72)
    add_text(slide, 8.66, 15.65, 2.40, 0.10, "SCAN FOR PROJECT REPOSITORY", size=5.7, color=MUTED, bold=True, margin=0, align=PP_ALIGN.CENTER)

    prs.core_properties.title = "SentinelCore — Detailed A3 Exhibition Research Poster"
    prs.core_properties.author = "Om Rashiya and Yash Patel"
    prs.core_properties.subject = "Team CS26084 · Faculty guide Prof. Akshita Kadam"
    prs.save(str(OUTPUT))
    print(OUTPUT)


if __name__ == "__main__":
    build()
