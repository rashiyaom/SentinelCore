import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  FileSearch,
  Fingerprint,
  GitBranch,
  Lock,
  Menu,
  Network,
  Pause,
  Play,
  Radar,
  ScanSearch,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const capabilities = [
  {
    icon: Radar,
    index: "01",
    title: "See every device",
    text: "Build a living inventory of hosts, services, and exposed ports on the network you protect.",
  },
  {
    icon: Activity,
    index: "02",
    title: "Understand the signal",
    text: "Turn Suricata alerts into searchable events and related incidents with evidence you can trace.",
  },
  {
    icon: ShieldCheck,
    index: "03",
    title: "Respond with guardrails",
    text: "Triage, investigate, and contain threats with time-limited blocks and an immutable audit trail.",
  },
];

const steps = [
  ["Observe", "The sensor inspects mirrored traffic and produces explainable detections."],
  ["Connect", "Related events are grouped so analysts see one incident, not a wall of alerts."],
  ["Respond", "Teams investigate the evidence, contain the source, and record the outcome."],
];

const operationSlides = [
  {
    icon: Radar,
    number: "01",
    label: "Inventory",
    title: "Discover what belongs",
    text: "Scan an authorized network, identify hosts and services, and keep a living asset record instead of a forgotten spreadsheet.",
    detail: "Assets · Ports · Scan history",
  },
  {
    icon: ScanSearch,
    number: "02",
    label: "Detection",
    title: "Turn packets into signal",
    text: "Suricata rules inspect traffic while sensor health, throughput, and rule sources stay visible from one workspace.",
    detail: "Sensor · Rules · EVE events",
  },
  {
    icon: Database,
    number: "03",
    label: "Evidence",
    title: "Search without losing context",
    text: "Filter events by time, severity, protocol, signature, or address and return to useful investigations with saved searches.",
    detail: "Facets · Keyset search · Saved views",
  },
  {
    icon: GitBranch,
    number: "04",
    label: "Correlation",
    title: "Connect the quiet clues",
    text: "Rules group threshold, sequence, rare, and beacon-like behavior into candidates that explain why they were created.",
    detail: "Rules · Candidates · Run history",
  },
  {
    icon: FileSearch,
    number: "05",
    label: "Investigation",
    title: "Work the incident, not the noise",
    text: "Promote candidates, attach evidence, assign ownership, record decisions, and keep every state change in the timeline.",
    detail: "Triage · Evidence · History",
  },
  {
    icon: ShieldCheck,
    number: "06",
    label: "Response",
    title: "Contain with a way back",
    text: "Apply time-limited blocks with protected-address checks, then export the evidence as a report for review.",
    detail: "TTL blocks · Audit · Reports",
  },
];

const signalItems = [
  ["DISCOVERY", "Hosts and exposed services"],
  ["SENSOR", "Suricata rules and health"],
  ["PIPELINE", "Normalized searchable events"],
  ["CORRELATION", "Related behavior connected"],
  ["INCIDENTS", "Evidence-led investigation"],
  ["RESPONSE", "Guarded, reversible action"],
];

const workbenchViews = [
  {
    id: "observe",
    icon: Activity,
    label: "Observe",
    eyebrow: "Live signal",
    title: "A new service appears",
    text: "The event keeps the host, port, protocol, sensor signature, and original timestamp together.",
    badge: "Review",
    accent: "amber",
    rows: [["Asset", "media-hub.local"], ["Service", "TCP / 8080"], ["First seen", "just now"]],
  },
  {
    id: "investigate",
    icon: ScanSearch,
    label: "Investigate",
    eyebrow: "Connected evidence",
    title: "Related behavior is grouped",
    text: "Correlation explains which rule matched and places the relevant events beside one another for review.",
    badge: "Candidate",
    accent: "violet",
    rows: [["Rule", "Rare outbound service"], ["Evidence", "4 related events"], ["Window", "15 minutes"]],
  },
  {
    id: "respond",
    icon: ShieldCheck,
    label: "Respond",
    eyebrow: "Guarded action",
    title: "Containment stays reversible",
    text: "Protected addresses are checked first, expiry is mandatory, and the action is written to the audit history.",
    badge: "Ready",
    accent: "emerald",
    rows: [["Action", "Block source IP"], ["Duration", "30 minutes"], ["Rollback", "Automatic"]],
  },
];

