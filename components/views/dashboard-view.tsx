"use client";

import { CalendarBlank, ChatCircleText, MapPin, Receipt, Storefront, UsersThree, Eye } from "@phosphor-icons/react";
import { useApp } from "@/lib/app-context";
import { universities } from "@/lib/data";
import { PageHeader, Thread } from "@/components/ui/primitives";

function formatEventDate(startsAt: string) {
  return new Date(startsAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function EventTypePill({ type }: { type: string }) {
  const labels: Record<string, string> = { ukssc: "UKSSC", society: "Society", cross_society: "Cross-Society" };
  return <span className="pill green" style={{ fontSize: 11 }}>{labels[type] ?? type}</span>;
}

// ── Role-specific panels ──────────────────────────────────────────────────────

function FinanceReviewerPanel() {
  const { localClaims, setView } = useApp();
  const pending = localClaims.filter((c) => c.status === "submitted" || c.status === "under_review");
  return (
    <article className="stitch-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <Receipt size={17} weight="fill" style={{ color: "var(--primary)" }} />
          Claims Queue
        </h3>
        <button type="button" className="stitch-secondary" style={{ fontSize: 12 }} onClick={() => setView("claims")}>
          Review all
        </button>
      </div>
      {pending.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>No claims awaiting review.</p>
      ) : (
        pending.slice(0, 4).map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.2))" }}>
            <div>
              <span style={{ fontWeight: 600 }}>{c.claimant}</span>
              <span style={{ color: "var(--muted)", marginLeft: 8 }}>{c.purpose.slice(0, 30)}{c.purpose.length > 30 ? "…" : ""}</span>
            </div>
            <span style={{ fontWeight: 700, color: "var(--primary)" }}>GBP {c.amount.toFixed(2)}</span>
          </div>
        ))
      )}
      {pending.length > 4 && (
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{pending.length - 4} more pending…</p>
      )}
    </article>
  );
}

function AlumniWelcomePanel() {
  const { currentUser } = useApp();
  return (
    <article className="stitch-card bento-wide" style={{ background: "var(--primary-soft)" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--on-surface)" }}>Welcome back, {currentUser.name.split(" ")[0]}!</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            As an alumni you can browse the community, read resources, and stay connected.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: "var(--primary)", color: "#fff" }}>Alumni</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,0.07)", color: "var(--muted)" }}>
            <Eye size={10} style={{ display: "inline", verticalAlign: "middle" }} /> Read-only
          </span>
        </div>
      </div>
    </article>
  );
}

function SponsorWelcomePanel() {
  const { currentUser } = useApp();
  return (
    <article className="stitch-card bento-wide" style={{ background: "var(--primary-soft)" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--on-surface)" }}>Hello, {currentUser.name.split(" ")[0]}!</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            Thank you for supporting UKSSC. Browse our society directory and upcoming events below.
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: "var(--primary)", color: "#fff", flexShrink: 0 }}>
          Sponsor
        </span>
      </div>
    </article>
  );
}

