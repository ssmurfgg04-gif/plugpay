import { safeDecode } from "@/lib/params";
import { ClaimPage } from "@/components/agent/portal/ClaimPage";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token: raw } = await params;
  const token = safeDecode(raw);
  return <ClaimPage token={token} />;
}