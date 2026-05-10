"use client";

import { Suspense, lazy } from "react";
import { AppProvider, useApp } from "@/lib/app-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Footer } from "@/components/ui/primitives";

const DashboardView = lazy(() => import("@/components/views/dashboard-view").then((m) => ({ default: m.DashboardView })));
const SocietyDirectory = lazy(() => import("@/components/views/society-directory").then((m) => ({ default: m.SocietyDirectory })));
const SocietyDetail = lazy(() => import("@/components/views/society-detail").then((m) => ({ default: m.SocietyDetail })));
const SocietyAdmin = lazy(() => import("@/components/views/society-admin").then((m) => ({ default: m.SocietyAdmin })));
const EventsHub = lazy(() => import("@/components/views/events-hub").then((m) => ({ default: m.EventsHub })));
const ForumsView = lazy(() => import("@/components/views/forums-view").then((m) => ({ default: m.ForumsView })));
const ResourcesView = lazy(() => import("@/components/views/resources-view").then((m) => ({ default: m.ResourcesView })));
const AdminView = lazy(() => import("@/components/views/admin-view").then((m) => ({ default: m.AdminView })));
const ClaimsView = lazy(() => import("@/components/views/claims-view").then((m) => ({ default: m.ClaimsView })));

function ViewSkeleton() {
  return <div className="stitch-main" style={{ paddingTop: 40 }} aria-busy="true" aria-label="Loading…" />;
}

function AppShell() {
  const { view, toast } = useApp();
  return (
    <div className="stitch-app">
      <Sidebar />
      <div className="stitch-body">
        <TopBar />
        {toast ? <div className="toast" role="status" aria-live="polite">{toast}</div> : null}
        <ErrorBoundary>
          <Suspense fallback={<ViewSkeleton />}>
            {view === "dashboard" && <DashboardView />}
            {view === "societies" && <SocietyDirectory />}
            {view === "society-detail" && <SocietyDetail />}
            {view === "society-admin" && <SocietyAdmin />}
            {view === "events" && <EventsHub />}
            {view === "forums" && <ForumsView />}
            {view === "resources" && <ResourcesView />}
            {view === "admin" && <AdminView />}
            {view === "claims" && <ClaimsView />}
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </div>
  );
}

export function OrchidApp() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
