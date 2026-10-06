"use client";

import { useRouter } from "next/navigation";
import { bindRouter } from "@/lib/nav";

// Hands the Next router to lib/nav so navigate()/goBack() work anywhere.
export function RouterBridge() {
  bindRouter(useRouter());
  return null;
}