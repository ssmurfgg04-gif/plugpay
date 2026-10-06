"use client";

import { reviewStatus, timeLeft } from "@/lib/seller";

export function ReviewChip(props) {
  var st = reviewStatus(props.r);
  if (st.state === "done")
    return <span className="rv-chip done">{"\u2605 " + props.r.review.rating + " reviewed"}</span>;
  if (st.state === "open")
    return <span className="rv-chip open">{"Review open \u00b7 " + timeLeft(st.msLeft) + " left"}</span>;
  if (st.state === "expired") return <span className="rv-chip exp">Review window closed</span>;
  return <span className="rv-chip wait">Not sent yet</span>;
}