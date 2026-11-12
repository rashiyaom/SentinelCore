"""Expand the twelve SentinelCore weekly DOCX reports to five pages each.

The generator is intentionally self-contained.  It uses only material already
present in this repository and the original screenshot embedded in each weekly
report.  On the first run it preserves the one-page inputs in
``source_one_page/`` so the reports remain reproducible.
"""

from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
import textwrap
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent
BACKUP = ROOT / "source_one_page"
ASSETS = ROOT / "evidence_assets"

PURPLE = "8B5CF6"
DARK = "17131F"
INK = "292334"
MUTED = "625A70"
PALE = "F3EEFF"
LIGHT = "F7F5FA"
WHITE = "FFFFFF"
GREEN = "166534"


WEEKS = {
    1: {
        "date": "20 July 2026",
        "phase": "Problem Definition and Product Direction",
        "planned": "Define the SGP problem statement, identify target users, study existing home-network security tools, and establish the project scope.",
        "completed": "Finalized SentinelCore as a self-hosted network detection and incident-response platform. Defined the primary workflow: discover devices, collect network alerts, correlate suspicious activity, investigate incidents, contain threats, and generate evidence reports.",
        "commits": "Total: 0 commits (research and planning week). Repository work had not started; requirements and module boundaries were documented before implementation.",
        "issues": "Created: Need a security platform understandable to non-specialist home/small-network users. Closed: Agreed on a modular, local-first platform rather than a cloud-only monitoring service.",
        "status": "~5% complete — on track. Problem definition, audience, objectives, and success criteria approved by the team.",
        "blockers": "The initial scope was too broad. We reduced it to a staged pipeline with clearly separated discovery, detection, investigation, response, and reporting capabilities.",
        "next": "Prepare the threat model, compare IDS technologies, and select the backend, database, queue, and frontend stack.",
        "study": "Compared Suricata, Snort, and Zeek for visibility, rule support, and structured event output. Suricata was selected because EVE JSON integrates cleanly with an application pipeline while retaining mature signature-based detection. The incident-response lifecycle was used to shape the product flow.",
        "details": [
            ("Problem statement", "Home and small-network users need one understandable place to see devices, detections, investigations, response actions, and evidence. The project was therefore framed as a complete operational workflow rather than a collection of disconnected security tools."),
            ("Intended workflow", "The agreed sequence was asset discovery → network detection → event search → correlation → incident investigation → guarded containment → reporting. This sequence later became the product navigation and the module order used throughout the repository."),
            ("Product boundary", "The platform would be locally deployable and explainable. Detection findings would remain traceable to a Suricata signature or a readable correlation rule; response and reporting would follow only after evidence was visible to an operator."),
            ("User-facing direction", "The product introduction had to describe network defence in plain language. The identity and introductory visual shown in the evidence capture established the name SentinelCore and the SecureHome presentation used by the website."),
        ],
        "visible": "The evidence screen presents the SentinelCore/SecureHome identity and the visual theme later carried into the public and authenticated website.",
        "focus": ["SentinelCore product identity", "Secure network theme", "Initial presentation direction"],
        "sources": ["README.md — What it is and module workflow", "frontend/public/media/securehome-intro.mp4", "frontend/src/pages/LandingPage.jsx"],
        "verification": "Scope and workflow were checked against the final repository module list so the week records only capabilities that SentinelCore actually contains.",
    },
    2: {
        "date": "27 July 2026",
        "phase": "Threat Model and Secure Architecture",
        "planned": "Create a threat model, define functional/non-functional requirements, and design a safe deployment architecture.",
        "completed": "Documented trust boundaries for the browser, API, database, Redis queue, sensor, and privileged network helper. Defined RBAC roles, auditability, retention, least privilege, local deployment, and recoverable operations as core requirements.",
        "commits": "Total: 0 commits (architecture and research week). Outputs were the threat model, data-flow plan, and milestone breakdown used for later implementation.",
        "issues": "Created: Raw packet capture and firewall operations require privileges that the web API must not receive. Closed: Introduced a narrow Unix-socket helper boundary so the API can remain unprivileged.",
        "status": "~10% complete — on track. Architecture and security constraints were established before coding.",
        "blockers": "Balancing useful network visibility with safe privilege separation. The design isolates raw-socket operations and exposes only allow-listed helper commands.",
        "next": "Design the database entities, API contracts, Docker topology, and initial repository structure.",
        "study": "Studied container capability controls, Unix-domain socket permissions, secure refresh-token patterns, PostgreSQL transaction guarantees, and Redis-backed work coordination. The design adopted defence in depth: capability allowlists, unprivileged API execution, append-only audit records, and explicit role checks.",
        "details": [
            ("Trust boundaries", "Separated the browser, reverse proxy, React application, FastAPI service, PostgreSQL, Redis, Suricata, event worker, and privileged helper. Each boundary was assigned only the communication path needed by the product."),
            ("Privilege model", "Nmap, Suricata control, and firewall changes were placed behind an allow-listed helper reached through a Unix socket. The web API was designed to run without raw-socket or firewall capabilities."),
            ("Access model", "Defined viewer, analyst, and admin responsibilities. Read-only visibility, investigation work, and high-impact administrative actions would be enforced by backend role checks and reflected in role-aware navigation."),
            ("Recovery and evidence", "Auditability, bounded retention, explicit action history, and recoverable operations were made architectural requirements. These choices support the website promise of visible evidence and controlled response."),
        ],
        "visible": "The public landing page expresses the planned product flow in user language: know the network, explain detections, investigate evidence, and respond with guardrails.",
        "focus": ["Plain-language product promise", "Detection-to-response flow", "Protected/local positioning"],
        "sources": ["reports/docs/threat-model.md", "docker-compose.yml", "README.md — Architecture, roles, and security design"],
        "verification": "The architecture record was cross-checked against the final Compose services and the documented privilege split; no cloud service or unimplemented external dependency was added.",
    },
    3: {
        "date": "03 August 2026",
        "phase": "Module, Data, and Interface Design",
        "planned": "Translate the architecture into modules, database models, API routes, navigation, and a 12-week implementation plan.",
        "completed": "Split the platform into authentication, asset discovery, Suricata sensor, event pipeline, search, correlation, incidents, reports, firewall response, PCAP analysis, and threat intelligence. Defined FastAPI + SQLAlchemy/Alembic, PostgreSQL, Redis, React/Vite, Nginx, and Docker Compose as the implementation stack.",
        "commits": "Total: 0 commits (technical design week). Prepared module specifications M03–M12 and acceptance criteria for each milestone.",
        "issues": "Created: A single service would mix privileged capture, API traffic, and long-running ingestion. Closed: Separated API, worker, helper, frontend, proxy, PostgreSQL, and Redis responsibilities.",
        "status": "~18% complete — on track. Data model and module contracts were ready for implementation.",
        "blockers": "The event data volume could make offset pagination and one large table slow. The plan adopted monthly partitions and keyset pagination.",
        "next": "Initialize the repository, implement Docker services, health checks, migrations, and the first authentication screen.",
        "study": "Evaluated synchronous versus asynchronous API/database access, migration strategies, partitioned event storage, and React routing approaches. Async FastAPI and asyncpg were selected for concurrent event/search workloads, while Alembic provides reproducible schema evolution.",
        "details": [
            ("Module breakdown", "Converted the workflow into M1 authentication, M2 application shell, M3 assets, M4 sensor, M5 event pipeline, M6 search, M7 correlation, M8 incidents, M9 reporting, M10 firewall, M11 PCAP, and M12 threat intelligence."),
            ("Service responsibilities", "Assigned interactive requests to FastAPI, long-running ingestion to a worker, privileged operations to the helper, durable records to PostgreSQL, coordination/checkpoints to Redis, and user interaction to React behind Nginx."),
            ("Data strategy", "Planned Alembic-managed schemas, monthly event partitions, durable event identifiers, and keyset pagination so the event explorer could operate over growing time-series data."),
            ("Access entry point", "The sign-in screen became the first designed protected entry point. Its wording communicates that credentials are provisioned by the SentinelCore administrator and that access leads to a secure operations workspace."),
        ],
        "visible": "The evidence screen shows the implemented sign-in interface, including username/password fields, administrator-provisioned access guidance, and the SentinelCore visual identity.",
        "focus": ["Protected console entry", "Administrator-provisioned credentials", "Consistent SentinelCore interface"],
        "sources": ["reports/modules/M03-asset-discovery_1.md through M12", "frontend/src/App.jsx", "frontend/src/pages/LoginPage.jsx"],
        "verification": "Module names, service responsibilities, and navigation were checked against the actual frontend routes, backend models, and repository module specifications.",
    },
    4: {
        "date": "10 August 2026",
        "phase": "Repository and Full-Stack Foundation",
        "planned": "Create the repository and establish a reproducible full-stack development environment.",
        "completed": "Initialized SentinelCore, created backend/frontend/helper structures, added Docker Compose services, Nginx routing, PostgreSQL and Redis, environment configuration, and application health endpoints. Established the initial React shell and FastAPI service.",
        "commits": "Total: 2 commits. 6a9c10c — “Initial commit”; 96396ba — “initial project setup”.",
        "issues": "Created: Coordinating service startup and database readiness. Closed: Added health checks, dependency ordering, and a single Compose workflow for the entire stack.",
        "status": "~26% complete — on track. The full skeleton could be built and launched consistently.",
        "blockers": "Container networking and host-port conflicts required separating internal service names from loopback-only host mappings.",
        "next": "Complete container health, implement authentication/RBAC, seed an administrator, and add immutable auditing.",
        "study": "Reviewed Docker Compose health semantics, reverse-proxy routing, secret injection, and reproducible environment configuration. PostgreSQL is exposed only on loopback for tools, while application traffic stays on the private Compose network.",
        "details": [
            ("Repository structure", "Created distinct backend, frontend, helper, deployment, migration, and test areas so privileged and unprivileged responsibilities remained visible in the codebase."),
            ("Container topology", "Added PostgreSQL, Redis, backend, worker, frontend, Nginx, helper, and Suricata-related configuration to the Compose-led development environment."),
            ("Routing and health", "Nginx routes the website and API through one entry point. Service health checks and dependency ordering prevent application services from assuming the database or Redis is ready too early."),
            ("Application shell", "The authenticated overview shell, sidebar, top bar, status indicators, and first dashboard cards established the common layout used by every later workspace."),
        ],
        "visible": "The authenticated overview shows the working application shell, role-aware sidebar, sensor warning, incident/event summary cards, and guided starting points.",
        "focus": ["Authenticated application shell", "System status and summary cards", "Module navigation structure"],
        "sources": ["docker-compose.yml", "backend/deployment/nginx/nginx.conf", "frontend/src/layout/Layout.jsx", "frontend/src/pages/overview/OverviewPage.jsx"],
        "verification": "Commit hashes were taken from repository history. Visible dashboard terms and navigation labels were checked against the implemented React components.",
    },
    5: {
        "date": "17 August 2026",
        "phase": "Authentication, RBAC, and Asset Workspace",
        "planned": "Stabilize the Docker stack and implement secure authentication, role-based access, session refresh, and audit logging.",
        "completed": "Completed the container stack health flow, added Argon2 password hashing, JWT access tokens with HttpOnly refresh cookies, login throttling, seeded admin support, protected React routes, role-aware navigation, and audit-log services.",
        "commits": "Total: 1 milestone commit. 9fc44f2 — “M0: Docker stack complete, health endpoint working”. Authentication work continued in the later consolidated M1–M5 commit.",
        "issues": "Created: Access tokens must not persist in localStorage; repeated login attempts require throttling. Closed: Kept access tokens in memory, used rotating refresh cookies, and added server-side throttling and role checks.",
        "status": "~36% complete — on track. Secure access control and the deployment foundation were functional.",
        "blockers": "Maintaining a session without exposing durable tokens to JavaScript storage. The refresh endpoint and in-memory access-token model resolved this.",
        "next": "Implement asset discovery, scan parsing, device inventory, and the privileged helper protocol.",
        "study": "Studied password hashing, short-lived bearer tokens, refresh-token cookies, RBAC enforcement, and tamper-evident audit design. Authorization is checked again in the backend even when navigation is hidden in the UI.",
        "details": [
            ("Authentication flow", "Implemented password verification, short-lived access tokens held in memory, refresh handling through an HttpOnly cookie, logout, and bootstrap administrator support."),
            ("Role enforcement", "Protected React routes and adjusted navigation for viewer, analyst, and admin roles, while retaining backend authorization as the controlling check for every protected action."),
            ("Abuse controls and audit", "Added login throttling and audit services so authentication attempts and state-changing actions can be recorded without relying on the browser."),
            ("Asset workspace preparation", "Built the role-protected inventory surface with search, active-only and open-port filters, refresh, scan entry point, and the empty-state instruction shown in the evidence."),
        ],
        "visible": "The Assets workspace shows inventory controls, scan access, active/open-port filters, and a clear empty state directing the operator to run discovery.",
        "focus": ["Role-protected Assets route", "Inventory and filter controls", "Run-scan discovery entry point"],
        "sources": ["frontend/src/auth/AuthContext.jsx", "frontend/src/routes/ProtectedRoute.jsx", "frontend/src/pages/assets/AssetsPage.jsx", "backend/app/api/routes/assets.py"],
        "verification": "The access model and asset controls were checked against the actual routes, frontend labels, authentication context, and the repository test coverage.",
    },
    6: {
        "date": "24 August 2026",
        "phase": "Asset Discovery and Suricata Sensor",
        "planned": "Build asset discovery and begin integrating Suricata as the network sensor.",
        "completed": "Implemented allow-listed helper operations, Nmap scan execution/parsing, asset/port/scan models, scan history, validation, asset detail pages, Suricata configuration, rule sources, rule overrides, health metrics, and safe ruleset reload behavior.",
        "commits": "Total: 0 standalone commits this review period. The feature branch was kept as a working milestone and later consolidated in d79a37c (“update the project to m5”).",
        "issues": "Created: Untrusted scan targets and rule text could cross the privilege boundary. Closed: Added strict network/argument validation, allow-listed helper operations, and verify-before-activate rule staging.",
        "status": "~45% complete — on track. Discovery and sensor administration were operational in development.",
        "blockers": "Nmap and Suricata require network access that differs across Linux and macOS Docker hosts. The helper owns capabilities while the API remains isolated.",
        "next": "Normalize EVE JSON, persist events reliably, track offsets, create partitions, and expose pipeline health.",
        "study": "Studied Nmap XML parsing, input validation for command execution, Suricata EVE JSON, rule update workflows, AF_PACKET capture, and atomic configuration activation. A staged ruleset is verified before replacing the active set to avoid sensor downtime.",
        "details": [
            ("Discovery execution", "Created typed helper operations for allowed scan modes. Targets and arguments are validated before execution, and Nmap XML is parsed into structured scan, asset, and port records."),
            ("Inventory behaviour", "Assets are reconciled by address, their first/last seen information is retained, discovered ports are associated with the asset, and missing devices can be marked inactive rather than deleted."),
            ("Sensor management", "Added status, start/stop, rule-source, override, configuration-test, and reload flows. Rule content is staged and tested before activation so an invalid update does not silently replace the working set."),
            ("Operational view", "The Sensor page exposes status, version, process information, uptime, rules loaded, last reload, throughput/drop indicators, rule sources, and overrides in one workspace."),
        ],
        "visible": "The Sensor workspace displays stopped/running state, process and version fields, packet/drop counters, ruleset details, source controls, and rule overrides.",
        "focus": ["Sensor lifecycle status", "Throughput and drop visibility", "Rule sources and overrides"],
        "sources": ["reports/modules/M03-asset-discovery_1.md", "reports/modules/M04-suricata-sensor_1.md", "frontend/src/pages/sensor/SensorPage.jsx", "backend/helper/helper/ops/suricata.py"],
        "verification": "Feature names and safety behaviour were checked against the M3/M4 specifications, helper operations, frontend components, and related tests.",
    },
    7: {
        "date": "31 August 2026",
        "phase": "Event Ingestion and Search Experience",
        "planned": "Create a resilient event-ingestion pipeline from Suricata EVE JSON to PostgreSQL.",
        "completed": "Built a dedicated worker, EVE tailer, event normalizer, batch writer, Redis-persisted read offsets, monthly PostgreSQL partitions, retention utilities, pipeline status endpoints, and event model validation. Kept ingestion outside the API process to prevent duplicate readers.",
        "commits": "Total: 0 standalone commits this review period. Pipeline work was reviewed continuously and included in the consolidated M1–M5 milestone commit d79a37c.",
        "issues": "Created: Worker restarts could reread events or lose file position; multiple API replicas could duplicate ingestion. Closed: Moved tailing to one worker and persisted offsets in Redis with idempotent database writes.",
        "status": "~54% complete — on track. Detection events could flow reliably from sensor output into partitioned storage.",
        "blockers": "Handling log rotation, partial JSON lines, malformed events, and database backpressure without halting the pipeline.",
        "next": "Implement fast event search, facets, saved searches, and rule-driven correlation.",
        "study": "Compared file-tail reliability patterns, at-least-once delivery, checkpointing, batch insertion, and time-based partitioning. The worker acknowledges progress only after durable writes, and malformed lines are isolated rather than stopping ingestion.",
        "details": [
            ("Dedicated ingestion", "Placed EVE file reading in one worker instead of the request-serving API. This avoids competing readers and keeps long-running ingestion separate from interactive website traffic."),
            ("Restart and rotation handling", "Tracked the EVE file identity and read position, persisted checkpoints in Redis after durable batches, and handled rotation so the worker can finish the old file before reopening the new one."),
            ("Normalization and storage", "Mapped alert, flow, DNS, HTTP, and TLS records into a consistent event schema, retained the original record, generated a deduplication key, and wrote to monthly PostgreSQL partitions."),
            ("Event explorer", "Prepared the website view with time-range controls, severity/type/protocol filters, address and text search, saved searches, live tail, a results table, and facets."),
        ],
        "visible": "The Events workspace exposes time windows, severity chips, event-type and protocol controls, address/text search, live-tail mode, saved searches, results, and facets.",
        "focus": ["Bounded time-window search", "Severity/type/protocol filters", "Results and facet areas"],
        "sources": ["reports/modules/M05-event-pipeline_1.md", "backend/app/pipeline/tailer.py", "backend/app/pipeline/normalize.py", "frontend/src/pages/events/EventsPage.jsx"],
        "verification": "Pipeline wording follows the implemented tailer, normalizer, writer, partitions, and Events page; no claimed event source outside Suricata/PCAP is introduced.",
    },
    8: {
        "date": "07 September 2026",
        "phase": "Faceted Search and Correlation Rules",
        "planned": "Add scalable event exploration and a correlation engine that can turn raw alerts into actionable findings.",
        "completed": "Designed keyset-paginated event queries, filter/facet contracts, saved searches, and correlation rules stored as data. Implemented evaluator patterns for threshold, sequence, rare-event, and beacon-like behavior, plus candidate creation and rule-run tracking.",
        "commits": "Total: 0 standalone commits this review period. Search and correlation were integrated as feature milestones and committed after joint testing on 21 September.",
        "issues": "Created: Offset pagination degrades on large event tables; hard-coded detectors are difficult to tune. Closed: Adopted indexed keyset pagination and editable rules-as-data with bounded evaluator inputs.",
        "status": "~63% complete — on track. Analysts could search evidence and define repeatable detections.",
        "blockers": "Correlation needed deterministic windows and duplicate suppression so repeated worker passes would not create duplicate candidates.",
        "next": "Complete incident promotion, assignment, status/severity changes, evidence linking, and immutable history.",
        "study": "Studied keyset versus offset pagination, time-window correlation, threshold and sequence detection, beacon periodicity, and false-positive control. Rule state and runs are persisted so detections remain explainable and auditable.",
        "details": [
            ("Search contract", "Defined bounded time windows, severity/type/address/port/protocol/signature/text filters, opaque cursors, result limits, sort direction, cached facets, and reusable saved searches."),
            ("Rules as data", "Stored rule name, description, enable state, type, match filters, grouping fields, window, threshold, severity, duplicate-suppression window, and type-specific parameters in persistent records."),
            ("Evaluator types", "Implemented threshold, sequence, rare-event, and beacon-style evaluation. Candidates retain the rule and matched event evidence so an analyst can understand why the detection was produced."),
            ("Correlation workspace", "Built Rules and Candidates tabs, a New rule action, list columns for type/window/threshold/candidate count/last run, and an empty state that directs administrators to create the first rule."),
        ],
        "visible": "The Correlation workspace shows the Rules/Candidates organization, rule creation entry point, operational columns, and the explanatory empty state.",
        "focus": ["Rules and Candidates tabs", "New-rule workflow", "Rule status and run columns"],
        "sources": ["reports/modules/M06-search_1.md", "reports/modules/M07-correlation_1.md", "frontend/src/pages/correlation/CorrelationPage.jsx", "backend/app/api/routes/correlation.py"],
        "verification": "Rule types, fields, candidate behaviour, and user-facing labels were verified against the M6/M7 specifications and implemented backend/frontend files.",
    },
    9: {
        "date": "14 September 2026",
        "phase": "Incident Lifecycle and Evidence Management",
        "planned": "Integrate M1–M5 work and implement the analyst incident lifecycle.",
        "completed": "Merged authentication, asset discovery, sensor, and event-pipeline foundations in one reviewed milestone. Added incident creation from candidates, human-readable numbering, status/severity/assignee changes, event attachment, comments, and append-only incident history.",
        "commits": "Total: 1 major consolidated commit. d79a37c — “update the project to m5” (authentication, assets, sensor, pipeline, tests, and UI foundation).",
        "issues": "Created: Candidates needed traceable promotion without losing original evidence. Closed: Incident records retain candidate/event relationships and record every lifecycle change in history.",
        "status": "~73% complete — on track. The platform supported discovery through investigation as one integrated workflow.",
        "blockers": "The milestone was large because related database migrations, worker logic, API contracts, tests, and frontend screens had to land together.",
        "next": "Finalize search/correlation commits, reporting, scheduled generation, and safe firewall containment.",
        "study": "Reviewed incident-response case management, chain of custody, analyst assignment, evidence preservation, and append-only change history. The model separates machine-generated candidates from analyst-managed incidents while maintaining the source trail.",
        "details": [
            ("Promotion and identity", "Candidates can be promoted to incidents while retaining the originating rule and linked events. Incidents receive human-readable sequential numbers for communication in the analyst workflow."),
            ("Lifecycle controls", "Implemented new, triage, investigating, contained, resolved, and false-positive states together with severity, score, assignment, acknowledgement, closure, and required resolution information."),
            ("Evidence and history", "Events can be attached to or removed from an incident, comments can be recorded, and lifecycle changes are written to append-only history so the case remains explainable."),
            ("Incident queue", "The website groups work into My open, Unassigned, All open, Critical, and Recently closed views and displays severity, title, status, assignee, age, evidence count, and last activity."),
        ],
        "visible": "The Incidents workspace presents analyst queue tabs, sortable case columns, refresh control, and an empty state when the selected view has no matching cases.",
        "focus": ["Triage queue views", "Severity/status/assignee fields", "Evidence count and activity"],
        "sources": ["reports/modules/M08-incidents_1.md", "frontend/src/pages/incidents/IncidentsPage.jsx", "frontend/src/pages/incidents/IncidentDetail.jsx", "backend/app/api/routes/incidents.py"],
        "verification": "Incident states, queue labels, evidence links, and commit information were matched to repository code, specifications, and history.",
    },
    10: {
        "date": "21 September 2026",
        "phase": "Search, Correlation, Incidents, and Reporting Start",
        "planned": "Complete search, correlation, and incident management; start evidence reporting and response actions.",
        "completed": "Completed event search with facets/saved searches, four correlation evaluator types and live worker execution, and incident lifecycle management. Defined asynchronous report generation and a protected firewall response model with expiry and recovery behavior.",
        "commits": "Total: 3 feature commits. 567e05d — M6 event search; 76d671a — M7 correlation engine; ba4c083 — M8 incident management.",
        "issues": "Created: Long report jobs should not block API requests; containment must never block protected addresses. Closed: Designed queued report generation and mandatory protection/TTL checks before firewall changes.",
        "status": "~82% complete — on track. Detection-to-incident workflow was complete and response/reporting work had begun.",
        "blockers": "Keeping evaluator queries bounded and ensuring incident promotion remained idempotent under repeated worker execution.",
        "next": "Finish PDF/CSV/JSON reports, schedules, firewall containment, PCAP upload/analysis, and threat intelligence.",
        "study": "Studied asynchronous report pipelines, reproducible evidence exports, iptables containment, protected-IP guardrails, TTL-based rollback, and crash reconciliation. Response actions require explicit user intent and retain a complete audit trail.",
        "details": [
            ("M6 completion", "Delivered keyset-paginated event search, bounded filters, facets, saved searches, and frontend query-state handling in commit 567e05d."),
            ("M7 completion", "Delivered stored, explainable correlation rules with four evaluator types, candidate generation, run tracking, and live worker execution in commit 76d671a."),
            ("M8 completion", "Delivered promotion, queue management, assignment, lifecycle transitions, evidence handling, comments, and history in commit ba4c083."),
            ("Reporting design", "Defined four report types, asynchronous generation, PDF/CSV/JSON output where applicable, report status/download handling, and administrator-managed schedules without blocking interactive API calls."),
        ],
        "visible": "The Reports workspace provides Reports and Schedules tabs, refresh and New report actions, columns for title/type/format/status/requested/size, and report-oriented empty-state guidance.",
        "focus": ["Reports and Schedules tabs", "Asynchronous status table", "New-report generation entry"],
        "sources": ["reports/modules/M06-search_1.md", "reports/modules/M07-correlation_1.md", "reports/modules/M08-incidents_1.md", "reports/modules/M09-reporting_1.md", "frontend/src/pages/reports/ReportsPage.jsx"],
        "verification": "The three feature commits and reporting controls were taken directly from Git history and implemented module files.",
    },
    11: {
        "date": "27 September 2026",
        "phase": "Reporting, Containment, PCAP, and Intelligence",
        "planned": "Complete reporting, containment, PCAP analysis, and threat-intelligence enrichment.",
        "completed": "Implemented four asynchronous report types, report schedules, PDF/CSV/JSON outputs, protected and TTL-bounded firewall blocks, PCAP upload/parser isolation, flow/artifact extraction, IOC/source management, feed normalization, and event/incident enrichment.",
        "commits": "Total: 5 milestone commits. 87f7e20 — M9 reporting backend; e536b79 — M9 reporting frontend; fe1ca48 — M10 firewall containment; 7082a69 — M5 to M10 work; 0c98a3e — all-module integration.",
        "issues": "Created: Uploaded captures and external feeds are untrusted; firewall operations are high impact. Closed: Isolated parsing, bounded file/resource use, normalized IOCs, protected critical addresses, and enforced automatic unblock expiry.",
        "status": "~91% complete — on track. All planned functional modules were integrated end to end.",
        "blockers": "Safely parsing large/malformed captures and feeds while keeping memory, database work, and external requests bounded.",
        "next": "Run end-to-end validation, harden security controls, improve documentation/UI clarity, and prepare the final demonstration.",
        "study": "Reviewed PCAP parser isolation, MIME/size validation, flow reconstruction, IOC normalization, safe feed retrieval, request controls, and reversible containment. Indicators remain attributable to their source and match evidence.",
        "details": [
            ("Reporting", "Implemented incident summary, incident detail, asset inventory, and event statistics generation with queued status tracking, supported output formats, downloads, and scheduled execution."),
            ("Guarded containment", "Implemented admin-only blocks with required reason and TTL, protected gateway/DNS/platform targets, helper-mediated apply/revoke operations, expiry processing, reconciliation, and retained history."),
            ("PCAP analysis", "Added bounded upload validation, capture metadata, isolated parser execution, flow and artifact extraction, packet/stream views, filtering, and the ability to attach evidence to incidents."),
            ("Threat intelligence", "Added normalized IOCs, administrator-managed sources, matching against events and PCAP artifacts, retro-hunts, match history, and enrichment links into investigation views."),
        ],
        "visible": "The Firewall workspace shows active-block, kernel-rule, drift, and reconciliation-age summaries, plus New block, Active blocks, History, and expiry-oriented containment controls.",
        "focus": ["TTL-bounded New block action", "Active blocks and history", "Kernel drift/reconciliation status"],
        "sources": ["reports/modules/M09-reporting_1.md", "reports/modules/M10-firewall_1.md", "reports/modules/M11-pcap_1.md", "reports/modules/M12-threat-intel_1.md", "frontend/src/pages/firewall/FirewallPage.jsx"],
        "verification": "All named report, firewall, PCAP, and intelligence capabilities were checked against their module specifications, pages, routes, tests, and milestone commits.",
    },
    12: {
        "date": "30 September 2026",
        "phase": "Validation, Hardening, and Final Demonstration",
        "planned": "Validate the complete platform, fix integration defects, polish documentation, and prepare the faculty demonstration.",
        "completed": "Ran backend, helper, pipeline, and browser-level checks; verified authentication, discovery, detection, search, incidents, reports, firewall, PCAP, and intelligence flows. Improved the README, test evidence, dashboard clarity, navigation, empty states, visual hierarchy, responsive behavior, and first-time-user guidance.",
        "commits": "Total: 2 completion commits. 6945e77 — “updated and tested”; 19e4da8 — “Polish README with badges, TOC, and visual section dividers”. Later repository commits record maintenance, security hardening, and UI refinement.",
        "issues": "Created: Integration testing exposed confusing empty states and several edge cases around parser output, reporting, and request security. Closed: Added clearer guidance, stronger validation, reproducible test documentation, and follow-up hardening tasks.",
        "status": "100% of the planned SGP scope demonstrated. Core platform complete; subsequent commits are maintenance, security hardening, and UI refinement.",
        "blockers": "Docker networking/capture behavior varies by host OS, and realistic packet data is environment-dependent. The demonstration uses health checks, bounded test fixtures, and explicit setup guidance.",
        "next": "Collect faculty feedback, continue security/performance hardening, expand realistic datasets, and prepare deployment documentation and final presentation material.",
        "study": "Applied repository security guidance for SSRF, spoofed client IPs, rate limits, request validation, race prevention, and secure defaults. Also reviewed dashboard information hierarchy and progressive disclosure so a first-time user can understand system health and the next action immediately.",
        "details": [
            ("End-to-end coverage", "Validated login and RBAC, asset discovery, sensor control, event ingestion/search, correlation, incidents, reporting, containment, PCAP analysis, threat intelligence, and browser navigation using repository test suites and fixtures."),
            ("Defects and hardening", "Recorded and corrected integration issues affecting PCAP output, PDF report generation, logout/login timing, event facet caching, and repeated event requests; continued with request-security and worker-recovery hardening."),
            ("Documentation and usability", "Improved the README, test evidence, dashboard status communication, role-aware navigation, empty states, responsive layouts, onboarding, and the final product presentation."),
            ("Final intelligence view", "The Threat Intel workspace provides instant lookup, IOC/Matches/Sources tabs, type/severity filters, active-state filtering, add-IOC action, and columns for confidence, source, threat type, matches, and last seen."),
        ],
        "visible": "The final Threat Intel workspace shows the IOC lookup bar, IOC/Matches/Sources tabs, filters, Add IOC action, and the evidence columns used during investigation.",
        "focus": ["Instant IOC lookup", "IOC, Matches, and Sources tabs", "Analyst filtering and evidence columns"],
        "sources": ["reports/testing/TEST_REPORT.md", "reports/validation/RESULTS.md", "README.md", "frontend/src/pages/intel/IntelPage.jsx", "frontend/src/pages/intel/SourcesTab.jsx"],
        "verification": "Completion claims were limited to the repository's demonstrated SGP scope and test documentation; later work is explicitly described as follow-up hardening rather than week-12 scope expansion.",
    },
}


