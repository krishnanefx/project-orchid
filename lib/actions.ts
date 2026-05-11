"use server";

import { createClient } from "@/lib/supabase-server";
import type { ClaimStatus, EventRsvpRow, ForumBoard, ForumReply, ForumThread, MemberRow, OrchidEvent, ReimbursementClaim, Resource, Role, Society } from "@/lib/types";

// ── Claims ───────────────────────────────────────────────────────────────────

export async function submitClaimAction(
  claim: { claimant: string; societyId: string; amount: number; purpose: string; receiptName: string },
  userId: string
): Promise<ReimbursementClaim> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("reimbursement_claims")
    .insert({
      claimant_id: userId,
      claimant: claim.claimant,
      society_id: claim.societyId,
      amount: claim.amount,
      purpose: claim.purpose,
      status: "submitted",
      submitted_at: today,
      receipt_name: claim.receiptName,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: (data as Record<string, unknown>).id as string,
    claimant: claim.claimant,
    societyId: claim.societyId,
    amount: claim.amount,
    purpose: claim.purpose,
    status: "submitted",
    submittedAt: today,
    receiptName: claim.receiptName,
  };
}

export async function updateClaimStatusAction(id: string, status: ClaimStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reimbursement_claims")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function updateProfileAction(
  userId: string,
  patch: {
    fullName?: string;
    course?: string;
    studyYear?: string;
    dietaryNeeds?: string;
    accessibilityNeeds?: string;
  }
): Promise<void> {
  const supabase = await createClient();
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.fullName !== undefined) dbPatch.full_name = patch.fullName;
  if (patch.course !== undefined) dbPatch.course = patch.course;
  if (patch.studyYear !== undefined) dbPatch.study_year = patch.studyYear;
  if (patch.dietaryNeeds !== undefined) dbPatch.dietary_needs = patch.dietaryNeeds;
  if (patch.accessibilityNeeds !== undefined) dbPatch.accessibility_needs = patch.accessibilityNeeds;
  const { error } = await supabase.from("profiles").update(dbPatch).eq("id", userId);
  if (error) throw new Error(error.message);
}

// ── Societies ─────────────────────────────────────────────────────────────────

export async function createSocietyAction(input: {
  name: string;
  universitySlug: string;
  description: string;
  logo: string;
  bio?: string;
  foundedYear?: number;
  tags: string[];
  committee: string[];
  links: string[];
}): Promise<Society> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("societies")
    .insert({
      name: input.name,
      university_slug: input.universitySlug,
      description: input.description,
      logo: input.logo,
      bio: input.bio ?? null,
      founded_year: input.foundedYear ?? null,
      tags: input.tags,
      committee: input.committee,
      links: input.links,
      members: 0,
      status: "active",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const row = data as Record<string, unknown>;
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

export async function updateSocietyAction(id: string, patch: Partial<Society>): Promise<void> {
  const supabase = await createClient();
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
    const { error } = await supabase.from("societies").update(dbPatch).eq("id", id);
    if (error) throw new Error(error.message);
  }
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function createEventAction(input: {
  title: string;
  type: OrchidEvent["type"];
  startsAt: string;
  location: string;
  capacity: number;
  societyIds: string[];
}): Promise<OrchidEvent> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      event_type: input.type,
      starts_at: input.startsAt,
      location: input.location,
      capacity: input.capacity,
      society_ids: input.societyIds,
      rsvps: 0,
      checked_in: 0,
      status: "open",
      description: "",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    title: row.title as string,
    type: (row.event_type ?? row.type) as OrchidEvent["type"],
    societyIds: (row.society_ids as string[]) ?? [],
    startsAt: row.starts_at as string,
    location: row.location as string,
    capacity: row.capacity as number,
    rsvps: 0,
    checkedIn: 0,
    status: "open",
  };
}

// ── Resources ─────────────────────────────────────────────────────────────────

export async function createResourceAction(input: {
  title: string;
  category: Resource["category"];
  audience: string;
  body: string;
}): Promise<Resource> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("resources")
    .insert({
      title: input.title,
      category: input.category,
      audience: input.audience,
      body: input.body,
      published_at: today,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    title: row.title as string,
    category: row.category as Resource["category"],
    audience: row.audience as string,
    publishedAt: String(row.published_at ?? today).split("T")[0],
  };
}

// ── Forum Boards ──────────────────────────────────────────────────────────────

