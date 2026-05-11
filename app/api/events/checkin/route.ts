import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as Record<string, unknown> | null)?.role as string | undefined;
  const canCheckIn = role && ["super_admin", "ukssc_staff", "society_admin"].includes(role);
  if (!canCheckIn) {
    return NextResponse.json({ error: "Insufficient permissions to check in attendees" }, { status: 403 });
  }

  const body = await request.json() as { eventId: string; profileId: string };
  const { eventId, profileId } = body;

  if (!eventId || !profileId) {
    return NextResponse.json({ error: "eventId and profileId are required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { error: rsvpErr } = await supabase
    .from("event_rsvps")
    .update({ checked_in_at: now, status: "checked_in" })
    .eq("event_id", eventId)
    .eq("profile_id", profileId);

  if (rsvpErr) {
    return NextResponse.json({ error: rsvpErr.message }, { status: 500 });
  }

  // Increment the event's checked_in counter
  const { data: ev } = await supabase
    .from("events")
    .select("checked_in")
    .eq("id", eventId)
    .single();

  const current = ((ev as Record<string, unknown> | null)?.checked_in as number) ?? 0;
  await supabase.from("events").update({ checked_in: current + 1 }).eq("id", eventId);

  // Write audit log
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "check_in",
    entity_type: "event_rsvp",
    entity_id: eventId,
    metadata: { profile_id: profileId, checked_in_at: now },
  });

  return NextResponse.json({ success: true, checkedInAt: now });
}
