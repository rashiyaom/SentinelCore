import { CircleHelp, Shield, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import clsx from "clsx";

import { useAuth } from "../auth/AuthContext";
import { useDemo } from "../demo/DemoContext";
import { NAV_GROUPS } from "./navigation";

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        clsx(
          "group flex items-center gap-3 rounded-sm px-2.5 py-2.5 text-sm transition-colors",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-violet-400/10 text-violet-200 ring-1 ring-inset ring-violet-400/15"
            : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
        )
      }
    >
      <Icon size={17} className="shrink-0" strokeWidth={1.8} aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { hasRole } = useAuth();
  const { openTour } = useDemo();

  // Items the role cannot reach are removed entirely, not disabled — a
  // disabled control still advertises that the capability exists.
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || hasRole(item.roles)),
  })).filter((group) => group.items.length > 0);

  const content = (
    <>
      <div
        className={clsx(
          "flex h-topbar items-center gap-2.5 border-b border-white/10 px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center border border-violet-400/35 bg-violet-500/10 text-violet-300">
          <Shield size={16} aria-hidden="true" />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-white">Sentinel<span className="text-violet-400">Core</span></span>
            <span className="block font-mono text-[8px] uppercase tracking-[0.14em] text-slate-600">Security console</span>
          </span>
        )}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 md:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {groups.map((group, gi) => (
          <div key={group.label ?? `group-${gi}`}>
            {group.label && !collapsed && (
              <p className="px-2.5 pb-2 font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-slate-600">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onCloseMobile}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <button type="button" onClick={openTour} className="m-3 border border-white/10 bg-white/[0.025] p-3 text-left transition hover:border-violet-400/25 hover:bg-violet-400/[0.05]">
          <div className="flex items-start gap-2.5">
            <CircleHelp size={15} className="mt-0.5 shrink-0 text-violet-300" />
            <div>
              <p className="text-xs font-medium text-slate-300">New to SentinelCore?</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-600">Open the project guide and learn the complete investigation workflow.</p>
            </div>
          </div>
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Off-canvas drawer below md */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-white/10 bg-[#0d0d13]",
          "transition-transform duration-200 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:w-sidebar-collapsed" : "md:w-sidebar",
        )}
      >
        {content}
      </aside>
    </>
  );
}
