"use client";

import { ArrowLeft, CheckCircle, DownloadSimple, MagnifyingGlass, ShieldCheck, ShieldCheckered } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { getProfilesAction, updateMemberRoleAction, verifyMemberAction } from "@/lib/actions";
import { universities } from "@/lib/data";
import { downloadCsv } from "@/lib/utils";
import type { Profile, Role } from "@/lib/types";

const ROLES: Role[] = ["student_member", "society_admin", "finance_reviewer", "ukssc_staff", "alumni", "sponsor", "super_admin"];

const ROLE_LABELS: Record<Role, string> = {
  student_member: "Student",
  society_admin: "Society Admin",
  finance_reviewer: "Finance Reviewer",
  ukssc_staff: "UKSSC Staff",
  alumni: "Alumni",
  sponsor: "Sponsor",
  super_admin: "Super Admin",
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  super_admin: { bg: "oklch(0.92 0.06 295)", color: "oklch(0.42 0.18 295)" },
  ukssc_staff: { bg: "var(--primary-soft)", color: "var(--primary)" },
  society_admin: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  finance_reviewer: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
  student_member: { bg: "var(--surface-container)", color: "var(--muted)" },
  alumni: { bg: "var(--surface-container)", color: "var(--muted)" },
  sponsor: { bg: "var(--surface-container)", color: "var(--muted)" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

type StatusTab = "all" | "unverified" | "pending_consent";

export function AdminMembers() {
  const { setView, localSocieties, announce } = useApp();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [uniFilter, setUniFilter] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bulkVerifying, setBulkVerifying] = useState(false);

  useEffect(() => {
    getProfilesAction(200)
      .then(setMembers)
      .catch(() => announce("Failed to load members."))
      .finally(() => setLoading(false));
  }, [announce]);

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || m.role === roleFilter;
    const matchUni = !uniFilter || m.universityId === uniFilter;
    const matchStatus =
      statusTab === "all" ? true :
      statusTab === "unverified" ? !m.verified :
      m.consentStatus !== "accepted";
    return matchSearch && matchRole && matchUni && matchStatus;
  });

  async function handleRoleChange(userId: string, role: Role) {
    setUpdatingId(userId);
    const previousRole = members.find((m) => m.id === userId)?.role;
    setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, role } : m));
    try {
      await updateMemberRoleAction(userId, role);
      announce(`Role updated to ${ROLE_LABELS[role]}.`);
    } catch {
      if (previousRole) {
        setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, role: previousRole } : m));
      }
      announce("Failed to update role — please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleVerify(userId: string, name: string) {
    setUpdatingId(userId);
    const wasVerified = members.find((m) => m.id === userId)?.verified ?? false;
    setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, verified: true } : m));
    try {
      await verifyMemberAction(userId);
      announce(`${name} verified.`);
    } catch {
      setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, verified: wasVerified } : m));
      announce("Failed to verify — please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleBulkVerify() {
    const targets = filtered.filter((m) => !m.verified);
    if (!targets.length) return;
    setBulkVerifying(true);
    // Optimistic update
    setMembers((prev) => prev.map((m) => targets.find((t) => t.id === m.id) ? { ...m, verified: true } : m));
    let failed = 0;
    await Promise.all(targets.map((m) =>
      verifyMemberAction(m.id).catch(() => { failed++; })
    ));
    setBulkVerifying(false);
    if (failed > 0) {
      announce(`${targets.length - failed} verified, ${failed} failed. Refresh to retry.`);
    } else {
      announce(`${targets.length} ${targets.length === 1 ? "member" : "members"} verified.`);
    }
  }

  function exportMembers() {
    downloadCsv("orchid-members.csv", [
      ["Name", "Email", "Role", "University", "Society", "Verified", "Consent"],
      ...filtered.map((m) => {
        const uni = universities.find((u) => u.id === m.universityId);
        const soc = localSocieties.find((s) => s.id === m.societyId);
        return [m.name, m.email, ROLE_LABELS[m.role], uni?.name ?? "", soc?.name ?? "", m.verified ? "Yes" : "No", m.consentStatus];
      }),
    ]);
    announce("Members CSV exported.");
  }

  const unverifiedCount = members.filter((m) => !m.verified).length;
  const pendingConsentCount = members.filter((m) => m.consentStatus === "pending").length;

  return (
    <main className="stitch-main">
      <button
        type="button"
        className="stitch-nav-item"
        style={{ display: "inline-flex", width: "auto", marginBottom: 8 }}
        onClick={() => setView("admin")}
      >
        <ArrowLeft size={16} />
        <span>Admin</span>
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--on-surface)", marginBottom: 4 }}>
            Members
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            {loading ? "Loading…" : `${members.length} registered ${members.length === 1 ? "member" : "members"}`}
          </p>
        </div>
        <button type="button" className="stitch-secondary" onClick={exportMembers} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <DownloadSimple size={15} /> Export CSV
        </button>
      </div>

      {/* Status tabs */}
      <div className="category-row" style={{ marginBottom: 16 }}>
        {(["all", "unverified", "pending_consent"] as StatusTab[]).map((tab) => {
          const count = tab === "all" ? members.length : tab === "unverified" ? unverifiedCount : pendingConsentCount;
          const label = tab === "all" ? "All" : tab === "unverified" ? "Unverified" : "Pending Consent";
          return (
            <button
              key={tab}
              type="button"
              className={statusTab === tab ? "active" : ""}
              onClick={() => setStatusTab(tab)}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              {label}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: statusTab === tab ? "rgba(255,255,255,0.3)" : "var(--surface-container)", color: statusTab === tab ? "inherit" : "var(--muted)" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <MagnifyingGlass size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: "100%",
              padding: "9px 12px 9px 30px",
              border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--on-surface)",
              background: "var(--surface-bright)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "")}
          style={{
            padding: "9px 12px",
            border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--on-surface)",
            background: "var(--surface-bright)",
            outline: "none",
          }}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select
          value={uniFilter}
          onChange={(e) => setUniFilter(e.target.value)}
          style={{
            padding: "9px 12px",
            border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--on-surface)",
            background: "var(--surface-bright)",
            outline: "none",
          }}
        >
          <option value="">All universities</option>
          {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        {statusTab === "unverified" && filtered.some((m) => !m.verified) && (
          <button
            type="button"
            onClick={handleBulkVerify}
            disabled={bulkVerifying}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 14px", borderRadius: 8,
              background: "var(--secondary-container)", color: "var(--on-secondary-container)",
              border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              opacity: bulkVerifying ? 0.6 : 1, whiteSpace: "nowrap",
            }}
          >
            <ShieldCheckered size={15} weight="fill" />
            {bulkVerifying ? "Verifying…" : `Verify All (${filtered.filter((m) => !m.verified).length})`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="stitch-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Loading members…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>
              {statusTab === "unverified" ? "✅" : statusTab === "pending_consent" ? "📋" : "🔍"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", marginBottom: 6 }}>
              {members.length === 0
                ? "No members yet"
                : statusTab === "unverified"
                ? "All members verified"
                : statusTab === "pending_consent"
                ? "All consent forms accepted"
                : "No members match your filters"}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {members.length === 0
                ? "Members will appear here once they sign up."
                : statusTab !== "all"
                ? "Switch to All to see every member."
                : "Try adjusting your search or filters."}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--outline-variant, rgba(208,194,213,0.3))", background: "var(--surface-container, #faf7fb)" }}>
                  {["Member", "Role", "University / Society", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, i) => {
                  const uni = universities.find((u) => u.id === member.universityId);
                  const soc = localSocieties.find((s) => s.id === member.societyId);
                  const colors = ROLE_COLORS[member.role] ?? ROLE_COLORS.student_member;
                  const isUpdating = updatingId === member.id;
                  return (
                    <tr
                      key={member.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? "1px solid var(--outline-variant, rgba(208,194,213,0.2))" : "none",
                        opacity: isUpdating ? 0.6 : 1,
                        transition: "opacity 150ms ease",
                      }}
                    >
                      {/* Member */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "var(--primary-soft)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800, color: "var(--primary)", flexShrink: 0,
                          }}>
                            {initials(member.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)" }}>{member.name || "(No name)"}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{member.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                          disabled={isUpdating}
                          aria-label={`Role for ${member.name}`}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1.5px solid transparent",
                            background: colors.bg,
                            color: colors.color,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                      </td>

                      {/* University / Society */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, color: "var(--on-surface)" }}>{uni?.name ?? <span style={{ color: "var(--muted)" }}>Unknown</span>}</div>
                        {soc && <div style={{ fontSize: 11, color: "var(--muted)" }}>{soc.name}</div>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                            background: member.verified ? "var(--secondary-container)" : "var(--warning-bg)",
                            color: member.verified ? "var(--on-secondary-container)" : "var(--warning-text)",
                            width: "fit-content",
                          }}>
                            {member.verified && <CheckCircle size={10} weight="fill" />}
                            {member.verified ? "Verified" : "Unverified"}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                            background: "var(--surface-container)", color: "var(--muted)",
                            width: "fit-content",
                          }}>
                            {member.consentStatus === "accepted" ? "Consented" : "Pending consent"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 16px" }}>
                        {!member.verified && (
                          <button
                            type="button"
                            onClick={() => handleVerify(member.id, member.name)}
                            disabled={isUpdating}
                            style={{
                              display: "flex", alignItems: "center", gap: 5,
                              fontSize: 11, fontWeight: 700,
                              padding: "5px 10px", borderRadius: 6,
                              border: "1.5px solid var(--primary)",
                              background: "var(--primary-soft)", color: "var(--primary)",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <ShieldCheck size={12} weight="fill" />
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, textAlign: "right" }}>
          Showing {filtered.length} of {members.length} members
        </p>
      )}
    </main>
  );
}
