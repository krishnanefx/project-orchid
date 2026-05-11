"use client";

import { DownloadSimple, FileArrowUp, Receipt } from "@phosphor-icons/react";
import { useState } from "react";
import { z } from "zod";
import { useApp } from "@/lib/app-context";
import { getReceiptUrlAction, submitClaimAction, updateClaimStatusAction, uploadReceiptAction } from "@/lib/actions";
import type { ClaimStatus } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";
import { PageHeader } from "@/components/ui/primitives";

const claimSchema = z.object({
  purpose: z.string().trim().min(3, "Purpose must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be greater than zero").finite("Enter a valid number"),
});

export function ClaimsView() {
  const { localClaims, setLocalClaims, claimStatuses, setClaimStatuses, announce, currentUser } = useApp();
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{ purpose?: string; amount?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({});
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);

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
    setSubmitting(true);
    const today = new Date().toISOString().slice(0, 10);
    const receiptName = receiptFile?.name ?? "receipt";

    // Optimistic local entry with temp id
    const tempId = `claim-${Date.now()}`;
    const optimistic = {
      id: tempId,
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
    announce("Submitting claim…");

    try {
      // Persist claim first to get the real ID
      const saved = await submitClaimAction(
        { claimant: currentUser.name, societyId: currentUser.societyId, amount: result.data.amount, purpose: result.data.purpose, receiptName },
        currentUser.id,
      );

      // Upload receipt if provided
      if (receiptFile && saved.id) {
        const fd = new FormData();
        fd.append("file", receiptFile);
        fd.append("claimId", saved.id);
        await uploadReceiptAction(fd).catch(() => {
          announce("Claim saved — receipt upload failed. You can re-attach it later.");
        });
      }

      // Swap temp optimistic entry for the real saved row
      setLocalClaims(localClaims.map((c) => c.id === tempId ? saved : c));
      announce("Reimbursement claim submitted to UKSSC finance.");
    } catch {
      announce("Failed to submit claim — please try again.");
      setLocalClaims(localClaims.filter((c) => c.id !== tempId));
    } finally {
      setSubmitting(false);
    }
  }

  function updateStatus(claimId: string, newStatus: ClaimStatus) {
    setClaimStatuses({ ...claimStatuses, [claimId]: newStatus });
    updateClaimStatusAction(claimId, newStatus).catch(console.error);
    announce(`Claim marked ${newStatus.replace("_", " ")}.`);
  }

  async function viewReceipt(claimId: string, receiptPath: string) {
    if (receiptUrls[claimId]) {
      window.open(receiptUrls[claimId], "_blank");
      return;
    }
    setLoadingReceiptId(claimId);
    try {
      const url = await getReceiptUrlAction(receiptPath);
      setReceiptUrls((prev) => ({ ...prev, [claimId]: url }));
      window.open(url, "_blank");
    } catch {
      announce("Could not load receipt — it may not have been uploaded yet.");
    } finally {
      setLoadingReceiptId(null);
    }
  }

  function exportClaims() {
    downloadCsv("project-orchid-reimbursements.csv", [
      ["Claimant", "Purpose", "Amount", "Status", "Submitted"],
      ...localClaims.map((claim) => [
        claim.claimant,
        claim.purpose,
        claim.amount.toFixed(2),
        claimStatuses[claim.id] ?? claim.status,
        claim.submittedAt,
      ]),
    ]);
    announce("Claims CSV generated.");
  }

  return (
    <main className="stitch-main">
      <PageHeader title="Reimbursements Portal" copy="Submit receipts, route claims to UKSSC finance and track paid status." action="New Claim" />
      <section className="two-column">
        <article className="stitch-card table-card">
          <div className="section-row">
            <h3>Finance Review</h3>
            <button className="text-action" type="button" onClick={exportClaims}><DownloadSimple size={16} /> Export</button>
          </div>
          {localClaims.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "16px 0" }}>No claims yet. Submit one using the form.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Claimant</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Receipt</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {localClaims.map((claim) => {
                  const status = claimStatuses[claim.id] ?? claim.status;
                  const hasReceipt = !!claim.receiptName && claim.receiptName !== "receipt";
                  return (
                    <tr key={claim.id}>
                      <td>{claim.claimant}</td>
                      <td>{claim.purpose}</td>
                      <td>£{claim.amount.toFixed(2)}</td>
                      <td>
                        {hasReceipt ? (
                          <button
                            type="button"
                            onClick={() => viewReceipt(claim.id, claim.receiptName)}
                            disabled={loadingReceiptId === claim.id}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, padding: 0 }}
                          >
                            <Receipt size={13} />
                            {loadingReceiptId === claim.id ? "Loading…" : claim.receiptName.split("/").pop()}
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={status}
                          onChange={(event) => updateStatus(claim.id, event.target.value as ClaimStatus)}
                          aria-label={`Update ${claim.claimant} claim status`}
                        >
                          {(["submitted", "under_review", "approved", "rejected", "paid"] as ClaimStatus[]).map((item) => (
                            <option key={item} value={item}>{item.replace("_", " ")}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>

        <article className="stitch-card">
          <h3>Submit Claim</h3>
          <form className="stitch-form" onSubmit={(e) => { e.preventDefault(); submitClaim(); }}>
            <label>
              Purpose
              <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Event supplies" aria-describedby={formErrors.purpose ? "err-purpose" : undefined} />
              {formErrors.purpose ? <span id="err-purpose" className="field-error">{formErrors.purpose}</span> : null}
            </label>
            <label>
              Amount (£)
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="86.40" inputMode="decimal" aria-describedby={formErrors.amount ? "err-amount" : undefined} />
              {formErrors.amount ? <span id="err-amount" className="field-error">{formErrors.amount}</span> : null}
            </label>
            <label>
              Receipt
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              />
              {receiptFile && (
                <span style={{ fontSize: 11, color: "var(--primary)", marginTop: 4, display: "block" }}>
                  {receiptFile.name} ({(receiptFile.size / 1024).toFixed(0)} KB)
                </span>
              )}
            </label>
            <button className="stitch-secondary full" type="submit" disabled={submitting}>
              <FileArrowUp size={16} /> {submitting ? "Submitting…" : "Submit Claim"}
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
