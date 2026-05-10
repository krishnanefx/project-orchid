export type Role =
  | "super_admin"
  | "ukssc_staff"
  | "society_admin"
  | "finance_reviewer"
  | "student_member"
  | "alumni"
  | "sponsor";

export type EventType = "ukssc" | "society" | "cross_society";
export type ForumVisibility = "open_to_verified_users" | "membership_restricted";
export type ClaimStatus = "submitted" | "under_review" | "approved" | "rejected" | "paid";

export type University = {
  id: string;
  name: string;
  domains: string[];
  city: string;
};

export type Society = {
  id: string;
  name: string;
  universityId: string;
  logo: string;
  description: string;
  bio?: string;
  committee: string[];
  links: string[];
  members: number;
  status: "active" | "onboarding" | "needs_review";
  foundedYear?: number;
  tags?: string[];
  bannerColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  galleryUrls?: string[];
};

export type SocietyDraft = Omit<Society, "id" | "members" | "status">;

export type EventDraft = {
  title: string;
  type: EventType;
  startsAt: string;
  location: string;
  capacity: number;
};

export type AdminQueueItem = {
  id: string;
  type: "claim" | "member" | "event" | "forum" | "content";
  label: string;
  meta: string;
  status: string;
  createdAt: string;
};

export type MemberAdminRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  societyId?: string;
  universityId?: string;
  course?: string;
  year?: string;
  verified: boolean;
  consentStatus: "accepted" | "pending";
  joinedAt?: string;
  notes?: string;
};

export type EventAdminRow = {
  id: string;
  title: string;
  type: EventType;
  startsAt: string;
  location: string;
  capacity: number;
  rsvps: number;
  checkedIn: number;
  status: "open" | "waitlist" | "closed";
  societyIds: string[];
};

export type ReportCard = {
  id: string;
  title: string;
  description: string;
  metric: string | number;
  delta?: string;
  category: "membership" | "events" | "forums" | "claims" | "societies";
};

export type GovernanceRequest = {
  id: string;
  type: "deletion" | "consent_update" | "data_export" | "audit_log";
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "processing" | "completed" | "rejected";
  notes?: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  accountType: "student" | "alumni" | "sponsor" | "staff";
  universityId?: string;
  societyId?: string;
  course?: string;
  year?: string;
  dietaryNeeds?: string;
  accessibilityNeeds?: string;
  consentStatus: "accepted" | "pending";
  verified: boolean;
};

export type OrchidEvent = {
  id: string;
  title: string;
  type: EventType;
  societyIds: string[];
  startsAt: string;
  location: string;
  capacity: number;
  rsvps: number;
  checkedIn: number;
  status: "open" | "waitlist" | "closed";
};

export type ForumBoard = {
  id: string;
  name: string;
  visibility: ForumVisibility;
  societyId?: string;
  threads: number;
  replies: number;
  pinned: string;
  locked?: boolean;
};

export type ReimbursementClaim = {
  id: string;
  claimant: string;
  societyId: string;
  amount: number;
  purpose: string;
  status: ClaimStatus;
  submittedAt: string;
  receiptName: string;
};

export type Resource = {
  id: string;
  title: string;
  category: "announcement" | "guide" | "article";
  audience: string;
  publishedAt: string;
};
