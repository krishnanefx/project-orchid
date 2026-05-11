"use client";

import { Database, ShieldCheck, ClipboardText, Warning, CheckCircle, ArrowClockwise } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { downloadCsv } from "@/lib/utils";
import { getAuditLogsAction } from "@/lib/actions";
import { Metric, PageHeader, TimelineItem } from "@/components/ui/primitives";
import type { AuditLog } from "@/lib/types";

const ACTION_LABELS: Record<string, string> = {
  check_in:            "Checked in attendee",
  claim_approved:      "Claim approved",
  claim_rejected:      "Claim rejected",
  claim_paid:          "Claim marked paid",
  claim_under_review:  "Claim under review",
  membership_updated:  "Membership updated",
  role_changed:        "Role changed",
};

function formatLogTime(ts: string) {
  return new Date(ts).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function AuditLogSection() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogsAction(30).then((data) => { setLogs(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading audit log…</p>;
  if (logs.length === 0) return <p style={{ fontSize: 13, color: "var(--muted)" }}>No audit events yet.</p>;

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {logs.map((log) => (
        <div key={log.id} style={{ display: "flex", gap: 12, fontSize: 13, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.2))" }}>
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", marginTop: 3 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, color: "var(--on-surface)" }}>
              {ACTION_LABELS[log.action] ?? log.action.replace(/_/g, " ")}
            </span>
            {" "}
            <span style={{ color: "var(--muted)" }}>
              by {log.actorName ?? "System"}
              {log.entityType && ` on ${log.entityType.replace(/_/g, " ")}`}
            </span>
          </div>
          <time style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>{formatLogTime(log.createdAt)}</time>
        </div>
      ))}
    </div>
  );
}

function DataQualitySection() {
  const { localSocieties, localEvents, localClaims } = useApp();

  const flags: { label: string; count: number; severity: "warn" | "ok" }[] = [
    {
      label: "Societies missing description",
      count: localSocieties.filter((s) => !s.description || s.description.length < 10).length,
      severity: "warn",
    },
    {
      label: "Events with no RSVPs",
      count: localEvents.filter((e) => e.rsvps === 0 && new Date(e.startsAt) > new Date()).length,
      severity: "warn",
    },
    {
      label: "Claims pending review",
      count: localClaims.filter((c) => c.status === "submitted" || c.status === "under_review").length,
      severity: localClaims.filter((c) => c.status === "submitted").length > 5 ? "warn" : "ok",
    },
    {
      label: "Claims without receipt",
      count: localClaims.filter((c) => !c.receiptPath && !c.receiptName).length,
      severity: "warn",
    },
  ];

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {flags.map((f) => (
        <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: f.count > 0 && f.severity === "warn" ? "#fffbeb" : "var(--surface-container, #f8f4fa)" }}>
          {f.count > 0 && f.severity === "warn"
            ? <Warning size={15} weight="fill" style={{ color: "#d97706", flexShrink: 0 }} />
            : <CheckCircle size={15} weight="fill" style={{ color: "#16a34a", flexShrink: 0 }} />}
          <span style={{ flex: 1, fontSize: 13, color: "var(--on-surface)" }}>{f.label}</span>
          <strong style={{ fontSize: 13, color: f.count > 0 && f.severity === "warn" ? "#d97706" : "var(--muted)" }}>
            {f.count === 0 ? "None" : f.count}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function AdminView() {
  const { setView, localSocieties, localEvents, localClaims, localForums, localResources } = useApp();
  const [auditOpen, setAuditOpen] = useState(false);

  const totalMembers   = localSocieties.reduce((sum, s) => sum + s.members, 0);
  const activeSocieties = localSocieties.filter((s) => s.status === "active").length;
  const openClaims     = localClaims.filter((c) => c.status === "submitted" || c.status === "under_review").length;
  const totalRsvps     = localEvents.reduce((sum, e) => sum + e.rsvps, 0);
  const totalCapacity  = localEvents.reduce((sum, e) => sum + e.capacity, 0);
  const rsvpRate       = totalCapacity > 0 ? Math.round((totalRsvps / totalCapacity) * 100) : 0;

  const now = new Date().toISOString();
  const upcomingEvents  = localEvents.filter((e) => e.startsAt > now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const recentSocieties = [...localSocieties].reverse().slice(0, 2);

  function exportAdminReport() {
    downloadCsv("project-orchid-admin-report.csv", [
      ["Metric", "Value"],
      ["Total Members",    String(totalMembers)],
      ["Active Societies", String(activeSocieties)],
      ["RSVP Rate",        `${rsvpRate}%`],
      ["Open Claims",      String(openClaims)],
      ["Total Events",     String(localEvents.length)],
      ["Forum Boards",     String(localForums.length)],
      ["Resources",        String(localResources.length)],
    ]);
  }

  return (
    <main className="stitch-main">
      <PageHeader
        title="Admin Dashboard"
        copy="Operational metrics and governance tools for UKSSC staff."
        action="Export Report"
        onAction={exportAdminReport}
      />

      {/* Metric row */}
      <section className="metric-grid">
        <Metric label="Total Members"    value={String(totalMembers)}   width="78%" />
        <Metric label="Active Societies" value={String(activeSocieties)} width="64%" />
        <Metric label="RSVP Rate"        value={totalCapacity > 0 ? `${rsvpRate}%` : "—"} width="61%" />
        <Metric label="Open Claims"      value={String(openClaims)}     width="42%" />
      </section>

      <section className="two-column">
        {/* Upcoming events */}
        <article className="stitch-card">
          <h3>Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0" }}>No events scheduled yet.</p>
          ) : (
            upcomingEvents.slice(0, 4).map((event) => {
              const d = new Date(event.startsAt);
              const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
              return (
                <TimelineItem
                  key={event.id}
                  tone="green"
                  text={`${event.title} — ${event.location}`}
                  time={`${dateStr} · ${event.rsvps}/${event.capacity} RSVPs`}
                />
              );
            })
          )}
        </article>

        {/* Platform summary */}
        <article className="stitch-card">
          <h3>Platform Summary</h3>
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {[
              ["Societies",       String(localSocieties.length)],
              ["Events",          String(localEvents.length)],
              ["Forum Boards",    String(localForums.length)],
              ["Resources",       String(localResources.length)],
              ["Pending Claims",  String(localClaims.filter((c) => c.status === "submitted").length)],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.3))" }}>
                <span style={{ color: "var(--muted)" }}>{label}</span>
                <strong style={{ color: "var(--on-surface)" }}>{value}</strong>
              </div>
            ))}
          </div>
          {recentSocieties.length > 0 && (
            <>
              <h3 style={{ marginTop: 20, marginBottom: 10 }}>Recent Societies</h3>
              {recentSocieties.map((s) => (
                <TimelineItem key={s.id} tone="purple" text={s.name} time={`${s.members} members · ${s.status}`} />
              ))}
            </>
          )}
        </article>
      </section>

      {/* Data quality */}
      <article className="stitch-card" style={{ marginTop: 4 }}>
        <h3 style={{ marginBottom: 12 }}>Data Quality</h3>
        <DataQualitySection />
      </article>

      {/* Audit log (expandable) */}
      <article className="stitch-card" style={{ marginTop: 4 }}>
        <button
          type="button"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", padding: 0 }}
          onClick={() => setAuditOpen((v) => !v)}
        >
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <ClipboardText size={17} weight="fill" style={{ color: "var(--primary)" }} />
            Audit Log
          </h3>
          <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>{auditOpen ? "Hide" : "Show"}</span>
        </button>
        {auditOpen && (
          <div style={{ marginTop: 16 }}>
            <AuditLogSection />
          </div>
        )}
      </article>

      {/* Tool cards */}
      <button
        type="button"
        className="stitch-card"
        style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", marginTop: 4, width: "100%", border: "none", textAlign: "left" }}
        onClick={() => setView("admin-data")}
        aria-label="Manage data — add societies, events, resources and forum boards"
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Database size={20} style={{ color: "var(--primary)" }} weight="fill" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--on-surface)", marginBottom: 2 }}>Manage Data</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Add and update societies, events, resources, forum boards, and members</div>
        </div>
        <span style={{ fontSize: 18, color: "var(--muted)" }} aria-hidden="true">›</span>
      </button>

      <button
        type="button"
        className="stitch-card"
        style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", marginTop: 4, width: "100%", border: "none", textAlign: "left" }}
        onClick={() => setView("access-control")}
        aria-label="Configure access control — manage role permissions"
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ShieldCheck size={20} style={{ color: "var(--primary)" }} weight="fill" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--on-surface)", marginBottom: 2 }}>Access Control</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Configure which roles can see and do what across the platform</div>
        </div>
        <span style={{ fontSize: 18, color: "var(--muted)" }} aria-hidden="true">›</span>
      </button>
    </main>
  );
}
