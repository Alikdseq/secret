"use client";

import { notFound, useParams } from "next/navigation";
import { ProductView } from "@/components/product-view";
import { usePublicBouquets } from "@/lib/use-public-bouquets";

export default function BouquetPage() {
  const params = useParams<{ slug: string }>();
  const { items, ready } = usePublicBouquets();
  const bouquet = items.find((item) => item.slug === params.slug);
  if (!bouquet && ready) notFound();
  if (!bouquet) return <section className="stage py-16 text-sm text-black/45">Открываем карточку…</section>;
  return <ProductView bouquet={bouquet} />;
}
