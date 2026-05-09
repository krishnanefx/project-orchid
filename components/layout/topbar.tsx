"use client";

import { Bell, List, MagnifyingGlass, Question } from "@phosphor-icons/react";
import Image from "next/image";
import { useApp } from "@/lib/app-context";
import { navItems } from "@/components/layout/sidebar";
import { imageUrls } from "@/components/ui/primitives";

export function TopBar() {
  const { view, setView } = useApp();
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
        <Image className="profile-image" src={imageUrls.profile} alt="Wei profile" width={32} height={32} />
      </div>
    </header>
  );
}
