"use client";

export function HowItWorks() {
  return (
    <section className="breakthrough" id="breakthrough">
      <div className="wrap">
        <div className="eyebrow on-dark">The breakthrough</div>
        <h2>Meet PlugPay.</h2>
        <p className="section-p">
          {
            "PlugPay verifies every seller's ID and location, anchors every sale to a real WhatsApp receipt, and builds a public trust profile automatically \u2014 so buyers can check you out before they pay, and you can grow past people who already know you."
          }
        </p>
        <div className="bt-stats">
          <div className="bt-stat">
            <div className="bt-n">0%</div>
            <div className="bt-l">Fake alert losses</div>
          </div>
          <div className="bt-stat">
            <div className="bt-n">{"3\xD7"}</div>
            <div className="bt-l">More buyer trust</div>
          </div>
          <div className="bt-stat">
            <div className="bt-n">100%</div>
            <div className="bt-l">Receipt-backed reviews</div>
          </div>
        </div>
      </div>
    </section>
  );
}