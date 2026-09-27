"use client";

import { PaginaHorarios } from "@/components/paginas/horarios";
import { usePortal } from "@/contexts/portal-context";

export default function Page() {
  const portal = usePortal();
  return (
    <div>
      <PaginaHorarios schedule={portal.schedule} user={portal.user} />
    </div>
  );
}
