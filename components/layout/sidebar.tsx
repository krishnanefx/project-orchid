"use client";

import {
  Article,
  CalendarBlank,
  ChartLineUp,
  ChatCircleText,
  CurrencyGbp,
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
  { id: "claims", label: "Claims", icon: CurrencyGbp },
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
  const { view, setView, currentUser, viewAs, setViewAs, can, localClaims, claimStatuses, localEvents, rsvpdEventIds } = useApp();

  const visibleNavItems = navItems.filter((item) => {
    const feature = NAV_FEATURE_MAP[item.id];
    if (item.id === "society-admin" && !currentUser.societyId) return false;
    if (item.id === "claims") {
      return can("submit_claims") || ["finance_reviewer", "ukssc_staff", "super_admin"].includes(currentUser.role);
    }
    if (!feature) return true;
    return can(feature);
  });

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Badge counts for nav items
  const now = new Date().toISOString();
  const upcomingRsvpCount = localEvents.filter((e) => rsvpdEventIds.includes(e.id) && e.startsAt > now).length;
  const pendingClaimsCount = localClaims.filter((c) => (claimStatuses[c.id] ?? c.status) === "submitted" || (claimStatuses[c.id] ?? c.status) === "under_review").length;
  const navBadges: Partial<Record<View, number>> = {
    events: upcomingRsvpCount > 0 ? upcomingRsvpCount : 0,
    claims: pendingClaimsCount > 0 ? pendingClaimsCount : 0,
  };

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
          const badge = navBadges[item.id] ?? 0;
          return (
            <button key={item.id} className={`stitch-nav-item ${active ? "active" : ""}`} onClick={() => setView(item.id)} type="button" style={{ position: "relative" }}>
              <Icon size={17} weight={active ? "fill" : "regular"} />
              <span>{item.label}</span>
              {badge > 0 && !active && (
                <span style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: "var(--primary)",
                  color: "#fff",
                  flexShrink: 0,
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(208,194,213,0.3)" }}>
        <button
          type="button"
          onClick={() => setView("settings")}
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
        <button className="stitch-nav-item" type="button" onClick={() => setView("settings")}><GearSix size={17} /> Settings</button>
        <form action="/api/auth/signout" method="POST" style={{ width: "100%" }}>
          <button className="stitch-nav-item" type="submit" style={{ width: "100%" }}><SignOut size={17} /> Logout</button>
        </form>
      </div>
    </aside>
  );
}

export { navItems };
