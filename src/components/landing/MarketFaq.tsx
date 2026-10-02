import Link from 'next/link';
import type { Faq } from '@/lib/types';

export function Market() {
  const checks = [
    'Securing transactions between strangers on social media',
    'No expensive developer integrations required for local vendors',
    'Works over WhatsApp, no app download for buyers',
    'Every sale becomes a verifiable, public track record',
  ];

  return (
    <section className="pp-section market on-dark" style={{ background: 'var(--bg-dark)' }}>
      <div className="wrap">
        <p className="eyebrow on-dark">The market focus</p>
        <h2 className="pp-h2" style={{ color: '#fff' }}>The trust layer for Kenya&apos;s digital commerce.</h2>
        <div className="market-sub">Commerce is moving faster than formal systems.</div>
        <p className="section-p">
          Social selling is exploding across WhatsApp, Instagram and Facebook Marketplace. Millions
          of traders sell every day without a shopfront, a website, or any way to prove they are
          real.
        </p>

        <div className="check-list">
          {checks.map((c) => (
            <div className="check-item" key={c}>
              <span className="check-icon">✓</span>
              <span>{c}</span>
            </div>
          ))}
        </div>

        <div className="stat-callout">
          <div className="bt-n">KSh 400B+</div>
          <div className="bt-l">Kenya&apos;s informal retail economy</div>
          <p>
            Estimated annual value moving through jua kali stalls and social-media traders with no
            formal trust layer today.
          </p>
        </div>

        <div className="final-cta" style={{ textAlign: 'center', marginTop: 72 }}>
          <h2 className="pp-h2" style={{ color: '#fff' }}>Ready to sell without the risk?</h2>
          <p className="section-p" style={{ margin: '0 auto 26px', textAlign: 'center' }}>
            PlugPay bridges the gap between a DM and a real sale. Join the verified traders
            building trust on WhatsApp today.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signin" className="btn-mint">I&apos;m an agent →</Link>
            <Link href="/landlord" className="btn-ghost-dark">I own a building</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq({ faqs }: { faqs: Faq[] }) {
  const groups = [...new Set(faqs.map((f) => f.group_name))];

  return (
    <section className="pp-section faq" id="faq">
      <div className="wrap">
        <h2 className="pp-h2" style={{ textAlign: 'center', maxWidth: 420, margin: '0 auto 8px' }}>
          Common questions
        </h2>
        <p className="section-p" style={{ textAlign: 'center', margin: '0 auto 36px' }}>
          Short, direct answers. If yours is missing, bring it to any of our field agents in the CBD.
        </p>

        {groups.map((g, gi) => (
          <div key={g}>
            <div className="faq-group" style={gi === 0 ? { marginTop: 0 } : undefined}>{g}</div>
            {faqs.filter((f) => f.group_name === g).map((f) => (
              <details className="faq-item" key={f.id}>
                <summary className="faq-q">
                  {f.question}
                  <span className="faq-plus" aria-hidden="true">+</span>
                </summary>
                <div className="faq-a">{f.answer}</div>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
