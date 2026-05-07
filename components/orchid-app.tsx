"use client";

import {
  Article,
  Bell,
  CalendarBlank,
  CaretUp,
  ChartLineUp,
  ChatCircleText,
  CheckCircle,
  DownloadSimple,
  FileArrowUp,
  GearSix,
  House,
  Leaf,
  List,
  MagnifyingGlass,
  MapPin,
  Question,
  SignOut,
  Storefront,
  Tag,
  UsersThree,
  Wallet
} from "@phosphor-icons/react";
import { useState } from "react";
import { claims, forums, resources, societies } from "@/lib/data";
import type { ClaimStatus, ReimbursementClaim } from "@/lib/types";

type View = "dashboard" | "societies" | "events" | "forums" | "resources" | "admin" | "claims";

const navItems: { id: View; label: string; icon: React.ComponentType<{ size?: number; weight?: "regular" | "fill" | "bold" }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: House },
  { id: "societies", label: "Societies", icon: UsersThree },
  { id: "events", label: "Events", icon: CalendarBlank },
  { id: "forums", label: "Forums", icon: ChatCircleText },
  { id: "resources", label: "Resources", icon: Article },
  { id: "admin", label: "Admin", icon: ChartLineUp }
];

const imageUrls = {
  profile: "/media/profile.jpg",
  society: "/media/ucl-logo.jpg",
  warwick: "/media/warwick-logo.jpg",
  edin: "/media/edin-logo.jpg",
  social: "/media/social.jpg",
  summit: "/media/summit.jpg",
  mixer: "/media/mixer.jpg",
  career: "/media/career.jpg",
  sports: "/media/sports.jpg"
};

type ThreadItem = {
  id: string;
  title: string;
  count: string;
  meta: string;
};

export function OrchidApp() {
  const [view, setView] = useState<View>("dashboard");
  const [rsvp, setRsvp] = useState(false);
  const [joinedSociety, setJoinedSociety] = useState("UCL Singapore Society");
  const [toast, setToast] = useState("University email verified: janelle.ho.26@ucl.ac.uk maps to UCL Singapore Society.");
  const [claimStatuses, setClaimStatuses] = useState<Record<string, ClaimStatus>>({});
  const [threads, setThreads] = useState<ThreadItem[]>([
    { id: "thread-1", title: "Best places for authentic Chicken Rice in London?", count: "42", meta: "@foodie_sg · 18 replies · 2 hrs ago" },
    { id: "thread-2", title: "Housing tips for 2nd years moving out of halls", count: "28", meta: "Advice · 5 replies · 5 hrs ago" }
  ]);

  function announce(message: string) {
    setToast(message);
  }

  return (
    <div className="stitch-app">
      <Sidebar view={view} setView={setView} />
      <div className="stitch-body">
        <TopBar view={view} setView={setView} />
        {toast ? <div className="toast" role="status">{toast}</div> : null}
        {view === "dashboard" && <DashboardView rsvp={rsvp} setRsvp={setRsvp} threads={threads} announce={announce} />}
        {view === "societies" && <SocietyDirectory joinedSociety={joinedSociety} setJoinedSociety={setJoinedSociety} announce={announce} />}
        {view === "events" && <EventsHub rsvp={rsvp} setRsvp={setRsvp} announce={announce} />}
        {view === "forums" && <ForumsView threads={threads} setThreads={setThreads} announce={announce} />}
        {view === "resources" && <ResourcesView />}
        {view === "admin" && <AdminView />}
        {view === "claims" && <ClaimsView claimStatuses={claimStatuses} setClaimStatuses={setClaimStatuses} announce={announce} />}
        <Footer />
      </div>
    </div>
  );
}

