import Link from 'next/link';

export function MerchantCta() {
  return (
    <section className="merchant-cta">
      <div className="mc-inner">
        <p className="mc-lead">
          Your stall is already on PlugPay. Sign in with your WhatsApp number, complete your
          profile, and go live in minutes.
        </p>
        <div className="mc-actions">
          <Link href="/signin" className="mc-btn-solid">Sign in to your stall</Link>
          <Link href="/m/wanjiku-electronics" className="mc-btn-outline">See a live profile first</Link>
        </div>
        <p className="mc-caption">
          No password · Any phone number works · Buyers never sign up · Nairobi first
        </p>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer" style={{ marginTop: 'auto' }}>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="pp-logo" style={{ color: '#fff' }}>
              <img src="/logo.svg" alt="PlugPay logo" width={26} height={26} style={{ borderRadius: 8, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
              <span className="plug">Plug</span><span className="pay">Pay</span>
            </Link>
            <p className="footer-desc">
              The trust layer for Kenya&apos;s market traders. Turn every sale into permanent,
              public proof of who you are as a merchant.
            </p>
          </div>
          <div className="footer-col">
            <div className="footer-col-h">Product</div>
            <a href="/#how-it-works">How it works</a>
            <a href="/#trust">Why PlugPay</a>
            <a href="/#pricing">Pricing</a>
            <Link href="/buildings">Find buildings</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-h">Merchants</div>
            <Link href="/signin">Sign in to your stall</Link>
            <Link href="/m/wanjiku-electronics">Sample profile</Link>
            <Link href="/dashboard">Seller dashboard</Link>
            <Link href="/landlord">Landlord tools</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-h">Company</div>
            <a href="/#faq">FAQ</a>
            <Link href="/buildings">Building directory</Link>
            <a href="/#top">Back to top</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="foot-copy">© 2026 PlugPay · Nairobi, Kenya</span>
          <span className="foot-copy">Built for Kenya&apos;s market traders · Every stall deserves a name</span>
        </div>
      </div>
    </footer>
  );
}