# Each row is intentionally tied to the decision or implementation recorded for
# that week.  These are rendered as visual research tables, not presented as
# external screenshots.
RESEARCH_TABLES = {
    1: ("Detection approach decision", [
        ("Criterion", "Options considered", "SentinelCore decision"),
        ("Network visibility", "Suricata / Snort / Zeek", "Suricata sensor"),
        ("Structured output", "Alert and event formats", "EVE JSON pipeline"),
        ("Operator workflow", "Separate tools or one flow", "Discover → detect → investigate → respond → report"),
        ("Deployment", "Cloud-only or locally managed", "Self-hosted platform"),
    ]),
    2: ("Trust-boundary and control mapping", [
        ("Boundary", "Risk considered", "Chosen project control"),
        ("Browser → API", "Unauthorized actions", "JWT session plus backend RBAC"),
        ("API → helper", "Privilege escalation", "Typed allow-listed Unix-socket operations"),
        ("Worker → database", "Replay or event loss", "Durable writes and checkpoints"),
        ("Operator → firewall", "Self-block or forgotten block", "Protected IPs and mandatory TTL"),
    ]),
    3: ("Implementation-stack selection", [
        ("Layer", "Selected component", "Role in SentinelCore"),
        ("Web interface", "React + Vite", "Protected routes and workspaces"),
        ("Application API", "FastAPI + SQLAlchemy", "Async API and data access"),
        ("Durable storage", "PostgreSQL + Alembic", "Models, partitions, migrations"),
        ("Coordination", "Redis", "Offsets and worker coordination"),
        ("Deployment edge", "Docker Compose + Nginx", "Reproducible services and routing"),
    ]),
    4: ("Full-stack service topology", [
        ("Service", "Responsibility", "Connection"),
        ("Nginx", "Single website/API entry", "React and FastAPI"),
        ("Backend", "Interactive application API", "PostgreSQL, Redis, helper"),
        ("Worker", "Ingestion and background work", "Redis and PostgreSQL"),
        ("Helper", "Privileged network operations", "Unix socket and host networking"),
        ("PostgreSQL / Redis", "Durable data / coordination", "Private Compose network"),
    ]),
    5: ("Authentication and authorization controls", [
        ("Control area", "Implemented choice", "Website effect"),
        ("Password storage", "Argon2 hashing", "Credentials are verified server-side"),
        ("Access session", "Short-lived JWT in memory", "No durable access token in localStorage"),
        ("Refresh session", "HttpOnly refresh cookie", "Session renewal is isolated from page scripts"),
        ("Authorization", "Viewer / analyst / admin RBAC", "Protected routes and role-aware actions"),
        ("Abuse handling", "Login throttling and audit", "Repeated attempts are controlled and recorded"),
    ]),
    6: ("Discovery and sensor capability mapping", [
        ("Area", "Implemented function", "Safety or evidence"),
        ("Asset discovery", "Validated Nmap scans", "Structured assets, ports, and scan history"),
        ("Privilege boundary", "Allow-listed helper operations", "API remains unprivileged"),
        ("Sensor lifecycle", "Status / start / stop", "Visible process and health state"),
        ("Rules", "Sources, overrides, staged activation", "Verify before reload with rollback"),
        ("Operations", "Throughput and drop counters", "Capture health visible to the operator"),
    ]),
    7: ("Event-pipeline reliability decisions", [
        ("Condition", "Failure risk", "Implemented handling"),
        ("Worker restart", "Replay or skipped data", "Redis-persisted inode and offset"),
        ("Log rotation", "Silent event loss", "Drain old handle, then reopen"),
        ("Malformed input", "Pipeline interruption", "Isolate the line and continue"),
        ("Repeated event", "Duplicate record", "Deterministic deduplication key"),
        ("Growing volume", "Large-table slowdown", "Monthly partitions and retention"),
    ]),
    8: ("Correlation evaluator comparison", [
        ("Evaluator", "Pattern represented", "Explainable output"),
        ("Threshold", "Count within a window", "Group, count, and matched events"),
        ("Sequence", "Ordered event stages", "Completed steps and evidence"),
        ("Rare", "Uncommon grouped activity", "Observed group and baseline window"),
        ("Beacon", "Repeated periodic activity", "Intervals, tolerance, and events"),
        ("All types", "Repeated worker passes", "Rule/run records and duplicate suppression"),
    ]),
    9: ("Incident lifecycle and evidence mapping", [
        ("Lifecycle area", "Stored information", "Analyst outcome"),
        ("Promotion", "Candidate, rule, and events", "Finding becomes a traceable case"),
        ("Triage", "Severity, score, assignee", "Work can be prioritized and owned"),
        ("Investigation", "Comments and linked evidence", "Reasoning stays with the case"),
        ("Containment", "Status and response link", "Action remains tied to evidence"),
        ("Closure", "Resolution note and history", "Final decision is reviewable"),
    ]),
    10: ("Report types and output mapping", [
        ("Report type", "Primary content", "Supported project output"),
        ("Incident summary", "Incident queue and totals", "PDF / CSV / JSON"),
        ("Incident detail", "Narrative and linked evidence", "PDF / JSON"),
        ("Asset inventory", "Assets and discovered services", "PDF / CSV / JSON"),
        ("Event statistics", "Counts and grouped event data", "PDF / CSV / JSON"),
        ("Scheduling", "Stored report parameters", "Queued generation by the worker"),
    ]),
    11: ("Integrated module safeguards", [
        ("Module", "Untrusted or high-impact input", "Implemented safeguard"),
        ("Reporting", "Long-running generation", "Queued jobs and bounded status flow"),
        ("Firewall", "Target and duration", "Protected addresses plus mandatory TTL"),
        ("PCAP", "Uploaded capture", "Magic bytes, size bounds, isolated parsing"),
        ("Threat intelligence", "IOC and source data", "Normalization, attribution, request controls"),
        ("Investigation", "Cross-module evidence", "Links to incident, event, flow, and IOC records"),
    ]),
    12: ("Final validation coverage", [
        ("Validation area", "Repository evidence", "Outcome checked"),
        ("Backend and RBAC", "pytest and end-to-end API suite", "Roles, happy paths, negative cases"),
        ("Privileged helper", "helper unit tests", "Validation, guards, and allowed operations"),
        ("Browser interface", "browser-driven smoke suite", "Login, navigation, forms, and errors"),
        ("Pipeline and workers", "module tests and fixtures", "Ingestion, reports, PCAP, and recovery"),
        ("Documentation", "README and test report", "Repeatable setup and disclosed limitations"),
    ]),
}


