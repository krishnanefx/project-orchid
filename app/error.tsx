"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Plus Jakarta Sans, Inter, sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
          An unexpected error occurred. Please try again, or contact{" "}
          <a href="mailto:enquiries@theukssc.co.uk" style={{ color: "#7c3aed" }}>enquiries@theukssc.co.uk</a>{" "}
          if the problem persists.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ padding: "10px 24px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
