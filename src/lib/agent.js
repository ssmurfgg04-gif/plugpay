import { appBase } from "@/lib/shared";

export function claimLink(t) {
  return appBase() + "/claim/" + encodeURIComponent(t);
}