"""Render readable, full-page A4 PDFs for the twelve weekly reports.

The DOCX previewer on macOS treats Word points as CSS pixels and shrinks the
page.  This exporter uses an explicit A4 print layout with a true 12-point body
font, so the PDF is not a scaled-down screenshot of the DOCX preview.
"""

from __future__ import annotations

import base64
import html
import mimetypes
import subprocess
import tempfile
from pathlib import Path

from generate_expanded_reports import ARTIFACTS, ASSETS, ROOT, WEEKS, RESEARCH_TABLES, prepare_artifact


PDF_DIR = ROOT / "pdf"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")


def esc(value) -> str:
    return html.escape(str(value), quote=True)


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "image/png"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def footer(week: int, page: int) -> str:
    return (
        '<footer><span>SentinelCore • Weekly Progress Report</span>'
        f'<span>Week {week} • Page {page} of 5</span></footer>'
    )


def section_header(week: int, data: dict, title: str, page: int) -> str:
    return (
        '<div class="section-head">'
        f'<div class="eyebrow">SENTINELCORE • WEEK {week} • {esc(data["date"])}</div>'
        f'<h1>{esc(title)}</h1>'
        f'<div class="rule"></div></div>'
    )


def detail_table(rows, class_name="details") -> str:
    body = "".join(
        f'<tr><th>{esc(label)}</th><td>{esc(value)}</td></tr>'
        for label, value in rows
    )
    return (
        f'<table class="{class_name}"><thead><tr><th>Section</th>'
        '<th>Details to be filled by the team</th></tr></thead>'
        f'<tbody>{body}</tbody></table>'
    )


