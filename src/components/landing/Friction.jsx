"use client";

import { usePlugPay } from "@/store/context";

var CARDS = [
  {
    n: "01",
    t: "Register your stall in 3 minutes",
    d: "Phone number + ID selfie. We verify against IPRS and issue your badge. No queues, no paperwork.",
  },
  {
    n: "02",
    t: "Record a sale \u2014 POS in your pocket",
    d: "Log items, enter the buyer's WhatsApp number, tap send. Receipt fires instantly.",
  },
  {
    n: "03",
    t: "Receipt arrives on buyer's WhatsApp",
    d: "Itemised, timestamped, with your live trust profile link embedded. The buyer taps and sees your full history.",
  },
  {
    n: "04",
    t: "Your profile updates live",
    d: "Every sale adds to your transaction count, rating, and trust score. Buyers can verify you before buying \u2014 from any platform.",
  },
];

export function Friction() {
  const { openAuthModal } = usePlugPay();
  return (
    <section className="friction" id="friction">
      <div className="wrap">
        <div className="eyebrow">The friction</div>
        <h2>WhatsApp commerce still runs on trust gaps.</h2>
        <p className="section-p">
          {
            "Social selling has turned every trader's DMs into a storefront. Millions of Kenyans buy and sell this way daily \u2014 but transacting with a stranger over chat is still a gamble for everyone involved."
          }
        </p>
        <div className="f-cards">
          {CARDS.map((c) => (
            <div key={c.n} className="f-card">
              <div className="f-n">{c.n}</div>
              <div className="f-t">{c.t}</div>
              <div className="f-d">{c.d}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
          }}
        >
          <button className="btn-mint" onClick={() => openAuthModal()}>
            {"Get started \u2014 it's free \u2192"}
          </button>
        </div>
      </div>
    </section>
  );
}