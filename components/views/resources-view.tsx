"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { PageHeader } from "@/components/ui/primitives";

const CATEGORIES = ["All", "Guide", "Announcement", "Article"] as const;

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
        {filtered.length > 0 ? filtered.map((resource) => (
          <article className="stitch-card resource-card" key={resource.id}>
            <span className="pill">{resource.category}</span>
            <h3>{resource.title}</h3>
            <p>{resource.audience}</p>
            <div className="card-footer"><span>{resource.publishedAt}</span><button type="button">Read →</button></div>
          </article>
        )) : (
          <article className="stitch-card resource-card">
            <h3>No resources yet</h3>
            <p>UKSSC staff can publish resources from the admin workflow.</p>
          </article>
        )}
      </section>
    </main>
  );
}
