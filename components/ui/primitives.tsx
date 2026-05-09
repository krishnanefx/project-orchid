"use client";

import { CaretUp, MapPin, Tag } from "@phosphor-icons/react";
import Image from "next/image";
import { formatEventDate } from "@/lib/utils";

export const imageUrls = {
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

export function PageHeader({
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

export function Thread({ title, count, meta }: { title: string; count: string; meta: string }) {
  return (
    <div className="thread-row">
      <div className="vote-box"><CaretUp size={15} /><span>{count}</span></div>
      <div><h4>{title}</h4><p>{meta}</p></div>
    </div>
  );
}

export function TimelineItem({ tone, text, time }: { tone: "green" | "purple" | "muted"; text: string; time: string }) {
  return (
    <div className="timeline-item">
      <span className={`timeline-dot ${tone}`} />
      <p>{text}</p>
      <small>{time}</small>
    </div>
  );
}

export function EventCard({ image, type, title, place, date, host }: { image: string; type: string; title: string; place: string; date: string; host: string }) {
  const { month, day } = formatEventDate(date);
  return (
    <article className="stitch-card event-card">
      <div className="event-image">
        <Image src={image} alt={title} fill style={{ objectFit: "cover" }} />
        <span><Tag size={14} /> {type}</span>
      </div>
      <div className="event-body">
        <div className="date-box"><span>{month}</span><b>{day}</b></div>
        <div><h3>{title}</h3><p><MapPin size={15} /> {place}</p></div>
      </div>
      <div className="card-footer"><span>By {host}</span><button type="button">Details →</button></div>
    </article>
  );
}

export function Metric({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <article className="stitch-card metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <div><i style={{ width }} /></div>
    </article>
  );
}

export function Footer() {
  return (
    <footer className="stitch-footer">
      <div><strong>Project Orchid</strong><p>© 2024 UKSSC Project Orchid. Built for Singaporeans in the UK.</p></div>
      <nav>
        <a href="#about">About UKSSC</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#support">Contact Support</a>
        <a href="#terms">Terms of Service</a>
      </nav>
    </footer>
  );
}
