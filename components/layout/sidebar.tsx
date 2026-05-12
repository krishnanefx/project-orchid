"use client";

import {
  Article,
  CalendarBlank,
  ChartLineUp,
  ChatCircleText,
  Eye,
  GearSix,
  House,
  IdentificationCard,
  SignOut,
  UsersThree
} from "@phosphor-icons/react";
import { useApp, type View } from "@/lib/app-context";
import type { Role } from "@/lib/types";

const navItems: { id: View; label: string; icon: React.ComponentType<{ size?: number; weight?: "regular" | "fill" | "bold" }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: House },
  { id: "societies", label: "Societies", icon: UsersThree },
  { id: "events", label: "Events", icon: CalendarBlank },
  { id: "forums", label: "Forums", icon: ChatCircleText },
  { id: "resources", label: "Resources", icon: Article },
  { id: "society-admin", label: "My Society", icon: IdentificationCard },
  { id: "admin", label: "Admin", icon: ChartLineUp }
];

const ROLE_LABELS: Record<string, string> = {
  student_member: "Student",
  ukssc_staff: "UKSSC EXCO",
  alumni: "Alumni",
  super_admin: "Super Admin",
  society_admin: "Society Admin",
  finance_reviewer: "Finance",
  sponsor: "Sponsor"
};

const NAV_FEATURE_MAP: Partial<Record<View, import("@/lib/permissions").FeatureKey>> = {
  societies: "nav_societies",
  events: "nav_events",
  forums: "nav_forums",
  resources: "nav_resources",
  "society-admin": "nav_society_admin",
  admin: "nav_admin"
};

const PREVIEW_ROLES: { role: Role; label: string }[] = [
  { role: "student_member", label: "Student" },
  { role: "society_admin", label: "Society Admin" },
  { role: "ukssc_staff", label: "UKSSC Staff" },
  { role: "finance_reviewer", label: "Finance" },
  { role: "alumni", label: "Alumni" },
  { role: "sponsor", label: "Sponsor" },
];

export function Sidebar() {
  const { view, setView, navigate, currentUser, viewAs, setViewAs, can } = useApp();

  const visibleNavItems = navItems.filter((item) => {
    const feature = NAV_FEATURE_MAP[item.id];
    if (!feature) return true;
    if (item.id === "society-admin" && !currentUser.societyId) return false;
    return can(feature);
  });

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="stitch-sidebar">
      <div className="stitch-brand">
        <strong>Project Orchid</strong>
        <span>UKSSC Community</span>
      </div>
      <nav className="stitch-nav" aria-label="Primary">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button key={item.id} className={`stitch-nav-item ${active ? "active" : ""}`} onClick={() => navigate(item.id)} type="button">
              <Icon size={17} weight={active ? "fill" : "regular"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(208,194,213,0.3)" }}>
        <button
          type="button"
          onClick={() => navigate("settings")}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", width: "100%", background: "none", border: "none", cursor: "pointer", borderRadius: 8, textAlign: "left" }}
          aria-label="Open profile settings"
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--primary-soft)",
              border: "1.5px solid var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--primary)",
              flexShrink: 0
            }}
          >
            {initials || "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser.email ? currentUser.name : "Set up profile"}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>
              {currentUser.email ? (ROLE_LABELS[currentUser.role] ?? currentUser.role) : "Click to get started"}
            </div>
          </div>
        </button>
      </div>

      <div className="stitch-sidebar-bottom">
        {currentUser.role === "super_admin" && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 6 }}>
              <Eye size={12} />
              Preview as
            </div>
            <select
              value={viewAs ?? ""}
              onChange={(e) => setViewAs((e.target.value as Role) || null)}
              style={{
                width: "100%",
                padding: "7px 10px",
                borderRadius: 8,
                border: viewAs ? "1.5px solid var(--primary)" : "1.5px solid rgba(208,194,213,0.4)",
                background: viewAs ? "var(--primary-soft)" : "var(--surface-bright, #fff)",
                fontSize: 12,
                fontWeight: 600,
                color: viewAs ? "var(--primary)" : "var(--muted)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="">Your view (Super Admin)</option>
              {PREVIEW_ROLES.map(({ role, label }) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
          </div>
        )}
        {can("submit_claims") && currentUser.societyId && (
          <button className="stitch-primary full" onClick={() => navigate("claims")} type="button">Submit Reimbursement</button>
        )}
        <button className="stitch-nav-item" type="button" onClick={() => navigate("settings")}><GearSix size={17} /> Settings</button>
        <form action="/api/auth/signout" method="POST" style={{ width: "100%" }}>
          <button className="stitch-nav-item" type="submit" style={{ width: "100%" }}><SignOut size={17} /> Logout</button>
        </form>
      </div>
    </aside>
  );
}

export { navItems };