function SocietyAdminPanel() {
  const { localSocieties, currentUser, setView } = useApp();
  const mySociety = localSocieties.find((s) => s.id === currentUser.societyId);
  if (!mySociety) return null;
  return (
    <article className="stitch-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Society Quick Actions</h3>
        <button type="button" className="stitch-secondary" style={{ fontSize: 12 }} onClick={() => setView("society-admin")}>
          Manage
        </button>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { label: "Total members", value: String(mySociety.members) },
          { label: "Status",        value: mySociety.status },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.2))" }}>
            <span style={{ color: "var(--muted)" }}>{label}</span>
            <strong style={{ textTransform: "capitalize" }}>{value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function StaffSummaryPanel() {
  const { localClaims, localEvents, localSocieties, setView } = useApp();
  const pendingClaims = localClaims.filter((c) => c.status === "submitted").length;
  const upcomingCount = localEvents.filter((e) => e.startsAt > new Date().toISOString()).length;
  const onboardingCount = localSocieties.filter((s) => s.status === "onboarding").length;

  return (
    <article className="stitch-card" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h3 style={{ margin: 0 }}>Staff Quick View</h3>
        <button type="button" className="stitch-secondary" style={{ fontSize: 12 }} onClick={() => setView("admin")}>
          Full admin
        </button>
      </div>
      {[
        { label: "Claims needing review", value: pendingClaims, urgent: pendingClaims > 0 },
        { label: "Upcoming events",       value: upcomingCount,   urgent: false },
        { label: "Societies onboarding",  value: onboardingCount, urgent: onboardingCount > 0 },
      ].map(({ label, value, urgent }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.2))" }}>
          <span style={{ color: "var(--muted)" }}>{label}</span>
          <strong style={{ color: urgent ? "#d97706" : "var(--on-surface)" }}>{value}</strong>
        </div>
      ))}
    </article>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function DashboardView() {
  const {
    rsvpdEventIds, setRsvpdEventIds, setLocalEvents,
    threads, announce, currentUser, localEvents,
    localSocieties, localForums, viewSociety, can,
  } = useApp();

  const firstName = currentUser.name.split(" ")[0];
  const role = currentUser.role;

  const now = new Date().toISOString();
  const upcomingEvents = localEvents
    .filter((e) => e.startsAt > now && e.status !== "closed")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const featuredEvent = upcomingEvents[0] ?? null;
  const nextEvents    = upcomingEvents.slice(1, 4);

  const mySociety    = localSocieties.find((s) => s.id === currentUser.societyId) ?? null;
  const myUniversity = universities.find((u) => u.id === mySociety?.universityId);

  const forumItems = [
    ...threads,
    ...localForums.map((f) => ({
      id: f.id,
      title: f.name,
      count: String(f.replies),
      meta: `${f.replies} replies · ${f.visibility === "membership_restricted" ? "Society board" : "Open board"}`,
    })),
  ];

  const isAlumni  = role === "alumni";
  const isSponsor = role === "sponsor";
  const isFinance = role === "finance_reviewer";
  const isStaff   = role === "ukssc_staff" || role === "super_admin";
  const isSocAdmin = role === "society_admin";

  return (
    <main className="stitch-main">
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        copy="Here's what's happening in your UKSSC network."
        action={!isAlumni && !isSponsor ? "New Post" : undefined}
        onAction={() => announce("Open the Forums tab to publish a new verified community post.")}
      />

      <section className="bento-grid">

        {/* Role-specific top panel */}
        {isAlumni  && <AlumniWelcomePanel />}
        {isSponsor && <SponsorWelcomePanel />}
        {isFinance && <FinanceReviewerPanel />}
        {isStaff   && <StaffSummaryPanel />}
        {isSocAdmin && <SocietyAdminPanel />}

        {/* Featured Event */}
        {!isSponsor && (
          <article className="stitch-card bento-wide feature-card" style={{ minHeight: 220 }}>
            <div className="card-heading">
              <span className="pill green">Featured Event</span>
              {featuredEvent && <EventTypePill type={featuredEvent.type} />}
            </div>
            {featuredEvent ? (
              <>
                <h3 style={{ fontSize: 22, marginTop: 8 }}>{featuredEvent.title}</h3>
                <div className="meta-row" style={{ marginTop: 10 }}>
                  <span><CalendarBlank size={15} /> {formatEventDate(featuredEvent.startsAt)}</span>
                  <span><MapPin size={15} /> {featuredEvent.location}</span>
                  <span><UsersThree size={15} /> {featuredEvent.rsvps}/{featuredEvent.capacity} RSVPs</span>
                </div>
                <div className="card-footer" style={{ marginTop: "auto" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    {featuredEvent.capacity - featuredEvent.rsvps} spots remaining
                  </span>
                  {can("rsvp_events") && (
                    <button
                      className={rsvpdEventIds.includes(featuredEvent.id) ? "stitch-secondary" : "stitch-primary"}
                      onClick={() => {
                        const alreadyRsvpd = rsvpdEventIds.includes(featuredEvent.id);
                        setRsvpdEventIds(alreadyRsvpd ? rsvpdEventIds.filter((id) => id !== featuredEvent.id) : [...rsvpdEventIds, featuredEvent.id]);
                        setLocalEvents(localEvents.map((e) => e.id === featuredEvent.id ? { ...e, rsvps: Math.max(0, e.rsvps + (alreadyRsvpd ? -1 : 1)) } : e));
                        announce(alreadyRsvpd ? `RSVP cancelled for ${featuredEvent.title}.` : "RSVP confirmed. Your QR check-in pass will appear in the Events tab.");
                      }}
                      type="button"
                    >
                      {rsvpdEventIds.includes(featuredEvent.id) ? "RSVP'd ✓" : "RSVP Now"}
                    </button>
                  )}
                  {isAlumni && (
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>Alumni cannot RSVP to current events.</span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, paddingTop: 12 }}>
                <p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>No upcoming events yet.</p>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>UKSSC staff will publish events here — check back soon.</p>
              </div>
            )}
          </article>
        )}

        {/* Society Card — not for alumni/sponsor if not joined */}
        {!isSponsor && (
          <article className="stitch-card society-quick">
            <div className="soft-blob" />
            <div className="society-head">
              <div className="society-icon"><Storefront size={28} weight="fill" /></div>
              <div>
                <h3>{mySociety ? mySociety.name : "No Society Linked"}</h3>
                <span>{mySociety ? (myUniversity?.name ?? "Your Society") : "Browse the directory"}</span>
              </div>
            </div>
            {mySociety ? (
              <>
                <div className="notice-card">
                  <strong>{mySociety.members} members</strong>
                  {mySociety.bio && (
                    <p style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {mySociety.bio}
                    </p>
                  )}
                </div>
                <button className="stitch-secondary-muted full" type="button" onClick={() => viewSociety(mySociety.id)}>
                  View Society Page
                </button>
              </>
            ) : (
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
                {isAlumni ? "Your alumni record is linked to your former society." : "Find and join your university's Singaporean society from the directory."}
              </p>
            )}
          </article>
        )}

        {/* Next upcoming event */}
        {nextEvents[0] && !isSponsor && (
          <article className="stitch-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="pill" style={{ fontSize: 11 }}>{nextEvents[0].type.replace("_", " ")}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{formatEventDate(nextEvents[0].startsAt)}</span>
            </div>
            <h3 style={{ fontSize: 16, margin: 0, lineHeight: 1.3 }}>{nextEvents[0].title}</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{nextEvents[0].location}</p>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{nextEvents[0].rsvps}/{nextEvents[0].capacity} RSVPs</div>
            <button className="stitch-secondary-muted" style={{ marginTop: "auto", alignSelf: "flex-start" }} type="button"
              onClick={() => announce(`Check the Events tab for ${nextEvents[0].title}.`)}>
              View details →
            </button>
          </article>
        )}

        {/* Community Boards */}
        <article className="stitch-card bento-wide">
          <div className="section-row">
            <h3><ChatCircleText size={20} weight="fill" /> Community Boards</h3>
            <button type="button" onClick={() => announce("Open the Forums tab to browse all boards.")}>View All</button>
          </div>
          {forumItems.length > 0 ? (
            forumItems.slice(0, 3).map((item) => (
              <Thread key={item.id} title={item.title} count={item.count} meta={item.meta} />
            ))
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>
              No forum boards yet.{isStaff ? " Create boards from Admin → Manage Data." : ""}
            </p>
          )}
        </article>

        {/* More upcoming */}
        {nextEvents.length > 0 && !isSponsor && (
          <article className="stitch-card bento-wide">
            <h3>More Upcoming</h3>
            {nextEvents.map((event) => (
              <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.25))" }}>
                <div style={{ textAlign: "center", minWidth: 36, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)" }}>
                    {new Date(event.startsAt).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--on-surface)", lineHeight: 1 }}>
                    {new Date(event.startsAt).toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" })}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{event.location}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>
                  {event.rsvps}/{event.capacity}
                </span>
              </div>
            ))}
          </article>
        )}

      </section>
    </main>
  );
}
