"use client";

import { useEffect, useState } from "react";
import { Ic } from "@/components/ui/Ic";

export function NetBanner() {
  var _s = useState(typeof navigator !== "undefined" ? navigator.onLine : true),
    online = _s[0],
    setOnline = _s[1];
  useEffect(function () {
    var on = function () {
        setOnline(true);
      },
      off = function () {
        setOnline(false);
      };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return function () {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div className="net-banner" role="alert">
      {Ic("wifi-off")}
      <span>You're offline. Changes won't sync until you reconnect.</span>
      <button
        onClick={function () {
          setOnline(navigator.onLine);
        }}
      >
        Retry
      </button>
    </div>
  );
}