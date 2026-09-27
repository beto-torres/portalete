"use client";

import { PaginaCalendario } from "@/components/paginas/calendario";
import { usePortal } from "@/contexts/portal-context";

export default function Page() {
  const portal = usePortal();
  return (
    <div>
      <PaginaCalendario events={portal.events} user={portal.user} />
    </div>
  );
}
