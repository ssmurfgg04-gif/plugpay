"use client";

import { Link } from "@/components/ui/Link";
import { Ic } from "@/components/ui/Ic";

export function ErrorState(props) {
  return (
    <div className="er" role="alert">
      <div className="er-ic">{Ic(props.icon || "triangle-alert")}</div>
      <div className="er-t">{props.title || "Something went wrong"}</div>
      <div className="er-s">{props.sub || "We couldn't load this. Check your connection and try again."}</div>
      {props.onRetry && (
        <button className="es-btn" onClick={props.onRetry}>
          {Ic("refresh-cw")}
          {props.retryLabel || "Try again"}
        </button>
      )}
      {props.backTo && (
        <Link
          to={props.backTo}
          className="es-btn alt"
          style={{
            marginTop: 8,
          }}
        >
          {props.backLabel || "Go back"}
        </Link>
      )}
    </div>
  );
}