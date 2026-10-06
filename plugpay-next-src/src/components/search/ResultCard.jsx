"use client";

import { MerchantCard } from "@/components/search/MerchantCard";
import { BuildingCard } from "@/components/search/BuildingCard";

export function ResultCard({ result }) {
  return result.type === "merchant" ? <MerchantCard r={result} /> : <BuildingCard r={result} />;
}