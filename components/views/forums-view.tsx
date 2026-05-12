"use client";

import { CaretDown, CaretUp, ChatCircle, Lock, PaperPlaneTilt, PushPin } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { createForumReplyAction, createForumThreadAction, getForumRepliesAction, getForumThreadsAction } from "@/lib/actions";
import { PageHeader, Thread } from "@/components/ui/primitives";
import type { ForumReply, ForumThread } from "@/lib/types";

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

const VOTES_KEY = "orchid-thread-votes";

function loadVotes(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(VOTES_KEY) ?? "{}"); } catch { return {}; }
}

function saveVotes(votes: Record<string, number>) {
  try { localStorage.setItem(VOTES_KEY, JSON.stringify(votes)); } catch { /* ignore */ }
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function ReplyBubble({ reply, timeAgo }: { reply: ForumReply; timeAgo: (iso: string) => string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: "var(--surface-container)", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 9, fontWeight: 800, color: "var(--muted)",
      }}>
        {initials(reply.authorName)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface)" }}>{reply.authorName}</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{timeAgo(reply.createdAt)}</span>
        </div>
        <p style={{
          fontSize: 13, color: "var(--on-surface)", margin: 0, lineHeight: 1.65,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {reply.body}
        </p>
      </div>
    </div>
  );
}

function ThreadRow({
  thread,
  timeAgo,
  currentUserId,
  currentUserName,
  boardLocked,
  onReplyPosted,
}: {
  thread: ForumThread;
  timeAgo: (iso: string) => string;
  currentUserId: string;
  currentUserName: string;
  boardLocked?: boolean;
  onReplyPosted?: (threadId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyCount, setReplyCount] = useState(thread.replyCount ?? 0);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const hasBody = !!(thread.body?.trim());
  const voted = votes[thread.id] === 1;
  const isLocked = boardLocked || thread.locked;

  useEffect(() => {
    setVotes(loadVotes());
  }, []);

  async function handleExpand() {
    if (!expanded && !loadingReplies && replies.length === 0) {
      setLoadingReplies(true);
      const loaded = await getForumRepliesAction(thread.id).catch(() => []);
      setReplies(loaded);
      setReplyCount(loaded.length);
      setLoadingReplies(false);
    }
    setExpanded((v) => !v);
  }

  function handleVote(e: React.MouseEvent) {
    e.stopPropagation();
    const next = { ...votes, [thread.id]: voted ? 0 : 1 };
    setVotes(next);
    saveVotes(next);
  }

  async function submitReply() {
    const body = replyDraft.trim();
    if (!body) return;
    setSubmitting(true);
    const optimistic: ForumReply = {
      id: `reply-${Date.now()}`,
      threadId: thread.id,
      authorId: currentUserId,
      authorName: currentUserName,
      body,
      createdAt: new Date().toISOString(),
    };
    setReplies((prev) => [...prev, optimistic]);
    setReplyCount((n) => n + 1);
    setReplyDraft("");
    try {
      const saved = await createForumReplyAction({ threadId: thread.id, authorId: currentUserId, authorName: currentUserName, body });
      setReplies((prev) => prev.map((r) => r.id === optimistic.id ? saved : r));
      onReplyPosted?.(thread.id);
    } catch {
      // Keep optimistic reply in view but don't cascade
    } finally {
      setSubmitting(false);
    }
  }

  const voteCount = voted ? 1 : 0;

  return (
    <div style={{ borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.25))" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 0" }}>
        {/* Upvote */}
        <button
          type="button"
          onClick={handleVote}
          aria-label={voted ? "Remove upvote" : "Upvote thread"}
          aria-pressed={voted}
          style={{
            textAlign: "center", minWidth: 28, background: "none", border: "none",
            cursor: "pointer", padding: 0, color: voted ? "var(--primary)" : "var(--muted)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1, paddingTop: 2,
          }}
        >
          <CaretUp size={13} weight={voted ? "fill" : "regular"} />
          <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, color: voted ? "var(--primary)" : "var(--on-surface)" }}>
            {voteCount}
          </div>
        </button>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, cursor: "pointer" }} onClick={handleExpand} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleExpand()}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", lineHeight: 1.3 }}>
              {thread.title}
            </div>
            {thread.pinned && (
              <PushPin size={12} weight="fill" style={{ color: "var(--primary)", flexShrink: 0 }} />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--muted)" }}>
            <span>{timeAgo(thread.createdAt)}</span>
            <button
              type="button"
              onClick={handleExpand}
              style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, color: "var(--primary)", fontWeight: 600 }}
            >
              <ChatCircle size={12} weight={expanded ? "fill" : "regular"} />
              {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"}` : "Reply"}
            </button>
          </div>
        </div>

        {/* Expand caret */}
        <button
          type="button"
          onClick={handleExpand}
          aria-label={expanded ? "Collapse thread" : "Expand thread"}
          style={{ color: "var(--muted)", flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}
        >
          {expanded ? <CaretUp size={13} /> : <CaretDown size={13} />}
        </button>
      </div>

      {expanded && (
        <div style={{ padding: "0 0 16px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Thread body */}
          {hasBody && (
            <p style={{ fontSize: 14, color: "var(--on-surface)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
              {thread.body}
            </p>
          )}

          {/* Replies */}
          {loadingReplies ? (
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Loading replies…</p>
          ) : replies.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, borderLeft: "2px solid var(--outline-variant)", paddingLeft: 12 }}>
              {replies.map((r) => (
                <ReplyBubble key={r.id} reply={r} timeAgo={timeAgo} />
              ))}
            </div>
          ) : (
            !isLocked && (
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, fontStyle: "italic" }}>No replies yet — be the first.</p>
            )
          )}

          {/* Reply input */}
          {!isLocked && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                ref={replyRef}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitReply(); }}
                placeholder="Write a reply… (⌘↵ to send)"
                rows={2}
                style={{
                  flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8,
                  border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
                  background: "var(--surface-bright)", color: "var(--on-surface)",
                  resize: "vertical", fontFamily: "inherit", outline: "none",
                  lineHeight: 1.5,
                }}
              />
              <button
                type="button"
                onClick={submitReply}
                disabled={!replyDraft.trim() || submitting}
                aria-label="Post reply"
                style={{
                  width: 36, height: 36, borderRadius: 8, border: "none", flexShrink: 0,
                  background: replyDraft.trim() ? "var(--primary)" : "var(--surface-container)",
                  color: replyDraft.trim() ? "#fff" : "var(--muted)",
                  cursor: replyDraft.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 150ms ease",
                }}
              >
                <PaperPlaneTilt size={16} weight="fill" />
              </button>
            </div>
          )}

          {isLocked && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
              <Lock size={12} />
              This thread is locked.
            </div>
          )}
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

  function handleReplyPosted(threadId: string) {
    // Bump the board's reply count in local state
    setLocalForums(localForums.map((f) =>
      f.id === selectedBoardId ? { ...f, replies: f.replies + 1 } : f
    ));
    // Update replyCount on the specific thread
    setThreads((prev) => prev.map((t) =>
      t.id === threadId ? { ...t, replyCount: (t.replyCount ?? 0) + 1 } : t
    ));
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{selectedBoard.name}</h3>
                  {selectedBoard.locked && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--warning-bg)", color: "var(--warning-text)" }}>
                      <Lock size={10} weight="fill" /> Locked
                    </span>
                  )}
                </div>
                <span>{threads.length} thread{threads.length !== 1 ? "s" : ""}</span>
              </div>
              {selectedBoard.pinned && <PinnedBanner message={selectedBoard.pinned} />}
              {loadingThreads ? (
                <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>Loading…</p>
              ) : threads.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", margin: "0 0 4px" }}>No threads yet</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Start the conversation using the form.</p>
                </div>
              ) : (
                threads.map((t) => (
                  <ThreadRow
                    key={t.id}
                    thread={t}
                    timeAgo={timeAgo}
                    currentUserId={currentUser.id ?? ""}
                    currentUserName={currentUser.name}
                    boardLocked={selectedBoard.locked}
                    onReplyPosted={handleReplyPosted}
                  />
                ))
              )}
            </article>
          )}
        </div>

        <div>
          {/* New thread form */}
          <article className="stitch-card" style={{ marginBottom: 16 }}>
            <h3>New Thread</h3>
            {selectedBoard?.locked && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "var(--warning-bg)", fontSize: 13, color: "var(--warning-text)", marginBottom: 12 }}>
                <Lock size={14} weight="fill" />
                This board is locked. New threads cannot be posted.
              </div>
            )}
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
                disabled={localForums.length === 0 || publishing || !!(selectedBoard?.locked)}
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
