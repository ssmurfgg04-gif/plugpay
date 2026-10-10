"use client";

import { usePlugPay } from "@/store/context";
import { PortalShell } from "@/components/layout/PortalShell";
import { TopBar } from "@/components/layout/TopBar";
import { SellerBottomNav } from "@/components/seller/shell/SellerBottomNav";

export function SellerPortalShell(props) {
  var pp = usePlugPay();
  var active = props.active;
  var showDock = (active === "dashboard" || active === "sales") && !props.noDock;
  return (
    <PortalShell
      shellClass="sp-shell"
      wrapClass="sp-wrap"
      header={
        <TopBar
          title={pp.sellerProfile.bizName || "My Business"}
          actions={
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                className="tp-navbar-btn"
                style={{
                  width: "auto",
                  padding: "0 12px",
                  fontSize: 10,
                  fontWeight: 800,
                }}
                onClick={function () {
                  pp.viewSellerProfile();
                }}
              >
                View profile
              </button>
              <button
                className="tp-navbar-btn"
                style={{
                  width: "auto",
                  padding: "0 10px",
                  fontSize: 10,
                  fontWeight: 800,
                  opacity: 0.85,
                }}
                aria-label="Sign out"
                onClick={function () {
                  pp.authLogout();
                }}
              >
                Sign out
              </button>
            </div>
          }
        />
      }
      body={
        <div
          style={{
            paddingBottom: 96,
          }}
        >
          {props.children}
        </div>
      }
      dock={
        showDock && (
          <div className="sp-dock">
            <button
              className="sp-dock-btn rec"
              onClick={function () {
                pp.openModal("modal-record-sale");
              }}
            >
              {"\uFF0B Record a sale"}
            </button>
          </div>
        )
      }
      nav={<SellerBottomNav active={active} />}
    />
  );
}