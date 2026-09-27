"use client";

import { PaginaInicio } from "@/components/paginas/inicio";
import { usePortal } from "@/contexts/portal-context";

export default function Page() {
  const portal = usePortal();
  return (
    <div>
      <PaginaInicio
        user={portal.user}
        events={portal.events}
        countdowns={portal.countdowns}
        suggestions={portal.suggestions}
        schedule={portal.schedule}
        navigate={portal.navigate}
      />
    </div>
  );
}
