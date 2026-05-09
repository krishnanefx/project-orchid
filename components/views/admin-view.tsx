"use client";

import { societies } from "@/lib/data";
import { downloadCsv } from "@/lib/utils";
import { Metric, PageHeader, TimelineItem } from "@/components/ui/primitives";

export function AdminView() {
  const totalMembers = societies.reduce((sum, s) => sum + s.members, 0);

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
    </main>
  );
}
