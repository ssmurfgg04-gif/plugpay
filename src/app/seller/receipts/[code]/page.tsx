import { safeDecode } from "@/lib/params";
import { SellerReceiptDetailPage } from "@/components/seller/sales/SellerReceiptDetailPage";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = safeDecode(raw);
  return <SellerReceiptDetailPage code={code} />;
}