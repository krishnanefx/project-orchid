"use client";

import { Bell, List, MagnifyingGlass, Question } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { navItems } from "@/components/layout/sidebar";
import { universities } from "@/lib/data";

export function TopBar() {
  const { view, setView, currentUser, localSocieties, localEvents, viewSociety } = useApp();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const q = query.toLowerCase();
  const showResults = focused && q.length >= 2;

  const societyResults = showResults
    ? localSocieties.filter((s) => {
        const uni = universities.find((u) => u.id === (s.universitySlug || s.universityId));
        return s.name.toLowerCase().includes(q) || uni?.name.toLowerCase().includes(q);
      }).slice(0, 4)
    : [];

  const eventResults = showResults
    ? localEvents.filter((e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)).slice(0, 3)
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

  const hasResults = societyResults.length > 0 || eventResults.length > 0;

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
        {navItems.slice(0, 5).map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} type="button">
            {item.label}
          </button>
        ))}
      </div>
      <div className="top-actions">
        <button className="icon-button notify" type="button"><Bell size={18} /></button>
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
