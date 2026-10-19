import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  FileSearch,
  Fingerprint,
  Menu,
  Network,
  Pause,
  Play,
  Radar,
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
                <article key={title} className="group min-h-[310px] border-b border-r border-white/10 bg-white/[0.015] p-7 transition hover:bg-violet-400 hover:text-[#111118] sm:p-9">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-white/30 group-hover:text-black/45">// {index}</span>
                    <Icon size={24} strokeWidth={1.5} className="text-violet-300 group-hover:text-[#111118]" />
                  </div>
                  <h3 className="mt-24 text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/45 group-hover:text-black/65">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="landing-dots border-b border-white/10 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">[ 02 / Workflow ]</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">A calm path through a live incident.</h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/45">The interface keeps context attached to the work, so each handoff is clear and every response is accountable.</p>
            </div>
            <div className="border-t border-white/15">
              {steps.map(([title, text], index) => (
                <div key={title} className="group grid gap-4 border-b border-white/15 py-8 sm:grid-cols-[4rem_9rem_1fr] sm:items-start">
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
                <div key={title} className="bg-violet-400 p-6">
                  <Icon size={20} />
                  <h3 className="mt-8 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-black/60">{text}</p>
                </div>
              ))}
            </div>
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
