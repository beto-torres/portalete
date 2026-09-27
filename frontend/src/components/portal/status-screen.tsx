export function StatusScreen({title,text,action,onAction}:{title:string;text:string;action:string;onAction:()=>void}) {
  return <main className="grid min-h-screen place-items-center bg-ink p-4 text-slate-100"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-panel p-8 text-center shadow-panel"><h1 className="text-2xl font-bold">{title}</h1><p className="mt-3 text-slate-400">{text}</p><button className="mt-6 min-h-11 rounded-xl bg-primary px-5 font-semibold text-white" onClick={onAction}>{action}</button></div></main>;
}
