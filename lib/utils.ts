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

export function formatEventDate(iso: string): { month: string; day: string } {
  const d = new Date(iso);
  return {
    month: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(d),
    day: new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" }).format(d)
  };
}