export async function createForumBoardAction(input: {
  name: string;
  visibility: ForumBoard["visibility"];
  societyId?: string;
  pinned?: string;
}): Promise<ForumBoard> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("forum_boards")
    .insert({
      name: input.name,
      visibility: input.visibility,
      society_id: input.societyId ?? null,
      pinned: input.pinned ?? "",
      locked: false,
      threads: 0,
      replies: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    name: row.name as string,
    visibility: row.visibility as ForumBoard["visibility"],
    societyId: row.society_id as string | undefined,
    threads: 0,
    replies: 0,
    pinned: (row.pinned ?? "") as string,
    locked: false,
  };
}

// ── Forum Threads ─────────────────────────────────────────────────────────────

export async function getForumThreadsAction(boardId: string): Promise<ForumThread[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_threads")
    .select("*")
    .eq("board_id", boardId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      boardId: r.board_id as string,
      title: r.title as string,
      body: (r.body ?? "") as string,
      authorId: r.author_id as string,
      pinned: (r.pinned ?? false) as boolean,
      locked: (r.locked ?? false) as boolean,
      createdAt: r.created_at as string,
    };
  });
}

export async function createForumThreadAction(input: {
  boardId: string;
  title: string;
  body: string;
  authorId: string;
}): Promise<ForumThread> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_threads")
    .insert({ board_id: input.boardId, author_id: input.authorId, title: input.title, body: input.body })
    .select()
    .single();
  if (error) throw new Error(error.message);
  const r = data as Record<string, unknown>;
  // Increment the board's cached thread counter
  const { data: board } = await supabase.from("forum_boards").select("threads").eq("id", input.boardId).single();
  const currentCount = ((board as Record<string, unknown>)?.threads as number) ?? 0;
  await supabase.from("forum_boards").update({ threads: currentCount + 1 }).eq("id", input.boardId);
  return {
    id: r.id as string,
    boardId: input.boardId,
    title: input.title,
    body: input.body,
    authorId: input.authorId,
    pinned: false,
    locked: false,
    createdAt: r.created_at as string,
  };
}

// ── Society Membership ────────────────────────────────────────────────────────

export async function joinSocietyAction(societyId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  // Upsert membership row (unique on profile_id — one society per user)
  const { error: memErr } = await supabase.from("memberships").upsert(
    { profile_id: userId, society_id: societyId, membership_role: "member", status: "active" },
    { onConflict: "profile_id" }
  );
  if (memErr) throw new Error(memErr.message);
  // Keep profile.society_id in sync
  const { error: profErr } = await supabase.from("profiles").update({ society_id: societyId }).eq("id", userId);
  if (profErr) throw new Error(profErr.message);
  // Bump member count
  const { data: soc } = await supabase.from("societies").select("members").eq("id", societyId).single();
  const members = ((soc as Record<string, unknown>)?.members as number ?? 0) + 1;
  await supabase.from("societies").update({ members }).eq("id", societyId);
}

// ── Event RSVPs ───────────────────────────────────────────────────────────────

export async function rsvpEventAction(
  eventId: string,
  userId: string
): Promise<"added" | "removed"> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("event_rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("profile_id", userId)
    .maybeSingle();

  const { data: ev } = await supabase.from("events").select("rsvps").eq("id", eventId).single();
  const currentRsvps = ((ev as Record<string, unknown>)?.rsvps as number) ?? 0;

  if (existing) {
    await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("profile_id", userId);
    await supabase.from("events").update({ rsvps: Math.max(0, currentRsvps - 1) }).eq("id", eventId);
    return "removed";
  } else {
    await supabase.from("event_rsvps").insert({ event_id: eventId, profile_id: userId });
    await supabase.from("events").update({ rsvps: currentRsvps + 1 }).eq("id", eventId);
    return "added";
  }
}

// ── Forum Replies ─────────────────────────────────────────────────────────────

export async function getForumRepliesAction(threadId: string): Promise<ForumReply[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("forum_replies")
    .select("id, thread_id, body, author_id, created_at, profiles(full_name)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const profile = r.profiles as Record<string, unknown> | null;
    return {
      id: r.id as string,
      threadId: r.thread_id as string,
      body: r.body as string,
      authorId: r.author_id as string,
      authorName: (profile?.full_name as string) ?? "Member",
      createdAt: r.created_at as string,
    };
  });
}

