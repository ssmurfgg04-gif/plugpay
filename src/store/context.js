"use client";

import { createContext, useContext } from "react";

export var PlugPayContext = createContext(null);

export function usePlugPay() {
  const ctx = useContext(PlugPayContext);
  if (!ctx) throw new Error("usePlugPay must be used inside <PlugPayProvider>");
  return ctx;
}