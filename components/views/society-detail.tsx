"use client";

import { ArrowLeft, CheckCircle, Globe, InstagramLogo, MapPin, UsersThree } from "@phosphor-icons/react";
import { useApp } from "@/lib/app-context";
import { universities } from "@/lib/data";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  onboarding: "Onboarding",
  needs_review: "Needs Review"
};

export function SocietyDetail() {
  const { currentSocietyId, setView, joinedSociety, setJoinedSociety, announce, localSocieties, localEvents } = useApp();
  const society = localSocieties.find((s) => s.id === currentSocietyId);
  const university = universities.find((u) => u.id === (society?.universitySlug || society?.universityId));
  const societyEvents = localEvents.filter((e) => e.societyIds.includes(currentSocietyId ?? ""));

  if (!society) {
    return (
      <main className="stitch-main">
        <p>Society not found.</p>
        <button type="button" className="stitch-secondary" onClick={() => setView("societies")}>
          Back to Directory
        </button>
      </main>
    );
  }

  const isJoined = joinedSociety === society.name;

  const societyName = society.name;
  function handleJoin() {
    if (isJoined) return;
    setJoinedSociety(societyName);
    announce(`Joined ${societyName}.`);
  }

  const instagramLink = society.links.find((l) => l.includes("instagram"));
  const otherLinks = society.links.filter((l) => !l.includes("instagram"));

  return (
    <main className="stitch-main">
      {/* Back */}
      <button
        type="button"
        className="stitch-nav-item"
        style={{ display: "inline-flex", width: "auto", marginBottom: 8 }}
        onClick={() => setView("societies")}
      >
        <ArrowLeft size={16} />
        <span>All Societies</span>
      </button>

      {/* Header */}
      <div className="stitch-card" style={{ padding: "28px 28px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "var(--primary-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--primary)",
              flexShrink: 0
            }}
          >
            {society.logo}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--on-surface)", margin: 0 }}>
                {society.name}
              </h2>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: society.status === "active" ? "var(--secondary-container)" : "var(--surface-container)",
                  color: society.status === "active" ? "var(--on-secondary-container)" : "var(--muted)"
                }}
              >
                {STATUS_LABELS[society.status]}
              </span>
            </div>
            <div className="meta-row compact" style={{ marginBottom: 12 }}>
              {university && <span><MapPin size={14} /> {university.name}</span>}
              <span><UsersThree size={14} /> {society.members} members</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {society.description}
            </p>
          </div>
          <button
            type="button"
            className={isJoined ? "stitch-primary" : "stitch-secondary"}
            style={{ flexShrink: 0 }}
            onClick={handleJoin}
          >
            {isJoined ? <><CheckCircle size={15} weight="fill" /> Joined</> : "Join Society"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Committee */}
        <div className="stitch-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--on-surface)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Committee
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {society.committee.map((member) => (
              <li key={member} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--primary-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--primary)"
                  }}
                >
                  {member.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>{member}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Links */}
        <div className="stitch-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--on-surface)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Links
          </h3>
          <div style={{ display: "grid", gap: 10 }}>
            {instagramLink && (
              <a
                href={`https://${instagramLink}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
              >
                <InstagramLogo size={16} />
                {instagramLink.replace("instagram.com/", "@")}
              </a>
            )}
            {otherLinks.map((link) => (
              <a
                key={link}
                href={`https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
              >
                <Globe size={16} />
                {link}
              </a>
            ))}
            {society.links.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>No links yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--on-surface)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Upcoming Events
        </h3>
        {societyEvents.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>No upcoming events for this society.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {societyEvents.map((event) => {
              const date = new Date(event.startsAt);
              const month = date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
              const day = date.toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" });
              return (
                <div key={event.id} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ textAlign: "center", minWidth: 40 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.04em" }}>{month}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--on-surface)", lineHeight: 1.2 }}>{day}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{event.location} &middot; {event.rsvps} going</div>
                  </div>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: event.status === "open" ? "var(--secondary-container)" : "var(--surface-container)",
                      color: event.status === "open" ? "var(--on-secondary-container)" : "var(--muted)"
                    }}
                  >
                    {event.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
