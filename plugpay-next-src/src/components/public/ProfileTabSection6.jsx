"use client";

import { useContext } from "react";
import { ProfCtx } from "@/lib/public";

export function ProfileTabSection6() {
  var __c = useContext(ProfCtx) || {};
  var sv = __c.sv;
  return (
    !sv.own && (
      <div
        className="tp-card public-trusted-people"
        style={{
          margin: "9px 9px 9px",
          padding: "13px",
        }}
      >
        <div className="tp-section-title">Runners & Errand People</div>
        <div className="tp-section-body">People this seller has worked with.</div>
        <div className="vouch-list">
          {[
            ["Brian Otieno", "Boda rider", "\uD83C\uDFCD\uFE0F"],
            ["Faith Nekesa", "Errand runner", "\uD83C\uDFC3"],
          ].map(function (person) {
            return (
              <div className="vouch-item" key={person[0]}>
                <div className="vouch-av">{person[2]}</div>
                <div className="vouch-info">
                  <div className="vouch-name">{person[0]}</div>
                  <div className="vouch-sub">{person[1]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
}