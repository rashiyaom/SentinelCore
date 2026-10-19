import { Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import clsx from "clsx";

import HealthDot from "./HealthDot";
import PipelineIndicator from "./PipelineIndicator";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";
import { titleForPath } from "./navigation";

export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = titleForPath(location.pathname);

  useEffect(() => {
    document.title = `${title} · SentinelCore`;
  }, [title]);

  // Auto-collapse to icons-only between md and lg, expand again above lg.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const apply = (e) => setCollapsed(e.matches);
    apply(query);
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  // Close the mobile drawer on navigation so it never covers the new page.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-surface min-h-screen text-slate-100">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={clsx(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "md:pl-sidebar-collapsed" : "md:pl-sidebar",
        )}
      >
        <header className="sticky top-0 z-30 flex h-topbar items-center gap-3 border-b border-white/10 bg-[#0b0b10]/90 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 md:hidden"
          >
            <Menu size={18} />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 md:inline-flex"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-200">{title}</p>
            <p className="hidden font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600 sm:block">Protected workspace</p>
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <Link to="/events" className="hidden h-8 items-center gap-2 border border-white/10 bg-white/[0.025] px-3 text-xs text-slate-500 transition hover:border-white/20 hover:text-slate-300 lg:flex" aria-label="Search events">
              <Search size={13} /> <span>Search</span><kbd className="ml-4 font-mono text-[9px] text-slate-600">/</kbd>
            </Link>
            <PipelineIndicator />
            <HealthDot />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
