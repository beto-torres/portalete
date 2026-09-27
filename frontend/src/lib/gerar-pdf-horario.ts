import type { ScheduleItem } from "@/types";

const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

type DadosDoHorario = {
  curso: string;
  serie: string;
  turma: string;
  horarios: ScheduleItem[];
};

async function carregarLogo() {
  const resposta = await fetch("/imagens/ete-logo.png");

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar a logo da ETE.");
  }

  const arquivo = await resposta.blob();

  return new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(new Error("Não foi possível ler a logo."));
    leitor.readAsDataURL(arquivo);
  });
}

export async function baixarHorarioEmPdf({
  curso,
  serie,
  turma,
  horarios,
}: DadosDoHorario) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const logo = await carregarLogo();
  const documento = new jsPDF({ orientation: "landscape", format: "a4" });
  const turmaSelecionada = `${serie} ${curso} ${turma}`;
  const numeroDaSerie = serie.replace(/\D/g, "");
  const siglaDoCurso = `${numeroDaSerie}${curso}`;
  const siglaDaTurma = `${numeroDaSerie}${curso}${turma}`;

  documento.setFillColor(15, 23, 42);
  documento.rect(0, 0, 297, 36, "F");
  documento.addImage(logo, "PNG", 14, 4, 43, 26.6);
  documento.setTextColor(255, 255, 255);
  documento.setFont("helvetica", "bold");
  documento.setFontSize(18);
  documento.text(`Horário Semanal - ${siglaDaTurma}`, 65, 15);

  documento.setFont("helvetica", "normal");
  documento.setFontSize(10);
  documento.text("Grade de aulas da turma", 65, 24);

  const linhas = Array.from({ length: 9 }, (_, indice) => {
    const aula = indice + 1;
    const horariosDaAula = dias.map((_, indiceDoDia) => {
      const horario = horarios.find(
        (item) =>
          item.className === turmaSelecionada &&
          item.day === indiceDoDia + 1 &&
          item.lesson === aula,
      );

      return horario ? `${horario.subject}\n${horario.teacher}` : "-";
    });

    return [`${aula}ª`, ...horariosDaAula];
  });

  autoTable(documento, {
    startY: 44,
    head: [["Aula", ...dias]],
    body: linhas,
    theme: "grid",
    styles: {
      cellPadding: 3,
      font: "helvetica",
      fontSize: 9,
      halign: "center",
      valign: "middle",
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      minCellHeight: 12,
    },
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  documento.setTextColor(100, 116, 139);
  documento.setFontSize(8);
  documento.text(
    `Portal ETE | Gerado em ${new Date().toLocaleString("pt-BR")}`,
    14,
    202,
  );

  const nomeDoArquivo = `horario-${siglaDaTurma.toLowerCase()}.pdf`;
  documento.save(nomeDoArquivo);
}
