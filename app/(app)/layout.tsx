import "@/app/globals.css";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase-server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Skip auth guard in demo mode (no Supabase credentials configured)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
  }

  return <>{children}</>;
}
