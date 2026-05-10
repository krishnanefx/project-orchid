"use client";

import { CheckCircle, Leaf, MagnifyingGlass, MapPin, UsersThree } from "@phosphor-icons/react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { joinSocietyAction } from "@/lib/actions";
import { universities } from "@/lib/data";
import { PageHeader } from "@/components/ui/primitives";

const CITIES = ["All", "London", "Cambridge", "Oxford", "Manchester", "Edinburgh", "Coventry", "Bristol"];

export function SocietyDirectory() {
  const { joinedSociety, setJoinedSociety, announce, viewSociety, localSocieties, currentUser, setCurrentUser } = useApp();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  function joinSociety(name: string, id: string) {
    if (currentUser.societyId === id) return;
    setJoinedSociety(name);
    setCurrentUser({ ...currentUser, societyId: id });
    announce(`Joined ${name}.`);
    if (currentUser.id) {
      joinSocietyAction(id, currentUser.id).catch(() =>
        announce("Joined locally but failed to sync — please refresh.")
      );
    }
  }

  const filtered = localSocieties.filter((society) => {
    const university = universities.find((u) => u.id === (society.universitySlug || society.universityId));
    const q = search.toLowerCase();
    const matchSearch = !q
      || society.name.toLowerCase().includes(q)
      || university?.name.toLowerCase().includes(q)
      || society.description.toLowerCase().includes(q);
    const matchCity = cityFilter === "All" || university?.city === cityFilter;
    return matchSearch && matchCity;
  });

  return (
    <main className="stitch-main">
      <PageHeader title="Society Directory" copy="Find and join Singaporean societies across the UK." />

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <MagnifyingGlass size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search societies…"
            aria-label="Search societies"
            style={{
              width: "100%",
              padding: "9px 12px 9px 30px",
              border: "1.5px solid var(--outline-variant, rgba(208,194,213,0.5))",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--on-surface)",
              background: "var(--surface-bright, #fff)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div className="category-row" style={{ marginBottom: 0 }}>
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              className={cityFilter === city ? "active" : ""}
              onClick={() => setCityFilter(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="subheading">
          <Leaf size={18} weight="fill" />
          <h3>
            {cityFilter === "All" && !search ? "All Societies" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          </h3>
        </div>
        <div className="all-societies-grid">
          {filtered.length === 0 && (
            <p style={{ color: "var(--muted)", gridColumn: "1 / -1" }}>
              {localSocieties.length === 0 ? "No societies registered yet." : "No societies match your search."}
            </p>
          )}
          {filtered.map((society) => {
            const university = universities.find((u) => u.id === (society.universitySlug || society.universityId));
            const isMySociety = currentUser.societyId === society.id;
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
                    disabled={isMySociety}
                  >
                    {isMySociety || joinedSociety === society.name
                      ? <><CheckCircle size={13} weight="fill" /> Joined</>
                      : "Join"}
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
