'use client';

import { useState } from 'react';
import type { Testimonial } from '@/lib/types';
import { stars } from '@/lib/format';

export function Voices({ testimonials }: { testimonials: Testimonial[] }) {
  const [idx, setIdx] = useState(0);
  if (testimonials.length === 0) return null;
  const t = testimonials[idx];

  return (
    <section className="pp-section voices">
      <div className="wrap">
        <p className="eyebrow" style={{ justifyContent: 'center' }}>Community voices</p>
        <h2 className="pp-h2" style={{ maxWidth: 520, margin: '0 auto 16px' }}>
          Traders are already excited about safer WhatsApp commerce.
        </h2>
        <p className="section-p" style={{ margin: '0 auto', textAlign: 'center' }}>
          Thousands of buyers and sellers deal with the same DM anxiety every day. Here is what
          traders are saying about the trust layer PlugPay is building for Kenyan commerce.
        </p>

        <div className="t-card">
          <div className="t-av" aria-hidden="true">{t.initials}</div>
          <div className="t-name">{t.name}</div>
          <div className="t-role">{t.role}</div>
          <div className="t-stars">{stars(t.rating)}</div>
          <p className="t-quote">&ldquo;{t.quote}&rdquo;</p>
        </div>

        <div className="t-dots" role="tablist" aria-label="Testimonials">
          {testimonials.map((item, i) => (
            <button
              key={item.id}
              className={i === idx ? 'on' : ''}
              onClick={() => setIdx(i)}
              style={{ cursor: 'pointer', border: 'none', padding: 0, appearance: 'none' }}
              aria-label={`Show testimonial from ${item.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
