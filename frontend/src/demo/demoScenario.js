import {
  Activity,
  CheckCircle2,
  FileCheck2,
  GitMerge,
  Radar,
  SearchCheck,
  ShieldBan,
} from "lucide-react";

export const DEMO_SCENARIO = {
  id: "ssh-burst-01",
  caseNumber: "SC-DEMO-001",
  title: "Repeated SSH access attempts against a finance file server",
  summary:
    "A documentation-only address generates a burst of failed SSH connections. Follow the signal from asset context to detection, correlation, investigation, reversible containment, and reporting.",
  sourceIp: "203.0.113.47",
  targetIp: "10.10.20.14",
  targetName: "finance-nas",
  protocol: "TCP/22 · SSH",
  simulatedStart: "10:42:08 IST",
};

export const DEMO_STEPS = [
  {
    id: "baseline",
    label: "Baseline",
    shortLabel: "Ready",
    title: "Protected network baseline established",
    icon: Radar,
    tone: "sky",
    status: "Environment ready",
    description:
      "SentinelCore knows which systems belong to the monitored network and which services they normally expose. This context lets an analyst distinguish an expected service from an unexpected connection.",
    learning:
      "Asset context answers the first investigation question: what system is involved, who owns it, and should this service be reachable?",
    action: "Confirm the target is a known finance asset with SSH restricted to administrators.",
    evidence: [
      ["Known assets", "3"],
      ["Target", "finance-nas · 10.10.20.14"],
      ["Expected service", "SSH · TCP/22"],
      ["Sensor state", "Monitoring"],
    ],
    feed: [
      { time: "10:42:00", type: "system", text: "Demo network baseline loaded" },
      { time: "10:42:01", type: "asset", text: "finance-nas identified as a managed server" },
    ],
  },
  {
    id: "detect",
    label: "Detect",
    shortLabel: "Alert",
    title: "Suricata emits a burst of explainable alerts",
    icon: Activity,
    tone: "rose",
    status: "High-severity signal",
    description:
      "The sensor observes 24 failed SSH connection attempts from 203.0.113.47 in 90 seconds. Each synthetic alert retains its signature, source, destination, protocol, and timestamp.",
    learning:
      "SentinelCore does not hide the reason for a detection: every event traces back to readable network evidence and a named rule.",
    action: "Inspect the source, destination, signature, severity, and time window before deciding whether the activity is hostile.",
    evidence: [
      ["Raw alerts", "24"],
      ["Signature", "DEMO · Repeated SSH authentication failures"],
      ["Source", "203.0.113.47 · TEST-NET-3"],
      ["Window", "90 seconds"],
    ],
    feed: [
      { time: "10:42:08", type: "alert", text: "First failed SSH attempt observed" },
      { time: "10:42:37", type: "alert", text: "Threshold crossed: 10 attempts" },
      { time: "10:43:38", type: "alert", text: "Burst reached 24 related alerts" },
    ],
  },
  {
    id: "correlate",
    label: "Correlate",
    shortLabel: "Group",
    title: "Related events become one investigation candidate",
    icon: GitMerge,
    tone: "violet",
    status: "Candidate created",
    description:
      "A threshold rule groups the related alerts by source and destination. Instead of asking an analyst to triage 24 rows independently, SentinelCore produces one explainable candidate with the original evidence attached.",
    learning:
      "Correlation reduces alert fatigue without discarding evidence. The candidate records the rule, grouping keys, window, score, and contributing events.",
    action: "Review why the rule matched, confirm that all grouped events belong to the same behavior, and promote the candidate.",
    evidence: [
      ["Correlation rule", "SSH burst · threshold"],
      ["Input", "24 related alerts"],
      ["Output", "1 candidate"],
      ["Risk score", "86 / 100"],
    ],
    feed: [
      { time: "10:43:39", type: "correlation", text: "Threshold evaluator grouped 24 events" },
      { time: "10:43:39", type: "correlation", text: "Candidate score calculated: 86 / 100" },
    ],
  },
  {
    id: "investigate",
    label: "Investigate",
    shortLabel: "Triage",
    title: "Analyst validates the evidence and promotes an incident",
    icon: SearchCheck,
    tone: "amber",
    status: "Incident investigating",
    description:
      "The analyst checks asset ownership, event timing, threat-intelligence context, and packet-level facts. The candidate is promoted to incident SC-DEMO-001 and assigned for investigation.",
    learning:
      "An alert is not automatically treated as truth. SentinelCore keeps machine findings separate from the human-managed incident lifecycle.",
    action: "Record the working conclusion, attach relevant evidence, assign an owner, and move the incident to Investigating.",
    evidence: [
      ["Incident", "SC-DEMO-001"],
      ["Severity", "High"],
      ["Assignee", "Demo Analyst"],
      ["Confidence", "High · synthetic scenario"],
    ],
    feed: [
      { time: "10:44:10", type: "incident", text: "Candidate promoted to SC-DEMO-001" },
      { time: "10:44:22", type: "incident", text: "Status changed: New → Investigating" },
      { time: "10:44:31", type: "evidence", text: "24 events and asset context attached" },
    ],
  },
  {
    id: "contain",
    label: "Contain",
    shortLabel: "Block",
    title: "A reversible containment action is prepared",
    icon: ShieldBan,
    tone: "orange",
    status: "15-minute block simulated",
    description:
      "SentinelCore validates the target against the protected gateway, DNS, and platform addresses, then demonstrates a 15-minute block. The exercise never touches the host firewall.",
    learning:
      "Containment is deliberately bounded: every real block needs a TTL, a reason, authorization, and a safe target. Reconciliation removes expired rules.",
    action: "Verify the target, choose the shortest useful TTL, document the reason, and monitor whether malicious traffic stops.",
    evidence: [
      ["Target", "203.0.113.47"],
      ["Pre-check", "Safe · not protected"],
      ["TTL", "15 minutes"],
      ["Scope", "Simulation only · no kernel change"],
    ],
    feed: [
      { time: "10:45:03", type: "control", text: "Protected-address pre-check passed" },
      { time: "10:45:08", type: "control", text: "Simulated TTL block active for 15 minutes" },
    ],
  },
  {
    id: "report",
    label: "Report",
    shortLabel: "Close",
    title: "Evidence is summarized and the incident is resolved",
    icon: FileCheck2,
    tone: "emerald",
    status: "Scenario complete",
    description:
      "The analyst records the resolution, preserves the event links and containment history, and prepares an incident report. The audit trail explains who changed what and when.",
    learning:
      "Closure is part of the security workflow: a defensible incident record includes evidence, decisions, response actions, and a clear resolution note.",
    action: "Add the resolution note, confirm the temporary block expires, generate the report, and capture follow-up recommendations.",
    evidence: [
      ["Final status", "Resolved"],
      ["Events preserved", "24"],
      ["Containment", "TTL expiry recorded"],
      ["Output", "Incident summary ready"],
    ],
    feed: [
      { time: "10:59:59", type: "control", text: "Simulated block expired automatically" },
      { time: "11:00:14", type: "report", text: "Incident summary assembled" },
      { time: "11:00:30", type: "incident", text: "SC-DEMO-001 resolved with notes" },
    ],
  },
  {
    id: "complete",
    label: "Review",
    shortLabel: "Done",
    title: "You completed the detection-to-response workflow",
    icon: CheckCircle2,
    tone: "emerald",
    status: "Demo completed",
    description:
      "You followed one suspicious behavior through asset context, detection, correlation, analyst validation, reversible containment, reporting, and closure.",
    learning:
      "The central idea of SentinelCore is continuity: raw network evidence remains connected to the incident and every response decision remains accountable.",
    action: "Use the workspace links below to inspect the equivalent real modules, or reset the scenario and replay it at your own pace.",
    evidence: [
      ["Raw alerts", "24"],
      ["Incidents", "1"],
      ["Alert reduction", "95.8%"],
      ["Real data changed", "None"],
    ],
    feed: [
      { time: "11:00:31", type: "system", text: "Guided simulation completed" },
    ],
  },
];

export const DEMO_WORKSPACE_LINKS = [
  { to: "/assets", label: "Assets", text: "Identify systems and exposed services", icon: Radar },
  { to: "/events", label: "Events", text: "Search the original network evidence", icon: Activity },
  { to: "/correlation", label: "Correlation", text: "Understand why related events were grouped", icon: GitMerge },
  { to: "/incidents", label: "Incidents", text: "Triage, assign and document investigations", icon: SearchCheck },
];
