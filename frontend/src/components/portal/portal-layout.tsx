"use client";

import { useState, type ReactNode } from "react";
import type { User, View } from "@/types";
import { Sidebar } from "../sidebar";
import { PortalHeader } from "./portal-header";
import { ProjectFooter } from "../project-footer";

export function PortalLayout({
  user,
  view,
  warning,
  onNavigate,
  onLogout,
  children,
}: {
  user: User;
  view: View;
  warning: string;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  function navigate(nextView: View) {
    onNavigate(nextView);
    setMenuOpen(false);
  }
  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <Sidebar
        view={view}
        role={user.role}
        open={menuOpen}
        onNavigate={navigate}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
      />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <PortalHeader
          user={user}
          onOpenMenu={() => setMenuOpen(true)}
          onNavigate={navigate}
        />
        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-7 lg:p-9">
          {warning && (
            <p
              role="status"
              className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-300"
            >
              {warning}
            </p>
          )}
          {children}
        </main>
        <ProjectFooter />
      </div>
    </div>
  );
}
