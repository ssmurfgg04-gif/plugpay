"use client";

import { Ic } from "@/components/ui/Ic";

export function DocBadges(props) {
  var b = props.badges;
  return (
    <div>
      <div className="doc-badges">
        {b.plugpay && (
          <span className="doc-badge on" title="This seller verified their phone number with PlugPay.">
            {Ic("badge-check", 12)}PlugPay Verified
          </span>
        )}
        {b.landlord ? (
          <span
            className="doc-badge on"
            title="The building's landlord confirmed this seller's phone number and profile match the real stall owner."
          >
            {Ic("building-2", 12)}Verified
          </span>
        ) : (
          <span
            className="doc-badge pending"
            title="The landlord hasn't yet confirmed this seller's phone number and profile match the real stall owner."
          >
            {Ic("building-2", 12)}Pending
          </span>
        )}
      </div>
    </div>
  );
}