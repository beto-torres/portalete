import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-white/10 bg-panel/70 shadow-panel backdrop-blur-xl ${className}`} {...props} />;
}

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`field ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`field ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`field min-h-28 resize-y ${className}`} {...props} />;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-300"><span>{label}</span>{children}</label>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <Panel className="col-span-full grid min-h-52 place-items-center p-8 text-center"><div><p className="font-semibold text-slate-200">{title}</p><p className="mt-2 text-sm text-slate-400">{text}</p></div></Panel>;
}
