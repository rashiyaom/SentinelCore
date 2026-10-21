import { ChevronDown, GraduationCap, LogOut, PlayCircle, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import Badge from "../components/Badge";
import { useDemo } from "../demo/DemoContext";

const ROLE_TONE = {
  admin: "danger",
  analyst: "accent",
  viewer: "neutral",
};

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { openTour } = useDemo();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    // `replace` so the back button cannot return to an authenticated view.
    navigate("/login", { replace: true });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-sm border border-transparent px-2 py-1.5 text-sm text-slate-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
      >
        <UserRound size={16} aria-hidden="true" />
        <span className="hidden max-w-[10rem] truncate sm:inline">{user.username}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-sm border border-white/10 bg-[#17171f] shadow-2xl shadow-black/40 animate-fade-in"
        >
          <div className="border-b border-white/10 px-4 py-3.5">
            <p className="truncate text-sm font-medium text-slate-100">
              {user.full_name || user.username}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge tone={ROLE_TONE[user.role] ?? "neutral"}>{user.role}</Badge>
              {user.email && (
                <span className="truncate text-xs text-slate-500">{user.email}</span>
              )}
            </div>
          </div>

          <div className="border-b border-white/10 py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); openTour(); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              <GraduationCap size={15} aria-hidden="true" />
              Open project guide
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); navigate("/demo"); }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              <PlayCircle size={15} aria-hidden="true" />
              Run guided demo
            </button>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <LogOut size={15} aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
