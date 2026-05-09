"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { claims as seedClaims } from "@/lib/data";
import type { ClaimStatus, ReimbursementClaim } from "@/lib/types";

export type View = "dashboard" | "societies" | "events" | "forums" | "resources" | "admin" | "claims";

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
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("dashboard");
  const [toast, setToast] = useState("University email verified: janelle.ho.26@ucl.ac.uk maps to UCL Singapore Society.");
  const [rsvp, setRsvp] = useState(false);
  const [joinedSociety, setJoinedSociety] = useState("UCL Singapore Society");
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

  return (
    <AppContext.Provider value={{ view, setView, toast, announce, rsvp, setRsvp, joinedSociety, setJoinedSociety, claimStatuses, setClaimStatuses, localClaims, setLocalClaims, threads, setThreads }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
