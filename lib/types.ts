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
  committee: string[];
  links: string[];
  members: number;
  status: "active" | "onboarding" | "needs_review";
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
