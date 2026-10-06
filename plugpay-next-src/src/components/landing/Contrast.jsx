"use client";

import { PROFILE_SHOT_DATA_URI } from "@/lib/assets";

var WITHOUT = [
  {
    t: "Blind upfront payment",
    d: "Buyers pay first with nothing to check you against.",
  },
  {
    t: "Fake M-Pesa alerts",
    d: "Screenshots of payment that never actually landed.",
  },
  {
    t: "No purchase history",
    d: "A new buyer has no way to see if you're reliable.",
  },
  {
    t: "Buyers ghost after delivery",
    d: "No record to fall back on if a dispute comes up.",
  },
];

var WITH = [
  {
    t: "Verified seller badge",
    d: "Your ID is checked once \u2014 buyers see the badge, not a guess.",
  },
  {
    t: "Receipt-anchored reviews",
    d: "Every review is tied to a real sale \u2014 none of it can be faked.",
  },
  {
    t: "Public trust profile",
    d: "Your full track record, visible before a buyer even pays.",
  },
  {
    t: "One link, every platform",
    d: "plug.pay/yourname works on WhatsApp, Instagram and Facebook.",
  },
];

export function Contrast() {
  return (
    <section className="contrast" id="contrast">
      <div className="wrap">
        <div className="eyebrow">Trust contrast</div>
        <h2>The PlugPay trust advantage.</h2>
        <p className="section-p">
          Comparing the risk of a bare WhatsApp number to the confidence of a PlugPay-verified stall.
        </p>
        <div className="cc-grid">
          <div className="cc-col without">
            <div className="cc-h">Without PlugPay</div>
            <div className="cc-sub">Bare WhatsApp number</div>
            {WITHOUT.map((it) => (
              <div key={it.t} className="cc-item">
                <div className="cc-icon">{"\u2715"}</div>
                <div>
                  <div className="cc-item-t">{it.t}</div>
                  <div className="cc-item-d">{it.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="cc-col with">
            <div className="cc-h">With PlugPay</div>
            <div className="cc-sub">Verified trust infrastructure</div>
            {WITH.map((it) => (
              <div key={it.t} className="cc-item">
                <div className="cc-icon">{"\u2713"}</div>
                <div>
                  <div className="cc-item-t">{it.t}</div>
                  <div className="cc-item-d">{it.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cc-showcase">
          <div className="cc-showcase-text">
            <div className="cc-h">See a real trust profile</div>
            <p className="section-p">
              Every verified trader gets a public profile like this one. Buyers can check sales, reviews and
              building verification before they ever send a shilling.
            </p>
          </div>
          <div className="cc-showcase-visual">
            <div className="shot-frame">
              <img
                src={PROFILE_SHOT_DATA_URI}
                alt="Verified PlugPay seller profile for Wanjiku Electronics"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}