const questions = [
  ["Does SentinelCore make blocking decisions automatically?", "No. Detections and candidates preserve their evidence, while containment remains an explicit, guarded action with protected-address checks and an expiry."],
  ["Can a first-time user understand what to do next?", "The experience is organized around plain-language priorities: what changed, why it matters, what evidence supports it, and which safe action is available."],
  ["Where does the security data go?", "The supplied deployment is self-hosted. Events, incidents, reports, and audit history stay inside the SentinelCore stack you operate."],
  ["Can teams separate access by responsibility?", "Yes. Viewer, analyst, and administrator roles keep observation, investigation, and system-changing controls distinct."],
];

const WORDMARK_LETTERS = ["S", "e", "c", "u", "r", "e", "H"];
const WORDMARK_TAIL = ["m", "e"];
const O_BITS = [
  ["0", "50%", "4%"],
  ["1", "82%", "18%"],
  ["0", "96%", "50%"],
  ["1", "82%", "82%"],
  ["1", "50%", "96%"],
  ["0", "18%", "82%"],
  ["1", "4%", "50%"],
  ["0", "18%", "18%"],
];

function PixelWordmark({ visible }) {
  return (
    <div className={`video-wordmark ${visible ? "is-visible" : ""}`} aria-label="SecureHome">
      <span aria-hidden="true" className="video-wordmark-inner">
        {WORDMARK_LETTERS.map((letter, index) => (
          <span key={`${letter}-${index}`} className="video-wordmark-letter" style={{ "--letter-delay": `${index * 55}ms` }}>{letter}</span>
        ))}
        <span className="pixel-o" style={{ "--letter-delay": "385ms" }}>
          <span className="pixel-o-core" />
          <span className="pixel-o-orbit">
            {O_BITS.map(([bit, x, y], index) => (
              <i key={`${bit}-${index}`} style={{ "--bit-x": x, "--bit-y": y, "--bit-delay": `${520 + index * 65}ms` }}>{bit}</i>
            ))}
          </span>
        </span>
        {WORDMARK_TAIL.map((letter, index) => (
          <span key={`${letter}-${index}`} className="video-wordmark-letter" style={{ "--letter-delay": `${460 + index * 55}ms` }}>{letter}</span>
        ))}
      </span>
      <span className="video-wordmark-kicker">Intelligence for the network you call home</span>
    </div>
  );
}

function VideoIntro() {
  const videoRef = useRef(null);
  const [phase, setPhase] = useState("intro");
  const [wordmarkVisible, setWordmarkVisible] = useState(false);
  const [playing, setPlaying] = useState(true);

  const source = phase === "intro" ? "/media/securehome-intro.mp4" : "/media/securehome-tail-loop.mp4";

  const startPlayback = () => {
    const promise = videoRef.current?.play();
    if (promise?.catch) promise.catch(() => setPlaying(false));
  };

  const handleTimeUpdate = (event) => {
    if (phase === "intro" && event.currentTarget.currentTime >= 4.8) setWordmarkVisible(true);
  };

  const handleIntroEnd = () => {
    if (phase === "intro") setPhase("tail");
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) startPlayback();
    else videoRef.current.pause();
  };

  return (
    <section className="video-intro" aria-label="SecureHome introduction">
      <video
        key={source}
        ref={videoRef}
        className="video-intro-media"
        src={source}
        poster={phase === "intro" ? "/media/securehome-poster.jpg" : undefined}
        muted
        autoPlay
        playsInline
        preload="auto"
        loop={phase === "tail"}
        onCanPlay={startPlayback}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleIntroEnd}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="video-intro-shade" aria-hidden="true" />
      <div className="video-intro-noise" aria-hidden="true" />

      <div className="video-intro-meta" aria-hidden="true">
        <span>SH / VISUAL SYSTEM 01</span>
        <span className="video-intro-live"><i /> AUTOPLAY</span>
      </div>

      <PixelWordmark visible={wordmarkVisible} />

      <button type="button" className="video-intro-control" onClick={togglePlayback} aria-label={playing ? "Pause introduction" : "Play introduction"}>
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        <span>{playing ? "Pause" : "Play"}</span>
      </button>

      <a href="#home" className="video-intro-scroll">
        <span>Scroll to enter</span>
        <ChevronDown size={15} />
      </a>
    </section>
  );
}

