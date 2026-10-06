"use client";

import { usePlugPay } from "@/store/context";

var FAQS = [
  {
    q: "What is PlugPay, in one line?",
    a: "PlugPay is trust infrastructure for Nairobi's informal traders \u2014 it turns years of reputation that used to live only in people's memory into something visible, provable, and portable. Every verified trader gets a public profile anchored to real ID, real sales, and real peer vouches. That proof travels with them even if the stall, the building, or the city block changes.",
    open: true,
  },
  {
    q: "What's actually behind a trader's trust score?",
    a: "The platform is built in layers \u2014 verified identity, a peer vouching graph, a transaction ledger, public discovery, and payments \u2014 each one feeding the layer above it. A trust score isn't a single input; it's the compounding output of ID verification, landlord confirmation, peer vouches, and receipt-anchored reviews. The more of that history a trader has, the harder their profile is to fake.",
  },
  {
    q: "Who is PlugPay actually built for?",
    a: "Three groups who currently deal blind: traders who can't prove years of honest dealing to a stranger, buyers who can't tell a legitimate seller from one who won't be there next month, and landlords whose buildings can't be marketed on reputation. PlugPay gives each the same underlying proof, just surfaced differently \u2014 a profile, a search result, a verified-building badge.",
  },
  {
    q: "What can I actually do on PlugPay?",
    a: "Get verified once, then record every sale \u2014 manually or via a WhatsApp payment link \u2014 and an itemised receipt fires automatically to the buyer. Fellow traders and your landlord can vouch for you, and buyers can only review a sale that has a real receipt behind it. Your whole track record lives at one shareable link, and delivery runs through a built-in marketplace of verified runners.",
  },
  {
    q: "How does an agent onboard a building?",
    a: "An agent signs in with an SMS or email OTP, then sets up an individual landlord account for the building \u2014 the landlord can log back into that account later to add more stall owners and complete monthly verification. The agent onboards the building and its stalls, and adds each stall owner's profile details, especially their phone number and email attached to their stall. Each stall owner then gets a claim link and signs up themselves with a WhatsApp OTP, with SMS as a fallback.",
  },
  {
    q: "If it's free for traders, how does PlugPay make money?",
    a: "Not by charging traders \u2014 verification and unlimited receipts stay free, because the platform gets more valuable the more traders it holds. Revenue comes from the errand & delivery marketplace and from turning trading history into credit data suppliers and lenders can act on. Traders get verified for free; PlugPay earns once that trust becomes something spendable.",
  },
];

export function FAQ() {
  const { openAuthModal, openMerchantModal } = usePlugPay();
  return (
    <>
      <section className="faq" id="faq">
        <div className="wrap">
          <div className="eyebrow">Common questions</div>
          <h2>Frequently asked questions</h2>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details key={f.q} className="faq-item" open={f.open}>
                <summary className="faq-q">
                  {f.q}
                  <span className="faq-plus">{"+"}</span>
                </summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="merchant-cta">
        <div className="mc-inner">
          <p className="mc-lead">
            Your stall is already on PlugPay. Sign in with your WhatsApp number, complete your profile, and go
            live in minutes.
          </p>
          <div className="mc-actions">
            <button className="mc-btn-solid" onClick={() => openAuthModal()}>
              Sign in to your stall
            </button>
            <button className="mc-btn-outline" onClick={() => openMerchantModal()}>
              See a live profile first
            </button>
          </div>
          <p className="mc-caption">
            {"No password \xB7 Any phone number works \xB7 Buyers never sign up \xB7 Nairobi first"}
          </p>
        </div>
      </section>
    </>
  );
}