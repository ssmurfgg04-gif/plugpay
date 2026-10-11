import { redirect } from "next/navigation";

// `/landlord` is the portal's friendly entry point — the actual portal lives
// at `/landlord/dashboard` (and sibling tabs). Send people there instead of a 404.
export default function LandlordIndex() {
  redirect("/landlord/dashboard");
}
