import type { University } from "@/lib/types";

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

export function resolveUniversityByEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return universities.find((university) => university.domains.includes(domain));
}
