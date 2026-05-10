import { OrchidApp } from "@/components/orchid-app";
import { createClient } from "@/lib/supabase-server";
import { getSocieties, getEvents, getForumBoards, getResources, getClaims, getProfile, getUserRsvpIds } from "@/lib/orchid-service";
import type { ForumBoard, OrchidEvent, ReimbursementClaim, Resource, Society } from "@/lib/types";

export const metadata = {
  title: "Dashboard | Project Orchid"
};

const EMPTY = {
  initialUser: null,
  initialSocieties: [] as Society[],
  initialClaims: [] as ReimbursementClaim[],
  initialEvents: [] as OrchidEvent[],
  initialForums: [] as ForumBoard[],
  initialResources: [] as Resource[],
  initialRsvpIds: [] as string[],
};

export default async function DashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <OrchidApp {...EMPTY} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = user ? await getProfile(user.id) : null;

  const [societies, events, forums, resources, claims, rsvpIds] = await Promise.all([
    getSocieties(),
    getEvents(),
    getForumBoards(),
    getResources(),
    getClaims(profile?.societyId),
    user ? getUserRsvpIds(user.id) : Promise.resolve([]),
  ]);

  return (
    <OrchidApp
      initialUser={profile}
      initialSocieties={societies}
      initialClaims={claims}
      initialEvents={events}
      initialForums={forums}
      initialResources={resources}
      initialRsvpIds={rsvpIds}
    />
  );
}
