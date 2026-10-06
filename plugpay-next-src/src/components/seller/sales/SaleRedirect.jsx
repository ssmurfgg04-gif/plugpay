"use client";

import { useEffect } from "react";
import { navigate } from "@/lib/nav";
import { usePlugPay } from "@/store/context";

export function SaleRedirect() {
  var pp = usePlugPay();
  useEffect(function () {
    navigate("/seller/dashboard", {
      replace: true,
    });
    setTimeout(function () {
      if (pp.merchantLoggedIn) pp.openModal("modal-record-sale");
      else pp.openAuthModal();
    }, 200);
  }, []);
  return null;
}