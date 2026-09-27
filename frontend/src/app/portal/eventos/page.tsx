"use client";

import { PaginaEventos } from "@/components/paginas/eventos";
import { usePortal } from "@/contexts/portal-context";

export default function Page() {
  const portal = usePortal();
  return (
    <div>
      <PaginaEventos events={portal.events} user={portal.user} />
    </div>
  );
}
