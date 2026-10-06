"use client";

import { useEffect } from "react";
import { navigate } from "@/lib/nav";
import { usePlugPay } from "@/store/context";
import { RouteSheet } from "@/components/ui/RouteSheet";
import { OnboardFlow } from "@/components/agent/onboarding/OnboardFlow";

export function AgentOnboardingPage() {
  var pp = usePlugPay();
  useEffect(function () {
    pp.openOnboard();
    pp.closeModal("modal-onboard");
  }, []);
  return (
    <RouteSheet
      innerClassName="ob-modal"
      onClose={function () {
        navigate("/agent/buildings");
      }}
    >
      <OnboardFlow />
    </RouteSheet>
  );
}