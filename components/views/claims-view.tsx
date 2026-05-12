"use client";

import { DownloadSimple, FileArrowUp } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useApp } from "@/lib/app-context";
import { submitClaimAction, updateClaimStatusAction } from "@/lib/actions";
import type { ClaimStatus } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";
import { PageHeader } from "@/components/ui/primitives";

const CLAIM_NOTES_KEY = "orchid-claim-notes";

const claimSchema = z.object({
  purpose: z.string().trim().min(3, "Purpose must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be greater than zero").finite("Enter a valid number")
});

const STATUS_FILTER_OPTIONS = ["All", "submitted", "under_review", "approved", "rejected", "paid"] as const;
type StatusFilter = typeof STATUS_FILTER_OPTIONS[number];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  submitted: { bg: "var(--primary-soft)", color: "var(--primary)" },
  under_review: { bg: "#fff3cd", color: "#856404" },
  approved: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  rejected: { bg: "#ffe4e4", color: "#c0392b" },
  paid: { bg: "var(--surface-container)", color: "var(--muted)" },
};

function NoteEditor({ initial, onSave, onCancel }: { initial: string; onSave: (v: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState(initial);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={2}
        placeholder="Reason for rejection or request for info…"
        style={{
          fontSize: 12, padding: "6px 8px", borderRadius: 6, resize: "vertical", fontFamily: "inherit",
          border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
          background: "var(--surface-bright, #fff)", color: "var(--on-surface)", outline: "none",
          width: "100%", boxSizing: "border-box",
        }}
        autoFocus
      />
      <div style={{ display: "flex", gap: 4 }}>
        <button type="button" onClick={() => onSave(val)} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5, background: "var(--primary)", color: "#fff", border: "none", cursor: "pointer" }}>Save</button>
        <button type="button" onClick={onCancel} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 5, background: "none", border: "1px solid rgba(208,194,213,0.5)", cursor: "pointer", color: "var(--muted)" }}>Cancel</button>
      </div>
    </div>
  );
}

