import Link from 'next/link';

export function SiteNav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-top">
          <Link href="/" className="logo" aria-label="PlugPay home">
            <span className="logo-mark">P</span>
            <span className="pp-logo">
              <span className="plug">Plug</span>
              <span className="pay">Pay</span>
            </span>
          </Link>
          <Link href="/signin" className="nav-cta">Join us</Link>
        </div>
        <div className="nav-links">
          <a href="/#how-it-works">How it works</a>
          <a href="/#trust">Why PlugPay</a>
          <a href="/buildings">Buildings</a>
          <a href="/#pricing">Pricing</a>
          <a href="/#faq">FAQ</a>
        </div>
        <form action="/buildings" className="nav-search" role="search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input name="q" placeholder="Search a stall, building or code" aria-label="Search buildings" />
        </form>
      </div>
    </nav>
  );
}
