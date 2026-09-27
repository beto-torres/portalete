"use client";

import { PaginaPerfil } from "@/components/paginas/perfil";
import { usePortal } from "@/contexts/portal-context";

export default function Page() {
  const portal = usePortal();
  return (
    <div>
      <PaginaPerfil user={portal.user} onUpdate={portal.updateUser} />
    </div>
  );
}
