"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { resolveUniversityByEmail } from "@/lib/data";
import type { ClaimStatus, ForumBoard, OrchidEvent, Profile, ReimbursementClaim, Resource, Role, Society } from "@/lib/types";
import { DEFAULT_PERMISSIONS, type FeatureKey, type PermissionsMatrix } from "@/lib/permissions";

export type View = "dashboard" | "societies" | "society-detail" | "society-admin" | "events" | "forums" | "resources" | "admin" | "admin-data" | "claims" | "access-control";

export const ADMIN_ROLES: Role[] = ["super_admin", "ukssc_staff"];

export type ThreadItem = {
  id: string;
  title: string;
  count: string;
  meta: string;
};

const BLANK_USER: Profile = {
  id: "",
  name: "User",
  email: "",
  role: "student_member",
  accountType: "student",
  consentStatus: "pending",
  verified: false,
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
  localEvents: OrchidEvent[];
  setLocalEvents: (value: OrchidEvent[]) => void;
  localForums: ForumBoard[];
  setLocalForums: (value: ForumBoard[]) => void;
  localResources: Resource[];
  setLocalResources: (value: Resource[]) => void;
  threads: ThreadItem[];
  setThreads: (threads: ThreadItem[]) => void;
  currentUser: Profile;
  setCurrentUser: (profile: Profile) => void;
  currentSocietyId: string | null;
  viewSociety: (id: string) => void;
  localSocieties: Society[];
  updateSociety: (id: string, patch: Partial<Society>) => void;
  permissions: PermissionsMatrix;
  setPermission: (role: Role, feature: FeatureKey, value: boolean) => void;
  can: (feature: FeatureKey) => boolean;
};

const AppContext = createContext<AppState | null>(null);

type AppProviderProps = {
  children: ReactNode;
  initialUser: Profile | null;
  initialSocieties: Society[];
  initialClaims: ReimbursementClaim[];
  initialEvents: OrchidEvent[];
  initialForums: ForumBoard[];
  initialResources: Resource[];
};

export function AppProvider({
  children,
  initialUser,
  initialSocieties,
  initialClaims,
  initialEvents,
  initialForums,
  initialResources,
}: AppProviderProps) {
  const user = initialUser ?? BLANK_USER;

  const [view, setView] = useState<View>("dashboard");
  const [currentSocietyId, setCurrentSocietyId] = useState<string | null>(null);
  const [currentUser, setCurrentUserState] = useState<Profile>(user);
  const [rsvp, setRsvp] = useState(false);
  const [joinedSociety, setJoinedSociety] = useState(
    initialSocieties.find((s) => s.id === user.societyId)?.name ?? ""
  );
  const [localSocieties, setLocalSocieties] = useState<Society[]>(initialSocieties);
  const [localClaims, setLocalClaims] = useState<ReimbursementClaim[]>(initialClaims);
  const [localEvents, setLocalEvents] = useState<OrchidEvent[]>(initialEvents);
  const [localForums, setLocalForums] = useState<ForumBoard[]>(initialForums);
  const [localResources, setLocalResources] = useState<Resource[]>(initialResources);
  const [permissions, setPermissions] = useState<PermissionsMatrix>(DEFAULT_PERMISSIONS);
  const [claimStatuses, setClaimStatuses] = useState<Record<string, ClaimStatus>>({});
  const [threads, setThreads] = useState<ThreadItem[]>([]);

  const [toast, setToast] = useState(() => {
    if (!user.email) return "";
    const uni = resolveUniversityByEmail(user.email);
    return uni ? `University email verified: ${user.email} mapped to ${uni.name}.` : "";
  });

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
    const rolePerms = permissions[profile.role];
    const VIEW_FEATURE_MAP: Partial<Record<View, FeatureKey>> = {
      admin: "nav_admin",
      "society-admin": "nav_society_admin",
      forums: "nav_forums",
      resources: "nav_resources",
      events: "nav_events",
      societies: "nav_societies"
    };
    const requiredFeature = VIEW_FEATURE_MAP[view];
    if (requiredFeature && profile.role !== "super_admin" && !rolePerms?.[requiredFeature]) {
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

  function setPermission(role: Role, feature: FeatureKey, value: boolean) {
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...(prev[role] ?? {}), [feature]: value }
    }));
  }

  function can(feature: FeatureKey): boolean {
    const role = currentUser.role;
    if (role === "super_admin") return true;
    return permissions[role]?.[feature] ?? false;
  }

  return (
    <AppContext.Provider value={{ view, setView, toast, announce, rsvp, setRsvp, joinedSociety, setJoinedSociety, claimStatuses, setClaimStatuses, localClaims, setLocalClaims, localEvents, setLocalEvents, localForums, setLocalForums, localResources, setLocalResources, threads, setThreads, currentUser, setCurrentUser, currentSocietyId, viewSociety, localSocieties, updateSociety, permissions, setPermission, can }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
