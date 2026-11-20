// Basic profanity/moderation filter for neighbour comments (S4).
// Not a substitute for human review; flags content for admin triage.
const BLOCKED = ['fuck', 'shit', 'bitch', 'asshole', 'idiot', 'stupid'];
export function moderateComment(text: string): { ok: boolean; flagged: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const w of BLOCKED) {
    if (lower.includes(w)) return { ok: false, flagged: true, reason: 'inappropriate language' };
  }
  if (text.length > 400) return { ok: false, flagged: true, reason: 'too long' };
  return { ok: true, flagged: false };
}
