"use client";

import { CheckCircle, Leaf, MapPin, UsersThree } from "@phosphor-icons/react";
import Image from "next/image";
import { useApp } from "@/lib/app-context";
import { imageUrls, PageHeader } from "@/components/ui/primitives";

const active = [
  ["UCL Singapore Society", "University College London", "320 Members", "London", imageUrls.society, "High Activity"],
  ["Warwick Singsoc", "University of Warwick", "250 Members", "Midlands", imageUrls.warwick, "Event Today"],
  ["Edin Singsoc", "University of Edinburgh", "180 Members", "Scotland", imageUrls.edin, ""]
] as const;

const all = [
  ["I", "Imperial Singsoc", "Imperial College London", "London", "410"],
  ["K", "KCL Singsoc", "King's College London", "London", "280"],
  ["M", "Manchester Singsoc", "University of Manchester", "North West", "195"],
  ["O", "OUMSSA", "University of Oxford", "South East", "150"]
] as const;

export function SocietyDirectory() {
  const { joinedSociety, setJoinedSociety, announce } = useApp();

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
                <Image src={img} alt={`${name} logo`} width={64} height={64} />
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
