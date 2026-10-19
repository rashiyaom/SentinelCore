import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  Radar,
  RefreshCw,
  ServerCog,
  ShieldAlert,
  ShieldBan,
  Sparkles,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { duration, relativeTime } from "../../lib/format";
import TopTalkersCard from "./TopTalkersCard";

const REFRESH_MS = 15_000;
const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];
const SEVERITY_BAR = {
  critical: "bg-rose-400",
  high: "bg-orange-400",
  medium: "bg-amber-300",
  low: "bg-sky-400",
  info: "bg-slate-500",
};

function Stat({ label, value, sub, tone, to, icon: Icon, loading }) {
  const content = (
    <div className="group h-full border border-white/10 bg-[#111118] p-5 transition hover:border-white/20 hover:bg-[#15151d]">
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">{label}</span>
        <Icon size={17} strokeWidth={1.7} className={tone === "danger" ? "text-rose-400" : "text-violet-300"} />
      </div>
      {loading ? (
        <div className="mt-5 h-8 w-20 animate-pulse bg-white/[0.06]" />
      ) : (
        <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{value}</p>
      )}
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="truncate text-xs text-slate-600">{sub}</p>
        {to && <ArrowRight size={13} className="shrink-0 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-violet-300" />}
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function NextAction({ icon: Icon, label, title, text, to, tone = "violet" }) {
  const colors = tone === "rose"
    ? "border-rose-400/25 bg-rose-400/[0.06] text-rose-300"
    : "border-violet-400/20 bg-violet-400/[0.05] text-violet-300";
  return (
    <Link to={to} className="group flex items-start gap-4 border-b border-white/[0.07] px-5 py-4 transition last:border-b-0 hover:bg-white/[0.025]">
      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center border ${colors}`}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-600">{label}</span>
        <span className="mt-1 block text-sm font-medium text-slate-200">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600">{text}</span>
      </span>
      <ArrowRight size={14} className="mt-3 shrink-0 text-slate-700 transition group-hover:translate-x-1 group-hover:text-violet-300" />
    </Link>
  );
}

export default function OverviewPage() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      const get = (path) => api.get(path).catch(() => null);
      const [facets, incidents, pipeline, sensor, intel, recent, firewall] = await Promise.all([
        get("/events/facets"),
        get("/incidents/stats/summary"),
        get("/pipeline/status"),
        get("/sensor/status"),
        get("/intel/stats"),
        get("/events?severity=critical&severity=high&limit=8"),
        isAdmin ? get("/firewall/status") : Promise.resolve(null),
      ]);
      setData({ facets, incidents, pipeline, sensor, intel, recent, firewall });
      setLoadedAt(new Date());
      if (!silent) setLoading(false);
    },
    [isAdmin],
  );

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const timer = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const { facets, incidents, pipeline, sensor, intel, recent, firewall } = data;
  const openIncidents = incidents
    ? Object.values(incidents.open_by_severity || {}).reduce((total, count) => total + count, 0)
    : null;
  const sevBuckets = facets?.severity || [];
  const maxSev = Math.max(1, ...sevBuckets.map((bucket) => bucket.count));
  const sensorDown = Boolean(sensor && !sensor.running);
  const sensorStale = Boolean(sensor?.eve_log_stale);
  const feedsFailing = (intel?.source_health || []).filter((source) => source.last_status === "error");
  const hasAttention = sensorDown || sensorStale || feedsFailing.length > 0 || firewall?.drift_count > 0;
  const firstName = (user?.full_name || user?.username || "there").split(" ")[0];

  return (
    <>
      <section className="mb-6 overflow-hidden border border-white/10 bg-[#111118]">
        <div className="grid lg:grid-cols-[1fr_auto]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-violet-300">
              <Sparkles size={12} /> Security overview
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {loading
                ? "Checking your sensors, incident queue, and detection pipeline…"
                : hasAttention
                  ? "A few items need your attention. Start with the guided actions below."
                  : openIncidents > 0
                    ? `Your platform is healthy. ${openIncidents} open incident${openIncidents === 1 ? "" : "s"} remain to review.`
                    : "Your platform is healthy and there are no open incidents waiting for review."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/incidents" className="inline-flex items-center gap-2 bg-violet-400 px-4 py-2.5 text-xs font-semibold text-[#111118] transition hover:bg-violet-300">
                Review incident queue <ArrowRight size={14} />
              </Link>
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => load()} disabled={loading}>
                Refresh status
              </Button>
              {loadedAt && <span className="font-mono text-[9px] uppercase tracking-wider text-slate-700">Updated {relativeTime(loadedAt.toISOString())}</span>}
            </div>
          </div>

          <div className="flex min-w-[230px] items-center border-t border-white/10 bg-white/[0.02] px-6 py-5 lg:border-l lg:border-t-0">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 ${hasAttention ? "bg-amber-300" : "bg-emerald-400"}`} />
                <p className={`text-sm font-medium ${hasAttention ? "text-amber-200" : "text-emerald-300"}`}>
                  {loading ? "Checking posture" : hasAttention ? "Attention recommended" : "Protection active"}
                </p>
              </div>
              <p className="mt-2 max-w-[190px] text-xs leading-5 text-slate-600">
                {hasAttention ? "Review the highlighted system checks before deeper analysis." : "Sensor and supporting services are reporting normally."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {hasAttention && (
        <div className="mb-6 grid gap-2">
          {sensorDown && (
            <Link to={isAdmin ? "/sensor" : "/events"} className="flex items-center gap-3 border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-xs text-rose-200 transition hover:bg-rose-400/[0.1]">
              <AlertTriangle size={15} /> <span className="flex-1"><strong>Sensor stopped.</strong> New network detections are not being produced.</span><ArrowRight size={14} />
            </Link>
          )}
          {!sensorDown && sensorStale && (
            <Link to="/events" className="flex items-center gap-3 border border-amber-300/20 bg-amber-300/[0.05] px-4 py-3 text-xs text-amber-100 transition hover:bg-amber-300/[0.09]">
              <AlertTriangle size={15} /> <span className="flex-1"><strong>Event stream is stale.</strong>{sensor?.eve_log_age_seconds != null ? ` The last update was ${duration(sensor.eve_log_age_seconds)} ago.` : " Check recent event flow."}</span><ArrowRight size={14} />
            </Link>
          )}
          {feedsFailing.length > 0 && (
            <Link to="/intel" className="flex items-center gap-3 border border-amber-300/20 bg-amber-300/[0.05] px-4 py-3 text-xs text-amber-100 transition hover:bg-amber-300/[0.09]">
              <AlertTriangle size={15} /> <span className="flex-1"><strong>Threat intel needs review.</strong> {feedsFailing.length} feed{feedsFailing.length === 1 ? " is" : "s are"} failing to refresh.</span><ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Open incidents" value={openIncidents ?? "—"} sub={incidents ? `${incidents.unassigned_count} unassigned` : "Data unavailable"} tone={openIncidents ? "danger" : undefined} to="/incidents" icon={ShieldAlert} loading={loading} />
        <Stat label="Events / second" value={pipeline ? Number(pipeline.events_per_second).toFixed(2) : "—"} sub={pipeline ? `${pipeline.events_last_minute} in the last minute` : "Pipeline unavailable"} to="/events" icon={Activity} loading={loading} />
        <Stat label="Sensor" value={sensor ? (sensor.running ? "Running" : "Stopped") : "—"} sub={sensor ? `${Number(sensor.rule_count || 0).toLocaleString()} rules loaded` : "Status unavailable"} tone={sensorDown ? "danger" : undefined} to={isAdmin ? "/sensor" : undefined} icon={ServerCog} loading={loading} />
        <Stat label="Active indicators" value={intel ? Object.values(intel.active_by_type || {}).reduce((a, b) => a + b, 0) : "—"} sub={intel ? `${intel.matches_last_24h} matches in 24 hours` : "Data unavailable"} to="/intel" icon={Target} loading={loading} />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card title="Start here" description="The clearest next steps for a healthy investigation workflow." bodyClassName="p-0">
          {openIncidents > 0 ? (
            <NextAction icon={ShieldAlert} label="Priority 01" title={`Triage ${openIncidents} open incident${openIncidents === 1 ? "" : "s"}`} text="Assign an owner, review the evidence, and set the investigation status." to="/incidents" tone="rose" />
          ) : (
            <NextAction icon={CheckCircle2} label="Priority 01" title="Incident queue is clear" text="No active incident needs triage. Review recent high-severity signals for context." to="/events?severity=critical&severity=high" />
          )}
          <NextAction icon={Radar} label="Inventory" title="Review known assets" text="Confirm new devices and exposed services belong on your protected network." to="/assets" />
          <NextAction icon={FileSearch} label="Investigate" title="Analyze a packet capture" text="Upload authorized traffic when you need protocol-level evidence." to="/pcap" />
        </Card>

        <Card
          title="Recent high-severity events"
          description="Critical and high detections, newest first. Select Events to investigate the full signal."
          actions={<Link to="/events?severity=critical&severity=high" className="flex items-center gap-1 text-xs text-violet-300 hover:text-violet-200">View events <ArrowRight size={13} /></Link>}
          bodyClassName="p-0"
        >
          <Table
            className="border-0"
            columns={[
              { key: "ts", header: "Detected", render: (event) => relativeTime(event.ts) },
              { key: "severity", header: "Severity", render: (event) => <Badge severity={event.severity} /> },
              { key: "signature", header: "Detection", render: (event) => <span className="block max-w-[22rem] truncate font-medium text-slate-200">{event.signature}</span> },
              { key: "flow", header: "Traffic", render: (event) => <span className="font-mono text-[10px] text-slate-500">{event.src_ip ?? "—"} <span className="text-slate-700">→</span> {event.dst_ip ?? "—"}</span> },
            ]}
            rows={recent?.items || []}
            loading={loading}
            rowKey={(event) => event.id}
            empty={<div className="px-5 py-12 text-center"><CheckCircle2 size={22} className="mx-auto text-emerald-400" /><p className="mt-3 text-sm font-medium text-slate-300">No high-severity events</p><p className="mt-1 text-xs text-slate-600">Nothing critical or high appeared in this window.</p></div>}
          />
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Card title="Detection mix" description="Event severity during the selected 24-hour window.">
          {sevBuckets.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-600">No events recorded in this window.</div>
          ) : (
            <div className="space-y-4">
              {SEVERITY_ORDER.filter((severity) => sevBuckets.some((bucket) => bucket.value === severity)).map((severity) => {
                const count = sevBuckets.find((bucket) => bucket.value === severity)?.count ?? 0;
                return (
                  <Link key={severity} to={`/events?severity=${severity}`} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-3 text-xs">
                    <Badge severity={severity} />
                    <div className="h-1.5 overflow-hidden bg-white/[0.06]"><div className={`h-full ${SEVERITY_BAR[severity]}`} style={{ width: `${Math.max((count / maxSev) * 100, 2)}%` }} /></div>
                    <span className="text-right font-mono text-[10px] text-slate-500">{count}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Response performance" description="How quickly the team is moving incidents forward.">
          <dl className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><dt className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} /> Time to acknowledge</dt><dd className="text-sm font-medium text-slate-200">{incidents?.mtta_seconds != null ? duration(incidents.mtta_seconds) : "—"}</dd></div>
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><dt className="flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 size={14} /> Time to resolve</dt><dd className="text-sm font-medium text-slate-200">{incidents?.mttr_seconds != null ? duration(incidents.mttr_seconds) : "—"}</dd></div>
            {isAdmin && <div className="flex items-center justify-between border-b border-white/[0.07] pb-4"><dt className="flex items-center gap-2 text-xs text-slate-500"><ShieldBan size={14} /> Active containment</dt><dd className="text-sm font-medium text-slate-200">{firewall ? `${firewall.db_active_count} block${firewall.db_active_count === 1 ? "" : "s"}` : "—"}</dd></div>}
            <div className="flex items-center justify-between"><dt className="flex items-center gap-2 text-xs text-slate-500"><Radar size={14} /> Ingest queue</dt><dd className="text-sm font-medium text-slate-200">{pipeline ? `${pipeline.stream_length} queued` : "—"}</dd></div>
          </dl>
        </Card>
      </div>

      <TopTalkersCard />
    </>
  );
}
