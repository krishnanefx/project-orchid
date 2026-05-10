"use client";

import { DownloadSimple, FileArrowUp } from "@phosphor-icons/react";
import { useState } from "react";
import { z } from "zod";
import { useApp } from "@/lib/app-context";
import { submitClaimAction, updateClaimStatusAction } from "@/lib/actions";
import type { ClaimStatus } from "@/lib/types";
import { downloadCsv } from "@/lib/utils";
import { PageHeader } from "@/components/ui/primitives";

const claimSchema = z.object({
  purpose: z.string().trim().min(3, "Purpose must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be greater than zero").finite("Enter a valid number")
});

export function ClaimsView() {
  const { localClaims, setLocalClaims, claimStatuses, setClaimStatuses, announce, currentUser } = useApp();
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{ purpose?: string; amount?: string }>({});

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
    downloadCsv("project-orchid-reimbursements.csv", [
      ["Claimant", "Purpose", "Amount", "Status"],
      ...localClaims.map((claim) => [claim.claimant, claim.purpose, claim.amount.toFixed(2), claimStatuses[claim.id] ?? claim.status])
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
              <thead><tr><th>Claimant</th><th>Purpose</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {localClaims.map((claim) => {
                  const status = claimStatuses[claim.id] ?? claim.status;
                  return (
                    <tr key={claim.id}>
                      <td>{claim.claimant}</td>
                      <td>{claim.purpose}</td>
                      <td>GBP {claim.amount.toFixed(2)}</td>
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
          <form className="stitch-form">
            <label>
              Purpose
              <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Event supplies" aria-describedby={formErrors.purpose ? "err-purpose" : undefined} />
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
