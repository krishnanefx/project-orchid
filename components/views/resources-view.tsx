"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { PageHeader } from "@/components/ui/primitives";
import type { Resource } from "@/lib/types";

const CATEGORIES = ["All", "Guide", "Announcement", "Article"] as const;

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  guide: { bg: "var(--primary-soft)", color: "var(--primary)" },
  announcement: { bg: "#fff3cd", color: "#856404" },
  article: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
};

function ResourceCard({ resource }: { resource: Resource }) {
  const [expanded, setExpanded] = useState(false);
  const colors = CATEGORY_COLORS[resource.category] ?? CATEGORY_COLORS.article;
  const hasBody = !!resource.body?.trim();

  return (
    <article className="stitch-card resource-card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <span
        style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "3px 10px",
          borderRadius: 999,
          background: colors.bg,
          color: colors.color,
          alignSelf: "flex-start",
          marginBottom: 10,
        }}
      >
        {resource.category}
      </span>
      <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--on-surface)", margin: "0 0 6px", lineHeight: 1.3 }}>
        {resource.title}
      </h3>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>{resource.audience}</p>

      {hasBody && expanded && (
        <div
          style={{
            fontSize: 14,
            color: "var(--on-surface)",
            lineHeight: 1.7,
            marginBottom: 14,
            paddingTop: 12,
            borderTop: "1px solid rgba(208,194,213,0.3)",
            whiteSpace: "pre-wrap",
          }}
        >
          {resource.body}
        </div>
      )}

      <div className="card-footer" style={{ marginTop: "auto" }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{resource.publishedAt}</span>
        {hasBody ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--primary)",
              padding: 0,
            }}
          >
            {expanded ? "Collapse ↑" : "Read →"}
          </button>
        ) : (
          <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No content yet</span>
        )}
      </div>
    </article>
  );
}

export function ResourcesView() {
  const { localResources } = useApp();
  const [category, setCategory] = useState("All");
  const filtered = category === "All"
    ? localResources
    : localResources.filter((r) => r.category.toLowerCase() === category.toLowerCase());

  return (
    <main className="stitch-main">
      <PageHeader title="Resource Library" copy="Guides, articles and UKSSC announcements for students and committees." />
      <div className="category-row">
        {CATEGORIES.map((item) => (
          <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} type="button">
            {item}
          </button>
        ))}
      </div>
      <section className="resource-grid">
        {filtered.length > 0 ? (
          filtered.map((resource) => <ResourceCard key={resource.id} resource={resource} />)
        ) : (
          <article className="stitch-card resource-card">
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15 }}>No resources yet</h3>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>UKSSC staff can publish resources from Admin → Manage Data.</p>
          </article>
        )}
      </section>
    </main>
  );
}
