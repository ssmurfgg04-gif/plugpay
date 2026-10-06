"use client";

import { useLayoutEffect } from "react";
import { goBack } from "@/lib/nav";
import { usePlugPay } from "@/store/context";
import { ppSlug } from "@/lib/building";
import { merchants } from "@/lib/public";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { RouteSheet } from "@/components/ui/RouteSheet";
import { MerchantProfileBody } from "@/components/public/MerchantProfileBody";

export function SellerPublicPage(props) {
  var pp = usePlugPay();
  var k = ppSlug(props.id);
  var found =
    merchants.some(function (m) {
      return ppSlug(m.name) === k;
    }) || ppSlug(pp.sellerProfile.ownerName) === k;
  useLayoutEffect(
    function () {
      if (found) pp.loadSellerPage(props.id);
    },
    [props.id],
  );
  if (!found) return <NotFoundPage title="Seller not found" sub="We couldn't find a seller at this link." />;
  return (
    <RouteSheet innerClassName="modal tpModal" hideBar={true}>
      <MerchantProfileBody onClose={goBack} />
    </RouteSheet>
  );
}