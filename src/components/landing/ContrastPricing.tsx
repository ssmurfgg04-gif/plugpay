const withoutItems = [
  { t: 'Blind upfront payment', d: 'Buyers pay first with nothing to check you against.' },
  { t: 'Fake M-Pesa alerts', d: 'Screenshots of payments that never actually landed.' },
  { t: 'No purchase history', d: "A new buyer has no way to see if you're reliable." },
  { t: 'Buyers ghost after delivery', d: 'No record to fall back on if a dispute comes up.' },
];

const withItems = [
  { t: 'Verified seller badge', d: 'Your ID is checked once. Buyers see the badge, not a guess.' },
  { t: 'Receipt-anchored reviews', d: 'Every review is tied to a real sale, so none of it can be faked.' },
  { t: 'Public trust profile', d: 'Your full track record, visible before a buyer even pays.' },
  { t: 'One link, every platform', d: 'plugpay.co.ke/yourname works on WhatsApp, Instagram and Facebook.' },
];

export function Contrast() {
  return (
    <section className="pp-section contrast">
      <div className="wrap">
        <p className="eyebrow">Trust contrast</p>
        <h2 className="pp-h2">The PlugPay trust advantage.</h2>
        <p className="section-p">
          The difference between a bare WhatsApp number and a PlugPay-verified stall is the
          difference between a gamble and a receipt.
        </p>

        <div className="cc-col without">
          <div className="cc-h">Without PlugPay</div>
          <div className="cc-sub">Bare WhatsApp number</div>
          {withoutItems.map((i) => (
            <div className="cc-item" key={i.t}>
              <span className="cc-icon">✕</span>
              <div>
                <div className="cc-item-t">{i.t}</div>
                <div className="cc-item-d">{i.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="cc-col with">
          <div className="cc-h">With PlugPay</div>
          <div className="cc-sub">Verified trust infrastructure</div>
          {withItems.map((i) => (
            <div className="cc-item" key={i.t}>
              <span className="cc-icon">✓</span>
              <div>
                <div className="cc-item-t">{i.t}</div>
                <div className="cc-item-d">{i.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section className="pp-section pricing on-dark" id="pricing">
      <div className="wrap">
        <p className="eyebrow on-dark">Pricing</p>
        <h2 className="pp-h2" style={{ color: '#fff' }}>Free for every trader. No catch.</h2>
        <p className="section-p">
          PlugPay never takes a hidden cut of your sales, and never charges you to be verified,
          listed or found. The trust layer is free, because the more traders it holds, the more
          valuable it becomes to everyone.
        </p>

        <div className="price-grid">
          <div className="price-card featured">
            <div className="price-badge">Always free</div>
            <div className="price-tier">Every verified trader</div>
            <div className="price-n">KSh 0 <span>/ forever</span></div>
            <div className="price-who">No upgrade tier, no paywall</div>
            <ul className="price-list">
              <li>Verified public profile at plugpay.co.ke/yourname</li>
              <li>Unlimited sales recording and floor-map listing</li>
              <li>Unlimited WhatsApp receipts</li>
              <li>Peer vouching and receipt-anchored reviews</li>
              <li>Full trust-score building from day one</li>
            </ul>
          </div>
        </div>

        <p className="price-note">
          Our business is built on two things: the delivery marketplace connecting buyers to
          verified runners, and credit data. A trader&apos;s real transaction and vouching history
          becomes evidence that suppliers and financial institutions can use to safely extend stock
          credit or a loan.
        </p>
      </div>
    </section>
  );
}