export function ClaimsView() {
  const { localClaims, setLocalClaims, claimStatuses, setClaimStatuses, announce, currentUser, can } = useApp();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{ purpose?: string; amount?: string }>({});
  const [claimNotes, setClaimNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const purposeRef = useRef<HTMLInputElement>(null);

  const isReviewer = ["finance_reviewer", "ukssc_staff", "super_admin"].includes(currentUser.role);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLAIM_NOTES_KEY);
      if (stored) setClaimNotes(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  function saveNote(claimId: string, note: string) {
    const next = { ...claimNotes, [claimId]: note };
    setClaimNotes(next);
    setEditingNoteId(null);
    try { localStorage.setItem(CLAIM_NOTES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    announce("Note saved.");
  }

  function submitClaim() {
    const result = claimSchema.safeParse({ purpose, amount });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setFormErrors({ purpose: fieldErrors.purpose?.[0], amount: fieldErrors.amount?.[0] });
      announce("Fix the errors below before submitting.");
      return;
    }

    if (!currentUser.societyId) {
      announce("You must be affiliated with a society to submit a claim.");
      return;
    }

    setFormErrors({});
    const today = new Date().toISOString().slice(0, 10);
    const receiptName = receiptFile?.name ?? "receipt";

    const optimistic = {
      id: `claim-${Date.now()}`,
      claimant: currentUser.name,
      societyId: currentUser.societyId,
      amount: result.data.amount,
      purpose: result.data.purpose,
      status: "submitted" as ClaimStatus,
      submittedAt: today,
      receiptName,
    };

    setLocalClaims([optimistic, ...localClaims]);
    setPurpose("");
    setAmount("");
    setReceiptFile(null);
    announce("Reimbursement claim submitted to UKSSC finance.");

    submitClaimAction(
      { claimant: currentUser.name, societyId: currentUser.societyId, amount: result.data.amount, purpose: result.data.purpose, receiptName },
      currentUser.id
    ).catch(() => announce("Claim saved locally but failed to sync. Please refresh."));
  }

  function updateStatus(claimId: string, newStatus: ClaimStatus) {
    setClaimStatuses({ ...claimStatuses, [claimId]: newStatus });
    updateClaimStatusAction(claimId, newStatus).catch(console.error);
    announce(`Claim marked ${newStatus.replace("_", " ")}.`);
  }

  function exportClaims() {
    const rows = statusFilter === "All" ? localClaims : localClaims.filter((c) => (claimStatuses[c.id] ?? c.status) === statusFilter);
    downloadCsv("project-orchid-reimbursements.csv", [
      ["Claimant", "Purpose", "Amount (GBP)", "Status", "Submitted", "Receipt"],
      ...rows.map((claim) => [
        claim.claimant,
        claim.purpose,
        claim.amount.toFixed(2),
        claimStatuses[claim.id] ?? claim.status,
        claim.submittedAt,
        claim.receiptName,
      ])
    ]);
    announce("Claims exported to CSV.");
  }

  const filteredClaims = statusFilter === "All"
    ? localClaims
    : localClaims.filter((c) => (claimStatuses[c.id] ?? c.status) === statusFilter);

  const totalAmount = filteredClaims.reduce((sum, c) => sum + c.amount, 0);

  return (
    <main className="stitch-main">
      <PageHeader
        title="Reimbursements Portal"
        copy="Submit receipts, route claims to UKSSC finance and track paid status."
        action={can("submit_claims") ? "New Claim" : undefined}
        onAction={() => { purposeRef.current?.focus(); purposeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
      />

      {/* Status filter tabs */}
      <div className="category-row" style={{ marginBottom: 16 }}>
        {STATUS_FILTER_OPTIONS.map((s) => {
          const count = s === "All" ? localClaims.length : localClaims.filter((c) => (claimStatuses[c.id] ?? c.status) === s).length;
          return (
            <button
              key={s}
              type="button"
              className={statusFilter === s ? "active" : ""}
              onClick={() => setStatusFilter(s)}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              {s === "All" ? "All" : s.replace("_", " ")}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: statusFilter === s ? "rgba(255,255,255,0.3)" : "var(--surface-container)", color: statusFilter === s ? "inherit" : "var(--muted)" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <section className="two-column">
        <article className="stitch-card table-card">
          <div className="section-row">
            <h3>
              {statusFilter === "All" ? "All Claims" : `${statusFilter.replace("_", " ")} claims`}
              {filteredClaims.length > 0 && (
                <span style={{ fontWeight: 400, fontSize: 13, color: "var(--muted)", marginLeft: 8 }}>
                  £{totalAmount.toFixed(2)} total
                </span>
              )}
            </h3>
            <button className="text-action" type="button" onClick={exportClaims}><DownloadSimple size={16} /> Export</button>
          </div>
          {filteredClaims.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "16px 0" }}>
              {localClaims.length === 0 ? "No claims yet. Submit one using the form." : `No ${statusFilter === "All" ? "" : statusFilter.replace("_", " ")} claims.`}
            </p>
          ) : (
            <table>
              <thead><tr><th>Claimant</th><th>Purpose</th><th>Amount</th><th>Status</th>{isReviewer && <th>Note</th>}</tr></thead>
              <tbody>
                {filteredClaims.map((claim) => {
                  const status = claimStatuses[claim.id] ?? claim.status;
                  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.submitted;
                  const note = claimNotes[claim.id] ?? "";
                  const isEditingNote = editingNoteId === claim.id;
                  return (
                    <tr key={claim.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{claim.claimant}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{claim.submittedAt}</div>
                      </td>
                      <td>{claim.purpose}</td>
                      <td style={{ fontWeight: 700 }}>£{claim.amount.toFixed(2)}</td>
                      <td>
                        <select
                          value={status}
                          onChange={(event) => updateStatus(claim.id, event.target.value as ClaimStatus)}
                          aria-label={`Update ${claim.claimant} claim status`}
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "none",
                            background: colors.bg,
                            color: colors.color,
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          {(["submitted", "under_review", "approved", "rejected", "paid"] as ClaimStatus[]).map((item) => (
                            <option key={item} value={item}>{item.replace("_", " ")}</option>
                          ))}
                        </select>
                      </td>
                      {isReviewer && (
                        <td style={{ minWidth: 160 }}>
                          {isEditingNote ? (
                            <NoteEditor
                              initial={note}
                              onSave={(v) => saveNote(claim.id, v)}
                              onCancel={() => setEditingNoteId(null)}
                            />
                          ) : note ? (
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(claim.id)}
                              style={{ fontSize: 12, color: "var(--on-surface)", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, lineHeight: 1.4 }}
                              title="Click to edit note"
                            >
                              {note}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(claim.id)}
                              style={{ fontSize: 11, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0, fontStyle: "italic" }}
                            >
                              + Add note
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>
        <article className="stitch-card">
          <h3>Submit Claim</h3>
          <form className="stitch-form">
            <label>
              Purpose
              <input ref={purposeRef} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Event supplies" aria-describedby={formErrors.purpose ? "err-purpose" : undefined} />
              {formErrors.purpose ? <span id="err-purpose" className="field-error">{formErrors.purpose}</span> : null}
            </label>
            <label>
              Amount
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="86.40" inputMode="decimal" aria-describedby={formErrors.amount ? "err-amount" : undefined} />
              {formErrors.amount ? <span id="err-amount" className="field-error">{formErrors.amount}</span> : null}
            </label>
            <label>
              Receipt
              <input type="file" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
            </label>
            <button className="stitch-secondary full" type="button" onClick={submitClaim}><FileArrowUp size={16} /> Submit Claim</button>
          </form>
        </article>
      </section>
    </main>
  );
}
