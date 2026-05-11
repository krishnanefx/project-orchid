"use client";

import { DownloadSimple, FileArrowUp, Receipt, CheckCircle, Warning, Note } from "@phosphor-icons/react";
import { useState } from "react";
import { z } from "zod";
import { useApp } from "@/lib/app-context";
import { submitClaimAction, reviewClaimAction } from "@/lib/actions";
import type { BudgetCategory, ClaimStatus, ReimbursementClaim } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";
import { PageHeader } from "@/components/ui/primitives";

const claimSchema = z.object({
  purpose: z.string().trim().min(3, "Purpose must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be greater than zero").finite("Enter a valid number"),
});

const STATUS_STYLES: Record<ClaimStatus, { bg: string; color: string; label: string }> = {
  submitted:    { bg: "#f0f4ff", color: "#3b4dc8", label: "Submitted" },
  under_review: { bg: "#fff8e1", color: "#b45309", label: "Under Review" },
  approved:     { bg: "#f0fdf4", color: "#15803d", label: "Approved" },
  rejected:     { bg: "#fef2f2", color: "#b91c1c", label: "Rejected" },
  paid:         { bg: "var(--secondary-container)", color: "var(--on-secondary-container)", label: "Paid" },
};

const BUDGET_CATEGORIES: { value: BudgetCategory; label: string }[] = [
  { value: "events",       label: "Events" },
  { value: "welfare",      label: "Welfare" },
  { value: "sponsorship",  label: "Sponsorship" },
  { value: "operations",   label: "Operations" },
  { value: "grants",       label: "Grants" },
];