def report_html(week: int) -> str:
    data = WEEKS[week]
    research_title, research_rows = RESEARCH_TABLES[week]
    full_image = ASSETS / f"week{week:02d}_full.png"
    artifact_image, artifact_title = prepare_artifact(week)

    progress_rows = [
        ("Planned Tasks (from last week)", data["planned"]),
        ("Tasks Completed This Week", data["completed"]),
        ("Commits Made", data["commits"]),
        ("Issues Created / Closed", data["issues"]),
        ("Milestone Status", data["status"]),
        ("Blockers / Challenges Faced", data["blockers"]),
        ("Plan for Next Week", data["next"]),
    ]

    research_head = "".join(f"<th>{esc(v)}</th>" for v in research_rows[0])
    research_body = "".join(
        "<tr>" + "".join(f"<td>{esc(v)}</td>" for v in row) + "</tr>"
        for row in research_rows[1:]
    )
    implementation_blocks = "".join(
        f'<article class="note"><h2>{esc(title)}</h2><p>{esc(text)}</p></article>'
        for title, text in data["details"]
    )
    artifact_note = (
        f'<strong>Traceability conclusion.</strong> {esc(artifact_title)} directly supports the '
        f'{esc(data["phase"])} milestone. {esc(data["verification"])} The artifact, source paths, '
        'implementation record, and website evidence therefore describe the same weekly scope.'
    )
    source_items = "".join(f"<li>{esc(item)}</li>" for item in data["sources"])

    return f'''<!doctype html>
<html><head><meta charset="utf-8"><title>SentinelCore Week {week}</title>
<style>
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; background: white; color: #292334; font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.34; }}
.page {{ width: 210mm; height: 297mm; padding: 10mm 12mm 9mm; page-break-after: always; display: flex; flex-direction: column; gap: 3.5mm; overflow: hidden; }}
.page:last-child {{ page-break-after: auto; }}
h1 {{ margin: 0; font: 700 21pt Georgia, serif; color: #17131f; }}
h2 {{ margin: 0 0 1.5mm; font-size: 13pt; color: #6d3dd6; }}
p {{ margin: 0; }}
.official-title {{ text-align: center; margin: 0; font: 700 22pt Georgia, serif; color: #17131f; }}
.section-head {{ margin-bottom: 1mm; flex-shrink: 0; }}
.eyebrow {{ font-weight: 700; font-size: 11pt; letter-spacing: .35px; color: #7c4ce0; margin-bottom: 1.5mm; }}
.rule {{ height: 1.2mm; background: #8b5cf6; margin-top: 2.2mm; }}
table {{ width: 100%; border-collapse: collapse; font-size: 12pt; }}
th, td {{ border: .3mm solid #d5cce6; padding: 2.1mm 2.4mm; vertical-align: top; }}
th {{ text-align: left; font-weight: 700; background: #f1ebff; }}
thead th {{ color: white; background: #7c4ce0; }}
.identity th {{ width: 23%; }}
.identity td {{ width: 27%; }}
.identity .wide {{ width: auto; }}
.summary {{ flex: 1; table-layout: fixed; }}
.summary tbody tr {{ height: 13.5%; }}
.summary tbody th {{ width: 28%; }}
.details th:first-child {{ width: 26%; }}
.research {{ table-layout: fixed; flex: 1; }}
.research th, .research td {{ padding: 2.7mm; }}
.research th:nth-child(1), .research td:nth-child(1) {{ width: 25%; }}
.research th:nth-child(2), .research td:nth-child(2) {{ width: 32%; }}
.research th:nth-child(3), .research td:nth-child(3) {{ width: 43%; }}
.intro {{ border-left: 1.4mm solid #8b5cf6; background: #f8f5ff; padding: 3.2mm 4mm; }}
.visual {{ width: 100%; max-height: 102mm; object-fit: contain; border: .3mm solid #d5cce6; background: #f8f7fa; }}
.artifact {{ max-height: 100mm; }}
.caption {{ font-size: 12pt; color: #625a70; text-align: center; font-style: italic; margin-top: -1mm; }}
.two-col {{ display: grid; grid-template-columns: 1fr 1fr; gap: 3.5mm; flex: 1; }}
.note {{ border: .3mm solid #ddd5e9; border-radius: 2mm; padding: 3mm; background: #fbfaff; }}
.note p {{ text-align: justify; }}
.source-box {{ display: grid; grid-template-columns: 1.05fr .95fr; gap: 4mm; flex: 1; }}
.source-box ul {{ margin: 1.5mm 0 0 5mm; padding-left: 4mm; }}
.source-box li {{ margin-bottom: 2.2mm; }}
.closure-grid {{ display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 3.5mm; flex: 1; }}
.status {{ border: .3mm solid #d5cce6; padding: 3mm; background: #f8f5ff; }}
.status h2 {{ margin-bottom: 1.5mm; }}
.assessment {{ margin-top: auto; }}
.assessment td {{ height: 21mm; }}
footer {{ margin-top: auto; padding-top: 2.5mm; border-top: .3mm solid #d8d0e5; display: flex; justify-content: space-between; font-size: 10pt; color: #625a70; flex-shrink: 0; }}
</style></head><body>

<section class="page">
  <h1 class="official-title">Weekly Student Progress Performa</h1>
  <table class="identity"><tbody>
    <tr><th>Team Id</th><td>CS26084</td><th>Week no / Date</th><td>Week {week} &nbsp; {esc(data['date'])}</td></tr>
    <tr><th>Project Title</th><td colspan="3" class="wide">SentinelCore: A Network Detection and Incident Response Platform</td></tr>
    <tr><th>Members Present</th><td colspan="3" class="wide">Om Rashiya (24cs084), Yash Patel (24cs082)</td></tr>
    <tr><th>Mentor</th><td colspan="3" class="wide">Akshita Kadam</td></tr>
  </tbody></table>
  <div class="section-head"><div class="eyebrow">WEEK {week} • {esc(data['phase'])}</div><div class="rule"></div></div>
  {detail_table(progress_rows, 'summary')}
  {footer(week, 1)}
</section>

<section class="page">
  {section_header(week, data, 'Research and Technical Study', 2)}
  <div class="intro"><strong>Research objective.</strong> {esc(data['planned'])}</div>
  <div class="intro"><strong>Study completed.</strong> {esc(data['study'])}</div>
  <h2>{esc(research_title)}</h2>
  <table class="research"><thead><tr>{research_head}</tr></thead><tbody>{research_body}</tbody></table>
  <div class="note"><h2>Decision carried into the project</h2><p>{esc(data['completed'])}</p></div>
  {footer(week, 2)}
</section>

<section class="page">
  {section_header(week, data, 'Implementation Record and Website Evidence', 3)}
  <div class="two-col">{implementation_blocks}</div>
  <img class="visual" src="{data_uri(full_image)}" alt="Week {week} SentinelCore website evidence">
  <p class="caption">Figure W{week}.1 — Project-owned SentinelCore interface mapped specifically to Week {week}.</p>
  <div class="intro"><strong>Evidence interpretation.</strong> {esc(data['visible'])} Its visible controls, labels, status fields, and navigation provide direct evidence for the work described on this page.</div>
  {footer(week, 3)}
</section>

<section class="page">
  {section_header(week, data, 'Repository and Architecture Evidence', 4)}
  <img class="visual artifact" src="{data_uri(artifact_image)}" alt="{esc(artifact_title)}">
  <p class="caption">Figure W{week}.2 — {esc(artifact_title)}. This is a separate internal artifact, not a copy of the website image.</p>
  <div class="source-box">
    <article class="note"><h2>Repository files used for traceability</h2><ul>{source_items}</ul></article>
    <article class="note"><h2>Verification</h2><p>{esc(data['verification'])}</p></article>
  </div>
  <div class="intro">{artifact_note}</div>
  {footer(week, 4)}
</section>

<section class="page">
  {section_header(week, data, 'Weekly Closure and Faculty Assessment', 5)}
  <div class="closure-grid">
    <article class="status"><h2>Completed outcome</h2><p>{esc(data['completed'])}</p></article>
    <article class="status"><h2>Commit record</h2><p>{esc(data['commits'])}</p></article>
    <article class="status"><h2>Issue and resolution</h2><p>{esc(data['issues'])}</p></article>
    <article class="status"><h2>Milestone position</h2><p>{esc(data['status'])}</p></article>
    <article class="status"><h2>Challenge handled</h2><p>{esc(data['blockers'])}</p></article>
    <article class="status"><h2>Next-week hand-off</h2><p>{esc(data['next'])}</p></article>
  </div>
  <article class="note"><h2>Repository reference</h2><p>https://github.com/rashiyaom/SentinelCore</p></article>
  <table class="assessment"><thead><tr><th>Assessed By (Faculty)</th><th>Marks Awarded (5 marks)</th><th>Faculty Remarks</th></tr></thead>
  <tbody><tr><td></td><td></td><td></td></tr></tbody></table>
  {footer(week, 5)}
</section>
</body></html>'''


def main() -> None:
    if not CHROME.exists():
        raise FileNotFoundError(f"Google Chrome not found at {CHROME}")
    PDF_DIR.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="sentinelcore-weekly-pdf-") as temp:
        temp_dir = Path(temp)
        for week in range(1, 13):
            html_path = temp_dir / f"week{week}.html"
            html_path.write_text(report_html(week), encoding="utf-8")
            output = PDF_DIR / f"24cs084_Week{week}.pdf"
            subprocess.run(
                [
                    str(CHROME), "--headless", "--disable-gpu",
                    "--no-pdf-header-footer", "--print-to-pdf-no-header",
                    f"--print-to-pdf={output}", html_path.as_uri(),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            print(f"Exported {output.name}")


if __name__ == "__main__":
    main()