function Sidebar({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <aside className="stitch-sidebar">
      <div className="stitch-brand">
        <strong>Project Orchid</strong>
        <span>UKSSC Community</span>
      </div>
      <nav className="stitch-nav" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button key={item.id} className={`stitch-nav-item ${active ? "active" : ""}`} onClick={() => setView(item.id)} type="button">
              <Icon size={17} weight={active ? "fill" : "regular"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="stitch-sidebar-bottom">
        <button className="stitch-primary full" onClick={() => setView("claims")} type="button">Submit Reimbursement</button>
        <button className="stitch-nav-item" type="button"><GearSix size={17} /> Settings</button>
        <button className="stitch-nav-item" type="button"><SignOut size={17} /> Logout</button>
      </div>
    </aside>
  );
}

function TopBar({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <header className="stitch-topbar">
      <div className="mobile-brand">
        <button className="icon-button" type="button"><List size={20} /></button>
        <strong>Project Orchid</strong>
      </div>
      <div className="stitch-search">
        <MagnifyingGlass size={15} />
        <input placeholder={view === "societies" ? "Search societies..." : "Search Orchid..."} aria-label="Search Orchid" />
      </div>
      <div className="mobile-tabs" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} type="button">
            {item.label}
          </button>
        ))}
      </div>
      <div className="top-actions">
        <button className="icon-button notify" type="button"><Bell size={18} /></button>
        <button className="icon-button hide-sm" type="button"><Question size={18} /></button>
        <img className="profile-image" src={imageUrls.profile} alt="Wei profile" />
      </div>
    </header>
  );
}

function DashboardView({
  rsvp,
  setRsvp,
  threads,
  announce
}: {
  rsvp: boolean;
  setRsvp: (value: boolean) => void;
  threads: ThreadItem[];
  announce: (message: string) => void;
}) {
  return (
    <main className="stitch-main">
      <PageHeader title="Welcome back, Wei!" copy="Here's what's happening in your UKSSC network today." action="New Post" onAction={() => announce("Open the Forums tab to publish a new verified community post.")} />
      <section className="bento-grid">
        <article className="stitch-card bento-wide feature-card">
          <div className="card-heading">
            <span className="pill green">Featured Event</span>
            <button className="dot-button" type="button">...</button>
          </div>
          <h3>UKSSC Annual Career Fair 2024</h3>
          <p>Connect with top employers in Singapore and the UK. Exclusive networking sessions available for pre-registered attendees.</p>
          <div className="meta-row">
            <span><CalendarBlank size={16} /> Oct 25, 2024</span>
            <span><MapPin size={16} /> Central Hall, London</span>
          </div>
          <div className="card-footer">
            <div className="avatar-stack">
              <img src={imageUrls.profile} alt="Attendee avatar" />
              <img src={imageUrls.society} alt="Attendee avatar" />
              <span>+142</span>
            </div>
            <button
              className="stitch-primary"
              onClick={() => {
                setRsvp(!rsvp);
                announce(rsvp ? "RSVP cancelled for UKSSC Annual Career Fair 2024." : "RSVP confirmed. Your QR check-in will appear before the event.");
              }}
              type="button"
            >
              {rsvp ? "RSVP'd" : "RSVP Now"}
            </button>
          </div>
        </article>

        <article className="stitch-card society-quick">
          <div className="soft-blob" />
          <div className="society-head">
            <div className="society-icon"><Storefront size={28} weight="fill" /></div>
            <div>
              <h3>UCL SingSoc</h3>
              <span>Your Primary Society</span>
            </div>
          </div>
          <div className="notice-card">
            <strong>Announcement</strong>
            <p>Hoodie collection is happening this Friday at the Student Union.</p>
          </div>
          <div className="mini-between"><span>Next Event: <b>Welcome Dinner</b></span><b>Attending</b></div>
          <button className="stitch-secondary-muted full" type="button">View Society Page</button>
        </article>

        <article className="stitch-card image-card">
          <div className="image-wrap">
            <img src={imageUrls.social} alt="LSE Soc Malam" />
            <span>Social</span>
          </div>
          <h3>LSE Soc Malam</h3>
          <p>Annual cross-uni night out at Heaven.</p>
          <div className="mini-between"><span>Nov 2 • 10PM</span><a>Get Tickets →</a></div>
        </article>

        <article className="stitch-card bento-wide">
          <div className="section-row">
            <h3><ChatCircleText size={22} weight="fill" /> Trending Discussions</h3>
            <a>View All</a>
          </div>
          {threads.slice(0, 2).map((thread) => <Thread key={thread.id} title={thread.title} count={thread.count} meta={thread.meta} />)}
        </article>

        <article className="stitch-card bento-wide">
          <h3>Recent Activity</h3>
          <TimelineItem tone="green" text="You RSVP'd to UCL SingSoc Welcome Dinner" time="Yesterday, 14:30" />
          <TimelineItem tone="purple" text="Checked in at Imperial SG Freshers Mixer" time="Oct 12, 19:00" />
          <TimelineItem tone="muted" text="Joined the London Career Network forum group" time="Oct 10, 10:15" />
        </article>
      </section>
    </main>
  );
}

