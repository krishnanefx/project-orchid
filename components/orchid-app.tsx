"use client";

import { Suspense, lazy } from "react";
import { AppProvider, useApp } from "@/lib/app-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Footer } from "@/components/ui/primitives";
import type { ForumBoard, OrchidEvent, Profile, ReimbursementClaim, Resource, Society } from "@/lib/types";

const DashboardView = lazy(() => import("@/components/views/dashboard-view").then((m) => ({ default: m.DashboardView })));
const SocietyDirectory = lazy(() => import("@/components/views/society-directory").then((m) => ({ default: m.SocietyDirectory })));
const SocietyDetail = lazy(() => import("@/components/views/society-detail").then((m) => ({ default: m.SocietyDetail })));
const SocietyAdmin = lazy(() => import("@/components/views/society-admin").then((m) => ({ default: m.SocietyAdmin })));
const AccessControl = lazy(() => import("@/components/views/access-control").then((m) => ({ default: m.AccessControl })));
const EventsHub = lazy(() => import("@/components/views/events-hub").then((m) => ({ default: m.EventsHub })));
const ForumsView = lazy(() => import("@/components/views/forums-view").then((m) => ({ default: m.ForumsView })));
const ResourcesView = lazy(() => import("@/components/views/resources-view").then((m) => ({ default: m.ResourcesView })));
const AdminView = lazy(() => import("@/components/views/admin-view").then((m) => ({ default: m.AdminView })));
const ClaimsView = lazy(() => import("@/components/views/claims-view").then((m) => ({ default: m.ClaimsView })));
const AdminDataView = lazy(() => import("@/components/views/admin-data").then((m) => ({ default: m.AdminDataView })));
const SettingsView = lazy(() => import("@/components/views/settings-view").then((m) => ({ default: m.SettingsView })));
const CheckinView  = lazy(() => import("@/components/views/checkin-view").then((m) => ({ default: m.CheckinView })));

function ViewSkeleton() {
  return <div className="stitch-main" style={{ paddingTop: 40 }} aria-busy="true" aria-label="Loading…" />;
}

const ROLE_LABELS: Record<string, string> = {
  student_member: "Student",
  society_admin: "Society Admin",
  ukssc_staff: "UKSSC Staff",
  finance_reviewer: "Finance Reviewer",
  alumni: "Alumni",
  sponsor: "Sponsor",
};

function AppShell() {
  const { view, toast, viewAs, setViewAs, can, currentUser } = useApp();
  // Roles allowed to reach data-management and access-control sub-views
  const canManageData = currentUser.role === "super_admin" || currentUser.role === "ukssc_staff";
  return (
    <div className="stitch-app">
      <Sidebar />
      <div className="stitch-body">
        {viewAs && (
          <div role="status" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "9px 20px",
            background: "oklch(0.55 0.18 295)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ opacity: 0.75 }}>Previewing as</span>
              <strong>{ROLE_LABELS[viewAs] ?? viewAs}</strong>
              <span style={{ opacity: 0.6 }}>— nav and features reflect this role</span>
            </span>
            <button
              type="button"
              onClick={() => setViewAs(null)}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", cursor: "pointer" }}
            >
              Exit preview
            </button>
          </div>
        )}
        <TopBar />
        {toast ? <div className="toast" role="status" aria-live="polite">{toast}</div> : null}
        <ErrorBoundary>
          <Suspense fallback={<ViewSkeleton />}>
            {view === "dashboard"     && <DashboardView />}
            {view === "societies"     && can("nav_societies")     && <SocietyDirectory />}
            {view === "society-detail" && <SocietyDetail />}
            {view === "society-admin" && can("nav_society_admin") && <SocietyAdmin />}
            {/* admin-data + access-control: super_admin / ukssc_staff only — not finance_reviewer */}
            {view === "access-control" && canManageData && <AccessControl />}
            {view === "events"        && can("nav_events")        && <EventsHub />}
            {view === "forums"        && can("nav_forums")        && <ForumsView />}
            {view === "resources"     && can("nav_resources")     && <ResourcesView />}
            {view === "admin"         && can("nav_admin")         && <AdminView />}
            {view === "claims"        && can("submit_claims")     && <ClaimsView />}
            {view === "admin-data"    && canManageData            && <AdminDataView />}
            {view === "settings"      && <SettingsView />}
            {view === "checkin-admin" && can("nav_admin")         && <CheckinView />}
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </div>
  );
}

type OrchidAppProps = {
  initialUser: Profile | null;
  initialSocieties: Society[];
  initialClaims: ReimbursementClaim[];
  initialEvents: OrchidEvent[];
  initialForums: ForumBoard[];
  initialResources: Resource[];
  initialRsvpIds: string[];
};

export function OrchidApp({
  initialUser,
  initialSocieties,
  initialClaims,
  initialEvents,
  initialForums,
  initialResources,
  initialRsvpIds,
}: OrchidAppProps) {
  return (
    <AppProvider
      initialUser={initialUser}
      initialSocieties={initialSocieties}
      initialClaims={initialClaims}
      initialEvents={initialEvents}
      initialForums={initialForums}
      initialResources={initialResources}
      initialRsvpIds={initialRsvpIds}
    >
      <AppShell />
    </AppProvider>
  );
}
