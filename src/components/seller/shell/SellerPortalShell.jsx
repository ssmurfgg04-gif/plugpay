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
          title="My Business"
          actions={
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