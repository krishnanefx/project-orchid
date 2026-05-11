import type { Role } from "@/lib/types";

export type FeatureKey =
  | "nav_societies"
  | "nav_events"
  | "nav_forums"
  | "nav_resources"
  | "nav_society_admin"
  | "nav_admin"
  | "submit_claims"
  | "rsvp_events"
  | "join_society"
  | "edit_society_profile"
  | "view_member_details";

export type FeatureMeta = {
  label: string;
  description: string;
  group: "Navigation" | "Actions" | "Content";
  locked?: Role[]; // roles whose value cannot be changed
};

export const FEATURE_META: Record<FeatureKey, FeatureMeta> = {
  nav_societies:        { label: "Society Directory",     description: "Can browse and search societies",                    group: "Navigation" },
  nav_events:           { label: "Events Hub",            description: "Can view the events calendar",                       group: "Navigation" },
  nav_forums:           { label: "Forums",                description: "Can access discussion boards",                       group: "Navigation" },
  nav_resources:        { label: "Resources",             description: "Can view guides and announcements",                  group: "Navigation" },
  nav_society_admin:    { label: "My Society Panel",      description: "Can access the society management portal",           group: "Navigation" },
  nav_admin:            { label: "Admin Dashboard",       description: "Can access the UKSSC admin command centre",          group: "Navigation", locked: ["ukssc_staff", "super_admin"] },
  submit_claims:        { label: "Submit Reimbursements", description: "Can file expense claims against a society",          group: "Actions" },
  rsvp_events:          { label: "RSVP to Events",        description: "Can register attendance for events",                 group: "Actions" },
  join_society:         { label: "Join Societies",        description: "Can request membership in a society",                group: "Actions" },
  edit_society_profile: { label: "Edit Society Content",  description: "Can edit profile, events and media for their society", group: "Content" },
  view_member_details:  { label: "View Member Profiles",  description: "Can see full profiles of other members",             group: "Content" },
};

export type RolePermissions = Record<FeatureKey, boolean>;

export type PermissionsMatrix = Partial<Record<Role, RolePermissions>>;

export const DEFAULT_PERMISSIONS: PermissionsMatrix = {
  student_member: {
    nav_societies: true,
    nav_events: true,
    nav_forums: true,
    nav_resources: true,
    nav_society_admin: true,
    nav_admin: false,
    submit_claims: true,
    rsvp_events: true,
    join_society: true,
    edit_society_profile: true,
    view_member_details: false
  },
  society_admin: {
    nav_societies: true,
    nav_events: true,
    nav_forums: true,
    nav_resources: true,
    nav_society_admin: true,
    nav_admin: false,
    submit_claims: true,
    rsvp_events: true,
    join_society: true,
    edit_society_profile: true,
    view_member_details: true
  },
  alumni: {
    nav_societies: true,
    nav_events: true,
    nav_forums: true,
    nav_resources: true,
    nav_society_admin: false,
    nav_admin: false,
    submit_claims: false,
    rsvp_events: true,
    join_society: false,
    edit_society_profile: false,
    view_member_details: false
  },
  finance_reviewer: {
    nav_societies: true,
    nav_events: true,
    nav_forums: false,
    nav_resources: true,
    nav_society_admin: false,
    nav_admin: true,
    submit_claims: false,
    rsvp_events: false,
    join_society: false,
    edit_society_profile: false,
    view_member_details: true
  },
  sponsor: {
    nav_societies: true,
    nav_events: true,
    nav_forums: false,
    nav_resources: true,
    nav_society_admin: false,
    nav_admin: false,
    submit_claims: false,
    rsvp_events: false,
    join_society: false,
    edit_society_profile: false,
    view_member_details: false
  },
  ukssc_staff: {
    nav_societies: true,
    nav_events: true,
    nav_forums: true,
    nav_resources: true,
    nav_society_admin: true,
    nav_admin: true,
    submit_claims: false,
    rsvp_events: true,
    join_society: true,
    edit_society_profile: true,
    view_member_details: true
  },
  super_admin: {
    nav_societies: true,
    nav_events: true,
    nav_forums: true,
    nav_resources: true,
    nav_society_admin: true,
    nav_admin: true,
    submit_claims: true,
    rsvp_events: true,
    join_society: true,
    edit_society_profile: true,
    view_member_details: true
  }
};

export const CONFIGURABLE_ROLES: Role[] = [
  "student_member",
  "society_admin",
  "alumni",
  "finance_reviewer",
  "sponsor"
];

export const ROLE_DISPLAY: Record<string, string> = {
  student_member:   "Student Member",
  society_admin:    "Society Admin",
  alumni:           "Alumni",
  finance_reviewer: "Finance Reviewer",
  sponsor:          "Sponsor",
  ukssc_staff:      "UKSSC EXCO",
  super_admin:      "Super Admin"
};
