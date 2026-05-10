"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { PageHeader, Thread, TimelineItem } from "@/components/ui/primitives";

export function ForumsView() {
  const { threads, setThreads, announce, localForums } = useApp();
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBoard, setDraftBoard] = useState("Open Boards");

  function publishThread() {
    const title = draftTitle.trim();
    if (!title) {
      announce("Add a thread title before publishing.");
      return;
    }
    setThreads([{ id: `thread-${Date.now()}`, title, count: "1", meta: `${draftBoard} · 0 replies · just now` }, ...threads]);
    setDraftTitle("");
    announce("Forum thread published to the selected board.");
  }

  return (
    <main className="stitch-main">
      <PageHeader title="Community Forums" copy="Discuss housing, careers, arrivals and society planning with verified UKSSC members." filters={["All Boards", "Open", "Society Boards", "Pinned"]} />
      <section className="two-column">
        <article className="stitch-card">
          <div className="section-row"><h3>Open Boards</h3><span>Verified users</span></div>
          {threads.map((thread) => <Thread key={thread.id} title={thread.title} count={thread.count} meta={thread.meta} />)}
          {threads.length === 0 && localForums.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", padding: "16px 0" }}>No threads yet. Be the first to post!</p>
          ) : null}
          {localForums.map((forum) => <Thread key={forum.id} title={forum.name} count={String(forum.threads)} meta={`${forum.replies} replies · ${forum.visibility === "membership_restricted" ? "Society board" : "Open board"}`} />)}
        </article>
        <article className="stitch-card">
          <h3>New Thread</h3>
          <div className="stitch-form forum-composer">
            <label htmlFor="forum-board">Board</label>
            <select id="forum-board" value={draftBoard} onChange={(event) => setDraftBoard(event.target.value)}>
              <option>Open Boards</option>
              <option>UCL committee board</option>
              <option>Sponsor opportunities</option>
            </select>
            <label htmlFor="thread-title">Thread title</label>
            <input id="thread-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Ask about airport pickup groups" />
            <button className="stitch-primary full" type="button" onClick={publishThread}>Publish Thread</button>
          </div>
        </article>
        <article className="stitch-card">
          <h3>Moderator Queue</h3>
          <TimelineItem tone="green" text="Pinned airport arrivals guide" time="Visible to all verified users" />
          <TimelineItem tone="purple" text="Review society-board access requests" time="3 pending" />
          <TimelineItem tone="muted" text="Locked duplicate housing thread" time="Resolved today" />
        </article>
      </section>
    </main>
  );
}
