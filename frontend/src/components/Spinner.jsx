import clsx from "clsx";

export default function Spinner({ size = 16, className }) {
  return (
    <svg
      className={clsx("animate-spin", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function FullPageSpinner({ label = "Loading SentinelCore" }) {
  return (
    <div className="landing-grid flex min-h-screen items-center justify-center bg-[#0b0b10] text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={28} className="text-violet-400" />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]">{label}</p>
      </div>
    </div>
  );
}
