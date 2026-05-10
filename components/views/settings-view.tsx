"use client";

import { FloppyDisk, User } from "@phosphor-icons/react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { updateProfileAction } from "@/lib/actions";
import { universities } from "@/lib/data";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
  borderRadius: 8,
  fontSize: 14,
  color: "var(--on-surface)",
  background: "var(--surface-bright, #fff)",
  outline: "none",
  boxSizing: "border-box",
};

const ROLE_LABELS: Record<string, string> = {
  student_member: "Student Member",
  ukssc_staff: "UKSSC EXCO",
  alumni: "Alumni",
  super_admin: "Super Admin",
  society_admin: "Society Admin",
  finance_reviewer: "Finance Reviewer",
  sponsor: "Sponsor",
};

const STUDY_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Masters", "PhD", "Other"];

export function SettingsView() {
  const { currentUser, setCurrentUser, localSocieties, announce } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [course, setCourse] = useState(currentUser.course ?? "");
  const [year, setYear] = useState(currentUser.year ?? "");
  const [dietary, setDietary] = useState(currentUser.dietaryNeeds ?? "");
  const [accessibility, setAccessibility] = useState(currentUser.accessibilityNeeds ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const university = universities.find((u) => u.id === currentUser.universityId);
  const mySociety = localSocieties.find((s) => s.id === currentUser.societyId);

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  async function handleSave() {
    if (!name.trim()) {
      announce("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setSaved(false);

    const patch = {
      fullName: name.trim(),
      course: course.trim() || undefined,
      studyYear: year || undefined,
      dietaryNeeds: dietary.trim() || undefined,
      accessibilityNeeds: accessibility.trim() || undefined,
    };

    setCurrentUser({ ...currentUser, name: name.trim(), course: course.trim() || undefined, year: year || undefined, dietaryNeeds: dietary.trim() || undefined, accessibilityNeeds: accessibility.trim() || undefined });

    try {
      await updateProfileAction(currentUser.id, patch);
      setSaved(true);
      announce("Profile updated.");
    } catch {
      announce("Failed to save — changes applied locally only.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="stitch-main">
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--on-surface)", marginBottom: 4 }}>
            Profile Settings
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Your personal details are used across the platform to personalise your experience.
          </p>
        </div>

        {/* Identity card */}
        <div className="stitch-card" style={{ padding: 24, marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "var(--primary-soft)",
            border: "3px solid var(--primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: "var(--primary)", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--on-surface)" }}>{currentUser.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{currentUser.email}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)" }}>
                {ROLE_LABELS[currentUser.role] ?? currentUser.role}
              </span>
              {university && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "var(--surface-container)", color: "var(--muted)" }}>
                  {university.name}
                </span>
              )}
              {mySociety && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "var(--secondary-container)", color: "var(--on-secondary-container)" }}>
                  {mySociety.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="stitch-card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--on-surface)", marginBottom: 20 }}>
            Personal Details
          </h3>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Full Name
              </label>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Email
              </label>
              <input
                style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                value={currentUser.email}
                disabled
              />
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Email is managed through your authentication provider.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Course / Degree
                </label>
                <input
                  style={inputStyle}
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. BSc Computer Science"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Year of Study
                </label>
                <select style={inputStyle} value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Select year…</option>
                  {STUDY_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Welfare fields */}
        <div className="stitch-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--on-surface)", marginBottom: 6 }}>
            Welfare &amp; Accessibility
          </h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
            Shared with event organisers only, to help us accommodate you at UKSSC events.
          </p>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Dietary Requirements
              </label>
              <input
                style={inputStyle}
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Halal, Vegetarian, No nuts"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Accessibility Needs
              </label>
              <input
                style={inputStyle}
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                placeholder="e.g. Wheelchair access, BSL interpreter"
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="stitch-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px" }}
          >
            {saving ? (
              "Saving…"
            ) : saved ? (
              <><User size={15} weight="fill" /> Saved!</>
            ) : (
              <><FloppyDisk size={15} /> Save Profile</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