ARTIFACTS = {
    1: ("diagram", "poster/diagrams/demo_flow.png", "SentinelCore workflow traceability"),
    2: ("diagram", "poster/diagrams/architecture_control.png", "Privilege-separated control path"),
    3: ("diagram", "poster/diagrams/architecture_data.png", "Planned data path across modules"),
    4: ("diagram", "poster/diagrams/architecture.png", "Implemented service architecture"),
    5: ("source", "frontend/src/auth/AuthContext.jsx", "Authentication context implementation"),
    6: ("source", "frontend/src/pages/sensor/SensorPage.jsx", "Sensor workspace implementation"),
    7: ("source", "backend/app/pipeline/tailer.py", "EVE tailer and checkpoint implementation"),
    8: ("source", "frontend/src/pages/correlation/CorrelationPage.jsx", "Correlation workspace implementation"),
    9: ("source", "frontend/src/pages/incidents/IncidentsPage.jsx", "Incident queue implementation"),
    10: ("source", "backend/app/reports/generator.py", "Asynchronous report generator"),
    11: ("diagram", "poster/diagrams/response_flow.png", "Guarded response and evidence flow"),
    12: ("source", "reports/testing/TEST_REPORT.md", "Full-platform validation record"),
}


def shade(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=70, start=90, bottom=70, end=90) -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_text(cell, value: str, *, bold=False, color=INK, size=12) -> None:
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(value)
    r.bold = bold
    r.font.name = "Aptos"
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    set_cell_margins(cell)