function SocietyDirectory({
  joinedSociety,
  setJoinedSociety,
  announce
}: {
  joinedSociety: string;
  setJoinedSociety: (society: string) => void;
  announce: (message: string) => void;
}) {
  const active = [
    ["UCL Singapore Society", "University College London", "320 Members", "London", imageUrls.society, "High Activity"],
    ["Warwick Singsoc", "University of Warwick", "250 Members", "Midlands", imageUrls.warwick, "Event Today"],
    ["Edin Singsoc", "University of Edinburgh", "180 Members", "Scotland", imageUrls.edin, ""]
  ];
  const all = [
    ["I", "Imperial Singsoc", "Imperial College London", "London", "410"],
    ["K", "KCL Singsoc", "King's College London", "London", "280"],
    ["M", "Manchester Singsoc", "University of Manchester", "North West", "195"],
    ["O", "OUMSSA", "University of Oxford", "South East", "150"]
  ];
  function joinSociety(name: string) {
    if (name !== "UCL Singapore Society") {
      announce("Join blocked: verified UCL email accounts can only join UCL Singapore Society in v1.");
      return;
    }

    setJoinedSociety(name);
    announce("Joined UCL Singapore Society. This mirrors the v1 university-domain membership rule.");
  }

  return (
    <main className="stitch-main">
      <PageHeader title="Society Directory" copy="Find and join Singaporean societies across the UK." filters={["All Regions", "London", "Scotland", "Midlands", "More"]} />
      <section>
        <div className="subheading"><Leaf size={18} weight="fill" /><h3>Recently Active</h3></div>
        <div className="directory-highlight-grid">
          {active.map(([name, uni, members, region, img, badge]) => (
            <article className="stitch-card directory-card" key={name}>
              <div className="directory-deco" />
              <div className="directory-head">
                <img src={img} alt={`${name} logo`} />
                {badge ? <span className="mini-badge">{badge}</span> : null}
              </div>
              <h4>{name}</h4>
              <p>{uni}</p>
              <div className="meta-row compact"><span><UsersThree size={15} /> {members}</span><span><MapPin size={15} /> {region}</span></div>
              <button className="stitch-secondary full" onClick={() => joinSociety(name)} type="button">
                {joinedSociety === name ? "Joined" : "Join Society"} <CheckCircle size={14} weight="fill" />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="section-row rule">
          <h3>All Societies</h3>
          <span>Showing 45 results</span>
        </div>
        <div className="all-societies-grid">
          {all.map(([letter, name, uni, region, members]) => (
            <article className="stitch-card small-society" key={name}>
              <div className="letter-logo">{letter}</div>
              <h4>{name}</h4>
              <p>{uni}</p>
              <span className="region-pill">{region}</span>
              <div className="small-card-footer"><span>{members}</span><button type="button" onClick={() => announce("Join blocked: this student account is mapped to UCL Singapore Society.")}>Join →</button></div>
            </article>
          ))}
        </div>
        <div className="center"><button className="outline-pill" type="button">Load More Societies</button></div>
      </section>
    </main>
  );
}

function EventsHub({
  rsvp,
  setRsvp,
  announce
}: {
  rsvp: boolean;
  setRsvp: (value: boolean) => void;
  announce: (message: string) => void;
}) {
  return (
    <main className="stitch-main">
      <PageHeader title="Discovery Hub" copy="Find and join events happening across the UKSSC network." filters={["All Events", "My University Only"]} />
      <section className="event-hero-grid">
        <div className="event-hero-image">
          <img src={imageUrls.summit} alt="Featured event" />
          <div>
            <span className="pill green">Featured • Career</span>
            <h2>UKSSC Annual Tech & Finance Summit 2024</h2>
            <p>Oct 15, 2024 · ExCeL London</p>
          </div>
        </div>
        <article className="stitch-card event-about">
          <h3>About this event</h3>
          <p>Join over 500+ Singaporean students across the UK for our flagship networking event. Connect with top recruiters from global finance and technology firms looking for talent like you.</p>
          <div className="host-row"><span>UK</span><div><b>Hosted by</b><p>UKSSC Exco</p></div></div>
          <button
            className="stitch-primary full"
            onClick={() => {
              setRsvp(!rsvp);
              announce(rsvp ? "RSVP cancelled for the Tech & Finance Summit." : "RSVP confirmed for the Tech & Finance Summit. QR check-in enabled.");
            }}
            type="button"
          >
            {rsvp ? "RSVP confirmed" : "RSVP Now"}
          </button>
        </article>
      </section>
      <div className="category-row">
        {["All Categories", "Career", "Social", "Sports", "Academic"].map((item, index) => <button className={index === 0 ? "active" : ""} key={item} type="button">{item}</button>)}
      </div>
      <section>
        <div className="section-row"><h3>Upcoming Events</h3><span><List size={18} /></span></div>
        <div className="event-card-grid">
          <EventCard image={imageUrls.mixer} type="Social" title="Autumn term Welcome Mixer" place="UCL Student Centre" date="Nov 12" host="UCL SingSoc" />
          <EventCard image={imageUrls.career} type="Career" title="Consulting Prep Workshop" place="Online (Zoom)" date="Nov 18" host="Warwick SingSoc" />
          <EventCard image={imageUrls.sports} type="Sports" title="Inter-Uni Badminton Tournament" place="Imperial College Ethos" date="Nov 24" host="Imperial SingSoc" />
        </div>
      </section>
    </main>
  );
}

function ForumsView({
  threads,
  setThreads,
  announce
}: {
  threads: ThreadItem[];
  setThreads: (threads: ThreadItem[]) => void;
  announce: (message: string) => void;
}) {
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
          {forums.map((forum) => <Thread key={forum.id} title={forum.name} count={String(forum.threads)} meta={`${forum.replies} replies · ${forum.visibility === "membership_restricted" ? "Society board" : "Open board"}`} />)}
        </article>
        <article className="stitch-card">
          <h3>New Thread</h3>
          <div className="stitch-form forum-composer">
            <label>Board
              <select value={draftBoard} onChange={(event) => setDraftBoard(event.target.value)} aria-label="Forum board">
                <option>Open Boards</option>
                <option>UCL committee board</option>
                <option>Sponsor opportunities</option>
              </select>
            </label>
            <label>Thread title
              <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="Ask about airport pickup groups" />
            </label>
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

function ResourcesView() {
  const [category, setCategory] = useState("All");
  const filteredResources = category === "All" ? resources : resources.filter((resource) => resource.category === category.toLowerCase());

  return (
    <main className="stitch-main">
      <PageHeader title="Resource Library" copy="Guides, articles and UKSSC announcements for students and committees." />
      <div className="category-row">
        {["All", "Guide", "Announcement", "Article"].map((item) => (
          <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} type="button">
            {item}
          </button>
        ))}
      </div>
      <section className="resource-grid">
        {filteredResources.map((resource) => (
          <article className="stitch-card resource-card" key={resource.id}>
            <span className="pill">{resource.category}</span>
            <h3>{resource.title}</h3>
            <p>{resource.audience}</p>
            <div className="card-footer"><span>{resource.publishedAt}</span><a>Read →</a></div>
          </article>
        ))}
        {filteredResources.length === 0 ? <article className="stitch-card resource-card"><h3>No resources yet</h3><p>UKSSC staff can publish this category from the admin workflow.</p></article> : null}
      </section>
    </main>
  );
}

function AdminView() {
  const totalMembers = societies.reduce((sum, society) => sum + society.members, 0);
  function exportAdminReport() {
    downloadCsv("project-orchid-admin-report.csv", [
      ["Metric", "Value"],
      ["Total Members", String(totalMembers)],
      ["Active Societies", "32"],
      ["RSVP Conversion Rate", "61%"],
      ["Open Claims", "14"]
    ]);
  }

  return (
    <main className="stitch-main">
      <PageHeader title="Admin Dashboard" copy="Operational metrics for UKSSC staff, with society-scoped data boundaries ready for rollout." action="Export Report" onAction={exportAdminReport} />
      <section className="metric-grid">
        <Metric label="Total Members" value={String(totalMembers)} width="78%" />
        <Metric label="Active Societies" value="32" width="64%" />
        <Metric label="RSVP Conv. Rate" value="61%" width="61%" />
        <Metric label="Open Claims" value="14" width="42%" />
      </section>
      <section className="two-column">
        <article className="stitch-card chart-card"><h3>Membership Growth</h3><div className="fake-chart"><span /><span /><span /><span /><span /></div></article>
        <article className="stitch-card">
          <h3>Activity Feed</h3>
          <TimelineItem tone="green" text="UCL Singapore Society created Annual Freshers Dinner" time="8 minutes ago" />
          <TimelineItem tone="purple" text="Warwick Singsoc crossed 250 verified members" time="1 hour ago" />
          <TimelineItem tone="muted" text="Finance marked one reimbursement paid" time="Today" />
        </article>
      </section>
    </main>
  );
}

function ClaimsView({
  claimStatuses,
  setClaimStatuses,
  announce
}: {
  claimStatuses: Record<string, ClaimStatus>;
  setClaimStatuses: (value: Record<string, ClaimStatus>) => void;
  announce: (message: string) => void;
}) {
  const [localClaims, setLocalClaims] = useState<ReimbursementClaim[]>(claims);
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");

  function submitClaim() {
    const parsedAmount = Number(amount);
    if (!purpose.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      announce("Add a purpose and valid amount before submitting a claim.");
      return;
    }

    const newClaim: ReimbursementClaim = {
      id: `claim-${Date.now()}`,
      claimant: "Janelle Ho",
      societyId: "ucl-singapore",
      amount: parsedAmount,
      purpose: purpose.trim(),
      status: "submitted",
      submittedAt: new Date().toISOString().slice(0, 10),
      receiptName: "uploaded-receipt"
    };

    setLocalClaims([newClaim, ...localClaims]);
    setPurpose("");
    setAmount("");
    announce("Reimbursement claim submitted to UKSSC finance.");
  }

  function exportClaims() {
    downloadCsv("project-orchid-reimbursements.csv", [
      ["Claimant", "Purpose", "Amount", "Status"],
      ...localClaims.map((claim) => [claim.claimant, claim.purpose, claim.amount.toFixed(2), claimStatuses[claim.id] ?? claim.status])
    ]);
    announce("Claims CSV generated.");
  }

  return (
    <main className="stitch-main">
      <PageHeader title="Reimbursements Portal" copy="Submit receipts, route claims to UKSSC finance and track paid status." action="New Claim" />
      <section className="two-column">
        <article className="stitch-card table-card">
          <div className="section-row"><h3>Finance Review</h3><button className="text-action" type="button" onClick={exportClaims}><DownloadSimple size={16} /> Export</button></div>
          <table>
            <thead><tr><th>Claimant</th><th>Purpose</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {localClaims.map((claim) => {
                const status = claimStatuses[claim.id] ?? claim.status;
                return (
                  <tr key={claim.id}>
                    <td>{claim.claimant}</td>
                    <td>{claim.purpose}</td>
                    <td>GBP {claim.amount.toFixed(2)}</td>
                    <td>
                      <select
                        value={status}
                        onChange={(event) => {
                          setClaimStatuses({ ...claimStatuses, [claim.id]: event.target.value as ClaimStatus });
                          announce(`${claim.claimant}'s claim marked ${event.target.value.replace("_", " ")}.`);
                        }}
                        aria-label={`Update ${claim.claimant} claim status`}
                      >
                        {(["submitted", "under_review", "approved", "rejected", "paid"] as ClaimStatus[]).map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>
        <article className="stitch-card">
          <h3>Submit Claim</h3>
          <form className="stitch-form">
            <label>Purpose<input value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Event supplies" /></label>
            <label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="86.40" inputMode="decimal" /></label>
            <label>Receipt<input type="file" /></label>
            <button className="stitch-secondary full" type="button" onClick={submitClaim}><FileArrowUp size={16} /> Submit Claim</button>
          </form>
        </article>
      </section>
    </main>
  );
}

function PageHeader({
  title,
  copy,
  action,
  filters,
  onAction
}: {
  title: string;
  copy: string;
  action?: string;
  filters?: string[];
  onAction?: () => void;
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {filters ? (
        <div className="filter-row">{filters.map((filter, index) => <button key={filter} className={index === 0 ? "active" : ""} type="button">{filter}</button>)}</div>
      ) : action ? (
        <button className="stitch-soft-action" onClick={onAction} type="button">{action}</button>
      ) : null}
    </div>
  );
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Thread({ title, count, meta }: { title: string; count: string; meta: string }) {
  return (
    <div className="thread-row">
      <div className="vote-box"><CaretUp size={15} /><span>{count}</span></div>
      <div><h4>{title}</h4><p>{meta}</p></div>
    </div>
  );
}

function TimelineItem({ tone, text, time }: { tone: "green" | "purple" | "muted"; text: string; time: string }) {
  return (
    <div className="timeline-item">
      <span className={`timeline-dot ${tone}`} />
      <p>{text}</p>
      <small>{time}</small>
    </div>
  );
}

function EventCard({ image, type, title, place, date, host }: { image: string; type: string; title: string; place: string; date: string; host: string }) {
  const [month, day] = date.split(" ");
  return (
    <article className="stitch-card event-card">
      <div className="event-image"><img src={image} alt={title} /><span><Tag size={14} /> {type}</span></div>
      <div className="event-body">
        <div className="date-box"><span>{month}</span><b>{day}</b></div>
        <div><h3>{title}</h3><p><MapPin size={15} /> {place}</p></div>
      </div>
      <div className="card-footer"><span>By {host}</span><a>Details →</a></div>
    </article>
  );
}

function Metric({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <article className="stitch-card metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <div><i style={{ width }} /></div>
    </article>
  );
}

function Footer() {
  return (
    <footer className="stitch-footer">
      <div><strong>Project Orchid</strong><p>© 2024 UKSSC Project Orchid. Built for Singaporeans in the UK.</p></div>
      <nav><a>About UKSSC</a><a>Privacy Policy</a><a>Contact Support</a><a>Terms of Service</a></nav>
    </footer>
  );
}
