"use client";

import { PaginaSugestoes } from "@/components/paginas/sugestoes";
import { usePortal } from "@/contexts/portal-context";

export default function Page() {
  const { setSuggestions, user } = usePortal();

  return (
    <div>
      <PaginaSugestoes setSuggestions={setSuggestions} user={user} />
    </div>
  );
}
