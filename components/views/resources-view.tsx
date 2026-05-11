"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
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
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const filtered = localResources.filter((r) => {
    const matchCat = category === "All" || r.category.toLowerCase() === category.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.body?.toLowerCase().includes(q) || r.audience.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <main className="stitch-main">
      <PageHeader title="Resource Library" copy="Guides, articles and UKSSC announcements for students and committees." />
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="category-row" style={{ marginBottom: 0, flex: "0 0 auto" }}>
          {CATEGORIES.map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} type="button">
              {item}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", flex: "1 1 180px" }}>
          <MagnifyingGlass size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources…"
            aria-label="Search resources"
            style={{
              width: "100%",
              padding: "8px 12px 8px 30px",
              border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--on-surface)",
              background: "var(--surface-bright, #fff)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
      <section className="resource-grid">
        {filtered.length > 0 ? (
          filtered.map((resource) => <ResourceCard key={resource.id} resource={resource} />)
        ) : (
          <article className="stitch-card resource-card">
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15 }}>
              {search ? `No results for "${search}"` : "No resources yet"}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              {search ? "Try a different search term or clear the filter." : "UKSSC staff can publish resources from Admin → Manage Data."}
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
