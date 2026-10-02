export function formatKsh(n: number): string {
  return `KSh ${new Intl.NumberFormat('en-KE').format(Math.round(n))}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function stars(rating: number): string {
  const full = Math.round(rating);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

export function initials(name: string): string {
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function hueFromString(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

export function maskPhone(p: string): string {
  const digits = p.replace(/\D/g, '');
  if (digits.length < 9) return p;
  return `${digits.slice(0, 4)} *** ${digits.slice(-3)}`;
}
