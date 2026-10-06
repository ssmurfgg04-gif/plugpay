"use client";

import { useState } from "react";
import { Link } from "@/components/ui/Link";
import { usePlugPay } from "@/store/context";
import { codeOf } from "@/lib/shared";
import { PublicShellX } from "@/components/layout/PublicShellX";
import { reviewStatus, timeLeft } from "@/lib/seller";
import { Ic } from "@/components/ui/Ic";

var QUICK_REVIEW = [
  ["Quality", "Great quality products."],
  ["Quick delivery", "Quick delivery."],
  ["Great customer service", "Great customer service."],
  ["Improve service", "Service could be improved."],
];

export function ReviewPage(props) {
  var pp = usePlugPay();
  var code = codeOf(props.code);
  var sale = pp.receiptsList.filter(function (r) {
    return codeOf(r.code) === code;
  })[0];
  var _r = useState(0),
    rating = _r[0],
    setRating = _r[1];
  var _c = useState(""),
    comment = _c[0],
    setComment = _c[1];
  var _e = useState(""),
    err = _e[0],
    setErr = _e[1];
  if (!sale || !sale.sentAt) {
    return (
      <PublicShellX title="Review link not found">
        <div className="app-card">
          <div className="app-card-title">We couldn't find a receipt for this link.</div>
          <div className="app-card-sub">
            Double check the link your seller sent you, or ask them to resend it.
          </div>
          <div className="app-actions">
            <Link to="/" className="pp-btn secondary">
              Return home
            </Link>
          </div>
        </div>
      </PublicShellX>
    );
  }
  var sp = pp.sellerProfile,
    st = reviewStatus(sale);
  if (st.state === "done") {
    return (
      <PublicShellX title="Review submitted" subtitle={sp.bizName + " \u00b7 Receipt " + sale.code}>
        <section className="app-card review-public">
          <div className="app-card-title">Thanks for rating your purchase</div>
          <div
            className="rev-stars-big"
            style={{
              margin: "8px 0",
            }}
          >
            {"\u2605".repeat(sale.review.rating) + "\u2606".repeat(5 - sale.review.rating)}
          </div>
          {sale.review.comment && <div className="rev-item-text">{sale.review.comment}</div>}
          <div
            className="doc-note"
            style={{
              padding: "10px 0 0",
            }}
          >
            Each receipt can be reviewed once.
          </div>
          <div className="app-actions">
            <Link to={"/r/" + code} className="pp-btn secondary">
              Back to receipt
            </Link>
          </div>
        </section>
      </PublicShellX>
    );
  }
  if (st.state === "expired") {
    return (
      <PublicShellX title="Review window closed" subtitle={sp.bizName + " \u00b7 Receipt " + sale.code}>
        <section className="app-card review-public">
          <div className="app-card-title">This review link has expired</div>
          <div className="app-card-sub">Reviews can be left within 6 hours of getting your receipt.</div>
          <div className="app-actions">
            <Link to={"/r/" + code} className="pp-btn secondary">
              Back to receipt
            </Link>
          </div>
        </section>
      </PublicShellX>
    );
  }
  function toggleChip(phrase) {
    setErr("");
    setComment(function (c) {
      if (c.indexOf(phrase) > -1)
        return c
          .replace(phrase, "")
          .replace(/\s{2,}/g, " ")
          .trim();
      return (c.trim() ? c.trim() + " " : "") + phrase;
    });
  }
  function submit() {
    var res = pp.submitReview(sale.code, {
      rating: rating,
      comment: comment,
    });
    if (!res.ok)
      setErr(
        res.reason === "norating"
          ? "Tap a star to rate first."
          : res.reason === "expired"
            ? "The 6-hour review window has closed."
            : res.reason === "done"
              ? "This receipt was already reviewed."
              : "Couldn't submit your review.",
      );
  }
  var LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <PublicShellX
      title="Rate your purchase"
      subtitle={sp.bizName + " \u00b7 Receipt " + sale.code + " \u00b7 KSh " + sale.total.toLocaleString()}
    >
      <section className="app-card review-public">
        <div
          className="rv-note"
          style={{
            marginBottom: 6,
          }}
        >
          <span>{"\u23F1"}</span>
          <span>{"One review per receipt. This link closes in " + timeLeft(st.msLeft) + "."}</span>
        </div>
        <div className="star-picker">
          {[1, 2, 3, 4, 5].map(function (n) {
            return (
              <button
                key={n}
                className={"star-btn" + (n <= rating ? " on" : "")}
                aria-label={n + " star" + (n > 1 ? "s" : "")}
                onClick={function () {
                  setRating(n);
                  setErr("");
                }}
              >
                {"\u2605"}
              </button>
            );
          })}
        </div>
        <div className="star-picker-label">
          {rating ? rating + " of 5 \u00b7 " + LABELS[rating] : "Tap a star to rate"}
        </div>
        <div className="rv-quick-h">Quick comments</div>
        <div className="rv-quick">
          {QUICK_REVIEW.map(function (q) {
            return (
              <button
                key={q[0]}
                type="button"
                className={"rv-qc" + (comment.indexOf(q[1]) > -1 ? " on" : "")}
                onClick={function () {
                  toggleChip(q[1]);
                }}
              >
                {q[0]}
              </button>
            );
          })}
        </div>
        <textarea
          className="pp-textarea"
          style={{
            marginTop: 12,
          }}
          placeholder="Add more detail (optional)"
          value={comment}
          onChange={function (e) {
            setComment(e.target.value);
          }}
        />
        {err && (
          <div className="field-err" role="alert">
            {Ic("triangle-alert", 13)}
            {err}
          </div>
        )}
        <div className="app-actions">
          <button className="pp-btn primary" onClick={submit}>
            Submit review
          </button>
        </div>
      </section>
    </PublicShellX>
  );
}