export async function createForumReplyAction(input: {
  threadId: string;
  body: string;
  authorId: string;
}): Promise<ForumReply> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_replies")
    .insert({ thread_id: input.threadId, author_id: input.authorId, body: input.body })
    .select("id, thread_id, body, author_id, created_at")
    .single();
  if (error) throw new Error(error.message);
  // Bump thread's board reply counter
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("board_id")
    .eq("id", input.threadId)
    .single();
  if (thread) {
    const { data: board } = await supabase
      .from("forum_boards")
      .select("replies")
      .eq("id", (thread as Record<string, unknown>).board_id as string)
      .single();
    const current = ((board as Record<string, unknown>)?.replies as number) ?? 0;
    await supabase
      .from("forum_boards")
      .update({ replies: current + 1 })
      .eq("id", (thread as Record<string, unknown>).board_id as string);
  }
  const r = data as Record<string, unknown>;
  return {
    id: r.id as string,
    threadId: input.threadId,
    body: input.body,
    authorId: input.authorId,
    authorName: "You",
    createdAt: r.created_at as string,
  };
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getSocietyMembersAction(societyId: string): Promise<MemberRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("id, profile_id, membership_role, status, joined_at, profiles(id, full_name, email, role, university_id, course, study_year, verified, consent_status)")
    .eq("society_id", societyId)
    .eq("status", "active")
    .order("joined_at", { ascending: false });
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const p = r.profiles as Record<string, unknown> | null;
    return {
      id: (p?.id as string) ?? (r.profile_id as string),
      name: (p?.full_name as string) ?? "Member",
      email: (p?.email as string) ?? "",
      role: (p?.role as Role) ?? "student_member",
      universityId: p?.university_id as string | undefined,
      course: p?.course as string | undefined,
      year: p?.study_year as string | undefined,
      verified: (p?.verified as boolean) ?? false,
      consentStatus: (p?.consent_status as "accepted" | "pending") ?? "pending",
      joinedAt: r.joined_at as string | undefined,
      membershipRole: r.membership_role as string | undefined,
    };
  });
}

export async function getAllProfilesAction(): Promise<MemberRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, university_id, society_id, course, study_year, verified, consent_status, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      name: (r.full_name as string) ?? "Member",
      email: (r.email as string) ?? "",
      role: (r.role as Role) ?? "student_member",
      universityId: r.university_id as string | undefined,
      societyId: r.society_id as string | undefined,
      course: r.course as string | undefined,
      year: r.study_year as string | undefined,
      verified: (r.verified as boolean) ?? false,
      consentStatus: (r.consent_status as "accepted" | "pending") ?? "pending",
      joinedAt: r.created_at as string | undefined,
    };
  });
}

export async function updateMemberRoleAction(profileId: string, role: Role): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);
  if (error) throw new Error(error.message);
}

// ── Event check-in ────────────────────────────────────────────────────────────

export async function getEventRsvpsAction(eventId: string): Promise<EventRsvpRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_rsvps")
    .select("id, event_id, profile_id, status, checked_in_at, profiles(full_name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const p = r.profiles as Record<string, unknown> | null;
    return {
      id: r.id as string,
      eventId: r.event_id as string,
      profileId: r.profile_id as string,
      profileName: (p?.full_name as string) ?? "Member",
      status: (r.status as string) ?? "confirmed",
      checkedInAt: (r.checked_in_at as string) ?? null,
    };
  });
}

export async function checkInAction(rsvpId: string, eventId: string): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error: rsvpErr } = await supabase
    .from("event_rsvps")
    .update({ checked_in_at: now, status: "checked_in" })
    .eq("id", rsvpId);
  if (rsvpErr) throw new Error(rsvpErr.message);
  // Bump event checked_in counter
  const { data: ev } = await supabase.from("events").select("checked_in").eq("id", eventId).single();
  const current = ((ev as Record<string, unknown>)?.checked_in as number) ?? 0;
  await supabase.from("events").update({ checked_in: current + 1 }).eq("id", eventId);
}

// ── Receipt upload ────────────────────────────────────────────────────────────

export async function uploadReceiptAction(formData: FormData): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("file") as File;
  const claimId = formData.get("claimId") as string;
  if (!file || file.size === 0) throw new Error("No file provided");

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.id}/${claimId ?? Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);

  // Store path on the claim
  if (claimId) {
    await supabase.from("reimbursement_claims").update({ receipt_path: path, receipt_name: file.name }).eq("id", claimId);
  }

  return path;
}

export async function getReceiptUrlAction(path: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, 3600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

// ── Password reset ─────────────────────────────────────────────────────────────

export async function sendPasswordResetAction(email: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/auth/callback?next=/dashboard`,
  });
  if (error) throw new Error(error.message);
}
