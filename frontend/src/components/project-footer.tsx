import { projectInfo } from "@/lib/project-info";

export function ProjectFooter() {
  const credits = [
    ["Projeto", projectInfo.name],
    ["Professor responsável", projectInfo.teacher],
    ["Escola", projectInfo.school],
  ];

  return (
    <footer className="border-t border-white/10 bg-ink px-4 py-6 text-slate-400 sm:px-7 lg:px-9">
      <dl className="mx-auto grid max-w-[1428px] gap-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
        {credits.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider">
              {label}
            </dt>
            <dd className="mt-1 break-words text-slate-200">{value}</dd>
          </div>
        ))}
        <div className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wider">
            Contato
          </dt>
          <dd className="mt-1 flex flex-col items-start gap-1 text-slate-200">
            <a
              href={`https://www.instagram.com/${projectInfo.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
            >
              Instagram: @{projectInfo.instagram}
            </a>
            <a
              href={`https://wa.me/${projectInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
            >
              WhatsApp: {projectInfo.whatsappLabel}
            </a>
          </dd>
        </div>
      </dl>
    </footer>
  );
}
