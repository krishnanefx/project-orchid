import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | Project Orchid"
};

async function loginAction(_formData: FormData) {
  "use server";
  // TODO: validate credentials with Supabase Auth
  redirect("/dashboard");
}

export default function LoginPage() {
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

          {/* Login Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(157,78,221,0.08)] border border-outline-variant overflow-hidden relative">
            <div className="p-8 md:p-10">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-6xl">local_florist</span>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-h2 text-on-surface mb-2">Welcome Back</h2>
                <p className="font-body-sm text-on-surface-variant">Access your community dashboard and society hubs.</p>
              </div>

              <form className="space-y-6" action={loginAction}>
                <div>
                  <label className="block font-label text-label text-on-surface mb-2" htmlFor="email">
                    University Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant">alternate_email</span>
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all duration-200"
                      id="email"
                      name="email"
                      placeholder="yourname@university.ac.uk"
                      required
                      type="email"
                    />
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant italic">
                    Please use your verified .ac.uk or .edu.sg address.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-label text-label text-on-surface" htmlFor="password">
                      Password
                    </label>
                    <a className="font-label text-label text-primary hover:text-primary-container transition-colors duration-200" href="#">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all duration-200"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      required
                      type="password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-lg shadow-sm hover:translate-y-[-4px] hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden"
                    type="submit"
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-20">
                      <span className="material-symbols-outlined text-4xl">local_florist</span>
                    </div>
                    Login
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              </form>

              <div className="mt-10 pt-8 border-t border-outline-variant text-center">
                <p className="font-body-sm text-on-surface-variant mb-4">New to the orchid network?</p>
                <button
                  type="button"
                  className="w-full border-2 border-secondary text-secondary font-display font-bold py-3 rounded-lg hover:bg-secondary-container transition-all duration-200"
                >
                  Join Project Orchid
                </button>
              </div>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="mt-8 flex items-center justify-center gap-4 text-on-surface-variant opacity-60">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="font-label text-[10px] uppercase">Secure Login</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-outline" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">encrypted</span>
              <span className="font-label text-[10px] uppercase">Data Protected</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-gutter py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-sm text-on-surface-variant text-center md:text-left">
            © 2024 UK Singapore Students&apos; Council (UKSSC). Built for the Orchid Community.
          </p>
          <div className="flex gap-6">
            <a className="font-label text-label text-on-surface-variant hover:text-secondary transition-all duration-200" href="#">Privacy Policy</a>
            <a className="font-label text-label text-on-surface-variant hover:text-secondary transition-all duration-200" href="#">Support Center</a>
            <a className="font-label text-label text-on-surface-variant hover:text-secondary transition-all duration-200" href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
