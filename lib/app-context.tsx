"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { claims as seedClaims, profiles, societies as seedSocieties } from "@/lib/data";
import type { ClaimStatus, Profile, ReimbursementClaim, Role, Society } from "@/lib/types";

export type View = "dashboard" | "societies" | "society-detail" | "society-admin" | "events" | "forums" | "resources" | "admin" | "claims";

export const ADMIN_ROLES: Role[] = ["super_admin", "ukssc_staff"];

export type ThreadItem = {
  id: string;
  title: string;
  count: string;
  meta: string;
};

type AppState = {
  view: View;
  setView: (view: View) => void;
  toast: string;
  announce: (message: string) => void;
  rsvp: boolean;
  setRsvp: (value: boolean) => void;
  joinedSociety: string;
  setJoinedSociety: (society: string) => void;
  claimStatuses: Record<string, ClaimStatus>;
  setClaimStatuses: (value: Record<string, ClaimStatus>) => void;
  localClaims: ReimbursementClaim[];
  setLocalClaims: (value: ReimbursementClaim[]) => void;
  threads: ThreadItem[];
  setThreads: (threads: ThreadItem[]) => void;
  currentUser: Profile;
  setCurrentUser: (profile: Profile) => void;
  currentSocietyId: string | null;
  viewSociety: (id: string) => void;
  localSocieties: Society[];
  updateSociety: (id: string, patch: Partial<Society>) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("dashboard");
  const [currentSocietyId, setCurrentSocietyId] = useState<string | null>(null);
  const [currentUser, setCurrentUserState] = useState<Profile>(profiles[0]);
  const [toast, setToast] = useState(`University email verified: ${profiles[0].email} maps to UCL Singapore Society.`);
  const [rsvp, setRsvp] = useState(false);
  const [joinedSociety, setJoinedSociety] = useState("UCL Singapore Society");
  const [localSocieties, setLocalSocieties] = useState<Society[]>(seedSocieties);
  const [claimStatuses, setClaimStatuses] = useState<Record<string, ClaimStatus>>({});
  const [localClaims, setLocalClaims] = useState<ReimbursementClaim[]>(seedClaims);
  const [threads, setThreads] = useState<ThreadItem[]>([
    { id: "thread-1", title: "Best places for authentic Chicken Rice in London?", count: "42", meta: "@foodie_sg · 18 replies · 2 hrs ago" },
    { id: "thread-2", title: "Housing tips for 2nd years moving out of halls", count: "28", meta: "Advice · 5 replies · 5 hrs ago" }
  ]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  function announce(message: string) {
    setToast(message);
  }

  function setCurrentUser(profile: Profile) {
    setCurrentUserState(profile);
    // If switching to a non-admin account while on the admin view, go back to dashboard
    if (view === "admin" && !ADMIN_ROLES.includes(profile.role)) {
      setView("dashboard");
    }
    announce(`Switched to ${profile.name} (${profile.role.replace(/_/g, " ")})`);
  }

  function viewSociety(id: string) {
    setCurrentSocietyId(id);
    setView("society-detail");
  }

  function updateSociety(id: string, patch: Partial<Society>) {
    setLocalSocieties((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  return (
    <AppContext.Provider value={{ view, setView, toast, announce, rsvp, setRsvp, joinedSociety, setJoinedSociety, claimStatuses, setClaimStatuses, localClaims, setLocalClaims, threads, setThreads, currentUser, setCurrentUser, currentSocietyId, viewSociety, localSocieties, updateSociety }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
