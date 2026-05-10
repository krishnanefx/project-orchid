import type { ForumBoard, OrchidEvent, Profile, ReimbursementClaim, Resource, Society, University } from "@/lib/types";

export const universities: University[] = [
  { id: "ucl", name: "University College London", domains: ["ucl.ac.uk"], city: "London" },
  { id: "imperial", name: "Imperial College London", domains: ["imperial.ac.uk"], city: "London" },
  { id: "lse", name: "London School of Economics", domains: ["lse.ac.uk"], city: "London" },
  { id: "kcl", name: "King's College London", domains: ["kcl.ac.uk"], city: "London" },
  { id: "cambridge", name: "University of Cambridge", domains: ["cam.ac.uk"], city: "Cambridge" },
  { id: "oxford", name: "University of Oxford", domains: ["ox.ac.uk"], city: "Oxford" },
  { id: "manchester", name: "University of Manchester", domains: ["student.manchester.ac.uk", "manchester.ac.uk"], city: "Manchester" },
  { id: "edinburgh", name: "University of Edinburgh", domains: ["ed.ac.uk", "sms.ed.ac.uk"], city: "Edinburgh" },
  { id: "warwick", name: "University of Warwick", domains: ["warwick.ac.uk"], city: "Coventry" },
  { id: "bristol", name: "University of Bristol", domains: ["bristol.ac.uk"], city: "Bristol" }
];

export const societies: Society[] = [
  {
    id: "ucl-singapore",
    name: "UCL Singapore Society",
    universityId: "ucl",
    logo: "UCL",
    description: "A London base for Singaporeans across socials, careers, welfare and Freshers support. One of the largest Singaporean societies in the UK.",
    bio: "Founded in 1999, UCLSS is one of the oldest and largest Singaporean societies in the UK. We run Freshers events, career panels, welfare check-ins, alumni mentorship, and the annual Singaporean Night. Our committee works closely with UKSSC to represent UCL members at a national level.",
    committee: ["Yew Chin Siang", "Arielle Tan", "Brandon Lim", "Janelle Ho"],
    links: ["instagram.com/uclsingapore", "linktr.ee/uclsingapore"],
    members: 184,
    status: "active",
    foundedYear: 1999,
    tags: ["Welfare", "Careers", "Culture", "Freshers"],
    bannerColor: "#f3eeff"
  },
  {
    id: "imperial-singapore",
    name: "Imperial College Singapore Society",
    universityId: "imperial",
    logo: "IC",
    description: "A community for Singaporeans in STEM, medicine, business and design across Imperial College London.",
    bio: "Imperial College Singapore Society brings together Singaporeans across all faculties at Imperial. We run hackathons, lab visits, career nights, and wellness socials. Our members span Engineering, Medicine, Business and the Arts.",
    committee: ["Megan Koh", "Isaac Teo", "Daryl Ong"],
    links: ["instagram.com/imperialsingsoc"],
    members: 143,
    status: "active",
    foundedYear: 2003,
    tags: ["STEM", "Careers", "Welfare"],
    bannerColor: "#fff0f3"
  },
  {
    id: "lse-singapore",
    name: "LSE Singapore Society",
    universityId: "lse",
    logo: "LSE",
    description: "Connecting Singaporeans at the London School of Economics through socials, career networking, and cultural events.",
    bio: "LSE Singapore Society is the home of Singaporean students at one of the world's top social science institutions. We run policy debates, finance career panels, Deepavali and CNY socials, and regular welfare check-ins.",
    committee: ["Clara Goh", "Ryan Chua"],
    links: ["instagram.com/lsesingsoc"],
    members: 118,
    status: "active",
    foundedYear: 2001,
    tags: ["Policy", "Finance", "Culture"],
    bannerColor: "#fffbe6"
  },
  {
    id: "cambridge-cumsa",
    name: "Cambridge University Malaysia and Singapore Association",
    universityId: "cambridge",
    logo: "CAM",
    description: "CUMSA bridges Malaysian and Singaporean students at Cambridge through academic, cultural and social programmes.",
    bio: "CUMSA has been Cambridge's home for Malaysian and Singaporean students since 1967. We organise the annual Malaysian-Singaporean Night (MSN), Freshers' week, welfare initiatives, and cultural exchanges with other Oxbridge and London societies.",
    committee: ["Albert Chieng", "Lim Zheng Wei"],
    links: ["instagram.com/cumsa_official"],
    members: 210,
    status: "active",
    foundedYear: 1967,
    tags: ["Culture", "Academic", "Welfare", "Alumni"],
    bannerColor: "#e8f5e9"
  },
  {
    id: "manc-singapore",
    name: "Singapore Students' Society of Manchester",
    universityId: "manchester",
    logo: "MAN",
    description: "Regional community for Singaporeans in Manchester, hosting food nights, welfare check-ins and cross-society collaborations.",
    bio: "The Singapore Students' Society of Manchester serves Singaporeans across the University of Manchester and Manchester Metropolitan University. We run Hawker nights, supper clubs, welfare support, and collaborate with other Northern societies.",
    committee: ["Samantha Tan", "Ethan Quek"],
    links: ["instagram.com/mancsingsoc"],
    members: 96,
    status: "active",
    foundedYear: 2008,
    tags: ["Food", "Welfare", "North England"],
    bannerColor: "#e3f2fd"
  },
  {
    id: "edin-singapore",
    name: "Edinburgh University Singapore Students' Society",
    universityId: "edinburgh",
    logo: "ED",
    description: "Student support, cultural events and alumni links for Singaporeans in Edinburgh and across Scotland.",
    bio: "EUSSS is the only Singaporean student society in Scotland, serving students across the University of Edinburgh, Heriot-Watt and Edinburgh Napier. We run Freshers mixers, National Day celebrations, and maintain an active alumni network.",
    committee: ["Ilhan Athar", "Tricia Low"],
    links: ["instagram.com/eusss_official"],
    members: 71,
    status: "active",
    foundedYear: 2011,
    tags: ["Culture", "Alumni", "Scotland"],
    bannerColor: "#fce4ec"
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
    name: "Krishnan Adaikkappan",
    email: "technology@ukssc.org",
    role: "ukssc_staff",
    accountType: "staff",
    consentStatus: "accepted",
    verified: true
  },
  {
    id: "profile-3",
    name: "Marcus Tan",
    email: "marcus.tan.19@ucl.ac.uk",
    role: "alumni",
    accountType: "alumni",
    universityId: "ucl",
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
  },
  {
    id: "evt-4",
    title: "LSE Soc Malam",
    type: "cross_society",
    societyIds: ["ucl-singapore", "imperial-singapore", "lse-singapore", "cambridge-cumsa"],
    startsAt: "2026-11-02T22:00:00+00:00",
    location: "London",
    capacity: 300,
    rsvps: 187,
    checkedIn: 0,
    status: "open"
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
