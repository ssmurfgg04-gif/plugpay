import { redirect } from "next/navigation";

// `/seller` is the portal's friendly entry point — the actual portal lives at
// `/seller/dashboard` (and sibling tabs). Send people there instead of a 404.
export default function SellerIndex() {
  redirect("/seller/dashboard");
}
