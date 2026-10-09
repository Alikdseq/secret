"use client";

import { notFound, useParams } from "next/navigation";
import { ProductView } from "@/components/product-view";
import { getBouquet } from "@/data/catalog";

export default function BouquetPage() {
  const params = useParams<{ slug: string }>();
  const bouquet = getBouquet(params.slug);
  if (!bouquet) notFound();
  return <ProductView bouquet={bouquet} />;
}
