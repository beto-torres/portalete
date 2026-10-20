import { projectInfo } from "@/lib/project-info";
import { GraduationCap, Instagram, MessageCircle } from "lucide-react";

export function ProjectFooter() {
  const credits = [
    ["Professor responsável", projectInfo.teacher],
    ["Escola", projectInfo.school],
  ];

  return (
    <footer className="border-t border-white/10 bg-panel/40 px-4 py-8 text-slate-400 sm:px-7 lg:px-9">
      <div className="mx-auto grid max-w-[1428px] gap-8 md:grid-cols-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-violet-400">
              <GraduationCap size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-200">
                {projectInfo.name}
              </p>
              <p className="mt-0.5 text-xs">{projectInfo.school}</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6">
            Agenda, horários e serviços para a comunidade escolar.
          </p>
        </div>
        <dl className="grid content-start gap-5 text-sm">
          {credits.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs font-medium">{label}</dt>
              <dd className="mt-1.5 break-words font-medium leading-6 text-slate-200">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="min-w-0 border-t border-white/10 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <h2 className="text-xs font-medium">Fale com a escola</h2>
          <div className="mt-3 flex flex-col items-start gap-1 text-slate-200">
            <a
              href={`https://www.instagram.com/${projectInfo.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link inline-flex min-h-10 max-w-full items-center gap-3 text-sm"
            >
              <Instagram
                size={17}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <span className="break-all">@{projectInfo.instagram}</span>
            </a>
            <a
              href={`https://wa.me/${projectInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link inline-flex min-h-10 max-w-full items-center gap-3 text-sm"
            >
              <MessageCircle
                size={17}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <span>WhatsApp: {projectInfo.whatsappLabel}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
