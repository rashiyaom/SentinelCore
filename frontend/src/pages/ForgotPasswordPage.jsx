import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client";
import Button from "../components/Button";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [pending, setPending] = useState(false);
  // The response is identical whether or not the account exists — shown
  // unconditionally once a request is submitted, never branched on by this
  // page, which is the whole point of the backend's generic reply.
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Forgot password · SentinelCore";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    try {
      await api.post("/auth/password-reset/request", { username });
    } catch {
      // Intentionally ignored — the UI shows the same confirmation either way.
    } finally {
      setPending(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="landing-grid flex min-h-screen items-center justify-center bg-[#0b0b10] px-5">
      <div className="w-full max-w-md border border-white/10 bg-[#111118] p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 place-items-center border border-violet-400/30 bg-violet-400/10 text-violet-300"><KeyRound size={19} /></span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Reset your password</h1>
          <p className="text-xs leading-5 text-slate-500">We’ll send reset instructions if the account exists.</p>
        </div>

        <div className="space-y-5">
          {submitted ? (
            <p className="text-sm text-slate-300">
              If that account exists, a password reset email has been sent. Check your inbox.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-slate-300">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-2 h-12 w-full border border-white/15 bg-white/[0.035] px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                />
              </div>
              <Button type="submit" loading={pending} className="w-full" size="md">
                Send reset link
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500">
            <Link to="/login" className="text-violet-300 hover:text-violet-200">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
