import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Button from "../components/Button";
import { FullPageSpinner } from "../components/Spinner";

function messageForError(err) {
  if (!(err instanceof ApiError)) {
    return "Could not reach the server. Check your connection and try again.";
  }
  if (err.status === 401) return "Invalid credentials";
  if (err.status === 429) return "Too many attempts, try again shortly";
  if (err.status >= 500) return "The server is unavailable right now. Try again shortly.";
  return err.message || "Sign in failed";
}

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname ?? "/dashboard";

  useEffect(() => {
    document.title = "Sign in · SentinelCore";
  }, []);

  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(messageForError(err));
      setPassword("");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#0b0b10] text-slate-100 lg:grid-cols-[1.04fr_.96fr]">
      <section className="landing-grid relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col xl:p-16">
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center border border-violet-400/40 bg-violet-500/15 text-violet-300">
            <Shield size={19} aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight text-white">Sentinel<span className="text-violet-400">Core</span></span>
        </Link>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">Secure operations workspace</p>
          <h1 className="mt-6 text-5xl font-semibold leading-[0.96] tracking-[-0.05em] xl:text-6xl">
            Return to a network you can understand.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/50">
            Review what needs attention, investigate the evidence, and respond with clear guardrails.
          </p>

          <div className="mt-12 grid max-w-lg grid-cols-2 gap-px border border-white/10 bg-white/10">
            {[
              "Role-based access",
              "Short-lived sessions",
              "Audited actions",
              "Explainable alerts",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-[#101016] px-4 py-4 text-xs text-white/60">
                <Check size={13} className="shrink-0 text-emerald-300" /> {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
          Authorized access only · Activity may be audited
        </p>
      </section>

      <main className="flex min-h-screen min-w-0 items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
        <div className="min-w-0 w-[calc(100vw-2.5rem)] max-w-[430px] lg:w-full">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck size={20} className="text-violet-400" /> SentinelCore
            </Link>
            <Link to="/" className="text-xs text-white/45 hover:text-white"><ArrowLeft size={15} /></Link>
          </div>

          <div className="mb-8">
            <div className="mb-5 grid h-11 w-11 place-items-center border border-violet-400/30 bg-violet-400/10 text-violet-300">
              <LockKeyhole size={20} />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white">Sign in to your console</h2>
            <p className="mt-2 text-sm leading-6 text-white/40">Use the account provided by your SentinelCore administrator.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-medium text-white/70">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                autoFocus
                value={username}
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 w-full border border-white/15 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400 focus:bg-violet-400/[0.04] focus:ring-1 focus:ring-violet-400"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-white/70">Password</label>
                <Link to="/forgot-password" className="shrink-0 text-xs text-violet-300 transition hover:text-violet-200">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full border border-white/15 bg-white/[0.035] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400 focus:bg-violet-400/[0.04] focus:ring-1 focus:ring-violet-400"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-white/35 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="border-l-2 border-rose-400 bg-rose-400/10 px-4 py-3 text-xs text-rose-200">
                {error}
              </p>
            )}

            <Button type="submit" loading={pending} className="h-12 w-full" size="md">
              {pending ? "Signing in…" : "Sign in securely"}
            </Button>
          </form>

          <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-6">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-300" />
            <p className="text-xs leading-5 text-white/35">Your password is sent over the secure connection and is never stored in this browser.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
