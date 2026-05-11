"use client";

import {
  ArrowLeft,
  CalendarBlank,
  Camera,
  CheckCircle,
  FloppyDisk,
  Image as ImageIcon,
  Link as LinkIcon,
  PencilSimple,
  Plus,
  Trash,
  User,
  UsersThree,
  Warning,
  X
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-context";
import {
  checkInAction,
  createEventAction,
  getEventRsvpsAction,
  getSocietyMembersAction,
  updateMemberRoleAction,
  updateSocietyAction,
} from "@/lib/actions";
import { universities } from "@/lib/data";
import type { EventDraft, EventRsvpRow, MemberRow, OrchidEvent, Role } from "@/lib/types";

type Tab = "profile" | "events" | "members" | "media";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; weight?: "regular" | "fill" }> }[] = [
  { id: "profile", label: "Profile", icon: PencilSimple },
  { id: "events", label: "Events", icon: CalendarBlank },
  { id: "members", label: "Members", icon: UsersThree },
  { id: "media", label: "Media", icon: ImageIcon }
];

const EVENT_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: "var(--secondary-container)", color: "var(--on-secondary-container)" },
  waitlist: { bg: "#fff3cd", color: "#856404" },
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
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#856404", background: "#fff3cd", padding: "6px 12px", borderRadius: 8 }}>
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
          }}
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
  const [draft, setDraft] = useState<EventDraft>({
    title: "",
    type: "society",
    startsAt: "",
    location: "",
    capacity: 50
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [checkInEventId, setCheckInEventId] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvpRow[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  useEffect(() => {
    if (!checkInEventId) { setRsvps([]); return; }
    setLoadingRsvps(true);
    getEventRsvpsAction(checkInEventId)
      .then(setRsvps)
      .catch(() => setRsvps([]))
      .finally(() => setLoadingRsvps(false));
  }, [checkInEventId]);

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
      }).then((saved) => {
        setAllEvents(allWithOptimistic.map((e) => e.id === optimistic.id ? saved : e));
        setLocalEvents(localWithOptimistic.map((e) => e.id === optimistic.id ? saved : e));
      }).catch(() => announce("Event saved locally but failed to sync. Please refresh."));
    }
    setShowForm(false);
    setEditId(null);
    setDraft({ title: "", type: "society", startsAt: "", location: "", capacity: 50 });
  }

  function handleEdit(event: OrchidEvent) {
    setDraft({ title: event.title, type: event.type, startsAt: event.startsAt, location: event.location, capacity: event.capacity });
    setEditId(event.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setLocalEvents((prev) => prev.filter((e) => e.id !== id));
    setAllEvents(allEvents.filter((e) => e.id !== id));
    announce("Event removed.");
  }

  return (
    <div>
      {isCommittee && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button type="button" className="stitch-primary" onClick={() => { setShowForm(true); setEditId(null); setDraft({ title: "", type: "society", startsAt: "", location: "", capacity: 50 }); }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FieldRow label="Date & Time *">
                <input style={inputStyle} type="datetime-local" value={draft.startsAt.slice(0, 16)} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
              </FieldRow>
              <FieldRow label="Location *">
                <input style={inputStyle} value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Bloomsbury, London" />
              </FieldRow>
            </div>
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
              <div key={event.id}>
              <div className="stitch-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
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
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => setCheckInEventId(checkInEventId === event.id ? null : event.id)} style={{ border: 0, background: checkInEventId === event.id ? "var(--primary-soft)" : "none", cursor: "pointer", color: "var(--primary)", padding: "6px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700 }}>
                      <CheckCircle size={14} /> Check-in
                    </button>
                    <button type="button" onClick={() => handleEdit(event)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--primary)", padding: 6, borderRadius: 6, display: "flex" }}>
                      <PencilSimple size={15} />
                    </button>
                    <button type="button" onClick={() => handleDelete(event.id)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)", padding: 6, borderRadius: 6, display: "flex" }}>
                      <Trash size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Check-in panel */}
              {checkInEventId === event.id && (
                <div style={{ borderTop: "1px solid var(--outline-variant, rgba(208,194,213,0.3))", marginTop: 12, paddingTop: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--on-surface)", marginBottom: 10 }}>
                    RSVPs — {rsvps.filter((r) => r.checkedInAt).length}/{rsvps.length} checked in
                  </p>
                  {loadingRsvps ? (
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>Loading RSVPs…</p>
                  ) : rsvps.length === 0 ? (
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>No RSVPs yet.</p>
                  ) : (
                    <div style={{ display: "grid", gap: 6 }}>
                      {rsvps.map((rsvp) => {
                        const checked = !!rsvp.checkedInAt;
                        return (
                          <div key={rsvp.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: checked ? "var(--secondary-container)" : "var(--surface-container, #faf7fb)" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--primary)", flexShrink: 0 }}>
                              {rsvp.profileName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--on-surface)" }}>{rsvp.profileName}</span>
                            {checked ? (
                              <span style={{ fontSize: 11, color: "var(--on-secondary-container)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                <CheckCircle size={13} weight="fill" /> {new Date(rsvp.checkedInAt!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            ) : (
                              <button
                                type="button"
                                style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, border: "1.5px solid var(--primary)", background: "none", color: "var(--primary)", cursor: "pointer" }}
                                onClick={async () => {
                                  await checkInAction(rsvp.id, event.id);
                                  const now = new Date().toISOString();
                                  setRsvps((prev) => prev.map((r) => r.id === rsvp.id ? { ...r, checkedInAt: now } : r));
                                  setLocalEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, checkedIn: e.checkedIn + 1 } : e));
                                  setAllEvents(allEvents.map((e) => e.id === event.id ? { ...e, checkedIn: e.checkedIn + 1 } : e));
                                  announce(`${rsvp.profileName} checked in.`);
                                }}
                              >
                                Check in
                              </button>
                            )}
                          </div>
                        );
                      })}
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

const ROLE_LABELS: Record<string, string> = {
  student_member: "Student",
  society_admin: "Society Admin",
  ukssc_staff: "UKSSC Staff",
  finance_reviewer: "Finance",
  alumni: "Alumni",
  sponsor: "Sponsor",
  super_admin: "Super Admin",
};

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
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getSocietyMembersAction(society.id)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [society.id]);

  function exportCsv() {
    const rows = [
      ["Name", "Email", "Role", "Verified", "Course", "Year", "Joined"],
      ...members.map((m) => [
        m.name, m.email, m.role, m.verified ? "Yes" : "No",
        m.course ?? "", m.year ?? "",
        m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("en-GB") : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${society.name.replace(/\s+/g, "-")}-members.csv`;
    a.click();
    announce("Member list exported.");
  }

  async function changeRole(member: MemberRow, role: Role) {
    setUpdatingRole(member.id);
    try {
      await updateMemberRoleAction(member.id, role);
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role } : m));
      announce(`${member.name}'s role updated to ${ROLE_LABELS[role] ?? role}.`);
    } catch {
      announce("Failed to update role.");
    } finally {
      setUpdatingRole(null);
    }
  }

  const committeeNames = new Set(
    society.committee.map((e: string) => e.split("|")[0].trim().toLowerCase())
  );
  const committeeMembers = members.filter((m) => committeeNames.has(m.name.toLowerCase()) || m.role === "society_admin");
  const regularMembers = members.filter((m) => !committeeNames.has(m.name.toLowerCase()) && m.role !== "society_admin");

  const displayed = filter === "committee" ? committeeMembers : filter === "members" ? regularMembers : members;

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
                textTransform: "capitalize",
              }}
            >
              {f === "all" ? `All (${members.length})` : f === "committee" ? `Committee (${committeeMembers.length})` : `Members (${regularMembers.length})`}
            </button>
          ))}
        </div>
        {isCommittee && (
          <button type="button" className="stitch-secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={exportCsv}>
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>Loading members…</p>
      ) : displayed.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>
          {filter === "all" ? "No members yet — share the society's join link." : `No ${filter} members yet.`}
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {displayed.map((row) => (
            <div key={row.id} className="stitch-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: "var(--primary-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "var(--primary)", flexShrink: 0,
              }}>
                {row.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                  {row.email}
                  {row.course && ` · ${row.course}`}
                  {row.year && ` · ${row.year}`}
                </div>
              </div>
              {isCommittee ? (
                <select
                  value={row.role}
                  disabled={updatingRole === row.id}
                  onChange={(e) => changeRole(row, e.target.value as Role)}
                  style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))", background: "var(--surface-bright, #fff)", color: "var(--on-surface)", cursor: "pointer" }}
                  aria-label={`Change role for ${row.name}`}
                >
                  {(["student_member", "society_admin", "alumni"] as Role[]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "3px 10px", borderRadius: 999, background: "var(--secondary-container)", color: "var(--on-secondary-container)", flexShrink: 0 }}>
                  {ROLE_LABELS[row.role] ?? row.role}
                </span>
              )}
              <span
                title={row.verified ? "Verified" : "Unverified"}
                style={{ width: 8, height: 8, borderRadius: "50%", background: row.verified ? "var(--on-secondary-container)" : "var(--muted)", flexShrink: 0 }}
              />
            </div>
          ))}
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
