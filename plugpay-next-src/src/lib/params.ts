// Route params can arrive percent-encoded (receipt codes start with "#", encoded as %23).
export function safeDecode(v: string): string {
  try { return decodeURIComponent(v); } catch { return v; }
}