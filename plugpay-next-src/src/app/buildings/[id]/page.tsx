import { safeDecode } from "@/lib/params";
import { BuildingPage } from "@/components/building/BuildingPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = safeDecode(raw);
  return <BuildingPage id={id} />;
}