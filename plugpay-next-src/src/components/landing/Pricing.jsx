"use client";

import { FinalCta } from "@/components/landing/FinalCta";

export function Pricing() {
  return (
    <>
      <section className="pricing" id="pricing">
        <div className="wrap">
          <div className="eyebrow on-dark">Pricing</div>
          <h2>Free for every trader. No catch.</h2>
          <p
            className="section-p"
            style={{
              color: "rgba(255,255,255,.6)",
            }}
          >
            {
              "PlugPay never takes a hidden cut of your sales, and never charges you to be verified, listed, or found. The trust layer is free \u2014 because the more traders it holds, the more valuable it becomes to everyone."
            }
          </p>
          <div
            className="price-grid"
            style={{
              maxWidth: "380px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div className="price-card featured">
              <div className="price-badge">Always free</div>
              <div className="price-tier">Every verified trader</div>
              <div className="price-n">KSh 0</div>
              <div className="price-who">{"Forever \u2014 no upgrade tier, no paywall"}</div>
              <ul className="price-list">
                <li>Verified public profile at plug.pay/yourname</li>
                <li>Unlimited sales recording & floor-map listing</li>
                <li>Unlimited WhatsApp receipts</li>
                <li>Peer vouching & receipt-anchored reviews</li>
                <li>Full trust-score building, from day one</li>
              </ul>
            </div>
          </div>
          <p
            className="price-note"
            style={{
              maxWidth: "60ch",
            }}
          >
            {"Our business is built on two things: the "}
            <strong
              style={{
                color: "#fff",
              }}
            >
              delivery marketplace
            </strong>{" "}
            {"connecting buyers to verified runners, and "}
            <strong
              style={{
                color: "#fff",
              }}
            >
              credit data
            </strong>
            {
              " - turning a trader's real transaction and vouching history into evidence sellers can use to get suppliers and financial institutions to safely extend stock credit or a loan."
            }
          </p>
        </div>
      </section>
      <section className="voices">
        <div className="wrap">
          <div className="eyebrow">Community voices</div>
          <h2>Traders are already excited about safer WhatsApp commerce.</h2>
          <p className="section-p">
            Thousands of buyers and sellers deal with the same DM anxiety every day. Here's what traders are
            saying about the trust layer PlugPay is building for Kenyan commerce.
          </p>
          <div className="t-card">
            <div className="t-av">WM</div>
            <div className="t-name">Wanjiru M.</div>
            <div className="t-role">Fashion seller, Nairobi CBD</div>
            <div className="t-stars">{"\u2605\u2605\u2605\u2605\u2605"}</div>
            <p className="t-quote">{`"Buyers used to disappear the moment I asked for payment first. Now they see my badge and pay before I've even finished typing the price."`}</p>
            <div className="t-dots">
              <span className="on" />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>
      <section className="market">
        <div className="wrap">
          <div className="eyebrow on-dark">The market focus</div>
          <h2>The trust layer for Kenya's digital commerce.</h2>
          <div className="market-grid">
            <div className="market-left">
              <div className="market-sub">Commerce is moving faster than formal systems.</div>
              <p className="section-p">
                Social selling is exploding across WhatsApp, Instagram and Facebook Marketplace. Millions of
                traders sell every day without a shopfront, a website, or any way to prove they're real.
              </p>
              <div className="check-list">
                <div className="check-item">
                  <div className="check-icon">{"\u2713"}</div>
                  <span>Securing transactions between strangers on social media</span>
                </div>
                <div className="check-item">
                  <div className="check-icon">{"\u2713"}</div>
                  <span>No expensive developer integrations required for local vendors</span>
                </div>
                <div className="check-item">
                  <div className="check-icon">{"\u2713"}</div>
                  <span>{"Works over WhatsApp \u2014 no app download for buyers"}</span>
                </div>
                <div className="check-item">
                  <div className="check-icon">{"\u2713"}</div>
                  <span>Every sale becomes a verifiable, public track record</span>
                </div>
              </div>
            </div>
            <div className="stat-callout">
              <div className="bt-n">{"KSh 400B+"}</div>
              <div className="bt-l">Kenya's informal retail economy</div>
              <p>
                Estimated annual value moving through jua kali stalls and social-media traders with no formal
                trust layer today.
              </p>
            </div>
          </div>
          <FinalCta />
        </div>
      </section>
    </>
  );
}