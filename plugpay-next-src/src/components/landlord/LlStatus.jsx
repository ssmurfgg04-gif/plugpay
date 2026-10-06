"use client";

export function LlStatus(props) {
  return (
    <span className={"pp-status" + (props.ok ? "" : " pending")}>{props.ok ? "VERIFIED" : "PENDING"}</span>
  );
}