function StatusPill({ status }: { status: ClaimStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.submitted;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function ClaimRow({
  claim,
  canReview,
  onReview,
}: {
  claim: ReimbursementClaim;
  canReview: boolean;
  onReview: (id: string, status: ClaimStatus, notes?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(claim.reviewerNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleReview(status: ClaimStatus) {
    setSaving(true);
    await onReview(claim.id, status, reviewNotes || undefined);
    setSaving(false);
    setExpanded(false);
  }

  return (
    <>
      <tr
        style={{ cursor: canReview ? "pointer" : "default" }}
        onClick={() => canReview && setExpanded((v) => !v)}
      >
        <td>{claim.claimant}</td>
        <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {claim.purpose}
        </td>
        <td style={{ fontVariantNumeric: "tabular-nums" }}>GBP {claim.amount.toFixed(2)}</td>
        <td>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 999, background: "#f3f0ff", color: "#6b21a8" }}>
            {claim.budgetCategory ?? "events"}
          </span>
        </td>
        <td><StatusPill status={claim.status} /></td>
        <td>
          {claim.receiptPath ? (
            <a
              href={claim.receiptPath}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}
            >
              View
            </a>
          ) : (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{claim.receiptName || "—"}</span>
          )}
        </td>
      </tr>
      {expanded && canReview && (
        <tr>
          <td colSpan={6} style={{ padding: "12px 16px", background: "var(--surface-container, #faf7fb)", borderTop: "none" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>
                Reviewer notes
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes visible to the claimant…"
                  rows={2}
                  style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
                />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["under_review", "approved", "rejected", "paid"] as ClaimStatus[]).filter(
                  (s) => s !== claim.status
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={saving}
                    onClick={() => handleReview(s)}
                    style={{
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 8,
                      border: "1.5px solid",
                      cursor: "pointer",
                      borderColor: STATUS_STYLES[s].color,
                      color: STATUS_STYLES[s].color,
                      background: STATUS_STYLES[s].bg,
                    }}
                  >
                    {saving ? "Saving…" : `Mark ${STATUS_STYLES[s].label}`}
                  </button>
                ))}
              </div>
              {claim.reviewerNotes && (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
                  <Note size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  Previous note: {claim.reviewerNotes}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ClaimsView() {
  const { localClaims, setLocalClaims, claimStatuses, setClaimStatuses, announce, currentUser, can } = useApp();
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState<BudgetCategory>("events");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ purpose?: string; amount?: string }>({});

  const canReview = currentUser.role === "finance_reviewer" || currentUser.role === "super_admin" || currentUser.role === "ukssc_staff";
  const canSubmit = can("submit_claims");

  async function uploadReceipt(file: File): Promise<{ path: string; url: string } | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/storage/upload-receipt", { method: "POST", body: fd });
    if (!res.ok) return null;
    return res.json() as Promise<{ path: string; url: string }>;
  }

  async function submitClaim() {
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
    setUploading(true);

    let receiptPath: string | undefined;
    let receiptName = receiptFile?.name ?? "receipt";

    if (receiptFile) {
      const upload = await uploadReceipt(receiptFile);
      if (upload) {
        receiptPath = upload.url;
      } else {
        announce("Receipt upload failed — claim saved without attachment.");
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const optimistic: ReimbursementClaim = {
      id: `claim-${Date.now()}`,
      claimant: currentUser.name,
      claimantId: currentUser.id,
      societyId: currentUser.societyId,
      amount: result.data.amount,
      purpose: result.data.purpose,
      status: "submitted",
      submittedAt: today,
      receiptName,
      receiptPath,
      budgetCategory,
    };

    setLocalClaims([optimistic, ...localClaims]);
    setPurpose("");
    setAmount("");
    setReceiptFile(null);
    setUploading(false);
    announce("Reimbursement claim submitted to UKSSC finance.");

    submitClaimAction(
      {
        claimant: currentUser.name,
        societyId: currentUser.societyId,
        amount: result.data.amount,
        purpose: result.data.purpose,
        receiptName,
        receiptPath,
        budgetCategory,
      },
      currentUser.id
    ).catch(() => announce("Claim saved locally but failed to sync. Please refresh."));
  }

  async function handleReview(claimId: string, newStatus: ClaimStatus, notes?: string) {
    setClaimStatuses({ ...claimStatuses, [claimId]: newStatus });
    setLocalClaims(localClaims.map((c) =>
      c.id === claimId ? { ...c, status: newStatus, reviewerNotes: notes ?? c.reviewerNotes } : c
    ));
    await reviewClaimAction(claimId, newStatus, notes).catch(console.error);
    announce(`Claim marked ${newStatus.replace(/_/g, " ")}.`);
  }

  function exportClaims() {
    downloadCsv("project-orchid-reimbursements.csv", [
      ["Claimant", "Purpose", "Amount", "Category", "Status", "Submitted", "Receipt"],
      ...localClaims.map((c) => [
        c.claimant,
        c.purpose,
        c.amount.toFixed(2),
        c.budgetCategory ?? "events",
        claimStatuses[c.id] ?? c.status,
        c.submittedAt,
        c.receiptPath ?? c.receiptName ?? "",
      ])
    ]);
    announce("Claims CSV generated.");
  }

  const claimsToShow = canReview
    ? localClaims
    : localClaims.filter((c) => c.claimantId === currentUser.id || c.claimant === currentUser.name);

  const openCount = localClaims.filter((c) => ["submitted", "under_review"].includes(claimStatuses[c.id] ?? c.status)).length;

  return (
    <main className="stitch-main">
      <PageHeader
        title="Reimbursements Portal"
        copy="Submit receipts, route claims to UKSSC finance and track paid status."
        action="Export CSV"
        onAction={exportClaims}
      />

      {canReview && openCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "#fff8e1", color: "#b45309", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          <Warning size={16} weight="fill" />
          {openCount} claim{openCount !== 1 ? "s" : ""} awaiting review — click a row to open the review panel.
        </div>
      )}

      <section className="two-column">
        <article className="stitch-card table-card" style={{ overflow: "auto" }}>
          <div className="section-row">
            <h3><Receipt size={17} style={{ display: "inline", verticalAlign: "middle" }} /> {canReview ? "All Claims" : "My Claims"}</h3>
            <button className="text-action" type="button" onClick={exportClaims}>
              <DownloadSimple size={16} /> Export
            </button>
          </div>
          {claimsToShow.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "16px 0", fontSize: 14 }}>No claims yet. Submit one using the form.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Claimant</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {claimsToShow.map((claim) => (
                  <ClaimRow
                    key={claim.id}
                    claim={{ ...claim, status: (claimStatuses[claim.id] as ClaimStatus) ?? claim.status }}
                    canReview={canReview}
                    onReview={handleReview}
                  />
                ))}
              </tbody>
            </table>
          )}
        </article>

        {canSubmit && (
          <article className="stitch-card">
            <h3>Submit Claim</h3>
            <form className="stitch-form">
              <label>
                Purpose *
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Event supplies, venue hire…"
                  aria-describedby={formErrors.purpose ? "err-purpose" : undefined}
                />
                {formErrors.purpose && <span id="err-purpose" className="field-error">{formErrors.purpose}</span>}
              </label>
              <label>
                Amount (GBP) *
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="86.40"
                  inputMode="decimal"
                  aria-describedby={formErrors.amount ? "err-amount" : undefined}
                />
                {formErrors.amount && <span id="err-amount" className="field-error">{formErrors.amount}</span>}
              </label>
              <label>
                Budget Category
                <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value as BudgetCategory)}>
                  {BUDGET_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Receipt (PDF or image)
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                {receiptFile && (
                  <span style={{ fontSize: 11, color: "var(--primary)", marginTop: 4, display: "block" }}>
                    <CheckCircle size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {receiptFile.name}
                  </span>
                )}
              </label>
              <button
                className="stitch-secondary full"
                type="button"
                onClick={submitClaim}
                disabled={uploading}
              >
                <FileArrowUp size={16} />
                {uploading ? "Uploading receipt…" : "Submit Claim"}
              </button>
            </form>
          </article>
        )}
      </section>
    </main>
  );
}
