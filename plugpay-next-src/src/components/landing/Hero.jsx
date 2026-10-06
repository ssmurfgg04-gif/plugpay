"use client";

import { SearchBar } from "@/components/search/SearchBar";
import { ResultsSection } from "@/components/search/ResultsSection";
import { PhoneDemo } from "@/components/landing/PhoneDemo";

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-copy">
          <div className="hero-badge">
            <div className="hero-dots">
              <span
                style={{
                  background: "#51104a",
                }}
              >
                {"A"}
              </span>
              <span
                style={{
                  background: "#534AB7",
                }}
              >
                {"P"}
              </span>
              <span
                style={{
                  background: "#BA7517",
                }}
              >
                {"G"}
              </span>
            </div>
            <b>Join 1,400+ traders live in Nairobi CBD</b>
          </div>
          <h1>
            {"The trust layer for "}
            <em>Kenya's WhatsApp commerce.</em>
          </h1>
          <p className="hero-p">
            {
              "PlugPay verifies every seller from commercial buildings, anchors every sale to a real receipt, and turns your WhatsApp chat into a storefront buyers can actually trust \u2014 no app, no upfront risk."
            }
          </p>
          <div className="hero-search-wrap search-container">
            <SearchBar />
            <ResultsSection />
          </div>
          <div className="hero-stats">
            <div className="hstat">
              <div className="hstat-n">687</div>
              <div className="hstat-l">Verified merchants</div>
            </div>
            <div className="hstat">
              <div className="hstat-n">12</div>
              <div className="hstat-l">Buildings mapped</div>
            </div>
            <div className="hstat">
              <div className="hstat-n">{"4.8\u2605"}</div>
              <div className="hstat-l">Avg merchant rating</div>
            </div>
            <div className="hstat">
              <div className="hstat-n">KSh12M</div>
              <div className="hstat-l">Platform GMV/month</div>
            </div>
          </div>
          <p className="hero-note">
            Send invoice and receipt to customers whatsapp.
            <br />
            Receive reviews even from physical sales.
          </p>
          <div className="hero-rule" />
        </div>
        <div className="hero-visual">
          <PhoneDemo />
        </div>
      </div>
    </section>
  );
}