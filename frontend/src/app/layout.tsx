import type { Metadata } from "next";
import { ToastProvider } from "@/components/toast-provider";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal ETE",
  description: "Agenda, horários, eventos e serviços da comunidade ETE.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('portal-ete-theme');document.documentElement.classList.toggle('light',t==='light')}catch(e){}`,
          }}
        />
        <noscript>
          O Portal ETE precisa de JavaScript habilitado para funcionar.
        </noscript>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