function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center border border-violet-400/40 bg-violet-500/15 text-violet-300">
        <Shield size={17} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold tracking-[-0.02em] text-white">
        Sentinel<span className="text-violet-400">Core</span>
      </span>
    </span>
  );
}

function ConsolePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[610px] lg:ml-auto">
      <div className="absolute -inset-8 bg-violet-500/10 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden border border-white/15 bg-[#111118] shadow-2xl shadow-black/50">
        <div className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
          <span className="h-2 w-2 bg-rose-400" />
          <span className="h-2 w-2 bg-amber-300" />
          <span className="h-2 w-2 bg-emerald-400" />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            Live security overview · illustrative
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse bg-emerald-400" /> Protected
          </span>
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-[1.1fr_.9fr]">
          <div className="bg-[#111118] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">Network map</p>
                <p className="mt-1 text-sm font-medium text-white/85">Traffic under watch</p>
              </div>
              <Network size={18} className="text-violet-400" />
            </div>
            <div className="network-map mt-5 h-56 border border-white/10 bg-[#0b0b10]">
              <span className="network-line network-line-a" />
              <span className="network-line network-line-b" />
              <span className="network-line network-line-c" />
              <span className="network-node network-node-main"><Shield size={18} /></span>
              <span className="network-node network-node-a"><span>GW</span></span>
              <span className="network-node network-node-b"><span>CAM</span></span>
              <span className="network-node network-node-c"><span>NAS</span></span>
              <span className="network-node network-node-d"><span>DNS</span></span>
            </div>
          </div>

          <div className="bg-[#15151d] p-5 sm:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">Priority queue</p>
            <div className="mt-4 space-y-3">
              <div className="border-l-2 border-rose-400 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-rose-300">Critical</span>
                  <span className="font-mono text-[9px] text-white/25">Now</span>
                </div>
                <p className="mt-2 text-xs font-medium text-white/80">Outbound C2 pattern</p>
                <p className="mt-1 font-mono text-[9px] text-white/35">Camera → unknown host</p>
              </div>
              <div className="border-l-2 border-amber-300 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-amber-200">Review</span>
                  <span className="font-mono text-[9px] text-white/25">4m</span>
                </div>
                <p className="mt-2 text-xs font-medium text-white/80">New service detected</p>
                <p className="mt-1 font-mono text-[9px] text-white/35">Port 8080 · Media device</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="border border-white/10 p-3">
                  <p className="font-mono text-[9px] text-white/35">SENSOR</p>
                  <p className="mt-1 text-xs text-emerald-300">● Running</p>
                </div>
                <div className="border border-white/10 p-3">
                  <p className="font-mono text-[9px] text-white/35">PIPELINE</p>
                  <p className="mt-1 text-xs text-white/75">Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 -left-3 hidden border border-violet-300/40 bg-violet-400 px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#111118] sm:block">
        Explainable by design
      </div>
    </div>
  );
}

