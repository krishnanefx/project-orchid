import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Join Project Orchid",
  description: "Create your Project Orchid account and connect with Singaporean student societies across the UK."
};

async function registerAction(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const societyId = formData.get("societyId") as string | null;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, society_id: societyId || undefined }
    }
  });

  if (error) {
    const qs = societyId ? `&society=${encodeURIComponent(societyId)}` : "";
    redirect(`/register?error=${encodeURIComponent(error.message)}${qs}`);
  }

  redirect("/login?registered=true");
}

async function getSocietyName(id: string): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("societies").select("name").eq("id", id).single();
    return (data as Record<string, unknown> | null)?.name as string ?? null;
  } catch {
    return null;
  }
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; society?: string }> }) {
  const { error, society: societyId } = await searchParams;
  const societyName = societyId ? await getSocietyName(societyId) : null;
  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-on-background">
      <main className="flex-grow flex items-center justify-center orchid-gradient botanical-pattern px-4 py-12">
        <div className="max-w-md w-full">
          {/* Branding */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">local_florist</span>
              <h1 className="font-display text-h1 text-primary">Project Orchid</h1>
            </div>
            <p className="font-label text-label uppercase tracking-widest text-on-surface-variant">
              UK Singapore Students&apos; Council
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(157,78,221,0.08)] border border-outline-variant overflow-hidden relative">
            <div className="p-8 md:p-10">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none" aria-hidden="true">
                <span className="material-symbols-outlined text-6xl">local_florist</span>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-h2 text-on-surface mb-2">Join the community</h2>
                <p className="font-body-sm text-on-surface-variant">Create your profile and connect with Singaporean students across the UK.</p>
              </div>

              {societyId && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5" aria-hidden="true">group_add</span>
                  <div>
                    <p className="font-label text-label text-primary font-semibold">Society invite</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {societyName
                        ? <>You&apos;ve been invited to join <span className="font-semibold text-on-surface">{societyName}</span>. Create an account to accept.</>
                        : <>You&apos;ve been invited to join a society. Create an account to accept.</>}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {decodeURIComponent(error)}
                </div>
              )}
              <form className="space-y-5" action={registerAction}>
                {societyId && <input type="hidden" name="societyId" value={societyId} />}
                <div>
                  <label className="block font-label text-label text-on-surface mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">person</span>
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-colors duration-200"
                      id="name"
                      name="name"
                      placeholder="Tan Wei Ming"
                      required
                      type="text"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-label text-on-surface mb-2" htmlFor="email">
                    University Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">alternate_email</span>
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-colors duration-200"
                      id="email"
                      name="email"
                      placeholder="yourname@university.ac.uk"
                      required
                      type="email"
                      autoComplete="email"
                    />
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant italic">
                    Please use your verified .ac.uk or .edu.sg address.
                  </p>
                </div>

                <div>
                  <label className="block font-label text-label text-on-surface mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">lock</span>
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-colors duration-200"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-[transform,box-shadow] duration-200 flex items-center justify-center gap-2 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                    type="submit"
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-20" aria-hidden="true">
                      <span className="material-symbols-outlined text-4xl">local_florist</span>
                    </div>
                    Create Account
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
                  </button>
                </div>
              </form>

              <div className="mt-10 pt-8 border-t border-outline-variant text-center">
                <p className="font-body-sm text-on-surface-variant mb-4">Already have an account?</p>
                <Link
                  href="/login"
                  className="w-full border-2 border-secondary text-secondary font-display font-bold py-3 rounded-lg hover:bg-secondary-container transition-colors duration-200 block text-center"
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="mt-8 flex items-center justify-center gap-4 text-on-surface-variant opacity-60">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">verified_user</span>
              <span className="font-label text-[10px] uppercase">Secure Signup</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-outline" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">encrypted</span>
              <span className="font-label text-[10px] uppercase">Data Protected</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-on-surface-variant text-center md:text-left">
            © 2024 UK Singapore Students&apos; Council (UKSSC). Built for the Orchid Community.
          </p>
          <div className="flex gap-6">
            <a className="font-label text-label text-on-surface-variant hover:text-secondary transition-colors duration-200" href="/privacy">Privacy Policy</a>
            <a className="font-label text-label text-on-surface-variant hover:text-secondary transition-colors duration-200" href="mailto:hello@ukssc.org">Support Center</a>
            <a className="font-label text-label text-on-surface-variant hover:text-secondary transition-colors duration-200" href="mailto:hello@ukssc.org">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
