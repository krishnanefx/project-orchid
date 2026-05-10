"use client";

import { CalendarBlank, ChatCircleText, MapPin, Storefront } from "@phosphor-icons/react";
import Image from "next/image";
import { useApp } from "@/lib/app-context";
import { imageUrls, PageHeader, Thread, TimelineItem } from "@/components/ui/primitives";

export function DashboardView() {
  const { rsvp, setRsvp, threads, announce, currentUser } = useApp();
  const firstName = currentUser.name.split(" ")[0];
  return (
    <main className="stitch-main">
      <PageHeader title={`Welcome back, ${firstName}!`} copy="Here's what's happening in your UKSSC network today." action="New Post" onAction={() => announce("Open the Forums tab to publish a new verified community post.")} />
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
              <Image src={imageUrls.profile} alt="Attendee avatar" width={32} height={32} />
              <Image src={imageUrls.society} alt="Attendee avatar" width={32} height={32} />
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
            <Image src={imageUrls.social} alt="LSE Soc Malam" fill style={{ objectFit: "cover" }} />
            <span>Social</span>
          </div>
          <h3>LSE Soc Malam</h3>
          <p>Annual cross-uni night out in London.</p>
          <div className="mini-between"><span>Nov 2 • 10PM</span><button type="button">Get Tickets →</button></div>
        </article>

        <article className="stitch-card bento-wide">
          <div className="section-row">
            <h3><ChatCircleText size={22} weight="fill" /> Trending Discussions</h3>
            <button type="button">View All</button>
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
