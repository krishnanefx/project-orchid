"use client";

import { Database, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { useApp } from "@/lib/app-context";
import { downloadCsv } from "@/lib/utils";
import { Metric, PageHeader, TimelineItem } from "@/components/ui/primitives";

export function AdminView() {
  const { setView, localSocieties, localEvents, localClaims, localForums, localResources } = useApp();

  const totalMembers = localSocieties.reduce((sum, s) => sum + s.members, 0);
  const activeSocieties = localSocieties.filter((s) => s.status === "active").length;
  const openClaims = localClaims.filter((c) => c.status === "submitted" || c.status === "under_review").length;
  const totalRsvps = localEvents.reduce((sum, e) => sum + e.rsvps, 0);
  const totalCapacity = localEvents.reduce((sum, e) => sum + e.capacity, 0);
  const rsvpRate = totalCapacity > 0 ? Math.round((totalRsvps / totalCapacity) * 100) : 0;

  const now = new Date().toISOString();
  const upcomingEvents = localEvents
    .filter((e) => e.startsAt > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const recentSocieties = [...localSocieties].reverse().slice(0, 2);

  function exportAdminReport() {
    downloadCsv("project-orchid-admin-report.csv", [
      ["Metric", "Value"],
      ["Total Members", String(totalMembers)],
      ["Active Societies", String(activeSocieties)],
      ["RSVP Rate", `${rsvpRate}%`],
      ["Open Claims", String(openClaims)],
      ["Total Events", String(localEvents.length)],
      ["Forum Boards", String(localForums.length)],
      ["Resources", String(localResources.length)],
    ]);
  }

  return (
    <main className="stitch-main">
      <PageHeader
        title="Admin Dashboard"
        copy="Operational metrics for UKSSC staff."
        action="Export Report"
        onAction={exportAdminReport}
      />
      <section className="metric-grid">
        <Metric label="Total Members" value={String(totalMembers)} width="78%" />
        <Metric label="Active Societies" value={String(activeSocieties)} width="64%" />
        <Metric label="RSVP Rate" value={totalCapacity > 0 ? `${rsvpRate}%` : "—"} width="61%" />
        <Metric label="Open Claims" value={String(openClaims)} width="42%" />
      </section>

      <section className="two-column">
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
        <article className="stitch-card">
          <h3>Platform Summary</h3>
          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            {[
              ["Societies", String(localSocieties.length)],
              ["Events", String(localEvents.length)],
              ["Forum Boards", String(localForums.length)],
              ["Resources", String(localResources.length)],
              ["Pending Claims", String(localClaims.filter(c => c.status === "submitted").length)],
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

      {/* Members card */}
      <button
        type="button"
        className="stitch-card"
        style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", marginTop: 4, width: "100%", border: "none", textAlign: "left" }}
        onClick={() => setView("admin-members")}
        aria-label="Manage members — view profiles, update roles and verify accounts"
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <UsersThree size={20} style={{ color: "var(--primary)" }} weight="fill" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--on-surface)", marginBottom: 2 }}>Members</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>View all registered members, update roles and verify accounts</div>
        </div>
        <span style={{ fontSize: 18, color: "var(--muted)" }} aria-hidden="true">›</span>
      </button>

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
