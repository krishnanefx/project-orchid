"use client";

import { BookmarkSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { PageHeader } from "@/components/ui/primitives";
import type { Resource } from "@/lib/types";

const BOOKMARKS_KEY = "orchid-resource-bookmarks";

function loadBookmarks(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(BOOKMARKS_KEY) ?? "[]")); } catch { return new Set(); }
}

function saveBookmarks(ids: Set<string>) {
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...ids])); } catch { /* ignore */ }
}

const CATEGORIES = ["All", "Guide", "Announcement", "Article"] as const;

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  guide: { bg: "var(--primary-soft)", color: "var(--primary)" },
  announcement: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
  article: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
};

function ResourceCard({ resource, bookmarked, onToggleBookmark }: { resource: Resource; bookmarked: boolean; onToggleBookmark: () => void }) {
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark resource"}
            aria-pressed={bookmarked}
            title={bookmarked ? "Remove bookmark" : "Save to bookmarks"}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4,
              color: bookmarked ? "var(--primary)" : "var(--muted)", display: "flex",
            }}
          >
            <BookmarkSimple size={15} weight={bookmarked ? "fill" : "regular"} />
          </button>
          {hasBody ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: "var(--primary)", padding: 0,
              }}
            >
              {expanded ? "Collapse ↑" : "Read →"}
            </button>
          ) : (
            <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No content yet</span>
          )}
        </div>
      </div>
    </article>
  );
}

const CATEGORIES_WITH_SAVED = ["All", "Guide", "Announcement", "Article", "Saved"] as const;

export function ResourcesView() {
  const { localResources } = useApp();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  function toggleBookmark(id: string) {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      saveBookmarks(next);
      return next;
    });
  }

  const q = search.toLowerCase();
  const filtered = localResources.filter((r) => {
    if (category === "Saved") return bookmarks.has(r.id);
    const matchCat = category === "All" || r.category.toLowerCase() === category.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.body?.toLowerCase().includes(q) || r.audience.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <main className="stitch-main">
      <PageHeader title="Resource Library" copy="Guides, articles and UKSSC announcements for students and committees." />
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="category-row" style={{ marginBottom: 0, flex: "0 0 auto" }}>
          {CATEGORIES_WITH_SAVED.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
              type="button"
              style={item === "Saved" && bookmarks.size > 0 ? { display: "flex", alignItems: "center", gap: 5 } : undefined}
            >
              {item === "Saved" && <BookmarkSimple size={12} weight={bookmarks.size > 0 ? "fill" : "regular"} />}
              {item}
              {item === "Saved" && bookmarks.size > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: category === "Saved" ? "rgba(255,255,255,0.3)" : "var(--surface-container)", color: category === "Saved" ? "inherit" : "var(--muted)" }}>
                  {bookmarks.size}
                </span>
              )}
            </button>
          ))}
        </div>
        {category !== "Saved" && (
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
        )}
      </div>
      <section className="resource-grid">
        {filtered.length > 0 ? (
          filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              bookmarked={bookmarks.has(resource.id)}
              onToggleBookmark={() => toggleBookmark(resource.id)}
            />
          ))
        ) : (
          <article className="stitch-card resource-card">
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 15 }}>
              {category === "Saved" ? "No saved resources" : search ? `No results for "${search}"` : "No resources yet"}
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              {category === "Saved"
                ? "Bookmark resources using the bookmark icon to find them here."
                : search
                  ? "Try a different search term or clear the filter."
                  : "UKSSC staff can publish resources from Admin → Manage Data."}
            </p>
          </article>
        )}
      </section>
    </main>
  );
}
