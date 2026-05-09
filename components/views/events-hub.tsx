"use client";

import { List } from "@phosphor-icons/react";
import Image from "next/image";
import { useApp } from "@/lib/app-context";
import { imageUrls, EventCard, PageHeader } from "@/components/ui/primitives";

export function EventsHub() {
  const { rsvp, setRsvp, announce } = useApp();
  return (
    <main className="stitch-main">
      <PageHeader title="Discovery Hub" copy="Find and join events happening across the UKSSC network." filters={["All Events", "My University Only"]} />
      <section className="event-hero-grid">
        <div className="event-hero-image">
          <Image src={imageUrls.summit} alt="Featured event" fill style={{ objectFit: "cover" }} />
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
          <EventCard image={imageUrls.mixer} type="Social" title="Autumn term Welcome Mixer" place="UCL Student Centre" date="2024-11-12" host="UCL SingSoc" />
          <EventCard image={imageUrls.career} type="Career" title="Consulting Prep Workshop" place="Online (Zoom)" date="2024-11-18" host="Warwick SingSoc" />
          <EventCard image={imageUrls.sports} type="Sports" title="Inter-Uni Badminton Tournament" place="Imperial College Ethos" date="2024-11-24" host="Imperial SingSoc" />
        </div>
      </section>
    </main>
  );
}
