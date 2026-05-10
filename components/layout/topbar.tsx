"use client";

import { Bell, List, MagnifyingGlass, Question } from "@phosphor-icons/react";
import { useApp } from "@/lib/app-context";
import { navItems } from "@/components/layout/sidebar";

export function TopBar() {
  const { view, setView, currentUser } = useApp();

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <header className="stitch-topbar">
      <div className="mobile-brand">
        <button className="icon-button" type="button"><List size={20} /></button>
        <strong>Project Orchid</strong>
      </div>
      <div className="stitch-search">
        <MagnifyingGlass size={15} />
        <input placeholder={view === "societies" ? "Search societies..." : "Search Orchid..."} aria-label="Search Orchid" />
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
