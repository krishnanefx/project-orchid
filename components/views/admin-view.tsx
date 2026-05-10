"use client";

import { Database, ShieldCheck } from "@phosphor-icons/react";
import { useApp } from "@/lib/app-context";
import { downloadCsv } from "@/lib/utils";
import { Metric, PageHeader, TimelineItem } from "@/components/ui/primitives";

export function AdminView() {
  const { setView, localSocieties } = useApp();
  const totalMembers = localSocieties.reduce((sum, s) => sum + s.members, 0);

  function exportAdminReport() {
    downloadCsv("project-orchid-admin-report.csv", [
      ["Metric", "Value"],
      ["Total Members", String(totalMembers)],
      ["Active Societies", "32"],
      ["RSVP Conversion Rate", "61%"],
      ["Open Claims", "14"]
    ]);
  }

  return (
    <main className="stitch-main">
      <PageHeader title="Admin Dashboard" copy="Operational metrics for UKSSC staff, with society-scoped data boundaries ready for rollout." action="Export Report" onAction={exportAdminReport} />
      <section className="metric-grid">
        <Metric label="Total Members" value={String(totalMembers)} width="78%" />
        <Metric label="Active Societies" value="32" width="64%" />
        <Metric label="RSVP Conv. Rate" value="61%" width="61%" />
        <Metric label="Open Claims" value="14" width="42%" />
      </section>
      <section className="two-column">
        <article className="stitch-card chart-card">
          <h3>Membership Growth</h3>
          <div className="fake-chart"><span /><span /><span /><span /><span /></div>
        </article>
        <article className="stitch-card">
          <h3>Activity Feed</h3>
          <TimelineItem tone="green" text="UCL Singapore Society created Annual Freshers Dinner" time="8 minutes ago" />
          <TimelineItem tone="purple" text="Warwick Singsoc crossed 250 verified members" time="1 hour ago" />
          <TimelineItem tone="muted" text="Finance marked one reimbursement paid" time="Today" />
        </article>
      </section>

      {/* Manage Data card */}
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
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Add and update societies, events, resources, and forum boards</div>
        </div>
        <span style={{ fontSize: 18, color: "var(--muted)" }} aria-hidden="true">›</span>
      </button>

      {/* Access Control card */}
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
