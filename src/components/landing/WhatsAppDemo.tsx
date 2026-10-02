export function WhatsAppDemo() {
  return (
    <section className="pp-section" style={{ background: 'var(--bg-dark)', paddingTop: 0 }}>
      <div className="wrap">
        <div className="wa-phone">
          <div className="wa-screen">
            <div className="wa-header">
              <span className="wa-avatar">WE</span>
              <div>
                <div className="wa-header-name">Wanjiku Electronics</div>
                <div className="wa-header-status">online</div>
              </div>
            </div>
            <div className="wa-body">
              <div className="wa-day"><span>TODAY</span></div>

              <div className="wa-bubble-in">
                Hi! Is the Samsung Galaxy A15 still available? Saw it on your status and TikTok page
                <span className="wa-time">9:41 <span className="wa-check">✓✓</span></span>
              </div>

              <div className="wa-sys">🔒 72-hour messaging window opened</div>

              <div className="wa-card">
                <div className="wa-card-h">✅ Verified profile shared automatically</div>
                <div className="wa-card-row"><span>Wanjiku Electronics</span><span>★★★★★ 4.8</span></div>
                <div className="wa-card-row"><span>156 reviews · 312 sales</span><span>ID-verified</span></div>
                <div className="wa-card-sent">Sent via PlugPay</div>
                <button className="wa-card-btn" type="button">View full profile</button>
              </div>

              <div className="wa-bubble-out">
                Yes, 4 in stock. Let me get you an invoice.
                <span className="wa-time">9:42</span>
              </div>

              <div className="wa-bubble-in">
                I would like to buy it, send payment details
                <span className="wa-time">9:42 <span className="wa-check">✓✓</span></span>
              </div>

              <div className="wa-card">
                <div className="wa-card-h">📄 Invoice · Wanjiku Electronics</div>
                <div className="wa-card-row"><span>Samsung Galaxy A15</span><span>KSh 18,500</span></div>
                <div className="wa-card-row total"><span>Total due</span><span>KSh 18,500</span></div>
                <div className="wa-card-row"><span>Pay to</span><span>Till 174379</span></div>
                <div className="wa-card-note">
                  Send the M-Pesa confirmation message here once it&apos;s paid, and I&apos;ll record
                  it and send your receipt.
                </div>
                <div className="wa-card-sent">Sent via PlugPay</div>
              </div>

              <div className="wa-bubble-out">
                Need it delivered? I can connect you with a verified PlugPay runner, or you&apos;re
                welcome to pick it up yourself at Kencom House, Fl. 3.
                <span className="wa-time">9:42</span>
              </div>

              <div className="wa-quick">
                <button className="wa-quick-btn" type="button">🛵 Connect me with a runner</button>
                <button className="wa-quick-btn" type="button">🧍 I&apos;ll pick it up</button>
              </div>

              <div className="wa-bubble-in">
                I&apos;ll pick it up myself, thanks
                <span className="wa-time">9:43 <span className="wa-check">✓✓</span></span>
              </div>

              <div className="wa-sys">🧍 Pickup confirmed · no runner needed</div>

              <div className="wa-bubble-out">
                💵 Buyer pays KSh 18,500 to Till 174379, outside the app. Sent! Confirmation code TGH5K9P2Q
                <span className="wa-time">9:44 <span className="wa-check">✓✓</span></span>
              </div>

              <div className="wa-card">
                <div className="wa-card-h">📄 Receipt #00849</div>
                <div className="wa-card-row"><span>Samsung Galaxy A15</span><span>KSh 18,500</span></div>
                <div className="wa-card-row total"><span>Total paid</span><span>KSh 18,500</span></div>
                <div className="wa-card-row"><span>M-Pesa code</span><span>TGH5K9P2Q</span></div>
                <div className="wa-card-note">✓ Sale recorded by Jane · Trust score updating</div>
                <div className="wa-stars">★★★★★</div>
                <div className="wa-card-badge">✓ Anchored to a real payment</div>
                <div className="wa-card-sent">Sent via PlugPay</div>
                <button className="wa-card-btn" type="button">Leave a review</button>
              </div>
            </div>
          </div>
        </div>
        <p className="wa-caption">A full sale, receipt to review, without leaving the chat</p>
      </div>
    </section>
  );
}
