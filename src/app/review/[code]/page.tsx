import { safeDecode } from "@/lib/params";
import { ReviewPage } from "@/components/seller/sales/ReviewPage";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = safeDecode(raw);
  return <ReviewPage code={code} />;
}