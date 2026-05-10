import { createClient } from "@/lib/supabase-server";
import {
  societies as seedSocieties,
  events as seedEvents,
  forums as seedForums,
  resources as seedResources,
  claims as seedClaims,
  profiles as seedProfiles
} from "@/lib/data";
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

export async function getSocieties(): Promise<Society[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase.from("societies").select("*");
    if (!error && data?.length) return data as Society[];
  } catch { /* fall through */ }
  return seedSocieties;
}

export async function getEvents(): Promise<OrchidEvent[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase.from("events").select("*");
    if (!error && data?.length) return data as OrchidEvent[];
  } catch { /* fall through */ }
  return seedEvents;
}

export async function getForumBoards(): Promise<ForumBoard[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase.from("forum_boards").select("*");
    if (!error && data?.length) return data as ForumBoard[];
  } catch { /* fall through */ }
  return seedForums;
}

export async function getResources(): Promise<Resource[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase.from("resources").select("*");
    if (!error && data?.length) return data as Resource[];
  } catch { /* fall through */ }
  return seedResources;
}

export async function getClaims(societyId?: string): Promise<ReimbursementClaim[]> {
  try {
    const supabase = await db();
    let query = supabase.from("reimbursement_claims").select("*");
    if (societyId) query = query.eq("society_id", societyId);
    const { data, error } = await query;
    if (!error && data?.length) return data as ReimbursementClaim[];
  } catch { /* fall through */ }
  return societyId ? seedClaims.filter((c) => c.societyId === societyId) : seedClaims;
}

export async function submitClaim(
  claim: Omit<ReimbursementClaim, "id" | "status" | "submittedAt">
): Promise<ReimbursementClaim> {
  const newClaim: ReimbursementClaim = {
    ...claim,
    id: `claim-${Date.now()}`,
    status: "under_review",
    submittedAt: new Date().toISOString().split("T")[0]
  };
  try {
    const supabase = await db();
    await supabase.from("reimbursement_claims").insert({
      id: newClaim.id,
      claimant: newClaim.claimant,
      society_id: newClaim.societyId,
      amount: newClaim.amount,
      purpose: newClaim.purpose,
      status: newClaim.status,
      submitted_at: newClaim.submittedAt,
      receipt_name: newClaim.receiptName
    });
  } catch { /* fall through — local state will hold it */ }
  return newClaim;
}

export async function updateClaimStatus(id: string, status: ClaimStatus): Promise<void> {
  try {
    const supabase = await db();
    await supabase.from("reimbursement_claims").update({ status }).eq("id", id);
  } catch { /* fall through */ }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) return data as Profile;
  } catch { /* fall through */ }
  return seedProfiles.find((p) => p.id === userId) ?? null;
}

export async function updateSociety(id: string, patch: Partial<Society>): Promise<void> {
  try {
    const supabase = await db();
    await supabase.from("societies").update(patch).eq("id", id);
  } catch { /* fall through — context local state handles it */ }
}
