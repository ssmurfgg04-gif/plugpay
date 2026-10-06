"use client";

import { navigate } from "@/lib/nav";
import { usePlugPay } from "@/store/context";
import { AppShellX } from "@/components/layout/AppShellX";
import { DashSignIn } from "@/components/layout/DashSignIn";
import { AddBuildingCard } from "@/components/landlord/AddBuildingCard";

export function LandlordBuildingsPage() {
  var pp = usePlugPay();
  if (!pp.llAuthed)
    return (
      <AppShellX role="Landlord" active="buildings" title="My buildings">
        <DashSignIn msg="Sign in to view your buildings." onClick={pp.openLandlordModal} />
      </AppShellX>
    );
  return (
    <AppShellX
      role="Landlord"
      active="buildings"
      title="My buildings"
      subtitle="One login, one separate account per building."
    >
      <div className="app-list">
        {pp.lbAccounts.map(function (a) {
          var d = pp.lbData[a.id] || {
            pending: [],
            verified: [],
            vacant: [],
          };
          var on = a.id === pp.lbActive.id;
          return (
            <div className="app-list-row" key={a.id}>
              <div className="app-list-main">
                <div className="app-list-name">{a.name + (on ? " \u00b7 open" : "")}</div>
                <div className="app-list-meta">
                  {a.street +
                    " \u00b7 " +
                    a.totalStalls +
                    " stalls \u00b7 " +
                    d.verified.length +
                    " verified \u00b7 " +
                    d.pending.length +
                    " pending"}
                </div>
              </div>
              <button
                className={"pp-btn " + (on ? "secondary" : "primary")}
                onClick={function () {
                  pp.lbSwitch(a.id);
                  if (on) pp.openBuildingModal(a.name);
                  else navigate("/landlord/dashboard");
                }}
              >
                {on ? "View" : "Open account"}
              </button>
            </div>
          );
        })}
      </div>
      <AddBuildingCard />
    </AppShellX>
  );
}