import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Plus Jakarta Sans, Inter, sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🌺</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>Page not found</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28, lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{ padding: "10px 24px", borderRadius: 8, background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            style={{ padding: "10px 24px", borderRadius: 8, border: "2px solid #7c3aed", color: "#7c3aed", fontWeight: 700, fontSize: 14, textDecoration: "none" }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
