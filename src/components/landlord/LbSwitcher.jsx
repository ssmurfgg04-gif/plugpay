"use client";

import { usePlugPay } from "@/store/context";

/* ---- Dashboard, buildings, sellers and stalls pages ---- */
/* ---- Dashboard, buildings, sellers and stalls pages ---- */
export function LbSwitcher() {
  var pp = usePlugPay();
  return (
    <div className="lb-switch">
      <div className="lb-switch-l">Building account</div>
      <div className="lb-chips">
        {pp.lbAccounts.map(function (a) {
          return (
            <button
              key={a.id}
              className={"lb-chip" + (a.id === pp.lbActive.id ? " on" : "")}
              onClick={function () {
                pp.lbSwitch(a.id);
              }}
            >
              {a.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}