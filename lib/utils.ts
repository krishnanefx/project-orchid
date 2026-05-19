export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadIcs(filename: string, event: {
  title: string;
  startsAt: string;
  location: string;
  description?: string;
}) {
  // ICS dates: YYYYMMDDTHHMMSSZ — treat startsAt as UTC noon if no time component
  const toIcsDate = (iso: string) => {
    const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00Z`);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };
  const uid = `orchid-${Date.now()}@ukssc.org`;
  const stamp = toIcsDate(new Date().toISOString());
  const start = toIcsDate(event.startsAt);
  // Default 2-hour event
  const end = toIcsDate(new Date(new Date(event.startsAt.includes("T") ? event.startsAt : `${event.startsAt}T12:00:00Z`).getTime() + 2 * 60 * 60 * 1000).toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Project Orchid//UKSSC//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replace(/\n/g, " ")}`,
    `LOCATION:${event.location.replace(/\n/g, " ")}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n").slice(0, 400)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatEventDate(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  return {
    month: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(d),
    day: new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" }).format(d)
  };
}