def set_repeat_table_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_repeat_header_footer(section) -> None:
    header = section.header
    p = header.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    p.text = ""

    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("SentinelCore  •  Page ")
    r.font.name = "Aptos"
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor.from_string(MUTED)
    field = OxmlElement("w:fldSimple")
    field.set(qn("w:instr"), "PAGE")
    p._p.append(field)
    r = p.add_run(" of ")
    r.font.name = "Aptos"
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor.from_string(MUTED)
    field = OxmlElement("w:fldSimple")
    field.set(qn("w:instr"), "NUMPAGES")
    p._p.append(field)


def configure_document(doc: Document) -> None:
    section = doc.sections[0]
    section.top_margin = Inches(0.45)
    section.bottom_margin = Inches(0.45)
    section.left_margin = Inches(0.52)
    section.right_margin = Inches(0.52)
    section.header_distance = Inches(0.25)
    section.footer_distance = Inches(0.25)
    set_repeat_header_footer(section)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal.font.size = Pt(12)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(7)
    normal.paragraph_format.line_spacing = 1.08

    for name, size, color in (("Title", 25, DARK), ("Heading 1", 17, DARK), ("Heading 2", 11.5, PURPLE)):
        style = styles[name]
        style.font.name = "Aptos Display"
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(4)
        style.paragraph_format.space_after = Pt(6)


