"use client";

import { CalendarBlank, MapPin, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { OrchidEvent } from "@/lib/types";

export function TicketModal({ event, userId, onClose }: { event: OrchidEvent; userId: string; onClose: () => void }) {
  const qrData = `ORCHID-${event.id}${userId ? `-${userId.slice(0, 8)}` : ""}`;
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(qrData, {
      width: 160,
      margin: 1,
      color: {
        dark: "#6b21a8",
        light: "#faf7fb",
      },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(""));
  }, [qrData]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--surface-bright, #fff)",
        borderRadius: 20,
        width: "100%",
        maxWidth: 360,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}>
        {/* Header */}
        <div style={{
          background: "var(--primary)",
          padding: "20px 20px 16px",
          position: "relative",
        }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket"
            style={{ position: "absolute", top: 12, right: 12, border: 0, background: "rgba(255,255,255,0.2)", cursor: "pointer", color: "#fff", borderRadius: 6, padding: 4, display: "flex" }}
          >
            <X size={16} />
          </button>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", margin: "0 0 6px" }}>
            UKSSC Event Ticket
          </p>
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", margin: "0 0 10px", lineHeight: 1.2 }}>
            {event.title}
          </h2>
          <div style={{ display: "flex", gap: 14, fontSize: 13, color: "rgba(255,255,255,0.8)", flexWrap: "wrap" }}>
            <span><CalendarBlank size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {new Date(event.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span>
            <span><MapPin size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {event.location}</span>
          </div>
        </div>

        {/* Tear line */}
        <div style={{ display: "flex", alignItems: "center", height: 20, background: "var(--surface-container, #faf7fb)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: -10, width: 20, height: 20, borderRadius: "50%", background: "var(--background, #f5f0f8)" }} />
          <div style={{ flex: 1, margin: "0 20px", borderTop: "2px dashed var(--outline-variant, rgba(208,194,213,0.5))" }} />
          <div style={{ position: "absolute", right: -10, width: 20, height: 20, borderRadius: "50%", background: "var(--background, #f5f0f8)" }} />
        </div>

        {/* QR section */}
        <div style={{ padding: "20px", background: "var(--surface-container, #faf7fb)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.4))", minHeight: 160, minWidth: 160, display: "grid", placeItems: "center" }}>
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="Check-in QR code" width={140} height={140} style={{ display: "block", borderRadius: 4 }} />
            ) : (
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Generating QR…</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
            Show this to the committee at the door.<br />
            <span style={{ fontSize: 11, letterSpacing: "0.04em", fontFamily: "monospace", color: "var(--on-surface)" }}>{qrData}</span>
          </p>
        </div>

        <div style={{ padding: "14px 20px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
            Screenshot this ticket. Valid for 1 admission.
          </p>
        </div>
      </div>
    </div>
  );
}
