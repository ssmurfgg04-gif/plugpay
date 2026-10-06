import { safeDecode } from "@/lib/params";
import { PayInvoicePage } from "@/components/seller/sales/PayInvoicePage";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token: raw } = await params;
  const token = safeDecode(raw);
  return <PayInvoicePage token={token} />;
}