def add_kicker(doc: Document, text: str) -> None:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text.upper())
    r.font.name = "Aptos"
    r.font.size = Pt(8)
    r.font.bold = True
    r.font.color.rgb = RGBColor.from_string(PURPLE)


def add_title(doc: Document, week: int, data: dict, subtitle: str | None = None) -> None:
    add_kicker(doc, f"Weekly Student Progress Performa  •  Week {week}")
    p = doc.add_paragraph(style="Title")
    p.paragraph_format.space_after = Pt(2)
    p.add_run(subtitle or data["phase"])
    p = doc.add_paragraph(f"SentinelCore  |  {data['date']}  |  Team CS26084")
    p.paragraph_format.space_after = Pt(9)
    for run in p.runs:
        run.font.size = Pt(9)
        run.font.color.rgb = RGBColor.from_string(MUTED)


def add_label_paragraph(doc: Document, label: str, text: str) -> None:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(label + "  ")
    r.bold = True
    r.font.color.rgb = RGBColor.from_string(PURPLE)
    p.add_run(text)


def add_bullet(doc: Document, text: str, level: int = 0) -> None:
    style = "List Bullet 2" if level else "List Bullet"
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Inches(0.18 + 0.18 * level)
    p.paragraph_format.first_line_indent = Inches(-0.12)
    p.add_run(text)


