"use client";

import { useEffect } from "react";
import { navigate } from "@/lib/nav";
import { usePlugPay } from "@/store/context";
import { ppResolveBuilding, ppSlug } from "@/lib/building";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { RouteSheet } from "@/components/ui/RouteSheet";
import { BuildingViewContainer } from "@/components/building/BuildingViewContainer";

export function BuildingPage(props) {
  var pp = usePlugPay();
  var found = ppResolveBuilding(props.id, pp.lbAccounts, pp.agentBuildings);
  useEffect(
    function () {
      pp.setBldgFloor("G");
    },
    [props.id],
  );
  if (!found)
    return <NotFoundPage title="Building not found" sub="We couldn't find a building at this link." />;
  return (
    <RouteSheet>
      <BuildingViewContainer
        id={props.id}
        onMerchantSelect={function (m) {
          navigate("/sellers/" + ppSlug(m.name));
        }}
      />
    </RouteSheet>
  );
}