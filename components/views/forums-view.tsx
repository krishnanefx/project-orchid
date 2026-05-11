"use client";

import { CaretDown, CaretUp, PushPin } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { createForumThreadAction, getForumThreadsAction } from "@/lib/actions";
import { PageHeader, Thread } from "@/components/ui/primitives";
import type { ForumThread } from "@/lib/types";

function PinnedBanner({ message }: { message: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 16px", borderRadius: 10, marginBottom: 12,
      background: "var(--primary-soft)",
      border: "1px solid oklch(from var(--primary) l c h / 0.25)",
    }}>
      <PushPin size={15} weight="fill" style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
      <p style={{ fontSize: 13, color: "var(--on-surface)", margin: 0, lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}

function ThreadRow({ thread, timeAgo }: { thread: ForumThread; timeAgo: (iso: string) => string }) {
  const [expanded, setExpanded] = useState(false);
  const hasBody = !!(thread.body?.trim());

  return (
    <div style={{ borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.25))" }}>
      <button
        type="button"
        onClick={() => hasBody && setExpanded((v) => !v)}
        style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          width: "100%", textAlign: "left", padding: "12px 0",
          background: "none", border: "none",
          cursor: hasBody ? "pointer" : "default",
        }}
      >
        <div style={{ textAlign: "center", minWidth: 28, color: "var(--muted)", paddingTop: 2 }}>
          <CaretUp size={13} />
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.2 }}>0</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", lineHeight: 1.3 }}>
              {thread.title}
            </div>
            {thread.pinned && (
              <PushPin size={12} weight="fill" style={{ color: "var(--primary)", flexShrink: 0 }} />
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            {timeAgo(thread.createdAt)}
            {hasBody && !expanded && (
              <> · <span style={{ color: "var(--primary)" }}>read more</span></>
            )}
          </div>
        </div>
        {hasBody && (
          <div style={{ color: "var(--muted)", flexShrink: 0, paddingTop: 2 }}>
            {expanded ? <CaretUp size={13} /> : <CaretDown size={13} />}
          </div>
        )}
      </button>
      {expanded && hasBody && (
        <div style={{ padding: "0 0 14px 40px" }}>
          <p style={{ fontSize: 14, color: "var(--on-surface)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
            {thread.body}
          </p>
        </div>
      )}
    </div>
  );
}

export function ForumsView() {
  const { announce, localForums, currentUser, setLocalForums } = useApp();

  const openBoards = localForums.filter((f) => f.visibility === "open_to_verified_users");
  const societyBoards = localForums.filter((f) => f.visibility === "membership_restricted");

  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    openBoards[0]?.id ?? localForums[0]?.id ?? ""
  );
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Load threads whenever selected board changes
  useEffect(() => {
    if (!selectedBoardId) return;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localForums.length, selectedBoardId]);

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
      // Bump the board's thread count in local state
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

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
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
              {selectedBoard.pinned && <PinnedBanner message={selectedBoard.pinned} />}
              {loadingThreads ? (
                <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>Loading…</p>
              ) : threads.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>No threads yet. Be the first to post!</p>
              ) : (
                threads.map((t) => (
                  <ThreadRow key={t.id} thread={t} timeAgo={timeAgo} />
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
