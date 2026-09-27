"use client";

import { toast } from "react-toastify";

export function confirmarComToast(mensagem: string, textoBotao = "Confirmar") {
  return new Promise<boolean>((resolve) => {
    let respondido = false;

    function responder(resposta: boolean, toastId: string | number) {
      if (respondido) return;

      respondido = true;
      toast.dismiss(toastId);
      resolve(resposta);
    }

    const toastId = toast(
      <div>
        <p className="mb-3 text-sm text-slate-100">{mensagem}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/15"
            onClick={() => responder(false, toastId)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
            onClick={() => responder(true, toastId)}
          >
            {textoBotao}
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        onClose: () => {
          if (!respondido) resolve(false);
        },
      },
    );
  });
}
