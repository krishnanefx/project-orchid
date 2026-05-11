"use client";

import { CalendarBlank, CaretDown, CaretUp, List, MagnifyingGlass, MapPin, QrCode, UsersThree } from "@phosphor-icons/react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { rsvpEventAction } from "@/lib/actions";
import { PageHeader } from "@/components/ui/primitives";
import { TicketModal } from "@/components/ui/ticket-modal";
import type { OrchidEvent } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  ukssc: "UKSSC",
  society: "Society",
  cross_society: "Cross-Society",
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  ukssc: { bg: "var(--primary-soft)", color: "var(--primary)" },
  society: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  cross_society: { bg: "#fff3cd", color: "#856404" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  waitlist: { bg: "#fff3cd", color: "#856404" },
  closed: { bg: "var(--surface-container)", color: "var(--muted)" },
};

function formatDate(startsAt: string) {
  return new Date(startsAt).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

function formatTime(startsAt: string) {
  return new Date(startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function EventRow({ event, onRsvp, onTicket, rsvpd }: { event: OrchidEvent; onRsvp: () => void; onTicket: () => void; rsvpd: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const typeStyle = TYPE_COLORS[event.type] ?? TYPE_COLORS.ukssc;
  const statusStyle = STATUS_COLORS[event.status] ?? STATUS_COLORS.closed;
  const spotsLeft = event.capacity - event.rsvps;
  const hasDetails = !!(event.description?.trim());

  return (
    <div className="stitch-card" style={{ padding: 0, marginBottom: 10, overflow: "hidden" }}>
      <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 18 }}>
        {/* Date column */}
        <div style={{ textAlign: "center", minWidth: 48, flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.05em" }}>
            {new Date(event.startsAt).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--on-surface)", lineHeight: 1.1 }}>
            {new Date(event.startsAt).toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" })}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>
            {formatTime(event.startsAt)}
          </div>
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: typeStyle.bg, color: typeStyle.color }}>
              {TYPE_LABELS[event.type] ?? event.type}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: statusStyle.bg, color: statusStyle.color }}>
              {event.status}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--on-surface)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {event.title}
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
            <span><MapPin size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {event.location}</span>
            <span><UsersThree size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {event.rsvps}/{event.capacity}</span>
            {spotsLeft > 0 && spotsLeft <= 20 && (
              <span style={{ color: "#856404", fontWeight: 600 }}>Only {spotsLeft} left</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {hasDetails && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse details" : "Expand details"}
              style={{ border: 0, background: expanded ? "var(--primary-soft)" : "none", cursor: "pointer", color: "var(--primary)", padding: 6, borderRadius: 6, display: "flex" }}
            >
              {expanded ? <CaretUp size={15} /> : <CaretDown size={15} />}
            </button>
          )}
          {rsvpd && (
            <button
              type="button"
              onClick={onTicket}
              title="View entry ticket"
              aria-label="View event ticket"
              style={{ border: 0, background: "var(--primary-soft)", cursor: "pointer", color: "var(--primary)", padding: 6, borderRadius: 6, display: "flex" }}
            >
              <QrCode size={15} weight="fill" />
            </button>
          )}
          {event.status !== "closed" && (
            <button
              type="button"
              className={rsvpd ? "stitch-secondary" : "stitch-primary"}
              onClick={onRsvp}
            >
              {rsvpd ? "RSVP'd ✓" : "RSVP"}
            </button>
          )}
        </div>
      </div>

      {/* Expandable details */}
      {expanded && hasDetails && (
        <div style={{ borderTop: "1px solid var(--outline-variant, rgba(208,194,213,0.3))", padding: "14px 22px 16px", background: "var(--surface-container, #faf7fb)" }}>
          <p style={{ fontSize: 14, color: "var(--on-surface)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
}

export function EventsHub() {
  const { announce, localEvents, rsvpdEventIds, setRsvpdEventIds, currentUser, localEvents: allEvents, setLocalEvents } = useApp();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [ticketEvent, setTicketEvent] = useState<OrchidEvent | null>(null);

  function toggleRsvp(event: OrchidEvent) {
    const alreadyRsvpd = rsvpdEventIds.includes(event.id);
    if (!alreadyRsvpd && event.status === "closed") {
      announce("This event is no longer accepting RSVPs.");
      return;
    }
    const nextRsvps = Math.max(0, event.rsvps + (alreadyRsvpd ? -1 : 1));
    const nextStatus = !alreadyRsvpd && nextRsvps >= event.capacity ? "waitlist" : event.status === "waitlist" && nextRsvps < event.capacity ? "open" : event.status;

    const nextIds = alreadyRsvpd
      ? rsvpdEventIds.filter((id) => id !== event.id)
      : [...rsvpdEventIds, event.id];
    setRsvpdEventIds(nextIds);
    setLocalEvents(allEvents.map((e) =>
      e.id === event.id ? { ...e, rsvps: nextRsvps, status: nextStatus } : e
    ));
    const msg = alreadyRsvpd
      ? `RSVP cancelled for ${event.title}.`
      : nextStatus === "waitlist"
        ? `Added to waitlist for ${event.title} — event is now at capacity.`
        : "RSVP confirmed. QR check-in will be available before the event.";
    announce(msg);
    if (currentUser.id) {
      rsvpEventAction(event.id, currentUser.id).catch(() =>
        announce("RSVP saved locally but failed to sync.")
      );
    }
  }

  const now = new Date().toISOString();
  const upcoming = localEvents
    .filter((e) => e.startsAt > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = localEvents
    .filter((e) => e.startsAt <= now)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  const typeKey: Record<string, OrchidEvent["type"]> = {
    "UKSSC": "ukssc",
    "Society": "society",
    "Cross-Society": "cross_society",
  };

  const q = search.toLowerCase();
  const filtered = upcoming.filter((e) => {
    const matchType = filter === "All" || e.type === typeKey[filter];
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const hero = upcoming[0] ?? null;

  return (
    <main className="stitch-main">
      <PageHeader
        title="Events Hub"
        copy="Find and join events happening across the UKSSC network."
      />

      {/* Hero card */}
      {hero ? (
        <div className="stitch-card" style={{ padding: "28px 32px", marginBottom: 24, background: "var(--primary-soft)", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <span className="pill green" style={{ fontSize: 11 }}>Next Up</span>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: "rgba(157,78,221,0.12)", color: "var(--primary)" }}>
                {TYPE_LABELS[hero.type] ?? hero.type}
              </span>
            </div>
            <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 22, color: "var(--on-surface)", margin: "0 0 8px", lineHeight: 1.2 }}>
              {hero.title}
            </h2>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--muted)", flexWrap: "wrap" }}>
              <span><CalendarBlank size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {formatDate(hero.startsAt)}</span>
              <span><MapPin size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {hero.location}</span>
              <span><UsersThree size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {hero.rsvps}/{hero.capacity} RSVPs</span>
            </div>
          </div>
          <button
            className={rsvpdEventIds.includes(hero.id) ? "stitch-secondary" : "stitch-primary"}
            style={{ flexShrink: 0, padding: "12px 28px", fontSize: 15 }}
            onClick={() => toggleRsvp(hero)}
            type="button"
          >
            {rsvpdEventIds.includes(hero.id) ? "RSVP'd ✓" : "RSVP Now"}
          </button>
        </div>
      ) : (
        <div className="stitch-card" style={{ padding: 32, textAlign: "center", marginBottom: 24, background: "var(--surface-container, #faf7fb)" }}>
          <CalendarBlank size={36} style={{ color: "var(--muted)", marginBottom: 10 }} />
          <p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>
            No upcoming events yet. UKSSC staff can add events from Admin → Manage Data.
          </p>
        </div>
      )}

      {/* Filter + search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="category-row" style={{ marginBottom: 0, flex: "0 0 auto" }}>
          {["All", "UKSSC", "Society", "Cross-Society"].map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} type="button">
              {item}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", flex: "1 1 180px" }}>
          <MagnifyingGlass size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            aria-label="Search events"
            style={{
              width: "100%",
              padding: "8px 12px 8px 30px",
              border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--on-surface)",
              background: "var(--surface-bright, #fff)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Upcoming list */}
      <section>
        <div className="section-row" style={{ marginBottom: 12 }}>
          <h3>Upcoming Events {search || filter !== "All" ? <span style={{ fontSize: 13, fontWeight: 400, color: "var(--muted)" }}>({filtered.length})</span> : null}</h3>
          <span><List size={18} /></span>
        </div>
        {filtered.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--muted)", padding: "8px 0" }}>
            {search ? `No events matching "${search}".` : filter === "All" ? "No upcoming events." : `No upcoming ${filter} events.`}
          </p>
        ) : (
          filtered.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              rsvpd={rsvpdEventIds.includes(event.id)}
              onRsvp={() => toggleRsvp(event)}
              onTicket={() => setTicketEvent(event)}
            />
          ))
        )}
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <div className="section-row" style={{ marginBottom: 12 }}>
            <h3 style={{ color: "var(--muted)" }}>Past Events</h3>
          </div>
          {past.slice(0, 5).map((event) => (
            <div key={event.id} className="stitch-card" style={{ padding: "14px 20px", display: "flex", gap: 14, alignItems: "center", marginBottom: 8, opacity: 0.65 }}>
              <CalendarBlank size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{formatDate(event.startsAt)} · {event.location} · {event.checkedIn} attended</div>
              </div>
            </div>
          ))}
        </section>
      )}

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
