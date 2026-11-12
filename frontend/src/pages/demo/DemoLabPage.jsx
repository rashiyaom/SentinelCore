import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  FileText,
  Info,
  Network,
  Pause,
  Play,
  RotateCcw,
  Server,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { useDemo } from "../../demo/DemoContext";
import { DEMO_SCENARIO, DEMO_STEPS, DEMO_WORKSPACE_LINKS } from "../../demo/demoScenario";

const TONES = {
  sky: { text: "text-sky-300", border: "border-sky-400/25", bg: "bg-sky-400/[0.07]", solid: "bg-sky-400" },
  rose: { text: "text-rose-300", border: "border-rose-400/25", bg: "bg-rose-400/[0.07]", solid: "bg-rose-400" },
  violet: { text: "text-violet-300", border: "border-violet-400/25", bg: "bg-violet-400/[0.07]", solid: "bg-violet-400" },
  amber: { text: "text-amber-300", border: "border-amber-400/25", bg: "bg-amber-400/[0.07]", solid: "bg-amber-400" },
  orange: { text: "text-orange-300", border: "border-orange-400/25", bg: "bg-orange-400/[0.07]", solid: "bg-orange-400" },
  emerald: { text: "text-emerald-300", border: "border-emerald-400/25", bg: "bg-emerald-400/[0.07]", solid: "bg-emerald-400" },
};

const FEED_TONES = {
  system: "text-sky-300",
  asset: "text-cyan-300",
  alert: "text-rose-300",
  correlation: "text-violet-300",
  incident: "text-amber-300",
  evidence: "text-sky-300",
  control: "text-orange-300",
  report: "text-emerald-300",
};

