"use client";

import { PaginaAdministracao } from "@/components/paginas/administracao";
import { usePortal } from "@/contexts/portal-context";

export default function Page() {
  const portal = usePortal();
  return (
    <div>
      <PaginaAdministracao
        role={portal.user.role}
        events={portal.events}
        setEvents={portal.setEvents}
        countdowns={portal.countdowns}
        setCountdowns={portal.setCountdowns}
        suggestions={portal.suggestions}
        setSuggestions={portal.setSuggestions}
        schedule={portal.schedule}
        setSchedule={portal.setSchedule}
      />
    </div>
  );
}
