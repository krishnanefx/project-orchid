"use client";

import {
  ArrowLeft,
  CalendarBlank,
  ChatCircleText,
  Article,
  Plus,
  UsersThree,
  CheckCircle,
  Warning
} from "@phosphor-icons/react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { universities } from "@/lib/data";
import {
  createSocietyAction,
  createEventAction,
  createResourceAction,
  createForumBoardAction,
} from "@/lib/actions";
import type { ForumBoard, OrchidEvent, Resource, Society } from "@/lib/types";

type Tab = "societies" | "events" | "resources" | "forums";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; weight?: "regular" | "fill" }> }[] = [
  { id: "societies", label: "Societies", icon: UsersThree },
  { id: "events", label: "Events", icon: CalendarBlank },
  { id: "resources", label: "Resources", icon: Article },
  { id: "forums", label: "Forum Boards", icon: ChatCircleText },
];

function StatusBanner({ status, message }: { status: "success" | "error"; message: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 16px",
      borderRadius: 10,
      background: status === "success" ? "var(--secondary-container)" : "var(--danger-bg)",
      color: status === "success" ? "var(--on-secondary-container)" : "var(--on-danger-soft)",
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 16,
    }}>
      {status === "success" ? <CheckCircle size={16} weight="fill" /> : <Warning size={16} weight="fill" />}
      {message}
    </div>
  );
}

// ── Societies Tab ─────────────────────────────────────────────────────────────