function Metric({ label, value, detail, tone = "violet" }) {
  const colors = TONES[tone];
  return (
    <div className="border border-white/10 bg-[#111118] p-4">
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-[-0.04em] ${colors.text}`}>{value}</p>
      <p className="mt-1 text-[10px] leading-4 text-slate-600">{detail}</p>
    </div>
  );
}

function ProgressRail({ current, onSelect }) {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7" aria-label="Demo stages">
      {DEMO_STEPS.map((step, index) => {
        const Icon = step.icon;
        const active = index === current;
        const complete = index < current;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={`group flex h-full w-full items-center gap-2 border px-3 py-2.5 text-left transition ${
                active
                  ? "border-violet-400/40 bg-violet-400/10"
                  : complete
                    ? "border-emerald-400/20 bg-emerald-400/[0.04] hover:bg-emerald-400/[0.08]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center ${active ? "bg-violet-400 text-[#111118]" : complete ? "bg-emerald-400/10 text-emerald-300" : "bg-white/[0.04] text-slate-600"}`}>
                {complete ? <CheckCircle2 size={14} /> : <Icon size={14} />}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[7px] uppercase tracking-wider text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                <span className={`block truncate text-[11px] font-medium ${active ? "text-violet-200" : complete ? "text-emerald-200" : "text-slate-400"}`}>{step.shortLabel}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function EvidenceGrid({ evidence }) {
  return (
    <dl className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
      {evidence.map(([label, value]) => (
        <div key={label} className="bg-[#121219] px-4 py-3">
          <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-slate-600">{label}</dt>
          <dd className="mt-1.5 text-xs font-medium text-slate-200">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function DemoLabPage() {
  const { user } = useAuth();
  const {
    demoStep,
    setDemoStep,
    playing,
    setPlaying,
    hasStarted,
    start,
    reset,
    next,
    previous,
    complete,
    openTour,
  } = useDemo();

  const step = DEMO_STEPS[demoStep];
  const StepIcon = step.icon;
  const colors = TONES[step.tone] || TONES.violet;
  const visibleFeed = DEMO_STEPS.slice(0, demoStep + 1).flatMap((item) => item.feed);
  const isAdmin = user?.role === "admin";

  return (
    <>
      <section className="relative mb-6 overflow-hidden border border-violet-400/20 bg-[#111118]">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.13),transparent_60%)]" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 border border-amber-300/25 bg-amber-300/[0.08] px-2.5 py-1 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-amber-200">
              <Sparkles size={11} /> Simulation · no real data changed
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600">{DEMO_SCENARIO.caseNumber}</span>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">Guided incident simulation</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{DEMO_SCENARIO.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" icon={Info} onClick={openTour}>Project guide</Button>
              {!hasStarted ? (
                <Button size="sm" icon={Play} onClick={start}>Start simulation</Button>
              ) : (
                <Button size="sm" icon={playing ? Pause : Play} onClick={() => setPlaying((value) => !value)} disabled={complete}>
                  {playing ? "Pause" : complete ? "Completed" : "Auto-play"}
                </Button>
              )}
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset}>Reset</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Synthetic alerts" value={demoStep >= 1 ? "24" : "0"} detail="Readable network evidence" tone="rose" />
        <Metric label="Correlated incidents" value={demoStep >= 3 ? "1" : "0"} detail="24 related alerts → one case" tone="violet" />
        <Metric label="Noise reduction" value={demoStep >= 2 ? "95.8%" : "—"} detail="Illustrative demo calculation" tone="sky" />
        <Metric label="Containment TTL" value={demoStep >= 4 ? "15 min" : "—"} detail="Simulated and automatically reversible" tone="orange" />
      </div>

      <section className="mb-6 border border-white/10 bg-[#111118] p-4 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600">Scenario progress</p>
            <p className="mt-1 text-xs text-slate-400">Select any stage to review it, or use auto-play for a narrated progression.</p>
          </div>
          <span className="shrink-0 font-mono text-[9px] text-violet-300">{demoStep + 1} / {DEMO_STEPS.length}</span>
        </div>
        <ProgressRail
          current={demoStep}
          onSelect={(index) => {
            if (!hasStarted) start();
            setPlaying(false);
            setDemoStep(index);
          }}
        />
      </section>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card
          title={step.title}
          description={`${step.label} stage · ${step.status}`}
          actions={<span className={`grid h-9 w-9 place-items-center border ${colors.border} ${colors.bg} ${colors.text}`}><StepIcon size={17} /></span>}
        >
          <div className="flex items-center gap-3 border-b border-white/[0.07] pb-5">
            <span className={`h-2.5 w-2.5 ${colors.solid} ${playing ? "animate-pulse" : ""}`} />
            <p className={`font-mono text-[9px] font-semibold uppercase tracking-[0.15em] ${colors.text}`}>{step.status}</p>
            <span className="ml-auto text-[10px] text-slate-600">Synthetic clock · {DEMO_SCENARIO.simulatedStart}</span>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-300">{step.description}</p>

          <div className="mt-5">
            <EvidenceGrid evidence={step.evidence} />
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <div className="border border-violet-400/15 bg-violet-400/[0.05] p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-violet-300">Why this matters</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{step.learning}</p>
            </div>
            <div className="border border-sky-400/15 bg-sky-400/[0.05] p-4">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-sky-300">Your analyst action</p>
              <p className="mt-2 text-xs leading-5 text-slate-300">{step.action}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
            <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={previous} disabled={demoStep === 0}>Previous stage</Button>
            <p className="order-first w-full text-center text-[10px] text-slate-600 sm:order-none sm:w-auto">
              {playing ? "Auto-play advances every few seconds" : "Move at your own pace"}
            </p>
            <Button size="sm" icon={ArrowRight} onClick={next} disabled={complete}>Next stage</Button>
          </div>
        </Card>

        <Card title="Simulation activity" description="A readable timeline of what the platform would record." bodyClassName="p-0">
          <div className="max-h-[36rem] overflow-y-auto">
            {visibleFeed.map((item, index) => (
              <div key={`${item.time}-${item.text}`} className="grid grid-cols-[4.2rem_auto_1fr] gap-3 border-b border-white/[0.07] px-4 py-3 last:border-b-0">
                <span className="font-mono text-[9px] text-slate-600">{item.time}</span>
                <CircleDot size={13} className={`mt-0.5 ${FEED_TONES[item.type] || "text-slate-400"}`} />
                <div>
                  <p className="text-xs leading-5 text-slate-300">{item.text}</p>
                  <p className="mt-0.5 font-mono text-[7px] uppercase tracking-wider text-slate-700">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_.72fr]">
        <Card title="Scenario map" description="The entities and boundaries involved in this demonstration.">
          <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className="border border-rose-400/20 bg-rose-400/[0.05] p-4 text-center">
              <Network size={20} className="mx-auto text-rose-300" />
              <p className="mt-2 text-xs font-medium text-slate-200">Synthetic source</p>
              <p className="mt-1 font-mono text-[10px] text-slate-500">{DEMO_SCENARIO.sourceIp}</p>
            </div>
            <ArrowRight size={16} className="mx-auto rotate-90 text-slate-700 sm:rotate-0" />
            <div className="border border-violet-400/20 bg-violet-400/[0.05] p-4 text-center">
              <ShieldCheck size={20} className="mx-auto text-violet-300" />
              <p className="mt-2 text-xs font-medium text-slate-200">SentinelCore</p>
              <p className="mt-1 font-mono text-[10px] text-slate-500">detect · correlate · audit</p>
            </div>
            <ArrowRight size={16} className="mx-auto rotate-90 text-slate-700 sm:rotate-0" />
            <div className="border border-sky-400/20 bg-sky-400/[0.05] p-4 text-center">
              <Server size={20} className="mx-auto text-sky-300" />
              <p className="mt-2 text-xs font-medium text-slate-200">{DEMO_SCENARIO.targetName}</p>
              <p className="mt-1 font-mono text-[10px] text-slate-500">{DEMO_SCENARIO.targetIp} · {DEMO_SCENARIO.protocol}</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3 border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-xs leading-5 text-amber-100/70">203.0.113.47 is from the documentation-only TEST-NET-3 range. No packet is transmitted and no target is contacted during this simulation.</p>
          </div>
        </Card>

        <Card title="Your role in this workflow" description={`Signed in as ${user?.role || "user"}.`}>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-violet-400/20 bg-violet-400/[0.06] text-violet-300">
              <UserCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-200">{isAdmin ? "Operational administrator" : user?.role === "analyst" ? "Investigation analyst" : "Read-only reviewer"}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {isAdmin
                  ? "In the real workspace you may approve bounded containment and manage the sensor. The demo still performs no privileged action."
                  : user?.role === "analyst"
                    ? "In the real workspace you can manage incident evidence and lifecycle, while firewall and sensor controls remain admin-only."
                    : "In the real workspace you can inspect the evidence and reports without changing incident or infrastructure state."}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Continue in the real workspace" description="These pages show the live modules represented by the simulation.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DEMO_WORKSPACE_LINKS.map(({ to, label, text, icon: Icon }) => (
            <Link key={to} to={to} className="group border border-white/10 bg-white/[0.02] p-4 transition hover:border-violet-400/25 hover:bg-violet-400/[0.05]">
              <div className="flex items-center justify-between">
                <Icon size={17} className="text-violet-300" />
                <ArrowRight size={13} className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-violet-300" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-200">{label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
            </Link>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-500"><Database size={14} /> Demo data stays in this browser only.</div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><FileText size={14} /> No audit or report records are created.</div>
          <div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /> Progress is remembered per signed-in user.</div>
        </div>
      </Card>
    </>
  );
}
