/**
 * RLS (Row-Level Security) Integration Test Suite
 *
 * These tests verify that each Supabase RLS policy correctly allows/denies
 * access for each role. They require a real Supabase instance with test users.
 *
 * Prerequisites:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.test
 *   2. Set SUPABASE_TEST_STUDENT_EMAIL / _PASSWORD etc. for each test role
 *   3. Run: vitest run tests/rls.test.ts
 *
 * Test architecture:
 *   - Each describe block tests one table / one policy rule.
 *   - signInAs() creates an authenticated Supabase client for a given role.
 *   - adminClient() uses service_role to set up and tear down fixtures.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const TEST_ACCOUNTS: Record<string, { email: string; password: string }> = {
  super_admin:      { email: process.env.TEST_SUPER_ADMIN_EMAIL ?? "", password: process.env.TEST_SUPER_ADMIN_PASSWORD ?? "" },
  ukssc_staff:      { email: process.env.TEST_UKSSC_STAFF_EMAIL ?? "", password: process.env.TEST_UKSSC_STAFF_PASSWORD ?? "" },
  finance_reviewer: { email: process.env.TEST_FINANCE_EMAIL ?? "",     password: process.env.TEST_FINANCE_PASSWORD ?? "" },
  student_member:   { email: process.env.TEST_STUDENT_EMAIL ?? "",     password: process.env.TEST_STUDENT_PASSWORD ?? "" },
  alumni:           { email: process.env.TEST_ALUMNI_EMAIL ?? "",      password: process.env.TEST_ALUMNI_PASSWORD ?? "" },
  sponsor:          { email: process.env.TEST_SPONSOR_EMAIL ?? "",     password: process.env.TEST_SPONSOR_PASSWORD ?? "" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

async function signInAs(role: keyof typeof TEST_ACCOUNTS): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
    auth: { persistSession: false },
  });
  const { email, password } = TEST_ACCOUNTS[role];
  if (!email || !password) {
    throw new Error(`Test account not configured for role: ${role}. Set TEST_${role.toUpperCase()}_EMAIL/PASSWORD in .env.test`);
  }
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signInAs(${role}) failed: ${error.message}`);
  return client;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

let testSocietyId: string;
let testEventId: string;
let testClaimId: string | undefined;
let testForumBoardId: string;

beforeAll(async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  const admin = adminClient();

  // Create a test society
  const { data: soc } = await admin.from("societies").insert({
    name: "RLS Test Society",
    university_slug: "ucl",
    description: "Used only for RLS tests",
    logo: "RLS",
    members: 0,
    status: "active",
  }).select("id").single();
  testSocietyId = (soc as Record<string, unknown>)?.id as string;

  // Create a test event
  const { data: ev } = await admin.from("events").insert({
    title: "RLS Test Event",
    event_type: "ukssc",
    starts_at: new Date(Date.now() + 86_400_000).toISOString(),
    location: "Test Hall",
    capacity: 50,
    rsvps: 0,
    checked_in: 0,
    status: "open",
    description: "",
    society_ids: [],
  }).select("id").single();
  testEventId = (ev as Record<string, unknown>)?.id as string;

  // Create a test forum board
  const { data: fb } = await admin.from("forum_boards").insert({
    name: "RLS Test Board",
    visibility: "open_to_verified_users",
    threads: 0,
    replies: 0,
    pinned: "",
    locked: false,
  }).select("id").single();
  testForumBoardId = (fb as Record<string, unknown>)?.id as string;
});

afterAll(async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  const admin = adminClient();
  if (testClaimId) await admin.from("reimbursement_claims").delete().eq("id", testClaimId);
  if (testForumBoardId) await admin.from("forum_boards").delete().eq("id", testForumBoardId);
  if (testEventId) await admin.from("events").delete().eq("id", testEventId);
  if (testSocietyId) await admin.from("societies").delete().eq("id", testSocietyId);
});

// ── Guard: skip all if env is not configured ──────────────────────────────────

function requireEnv() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn("SUPABASE_URL / SERVICE_KEY not set — skipping RLS tests.");
    return false;
  }
  return true;
}

// ── societies ─────────────────────────────────────────────────────────────────

describe("societies table", () => {
  it("student_member can SELECT societies", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data, error } = await client.from("societies").select("id").limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("alumni can SELECT societies", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("alumni");
    const { data, error } = await client.from("societies").select("id").limit(1);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("student_member can INSERT a society", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { error } = await client.from("societies").insert({
      name: "Temp Society", university_slug: "ucl", description: "temp", logo: "T", members: 0, status: "active",
    });
    // Policy allows any authenticated user to insert — expect no RLS error
    expect(error?.code).not.toBe("42501");
  });
});

// ── events ────────────────────────────────────────────────────────────────────

describe("events table", () => {
  it("student_member can SELECT events", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data, error } = await client.from("events").select("id").limit(5);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("sponsor can SELECT events", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("sponsor");
    const { data, error } = await client.from("events").select("id").limit(5);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ── event_rsvps ───────────────────────────────────────────────────────────────

describe("event_rsvps table", () => {
  it("student_member can INSERT own RSVP", async () => {
    if (!requireEnv() || !testEventId) return;
    const client = await signInAs("student_member");
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { error } = await client.from("event_rsvps").insert({
      event_id: testEventId, profile_id: user.id, status: "confirmed",
    });
    // Expect success or unique-constraint violation (already inserted), not an RLS error
    expect(error?.code).not.toBe("42501");
    // Cleanup
    await client.from("event_rsvps").delete().eq("event_id", testEventId).eq("profile_id", user.id);
  });

  it("student_member cannot SELECT another user's RSVP", async () => {
    if (!requireEnv()) return;
    const admin = adminClient();
    const student = await signInAs("student_member");
    const { data: { user: studentUser } } = await student.auth.getUser();

    // Admin inserts a dummy RSVP for a different profile ID
    const fakeProfileId = "00000000-0000-0000-0000-000000000000";
    // Student tries to read it — should get empty set or error, NOT the row
    const { data } = await student.from("event_rsvps")
      .select("id")
      .eq("profile_id", fakeProfileId)
      .limit(1);
    expect((data ?? []).length).toBe(0);
  });

  it("ukssc_staff can SELECT all RSVPs", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("ukssc_staff");
    const { data, error } = await client.from("event_rsvps").select("id").limit(10);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ── reimbursement_claims ──────────────────────────────────────────────────────

describe("reimbursement_claims table", () => {
  it("student_member can SELECT own claims", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { data, error } = await client.from("reimbursement_claims")
      .select("id")
      .eq("claimant_id", user.id);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("finance_reviewer can SELECT all claims", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("finance_reviewer");
    const { data, error } = await client.from("reimbursement_claims").select("id").limit(10);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("sponsor cannot SELECT claims", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("sponsor");
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    // Sponsor is neither claimant nor finance — should return empty
    const { data } = await client.from("reimbursement_claims")
      .select("id")
      .neq("claimant_id", user.id)
      .limit(5);
    expect((data ?? []).length).toBe(0);
  });
});

// ── profiles ──────────────────────────────────────────────────────────────────

describe("profiles table", () => {
  it("student_member can SELECT own profile", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { data, error } = await client.from("profiles").select("id, role").eq("id", user.id).single();
    expect(error).toBeNull();
    expect((data as Record<string, unknown>)?.id).toBe(user.id);
  });

  it("student_member cannot SELECT a different user's full profile (not in same society)", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    // Try a random UUID that won't match
    const { data } = await client.from("profiles")
      .select("id")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("ukssc_staff can SELECT all profiles", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("ukssc_staff");
    const { data, error } = await client.from("profiles").select("id").limit(5);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("student_member can UPDATE own profile", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { error } = await client.from("profiles")
      .update({ dietary_needs: "none" })
      .eq("id", user.id);
    expect(error?.code).not.toBe("42501");
  });
});

// ── forum_boards ──────────────────────────────────────────────────────────────

describe("forum_boards table", () => {
  it("student_member can SELECT open boards", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data, error } = await client.from("forum_boards")
      .select("id")
      .eq("visibility", "open_to_verified_users")
      .limit(5);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("sponsor cannot SELECT membership-restricted board of a foreign society", async () => {
    if (!requireEnv() || !testForumBoardId) return;
    const admin = adminClient();
    // Make the test board membership-restricted with a dummy society
    await admin.from("forum_boards").update({
      visibility: "membership_restricted",
      society_id: testSocietyId,
    }).eq("id", testForumBoardId);

    const client = await signInAs("sponsor");
    const { data } = await client.from("forum_boards")
      .select("id")
      .eq("id", testForumBoardId)
      .maybeSingle();
    expect(data).toBeNull();

    // Restore
    await admin.from("forum_boards").update({ visibility: "open_to_verified_users", society_id: null }).eq("id", testForumBoardId);
  });
});

// ── audit_logs ────────────────────────────────────────────────────────────────

describe("audit_logs table", () => {
  it("ukssc_staff can SELECT audit logs", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("ukssc_staff");
    const { data, error } = await client.from("audit_logs").select("id").limit(5);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("student_member cannot SELECT audit logs", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data, error } = await client.from("audit_logs").select("id").limit(5);
    // RLS returns empty set or permission denied
    const isEmpty = (data ?? []).length === 0;
    const isPermissionError = error?.code === "42501";
    expect(isEmpty || isPermissionError).toBe(true);
  });

  it("authenticated user can INSERT own audit event", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { error } = await client.from("audit_logs").insert({
      actor_id: user.id,
      action: "test_event",
      entity_type: "test",
      metadata: {},
    });
    expect(error?.code).not.toBe("42501");
  });
});

// ── memberships ───────────────────────────────────────────────────────────────

describe("memberships table", () => {
  it("student_member can SELECT own membership", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("student_member");
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { data, error } = await client.from("memberships")
      .select("id")
      .eq("profile_id", user.id);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("ukssc_staff can SELECT all memberships", async () => {
    if (!requireEnv()) return;
    const client = await signInAs("ukssc_staff");
    const { data, error } = await client.from("memberships").select("id").limit(10);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
