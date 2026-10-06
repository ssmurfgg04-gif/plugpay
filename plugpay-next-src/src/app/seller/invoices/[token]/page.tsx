import { safeDecode } from "@/lib/params";
import { SellerInvoiceDetailPage } from "@/components/seller/sales/SellerInvoiceDetailPage";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token: raw } = await params;
  const token = safeDecode(raw);
  return <SellerInvoiceDetailPage token={token} />;
}