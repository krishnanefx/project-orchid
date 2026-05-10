"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#faf7fb" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>A critical error occurred</h2>
          <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>Please refresh the page or contact support.</p>
          <button type="button" onClick={reset} style={{ padding: "10px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
