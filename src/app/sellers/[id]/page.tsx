import { safeDecode } from "@/lib/params";
import { SellerPublicPage } from "@/components/public/SellerPublicPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = safeDecode(raw);
  return <SellerPublicPage id={id} />;
}