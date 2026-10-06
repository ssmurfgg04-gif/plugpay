import { safeDecode } from "@/lib/params";
import { PublicReceiptPage } from "@/components/seller/sales/PublicReceiptPage";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = safeDecode(raw);
  return <PublicReceiptPage code={code} />;
}