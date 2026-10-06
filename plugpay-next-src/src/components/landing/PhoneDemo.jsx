"use client";

import { usePlugPay } from "@/store/context";

export function PhoneDemo() {
  const {
    openMerchantModal,
    openInvoiceInProfile,
    openReceiptInProfile,
    openMerchantModalOnReviews,
    showToast,
  } = usePlugPay();
  return (
    <div className="hero-phone-shot">
      <div className="wa-phone">
        <div className="wa-screen">
          <div className="wa-header" onClick={() => openMerchantModal()}>
            <div className="wa-avatar">WE</div>
            <div>
              <div className="wa-header-name">Wanjiku Electronics</div>
              <div className="wa-header-status">online</div>
            </div>
          </div>
          <div className="wa-body">
            <div className="wa-day">
              <span>TODAY</span>
            </div>
            <div className="wa-bubble-out">
              {
                "Hi! Is the Samsung Galaxy A15 still available? Saw it on your status and TikTok page \u{1F440}"
              }
              <span className="wa-time">
                9:41<span className="wa-check">{"\u2713\u2713"}</span>
              </span>
            </div>
            <div className="wa-sys">{"\u{1F512} 72-hour messaging window opened"}</div>
            <div className="wa-card">
              <div className="wa-card-h">{"\u2705 Verified profile shared automatically"}</div>
              <div
                style={{
                  padding: "0 11px 4px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "800",
                }}
              >
                Wanjiku Electronics
              </div>
              <div className="wa-stars">
                {"\u2605\u2605\u2605\u2605\u2605 4.8 \xB7 156 reviews \xB7 312 sales"}
              </div>
              <div className="wa-card-badge">{"\u2713 ID-verified seller"}</div>
              <div className="wa-card-sent">Sent via PlugPay</div>
              <button className="wa-card-btn" onClick={() => openMerchantModal()}>
                View full profile
              </button>
            </div>
            <div className="wa-bubble-in">
              {"Yes, 4 in stock \u{1F60A} Let me get you an invoice."}
              <span className="wa-time">9:42</span>
            </div>
            <div className="wa-bubble-out">
              I would like to buy it, send payment details
              <span className="wa-time">
                9:42<span className="wa-check">{"\u2713\u2713"}</span>
              </span>
            </div>
            <div
              className="wa-card"
              style={{
                cursor: "pointer",
              }}
              onClick={() => openInvoiceInProfile()}
            >
              <div className="wa-card-h">{"\u{1F4C4} Invoice from Wanjiku Electronics"}</div>
              <div className="wa-card-row">
                <span>Samsung Galaxy A15</span>
                <span>KSh 18,500</span>
              </div>
              <div className="wa-card-row total">
                <span>Total due</span>
                <span>KSh 18,500</span>
              </div>
              <div className="wa-card-row">
                <span>Pay to</span>
                <span>Till 174379</span>
              </div>
              <div className="wa-card-note">
                {
                  "Send the M-Pesa confirmation message here once it's paid \u2014 I'll record it and send your receipt."
                }
              </div>
              <div className="wa-card-sent">Sent via PlugPay</div>
            </div>
            <div className="wa-card">
              <div
                className="wa-card-note"
                style={{
                  padding: "11px 11px 8px",
                  color: "#e9edef",
                  fontSize: "11.5px",
                }}
              >
                Need it delivered? I can connect you with a verified PlugPay runner, or you're welcome to pick
                it up yourself at Anniversary Towers, Fl. 3.
              </div>
              <div
                style={{
                  padding: "0 9px 9px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <button
                  className="wa-quick-btn"
                  style={{
                    marginTop: "0",
                  }}
                  onClick={() => showToast("Matching you with a nearby verified runner\u2026")}
                >
                  {"\u{1F6F5} Connect me with a runner"}
                </button>
                <button
                  className="wa-quick-btn"
                  style={{
                    marginTop: "0",
                  }}
                  onClick={() => showToast("Pickup confirmed \u2014 no runner needed")}
                >
                  {"\u{1F9CD} I'll pick it up"}
                </button>
              </div>
              <div className="wa-card-sent">Sent via PlugPay</div>
            </div>
            <div className="wa-bubble-out">
              I'll pick it up myself, thanks
              <span className="wa-time">
                9:43<span className="wa-check">{"\u2713\u2713"}</span>
              </span>
            </div>
            <div className="wa-sys">{"\u{1F9CD} Pickup confirmed \u2014 no runner needed"}</div>
            <div className="wa-sys">
              {"\u{1F4B5} Buyer pays KSh 18,500 to Till 174379 \u2014 outside the app"}
            </div>
            <div className="wa-bubble-out">
              Sent! Confirmation code TGH5K9P2Q
              <span className="wa-time">
                9:44<span className="wa-check">{"\u2713\u2713"}</span>
              </span>
            </div>
            <div
              className="wa-card"
              style={{
                cursor: "pointer",
              }}
              onClick={() => openReceiptInProfile()}
            >
              <div className="wa-card-h">{"\u{1F4C4} Receipt \xB7 #00849"}</div>
              <div className="wa-card-row">
                <span>Samsung Galaxy A15</span>
                <span>KSh 18,500</span>
              </div>
              <div className="wa-card-row total">
                <span>Total paid</span>
                <span>KSh 18,500</span>
              </div>
              <div className="wa-card-row">
                <span>M-Pesa code</span>
                <span>TGH5K9P2Q</span>
              </div>
              <div className="wa-card-badge">{"\u2713 Sale recorded by Jane \xB7 Trust score updating"}</div>
              <div className="wa-card-sent">Sent via PlugPay</div>
              <button
                className="wa-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  openMerchantModalOnReviews();
                }}
              >
                Leave a review
              </button>
            </div>
          </div>
          <div className="wa-scroll-hint" />
        </div>
      </div>
      <p className="wa-caption">{"\u2191 scroll to see the full sale, receipt to review \u2191"}</p>
    </div>
  );
}