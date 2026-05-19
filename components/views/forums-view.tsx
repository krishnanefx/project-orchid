"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import {
  createForumReplyAction,
  createForumThreadAction,
  getForumRepliesAction,
  getForumThreadsAction,
} from "@/lib/actions";
import { PageHeader, Thread } from "@/components/ui/primitives";
import type { ForumReply, ForumThread } from "@/lib/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Thread Detail ──────────────────────────────────────────────────────────────

function ThreadDetail({
  thread,
  currentUserId,
  announce,
  onBack,
}: {
  thread: ForumThread;
  currentUserId: string;
  announce: (msg: string) => void;
  onBack: () => void;
}) {
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftBody, setDraftBody] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setLoading(true);
    getForumRepliesAction(thread.id)
      .then(setReplies)
      .catch(() => setReplies([]))
      .finally(() => setLoading(false));
  }, [thread.id]);

  async function postReply() {
    const body = draftBody.trim();
    if (!body) { announce("Write something before replying."); return; }
    if (!currentUserId) { announce("You must be logged in to reply."); return; }
    setPublishing(true);
    try {
      const reply = await createForumReplyAction({ threadId: thread.id, body, authorId: currentUserId });
      setReplies((prev) => [...prev, reply]);
      setDraftBody("");
      announce("Reply posted.");
    } catch {
      announce("Failed to post reply — please try again.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, background: "none", cursor: "pointer", color: "var(--primary)", fontSize: 13, fontWeight: 700, padding: "0 0 16px", marginBottom: 4 }}
      >
        <ArrowLeft size={14} /> Back to boards
      </button>

      {/* Thread header */}
      <div className="stitch-card" style={{ padding: "20px 24px", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--on-surface)", marginBottom: 6 }}>
          {thread.title}
        </h2>
        {thread.body && (
          <p style={{ fontSize: 14, color: "var(--on-surface)", lineHeight: 1.65, marginBottom: 12 }}>
            {thread.body}
          </p>
        )}
        <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
          Posted {timeAgo(thread.createdAt)} &middot; {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </p>
      </div>

      {/* Replies */}
      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>Loading replies…</p>
      ) : replies.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>No replies yet — be the first to respond.</p>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {replies.map((reply) => (
            <div key={reply.id} className="stitch-card" style={{ padding: "14px 20px", display: "flex", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--primary)", flexShrink: 0 }}>
                {reply.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)" }}>{reply.authorName}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{timeAgo(reply.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--on-surface)", lineHeight: 1.6, margin: 0 }}>{reply.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply composer */}
      <div className="stitch-card" style={{ padding: "16px 20px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)", marginBottom: 10 }}>Reply</h3>
        <textarea
          value={draftBody}
          onChange={(e) => setDraftBody(e.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
          style={{ width: "100%", resize: "vertical", padding: "10px 12px", border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))", borderRadius: 8, fontSize: 14, color: "var(--on-surface)", background: "var(--surface-bright, #fff)", boxSizing: "border-box", lineHeight: 1.6 }}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) postReply(); }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            type="button"
            className="stitch-primary"
            onClick={postReply}
            disabled={publishing || !draftBody.trim()}
          >
            {publishing ? "Posting…" : "Post Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Boards + Thread List ───────────────────────────────────────────────────────

export function ForumsView() {
  const { announce, localForums, currentUser, setLocalForums } = useApp();

  const openBoards = localForums.filter((f) => f.visibility === "open_to_verified_users");
  const societyBoards = localForums.filter((f) => f.visibility === "membership_restricted");

  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    openBoards[0]?.id ?? localForums[0]?.id ?? ""
  );
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Load threads whenever selected board changes
  useEffect(() => {
    if (!selectedBoardId) return;
    setSelectedThread(null);
    setLoadingThreads(true);
    getForumThreadsAction(selectedBoardId)
      .then(setThreads)
      .catch(() => setThreads([]))
      .finally(() => setLoadingThreads(false));
  }, [selectedBoardId]);

  // Initialise selected board once forums load
  useEffect(() => {
    if (!selectedBoardId && localForums.length > 0) {
      setSelectedBoardId(openBoards[0]?.id ?? localForums[0]?.id ?? "");
    }
  }, [localForums.length]);

  async function publishThread() {
    const title = draftTitle.trim();
    if (!title) { announce("Add a thread title before publishing."); return; }
    if (!selectedBoardId) { announce("Select a board first."); return; }
    if (!currentUser.id) { announce("You must be logged in to post."); return; }
    setPublishing(true);
    try {
      const thread = await createForumThreadAction({
        boardId: selectedBoardId,
        title,
        body: draftBody.trim(),
        authorId: currentUser.id,
      });
      setThreads((prev) => [thread, ...prev]);
      setLocalForums(localForums.map((f) =>
        f.id === selectedBoardId ? { ...f, threads: f.threads + 1 } : f
      ));
      setDraftTitle("");
      setDraftBody("");
      announce("Thread published.");
    } catch {
      announce("Failed to publish thread — please try again.");
    } finally {
      setPublishing(false);
    }
  }

  const selectedBoard = localForums.find((f) => f.id === selectedBoardId) ?? null;

  // Show thread detail view
  if (selectedThread) {
    return (
      <main className="stitch-main">
        <ThreadDetail
          thread={selectedThread}
          currentUserId={currentUser.id}
          announce={announce}
          onBack={() => setSelectedThread(null)}
        />
      </main>
    );
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
            {openBoards.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>No open boards yet.</p>
            )}
            {openBoards.map((forum) => (
              <button
                key={forum.id}
                type="button"
                onClick={() => setSelectedBoardId(forum.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: selectedBoardId === forum.id ? "var(--primary-soft)" : "none",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Thread
                  title={forum.name}
                  count={String(forum.threads)}
                  meta={`${forum.replies} replies · Open`}
                />
              </button>
            ))}
          </article>

          {/* Society boards */}
          {societyBoards.length > 0 && (
            <article className="stitch-card">
              <div className="section-row">
                <h3>Society Boards</h3>
                <span>Members only</span>
              </div>
              {societyBoards.map((forum) => (
                <button
                  key={forum.id}
                  type="button"
                  onClick={() => setSelectedBoardId(forum.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: selectedBoardId === forum.id ? "var(--primary-soft)" : "none",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <Thread
                    title={forum.name}
                    count={String(forum.threads)}
                    meta={`${forum.replies} replies · Society members`}
                  />
                </button>
              ))}
            </article>
          )}

          {/* Thread list for selected board */}
          {selectedBoard && (
            <article className="stitch-card" style={{ marginTop: 16 }}>
              <div className="section-row">
                <h3>{selectedBoard.name}</h3>
                <span>{threads.length} thread{threads.length !== 1 ? "s" : ""}</span>
              </div>
              {loadingThreads ? (
                <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>Loading…</p>
              ) : threads.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>No threads yet. Be the first to post!</p>
              ) : (
                threads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedThread(t)}
                    style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderRadius: 8, cursor: "pointer", padding: 0 }}
                  >
                    <Thread
                      title={t.title}
                      count="→"
                      meta={`${t.body ? t.body.slice(0, 60) + (t.body.length > 60 ? "…" : "") : "No body"} · ${timeAgo(t.createdAt)}`}
                    />
                  </button>
                ))
              )}
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
                  value={selectedBoardId}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
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
              <label htmlFor="thread-title">Title *</label>
              <input
                id="thread-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Ask about airport pickup groups"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) publishThread(); }}
              />
              <label htmlFor="thread-body">Body</label>
              <textarea
                id="thread-body"
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder="Share more context…"
                rows={3}
                style={{ resize: "vertical" }}
              />
              <button
                className="stitch-primary full"
                type="button"
                onClick={publishThread}
                disabled={localForums.length === 0 || publishing}
              >
                {publishing ? "Publishing…" : "Publish Thread"}
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
                <strong style={{ color: "var(--on-surface)" }}>{localForums.reduce((s, f) => s + f.threads, 0)}</strong>
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
