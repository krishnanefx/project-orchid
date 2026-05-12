"use client";

import { Bell, CalendarBlank, ChatCircleText, CurrencyGbp, List, MagnifyingGlass, Question, X } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { navItems } from "@/components/layout/sidebar";
import { universities } from "@/lib/data";

export function TopBar() {
  const { view, setView, currentUser, localSocieties, localEvents, localClaims, localForums, localResources, viewSociety, can } = useApp();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const q = query.toLowerCase();
  const showResults = focused && q.length >= 2;

  // Build recent activity items for the bell panel
  const now = new Date();
  type ActivityItem = { id: string; icon: React.ReactNode; text: string; time: string; onClick?: () => void };
  const activityItems: ActivityItem[] = [
    ...localEvents
      .filter((e) => {
        const d = new Date(e.startsAt);
        const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      })
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 3)
      .map((e) => ({
        id: `evt-${e.id}`,
        icon: <CalendarBlank size={14} weight="fill" style={{ color: "var(--primary)", flexShrink: 0 }} />,
        text: e.title,
        time: new Date(e.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
        onClick: () => { setBellOpen(false); setView("events"); },
      })),
    ...localClaims
      .filter((c) => c.status === "submitted" || c.status === "under_review")
      .slice(0, 2)
      .map((c) => ({
        id: `claim-${c.id}`,
        icon: <CurrencyGbp size={14} weight="fill" style={{ color: "var(--warning-text)", flexShrink: 0 }} />,
        text: `${c.claimant}: £${c.amount} claim ${c.status === "submitted" ? "awaiting review" : "under review"}`,
        time: new Date(c.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
        onClick: () => { setBellOpen(false); setView("claims"); },
      })),
    ...localForums.slice(0, 2).map((f) => ({
      id: `forum-${f.id}`,
      icon: <ChatCircleText size={14} weight="fill" style={{ color: "var(--on-secondary-container)", flexShrink: 0 }} />,
      text: `${f.name}: ${f.threads} thread${f.threads !== 1 ? "s" : ""}`,
      time: "Board",
      onClick: () => { setBellOpen(false); setView("forums"); },
    })),
  ].slice(0, 6);
  const unreadCount = activityItems.length;

  const societyResults = showResults
    ? localSocieties.filter((s) => {
        const uni = universities.find((u) => u.id === (s.universitySlug || s.universityId));
        return s.name.toLowerCase().includes(q) || uni?.name.toLowerCase().includes(q);
      }).slice(0, 4)
    : [];

  const eventResults = showResults
    ? localEvents.filter((e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const forumResults = showResults
    ? localForums.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 2)
    : [];

  const resourceResults = showResults
    ? localResources.filter((r) => r.title.toLowerCase().includes(q) || r.body?.toLowerCase().includes(q)).slice(0, 2)
    : [];

  function handleSocietyClick(id: string) {
    setQuery("");
    inputRef.current?.blur();
    viewSociety(id);
  }

  function handleEventClick() {
    setQuery("");
    inputRef.current?.blur();
    setView("events");
  }

  const hasResults = societyResults.length > 0 || eventResults.length > 0 || forumResults.length > 0 || resourceResults.length > 0;

  return (
    <header className="stitch-topbar">
      <div className="mobile-brand">
        <button className="icon-button" type="button"><List size={20} /></button>
        <strong>Project Orchid</strong>
      </div>
      <div className="stitch-search" style={{ position: "relative" }}>
        <MagnifyingGlass size={15} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={view === "societies" ? "Search societies..." : "Search Orchid..."}
          aria-label="Search Orchid"
        />
        {showResults && hasResults && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--surface-bright, #fff)",
            border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.4))",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            zIndex: 100,
            overflow: "hidden",
          }}>
            {societyResults.length > 0 && (
              <>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
                  Societies
                </div>
                {societyResults.map((s) => {
                  const uni = universities.find((u) => u.id === (s.universitySlug || s.universityId));
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={() => handleSocietyClick(s.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "8px 12px", border: "none", background: "none",
                        cursor: "pointer", textAlign: "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-soft)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--primary)", flexShrink: 0 }}>
                        {s.logo || s.name.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{uni?.name}</div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
            {eventResults.length > 0 && (
              <>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", borderTop: societyResults.length > 0 ? "1px solid var(--outline-variant, rgba(208,194,213,0.3))" : "none" }}>
                  Events
                </div>
                {eventResults.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onMouseDown={handleEventClick}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "8px 12px", border: "none", background: "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--primary-soft)")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "none")}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{e.location}</div>
                  </button>
                ))}
              </>
            )}
            {forumResults.length > 0 && (
              <>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", borderTop: "1px solid var(--outline-variant, rgba(208,194,213,0.3))" }}>
                  Forums
                </div>
                {forumResults.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onMouseDown={() => { setQuery(""); inputRef.current?.blur(); setView("forums"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "8px 12px", border: "none", background: "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--primary-soft)")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "none")}
                  >
                    <ChatCircleText size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{f.threads} threads</div>
                  </button>
                ))}
              </>
            )}
            {resourceResults.length > 0 && (
              <>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", borderTop: "1px solid var(--outline-variant, rgba(208,194,213,0.3))" }}>
                  Resources
                </div>
                {resourceResults.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onMouseDown={() => { setQuery(""); inputRef.current?.blur(); setView("resources"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "8px 12px", border: "none", background: "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--primary-soft)")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "none")}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0, textTransform: "capitalize" }}>{r.category}</div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
        {showResults && !hasResults && q.length >= 2 && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--surface-bright, #fff)",
            border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.4))",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 13,
            color: "var(--muted)",
            zIndex: 100,
          }}>
            No results for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>
      <div className="mobile-tabs" aria-label="Mobile navigation">
        {navItems
          .filter((item) => {
            if (item.id === "society-admin" && !currentUser.societyId) return false;
            if (item.id === "claims") return can("submit_claims") || ["finance_reviewer", "ukssc_staff", "super_admin"].includes(currentUser.role);
            if (item.id === "admin") return can("nav_admin");
            return true;
          })
          .slice(0, 6)
          .map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} type="button">
              {item.label}
            </button>
          ))}
      </div>
      <div className="top-actions">
        <div style={{ position: "relative" }}>
          <button
            ref={bellRef}
            className="icon-button notify"
            type="button"
            aria-label="Recent activity"
            onClick={() => setBellOpen((o) => !o)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2,
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--primary)", border: "2px solid var(--surface, #fff)",
                pointerEvents: "none",
              }} />
            )}
          </button>
          {bellOpen && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 300,
                background: "var(--surface-bright, #fff)",
                border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.4))",
                borderRadius: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                zIndex: 200,
                overflow: "hidden",
              }}
              onMouseLeave={() => setTimeout(() => setBellOpen(false), 300)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 8px", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.3))" }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--on-surface)" }}>
                  Recent Activity
                </span>
                <button type="button" onClick={() => setBellOpen(false)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)", padding: 2 }}>
                  <X size={14} />
                </button>
              </div>
              {activityItems.length === 0 ? (
                <div style={{ padding: "20px 14px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                  No recent activity.
                </div>
              ) : (
                <div>
                  {activityItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        width: "100%", padding: "10px 14px", border: "none", background: "none",
                        cursor: item.onClick ? "pointer" : "default", textAlign: "left",
                        borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.2))",
                      }}
                      onMouseEnter={(e) => { if (item.onClick) e.currentTarget.style.background = "var(--primary-soft)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      <span style={{ marginTop: 2 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.text}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{item.time}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button className="icon-button hide-sm" type="button"><Question size={18} /></button>
        <button
          type="button"
          onClick={() => setView("settings")}
          aria-label={`Open profile settings for ${currentUser.name}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--primary-soft)",
            border: "2px solid var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "var(--primary)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
