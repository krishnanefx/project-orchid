"use client";

import { CalendarBlank, ChatCircleText, MapPin, Storefront, UsersThree } from "@phosphor-icons/react";
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
  return (
    <span className="pill green" style={{ fontSize: 11 }}>{labels[type] ?? type}</span>
  );
}

export function DashboardView() {
  const { rsvpdEventIds, setRsvpdEventIds, setLocalEvents, threads, announce, currentUser, localEvents, localSocieties, localForums, viewSociety } = useApp();
  const firstName = currentUser.name.split(" ")[0];

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
        onAction={() => announce("Open the Forums tab to publish a new verified community post.")}
      />
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
                    setRsvpdEventIds(alreadyRsvpd ? rsvpdEventIds.filter((id) => id !== featuredEvent.id) : [...rsvpdEventIds, featuredEvent.id]);
                    setLocalEvents(localEvents.map((e) => e.id === featuredEvent.id ? { ...e, rsvps: Math.max(0, e.rsvps + (alreadyRsvpd ? -1 : 1)) } : e));
                    announce(alreadyRsvpd ? `RSVP cancelled for ${featuredEvent.title}.` : "RSVP confirmed. Your QR check-in will appear before the event.");
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
              onClick={() => announce(`Check the Events tab for ${nextEvents[0].title}.`)}
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
            <button type="button" onClick={() => announce("Open the Forums tab to browse all boards.")}>View All</button>
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

      </section>
    </main>
  );
}
