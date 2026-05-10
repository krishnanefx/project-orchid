"use client";

import {
  Article,
  CalendarBlank,
  ChartLineUp,
  ChatCircleText,
  GearSix,
  House,
  IdentificationCard,
  SignOut,
  UsersThree
} from "@phosphor-icons/react";
import { useApp, type View } from "@/lib/app-context";

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

export function Sidebar() {
  const { view, setView, currentUser, can } = useApp();

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
            <button key={item.id} className={`stitch-nav-item ${active ? "active" : ""}`} onClick={() => setView(item.id)} type="button">
              <Icon size={17} weight={active ? "fill" : "regular"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(208,194,213,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
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
              color: "var(--primary)",
              flexShrink: 0
            }}
          >
            {initials || "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser.name || "Unknown user"}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>
              {ROLE_LABELS[currentUser.role] ?? currentUser.role}
            </div>
          </div>
        </div>
      </div>

      <div className="stitch-sidebar-bottom">
        {can("submit_claims") && (
          <button className="stitch-primary full" onClick={() => setView("claims")} type="button">Submit Reimbursement</button>
        )}
        <button className="stitch-nav-item" type="button"><GearSix size={17} /> Settings</button>
        <form action="/api/auth/signout" method="POST" style={{ width: "100%" }}>
          <button className="stitch-nav-item" type="submit" style={{ width: "100%" }}><SignOut size={17} /> Logout</button>
        </form>
      </div>
    </aside>
  );
}

export { navItems };
