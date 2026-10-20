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

const footerTypePhrases = ["map your network", "explain alerts", "respond safely"];

function FooterTypewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [characters, setCharacters] = useState(footerTypePhrases[0].length);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCharacters(footerTypePhrases[0].length);
      return undefined;
    }

    const phrase = footerTypePhrases[phraseIndex];
    const atEnd = characters === phrase.length;
    const atStart = characters === 0;
    const delay = atEnd && !deleting ? 1650 : atStart && deleting ? 320 : deleting ? 34 : 62;
    const timer = window.setTimeout(() => {
      if (atEnd && !deleting) {
        setDeleting(true);
      } else if (atStart && deleting) {
        setDeleting(false);
        setPhraseIndex((current) => (current + 1) % footerTypePhrases.length);
      } else {
        setCharacters((current) => current + (deleting ? -1 : 1));
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [characters, deleting, phraseIndex]);

  return (
    <span className="footer-typewriter" aria-hidden="true">
      <span>[</span>
      <span className="footer-typewriter-copy">{footerTypePhrases[phraseIndex].slice(0, characters)}</span>
      <i className="footer-typewriter-caret" />
      <span>]</span>
    </span>
  );
}

function PixelHeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let cell = 24;
    let frame = 0;
    let running = !reducedMotion;
    let scrollProgress = 0;
    const pointer = { x: -1000, y: -1000, active: false };

    const noise = (x, y) => {
      const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#101116";
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(255,255,255,.055)";
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x <= columns; x += 1) {
        context.moveTo(x * cell + 0.5, 0);
        context.lineTo(x * cell + 0.5, height);
      }
      for (let y = 0; y <= rows; y += 1) {
        context.moveTo(0, y * cell + 0.5);
        context.lineTo(width, y * cell + 0.5);
      }
      context.stroke();

      const phase = scrollProgress * 5.2;
      for (let x = 0; x < columns; x += 1) {
        const normalized = x / Math.max(columns - 1, 1);
        const ridge =
          rows * 0.17 +
          Math.max(0, Math.sin(normalized * Math.PI * 3.2 - 1.1 + phase * 0.18)) * rows * 0.2 +
          Math.max(0, Math.sin(normalized * Math.PI * 7.4 + 1.7 - phase * 0.12)) * rows * 0.105 +
          Math.max(0, Math.sin(normalized * Math.PI * 13.5 - 2.6)) * rows * 0.045;

        for (let y = 0; y < rows; y += 1) {
          const distanceFromFloor = rows - y;
          const scatter = noise(x, y);
          const inTerrain = distanceFromFloor < ridge && scatter > 0.17 + (distanceFromFloor / Math.max(ridge, 1)) * 0.2;
          const pulseBand = Math.abs(distanceFromFloor - ridge * 0.72) < 1 && scatter > 0.42;
          const dx = x * cell + cell / 2 - pointer.x;
          const dy = y * cell + cell / 2 - pointer.y;
          const hoverDistance = Math.hypot(dx, dy);
          const hover = pointer.active ? Math.max(0, 1 - hoverDistance / (cell * 4.5)) : 0;
          if (!inTerrain && !pulseBand && hover < 0.08) continue;

          const base = 0.42 + scatter * 0.48;
          const pulse = reducedMotion ? 0 : (Math.sin(time * 0.0015 + x * 0.5 + y * 0.27) + 1) * 0.055;
          const alpha = Math.min(1, base + hover * 0.7 + pulse);
          const red = Math.round(39 + hover * 115);
          const green = Math.round(82 + hover * 145);
          const blue = Math.round(220 + hover * 35);
          context.fillStyle = `rgba(${red},${green},${blue},${alpha})`;
          context.fillRect(x * cell + 1.5, y * cell + 1.5, cell - 3, cell - 3);

          if (hover > 0.72) {
            context.strokeStyle = `rgba(255,255,255,${hover * 0.7})`;
            context.strokeRect(x * cell + 3.5, y * cell + 3.5, cell - 7, cell - 7);
          }
        }
      }
      if (running) frame = window.requestAnimationFrame(draw);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      cell = bounds.width < 640 ? 16 : bounds.width < 1024 ? 20 : 24;
      width = bounds.width;
      height = bounds.height;
      columns = Math.ceil(width / cell);
      rows = Math.ceil(height / cell);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (reducedMotion) draw();
    };
    const updateScroll = () => {
      const bounds = canvas.getBoundingClientRect();
      scrollProgress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
      if (reducedMotion) draw();
    };
    const updatePointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
      if (reducedMotion) draw();
    };
    const clearPointer = () => {
      pointer.active = false;
      if (reducedMotion) draw();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", updatePointer);
    canvas.addEventListener("pointerleave", clearPointer);
    window.addEventListener("scroll", updateScroll, { passive: true });
    resize();
    updateScroll();
    draw();

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerleave", clearPointer);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="pixel-hero-canvas" aria-label="Interactive pixel visualization of live network signals" />;
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    document.title = "SentinelCore · Understand and protect your network";
  }, []);

  useEffect(() => {
    const updateNavigation = () => setNavScrolled(window.scrollY > window.innerHeight + 12);
    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    return () => window.removeEventListener("scroll", updateNavigation);
  }, []);

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-shell min-h-screen overflow-x-clip bg-[#0b0b10] text-white">
      <VideoIntro />

      <header id="home" className={`landing-nav sticky top-0 z-50 ${navScrolled ? "is-scrolled" : ""}`}>
        <div className="landing-nav-shell">
          <Link to="/" aria-label="SentinelCore home"><Brand /></Link>
          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#platform" className="transition-colors hover:text-white">Platform</a>
            <a href="#modules" className="transition-colors hover:text-white">Modules</a>
            <a href="#workflow" className="transition-colors hover:text-white">How it works</a>
            <a href="#trust" className="transition-colors hover:text-white">Security model</a>
          </nav>
          <div className="landing-nav-actions">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300 lg:inline">● System ready</span>
            <Link to="/login" className="border border-white/15 px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5 hover:text-white">
              Sign in
            </Link>
            <Link to="/login" className="group inline-flex items-center gap-2 bg-violet-400 px-4 py-2 text-xs font-semibold text-[#101016] transition hover:bg-violet-300">
              Open console <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <button className="landing-nav-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="landing-mobile-menu">
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
        <section className="pixel-hero">
          <div className="pixel-hero-inner">
            <div className="pixel-hero-topline"><span>[ 01 / Interactive signal field ]</span><i /><span>Move · hover · scroll</span></div>
            <div className="pixel-hero-heading">
              <h1>Make the invisible<br /><span>impossible to miss.</span></h1>
              <div>
                <p>SentinelCore turns network activity into a legible field—so every device, alert, and safe response has a place you can understand.</p>
                <div className="hero-actions">
                  <Link to="/login" className="hero-primary group">Enter secure console <ArrowRight size={16} /></Link>
                  <a href="#platform" className="hero-secondary">Explore the system <ChevronRight size={16} /></a>
                </div>
              </div>
            </div>
            <div className="pixel-hero-frame">
              <PixelHeroCanvas />
              <div className="pixel-hero-frame-top"><span><i /> Live network terrain</span><b>Illustrative signal field</b></div>
              <div className="pixel-hero-frame-bottom"><span>Pointer reveals local activity</span><span>Scroll reshapes the field ↘</span></div>
            </div>
            <div className="pixel-hero-proof">
              <span><Check size={13} /> Self-hosted</span>
              <span><Check size={13} /> Explainable detections</span>
              <span><Check size={13} /> Reversible response</span>
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

        <section className="footer-statement">
          <div className="footer-statement-inner">
            <div className="footer-statement-topline">
              <span>[ 06 / A clearer way forward ]</span>
              <i />
              <Link to="/login">Open console <ArrowRight size={15} /></Link>
            </div>

            <h2 className="footer-display">
              <span>A smarter way to</span>
              <FooterTypewriter />
              <span>around the clock.</span>
              <span className="sr-only">A smarter way to map your network, explain alerts, and respond safely around the clock.</span>
            </h2>

            <div className="footer-proof-row">
              <span className="footer-proof-tiles" aria-hidden="true"><i>01</i><i>03</i><i>06</i></span>
              <span>Six connected security modules</span>
              <b><ShieldCheck size={14} /> Evidence-first</b>
              <em>/ Self-hosted</em>
            </div>

            <div className="footer-closing-row">
              <h3><span>/</span> Less noise.<br />More confidence. <span>/</span></h3>
              <div>
                <p>See what changed, understand why it matters, and take the next safe action without losing context.</p>
                <Link to="/login" className="footer-cta">Enter SentinelCore <ArrowRight size={17} /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <Brand />
          <p>Network detection &amp; incident response · Authorized environments only</p>
        </div>
      </footer>
    </div>
  );
}
