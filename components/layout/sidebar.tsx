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
import { useApp, type View, ADMIN_ROLES } from "@/lib/app-context";
import { profiles } from "@/lib/data";

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

export function Sidebar() {
  const { view, setView, currentUser, setCurrentUser } = useApp();
  const isAdmin = ADMIN_ROLES.includes(currentUser.role);

  const hasSociety = !!currentUser.societyId;
  const canSubmitClaim = currentUser.societyId !== undefined && ["student_member", "society_admin"].includes(currentUser.role);
  const visibleNavItems = navItems.filter((item) => {
    if (item.id === "admin") return isAdmin;
    if (item.id === "society-admin") return hasSociety;
    return true;
  });

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

      {/* Demo account switcher */}
      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(208,194,213,0.3)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, paddingLeft: 4 }}>
          Demo accounts
        </p>
        <div style={{ display: "grid", gap: 4 }}>
          {profiles.map((profile) => {
            const active = currentUser.id === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setCurrentUser(profile)}
                style={{
                  width: "100%",
                  border: 0,
                  borderRadius: 8,
                  padding: "8px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  background: active ? "var(--primary-soft)" : "transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  transition: "background 150ms ease"
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? "var(--primary)" : "var(--on-surface)", lineHeight: 1.3 }}>
                  {profile.name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stitch-sidebar-bottom">
        {canSubmitClaim && (
          <button className="stitch-primary full" onClick={() => setView("claims")} type="button">Submit Reimbursement</button>
        )}
        <button className="stitch-nav-item" type="button"><GearSix size={17} /> Settings</button>
        <button className="stitch-nav-item" type="button"><SignOut size={17} /> Logout</button>
      </div>
    </aside>
  );
}

export { navItems };
