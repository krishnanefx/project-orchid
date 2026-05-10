"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-on-background">
      <main className="flex-grow flex items-center justify-center orchid-gradient botanical-pattern px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">local_florist</span>
              <h1 className="font-display text-h1 text-primary">Project Orchid</h1>
            </div>
            <p className="font-label text-label uppercase tracking-widest text-on-surface-variant">
              UK Singapore Students&apos; Council
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(157,78,221,0.08)] border border-outline-variant overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="mb-8">
                <h2 className="font-display text-h2 text-on-surface mb-2">Set New Password</h2>
                <p className="font-body-sm text-on-surface-variant">Choose a strong password for your account.</p>
              </div>

              {status === "success" ? (
                <div>
                  <div className="mb-6 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                    Password updated successfully.
                  </div>
                  <Link
                    href="/dashboard"
                    className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 text-center block"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {status === "error" && (
                    <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                      {errorMsg}
                    </div>
                  )}
                  <div>
                    <label className="block font-label text-label text-on-surface mb-2" htmlFor="password">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all duration-200"
                        id="password"
                        name="password"
                        type="password"
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label text-label text-on-surface mb-2" htmlFor="confirm">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-on-surface-variant">lock_reset</span>
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none transition-all duration-200"
                        id="confirm"
                        name="confirm"
                        type="password"
                        placeholder="Re-enter your new password"
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      className="w-full bg-primary text-on-primary font-display font-bold py-4 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? "Updating…" : "Update Password"}
                      {status !== "loading" && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-outline-variant text-center">
                <Link href="/login" className="font-label text-label text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
