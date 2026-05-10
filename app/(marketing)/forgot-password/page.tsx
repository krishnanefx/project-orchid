import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Reset Password | Project Orchid"
};

async function forgotPasswordAction(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const headersList = await headers();
  const origin = headersList.get("origin") ?? "https://project-orchid.vercel.app";

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password`
  });

  // Always redirect to sent state (avoid email enumeration)
  redirect("/forgot-password?sent=true");
}

export default function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-on-background">
      <main className="flex-grow flex items-center justify-center orchid-gradient botanical-pattern px-4 py-12">
        <div className="max-w-md w-full">
          {/* Branding */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-4xl" aria-hidden="true">local_florist</span>
              <h1 className="font-display text-h1 text-primary">Project Orchid</h1>
            </div>
            <p className="font-label text-label uppercase tracking-widest text-on-surface-variant">
              UK Singapore Students&apos; Council
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(157,78,221,0.08)] border border-outline-variant overflow-hidden relative">
            <div className="p-8 md:p-10">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none" aria-hidden="true">
                <span className="material-symbols-outlined text-6xl">local_florist</span>
              </div>

              <SentContent searchParams={searchParams} />
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="font-label text-label text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
              Back to Login
            </Link>
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
            <a className="font-label text-label text-on-surface-variant hover:text-secondary transition-colors duration-200" href="mailto:hello@ukssc.org">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

async function SentContent({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const params = await searchParams;

  if (params.sent === "true") {
    return (
      <>
        <div className="mb-8 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">mark_email_read</span>
          </div>
          <div>
            <h2 className="font-display text-h2 text-on-surface mb-2">Check your inbox</h2>
            <p className="font-body-sm text-on-surface-variant">
              If that email is registered, we&apos;ve sent a reset link. Check your spam folder if it doesn&apos;t arrive within a few minutes.
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-[transform,box-shadow] duration-200 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
        >
          Back to Login
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display text-h2 text-on-surface mb-2">Reset your password</h2>
        <p className="font-body-sm text-on-surface-variant">
          Enter your university email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-6" action={forgotPasswordAction}>
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
        </div>

        <button
          className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-[transform,box-shadow] duration-200 flex items-center justify-center gap-2 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
          type="submit"
        >
          <div className="absolute -right-4 -bottom-4 opacity-20" aria-hidden="true">
            <span className="material-symbols-outlined text-4xl">local_florist</span>
          </div>
          Send Reset Link
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">send</span>
        </button>
      </form>
    </>
  );
}
