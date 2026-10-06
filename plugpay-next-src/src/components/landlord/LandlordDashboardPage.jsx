"use client";

import { usePlugPay } from "@/store/context";
import { AppShellX } from "@/components/layout/AppShellX";
import { DashSignIn } from "@/components/layout/DashSignIn";
import { LbSwitcher } from "@/components/landlord/LbSwitcher";
import { LandlordBuildingView } from "@/components/landlord/LandlordBuildingView";
import { LandlordVerificationList } from "@/components/landlord/LandlordVerificationList";
import { LandlordVerifiedList } from "@/components/landlord/LandlordVerifiedList";
import { LandlordVacatedList } from "@/components/landlord/LandlordVacatedList";
import { LandlordVacantStalls } from "@/components/landlord/LandlordVacantStalls";

export function LandlordDashboardPage() {
  var pp = usePlugPay();
  if (!pp.llAuthed)
    return (
      <AppShellX role="Landlord" active="dashboard" title="Landlord dashboard">
        <DashSignIn
          msg="Sign in to your landlord account to view your dashboard."
          onClick={pp.openLandlordModal}
        />
      </AppShellX>
    );
  return (
    <AppShellX
      role="Landlord"
      active="dashboard"
      title={pp.lbActive.name}
      subtitle="Manage your building, sellers, verification and vacant stalls."
    >
      <>
        <LbSwitcher />
        <LandlordBuildingView />
        <LandlordVerificationList />
        <LandlordVerifiedList />
        <LandlordVacatedList />
        <LandlordVacantStalls />
      </>
    </AppShellX>
  );
}