function SignalMarquee() {
  const content = [...signalItems, ...signalItems];
  return (
    <div className="signal-marquee border-b border-white/10" aria-label="SentinelCore platform capabilities">
      <div className="signal-marquee-track">
        {content.map(([label, text], index) => (
          <div key={`${label}-${index}`} className="signal-marquee-item" aria-hidden={index >= signalItems.length}>
            <span>{label}</span>
            <i />
            <strong>{text}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpotlightCapability({ icon: Icon, index, title, text }) {
  const moveSpotlight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <article className="capability-card group" onPointerMove={moveSpotlight}>
      <span className="capability-card-glow" aria-hidden="true" />
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em] text-white/30 group-hover:text-violet-200">// {index}</span>
        <span className="capability-icon"><Icon size={24} strokeWidth={1.5} /></span>
      </div>
      <div className="relative z-10 mt-auto pt-24">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/45 transition-colors group-hover:text-white/68">{text}</p>
        <span className="mt-6 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-violet-300 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
          Explore the layer <ArrowRight size={12} />
        </span>
      </div>
      <span className="capability-pixels" aria-hidden="true">
        {Array.from({ length: 12 }, (_, pixel) => <i key={pixel} style={{ "--pixel-delay": `${pixel * 22}ms` }} />)}
      </span>
    </article>
  );
}

function OperationsCarousel() {
  const viewportRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (index) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const normalized = (index + operationSlides.length) % operationSlides.length;
    const card = viewport.children[normalized];
    viewport.scrollTo({ left: card.offsetLeft - viewport.offsetLeft, behavior: "smooth" });
    setActive(normalized);
  };

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(() => goTo(active + 1), 5200);
    return () => window.clearInterval(timer);
  }, [active, paused]);

  const updateActive = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(viewport.children).forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const nextDistance = Math.abs(center - childCenter);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = index;
      }
    });
    setActive(nearest);
  };

  const startDrag = (event) => {
    if (event.pointerType !== "mouse") return;
    const viewport = viewportRef.current;
    dragRef.current = { active: true, startX: event.clientX, scrollLeft: viewport.scrollLeft, moved: false };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  };

  const drag = (event) => {
    if (!dragRef.current.active) return;
    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 4) dragRef.current.moved = true;
    viewportRef.current.scrollLeft = dragRef.current.scrollLeft - distance;
  };

  const endDrag = (event) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    viewportRef.current.classList.remove("is-dragging");
    if (viewportRef.current.hasPointerCapture(event.pointerId)) viewportRef.current.releasePointerCapture(event.pointerId);
    updateActive();
  };

  return (
    <div className="operations-carousel" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div
        ref={viewportRef}
        className="operations-viewport"
        onScroll={() => window.requestAnimationFrame(updateActive)}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {operationSlides.map(({ icon: Icon, number, label, title, text, detail }, index) => (
          <article key={title} className={`operation-slide ${active === index ? "is-active" : ""}`}>
            <div className="operation-slide-top">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">// {number} · {label}</span>
              <span className="operation-slide-icon"><Icon size={26} strokeWidth={1.4} /></span>
            </div>
            <div className="operation-orbit" aria-hidden="true"><i /><i /><i /></div>
            <div className="relative z-10 mt-auto">
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="operation-detail">{detail}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="operations-controls">
        <span className="operations-count">{String(active + 1).padStart(2, "0")} / {String(operationSlides.length).padStart(2, "0")}</span>
        <div className="operations-progress" aria-hidden="true"><span style={{ width: `${((active + 1) / operationSlides.length) * 100}%` }} /></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous platform capability"><ArrowLeft size={17} /></button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Next platform capability"><ArrowRight size={17} /></button>
        </div>
      </div>
    </div>
  );
}

function EvidenceWorkbench() {
  const [active, setActive] = useState(0);
  const view = workbenchViews[active];
  const ActiveIcon = view.icon;

  return (
    <div className="workbench-grid">
      <div className="workbench-tabs" role="tablist" aria-label="Incident workflow stages">
        {workbenchViews.map(({ icon: Icon, label }, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => setActive(index)}
          >
            <span>0{index + 1}</span>
            <Icon size={17} />
            <strong>{label}</strong>
            <ArrowRight size={15} className="ml-auto" />
          </button>
        ))}
      </div>

      <div className={`workbench-panel workbench-${view.accent}`} role="tabpanel" key={view.id}>
        <div className="workbench-scan" aria-hidden="true" />
        <div className="relative z-10 flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{view.eyebrow}</p>
            <h3>{view.title}</h3>
          </div>
          <span className="workbench-status"><i /> {view.badge}</span>
        </div>
        <p className="relative z-10 mt-4 max-w-xl text-sm leading-6 text-white/50">{view.text}</p>
        <div className="workbench-data relative z-10">
          <div className="workbench-glyph"><ActiveIcon size={38} strokeWidth={1.2} /></div>
          <div className="grid flex-1 gap-px bg-white/10 sm:grid-cols-3">
            {view.rows.map(([label, value]) => (
              <div key={label} className="bg-[#111118] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/30">{label}</p>
                <p className="mt-2 text-xs font-medium text-white/75">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionList() {
  const [open, setOpen] = useState(0);
  return (
    <div className="question-list">
      {questions.map(([question, answer], index) => {
        const expanded = open === index;
        return (
          <div key={question} className={`question-item ${expanded ? "is-open" : ""}`}>
            <button type="button" onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}>
              <span className="font-mono text-[10px] text-violet-300">0{index + 1}</span>
              <strong>{question}</strong>
              <i aria-hidden="true" />
            </button>
            <div className="question-answer"><div><p>{answer}</p></div></div>
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.title = "SentinelCore · Understand and protect your network";
  }, []);

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-shell min-h-screen overflow-hidden bg-[#0b0b10] text-white">
      <VideoIntro />

      <header id="home" className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b10]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center px-5 sm:px-8">
          <Link to="/" aria-label="SentinelCore home"><Brand /></Link>
          <nav className="ml-12 hidden items-center gap-8 text-xs text-white/55 md:flex" aria-label="Main navigation">
            <a href="#platform" className="transition-colors hover:text-white">Platform</a>
            <a href="#modules" className="transition-colors hover:text-white">Modules</a>
            <a href="#workflow" className="transition-colors hover:text-white">How it works</a>
            <a href="#trust" className="transition-colors hover:text-white">Security model</a>
          </nav>
          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300 lg:inline">● System ready</span>
            <Link to="/login" className="border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5 hover:text-white">
              Sign in
            </Link>
            <Link to="/login" className="group inline-flex items-center gap-2 bg-violet-400 px-4 py-2 text-xs font-semibold text-[#101016] transition hover:bg-violet-300">
              Open console <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <button className="ml-auto p-2 text-white/70 sm:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#111118] px-5 py-5 sm:hidden">
            <nav className="grid gap-4 text-sm text-white/70">
              <a href="#platform" onClick={() => setMobileOpen(false)}>Platform</a>
              <a href="#modules" onClick={() => setMobileOpen(false)}>Modules</a>
              <a href="#workflow" onClick={() => setMobileOpen(false)}>How it works</a>
              <a href="#trust" onClick={() => setMobileOpen(false)}>Security model</a>
              <Link to="/login" className="mt-2 bg-violet-400 px-4 py-3 text-center font-semibold text-[#101016]">Sign in to console</Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="landing-grid relative border-b border-white/10">
          <div className="mx-auto grid min-h-[760px] max-w-[1240px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-28">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-violet-300">
                <Sparkles size={12} /> Network defense, made legible
              </div>
              <h1 className="mt-7 max-w-3xl text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
                Know what’s on your network. <span className="block text-violet-400">Act on what matters.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
                SentinelCore brings device discovery, explainable detection, incident triage, and guarded response into one focused workspace.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className="group inline-flex items-center justify-center gap-2 bg-violet-400 px-6 py-3.5 text-sm font-semibold text-[#101016] transition hover:bg-violet-300">
                  Enter secure console <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#platform" className="inline-flex items-center justify-center gap-2 border border-white/15 px-6 py-3.5 text-sm font-medium text-white/75 transition hover:border-white/30 hover:bg-white/5 hover:text-white">
                  Explore the platform <ChevronRight size={16} />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-300" /> Single-host deployment</span>
                <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-300" /> Role-based access</span>
                <span className="flex items-center gap-1.5"><Check size={12} className="text-emerald-300" /> Traceable detections</span>
              </div>
            </div>
            <ConsolePreview />
          </div>
        </section>

        <SignalMarquee />

        <section id="platform" className="border-b border-white/10 bg-[#0f0f15] px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">[ 01 / Platform ]</p>
                <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">One place to move from signal to decision.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-white/50 lg:ml-auto">
                Security tools often expose their internal complexity. SentinelCore organizes the work around three questions a first-time user already understands.
              </p>
            </div>

            <div className="mt-14 grid border-l border-t border-white/10 md:grid-cols-3">
              {capabilities.map(({ icon: Icon, index, title, text }) => (
                <SpotlightCapability key={title} icon={Icon} index={index} title={title} text={text} />
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="carousel-section border-b border-white/10 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">[ 02 / Modules ]</p>
                <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">One connected system. Six clear moves.</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-white/45 lg:ml-auto">Drag, swipe, or use the controls to explore the operational path. Every module passes context forward instead of starting the investigation over.</p>
            </div>
            <OperationsCarousel />
          </div>
        </section>

        <section id="workbench" className="border-b border-white/10 bg-[#0f0f15] px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">[ 03 / Evidence workbench ]</p>
                <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">Follow one signal all the way to action.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-white/50 lg:ml-auto">Explore the three views. SentinelCore keeps the reason, evidence, ownership, and response together so the next decision never depends on guesswork.</p>
            </div>
            <div className="mt-14"><EvidenceWorkbench /></div>
          </div>
        </section>

        <section id="workflow" className="landing-dots border-b border-white/10 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">[ 04 / Workflow ]</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">A calm path through a live incident.</h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/45">The interface keeps context attached to the work, so each handoff is clear and every response is accountable.</p>
            </div>
            <div className="border-t border-white/15">
              {steps.map(([title, text], index) => (
                <div key={title} className="workflow-row group grid gap-4 border-b border-white/15 py-8 sm:grid-cols-[4rem_9rem_1fr] sm:items-start">
                  <span className="font-mono text-xs text-violet-300">0{index + 1}</span>
                  <h3 className="text-xl font-medium tracking-[-0.02em]">{title}</h3>
                  <p className="max-w-xl text-sm leading-6 text-white/45 transition group-hover:text-white/65">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="trust" className="border-b border-white/10 bg-violet-400 px-5 py-20 text-[#111118] sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-black/55"><Fingerprint size={15} /> Built with guardrails</div>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-5xl">Powerful response without hidden decisions.</h2>
            </div>
            <div className="grid gap-px border border-black/20 bg-black/20 sm:grid-cols-2">
              {[
                [Zap, "Readable rules", "Every alert traces back to a rule you can inspect."],
                [Shield, "TTL containment", "Firewall blocks expire by design and protect critical addresses."],
                [FileSearch, "Audit history", "Sensitive actions are recorded in a tamper-evident trail."],
                [Fingerprint, "Role-aware access", "Viewer, analyst, and admin permissions stay distinct."],
              ].map(([Icon, title, text]) => (
                <div key={title} className="trust-card bg-violet-400 p-6">
                  <Icon size={20} />
                  <h3 className="mt-8 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-black/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#0f0f15] px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">[ 05 / Questions ]</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">The important details, without the fine-print fog.</h2>
              <div className="mt-8 flex items-center gap-3 border border-white/10 bg-white/[0.025] p-4 text-xs text-white/45">
                <Lock size={17} className="text-violet-300" />
                <span>Designed for authorized environments and accountable actions.</span>
              </div>
            </div>
            <QuestionList />
          </div>
        </section>

        <section className="px-5 py-24 text-center sm:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">Ready when you are</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">Your network has a story. See it clearly.</h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/45">Sign in to review your environment, prioritize active incidents, and take the next safe action.</p>
            <Link to="/login" className="group mt-9 inline-flex items-center gap-3 bg-white px-7 py-3.5 text-sm font-semibold text-[#111118] transition hover:bg-violet-300">
              Open SentinelCore <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">Network detection &amp; incident response · Authorized environments only</p>
        </div>
      </footer>
    </div>
  );
}
