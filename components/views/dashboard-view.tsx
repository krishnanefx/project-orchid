"use client";

import { CalendarBlank, ChatCircleText, MapPin, Storefront } from "@phosphor-icons/react";
import Image from "next/image";
import { useApp } from "@/lib/app-context";
import { universities } from "@/lib/data";
import { imageUrls, PageHeader, Thread } from "@/components/ui/primitives";

function formatEventDate(startsAt: string) {
  const d = new Date(startsAt);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function DashboardView() {
  const { rsvp, setRsvp, threads, announce, currentUser, localEvents, localSocieties, localForums, viewSociety } = useApp();
  const firstName = currentUser.name.split(" ")[0];

  const now = new Date().toISOString();
  const upcomingEvents = localEvents
    .filter((e) => e.startsAt > now && e.status !== "closed")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const featuredEvent = upcomingEvents[0] ?? null;
  const secondEvent = upcomingEvents[1] ?? null;

  const mySociety = localSocieties.find((s) => s.id === currentUser.societyId) ?? null;
  const myUniversity = universities.find((u) => u.id === mySociety?.universityId);

  const forumThreads = [...threads, ...localForums.map((f) => ({
    id: f.id,
    title: f.name,
    count: String(f.replies),
    meta: `${f.replies} replies · ${f.visibility === "membership_restricted" ? "Society board" : "Open board"}`,
  }))];

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
        <article className="stitch-card bento-wide feature-card">
          <div className="card-heading">
            <span className="pill green">Featured Event</span>
          </div>
          {featuredEvent ? (
            <>
              <h3>{featuredEvent.title}</h3>
              <p>Join UKSSC members for this upcoming event across the network.</p>
              <div className="meta-row">
                <span><CalendarBlank size={16} /> {formatEventDate(featuredEvent.startsAt)}</span>
                <span><MapPin size={16} /> {featuredEvent.location}</span>
              </div>
              <div className="card-footer">
                <div className="avatar-stack">
                  <Image src={imageUrls.profile} alt="" width={32} height={32} />
                  <Image src={imageUrls.society} alt="" width={32} height={32} />
                  <span>+{featuredEvent.rsvps}</span>
                </div>
                <button
                  className="stitch-primary"
                  onClick={() => {
                    setRsvp(!rsvp);
                    announce(rsvp ? `RSVP cancelled for ${featuredEvent.title}.` : "RSVP confirmed. Your QR check-in will appear before the event.");
                  }}
                  type="button"
                >
                  {rsvp ? "RSVP'd" : "RSVP Now"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3>No upcoming events yet</h3>
              <p>UKSSC staff will publish events here. Check back soon.</p>
              <div className="card-footer">
                <span style={{ fontSize: 13, color: "var(--muted)" }}>Nothing scheduled</span>
              </div>
            </>
          )}
        </article>

        {/* Society card */}
        <article className="stitch-card society-quick">
          <div className="soft-blob" />
          <div className="society-head">
            <div className="society-icon"><Storefront size={28} weight="fill" /></div>
            <div>
              <h3>{mySociety ? mySociety.name : "No Society Linked"}</h3>
              <span>{mySociety ? (myUniversity?.name ?? "Your Society") : "Join a society from the directory"}</span>
            </div>
          </div>
          {mySociety ? (
            <>
              {mySociety.bio ? (
                <div className="notice-card">
                  <strong>About</strong>
                  <p style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{mySociety.bio}</p>
                </div>
              ) : (
                <div className="notice-card">
                  <strong>Members</strong>
                  <p>{mySociety.members} registered members</p>
                </div>
              )}
              <button className="stitch-secondary-muted full" type="button" onClick={() => viewSociety(mySociety.id)}>
                View Society Page
              </button>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Browse the directory to find and join your university's Singaporean society.</p>
          )}
        </article>

        {/* Second event or placeholder */}
        {secondEvent ? (
          <article className="stitch-card image-card">
            <div className="image-wrap">
              <Image src={imageUrls.social} alt={secondEvent.title} fill style={{ objectFit: "cover" }} />
              <span style={{ textTransform: "capitalize" }}>{secondEvent.type.replace("_", " ")}</span>
            </div>
            <h3>{secondEvent.title}</h3>
            <p>{secondEvent.location}</p>
            <div className="mini-between">
              <span>{formatEventDate(secondEvent.startsAt)}</span>
              <button type="button" onClick={() => announce(`Check the Events tab for details on ${secondEvent.title}.`)}>View →</button>
            </div>
          </article>
        ) : (
          <article className="stitch-card image-card">
            <div className="image-wrap">
              <Image src={imageUrls.social} alt="Upcoming event" fill style={{ objectFit: "cover" }} />
              <span>Social</span>
            </div>
            <h3>More events coming soon</h3>
            <p>Check the Events tab for the latest.</p>
          </article>
        )}

        {/* Trending Discussions */}
        <article className="stitch-card bento-wide">
          <div className="section-row">
            <h3><ChatCircleText size={22} weight="fill" /> Community Boards</h3>
            <button type="button" onClick={() => announce("Open the Forums tab to browse all boards.")}>View All</button>
          </div>
          {forumThreads.slice(0, 3).map((thread) => (
            <Thread key={thread.id} title={thread.title} count={thread.count} meta={thread.meta} />
          ))}
          {forumThreads.length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>No forum boards yet. UKSSC staff can create boards from the admin panel.</p>
          )}
        </article>

        {/* Upcoming events list */}
        {upcomingEvents.length > 0 && (
          <article className="stitch-card bento-wide">
            <h3>Upcoming Events</h3>
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.3))" }}>
                <CalendarBlank size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{event.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{formatEventDate(event.startsAt)} · {event.location}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)" }}>
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
