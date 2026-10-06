"use client";

import { usePlugPay } from "@/store/context";

export function Toast() {
  const { toast } = usePlugPay();
  return (
    <div className={`toast${toast ? " on" : ""}`} id="toast">
      {toast}
    </div>
  );
}