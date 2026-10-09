import { Suspense } from "react";
import { StudioApp } from "@/components/studio-app";

export default function StudioPage() {
  return (
    <Suspense fallback={<section className="stage py-16 text-sm text-black/45">Открываем SECRET STUDIO…</section>}>
      <StudioApp />
    </Suspense>
  );
}
