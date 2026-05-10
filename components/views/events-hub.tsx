"use client";

import { CalendarBlank, List, MapPin } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { imageUrls, PageHeader } from "@/components/ui/primitives";
import type { OrchidEvent } from "@/lib/types";

function formatDate(startsAt: string) {
  const d = new Date(startsAt);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatTime(startsAt: string) {
  const d = new Date(startsAt);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

const TYPE_LABELS: Record<string, string> = {
  ukssc: "UKSSC",
  society: "Society",
  cross_society: "Cross-Society",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  waitlist: { bg: "#fff3cd", color: "#856404" },
  closed: { bg: "var(--surface-container)", color: "var(--muted)" },
};

function EventListItem({ event, onRsvp, rsvpd }: { event: OrchidEvent; onRsvp: () => void; rsvpd: boolean }) {
  const statusStyle = STATUS_COLORS[event.status] ?? STATUS_COLORS.closed;
  return (
    <div className="stitch-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
      <div style={{ textAlign: "center", minWidth: 44, flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.04em" }}>
          {new Date(event.startsAt).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--on-surface)", lineHeight: 1.1 }}>
          {new Date(event.startsAt).toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" })}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", marginBottom: 2 }}>{event.title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span><MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {event.location}</span>
          <span><CalendarBlank size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {formatTime(event.startsAt)}</span>
          <span>{event.rsvps}/{event.capacity} RSVPs</span>
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, flexShrink: 0 }}>
        {event.status}
      </span>
      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)", fontWeight: 600, flexShrink: 0 }}>
        {TYPE_LABELS[event.type] ?? event.type}
      </span>
      {event.status !== "closed" && (
        <button
          type="button"
          className={rsvpd ? "stitch-secondary" : "stitch-primary"}
          style={{ flexShrink: 0 }}
          onClick={onRsvp}
        >
          {rsvpd ? "RSVP'd" : "RSVP"}
        </button>
      )}
    </div>
  );
}

export function EventsHub() {
  const { rsvp, setRsvp, announce, localEvents } = useApp();
  const [filter, setFilter] = useState("All");

  const now = new Date().toISOString();
  const upcoming = localEvents
    .filter((e) => e.startsAt > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = localEvents
    .filter((e) => e.startsAt <= now)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  const categories = ["All", "UKSSC", "Society", "Cross-Society"];
  const typeKey: Record<string, string> = { "UKSSC": "ukssc", "Society": "society", "Cross-Society": "cross_society" };

  const filtered = filter === "All"
    ? upcoming
    : upcoming.filter((e) => e.type === typeKey[filter]);

  const hero = upcoming[0] ?? null;

  return (
    <main className="stitch-main">
      <PageHeader title="Events Hub" copy="Find and join events happening across the UKSSC network." />

      {hero ? (
        <section className="event-hero-grid" style={{ marginBottom: 24 }}>
          <div className="event-hero-image">
            <Image src={imageUrls.summit} alt={hero.title} fill style={{ objectFit: "cover" }} />
            <div>
              <span className="pill green">Featured · {TYPE_LABELS[hero.type] ?? hero.type}</span>
              <h2>{hero.title}</h2>
              <p>{formatDate(hero.startsAt)} · {hero.location}</p>
            </div>
          </div>
          <article className="stitch-card event-about">
            <h3>About this event</h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              {hero.capacity} capacity · {hero.rsvps} RSVPs so far. Don't miss out — secure your spot now.
            </p>
            <div className="host-row">
              <span>UK</span>
              <div><b>Hosted by</b><p>UKSSC Network</p></div>
            </div>
            <button
              className="stitch-primary full"
              onClick={() => {
                setRsvp(!rsvp);
                announce(rsvp ? `RSVP cancelled for ${hero.title}.` : "RSVP confirmed. QR check-in enabled.");
              }}
              type="button"
            >
              {rsvp ? "RSVP confirmed" : "RSVP Now"}
            </button>
          </article>
        </section>
      ) : (
        <div className="stitch-card" style={{ padding: 32, textAlign: "center", marginBottom: 24 }}>
          <CalendarBlank size={36} style={{ color: "var(--muted)", marginBottom: 10 }} />
          <p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>No upcoming events yet. Check back soon or ask UKSSC staff to add events.</p>
        </div>
      )}

      <div className="category-row" style={{ marginBottom: 20 }}>
        {categories.map((item) => (
          <button
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <section>
        <div className="section-row" style={{ marginBottom: 12 }}>
          <h3>Upcoming Events</h3>
          <span><List size={18} /></span>
        </div>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            {filter === "All" ? "No upcoming events scheduled." : `No upcoming ${filter} events.`}
          </p>
        ) : (
          filtered.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              rsvpd={rsvp && upcoming[0]?.id === event.id}
              onRsvp={() => announce(`RSVP toggled for ${event.title}.`)}
            />
          ))
        )}
      </section>

      {past.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <div className="section-row" style={{ marginBottom: 12 }}>
            <h3 style={{ color: "var(--muted)" }}>Past Events</h3>
          </div>
          {past.slice(0, 5).map((event) => (
            <div key={event.id} className="stitch-card" style={{ padding: "14px 20px", display: "flex", gap: 14, alignItems: "center", marginBottom: 8, opacity: 0.7 }}>
              <CalendarBlank size={16} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{event.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{formatDate(event.startsAt)} · {event.location} · {event.checkedIn} attended</div>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
