"use client";

import { usePlugPay } from "@/store/context";
import { AgentGate } from "@/components/agent/onboarding/AgentGate";
import { Step1Building } from "@/components/agent/onboarding/Step1Building";
import { Step4StallsConfirm } from "@/components/agent/onboarding/Step4StallsConfirm";

var STEP_META = {
  1: {
    title: "\u{1F4CD} Onboard a Building",
    sub: "Step 1 of 2 \xB7 Building details",
    pip: 1,
  },
  4: {
    title: "\u{1F4CD} Onboard a Building",
    sub: "Step 2 of 2 \xB7 Map stalls & register sellers",
    pip: 2,
  },
};

export function OnboardFlow() {
  var _a;
  const { obAgentGate, obStep_, obStep, obMerchantList } = usePlugPay();
  const meta = (_a = STEP_META[obStep_]) != null ? _a : STEP_META[1];
  return obAgentGate ? (
    <AgentGate />
  ) : (
    <div>
      <div className="ob-header">
        <div className="ob-title">{meta.title}</div>
        <div className="ob-sub">{meta.sub}</div>
        <div className="ob-steps-bar">
          {[1, 2].map((p) => (
            <div className={`ob-step-pip${p <= meta.pip ? " active" : ""}`} />
          ))}
        </div>
      </div>
      <div className="ob-body">
        <Step1Building active={obStep_ === 1} />
        <Step4StallsConfirm active={obStep_ === 4} />
      </div>
      <div className="ob-footer">
        {obStep_ > 1 && (
          <button className="ob-btn-back" onClick={() => obStep(-1)}>
            {"\u2190 Back"}
          </button>
        )}
        <button className="ob-btn-primary" onClick={() => obStep(1)}>
          {obStep_ === 4
            ? `Publish ${obMerchantList.length} seller${obMerchantList.length === 1 ? "" : "s"} \u{1F680}`
            : "Save & Continue \u2192"}
        </button>
      </div>
    </div>
  );
}