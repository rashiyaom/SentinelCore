import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { ApiError, api } from "../api/client";
import Button from "../components/Button";

const MIN_PASSWORD_LENGTH = 12; // mirrors backend `_MIN_PASSWORD_LENGTH`

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = "Reset password · SentinelCore";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      await api.post("/auth/password-reset/confirm", { token, new_password: newPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message || "Invalid or expired token" : "Could not reach the server");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="landing-grid flex min-h-screen items-center justify-center bg-[#0b0b10] px-5">
      <div className="w-full max-w-md border border-white/10 bg-[#111118] p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="grid h-11 w-11 place-items-center border border-violet-400/30 bg-violet-400/10 text-violet-300"><KeyRound size={19} /></span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Choose a new password</h1>
          <p className="text-xs leading-5 text-slate-500">Use at least {MIN_PASSWORD_LENGTH} characters for a strong account password.</p>
        </div>

        <div className="space-y-5">
          {!token ? (
            <p className="text-sm text-rose-300">This link is missing its token. Request a new one.</p>
          ) : done ? (
            <p className="text-sm text-emerald-300">Password set. Redirecting you to sign in…</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="new_password" className="block text-xs font-medium text-slate-300">
                  New password
                </label>
                <input
                  id="new_password"
                  type="password"
                  autoComplete="new-password"
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 h-12 w-full border border-white/15 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-xs font-medium text-slate-300">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-2 h-12 w-full border border-white/15 bg-white/[0.035] px-4 text-sm text-white outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  {error}
                </p>
              )}

              <Button type="submit" loading={pending} className="w-full" size="md">
                Set new password
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
