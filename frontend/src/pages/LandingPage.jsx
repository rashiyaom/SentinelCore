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
    accent: "#5eead4",
    soft: "rgba(94, 234, 212, .14)",
    title: "Discover what belongs",
    text: "Scan an authorized network, identify hosts and services, and keep a living asset record instead of a forgotten spreadsheet.",
    detail: "Assets · Ports · Scan history",
    metric: "24",
    metricLabel: "devices mapped",
  },
  {
    icon: ScanSearch,
    number: "02",
    label: "Detection",
    accent: "#60a5fa",
    soft: "rgba(96, 165, 250, .14)",
    title: "Turn packets into signal",
    text: "Suricata rules inspect traffic while sensor health, throughput, and rule sources stay visible from one workspace.",
    detail: "Sensor · Rules · EVE events",
    metric: "Live",
    metricLabel: "packet inspection",
  },
  {
    icon: Database,
    number: "03",
    label: "Evidence",
    accent: "#c084fc",
    soft: "rgba(192, 132, 252, .14)",
    title: "Search without losing context",
    text: "Filter events by time, severity, protocol, signature, or address and return to useful investigations with saved searches.",
    detail: "Facets · Keyset search · Saved views",
    metric: "<80ms",
    metricLabel: "event lookup",
  },
  {
    icon: GitBranch,
    number: "04",
    label: "Correlation",
    accent: "#f472b6",
    soft: "rgba(244, 114, 182, .14)",
    title: "Connect the quiet clues",
    text: "Rules group threshold, sequence, rare, and beacon-like behavior into candidates that explain why they were created.",
    detail: "Rules · Candidates · Run history",
    metric: "4→1",
    metricLabel: "signals connected",
  },
  {
    icon: FileSearch,
    number: "05",
    label: "Investigation",
    accent: "#fb923c",
    soft: "rgba(251, 146, 60, .14)",
    title: "Work the incident, not the noise",
    text: "Promote candidates, attach evidence, assign ownership, record decisions, and keep every state change in the timeline.",
    detail: "Triage · Evidence · History",
    metric: "01",
    metricLabel: "shared timeline",
  },
  {
    icon: ShieldCheck,
    number: "06",
    label: "Response",
    accent: "#a3e635",
    soft: "rgba(163, 230, 53, .14)",
    title: "Contain with a way back",
    text: "Apply time-limited blocks with protected-address checks, then export the evidence as a report for review.",
    detail: "TTL blocks · Audit · Reports",
    metric: "30m",
    metricLabel: "automatic rollback",
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

const advantages = [
  {
    icon: "camera",
    number: "01",
    label: "Visibility",
    title: "See every device",
    text: "A living map of hosts, services, and exposed ports across the network you protect.",
    theme: "dark",
  },
  {
    icon: "eye",
    number: "02",
    label: "Evidence",
    title: "Understand every alert",
    text: "The reason, source, timestamp, and related evidence stay connected from signal to decision.",
    theme: "light",
  },
  {
    icon: "signal",
    number: "03",
    label: "Correlation",
    title: "Cut through the noise",
    text: "Related clues become one clear incident, so your team investigates context instead of alert volume.",
    theme: "dark",
  },
  {
    icon: "shield",
    number: "04",
    label: "Response",
    title: "Act with guardrails",
    text: "Time-limited containment and protected-address checks make every response safer and reversible.",
    theme: "light",
  },
  {
    icon: "lock",
    number: "05",
    label: "Privacy",
    title: "Keep control of your data",
    text: "Self-hosted deployment keeps sensitive network evidence inside the environment you operate.",
    theme: "dark",
  },
  {
    icon: "audit",
    number: "06",
    label: "Accountability",
    title: "Trace every decision",
    text: "Role-aware access and an immutable audit history make sensitive actions clear and accountable.",
    theme: "light",
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

function PixelWordmark({ visible }) {
  return (
    <div className={`video-wordmark ${visible ? "is-visible" : ""}`} aria-label="SecureHome">
      <span aria-hidden="true" className="video-wordmark-inner">
        {WORDMARK_LETTERS.map((letter, index) => (
          <span key={`${letter}-${index}`} className="video-wordmark-letter" style={{ "--letter-delay": `${index * 55}ms` }}>{letter}</span>
        ))}
        <span className="soft-o" style={{ "--letter-delay": "385ms" }}>
          <span className="soft-o-ring" />
          <span className="soft-o-glint" />
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
    <div className="console-preview relative mx-auto w-full max-w-[610px] lg:ml-auto">
      <div className="console-halo absolute -inset-8 blur-3xl" aria-hidden="true" />
      <div className="console-frame relative overflow-hidden border border-white/15 bg-[#111118] shadow-2xl shadow-black/50">
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
  const [active, setActive] = useState(0);
  const slide = operationSlides[active];
  const SlideIcon = slide.icon;

  const goTo = (index) => setActive((index + operationSlides.length) % operationSlides.length);

  return (
    <div className="operations-showcase" style={{ "--module-accent": slide.accent, "--module-soft": slide.soft }}>
      <div className="operations-rail" role="tablist" aria-label="Platform modules">
        {operationSlides.map(({ icon: Icon, number, label, accent }, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => setActive(index)}
            style={{ "--item-accent": accent }}
          >
            <span className="operations-rail-number">{number}</span>
            <span className="operations-rail-icon"><Icon size={17} strokeWidth={1.6} /></span>
            <strong>{label}</strong>
            <ChevronRight size={15} className="operations-rail-arrow" />
          </button>
        ))}
      </div>

      <article className="operation-focus" role="tabpanel" key={slide.number}>
        <div className="operation-focus-glow" aria-hidden="true" />
        <div className="operation-focus-grid" aria-hidden="true" />
        <div className="operation-focus-top">
          <span>{slide.number} / {String(operationSlides.length).padStart(2, "0")}</span>
          <span className="operation-focus-live"><i /> Context preserved</span>
        </div>

        <div className="operation-focus-body">
          <div className="operation-focus-copy">
            <span className="operation-focus-icon"><SlideIcon size={30} strokeWidth={1.35} /></span>
            <p className="operation-focus-label">{slide.label}</p>
            <h3>{slide.title}</h3>
            <p className="operation-focus-text">{slide.text}</p>
            <div className="operation-focus-tags">
              {slide.detail.split(" · ").map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="operation-visual" aria-hidden="true">
            <div className="operation-radar">
              <span className="operation-radar-sweep" />
              <i /><i /><i /><i />
              <div><SlideIcon size={25} strokeWidth={1.35} /></div>
            </div>
            <div className="operation-metric">
              <strong>{slide.metric}</strong>
              <span>{slide.metricLabel}</span>
            </div>
          </div>
        </div>

        <div className="operation-focus-footer">
          <div className="operation-step-line" aria-hidden="true">
            {operationSlides.map((item, index) => <i key={item.number} className={index <= active ? "is-reached" : ""} />)}
          </div>
          <div className="operation-focus-controls">
            <span>No autoplay · choose your path</span>
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous module"><ArrowLeft size={17} /></button>
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Next module"><ArrowRight size={17} /></button>
          </div>
        </div>
      </article>
    </div>
  );
}

function PixelAdvantageIcon({ type }) {
  const paths = {
    camera: <path fillRule="evenodd" d="M0 1H6V5H0ZM2 2H4V4H2ZM6 2H8V4H6Z" />,
    eye: <path fillRule="evenodd" d="M2 0H6V1H7V2H8V3H7V4H6V5H2V4H1V3H0V2H1V1H2ZM3 2H5V4H3Z" />,
    signal: <path d="M0 3H1V5H0ZM2 1H3V7H2ZM4 3H5V5H4ZM6 0H7V8H6Z" />,
    shield: <path fillRule="evenodd" d="M0 0H7V4H6V6H5V7H4V8H3V7H2V6H1V4H0ZM3 2H4V5H3Z" />,
    lock: <><path d="M2 0H5V1H2ZM5 1H6V3H5ZM1 1H2V3H1Z" /><path fillRule="evenodd" d="M0 3H7V8H0ZM3 5H4V7H3Z" /></>,
    audit: <path fillRule="evenodd" d="M0 0H5V1H6V8H0ZM4 1H5V2H4ZM1 3H5V4H1ZM1 5H5V6H1Z" />,
  };
  return <svg className="coverflow-pixel-icon" viewBox={type === "camera" || type === "eye" ? "0 0 8 6" : "0 0 7 8"} aria-hidden="true">{paths[type]}</svg>;
}

function AdvantagesCoverflow() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame;
    const updateActive = () => {
      const section = sectionRef.current;
      if (!section) return;
      const scrollDistance = section.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) return;
      const passed = Math.min(Math.max(-section.getBoundingClientRect().top, 0), scrollDistance);
      setActive(Math.min(advantages.length - 1, Math.round((passed / scrollDistance) * (advantages.length - 1))));
    };
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActive);
    };
    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const selectCard = (index) => {
    const section = sectionRef.current;
    if (!section) return;
    const scrollDistance = section.offsetHeight - window.innerHeight;
    const target = window.scrollY + section.getBoundingClientRect().top + (scrollDistance * index) / (advantages.length - 1);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const positionClass = (distance) => {
    if (distance <= -3) return "is-far-left";
    if (distance === -2) return "is-left-two";
    if (distance === -1) return "is-left-one";
    if (distance === 0) return "is-active";
    if (distance === 1) return "is-right-one";
    if (distance === 2) return "is-right-two";
    return "is-far-right";
  };

  return (
    <section ref={sectionRef} id="advantages" className="advantages-scroll" style={{ "--advantage-count": advantages.length, height: `${advantages.length * 100}svh` }}>
      <div className="advantages-sticky">
        <div className="advantages-header">
          <div>
            <p className="advantages-kicker">[ 03 / Advantages of our website ]</p>
            <h2>Built to make security feel clear.</h2>
          </div>
          <p>Scroll through six practical advantages. This section releases when you reach the final card.</p>
        </div>

        <div className="coverflow-frame">
          <div className="coverflow-stage" role="tablist" aria-label="SentinelCore advantages">
          {advantages.map(({ icon, number, label, title, text, theme }, index) => {
            const distance = index - active;
            return (
              <button
                key={number}
                type="button"
                role="tab"
                aria-selected={active === index}
                className={`coverflow-card ${theme === "light" ? "coverflow-card--light" : "coverflow-card--dark"} ${positionClass(distance)}`}
                onClick={() => selectCard(index)}
              >
                <span className="coverflow-card-top">// {number} · {label}</span>
                <PixelAdvantageIcon type={icon} />
                <span className="coverflow-card-copy">
                  <strong>{title}</strong>
                  <span className="coverflow-card-text">{text}</span>
                </span>
              </button>
            );
          })}
          </div>
        </div>

        <div className="advantages-footer">
          <div className="advantages-progress" aria-label={`Advantage ${active + 1} of ${advantages.length}`}>
            <span>{advantages[active].number} / {String(advantages.length).padStart(2, "0")}</span>
            <div>{advantages.map((item, index) => <i key={item.number} className={index <= active ? "is-active" : ""} />)}</div>
          </div>
          <p><span>Scroll</span> to move through the cards</p>
          <div className="advantages-controls">
            <button type="button" onClick={() => selectCard(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous advantage"><ArrowLeft size={17} /></button>
            <button type="button" onClick={() => selectCard(Math.min(advantages.length - 1, active + 1))} disabled={active === advantages.length - 1} aria-label="Next advantage"><ArrowRight size={17} /></button>
          </div>
        </div>
      </div>
    </section>
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
    <div className="landing-shell min-h-screen overflow-x-clip bg-[#0b0b10] text-white">
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
        <section className="landing-hero relative border-b border-white/10">
          <div className="hero-aurora" aria-hidden="true"><i /><i /><i /></div>
          <div className="mx-auto grid min-h-[780px] max-w-[1320px] items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-28">
            <div className="hero-copy relative z-10">
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-mark"><ShieldCheck size={13} /></span>
                <span>Clarity for every signal</span>
                <i />
                <span className="text-emerald-200/80">System online</span>
              </div>
              <h1 className="hero-title">
                See your network
                <span>with quiet confidence.</span>
              </h1>
              <p className="hero-lede">
                Discover every device, understand what changed, and move from evidence to a safe response—without fighting the interface.
              </p>
              <div className="hero-actions">
                <Link to="/login" className="hero-primary group">
                  Enter secure console <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#platform" className="hero-secondary">
                  Explore the platform <ChevronRight size={16} />
                </a>
              </div>
              <div className="hero-proof">
                <span><Check size={13} /> Self-hosted</span>
                <span><Check size={13} /> Explainable</span>
                <span><Check size={13} /> Reversible actions</span>
              </div>
            </div>
            <div className="hero-console-wrap">
              <span className="hero-float hero-float-top"><i /> 24 devices known</span>
              <ConsolePreview />
              <span className="hero-float hero-float-bottom"><ShieldCheck size={14} /> Protected by design</span>
            </div>
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
              <p className="max-w-xl text-sm leading-6 text-white/45 lg:ml-auto">Choose a module to explore the operational path. Nothing moves without you; every stage passes its context forward instead of restarting the investigation.</p>
            </div>
            <OperationsCarousel />
          </div>
        </section>

        <AdvantagesCoverflow />

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
