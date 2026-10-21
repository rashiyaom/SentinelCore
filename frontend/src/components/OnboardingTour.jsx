import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  GitMerge,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { useDemo } from "../demo/DemoContext";
import Button from "./Button";
import Modal from "./Modal";

const STEPS = [
  {
    eyebrow: "Welcome",
    title: "See the whole security story—not disconnected alerts",
    icon: Sparkles,
    description:
      "SentinelCore is a self-hosted network detection and incident response workspace. It turns network observations into evidence an analyst can search, group, investigate, contain, and report.",
    points: [
      "Suricata produces explainable network events from readable signatures.",
      "SentinelCore preserves the original evidence while organizing the response workflow.",
      "The real system is designed for networks you own or are authorized to monitor.",
    ],
    cue: "Think of the product as a chain: asset → event → candidate → incident → response → report.",
  },
  {
    eyebrow: "Orient",
    title: "Start with assets, events, and incidents",
    icon: Boxes,
    description:
      "The left navigation follows the investigation flow. You do not need to understand every module before starting.",
    points: [
      "Assets explains which devices and services are present on the protected network.",
      "Events is the searchable stream of normalized sensor evidence.",
      "Incidents is the analyst queue for activity that deserves coordinated investigation.",
    ],
    cue: "On a normal shift, check Overview first, then open Incidents before searching individual Events.",
  },
  {
    eyebrow: "Understand",
    title: "Correlation reduces noise without hiding the reason",
    icon: GitMerge,
    description:
      "Repeated or related events can be grouped using threshold, sequence, rare-event, and beacon-style rules. Each candidate retains the contributing evidence and the rule that matched.",
    points: [
      "Review the grouping keys and time window before promoting a candidate.",
      "Use threat intelligence and PCAP analysis as supporting context, not automatic proof.",
      "Record an analyst conclusion so the decision remains understandable later.",
    ],
    cue: "A high score prioritizes review; it does not replace analyst verification.",
  },
  {
    eyebrow: "Respond safely",
    title: "Every sensitive action has a guardrail",
    icon: ShieldCheck,
    description:
      "SentinelCore separates the unprivileged application from the narrow helper that performs approved network operations. Permissions also determine what each user can change.",
    points: [
      "Viewers can inspect evidence; analysts can manage investigations; admins control sensor and firewall actions.",
      "Firewall containment requires a reason and a 60-second to 24-hour expiry.",
      "Gateway, DNS, and platform addresses are protected from accidental blocking.",
    ],
    cue: "Use the shortest useful containment period and confirm the effect before extending it.",
  },
  {
    eyebrow: "Preserve evidence",
    title: "Close the loop with reports and an audit trail",
    icon: BarChart3,
    description:
      "An investigation is not complete when traffic stops. Reports preserve the evidence, timeline, ownership, response decisions, and resolution for review.",
    points: [
      "Incident history records lifecycle changes and comments.",
      "Reports can summarize incidents, event statistics, and asset inventory.",
      "Write resolution notes that explain both what happened and what should change next.",
    ],
    cue: "A future reviewer should be able to reconstruct the decision without asking the original analyst.",
  },
  {
    eyebrow: "Practice",
    title: "Run the safe guided simulation",
    icon: PlayCircle,
    description:
      "The Demo Lab replays a synthetic SSH-access scenario from detection to closure. It is available to every authenticated user and never writes to the database, sensor, or firewall.",
    points: [
      "Play automatically or move through each stage at your own pace.",
      "Read the evidence, learning objective, and expected analyst action at every step.",
      "Follow links into the real workspace when you are ready to explore live modules.",
    ],
    cue: "All demo IPs, events, people, and outcomes are fictional and visibly labeled as simulation data.",
  },
];

export default function OnboardingTour() {
  const { user } = useAuth();
  const { tourOpen, tourStep, setTourStep, closeTour } = useDemo();
  const navigate = useNavigate();
  const step = STEPS[tourStep] || STEPS[0];
  const Icon = step.icon;
  const isLast = tourStep === STEPS.length - 1;

  const roleCopy = useMemo(() => {
    if (user?.role === "admin") return "As an admin, you can also manage the sensor, users, and bounded firewall containment.";
    if (user?.role === "analyst") return "As an analyst, your core work is triage, evidence review, incident progression, and reporting.";
    return "As a viewer, you can safely explore evidence and reports without changing operational state.";
  }, [user?.role]);

  const finish = () => {
    closeTour();
    navigate("/demo");
  };

  return (
    <Modal
      open={tourOpen}
      onClose={closeTour}
      title="Getting started with SentinelCore"
      description={`${tourStep + 1} of ${STEPS.length} · ${roleCopy}`}
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <button type="button" onClick={closeTour} className="text-xs text-slate-500 hover:text-slate-300">
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              disabled={tourStep === 0}
              onClick={() => setTourStep((index) => Math.max(0, index - 1))}
            >
              Back
            </Button>
            {isLast ? (
              <Button size="sm" icon={PlayCircle} onClick={finish}>Open Demo Lab</Button>
            ) : (
              <Button size="sm" icon={ArrowRight} onClick={() => setTourStep((index) => Math.min(STEPS.length - 1, index + 1))}>
                Next cue
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="mb-5 flex gap-1.5" aria-label="Onboarding progress">
        {STEPS.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setTourStep(index)}
            aria-label={`Open cue ${index + 1}: ${item.title}`}
            className={`h-1.5 flex-1 transition ${index <= tourStep ? "bg-violet-400" : "bg-slate-700"}`}
          />
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <div className="grid h-14 w-14 place-items-center border border-violet-400/25 bg-violet-400/10 text-violet-300">
          <Icon size={25} strokeWidth={1.7} />
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-300">{step.eyebrow}</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{step.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {step.points.map((point, index) => (
          <div key={point} className="flex items-start gap-3 border border-white/[0.08] bg-white/[0.025] px-4 py-3">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-violet-400/10 font-mono text-[9px] text-violet-300">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="text-xs leading-5 text-slate-300">{point}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 border-l-2 border-sky-400 bg-sky-400/[0.06] px-4 py-3">
        <GraduationCap size={17} className="mt-0.5 shrink-0 text-sky-300" />
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-sky-300">Guidance cue</p>
          <p className="mt-1 text-xs leading-5 text-sky-100/80">{step.cue}</p>
        </div>
      </div>
    </Modal>
  );
}
