const countFormat = new Intl.NumberFormat("en-US");

const timestampFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatCount(count: number): string {
  return countFormat.format(count);
}

/** Local time. Only call from client-rendered data: server and browser time zones differ. */
export function formatTimestamp(iso: string): string {
  return timestampFormat.format(new Date(iso));
}

// Payloads can be huge; rendering megabytes of text would freeze the panel.
const MAX_JSON_CHARS = 100_000;

/** Pretty-prints any JSON value for display, cutting very large output. */
export function formatJson(value: unknown): { text: string; truncated: boolean } {
  const text = JSON.stringify(value, null, 2);
  return text.length > MAX_JSON_CHARS
    ? { text: text.slice(0, MAX_JSON_CHARS), truncated: true }
    : { text, truncated: false };
}