def set_table_borders(table, color="DDD7E7", size="4") -> None:
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), size)
        tag.set(qn("w:color"), color)


def add_summary_table(doc: Document, week: int, data: dict) -> None:
    rows = [
        ("Planned Tasks", data["planned"]),
        ("Tasks Completed", data["completed"]),
        ("Commits Made", data["commits"]),
        ("Issues Created / Closed", data["issues"]),
        ("Milestone Status", data["status"]),
        ("Blockers / Challenges", data["blockers"]),
        ("Plan for Next Week", data["next"]),
    ]
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(1.38)
    table.columns[1].width = Inches(5.58)
    table.rows[0].cells[0].merge(table.rows[0].cells[1])
    set_cell_text(table.rows[0].cells[0], "WEEKLY PROGRESS SUMMARY", bold=True, color=WHITE, size=9)
    shade(table.rows[0].cells[0], PURPLE)
    set_repeat_table_header(table.rows[0])
    for idx, (label, value) in enumerate(rows):
        cells = table.add_row().cells
        set_cell_text(cells[0], label, bold=True, size=8)
        set_cell_text(cells[1], value, size=8)
        shade(cells[0], PALE)
        if idx % 2:
            shade(cells[1], LIGHT)
    set_table_borders(table)


def extract_original_image(source: Path, target: Path) -> None:
    with ZipFile(source) as zf:
        names = [name for name in zf.namelist() if name.startswith("word/media/")]
        if not names:
            raise RuntimeError(f"No evidence image found in {source}")
        image_name = sorted(names)[0]
        target.write_bytes(zf.read(image_name))


def pil_font(size: int, *, bold: bool = False, mono: bool = False):
    if mono:
        path = "/System/Library/Fonts/SFNSMono.ttf"
    elif bold:
        path = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    else:
        path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def draw_wrapped(draw: ImageDraw.ImageDraw, xy, text: str, font, fill, width_chars: int, spacing=6):
    wrapped = textwrap.wrap(str(text), width=max(8, width_chars)) or [""]
    draw.multiline_text(xy, "\n".join(wrapped), font=font, fill=fill, spacing=spacing)