function SocietiesTab() {
  const { localSocieties, setLocalSocieties, announce } = useApp();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    universitySlug: "",
    logo: "",
    description: "",
    bio: "",
    foundedYear: "",
    tags: "",
    committee: "",
    links: "",
  });

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.universitySlug || !form.description.trim()) {
      setStatus({ type: "error", msg: "Name, university and description are required." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const society = await createSocietyAction({
        name: form.name.trim(),
        universitySlug: form.universitySlug,
        logo: form.logo.trim() || form.name.slice(0, 3).toUpperCase(),
        description: form.description.trim(),
        bio: form.bio.trim() || undefined,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        committee: form.committee.split("\n").map((t) => t.trim()).filter(Boolean),
        links: form.links.split("\n").map((t) => t.trim()).filter(Boolean),
      });
      setLocalSocieties([society, ...localSocieties]);
      setForm({ name: "", universitySlug: "", logo: "", description: "", bio: "", foundedYear: "", tags: "", committee: "", links: "" });
      setStatus({ type: "success", msg: `${society.name} registered successfully.` });
      announce(`Society "${society.name}" created.`);
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Failed to create society." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid-2" style={{ gap: 20, alignItems: "start" }}>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Register New Society</h3>
        {status && <StatusBanner status={status.type} message={status.msg} />}
        <div className="stitch-form">
          <label>Society Name *<input value={form.name} onChange={field("name")} placeholder="UCL Singapore Society" /></label>
          <label>University *
            <select value={form.universitySlug} onChange={field("universitySlug")}>
              <option value="">Select university…</option>
              {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>
          <label>Logo initials (e.g. UCL, IC)
            <input value={form.logo} onChange={field("logo")} placeholder="Auto-generated if blank" maxLength={4} />
          </label>
          <label>Short description *<textarea value={form.description} onChange={field("description")} placeholder="A brief one-line description of the society." rows={2} /></label>
          <label>Extended bio<textarea value={form.bio} onChange={field("bio")} placeholder="Full society story, history, and activities." rows={4} /></label>
          <label>Founded year<input type="number" value={form.foundedYear} onChange={field("foundedYear")} placeholder="2001" min={1900} max={2030} /></label>
          <label>Tags (comma-separated)<input value={form.tags} onChange={field("tags")} placeholder="Welfare, Careers, Culture" /></label>
          <label>Committee members (one per line)<textarea value={form.committee} onChange={field("committee")} placeholder={"Alice Tan\nBob Lim\nCarla Ng"} rows={3} /></label>
          <label>Links (one per line)<textarea value={form.links} onChange={field("links")} placeholder={"instagram.com/society\nlinktr.ee/society"} rows={2} /></label>
          <button className="stitch-primary full" type="button" onClick={handleCreate} disabled={saving}>
            <Plus size={15} /> {saving ? "Registering…" : "Register Society"}
          </button>
        </div>
      </div>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
          Registered Societies ({localSocieties.length})
        </h3>
        {localSocieties.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>No societies yet. Register the first one.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {localSocieties.map((s) => {
              const uni = universities.find((u) => u.id === (s.universitySlug || s.universityId));
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "var(--surface-container, #f8f4fa)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--primary)", flexShrink: 0 }}>
                    {s.logo || s.name.slice(0, 3).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{uni?.name ?? s.universityId} &middot; {s.members} members</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 999, background: s.status === "active" ? "var(--secondary-container)" : "var(--surface-container)", color: s.status === "active" ? "var(--on-secondary-container)" : "var(--muted)" }}>
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Events Tab ────────────────────────────────────────────────────────────────

function EventsTab() {
  const { localEvents, setLocalEvents, localSocieties, announce } = useApp();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "ukssc" as OrchidEvent["type"],
    startsAt: "",
    location: "",
    capacity: "100",
    description: "",
    societyIds: [] as string[],
  });

  function toggleSociety(id: string) {
    setForm((p) => ({
      ...p,
      societyIds: p.societyIds.includes(id) ? p.societyIds.filter((s) => s !== id) : [...p.societyIds, id],
    }));
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.startsAt || !form.location.trim()) {
      setStatus({ type: "error", msg: "Title, date and location are required." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const event = await createEventAction({
        title: form.title.trim(),
        type: form.type,
        startsAt: new Date(form.startsAt).toISOString(),
        location: form.location.trim(),
        capacity: Number(form.capacity) || 100,
        description: form.description.trim() || undefined,
        societyIds: form.societyIds,
      });
      setLocalEvents([event, ...localEvents]);
      setForm({ title: "", type: "ukssc", startsAt: "", location: "", capacity: "100", description: "", societyIds: [] });
      setStatus({ type: "success", msg: `"${event.title}" created.` });
      announce(`Event "${event.title}" published.`);
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Failed to create event." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid-2" style={{ gap: 20, alignItems: "start" }}>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Create Event</h3>
        {status && <StatusBanner status={status.type} message={status.msg} />}
        <div className="stitch-form">
          <label>Event title *<input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="UKSSC Annual Gala 2026" /></label>
          <label>Type *
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as OrchidEvent["type"] }))}>
              <option value="ukssc">UKSSC-wide</option>
              <option value="cross_society">Cross-society</option>
              <option value="society">Society-only</option>
            </select>
          </label>
          <label>Date & time *<input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} /></label>
          <label>Location *<input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Central Hall, London" /></label>
          <label>Capacity<input type="number" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} min={1} /></label>
          <label>Description<textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Tell attendees what to expect…" rows={3} /></label>
          {localSocieties.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface)", marginBottom: 8 }}>Tag societies</p>
              <div style={{ display: "grid", gap: 6 }}>
                {localSocieties.map((s) => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                    <input type="checkbox" checked={form.societyIds.includes(s.id)} onChange={() => toggleSociety(s.id)} />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button className="stitch-primary full" type="button" onClick={handleCreate} disabled={saving}>
            <Plus size={15} /> {saving ? "Creating…" : "Create Event"}
          </button>
        </div>
      </div>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
          Events ({localEvents.length})
        </h3>
        {localEvents.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>No events yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {localEvents.map((e) => {
              const date = new Date(e.startsAt);
              return (
                <div key={e.id} style={{ padding: "12px 16px", borderRadius: 10, background: "var(--surface-container, #f8f4fa)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)" }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} &middot; {e.location} &middot; {e.rsvps}/{e.capacity}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Resources Tab ─────────────────────────────────────────────────────────────

function ResourcesTab() {
  const { localResources, setLocalResources, announce } = useApp();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "guide" as Resource["category"],
    audience: "",
    body: "",
  });

  async function handleCreate() {
    if (!form.title.trim() || !form.audience.trim()) {
      setStatus({ type: "error", msg: "Title and audience are required." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const resource = await createResourceAction({
        title: form.title.trim(),
        category: form.category,
        audience: form.audience.trim(),
        body: form.body.trim(),
      });
      setLocalResources([resource, ...localResources]);
      setForm({ title: "", category: "guide", audience: "", body: "" });
      setStatus({ type: "success", msg: `"${resource.title}" published.` });
      announce(`Resource "${resource.title}" published.`);
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Failed to publish resource." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid-2" style={{ gap: 20, alignItems: "start" }}>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Publish Resource</h3>
        {status && <StatusBanner status={status.type} message={status.msg} />}
        <div className="stitch-form">
          <label>Title *<input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Freshers onboarding pack" /></label>
          <label>Category *
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Resource["category"] }))}>
              <option value="guide">Guide</option>
              <option value="announcement">Announcement</option>
              <option value="article">Article</option>
            </select>
          </label>
          <label>Audience *<input value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))} placeholder="All verified users" /></label>
          <label>Content<textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Full article content or summary…" rows={6} /></label>
          <button className="stitch-primary full" type="button" onClick={handleCreate} disabled={saving}>
            <Plus size={15} /> {saving ? "Publishing…" : "Publish Resource"}
          </button>
        </div>
      </div>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
          Resources ({localResources.length})
        </h3>
        {localResources.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>No resources published yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {localResources.map((r) => (
              <div key={r.id} style={{ padding: "12px 16px", borderRadius: 10, background: "var(--surface-container, #f8f4fa)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)" }}>{r.category}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)" }}>{r.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{r.audience} &middot; {r.publishedAt}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Forums Tab ────────────────────────────────────────────────────────────────

function ForumsTab() {
  const { localForums, setLocalForums, localSocieties, announce } = useApp();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    visibility: "open_to_verified_users" as ForumBoard["visibility"],
    societyId: "",
    pinned: "",
  });

  async function handleCreate() {
    if (!form.name.trim()) {
      setStatus({ type: "error", msg: "Board name is required." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const board = await createForumBoardAction({
        name: form.name.trim(),
        visibility: form.visibility,
        societyId: form.societyId || undefined,
        pinned: form.pinned.trim() || undefined,
      });
      setLocalForums([...localForums, board]);
      setForm({ name: "", visibility: "open_to_verified_users", societyId: "", pinned: "" });
      setStatus({ type: "success", msg: `Board "${board.name}" created.` });
      announce(`Forum board "${board.name}" created.`);
    } catch (err) {
      setStatus({ type: "error", msg: err instanceof Error ? err.message : "Failed to create forum board." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid-2" style={{ gap: 20, alignItems: "start" }}>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20 }}>Create Forum Board</h3>
        {status && <StatusBanner status={status.type} message={status.msg} />}
        <div className="stitch-form">
          <label>Board name *<input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="UK-wide arrivals and housing" /></label>
          <label>Visibility *
            <select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value as ForumBoard["visibility"] }))}>
              <option value="open_to_verified_users">Open to all verified users</option>
              <option value="membership_restricted">Society members only</option>
            </select>
          </label>
          {form.visibility === "membership_restricted" && localSocieties.length > 0 && (
            <label>Restrict to society
              <select value={form.societyId} onChange={(e) => setForm((p) => ({ ...p, societyId: e.target.value }))}>
                <option value="">All societies</option>
                {localSocieties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          )}
          <label>Pinned thread title<input value={form.pinned} onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.value }))} placeholder="Welcome to the board" /></label>
          <button className="stitch-primary full" type="button" onClick={handleCreate} disabled={saving}>
            <Plus size={15} /> {saving ? "Creating…" : "Create Board"}
          </button>
        </div>
      </div>
      <div className="stitch-card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
          Forum Boards ({localForums.length})
        </h3>
        {localForums.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>No boards yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {localForums.map((f) => (
              <div key={f.id} style={{ padding: "12px 16px", borderRadius: 10, background: "var(--surface-container, #f8f4fa)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)" }}>{f.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {f.visibility === "membership_restricted" ? "Society board" : "Open board"} &middot; {f.threads} threads
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function AdminDataView() {
  const { setView } = useApp();
  const [tab, setTab] = useState<Tab>("societies");

  return (
    <main className="stitch-main">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <button
          type="button"
          className="stitch-nav-item"
          style={{ display: "inline-flex", width: "auto" }}
          onClick={() => setView("admin")}
        >
          <ArrowLeft size={16} />
          <span>Admin</span>
        </button>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--on-surface)", marginBottom: 4 }}>
          Manage Data
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Create and manage societies, events, resources and forum boards.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1.5px solid rgba(208,194,213,0.4)", paddingBottom: 0 }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                border: "none",
                borderBottom: active ? "2.5px solid var(--primary)" : "2.5px solid transparent",
                background: "none",
                color: active ? "var(--primary)" : "var(--muted)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: -1.5,
                transition: "color 150ms ease",
              }}
            >
              <Icon size={15} weight={active ? "fill" : "regular"} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "societies" && <SocietiesTab />}
      {tab === "events" && <EventsTab />}
      {tab === "resources" && <ResourcesTab />}
      {tab === "forums" && <ForumsTab />}
    </main>
  );
}
