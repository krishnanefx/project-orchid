import type { ForumBoard, OrchidEvent, Profile, ReimbursementClaim, Resource, Society, University } from "@/lib/types";

export const universities: University[] = [
  { id: "ucl", name: "University College London", domains: ["ucl.ac.uk"], city: "London" },
  { id: "imperial", name: "Imperial College London", domains: ["imperial.ac.uk"], city: "London" },
  { id: "manchester", name: "University of Manchester", domains: ["student.manchester.ac.uk", "manchester.ac.uk"], city: "Manchester" },
  { id: "edinburgh", name: "University of Edinburgh", domains: ["ed.ac.uk", "sms.ed.ac.uk"], city: "Edinburgh" }
];

export const societies: Society[] = [
  {
    id: "ucl-singapore",
    name: "UCL Singapore Society",
    universityId: "ucl",
    logo: "UCL",
    description: "A London base for Singaporeans across socials, careers, welfare and Freshers support.",
    committee: ["Arielle Tan", "Brandon Lim", "Nivetha Rajan"],
    links: ["instagram.com/uclsingapore", "linktr.ee/uclsingapore"],
    members: 184,
    status: "active"
  },
  {
    id: "imperial-singapore",
    name: "Imperial Singapore Society",
    universityId: "imperial",
    logo: "IC",
    description: "A community for Singaporeans in STEM, medicine, business and design across Imperial.",
    committee: ["Megan Koh", "Isaac Teo", "Daryl Ong"],
    links: ["instagram.com/imperialsingsoc"],
    members: 143,
    status: "active"
  },
  {
    id: "manc-singapore",
    name: "Manchester Singapore Society",
    universityId: "manchester",
    logo: "MN",
    description: "Regional community, food nights, welfare check-ins and cross-society collaborations.",
    committee: ["Clara Goh", "Ethan Quek"],
    links: ["instagram.com/mancsgsoc"],
    members: 96,
    status: "onboarding"
  },
  {
    id: "edin-singapore",
    name: "Edinburgh Singapore Society",
    universityId: "edinburgh",
    logo: "ED",
    description: "Student support, cultural events and alumni links for Singaporeans in Edinburgh.",
    committee: ["Tricia Low", "Ryan Chua"],
    links: ["instagram.com/edinsingsoc"],
    members: 71,
    status: "needs_review"
  }
];

export const profiles: Profile[] = [
  {
    id: "profile-1",
    name: "Janelle Ho",
    email: "janelle.ho.26@ucl.ac.uk",
    role: "student_member",
    accountType: "student",
    universityId: "ucl",
    societyId: "ucl-singapore",
    course: "Politics and International Relations",
    year: "Year 2",
    dietaryNeeds: "Halal preferred",
    accessibilityNeeds: "None",
    consentStatus: "accepted",
    verified: true
  },
  {
    id: "profile-2",
    name: "Kiran Wee",
    email: "kiran@ukssc.org",
    role: "finance_reviewer",
    accountType: "staff",
    consentStatus: "accepted",
    verified: true
  }
];

export const events: OrchidEvent[] = [
  {
    id: "evt-1",
    title: "Project Orchid Townhall",
    type: "ukssc",
    societyIds: [],
    startsAt: "2026-06-12T18:30:00+01:00",
    location: "London School of Economics",
    capacity: 220,
    rsvps: 164,
    checkedIn: 0,
    status: "open"
  },
  {
    id: "evt-2",
    title: "London Freshers Kopi Night",
    type: "cross_society",
    societyIds: ["ucl-singapore", "imperial-singapore"],
    startsAt: "2026-09-28T19:00:00+01:00",
    location: "Bloomsbury Theatre Cafe",
    capacity: 160,
    rsvps: 132,
    checkedIn: 87,
    status: "open"
  },
  {
    id: "evt-3",
    title: "Manchester Welfare Supper",
    type: "society",
    societyIds: ["manc-singapore"],
    startsAt: "2026-10-04T20:00:00+01:00",
    location: "Oxford Road",
    capacity: 54,
    rsvps: 48,
    checkedIn: 39,
    status: "waitlist"
  }
];

export const forums: ForumBoard[] = [
  {
    id: "forum-1",
    name: "UK-wide arrivals and housing",
    visibility: "open_to_verified_users",
    threads: 37,
    replies: 214,
    pinned: "Airport pickups and first-week essentials"
  },
  {
    id: "forum-2",
    name: "UCL committee board",
    visibility: "membership_restricted",
    societyId: "ucl-singapore",
    threads: 12,
    replies: 68,
    pinned: "Freshers booth rota",
    locked: false
  },
  {
    id: "forum-3",
    name: "Sponsor opportunities",
    visibility: "open_to_verified_users",
    threads: 9,
    replies: 31,
    pinned: "Career partner guidelines"
  }
];

export const claims: ReimbursementClaim[] = [
  {
    id: "claim-1",
    claimant: "Arielle Tan",
    societyId: "ucl-singapore",
    amount: 86.4,
    purpose: "Freshers booth supplies",
    status: "under_review",
    submittedAt: "2026-05-02",
    receiptName: "booth-supplies.pdf"
  },
  {
    id: "claim-2",
    claimant: "Megan Koh",
    societyId: "imperial-singapore",
    amount: 132.75,
    purpose: "Venue deposit",
    status: "approved",
    submittedAt: "2026-04-27",
    receiptName: "venue-deposit.jpg"
  },
  {
    id: "claim-3",
    claimant: "Ethan Quek",
    societyId: "manc-singapore",
    amount: 41.2,
    purpose: "Welfare supper snacks",
    status: "paid",
    submittedAt: "2026-04-18",
    receiptName: "snacks-receipt.png"
  }
];

export const resources: Resource[] = [
  { id: "res-1", title: "Freshers onboarding pack", category: "guide", audience: "Society committees", publishedAt: "2026-05-01" },
  { id: "res-2", title: "UKSSC data privacy notice", category: "announcement", audience: "All verified users", publishedAt: "2026-04-22" },
  { id: "res-3", title: "How to run a cross-society event", category: "article", audience: "Society admins", publishedAt: "2026-04-11" }
];

export function resolveUniversityByEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return universities.find((university) => university.domains.includes(domain));
}