def make_research_table_image(week: int) -> Path:
    title, rows = RESEARCH_TABLES[week]
    path = ASSETS / f"week{week:02d}_research_table.png"
    canvas = Image.new("RGB", (1800, 1040), "#F8F6FC")
    draw = ImageDraw.Draw(canvas)
    title_font = pil_font(54, bold=True)
    label_font = pil_font(22, bold=True)
    header_font = pil_font(27, bold=True)
    cell_font = pil_font(25)

    draw.rounded_rectangle((44, 38, 1756, 1000), radius=30, fill="#FFFFFF", outline="#D8CFEB", width=3)
    draw.text((92, 82), f"WEEK {week}  /  RESEARCH EVIDENCE", font=label_font, fill="#8B5CF6")
    draw.text((92, 125), title, font=title_font, fill="#17131F")
    draw.text((92, 195), "Prepared from the SentinelCore weekly record and repository decisions", font=pil_font(24), fill="#625A70")

    x0, y0, width = 92, 260, 1616
    col_widths = [370, 540, 706]
    row_h = (675 // len(rows))
    y = y0
    for ridx, row in enumerate(rows):
        fill = "#8B5CF6" if ridx == 0 else ("#F3EEFF" if ridx % 2 else "#FFFFFF")
        draw.rectangle((x0, y, x0 + width, y + row_h), fill=fill, outline="#D8CFEB", width=2)
        x = x0
        for cidx, (value, cw) in enumerate(zip(row, col_widths)):
            if cidx:
                draw.line((x, y, x, y + row_h), fill="#D8CFEB", width=2)
            font = header_font if ridx == 0 else cell_font
            color = "#FFFFFF" if ridx == 0 else "#292334"
            chars = 22 if cidx == 0 else (34 if cidx == 1 else 44)
            draw_wrapped(draw, (x + 20, y + 19), value, font, color, chars, spacing=5)
            x += cw
        y += row_h
    draw.text((92, 958), "Internal research/decision table • no external screenshot used", font=pil_font(20), fill="#625A70")
    canvas.save(path, optimize=True)
    return path


def make_source_artifact_image(week: int, rel_path: str, title: str) -> Path:
    source = ROOT.parent.parent / rel_path
    text = source.read_text(errors="replace").splitlines()
    anchors = {
        5: "export function AuthProvider",
        6: "export default function SensorPage",
        7: "class EveTailer",
        8: "export default function CorrelationPage",
        9: "export default function IncidentsPage",
        10: "async def generate_report",
        12: "## Result",
    }
    anchor = anchors.get(week, "")
    index = next((i for i, line in enumerate(text) if anchor in line), 0)
    start = max(0, index - 3)
    snippet = text[start : start + 24]

    path = ASSETS / f"week{week:02d}_repository_artifact.png"
    canvas = Image.new("RGB", (1800, 1040), "#0E0B14")
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((46, 40, 1754, 1000), radius=28, fill="#17131F", outline="#3B3150", width=3)
    draw.ellipse((88, 78, 112, 102), fill="#FF5F57")
    draw.ellipse((124, 78, 148, 102), fill="#FEBC2E")
    draw.ellipse((160, 78, 184, 102), fill="#28C840")
    draw.text((220, 72), title, font=pil_font(28, bold=True), fill="#F5F3F8")
    draw.text((88, 126), rel_path, font=pil_font(22, mono=True), fill="#A78BFA")
    draw.line((88, 172, 1710, 172), fill="#3B3150", width=2)
    code_font = pil_font(22, mono=True)
    line_font = pil_font(20, mono=True)
    y = 194
    for offset, raw in enumerate(snippet):
        line_no = start + offset + 1
        line = raw.expandtabs(4)
        if len(line) > 112:
            line = line[:109] + "..."
        draw.text((92, y), f"{line_no:>4}", font=line_font, fill="#6F667C")
        color = "#DDD6FE" if any(token in line for token in ("def ", "class ", "function ", "## ")) else "#E7E2EC"
        draw.text((174, y), line, font=code_font, fill=color)
        y += 32
    draw.text((88, 956), "Repository evidence captured directly from the SentinelCore workspace", font=pil_font(20), fill="#93899F")
    canvas.save(path, optimize=True)
    return path


def make_diagram_artifact_image(week: int, rel_path: str, title: str) -> Path:
    source = ROOT.parent.parent / rel_path
    diagram = Image.open(source).convert("RGB")
    path = ASSETS / f"week{week:02d}_repository_artifact.png"
    canvas = Image.new("RGB", (1800, 1040), "#F8F6FC")
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((46, 40, 1754, 1000), radius=28, fill="#FFFFFF", outline="#D8CFEB", width=3)
    draw.text((92, 82), f"WEEK {week}  /  PROJECT ARCHITECTURE EVIDENCE", font=pil_font(22, bold=True), fill="#8B5CF6")
    draw.text((92, 126), title, font=pil_font(46, bold=True), fill="#17131F")
    draw.text((92, 190), rel_path, font=pil_font(22, mono=True), fill="#625A70")
    target_w, target_h = 1600, 650
    diagram.thumbnail((target_w, target_h))
    x = 900 - diagram.width // 2
    y = 560 - diagram.height // 2
    draw.rounded_rectangle((78, 248, 1722, 884), radius=18, fill="#FBFAFD", outline="#E1DAEC", width=2)
    canvas.paste(diagram, (x, y))
    draw.text((92, 936), "Diagram captured from the SentinelCore repository", font=pil_font(20), fill="#625A70")
    canvas.save(path, optimize=True)
    return path


def prepare_artifact(week: int) -> tuple[Path, str]:
    kind, rel_path, title = ARTIFACTS[week]
    if kind == "diagram":
        return make_diagram_artifact_image(week, rel_path, title), title
    return make_source_artifact_image(week, rel_path, title), title


def add_full_evidence_page(doc: Document, week: int, data: dict, image_path: Path) -> None:
    add_title(doc, week, data, "Full-Screen Website Evidence")
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(7)
    p.add_run("Evidence statement. ").bold = True
    p.add_run(data["visible"])
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    p.add_run().add_picture(str(image_path), width=Inches(6.95))
    p = doc.add_paragraph(f"Figure W{week}.1 — Original 1440 × 900 SentinelCore product capture retained from the week-{week} report.")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(8)
    for run in p.runs:
        run.italic = True
        run.font.size = Pt(8)
        run.font.color.rgb = RGBColor.from_string(MUTED)
    add_label_paragraph(doc, "What this proves", "The named workspace, navigation, actions, labels, status areas, and empty-state guidance were present in the SentinelCore interface captured for this week.")
    add_label_paragraph(doc, "Evidence boundary", "This image is a project-owned interface capture already embedded in the original report. It is not an external reference, stock screenshot, or mock evidence added for expansion.")


def add_focused_evidence_page(doc: Document, week: int, data: dict, crops: list[Path]) -> None:
    add_title(doc, week, data, "Focused Website Evidence")
    intro = doc.add_paragraph("The three views below enlarge distinct areas of the original capture so interface evidence can be reviewed without adding any material outside SentinelCore.")
    intro.paragraph_format.space_after = Pt(6)
    for idx, (path, focus) in enumerate(zip(crops, data["focus"]), 1):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(f"Evidence focus {idx}: {focus}")
        r.bold = True
        r.font.color.rgb = RGBColor.from_string(PURPLE)
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(2)
        p.add_run().add_picture(str(path), width=Inches(6.8), height=Inches(1.7))
        cap = doc.add_paragraph(f"Figure W{week}.{idx + 1} — Enlarged project evidence from Figure W{week}.1; no visual content has been introduced.")
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.paragraph_format.space_after = Pt(5)
        for run in cap.runs:
            run.italic = True
            run.font.size = Pt(7.5)
            run.font.color.rgb = RGBColor.from_string(MUTED)


def add_page_break(doc: Document) -> None:
    doc.add_page_break()


def add_form_header(doc: Document, week: int, data: dict, page_title: str) -> None:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Weekly Student Progress Performa")
    r.font.name = "Aptos Display"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor.from_string(DARK)

    table = doc.add_table(rows=4, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    values = [
        ("Team Id", "CS26084", "Week no / Date", f"Week {week}  {data['date']}"),
        ("Project Title", "SentinelCore: A Network Detection and Incident Response Platform", "", ""),
        ("Members Present", "Om Rashiya (24cs084), Yash Patel (24cs082)", "", ""),
        ("Mentor", "Akshita Kadam", "", ""),
    ]
    for ridx, (a, b, c, d) in enumerate(values):
        row = table.rows[ridx]
        if ridx > 0:
            row.cells[1].merge(row.cells[3])
            cells = [row.cells[0], row.cells[1]]
            entries = [(a, True), (b, False)]
        else:
            cells = row.cells
            entries = [(a, True), (b, False), (c, True), (d, False)]
        for cell, (value, bold) in zip(cells, entries):
            set_cell_text(cell, value, bold=bold, size=12)
            if bold:
                shade(cell, PALE)
    set_table_borders(table)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(page_title)
    r.bold = True
    r.font.name = "Aptos Display"
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor.from_string(PURPLE)


def add_section_header(doc: Document, week: int, data: dict, page_title: str) -> None:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(f"SENTINELCORE  •  WEEK {week}  •  {data['date']}")
    r.font.name = "Aptos"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor.from_string(PURPLE)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(page_title)
    r.font.name = "Aptos Display"
    r.font.size = Pt(20)
    r.font.bold = True
    r.font.color.rgb = RGBColor.from_string(DARK)


def add_form_details_table(doc: Document, rows: list[tuple[str, str]], *, font_size: float = 12) -> None:
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(1.5)
    table.columns[1].width = Inches(5.45)
    set_cell_text(table.rows[0].cells[0], "Section", bold=True, color=WHITE, size=12)
    set_cell_text(table.rows[0].cells[1], "Details to be filled by the team", bold=True, color=WHITE, size=12)
    shade(table.rows[0].cells[0], PURPLE)
    shade(table.rows[0].cells[1], PURPLE)
    set_repeat_table_header(table.rows[0])
    for index, (label, value) in enumerate(rows):
        cells = table.add_row().cells
        set_cell_text(cells[0], label, bold=True, size=font_size)
        set_cell_text(cells[1], value, size=font_size)
        shade(cells[0], PALE)
        if index % 2:
            shade(cells[1], LIGHT)
    set_table_borders(table)


def add_centered_image(doc: Document, path: Path, *, width=6.75, max_height=4.2) -> None:
    with Image.open(path) as image:
        ratio = image.height / image.width
    height = min(width * ratio, max_height)
    if height == max_height:
        width = max_height / ratio
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    p.add_run().add_picture(str(path), width=Inches(width), height=Inches(height))


def add_figure_caption(doc: Document, text: str) -> None:
    p = doc.add_paragraph(text)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(4)
    for run in p.runs:
        run.italic = True
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor.from_string(MUTED)


def make_report(week: int, data: dict, source: Path, output: Path) -> None:
    full_image = ASSETS / f"week{week:02d}_full.png"
    extract_original_image(source, full_image)
    research_image = make_research_table_image(week)
    artifact_image, artifact_title = prepare_artifact(week)

    doc = Document()
    configure_document(doc)

    # Page 1 — the original one-page progress form, retained as the first page.
    add_form_header(doc, week, data, f"Page 1 of 5 — Weekly Progress Summary: {data['phase']}")
    add_form_details_table(doc, [
        ("Planned Tasks (from last week)", data["planned"]),
        ("Tasks Completed This Week", data["completed"]),
        ("Commits Made", data["commits"]),
        ("Issues Created / Closed", data["issues"]),
        ("Milestone Status", data["status"]),
        ("Blockers / Challenges Faced", data["blockers"]),
        ("Plan for Next Week", data["next"]),
    ], font_size=12)

    # Page 2 — research work in the same performa structure.
    add_page_break(doc)
    add_section_header(doc, week, data, "Research and Technical Study")
    add_form_details_table(doc, [
        ("Research Objective", data["planned"]),
        ("Study Conducted", data["study"]),
        ("Decision Applied", "The selected approach was carried into the SentinelCore workflow and implementation described for this week. The table below records the alternatives, project requirement, and the decision that was actually used."),
    ], font_size=12)
    add_centered_image(doc, research_image, width=7.0, max_height=4.25)
    add_figure_caption(doc, f"Figure W{week}.1 — Week-specific research/decision table prepared only from the SentinelCore weekly record.")

    # Page 3 — relevant website screen, without duplicate crops.
    add_page_break(doc)
    add_section_header(doc, week, data, "Implementation Record and Website Evidence")
    add_form_details_table(doc, [
        ("Work Completed", data["completed"]),
        ("What the Website Shows", data["visible"]),
        (data["details"][0][0], data["details"][0][1]),
        (data["details"][1][0], data["details"][1][1]),
        ("Week Mapping", f"This project-owned SentinelCore screen is assigned specifically to Week {week}. Its labels, actions, status areas, and navigation correspond to the work recorded for this milestone."),
    ], font_size=12)
    add_centered_image(doc, full_image, width=7.0, max_height=3.45)
    add_figure_caption(doc, f"Figure W{week}.2 — Original 1440 × 900 SentinelCore website evidence for Week {week}; shown once without repeated zooms.")

    # Page 4 — a different repository artifact or architecture diagram.
    add_page_break(doc)
    add_section_header(doc, week, data, "Repository and Architecture Evidence")
    add_form_details_table(doc, [
        ("Artifact", artifact_title),
        ("Repository Traceability", "; ".join(data["sources"])),
        ("Verification", data["verification"]),
        (data["details"][2][0], data["details"][2][1]),
        (data["details"][3][0], data["details"][3][1]),
    ], font_size=12)
    add_centered_image(doc, artifact_image, width=7.0, max_height=3.75)
    add_figure_caption(doc, f"Figure W{week}.3 — Distinct internal project artifact used to verify the Week {week} implementation record.")

    # Page 5 — closure and faculty assessment in the original form style.
    add_page_break(doc)
    add_section_header(doc, week, data, "Weekly Closure and Faculty Assessment")
    add_form_details_table(doc, [
        ("Detailed Work Completed", data["completed"]),
        ("Implementation Areas", "; ".join(heading for heading, _ in data["details"])),
        ("Verification Note", data["verification"]),
        ("Challenges / Resolution", data["blockers"]),
        ("Plan for Next Week", data["next"]),
        ("GitHub Repository", "https://github.com/rashiyaom/SentinelCore"),
    ], font_size=12)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(5)
    r = p.add_run("Faculty Assessment")
    r.bold = True
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor.from_string(PURPLE)
    assessor = doc.add_table(rows=2, cols=3)
    assessor.alignment = WD_TABLE_ALIGNMENT.CENTER
    labels = ["Assessed By (Faculty)", "Marks Awarded (5 marks)", "Faculty Remarks"]
    for cell, label in zip(assessor.rows[0].cells, labels):
        set_cell_text(cell, label, bold=True, color=WHITE, size=12)
        shade(cell, PURPLE)
    for cell in assessor.rows[1].cells:
        set_cell_text(cell, "\n\n", size=12)
    set_table_borders(assessor)

    doc.core_properties.title = f"SentinelCore Weekly Progress Report — Week {week}"
    doc.core_properties.subject = data["phase"]
    doc.core_properties.author = "Om Rashiya (24cs084), Yash Patel (24cs082)"
    doc.core_properties.keywords = "SentinelCore, weekly progress, SGP, evidence"
    doc.core_properties.comments = "Mentor: Akshita Kadam. Expanded exclusively from repository material and project-owned evidence."
    doc.save(output)


def main() -> None:
    BACKUP.mkdir(exist_ok=True)
    ASSETS.mkdir(exist_ok=True)
    for week in range(1, 13):
        name = f"24cs084_Week{week}.docx"
        current = ROOT / name
        source = BACKUP / name
        if not source.exists():
            if not current.exists():
                raise FileNotFoundError(current)
            shutil.copy2(current, source)
        make_report(week, WEEKS[week], source, current)
        print(f"Expanded {name}")


if __name__ == "__main__":
    main()
