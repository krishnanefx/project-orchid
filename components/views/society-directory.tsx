"use client";

import { CheckCircle, Leaf, MapPin, UsersThree } from "@phosphor-icons/react";
import { useApp } from "@/lib/app-context";
import { universities } from "@/lib/data";
import { PageHeader } from "@/components/ui/primitives";

export function SocietyDirectory() {
  const { joinedSociety, setJoinedSociety, announce, viewSociety, localSocieties } = useApp();

  function joinSociety(name: string, id: string) {
    setJoinedSociety(name);
    announce(`Joined ${name}.`);
  }

  return (
    <main className="stitch-main">
      <PageHeader title="Society Directory" copy="Find and join Singaporean societies across the UK." filters={["All Regions", "London", "Scotland", "Midlands", "More"]} />
      <section>
        <div className="subheading"><Leaf size={18} weight="fill" /><h3>All Societies</h3></div>
        <div className="all-societies-grid">
          {localSocieties.length === 0 && (
            <p style={{ color: "var(--muted)", gridColumn: "1 / -1" }}>No societies registered yet.</p>
          )}
          {localSocieties.map((society) => {
            const university = universities.find((u) => u.id === (society.universitySlug || society.universityId));
            return (
              <article className="stitch-card small-society" key={society.id}>
                <div className="letter-logo">{society.logo}</div>
                <h4>{society.name}</h4>
                <p>{university?.name ?? ""}</p>
                <span className="region-pill">{university?.city ?? ""}</span>
                <div className="meta-row compact" style={{ marginTop: 6 }}>
                  <span><UsersThree size={13} /> {society.members}</span>
                  {university && <span><MapPin size={13} /> {university.city}</span>}
                </div>
                <div className="small-card-footer">
                  <button
                    type="button"
                    onClick={() => joinSociety(society.name, society.id)}
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    {joinedSociety === society.name ? <><CheckCircle size={13} weight="fill" /> Joined</> : "Join"}
                  </button>
                  <button type="button" onClick={() => viewSociety(society.id)}>View →</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
