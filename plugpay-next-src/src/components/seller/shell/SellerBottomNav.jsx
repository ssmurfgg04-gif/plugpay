"use client";

import { navigate } from "@/lib/nav";

/* ---- Portal shell and navigation ---- */
/* ---- Portal shell and navigation ---- */
var SP_TABS = [
  ["dashboard", "Dashboard", "/seller/dashboard"],
  ["catalogue", "Catalogue", "/seller/catalogue"],
  ["profile", "Profile", "/seller/profile"],
  ["building", "Building", "/seller/building"],
];

export function SellerBottomNav(props) {
  var active = props.active || "dashboard";
  return (
    <nav className="seller-bottom-nav" aria-label="Seller navigation">
      {SP_TABS.map(function (tab) {
        return (
          <button
            key={tab[0]}
            type="button"
            className={"seller-bottom-nav-item" + (active === tab[0] ? " active" : "")}
            onClick={function () {
              navigate(tab[2], {
                replace: true,
              });
            }}
          >
            {tab[1]}
          </button>
        );
      })}
    </nav>
  );
}