import Link from 'next/link';

export function Friction() {
  const steps = [
    {
      n: '01',
      t: 'Register your stall in 3 minutes',
      d: 'Phone number and ID selfie. We verify your identity and issue your badge. No queues, no paperwork.',
    },
    {
      n: '02',
      t: 'Record a sale, POS in your pocket',
      d: "Log items, enter the buyer's WhatsApp number, tap send. The receipt fires instantly.",
    },
    {
      n: '03',
      t: "Receipt arrives on buyer's WhatsApp",
      d: "Itemised, timestamped, with your live trust profile link embedded. The buyer taps and sees your full history.",
    },
    {
      n: '04',
      t: 'Your profile updates live',
      d: 'Every sale adds to your transaction count, rating, and trust score. Buyers can verify you before buying, from any platform.',
    },
  ];

  return (
    <section className="pp-section friction" id="how-it-works">
      <div className="wrap">
        <p className="eyebrow">The friction</p>
        <h2 className="pp-h2">WhatsApp commerce still runs on trust gaps.</h2>
        <p className="section-p">
          Social selling has turned every trader&apos;s DMs into a storefront. Millions of Kenyans
          buy and sell this way daily, but transacting with a stranger over chat is still a gamble
          for everyone involved.
        </p>

        <div className="f-cards">
          {steps.map((s) => (
            <div className="f-card" key={s.n}>
              <div className="f-n">{s.n}</div>
              <div className="f-t">{s.t}</div>
              <div className="f-d">{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link href="/signin" className="btn-mint">Get started, it&apos;s free →</Link>
        </div>
      </div>
    </section>
  );
}

export function Breakthrough() {
  const stats = [
    { n: '0%', l: 'Fake alert losses' },
    { n: '3×', l: 'More buyer trust' },
    { n: '100%', l: 'Receipt-backed reviews' },
  ];

  return (
    <section className="pp-section breakthrough on-dark" id="trust">
      <div className="wrap">
        <p className="eyebrow on-dark">The breakthrough</p>
        <h2 className="pp-h2" style={{ color: '#fff' }}>Meet PlugPay.</h2>
        <p className="section-p">
          PlugPay verifies every seller&apos;s ID and location, anchors every sale to a real
          WhatsApp receipt, and builds a public trust profile automatically. Buyers can check you
          out before they pay, and you can grow past the people who already know you.
        </p>

        <div className="bt-stats">
          {stats.map((s) => (
            <div className="bt-stat" key={s.l}>
              <div className="bt-n">{s.n}</div>
              <div className="bt-l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
