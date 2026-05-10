"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { PageHeader, Thread } from "@/components/ui/primitives";

export function ForumsView() {
  const { threads, setThreads, announce, localForums } = useApp();
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBoardId, setDraftBoardId] = useState<string>("");

  const openBoards = localForums.filter((f) => f.visibility === "open_to_verified_users");
  const societyBoards = localForums.filter((f) => f.visibility === "membership_restricted");

  const selectedBoard = localForums.find((f) => f.id === draftBoardId) ?? openBoards[0] ?? localForums[0] ?? null;

  function publishThread() {
    const title = draftTitle.trim();
    if (!title) {
      announce("Add a thread title before publishing.");
      return;
    }
    const boardName = selectedBoard?.name ?? "Open Boards";
    setThreads([
      { id: `thread-${Date.now()}`, title, count: "1", meta: `${boardName} · 0 replies · just now` },
      ...threads,
    ]);
    setDraftTitle("");
    announce("Forum thread published.");
  }

  return (
    <main className="stitch-main">
      <PageHeader
        title="Community Forums"
        copy="Discuss housing, careers, arrivals and society planning with verified UKSSC members."
        filters={["All Boards", "Open", "Society Boards", "Pinned"]}
      />
      <section className="two-column">
        <div>
          {/* Open boards */}
          <article className="stitch-card" style={{ marginBottom: 16 }}>
            <div className="section-row">
              <h3>Open Boards</h3>
              <span>Verified users</span>
            </div>
            {threads.map((thread) => (
              <Thread key={thread.id} title={thread.title} count={thread.count} meta={thread.meta} />
            ))}
            {openBoards.map((forum) => (
              <Thread
                key={forum.id}
                title={forum.name}
                count={String(forum.threads)}
                meta={`${forum.replies} replies · Open`}
              />
            ))}
            {threads.length === 0 && openBoards.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>No open boards yet.</p>
            )}
          </article>

          {/* Society boards */}
          {societyBoards.length > 0 && (
            <article className="stitch-card">
              <div className="section-row">
                <h3>Society Boards</h3>
                <span>Members only</span>
              </div>
              {societyBoards.map((forum) => (
                <Thread
                  key={forum.id}
                  title={forum.name}
                  count={String(forum.threads)}
                  meta={`${forum.replies} replies · Society members`}
                />
              ))}
            </article>
          )}
        </div>

        <div>
          {/* New thread form */}
          <article className="stitch-card" style={{ marginBottom: 16 }}>
            <h3>New Thread</h3>
            <div className="stitch-form forum-composer">
              <label htmlFor="forum-board">Board</label>
              {localForums.length > 0 ? (
                <select
                  id="forum-board"
                  value={draftBoardId || selectedBoard?.id || ""}
                  onChange={(e) => setDraftBoardId(e.target.value)}
                >
                  {localForums.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              ) : (
                <select id="forum-board" disabled>
                  <option>No boards available</option>
                </select>
              )}
              <label htmlFor="thread-title">Thread title</label>
              <input
                id="thread-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Ask about airport pickup groups"
                onKeyDown={(e) => { if (e.key === "Enter") publishThread(); }}
              />
              <button
                className="stitch-primary full"
                type="button"
                onClick={publishThread}
                disabled={localForums.length === 0}
              >
                Publish Thread
              </button>
            </div>
          </article>

          {/* Board stats */}
          <article className="stitch-card">
            <h3>Network Stats</h3>
            <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--muted)" }}>Total boards</span>
                <strong style={{ color: "var(--on-surface)" }}>{localForums.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--muted)" }}>Total threads</span>
                <strong style={{ color: "var(--on-surface)" }}>{localForums.reduce((s, f) => s + f.threads, 0) + threads.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--muted)" }}>Total replies</span>
                <strong style={{ color: "var(--on-surface)" }}>{localForums.reduce((s, f) => s + f.replies, 0)}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
