"use client";

import {
  Article,
  CalendarBlank,
  ChartLineUp,
  ChatCircleText,
  GearSix,
  House,
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
  { id: "admin", label: "Admin", icon: ChartLineUp }
];

export function Sidebar() {
  const { view, setView } = useApp();
  return (
    <aside className="stitch-sidebar">
      <div className="stitch-brand">
        <strong>Project Orchid</strong>
        <span>UKSSC Community</span>
      </div>
      <nav className="stitch-nav" aria-label="Primary">
        {navItems.map((item) => {
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
      <div className="stitch-sidebar-bottom">
        <button className="stitch-primary full" onClick={() => setView("claims")} type="button">Submit Reimbursement</button>
        <button className="stitch-nav-item" type="button"><GearSix size={17} /> Settings</button>
        <button className="stitch-nav-item" type="button"><SignOut size={17} /> Logout</button>
      </div>
    </aside>
  );
}

export { navItems };
