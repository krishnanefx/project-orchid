import { createClient } from "@/lib/supabase-server";
import { resolveUniversityByEmail } from "@/lib/data";
import type {
  Society,
  OrchidEvent,
  ForumBoard,
  Resource,
  ReimbursementClaim,
  ClaimStatus,
  Profile
} from "@/lib/types";

async function db() {
  return createClient();
}

// ── Mappers: DB row (snake_case) → TypeScript type (camelCase) ──────────────

function mapSociety(row: Record<string, unknown>): Society {
  return {
    id: row.id as string,
    name: row.name as string,
    universityId: (row.university_slug ?? "") as string,
    logo: (row.logo ?? "") as string,
    description: (row.description ?? "") as string,
    bio: row.bio as string | undefined,
    committee: (row.committee as string[]) ?? [],
    links: (row.links as string[]) ?? [],
    members: (row.members ?? 0) as number,
    status: (row.status ?? "active") as Society["status"],
    foundedYear: row.founded_year as number | undefined,
    tags: (row.tags as string[]) ?? [],
    bannerColor: row.banner_color as string | undefined,
    logoUrl: row.logo_url as string | undefined,
    bannerUrl: row.banner_url as string | undefined,
    galleryUrls: (row.gallery_urls as string[]) ?? [],
  };
}

function mapEvent(row: Record<string, unknown>): OrchidEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    type: (row.event_type ?? row.type) as OrchidEvent["type"],
    societyIds: (row.society_ids as string[]) ?? [],
    startsAt: row.starts_at as string,
    location: row.location as string,
    capacity: (row.capacity ?? 0) as number,
    rsvps: (row.rsvps ?? 0) as number,
    checkedIn: (row.checked_in ?? 0) as number,
    status: (row.status ?? "open") as OrchidEvent["status"],
    description: (row.description ?? "") as string,
  };
}

function mapForumBoard(row: Record<string, unknown>): ForumBoard {
  return {
    id: row.id as string,
    name: row.name as string,
    visibility: row.visibility as ForumBoard["visibility"],
    societyId: row.society_id as string | undefined,
    threads: (row.threads ?? 0) as number,
    replies: (row.replies ?? 0) as number,
    pinned: (row.pinned ?? "") as string,
    locked: (row.locked ?? false) as boolean,
  };
}

function mapResource(row: Record<string, unknown>): Resource {
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as Resource["category"],
    audience: row.audience as string,
    publishedAt: String(row.published_at ?? "").split("T")[0],
    body: (row.body ?? "") as string,
  };
}

function mapClaim(row: Record<string, unknown>): ReimbursementClaim {
  return {
    id: row.id as string,
    claimant: (row.claimant ?? "") as string,
    societyId: (row.society_id ?? "") as string,
    amount: (row.amount ?? 0) as number,
    purpose: (row.purpose ?? "") as string,
    status: (row.status ?? "submitted") as ClaimStatus,
    submittedAt: String(row.submitted_at ?? row.created_at ?? "").split("T")[0],
    receiptName: (row.receipt_name ?? row.receipt_path ?? "") as string,
  };
}

export function mapProfile(row: Record<string, unknown>): Profile {
  const email = (row.email ?? "") as string;
  // university_id in DB is a UUID, but the client uses slugs (e.g. "ucl").
  // Resolve from email domain so university name shows correctly everywhere.
  const resolvedUniversity = resolveUniversityByEmail(email);
  return {
    id: row.id as string,
    name: (row.full_name ?? row.name ?? "") as string,
    email,
    role: (row.role ?? "student_member") as Profile["role"],
    accountType: (row.account_type ?? "student") as Profile["accountType"],
    universityId: resolvedUniversity?.id ?? undefined,
    societyId: row.society_id as string | undefined,
    course: row.course as string | undefined,
    year: (row.study_year ?? row.year) as string | undefined,
    dietaryNeeds: row.dietary_needs as string | undefined,
    accessibilityNeeds: row.accessibility_needs as string | undefined,
    consentStatus: (row.consent_status ?? "pending") as Profile["consentStatus"],
    verified: (row.verified ?? false) as boolean,
  };
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getSocieties(): Promise<Society[]> {
  const supabase = await db();
  const { data } = await supabase.from("societies").select("*").order("name");
  return (data ?? []).map((row) => mapSociety(row as Record<string, unknown>));
}

export async function getEvents(): Promise<OrchidEvent[]> {
  const supabase = await db();
  const { data } = await supabase.from("events").select("*").order("starts_at");
  return (data ?? []).map((row) => mapEvent(row as Record<string, unknown>));
}

export async function getForumBoards(): Promise<ForumBoard[]> {
  const supabase = await db();
  const { data } = await supabase.from("forum_boards").select("*").order("name");
  return (data ?? []).map((row) => mapForumBoard(row as Record<string, unknown>));
}

export async function getResources(): Promise<Resource[]> {
  const supabase = await db();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .order("published_at", { ascending: false });
  return (data ?? []).map((row) => mapResource(row as Record<string, unknown>));
}

export async function getClaims(societyId?: string): Promise<ReimbursementClaim[]> {
  const supabase = await db();
  let query = supabase
    .from("reimbursement_claims")
    .select("*")
    .order("created_at", { ascending: false });
  if (societyId) query = query.eq("society_id", societyId);
  const { data } = await query;
  return (data ?? []).map((row) => mapClaim(row as Record<string, unknown>));
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await db();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (!data) return null;
  return mapProfile(data as Record<string, unknown>);
}

export async function updateSociety(id: string, patch: Partial<Society>): Promise<void> {
  const supabase = await db();
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.bio !== undefined) dbPatch.bio = patch.bio;
  if (patch.committee !== undefined) dbPatch.committee = patch.committee;
  if (patch.links !== undefined) dbPatch.links = patch.links;
  if (patch.tags !== undefined) dbPatch.tags = patch.tags;
  if (patch.bannerColor !== undefined) dbPatch.banner_color = patch.bannerColor;
  if (patch.logoUrl !== undefined) dbPatch.logo_url = patch.logoUrl;
  if (patch.bannerUrl !== undefined) dbPatch.banner_url = patch.bannerUrl;
  if (patch.galleryUrls !== undefined) dbPatch.gallery_urls = patch.galleryUrls;
  if (Object.keys(dbPatch).length) {
    await supabase.from("societies").update(dbPatch).eq("id", id);
  }
}

export async function updateClaimStatus(id: string, status: ClaimStatus): Promise<void> {
  const supabase = await db();
  await supabase.from("reimbursement_claims").update({ status }).eq("id", id);
}

export async function getUserRsvpIds(userId: string): Promise<string[]> {
  const supabase = await db();
  const { data } = await supabase
    .from("event_rsvps")
    .select("event_id")
    .eq("profile_id", userId);
  return (data ?? []).map((r) => (r as Record<string, unknown>).event_id as string);
}
