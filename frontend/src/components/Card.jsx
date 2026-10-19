import clsx from "clsx";

export default function Card({ title, description, actions, className, bodyClassName, children }) {
  const hasHeader = title || description || actions;

  return (
    <section
      className={clsx(
        "rounded-sm border border-white/10 bg-[#111118] shadow-[0_18px_50px_rgba(0,0,0,0.16)]",
        className,
      )}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold tracking-[-0.015em] text-slate-100">{title}</h3>}
            {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={clsx("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
