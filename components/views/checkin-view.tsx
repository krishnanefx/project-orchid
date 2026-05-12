"use client";

import { ArrowLeft, CheckCircle, QrCode, UsersThree, Warning } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { getEventRsvpsAction } from "@/lib/actions";
import type { EventRsvp } from "@/lib/types";

const STATUS_STYLES = {
  confirmed:  { bg: "var(--secondary-container)", color: "var(--on-secondary-container)", label: "Confirmed" },
  checked_in: { bg: "#f0fdf4", color: "#15803d", label: "Checked In" },
  waitlisted: { bg: "#fff8e1", color: "#b45309", label: "Waitlisted" },
};

export function CheckinView() {
  const { setView, currentUser, announce } = useApp();

  const [eventId, setEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>("Event Check-in");
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof window !== "undefined" ? sessionStorage.getItem("checkin_event_id") : null;
    const title = typeof window !== "undefined" ? sessionStorage.getItem("checkin_event_title") : null;
    if (id) {
      setEventId(id);
      setEventTitle(title ?? "Event Check-in");
      getEventRsvpsAction(id)
        .then((data) => { setRsvps(data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function handleCheckIn(rsvp: EventRsvp) {
    if (!eventId) return;
    setCheckingIn(rsvp.profileId);
    try {
      const res = await fetch("/api/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, profileId: rsvp.profileId }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        announce(err.error ?? "Check-in failed.");
        return;
      }
      const { checkedInAt } = await res.json() as { checkedInAt: string };
      setRsvps((prev) => prev.map((r) =>
        r.profileId === rsvp.profileId
          ? { ...r, status: "checked_in", checkedInAt }
          : r
      ));
      announce(`${rsvp.profileName} checked in.`);
    } finally {
      setCheckingIn(null);
    }
  }

  const filtered = rsvps.filter((r) =>
    !search ||
    r.profileName.toLowerCase().includes(search.toLowerCase()) ||
    r.profileEmail.toLowerCase().includes(search.toLowerCase())
  );

  const checkedInCount  = rsvps.filter((r) => r.status === "checked_in").length;
  const confirmedCount  = rsvps.filter((r) => r.status === "confirmed").length;
  const waitlistedCount = rsvps.filter((r) => r.status === "waitlisted").length;

  return (
    <main className="stitch-main">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button
          type="button"
          className="stitch-nav-item"
          style={{ display: "inline-flex", width: "auto" }}
          onClick={() => setView("events")}
        >
          <ArrowLeft size={16} />
          <span>Events</span>
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--on-surface)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
          <QrCode size={26} style={{ color: "var(--primary)" }} weight="fill" />
          {eventTitle}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Check in attendees as they arrive. Click a name to mark them in.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Checked In", value: checkedInCount,  color: "#15803d", bg: "#f0fdf4" },
          { label: "Confirmed",  value: confirmedCount,   color: "var(--primary)", bg: "var(--primary-soft)" },
          { label: "Waitlisted", value: waitlistedCount,  color: "#b45309", bg: "#fff8e1" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ padding: "12px 20px", borderRadius: 10, background: bg, textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color, opacity: 0.8 }}>{label}</div>
          </div>
        ))}
        {rsvps.length > 0 && (
          <div style={{ padding: "12px 20px", borderRadius: 10, background: "var(--surface-container, #f8f4fa)", textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--on-surface)" }}>
              {Math.round((checkedInCount / rsvps.length) * 100)}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>Turnout</div>
          </div>
        )}
      </div>

      {!eventId && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 10, background: "#fff8e1", color: "#b45309", fontSize: 13, fontWeight: 600 }}>
          <Warning size={16} weight="fill" />
          No event selected. Go back to Events Hub and click "Check-in" on an event.
        </div>
      )}

      {eventId && (
        <>
          <input
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))", borderRadius: 8, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading attendees…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{search ? "No attendees match your search." : "No RSVPs for this event yet."}</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map((rsvp) => {
                const statusStyle = STATUS_STYLES[rsvp.status] ?? STATUS_STYLES.confirmed;
                const isCheckedIn = rsvp.status === "checked_in";
                const isProcessing = checkingIn === rsvp.profileId;

                return (
                  <div
                    key={rsvp.profileId}
                    className="stitch-card"
                    style={{
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      opacity: isCheckedIn ? 0.75 : 1,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: isCheckedIn ? "#f0fdf4" : "var(--primary-soft)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 800,
                      color: isCheckedIn ? "#15803d" : "var(--primary)",
                      flexShrink: 0,
                    }}>
                      {isCheckedIn
                        ? <CheckCircle size={20} weight="fill" />
                        : rsvp.profileName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--on-surface)" }}>{rsvp.profileName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {rsvp.profileEmail}
                        {rsvp.checkedInAt && (
                          <span> · Checked in {new Date(rsvp.checkedInAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, flexShrink: 0 }}>
                      {statusStyle.label}
                    </span>
                    {!isCheckedIn && rsvp.status !== "waitlisted" && (
                      <button
                        type="button"
                        className="stitch-primary"
                        style={{ fontSize: 12, padding: "6px 14px", flexShrink: 0 }}
                        disabled={isProcessing}
                        onClick={() => handleCheckIn(rsvp)}
                      >
                        {isProcessing ? "…" : "Check In"}
                      </button>
                    )}
                    {rsvp.status === "waitlisted" && (
                      <button
                        type="button"
                        className="stitch-secondary"
                        style={{ fontSize: 12, padding: "6px 14px", flexShrink: 0 }}
                        disabled={isProcessing}
                        onClick={() => handleCheckIn(rsvp)}
                      >
                        {isProcessing ? "…" : "Admit"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
