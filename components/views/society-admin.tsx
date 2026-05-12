"use client";

import {
  ArrowLeft,
  CalendarBlank,
  Camera,
  ChatCircleText,
  CheckCircle,
  DownloadSimple,
  FloppyDisk,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  PencilSimple,
  Plus,
  PushPin,
  Trash,
  User,
  UsersThree,
  Warning,
  X
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import { checkInAction, createEventAction, createForumBoardAction, deleteEventAction, getEventRsvpsAction, getSocietyMembersAction, updateEventAction, updateEventStatusAction, updateForumBoardAction, updateSocietyAction } from "@/lib/actions";
import { downloadCsv } from "@/lib/utils";
import { universities } from "@/lib/data";
import type { EventDraft, ForumBoard, OrchidEvent } from "@/lib/types";

type Tab = "profile" | "events" | "members" | "media" | "forums";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; weight?: "regular" | "fill" }> }[] = [
  { id: "profile", label: "Profile", icon: PencilSimple },
  { id: "events", label: "Events", icon: CalendarBlank },
  { id: "members", label: "Members", icon: UsersThree },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "forums", label: "Forums", icon: ChatCircleText }
];

const EVENT_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  waitlist: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
  closed: { bg: "var(--surface-container)", color: "var(--muted)" }
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="stitch-card" style={{ padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--on-surface)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
  borderRadius: 8,
  fontSize: 14,
  color: "var(--on-surface)",
  background: "var(--surface-bright, #fff)",
  outline: "none",
  boxSizing: "border-box"
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 90,
  lineHeight: 1.6
};

export function SocietyAdmin() {
  const { setView, currentUser, localSocieties, updateSociety, announce } = useApp();
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);

  const society = localSocieties.find((s) => s.id === currentUser.societyId);
  const university = universities.find((u) => u.id === society?.universityId);
  const isPrivileged = currentUser.role === "super_admin" || currentUser.role === "ukssc_staff";
  const isCommittee = society
    ? isPrivileged || society.committee.some(
        (entry) => entry.split("|")[0].trim().toLowerCase() === currentUser.name.toLowerCase()
      )
    : false;

  if (!society) {
    return (
      <main className="stitch-main">
        <p style={{ color: "var(--muted)", fontSize: 14 }}>No society linked to your account.</p>
        <button type="button" className="stitch-secondary" onClick={() => setView("societies")} style={{ marginTop: 12 }}>
          Browse Directory
        </button>
      </main>
    );
  }

  return (
    <main className="stitch-main">
      <button
        type="button"
        className="stitch-nav-item"
        style={{ display: "inline-flex", width: "auto", marginBottom: 8 }}
        onClick={() => setView("dashboard")}
      >
        <ArrowLeft size={16} />
        <span>Dashboard</span>
      </button>

      {/* Header banner */}
      <div
        className="stitch-card"
        style={{
          padding: 0,
          marginBottom: 20,
          overflow: "hidden",
          background: society.bannerUrl ? `url(${society.bannerUrl}) center/cover` : society.bannerColor ?? "var(--primary-soft)"
        }}
      >
        <div style={{ padding: "28px 28px 24px", background: "rgba(255,255,255,0.85)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--primary-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: "var(--primary)",
                flexShrink: 0,
                overflow: "hidden"
              }}
            >
              {society.logoUrl ? <img src={society.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : society.logo}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 20, color: "var(--on-surface)", margin: "0 0 4px" }}>
                {society.name}
              </h2>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                {university?.name} &middot; Est. {society.foundedYear ?? "N/A"} &middot; {society.members} members
              </p>
            </div>
            {!isCommittee && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--warning-text)", background: "var(--warning-bg)", padding: "6px 12px", borderRadius: 8 }}>
                <Warning size={14} />
                <span>View only — committee access required to edit</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1.5px solid var(--outline-variant, rgba(208,194,213,0.4))", paddingBottom: 0 }}>
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
                borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                background: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--primary)" : "var(--muted)",
                marginBottom: -1.5,
                transition: "color 150ms ease"
              }}
            >
              <Icon size={15} weight={active ? "fill" : "regular"} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" && (
        <ProfileTab
          society={society}
          isCommittee={isCommittee}
          saving={saving}
          onSave={(patch) => {
            if (!isCommittee) return;
            setSaving(true);
            updateSociety(society.id, patch);
            updateSocietyAction(society.id, patch)
              .then(() => announce("Society profile saved."))
              .catch(() => announce("Failed to save — changes saved locally only."))
              .finally(() => setSaving(false));
          }}
        />
      )}
      {tab === "events" && (
        <EventsTab
          societyId={society.id}
          isCommittee={isCommittee}
          announce={announce}
        />
      )}
      {tab === "members" && (
        <MembersTab
          society={society}
          isCommittee={isCommittee}
          announce={announce}
        />
      )}
      {tab === "media" && (
        <MediaTab
          society={society}
          isCommittee={isCommittee}
          onSave={(patch) => {
            if (!isCommittee) return;
            updateSociety(society.id, patch);
            announce("Media updated.");
            updateSocietyAction(society.id, patch).catch(() => announce("Saved locally but failed to sync."));
          }}
        />
      )}
      {tab === "forums" && (
        <ForumsTab
          societyId={society.id}
          isCommittee={isCommittee}
          announce={announce}
        />
      )}
    </main>
  );
}

// ── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  society,
  isCommittee,
  saving,
  onSave
}: {
  society: import("@/lib/types").Society | undefined;
  isCommittee: boolean;
  saving: boolean;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  if (!society) return null;

  const [name, setName] = useState(society.name);
  const [description, setDescription] = useState(society.description);
  const [bio, setBio] = useState(society.bio ?? "");
  const [foundedYear, setFoundedYear] = useState(String(society.foundedYear ?? ""));
  const [links, setLinks] = useState<string[]>([...society.links]);
  const [committee, setCommittee] = useState<string[]>([...society.committee]);
  const [tags, setTags] = useState<string[]>([...(society.tags ?? [])]);
  const [newLink, setNewLink] = useState("");
  const [newMember, setNewMember] = useState("");
  const [newTag, setNewTag] = useState("");

  const disabled = !isCommittee;

  function handleSave() {
    onSave({ name, description, bio, foundedYear: Number(foundedYear) || undefined, links, committee, tags });
  }

  return (
    <div>
      <SectionCard title="Basic Information">
        <FieldRow label="Society Name">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
        </FieldRow>
        <FieldRow label="Short Description">
          <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} disabled={disabled} placeholder="One-line description shown in directory listings" />
        </FieldRow>
        <FieldRow label="About / Full Bio">
          <textarea style={textareaStyle} value={bio} onChange={(e) => setBio(e.target.value)} disabled={disabled} placeholder="Tell members more about your society's history, mission and events..." />
        </FieldRow>
        <FieldRow label="Founded Year">
          <input style={{ ...inputStyle, maxWidth: 140 }} type="number" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} disabled={disabled} placeholder="e.g. 2001" />
        </FieldRow>
      </SectionCard>

      <SectionCard title="Tags">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: "var(--primary-soft)",
                color: "var(--primary)"
              }}
            >
              {tag}
              {isCommittee && (
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} style={{ border: 0, background: "none", cursor: "pointer", padding: 0, color: "inherit", display: "flex" }}>
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
        {isCommittee && (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Add tag (e.g. Welfare, Careers)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTag.trim()) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag("");
                }
              }}
            />
            <button
              type="button"
              className="stitch-secondary"
              style={{ flexShrink: 0 }}
              onClick={() => {
                if (newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(""); }
              }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Links">
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {links.map((link, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LinkIcon size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={link}
                onChange={(e) => setLinks(links.map((l, j) => (j === i ? e.target.value : l)))}
                disabled={disabled}
                placeholder="instagram.com/..."
              />
              {isCommittee && (
                <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)", padding: 4, display: "flex" }}>
                  <Trash size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        {isCommittee && (
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="instagram.com/yoursoc" value={newLink} onChange={(e) => setNewLink(e.target.value)} />
            <button
              type="button"
              className="stitch-secondary"
              style={{ flexShrink: 0 }}
              onClick={() => { if (newLink.trim()) { setLinks([...links, newLink.trim()]); setNewLink(""); } }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Committee Members">
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          {committee.map((member, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--primary-soft)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--primary)", flexShrink: 0
              }}>
                {member.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={member}
                onChange={(e) => setCommittee(committee.map((m, j) => (j === i ? e.target.value : m)))}
                disabled={disabled}
              />
              {isCommittee && committee.length > 1 && (
                <button type="button" onClick={() => setCommittee(committee.filter((_, j) => j !== i))} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)", padding: 4, display: "flex" }}>
                  <Trash size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        {isCommittee && (
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Full name" value={newMember} onChange={(e) => setNewMember(e.target.value)} />
            <button
              type="button"
              className="stitch-secondary"
              style={{ flexShrink: 0 }}
              onClick={() => { if (newMember.trim()) { setCommittee([...committee, newMember.trim()]); setNewMember(""); } }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        )}
      </SectionCard>

      {isCommittee && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="stitch-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : <><FloppyDisk size={15} /> Save Changes</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({
  societyId,
  isCommittee,
  announce
}: {
  societyId: string;
  isCommittee: boolean;
  announce: (msg: string) => void;
}) {
  const { localEvents: allEvents, setLocalEvents: setAllEvents } = useApp();
  const [localEvents, setLocalEvents] = useState<OrchidEvent[]>(
    allEvents.filter((e) => e.societyIds.includes(societyId))
  );
  const [showForm, setShowForm] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [rsvpLists, setRsvpLists] = useState<Record<string, { id: string; name: string; email: string }[]>>({});
  const [loadingRsvps, setLoadingRsvps] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventDraft>({
    title: "",
    type: "society",
    startsAt: "",
    location: "",
    capacity: 50,
    description: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  async function handleSave() {
    if (!draft.title.trim() || !draft.startsAt || !draft.location.trim()) {
      announce("Please fill in all required fields.");
      return;
    }
    if (editId) {
      const updated = localEvents.map((e) => e.id === editId ? { ...e, ...draft, societyIds: e.societyIds } : e);
      setLocalEvents(updated);
      setAllEvents(allEvents.map((e) => e.id === editId ? { ...e, ...draft, societyIds: e.societyIds } : e));
      announce("Event updated.");
      updateEventAction(editId, draft).catch(() => announce("Saved locally but failed to sync."));
    } else {
      const optimistic: OrchidEvent = {
        id: `evt-${Date.now()}`,
        ...draft,
        societyIds: [societyId],
        rsvps: 0,
        checkedIn: 0,
        status: "open"
      };
      const allWithOptimistic = [optimistic, ...allEvents];
      const localWithOptimistic = [optimistic, ...localEvents];
      setAllEvents(allWithOptimistic);
      setLocalEvents(localWithOptimistic);
      announce(`Event "${draft.title}" created.`);
      createEventAction({
        title: draft.title,
        type: draft.type,
        startsAt: draft.startsAt,
        location: draft.location,
        capacity: draft.capacity,
        societyIds: [societyId],
        description: draft.description?.trim() || undefined,
      }).then((saved) => {
        setAllEvents(allWithOptimistic.map((e) => e.id === optimistic.id ? saved : e));
        setLocalEvents(localWithOptimistic.map((e) => e.id === optimistic.id ? saved : e));
      }).catch(() => announce("Event saved locally but failed to sync. Please refresh."));
    }
    setShowForm(false);
    setEditId(null);
    setDraft({ title: "", type: "society", startsAt: "", location: "", capacity: 50, description: "" });
  }

  function toggleRsvpList(event: OrchidEvent) {
    if (expandedEventId === event.id) {
      setExpandedEventId(null);
      return;
    }
    setExpandedEventId(event.id);
    if (!rsvpLists[event.id]) {
      setLoadingRsvps(event.id);
      getEventRsvpsAction(event.id)
        .then((list) => setRsvpLists((prev) => ({ ...prev, [event.id]: list })))
        .catch(() => setRsvpLists((prev) => ({ ...prev, [event.id]: [] })))
        .finally(() => setLoadingRsvps(null));
    }
  }

  async function handleCheckIn(event: OrchidEvent) {
    setCheckingIn(event.id);
    setLocalEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, checkedIn: e.checkedIn + 1 } : e));
    setAllEvents(allEvents.map((e) => e.id === event.id ? { ...e, checkedIn: e.checkedIn + 1 } : e));
    try {
      await checkInAction(event.id);
      announce("Check-in recorded.");
    } catch {
      announce("Check-in failed — please try again.");
    } finally {
      setCheckingIn(null);
    }
  }

  function handleEdit(event: OrchidEvent) {
    setDraft({ title: event.title, type: event.type, startsAt: event.startsAt, location: event.location, capacity: event.capacity, description: event.description ?? "" });
    setEditId(event.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setLocalEvents((prev) => prev.filter((e) => e.id !== id));
    setAllEvents(allEvents.filter((e) => e.id !== id));
    announce("Event removed.");
    deleteEventAction(id).catch(() => announce("Removed locally but failed to sync."));
  }

  async function handleStatusToggle(event: OrchidEvent) {
    const next: OrchidEvent["status"] = event.status === "closed" ? "open" : event.status === "open" ? "closed" : "open";
    setTogglingStatus(event.id);
    setLocalEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, status: next } : e));
    setAllEvents(allEvents.map((e) => e.id === event.id ? { ...e, status: next } : e));
    try {
      await updateEventStatusAction(event.id, next);
      announce(`Event ${next === "closed" ? "closed" : "re-opened"}.`);
    } catch {
      announce("Status update failed — change applied locally.");
    } finally {
      setTogglingStatus(null);
    }
  }

  return (
    <div>
      {isCommittee && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button type="button" className="stitch-primary" onClick={() => { setShowForm(true); setEditId(null); setDraft({ title: "", type: "society", startsAt: "", location: "", capacity: 50, description: "" }); }}>
            <Plus size={15} /> New Event
          </button>
        </div>
      )}

      {showForm && (
        <div className="stitch-card" style={{ padding: 24, marginBottom: 20, border: "2px solid var(--primary-soft)" }}>
          <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 14, color: "var(--on-surface)", marginBottom: 16 }}>
            {editId ? "Edit Event" : "New Event"}
          </h3>
          <div style={{ display: "grid", gap: 14 }}>
            <FieldRow label="Title *">
              <input style={inputStyle} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Freshers Welcome Night" />
            </FieldRow>
            <div className="grid-2" style={{ gap: 14 }}>
              <FieldRow label="Event Type">
                <select style={inputStyle} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as EventDraft["type"] })}>
                  <option value="society">Society</option>
                  <option value="cross_society">Cross-Society</option>
                  <option value="ukssc">UKSSC</option>
                </select>
              </FieldRow>
              <FieldRow label="Capacity">
                <input style={inputStyle} type="number" min={1} value={draft.capacity} onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} />
              </FieldRow>
            </div>
            <div className="grid-2" style={{ gap: 14 }}>
              <FieldRow label="Date & Time *">
                <input style={inputStyle} type="datetime-local" value={draft.startsAt.slice(0, 16)} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
              </FieldRow>
              <FieldRow label="Location *">
                <input style={inputStyle} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Bloomsbury, London" />
              </FieldRow>
            </div>
            <FieldRow label="Description">
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72, lineHeight: 1.6 } as React.CSSProperties} value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Optional — what should attendees know about this event?" />
            </FieldRow>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <button type="button" className="stitch-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            <button type="button" className="stitch-primary" onClick={handleSave}>
              <FloppyDisk size={15} /> {editId ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </div>
      )}

      {localEvents.length === 0 ? (
        <div className="stitch-card" style={{ padding: 32, textAlign: "center" }}>
          <CalendarBlank size={32} style={{ color: "var(--muted)", marginBottom: 10 }} />
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>No events yet. {isCommittee ? "Create your first event above." : ""}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {localEvents.map((event) => {
            const date = new Date(event.startsAt);
            const month = date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
            const day = date.toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" });
            const statusColors = EVENT_STATUS_COLORS[event.status] ?? EVENT_STATUS_COLORS.closed;
            return (
              <div key={event.id} className="stitch-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "center", minWidth: 44, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.04em" }}>{month}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--on-surface)", lineHeight: 1.1 }}>{day}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", marginBottom: 2 }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {event.location} &middot; {event.rsvps}/{event.capacity} RSVPs &middot; {event.checkedIn} checked in
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: statusColors.bg, color: statusColors.color, flexShrink: 0 }}>
                    {event.status}
                  </span>
                  {isCommittee && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => toggleRsvpList(event)}
                        title="View RSVPs"
                        style={{ border: 0, background: expandedEventId === event.id ? "var(--primary-soft)" : "none", cursor: "pointer", color: "var(--primary)", padding: 6, borderRadius: 6, display: "flex", fontSize: 10, fontWeight: 700, gap: 4, alignItems: "center" }}
                      >
                        <UsersThree size={14} weight="fill" />
                        {event.rsvps}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckIn(event)}
                        disabled={checkingIn === event.id}
                        title="Record manual check-in"
                        style={{ border: 0, background: "none", cursor: "pointer", color: "var(--primary)", padding: 6, borderRadius: 6, display: "flex" }}
                      >
                        <CheckCircle size={15} weight={checkingIn === event.id ? "fill" : "regular"} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(event)}
                        disabled={togglingStatus === event.id}
                        title={event.status === "closed" ? "Re-open event" : "Close event"}
                        style={{ border: 0, background: "none", cursor: "pointer", color: event.status === "closed" ? "var(--primary)" : "var(--muted)", padding: 6, borderRadius: 6, display: "flex" }}
                      >
                        {event.status === "closed"
                          ? <ArrowLeft size={15} style={{ transform: "rotate(90deg)" }} />
                          : <X size={15} />}
                      </button>
                      <button type="button" onClick={() => handleEdit(event)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)", padding: 6, borderRadius: 6, display: "flex" }}>
                        <PencilSimple size={15} />
                      </button>
                      <button type="button" onClick={() => handleDelete(event.id)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)", padding: 6, borderRadius: 6, display: "flex" }}>
                        <Trash size={15} />
                      </button>
                    </div>
                  )}
                </div>
                {expandedEventId === event.id && (
                  <div style={{ borderTop: "1px solid var(--outline-variant, rgba(208,194,213,0.3))", padding: "12px 20px", background: "var(--surface-container, #faf7fb)" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 8 }}>
                      RSVP List
                    </p>
                    {loadingRsvps === event.id ? (
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>Loading…</p>
                    ) : (rsvpLists[event.id] ?? []).length === 0 ? (
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>No RSVPs yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(rsvpLists[event.id] ?? []).map((r) => (
                          <span key={r.id} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: "var(--primary-soft)", color: "var(--primary)" }}>
                            {r.name || r.email || "Member"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab({
  society,
  isCommittee,
  announce
}: {
  society: import("@/lib/types").Society;
  isCommittee: boolean;
  announce: (msg: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "committee" | "members">("all");
  const [profiles, setProfiles] = useState<import("@/lib/types").Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    getSocietyMembersAction(society.id)
      .then(setProfiles)
      .catch(() => {})
      .finally(() => setLoadingProfiles(false));
  }, [society.id]);

  const committeeNames = new Set(
    society.committee.map((e: string) => e.split("|")[0].trim().toLowerCase())
  );

  const committeeRows = society.committee.map((entry: string, i: number) => {
    const parts = entry.split("|");
    return { id: `committee-${i}`, name: parts[0].trim(), role: parts[1]?.trim() ?? "Committee" };
  });

  const memberProfiles = profiles.filter(
    (p) => !committeeNames.has(p.name.toLowerCase())
  );

  const allRows = [
    ...committeeRows.map((r) => ({ ...r, isCommitteeMember: true, email: "" })),
    ...memberProfiles.map((p) => ({ id: p.id, name: p.name, role: p.course ?? "Member", isCommitteeMember: false, email: p.email })),
  ];

  const displayed = filter === "committee"
    ? allRows.filter((r) => r.isCommitteeMember)
    : filter === "members"
    ? allRows.filter((r) => !r.isCommitteeMember)
    : allRows;

  function exportMembers() {
    downloadCsv(`${society.name.replace(/\s+/g, "-").toLowerCase()}-members.csv`, [
      ["Name", "Email", "Role", "Type"],
      ...allRows.map((r) => [r.name, r.email, r.role, r.isCommitteeMember ? "Committee" : "Member"]),
    ]);
    announce("Member list exported.");
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "committee", "members"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "1.5px solid",
                borderColor: filter === f ? "var(--primary)" : "var(--outline-variant, rgba(208,194,213,0.5))",
                background: filter === f ? "var(--primary-soft)" : "transparent",
                color: filter === f ? "var(--primary)" : "var(--muted)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {f === "all" ? `All (${allRows.length})` : f === "committee" ? `Committee (${committeeRows.length})` : `Members (${memberProfiles.length})`}
            </button>
          ))}
        </div>
        {isCommittee && allRows.length > 0 && (
          <button type="button" className="stitch-secondary" onClick={exportMembers} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <DownloadSimple size={14} /> Export CSV
          </button>
        )}
      </div>

      {loadingProfiles ? (
        <p style={{ color: "var(--muted)", fontSize: 13, padding: "16px 0" }}>Loading members…</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {displayed.length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: 13, padding: "8px 0" }}>
              {filter === "members" ? "No non-committee members yet." : "No members yet."}
            </p>
          )}
          {displayed.map((row) => (
            <div key={row.id} className="stitch-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: "var(--primary-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "var(--primary)", flexShrink: 0
              }}>
                {row.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{row.name || "(No name)"}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                  {row.role}{row.email ? ` · ${row.email}` : ""}
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999,
                background: row.isCommitteeMember ? "var(--secondary-container)" : "var(--surface-container)",
                color: row.isCommitteeMember ? "var(--on-secondary-container)" : "var(--muted)"
              }}>
                {row.isCommitteeMember ? "Committee" : "Member"}
              </span>
            </div>
          ))}
        </div>
      )}

      {isCommittee && (
        <div className="stitch-card" style={{ padding: 20, marginTop: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)", marginBottom: 12 }}>Admin Actions</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button type="button" className="stitch-secondary" onClick={() => announce("Share your society page link with prospective members.")}>
              <Plus size={14} /> Invite Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Media Tab ────────────────────────────────────────────────────────────────

function MediaTab({
  society,
  isCommittee,
  onSave
}: {
  society: import("@/lib/types").Society;
  isCommittee: boolean;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const [logoPreview, setLogoPreview] = useState<string | null>(society.logoUrl ?? null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(society.bannerUrl ?? null);
  const [gallery, setGallery] = useState<string[]>(society.galleryUrls ?? []);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function readFile(file: File, cb: (url: string) => void) {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) cb(e.target.result as string); };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <SectionCard title="Society Logo">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: logoPreview ? "transparent" : "var(--primary-soft)",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: 20,
            color: "var(--primary)", border: "2px dashed var(--outline-variant, rgba(208,194,213,0.5))",
            flexShrink: 0
          }}>
            {logoPreview ? <img src={logoPreview} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : society.logo}
          </div>
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
              Recommended: 400×400px, PNG or SVG. Max 2MB.
            </p>
            {isCommittee ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="stitch-secondary" onClick={() => logoRef.current?.click()}>
                  <Camera size={14} /> Upload Logo
                </button>
                {logoPreview && (
                  <button type="button" className="stitch-secondary" onClick={() => { setLogoPreview(null); onSave({ logoUrl: null }); }}>
                    <Trash size={14} /> Remove
                  </button>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Committee access required to upload.</p>
            )}
            <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) readFile(file, (url) => { setLogoPreview(url); onSave({ logoUrl: url }); });
              }}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Banner Image">
        <div
          style={{
            width: "100%",
            height: 140,
            borderRadius: 12,
            background: bannerPreview ? `url(${bannerPreview}) center/cover` : society.bannerColor ?? "var(--primary-soft)",
            border: "2px dashed var(--outline-variant, rgba(208,194,213,0.5))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            overflow: "hidden",
            position: "relative"
          }}
        >
          {!bannerPreview && (
            <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", margin: 0 }}>
              No banner uploaded — using theme colour
            </p>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          Recommended: 1200×400px, JPG or PNG. Max 5MB.
        </p>
        {isCommittee ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="stitch-secondary" onClick={() => bannerRef.current?.click()}>
              <Camera size={14} /> Upload Banner
            </button>
            {bannerPreview && (
              <button type="button" className="stitch-secondary" onClick={() => { setBannerPreview(null); onSave({ bannerUrl: null }); }}>
                <Trash size={14} /> Remove
              </button>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "var(--muted)" }}>Committee access required to upload.</p>
        )}
        <input ref={bannerRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file, (url) => { setBannerPreview(url); onSave({ bannerUrl: url }); });
          }}
        />
      </SectionCard>

      <SectionCard title="Photo Gallery">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 14 }}>
          {gallery.map((url, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", background: "var(--surface-container)" }}>
              <img src={url} alt={`Gallery ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {isCommittee && (
                <button
                  type="button"
                  onClick={() => { const next = gallery.filter((_, j) => j !== i); setGallery(next); onSave({ galleryUrls: next }); }}
                  style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {isCommittee && (
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              style={{ aspectRatio: "1", borderRadius: 10, border: "2px dashed var(--outline-variant, rgba(208,194,213,0.5))", background: "var(--surface-container, #faf7fb)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: "var(--muted)", fontSize: 12, fontWeight: 600 }}
            >
              <Plus size={20} />
              Add Photo
            </button>
          )}
        </div>
        {gallery.length === 0 && !isCommittee && (
          <p style={{ fontSize: 13, color: "var(--muted)" }}>No photos uploaded yet.</p>
        )}
        <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: "none" }}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            let loaded = 0;
            const newUrls: string[] = [];
            files.forEach((file) => readFile(file, (url) => {
              newUrls.push(url);
              loaded++;
              if (loaded === files.length) {
                const next = [...gallery, ...newUrls];
                setGallery(next);
                onSave({ galleryUrls: next });
              }
            }));
          }}
        />
      </SectionCard>
    </div>
  );
}

// ── Forums Tab ────────────────────────────────────────────────────────────────

function ForumsTab({
  societyId,
  isCommittee,
  announce
}: {
  societyId: string;
  isCommittee: boolean;
  announce: (msg: string) => void;
}) {
  const { localForums, setLocalForums } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [visibility, setVisibility] = useState<ForumBoard["visibility"]>("membership_restricted");
  const [creating, setCreating] = useState(false);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [pinDraft, setPinDraft] = useState("");

  const societyBoards = localForums.filter((b) => b.societyId === societyId);

  async function handleCreate() {
    const name = boardName.trim();
    if (!name) { announce("Board name is required."); return; }
    setCreating(true);
    const optimistic: ForumBoard = {
      id: `board-${Date.now()}`,
      name,
      visibility,
      societyId,
      threads: 0,
      replies: 0,
      pinned: "",
      locked: false,
    };
    const withNew = [...localForums, optimistic];
    setLocalForums(withNew);
    setBoardName("");
    setShowForm(false);
    announce(`Forum board "${name}" created.`);
    try {
      const created = await createForumBoardAction({ name, visibility, societyId });
      setLocalForums(withNew.map((b) => b.id === optimistic.id ? created : b));
    } catch {
      announce("Board created locally but failed to sync — please refresh.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSavePin(boardId: string) {
    const msg = pinDraft.trim();
    setLocalForums(localForums.map((b) => b.id === boardId ? { ...b, pinned: msg } : b));
    setEditingPinId(null);
    setPinDraft("");
    announce(msg ? "Pinned announcement saved." : "Pinned announcement cleared.");
    try {
      await updateForumBoardAction(boardId, { pinned: msg });
    } catch {
      announce("Saved locally but failed to sync.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          {societyBoards.length} board{societyBoards.length !== 1 ? "s" : ""} for this society
        </p>
        {isCommittee && (
          <button
            type="button"
            className="stitch-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus size={14} /> New Board
          </button>
        )}
      </div>

      {showForm && isCommittee && (
        <div className="stitch-card" style={{ padding: 20, marginBottom: 16, border: "1.5px solid var(--primary)" }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--on-surface)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            New Forum Board
          </h4>
          <FieldRow label="Board Name">
            <input
              style={inputStyle}
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="e.g. Events Feedback, General Chat"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </FieldRow>
          <FieldRow label="Visibility">
            <select
              style={inputStyle}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ForumBoard["visibility"])}
            >
              <option value="membership_restricted">Society members only</option>
              <option value="open_to_verified_users">All UKSSC members</option>
            </select>
          </FieldRow>
          <div style={{ display: "flex", gap: 10, marginTop: 4, justifyContent: "flex-end" }}>
            <button type="button" className="stitch-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="button" className="stitch-primary" onClick={handleCreate} disabled={creating}>
              <FloppyDisk size={14} /> Create Board
            </button>
          </div>
        </div>
      )}

      {societyBoards.length === 0 ? (
        <div className="stitch-card" style={{ padding: 32, textAlign: "center" }}>
          <ChatCircleText size={32} style={{ color: "var(--muted)", marginBottom: 10 }} />
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            No forum boards yet.{isCommittee ? " Create one above to start discussions." : ""}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {societyBoards.map((board) => (
            <div key={board.id} className="stitch-card" style={{ padding: "14px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: "var(--primary-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {board.locked ? <Lock size={16} style={{ color: "var(--primary)" }} /> : <ChatCircleText size={16} style={{ color: "var(--primary)" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{board.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {board.threads} thread{board.threads !== 1 ? "s" : ""} &middot; {board.replies} repl{board.replies !== 1 ? "ies" : "y"}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999,
                  background: board.visibility === "membership_restricted" ? "var(--secondary-container)" : "var(--primary-soft)",
                  color: board.visibility === "membership_restricted" ? "var(--on-secondary-container)" : "var(--primary)"
                }}>
                  {board.visibility === "membership_restricted" ? "Members only" : "Open"}
                </span>
                {board.locked && (
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: "var(--surface-container)", color: "var(--muted)" }}>
                    Locked
                  </span>
                )}
                {isCommittee && (
                  <>
                    <button
                      type="button"
                      title={board.locked ? "Unlock board (allow new threads)" : "Lock board (prevent new threads)"}
                      onClick={() => {
                        const next = !board.locked;
                        setLocalForums(localForums.map((b) => b.id === board.id ? { ...b, locked: next } : b));
                        announce(next ? `"${board.name}" locked.` : `"${board.name}" unlocked.`);
                        updateForumBoardAction(board.id, { locked: next }).catch(() => announce("Saved locally but failed to sync."));
                      }}
                      style={{
                        background: board.locked ? "var(--warning-bg)" : "none",
                        border: "1px solid " + (board.locked ? "#d97706" : "rgba(208,194,213,0.4)"),
                        borderRadius: 6, padding: "4px 8px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 600,
                        color: board.locked ? "var(--warning-text)" : "var(--muted)",
                      }}
                    >
                      <Lock size={12} weight={board.locked ? "fill" : "regular"} />
                      {board.locked ? "Locked" : "Lock"}
                    </button>
                    <button
                      type="button"
                      title={board.pinned ? "Edit pinned announcement" : "Add pinned announcement"}
                      onClick={() => { setEditingPinId(board.id); setPinDraft(board.pinned ?? ""); }}
                      style={{
                        background: board.pinned ? "var(--primary-soft)" : "none",
                        border: "1px solid " + (board.pinned ? "var(--primary)" : "rgba(208,194,213,0.4)"),
                        borderRadius: 6, padding: "4px 8px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 600,
                        color: board.pinned ? "var(--primary)" : "var(--muted)",
                      }}
                    >
                      <PushPin size={12} weight={board.pinned ? "fill" : "regular"} />
                      {board.pinned ? "Pinned" : "Pin"}
                    </button>
                  </>
                )}
              </div>

              {editingPinId === board.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--outline-variant)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted)", marginBottom: 8 }}>
                    Pinned Announcement
                  </div>
                  <textarea
                    value={pinDraft}
                    onChange={(e) => setPinDraft(e.target.value)}
                    placeholder="e.g. Welcome! Please read the pinned rules before posting."
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical", width: "100%", fontFamily: "inherit" }}
                    autoFocus
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                    <button type="button" className="stitch-secondary" onClick={() => setEditingPinId(null)}>Cancel</button>
                    <button type="button" className="stitch-primary" onClick={() => handleSavePin(board.id)}>
                      <FloppyDisk size={13} /> Save
                    </button>
                  </div>
                </div>
              )}

              {!editingPinId && board.pinned && (
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--outline-variant)",
                  display: "flex", alignItems: "flex-start", gap: 8,
                }}>
                  <PushPin size={12} weight="fill" style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: "var(--on-surface)", margin: 0, lineHeight: 1.5, flex: 1 }}>{board.pinned}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
