"use client";

import { usePlugPay } from "@/store/context";

export function FabQuick() {
  const { openModal } = usePlugPay();
  return (
    <button
      className="fab-quick"
      onClick={() => openModal("modal-quick")}
      title="Quick actions"
      aria-label="Quick actions"
    >
      {"\u26A1"}
    </button>
  );
}