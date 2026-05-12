"use client";

import { CalendarBlank, ChatCircleText, CurrencyGbp, IdentificationCard, MapPin, MegaphoneSimple, QrCode, Storefront, UsersThree, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { universities } from "@/lib/data";
import { PageHeader, Thread } from "@/components/ui/primitives";
import { TicketModal } from "@/components/ui/ticket-modal";
import type { OrchidEvent } from "@/lib/types";

function formatEventDate(startsAt: string) {
  return new Date(startsAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function EventTypePill({ type }: { type: string }) {
  const labels: Record<string, string> = { ukssc: "UKSSC", society: "Society", cross_society: "Cross-Society" };
  return (
    <span className="pill green" style={{ fontSize: 11 }}>{labels[type] ?? type}</span>
  );
}

const CLAIM_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  submitted: { bg: "var(--primary-soft)", color: "var(--primary)" },
  under_review: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
  approved: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  rejected: { bg: "var(--danger-bg)", color: "var(--on-danger-soft)" },
  paid: { bg: "var(--surface-container)", color: "var(--muted)" },
};

const DISMISSED_KEY = "orchid-dismissed-announcements";

export function DashboardView() {
  const { rsvpdEventIds, setRsvpdEventIds, setLocalEvents, threads, announce, setView, currentUser, localEvents, localSocieties, localForums, localClaims, claimStatuses, viewSociety, localResources } = useApp();
  const firstName = currentUser.name.split(" ")[0];
  const [ticketEvent, setTicketEvent] = useState<OrchidEvent | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) setDismissedIds(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, []);

  function dismissAnnouncement(id: string) {
    const next = new Set(dismissedIds).add(id);
    setDismissedIds(next);
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
  }

  const latestAnnouncement = localResources
    .filter((r) => r.category === "announcement" && !dismissedIds.has(r.id))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0] ?? null;

  const now = new Date().toISOString();
  const upcomingEvents = localEvents
    .filter((e) => e.startsAt > now && e.status !== "closed")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const featuredEvent = upcomingEvents[0] ?? null;
  const nextEvents = upcomingEvents.slice(1, 4);

  const mySociety = localSocieties.find((s) => s.id === currentUser.societyId) ?? null;
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

  return (
    <main className="stitch-main">
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        copy="Here's what's happening in your UKSSC network."
        action="New Post"
        onAction={() => setView("forums")}
      />
      {/* Latest UKSSC announcement */}
      {latestAnnouncement && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 14,
          padding: "14px 18px", borderRadius: 12, marginBottom: 16,
          background: "var(--primary-soft)",
          border: "1px solid oklch(from var(--primary) l c h / 0.2)",
        }}>
          <MegaphoneSimple size={18} weight="fill" style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--primary)", marginBottom: 3 }}>
              UKSSC Announcement
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", lineHeight: 1.4 }}>
              {latestAnnouncement.title}
            </div>
            {latestAnnouncement.body && (
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.5 }}>
                {latestAnnouncement.body.slice(0, 140)}{latestAnnouncement.body.length > 140 ? "…" : ""}
              </p>
            )}
            <button
              type="button"
              onClick={() => setView("resources")}
              style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Read more in Resources →
            </button>
          </div>
          <button
            type="button"
            onClick={() => dismissAnnouncement(latestAnnouncement.id)}
            aria-label="Dismiss announcement"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2, borderRadius: 4, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Profile completion nudge */}
      {currentUser.societyId && (!currentUser.course || !currentUser.year) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 20px",
          borderRadius: 12,
          background: "var(--warning-bg)",
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
          <IdentificationCard size={22} style={{ color: "var(--warning-text)", flexShrink: 0 }} weight="fill" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#78350f", margin: "0 0 2px" }}>
              Complete your profile
            </p>
            <p style={{ fontSize: 13, color: "var(--warning-text)", margin: 0 }}>
              Add your course and year of study so event organisers can prepare for you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView("settings")}
            style={{
              flexShrink: 0, fontSize: 13, fontWeight: 700,
              padding: "8px 16px", borderRadius: 8,
              border: "1.5px solid #b45309",
              background: "rgba(255,255,255,0.6)", color: "var(--warning-text)",
              cursor: "pointer",
            }}
          >
            Update Profile
          </button>
        </div>
      )}

      {/* Onboarding nudge for new users */}
      {!currentUser.societyId && localSocieties.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 20px",
          borderRadius: 12,
          background: "var(--primary-soft)",
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
          <UsersThree size={22} style={{ color: "var(--primary)", flexShrink: 0 }} weight="fill" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--on-surface)", margin: "0 0 2px" }}>
              Find your society
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
              Join your university's Singaporean society to unlock reimbursements, events and the members board.
            </p>
          </div>
          <button
            type="button"
            className="stitch-primary"
            onClick={() => setView("societies")}
            style={{ flexShrink: 0 }}
          >
            Browse Societies
          </button>
        </div>
      )}

      <section className="bento-grid">

        {/* Featured Event */}
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
                <button
                  className={rsvpdEventIds.includes(featuredEvent.id) ? "stitch-secondary" : "stitch-primary"}
                  onClick={() => {
                    const alreadyRsvpd = rsvpdEventIds.includes(featuredEvent.id);
                    const nextRsvps = Math.max(0, featuredEvent.rsvps + (alreadyRsvpd ? -1 : 1));
                    const nextStatus = !alreadyRsvpd && nextRsvps >= featuredEvent.capacity ? "waitlist" as const : featuredEvent.status;
                    setRsvpdEventIds(alreadyRsvpd ? rsvpdEventIds.filter((id) => id !== featuredEvent.id) : [...rsvpdEventIds, featuredEvent.id]);
                    setLocalEvents(localEvents.map((e) => e.id === featuredEvent.id ? { ...e, rsvps: nextRsvps, status: nextStatus } : e));
                    announce(alreadyRsvpd ? `RSVP cancelled for ${featuredEvent.title}.` : nextStatus === "waitlist" ? `Added to waitlist — event is now full.` : "RSVP confirmed. Your QR check-in will appear before the event.");
                  }}
                  type="button"
                >
                  {rsvpdEventIds.includes(featuredEvent.id) ? "RSVP'd ✓" : "RSVP Now"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, paddingTop: 12 }}>
              <p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>No upcoming events yet.</p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>UKSSC staff will publish events here — check back soon.</p>
            </div>
          )}
        </article>

        {/* Society Card */}
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
              Find and join your university's Singaporean society from the directory.
            </p>
          )}
        </article>

        {/* Next upcoming event — or placeholder */}
        {nextEvents[0] ? (
          <article className="stitch-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="pill" style={{ fontSize: 11 }}>{nextEvents[0].type.replace("_", " ")}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{formatEventDate(nextEvents[0].startsAt)}</span>
            </div>
            <h3 style={{ fontSize: 16, margin: 0, lineHeight: 1.3 }}>{nextEvents[0].title}</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>{nextEvents[0].location}</p>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {nextEvents[0].rsvps}/{nextEvents[0].capacity} RSVPs
            </div>
            <button
              className="stitch-secondary-muted"
              style={{ marginTop: "auto", alignSelf: "flex-start" }}
              type="button"
              onClick={() => setView("events")}
            >
              View details →
            </button>
          </article>
        ) : (
          <article className="stitch-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 8 }}>
            <CalendarBlank size={28} style={{ color: "var(--primary)", opacity: 0.5 }} />
            <h3 style={{ fontSize: 15, margin: 0, color: "var(--muted)" }}>More events coming soon</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Check the Events tab for the latest.</p>
          </article>
        )}

        {/* Community Boards */}
        <article className="stitch-card bento-wide">
          <div className="section-row">
            <h3><ChatCircleText size={20} weight="fill" /> Community Boards</h3>
            <button type="button" onClick={() => setView("forums")}>View All</button>
          </div>
          {forumItems.length > 0 ? (
            forumItems.slice(0, 3).map((item) => (
              <Thread key={item.id} title={item.title} count={item.count} meta={item.meta} />
            ))
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>
              No forum boards yet. UKSSC staff can create boards from Admin → Manage Data.
            </p>
          )}
        </article>

        {/* My RSVPs */}
        {(() => {
          const myRsvps = localEvents
            .filter((e) => rsvpdEventIds.includes(e.id))
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
          if (myRsvps.length === 0) return null;
          return (
            <article className="stitch-card bento-wide">
              <h3>My RSVPs</h3>
              {myRsvps.map((event) => (
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
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => setTicketEvent(event)}
                      title="View entry ticket"
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 700, padding: "4px 10px",
                        border: "1.5px solid var(--primary)",
                        borderRadius: 6, background: "var(--primary-soft)",
                        color: "var(--primary)", cursor: "pointer",
                      }}
                    >
                      <QrCode size={12} weight="fill" /> Ticket
                    </button>
                    <button
                      type="button"
                      className="stitch-secondary"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => {
                        setRsvpdEventIds(rsvpdEventIds.filter((id) => id !== event.id));
                        setLocalEvents(localEvents.map((e) => e.id === event.id ? { ...e, rsvps: Math.max(0, e.rsvps - 1) } : e));
                        announce(`RSVP cancelled for ${event.title}.`);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </article>
          );
        })()}

        {/* Upcoming list */}
        {nextEvents.length > 0 && (
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

        {/* My Claims */}
        {(() => {
          const myClaims = localClaims
            .filter((c) => c.claimant === currentUser.name)
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
            .slice(0, 5);
          if (myClaims.length === 0) return null;
          return (
            <article className="stitch-card bento-wide">
              <div className="section-row">
                <h3><CurrencyGbp size={18} weight="fill" style={{ display: "inline", verticalAlign: "middle" }} /> My Claims</h3>
                <button type="button" className="text-action" onClick={() => setView("claims")}>View All</button>
              </div>
              {myClaims.map((claim) => {
                const status = claimStatuses[claim.id] ?? claim.status;
                const colors = CLAIM_STATUS_COLORS[status] ?? CLAIM_STATUS_COLORS.submitted;
                return (
                  <div key={claim.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.25))" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{claim.purpose}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{claim.submittedAt}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)", flexShrink: 0 }}>£{claim.amount.toFixed(2)}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: colors.bg, color: colors.color, flexShrink: 0 }}>
                      {status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </article>
          );
        })()}

      </section>

      {ticketEvent && (
        <TicketModal
          event={ticketEvent}
          userId={currentUser.id ?? ""}
          onClose={() => setTicketEvent(null)}
        />
      )}
    </main>
  );
}
