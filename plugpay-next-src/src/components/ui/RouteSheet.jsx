"use client";

import { useEffect } from "react";
import { goBack } from "@/lib/nav";

export function RouteSheet(props) {
  useEffect(function () {
    document.body.style.overflow = "hidden";
    return function () {
      document.body.style.overflow = "";
    };
  }, []);
  var exit = props.onClose || goBack;
  return (
    <div
      className="modal-overlay on"
      style={{
        zIndex: 900,
      }}
    >
      <div className={props.innerClassName || "modal"}>
        {!props.hideBar && (
          <div className="modal-bar">
            <button className="modal-back" aria-label="Back" onClick={exit}>
              {"\u2190"}
            </button>
            <button className="modal-close" aria-label="Close" onClick={exit}>
              {"\u2715"}
            </button>
          </div>
        )}
        {props.children}
      </div>
    </div>
  );
}