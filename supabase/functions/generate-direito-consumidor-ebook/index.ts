import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COLORS = {
  primary: rgb(0.153, 0.227, 0.373),
  accent: rgb(0.698, 0.533, 0.294),
  body: rgb(0.15, 0.15, 0.15),
  muted: rgb(0.45, 0.45, 0.45),
  light: rgb(0.75, 0.75, 0.75),
  rule: rgb(0.85, 0.85, 0.85),
  bgAccent: rgb(0.96, 0.94, 0.91),
  white: rgb(1, 1, 1),
};

function wrapText(text: string, fontSize: number, maxWidth: number, fontObj: any): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = fontObj.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [""];
}

const EBOOK_CHAPTERS = [
  {
    title: "Capítulo 1 — Fundamentos do Código de Defesa do Consumidor",
    paragraphs: [
      "O Código de Defesa do Consumidor (Lei 8.078/90) é considerado uma das legislações mais avançadas do mundo em proteção consumerista. Promulgado em 1990, ele estabeleceu um sistema de proteção integral baseado em princípios fundamentais: vulnerabilidade do consumidor, boa-fé objetiva, equilíbrio contratual e responsabilidade objetiva do fornecedor.",
      "O CDC reconhece que o consumidor está em posição de desvantagem técnica, jurídica e econômica na relação de consumo. Por isso, estabelece mecanismos como a inversão do ônus da prova, a interpretação mais favorável ao consumidor e a nulidade de cláusulas abusivas.",
      "Em 2026, com a digitalização acelerada das relações de consumo, o CDC ganhou ainda mais relevância. O e-commerce, os marketplaces, as fintechs e os serviços de assinatura digital trouxeram novos desafios — e o CDC, aliado à jurisprudência atualizada, oferece as ferramentas para enfrentá-los.",
      "Conhecer seus direitos é o primeiro passo para exercê-los. Este guia aborda as situações mais comuns enfrentadas pelos consumidores e os instrumentos jurídicos disponíveis para garantir a proteção prevista em lei.",
    ],
  },
  {
    title: "Capítulo 2 — Negativação Indevida e Proteção Creditícia",
    paragraphs: [
      "A inclusão indevida do nome do consumidor em cadastros de inadimplentes (SPC, Serasa, Boa Vista) é uma das violações mais graves ao direito do consumidor. O STJ consolidou que a negativação indevida gera dano moral presumido (in re ipsa), dispensando prova do sofrimento.",
      "As principais hipóteses de negativação indevida incluem: dívida já paga, dívida prescrita (mais de 5 anos), fraude por terceiros, ausência de notificação prévia (Art. 43, §2º do CDC) e dívida objeto de discussão judicial.",
      "O consumidor pode obter tutela de urgência para remoção imediata da negativação em 24 a 72 horas. Os valores de indenização por danos morais em 2026 variam entre R$ 5.000 e R$ 20.000, podendo ser majorados em casos de reincidência ou longa permanência da restrição.",
      "Importante: a Súmula 323 do STJ determina que a manutenção de inscrição em cadastros de inadimplentes por período superior ao prazo prescricional de 5 anos configura ato ilícito, gerando direito a indenização independentemente da existência original da dívida.",
    ],
  },
  {
    title: "Capítulo 3 — Cobranças Indevidas e Repetição de Indébito",
    paragraphs: [
      "O Art. 42 do CDC proíbe o uso de ameaça, coação ou constrangimento na cobrança de dívidas. O parágrafo único estabelece que valores cobrados indevidamente devem ser devolvidos em dobro, com correção monetária e juros legais.",
      "A repetição de indébito aplica-se quando: o consumidor paga valor superior ao devido, paga dívida inexistente, é cobrado por serviço não contratado, ou sofre cobrança de tarifas bancárias ilegais. O requisito é a demonstração da cobrança indevida e do pagamento efetivo.",
      "Em relações bancárias, a cobrança de tarifas não previstas no contrato ou em desacordo com as resoluções do Banco Central configura cobrança indevida. Exemplos frequentes: TAC (Tarifa de Abertura de Crédito), seguro prestamista sem consentimento e taxa de gravame.",
      "O prazo prescricional para pleitear a repetição de indébito é de 3 anos (Art. 27 do CDC para fato do serviço) ou 5 anos (prescrição geral do Art. 206, §5º do Código Civil), dependendo da natureza da relação. A tendência jurisprudencial em 2026 é aplicar o prazo mais favorável ao consumidor.",
    ],
  },
  {
    title: "Capítulo 4 — Vícios de Produto e Garantia Legal",
    paragraphs: [
      "O CDC distingue entre vício do produto (Art. 18 — problema que torna o produto impróprio ou inadequado) e fato do produto (Art. 12 — defeito que causa dano ao consumidor). A garantia legal é obrigatória: 30 dias para não duráveis e 90 dias para duráveis.",
      "A garantia contratual (do fabricante) é complementar à legal e soma-se a ela. Um eletrodoméstico com 1 ano de garantia do fabricante tem, na verdade, 1 ano e 90 dias. Para vícios ocultos, o prazo começa a contar da descoberta do defeito, não da compra.",
      "O fornecedor tem 30 dias para sanar o vício. Passado esse prazo, o consumidor pode exigir: substituição por produto novo, restituição do valor (com correção) ou abatimento proporcional. Para produtos essenciais (geladeira, fogão) ou vícios que comprometam a qualidade, a troca pode ser imediata.",
      "O recall é obrigação do fabricante quando o defeito coloca em risco a segurança do consumidor. A não realização gera responsabilidade criminal e cível. O consumidor nunca paga pelo recall, e a garantia legal do produto substituído é reiniciada.",
    ],
  },
  {
    title: "Capítulo 5 — Compras Online e Direito de Arrependimento",
    paragraphs: [
      "O Art. 49 do CDC garante o direito de arrependimento em 7 dias corridos para compras fora do estabelecimento comercial. O prazo conta do recebimento do produto ou da assinatura do contrato. Não é necessário justificar o motivo da desistência.",
      "Todos os custos de devolução são do fornecedor, incluindo frete. Políticas de 'não aceitamos devoluções' em lojas online são nulas. O reembolso deve ser integral: valor do produto + frete + qualquer encargo. O descumprimento configura prática abusiva.",
      "Em marketplaces (Mercado Livre, Amazon, Shopee), vendedor e plataforma respondem solidariamente. A responsabilidade é objetiva — independe de culpa. O consumidor pode acionar qualquer dos dois para exercer o arrependimento ou reclamar de vícios.",
      "Para serviços contratados online (cursos, assinaturas, seguros), o direito de arrependimento também se aplica. A jurisprudência de 2026 tem protegido o consumidor mesmo em infoprodutos parcialmente acessados, quando o prazo de 7 dias não foi excedido.",
    ],
  },
  {
    title: "Capítulo 6 — Juros Abusivos e Revisão Contratual",
    paragraphs: [
      "Juros que ultrapassam significativamente a média de mercado divulgada pelo Banco Central são abusivos. A ação revisional permite questionar judicialmente as taxas e obter: limitação à média de mercado, recálculo do saldo devedor e repetição em dobro dos valores pagos a mais.",
      "O rotativo do cartão de crédito é limitado por lei ao valor da dívida original (100% do principal). Cobranças acima desse teto são ilegais. No financiamento de veículos, tarifas como TAC, seguro prestamista obrigatório e taxa de avaliação são frequentemente consideradas abusivas.",
      "A capitalização de juros (juros sobre juros) só é permitida se expressamente pactuada e em periodicidade mensal. A Súmula 539 do STJ atribui ao credor o ônus de provar a pactuação regular. Contratos com cláusulas genéricas sobre capitalização são insuficientes.",
      "Durante a ação revisional, é possível obter tutela antecipada para impedir a negativação e manter a posse do bem financiado, mediante depósito judicial do valor incontroverso. Isso protege o consumidor de represálias enquanto discute a legalidade dos encargos.",
    ],
  },
  {
    title: "Capítulo 7 — Como Agir: Instrumentos de Defesa do Consumidor",
    paragraphs: [
      "O consumidor dispõe de múltiplos canais de defesa: Procon (reclamação administrativa), Consumidor.gov.br (mediação online), Reclame Aqui (pressão reputacional), Juizado Especial (causas até 40 salários mínimos sem advogado) e Justiça Comum (causas de maior valor com advogado).",
      "A documentação é essencial: guarde notas fiscais, comprovantes de pagamento, prints de anúncios, conversas com atendentes, protocolos de reclamação e qualquer comunicação com o fornecedor. A prova digital (screenshots com data/hora) é plenamente aceita pelo Judiciário.",
      "A notificação extrajudicial é o primeiro passo recomendado: ela constitui o fornecedor em mora, documenta a tentativa de solução extrajudicial e pode fundamentar pedidos de danos morais em caso de recusa. Envie por carta com AR ou e-mail com confirmação de leitura.",
      "Para causas de menor complexidade, o Juizado Especial é a via mais rápida e econômica. Não há custas processuais na primeira instância e é possível ajuizar a ação sem advogado. Para causas mais complexas ou de maior valor, a assessoria jurídica especializada garante a melhor estratégia para proteção dos seus direitos.",
    ],
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, phone, email } = await req.json();
    if (!name || !phone) {
      return new Response(JSON.stringify({ error: "Nome e telefone são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("ebook_leads").insert({
      name,
      phone,
      email: email || null,
      ebook_id: "direito-consumidor",
      ebook_title: "Guia Completo: Direitos do Consumidor",
    });

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const MARGIN = 60;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const FOOTER_Y = 40;

    const addFooter = (page: any, pageNum: number) => {
      page.drawLine({ start: { x: MARGIN, y: FOOTER_Y + 15 }, end: { x: PAGE_W - MARGIN, y: FOOTER_Y + 15 }, thickness: 0.5, color: COLORS.rule });
      page.drawText("JOÃO SANTAROZA — Assessoria Jurídica", { x: MARGIN, y: FOOTER_Y, size: 7, font: helvetica, color: COLORS.muted });
      const num = `${pageNum}`;
      const numW = helvetica.widthOfTextAtSize(num, 7);
      page.drawText(num, { x: PAGE_W - MARGIN - numW, y: FOOTER_Y, size: 7, font: helvetica, color: COLORS.muted });
    };

    // COVER PAGE
    const cover = pdfDoc.addPage([PAGE_W, PAGE_H]);
    cover.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.primary });
    cover.drawRectangle({ x: 0, y: PAGE_H - 8, width: PAGE_W, height: 8, color: COLORS.accent });
    cover.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 8, color: COLORS.accent });

    const coverTitle = "GUIA COMPLETO";
    const coverTitleW = helveticaBold.widthOfTextAtSize(coverTitle, 32);
    cover.drawText(coverTitle, { x: (PAGE_W - coverTitleW) / 2, y: PAGE_H - 200, size: 32, font: helveticaBold, color: COLORS.accent });

    const coverSub = "DIREITOS DO CONSUMIDOR";
    const coverSubW = helveticaBold.widthOfTextAtSize(coverSub, 26);
    cover.drawText(coverSub, { x: (PAGE_W - coverSubW) / 2, y: PAGE_H - 250, size: 26, font: helveticaBold, color: COLORS.white });

    cover.drawLine({ start: { x: PAGE_W / 2 - 60, y: PAGE_H - 280 }, end: { x: PAGE_W / 2 + 60, y: PAGE_H - 280 }, thickness: 2, color: COLORS.accent });

    const coverDesc = [
      "CDC, Negativação, Cobranças Indevidas,",
      "Vícios de Produto e Juros Abusivos",
    ];
    coverDesc.forEach((line, i) => {
      const w = helveticaOblique.widthOfTextAtSize(line, 13);
      cover.drawText(line, { x: (PAGE_W - w) / 2, y: PAGE_H - 320 - i * 22, size: 13, font: helveticaOblique, color: COLORS.light });
    });

    const authorLines = ["JOÃO SANTAROZA", "Assessoria Jurídica", "OAB/PR 81.381"];
    authorLines.forEach((line, i) => {
      const f = i === 0 ? helveticaBold : helvetica;
      const s = i === 0 ? 14 : 10;
      const c = i === 0 ? COLORS.accent : COLORS.light;
      const w = f.widthOfTextAtSize(line, s);
      cover.drawText(line, { x: (PAGE_W - w) / 2, y: 140 - i * 20, size: s, font: f, color: c });
    });

    // CONTENT PAGES
    let pageNum = 2;
    for (const chapter of EBOOK_CHAPTERS) {
      let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      let y = PAGE_H - MARGIN;

      // Chapter title
      const titleLines = wrapText(chapter.title, 18, CONTENT_W, helveticaBold);
      for (const tl of titleLines) {
        page.drawText(tl, { x: MARGIN, y, size: 18, font: helveticaBold, color: COLORS.primary });
        y -= 26;
      }
      page.drawLine({ start: { x: MARGIN, y: y + 6 }, end: { x: MARGIN + 80, y: y + 6 }, thickness: 2, color: COLORS.accent });
      y -= 24;

      for (const para of chapter.paragraphs) {
        const lines = wrapText(para, 10.5, CONTENT_W, helvetica);
        for (const line of lines) {
          if (y < FOOTER_Y + 40) {
            addFooter(page, pageNum++);
            page = pdfDoc.addPage([PAGE_W, PAGE_H]);
            y = PAGE_H - MARGIN;
          }
          page.drawText(line, { x: MARGIN, y, size: 10.5, font: helvetica, color: COLORS.body });
          y -= 17;
        }
        y -= 8;
      }

      addFooter(page, pageNum++);
    }

    // CTA PAGE
    const ctaPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
    ctaPage.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.primary });
    ctaPage.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: COLORS.accent });

    const ctaTitle = "PRECISA DE AJUDA?";
    const ctaTitleW = helveticaBold.widthOfTextAtSize(ctaTitle, 28);
    ctaPage.drawText(ctaTitle, { x: (PAGE_W - ctaTitleW) / 2, y: PAGE_H - 200, size: 28, font: helveticaBold, color: COLORS.accent });

    const ctaLines = [
      "Se você está enfrentando problemas como consumidor,",
      "nossa equipe está pronta para orientá-lo.",
      "",
      "WhatsApp: (44) 99996-9598",
      "joaosantarozassessoriajuridica@gmail.com",
    ];
    ctaLines.forEach((line, i) => {
      if (!line) return;
      const f = i >= 3 ? helveticaBold : helvetica;
      const c = i >= 3 ? COLORS.accent : COLORS.light;
      const s = i >= 3 ? 14 : 12;
      const w = f.widthOfTextAtSize(line, s);
      ctaPage.drawText(line, { x: (PAGE_W - w) / 2, y: PAGE_H - 260 - i * 28, size: s, font: f, color: c });
    });

    const pdfBytes = await pdfDoc.save();

    // Upload to storage
    const fileName = `ebooks/direito-consumidor-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("ebooks")
      .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      const bucketExists = await supabase.storage.getBucket("ebooks");
      if (bucketExists.error) {
        await supabase.storage.createBucket("ebooks", { public: false });
        await supabase.storage.from("ebooks").upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: true });
      } else {
        throw uploadError;
      }
    }

    const { data: signedData } = await supabase.storage
      .from("ebooks")
      .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    return new Response(
      JSON.stringify({ url: signedData?.signedUrl || "" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
