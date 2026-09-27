import type { ReactNode } from "react";
import { PortalArea } from "@/components/portal/portal-area";

export default function Layout({ children }: { children: ReactNode }) {
  return <PortalArea>{children}</PortalArea>;
}
