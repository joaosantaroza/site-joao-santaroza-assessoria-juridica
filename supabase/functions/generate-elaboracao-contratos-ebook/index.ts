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
    title: "Capítulo 1 — Por Que a Elaboração Contratual Profissional é Indispensável",
    paragraphs: [
      "Em 2026, mais de 60% dos litígios empresariais no Brasil têm origem em contratos mal redigidos, ambíguos ou simplesmente inexistentes. A informalidade contratual — arraigada na cultura de negócios brasileira — é a principal causa de disputas que poderiam ser facilmente evitadas com instrumentos bem elaborados.",
      "O contrato é muito mais do que um documento burocrático: é a tradução da vontade das partes em obrigações juridicamente exigíveis. Quando bem elaborado, ele antecipa cenários de conflito, distribui riscos de forma equilibrada e estabelece mecanismos eficientes de resolução de disputas.",
      "Um contrato mal redigido, por outro lado, é uma bomba-relógio. Cláusulas ambíguas são interpretadas contra quem as redigiu (Art. 423 do Código Civil). Omissões sobre prazos, penalidades e responsabilidades deixam lacunas que serão preenchidas pelo Judiciário — frequentemente de forma desfavorável ao empresário que não se protegeu adequadamente.",
      "O custo de um contrato profissional é infinitamente menor do que o custo de um litígio. Honorários advocatícios, custas processuais, tempo de gestão dedicado ao processo e, principalmente, o desgaste da relação comercial tornam a prevenção contratual o investimento mais inteligente que um empresário pode fazer.",
    ],
  },
  {
    title: "Capítulo 2 — Elementos Essenciais de um Contrato Sólido",
    paragraphs: [
      "Todo contrato empresarial deve conter elementos estruturais que garantam sua validade, eficácia e exequibilidade. A ausência de qualquer desses elementos pode comprometer a proteção que o instrumento deveria oferecer.",
      "A qualificação completa das partes — com CNPJ, endereço, representantes legais e comprovação de poderes de assinatura — é o primeiro requisito. Contratos assinados por pessoas sem poderes de representação podem ser declarados nulos.",
      "O objeto do contrato deve ser descrito com precisão cirúrgica: o que será entregue, em que condições, com quais critérios de aceitação e, igualmente importante, o que está fora do escopo. A ausência de exclusões claras é a principal fonte de disputas sobre 'trabalho adicional'.",
      "Preço, forma e prazo de pagamento devem ser detalhados incluindo indexadores de reajuste, consequências da inadimplência (juros moratórios e multa) e condições para retenção de pagamento em caso de descumprimento parcial.",
      "A cláusula de vigência deve prever condições para renovação automática ou necessidade de aditivo, bem como o prazo de aviso prévio para não-renovação. Contratos por prazo indeterminado exigem atenção especial às condições de denúncia.",
      "Limitação de responsabilidade, foro de eleição e mecanismo de resolução de disputas completam os elementos essenciais. A escolha entre mediação, arbitragem ou jurisdição estatal depende do valor envolvido, da complexidade da matéria e da relação entre as partes.",
    ],
  },
  {
    title: "Capítulo 3 — Blindagem Contratual: Proteções Avançadas",
    paragraphs: [
      "A blindagem contratual vai além da redação básica: ela reestrutura o contrato com cláusulas protetivas que antecipam cenários de conflito e criam mecanismos de defesa preventiva.",
      "A cláusula de confidencialidade (NDA) protege informações sensíveis compartilhadas durante a prestação. Deve definir com precisão o que é confidencial, o prazo de sigilo (geralmente 2 a 5 anos após o término do contrato) e as penalidades por violação, incluindo multa e possibilidade de indenização por perdas e danos.",
      "A cláusula de não-concorrência impede que uma parte exerça atividade concorrente durante e após o término do contrato. Para ser válida judicialmente, deve ter limitação temporal razoável (2 a 5 anos), escopo geográfico definido e, preferencialmente, compensação financeira correspondente ao período de restrição.",
      "Cláusulas de propriedade intelectual são críticas em contratos de desenvolvimento de software, design, conteúdo e consultoria. Sem definição expressa, a titularidade dos trabalhos derivados pode ser disputada judicialmente por anos.",
      "A cláusula de force majeure deve definir expressamente os eventos cobertos (pandemia, guerra, catástrofe natural, ato governamental), o procedimento de notificação e as consequências — suspensão temporária ou rescisão sem penalidades.",
      "A cláusula de hardship, menos conhecida mas igualmente importante, permite a revisão do contrato quando circunstâncias supervenientes alteram substancialmente o equilíbrio econômico original, sem configurar impossibilidade absoluta de cumprimento.",
    ],
  },
  {
    title: "Capítulo 4 — Acordos Societários e Vesting",
    paragraphs: [
      "Mais de 70% das sociedades empresariais no Brasil não possuem Acordo de Sócios. Quando divergências surgem — e elas inevitavelmente surgem —, a ausência desse instrumento transforma desacordos comerciais em batalhas judiciais que podem destruir a empresa.",
      "O Acordo de Sócios regula questões que o Contrato Social não aborda: direito de preferência na venda de cotas, cláusulas de tag along e drag along, vesting de participação, não-concorrência entre sócios, política de distribuição de lucros e mecanismos de resolução de impasses societários (deadlock).",
      "O vesting é um mecanismo pelo qual o sócio adquire sua participação gradualmente ao longo do tempo — geralmente 4 anos com cliff de 1 ano. Se o sócio sair antes do período completo, retém apenas a parcela já adquirida (vested). Isso protege a empresa contra sócios que abandonam o projeto prematuramente levando consigo participação desproporcional à sua contribuição.",
      "As cláusulas de tag along e drag along regulam cenários de venda de participação. O tag along protege o sócio minoritário, garantindo-lhe o direito de vender sua participação nas mesmas condições oferecidas ao majoritário. O drag along permite que o majoritário 'arraste' o minoritário em uma venda total, viabilizando operações de M&A.",
      "A cláusula de deadlock é o mecanismo mais sofisticado do Acordo de Sócios. Quando os sócios chegam a um impasse decisório insuperável, mecanismos como Russian Roulette (um sócio faz oferta que o outro deve aceitar ou comprar nas mesmas condições) ou Texas Shoot-Out (leilão secreto) resolvem a situação de forma objetiva.",
    ],
  },
  {
    title: "Capítulo 5 — Adequação à LGPD nos Contratos",
    paragraphs: [
      "A Lei Geral de Proteção de Dados (Lei 13.709/2018) transformou radicalmente as obrigações contratuais de empresas que tratam dados pessoais. Em 2026, a ANPD intensificou a fiscalização, e a ausência de cláusulas de proteção de dados nos contratos é considerada infração autônoma.",
      "Todo contrato que envolva tratamento de dados pessoais deve definir claramente os papéis das partes: quem é o controlador (decide sobre o tratamento) e quem é o operador (executa o tratamento conforme instruções do controlador). Essa distinção determina o regime de responsabilidade aplicável.",
      "O Data Processing Agreement (DPA) é o instrumento contratual específico para regular a relação entre controlador e operador. Deve conter: finalidade específica do tratamento, base legal aplicável, categorias de dados tratados, medidas técnicas e organizacionais de segurança, política de retenção e eliminação, e procedimentos para incidentes de segurança.",
      "As sanções da LGPD podem alcançar 2% do faturamento da empresa, limitadas a R$ 50 milhões por infração. Além das sanções administrativas, a empresa pode responder civilmente por danos materiais e morais causados aos titulares dos dados — e a jurisprudência tem sido cada vez mais severa nessas condenações.",
      "Contratos que exigem adequação imediata incluem: fornecedores de TI e cloud computing, agências de marketing e CRM, escritórios de contabilidade e RH terceirizado, prestadores de serviços com acesso a bases de clientes, e operadoras de planos de saúde.",
    ],
  },
  {
    title: "Capítulo 6 — Rescisão, Distrato e Resolução de Disputas",
    paragraphs: [
      "A rescisão contratual é um dos momentos mais delicados nas relações comerciais. Saber quando e como rescindir — e quais são os limites das penalidades — pode significar a diferença entre um término organizado e um litígio custoso que se arrasta por anos.",
      "O distrato é a extinção do contrato por mútuo acordo das partes. Exige a mesma forma do contrato original e deve prever: quitação mútua e recíproca, definição de responsabilidades residuais, tratamento de trabalhos em andamento, cláusula de confidencialidade pós-contratual e renúncia expressa a reclamações futuras.",
      "A rescisão unilateral sem multa é possível quando há descumprimento contratual pela outra parte (Art. 475 do CC), onerosidade excessiva por evento extraordinário (Art. 478 do CC), ou caso fortuito/força maior (Art. 393 do CC). A notificação extrajudicial prévia é essencial para constituir a outra parte em mora.",
      "A cláusula penal (multa contratual) não pode exceder o valor da obrigação principal (Art. 412 do CC). O juiz pode reduzi-la quando for manifestamente excessiva ou quando a obrigação tiver sido parcialmente cumprida. Multas superiores a 10% do valor do contrato frequentemente são questionadas judicialmente.",
      "A escolha do mecanismo de resolução de disputas impacta diretamente o tempo e o custo de eventuais conflitos. A mediação é ideal para preservar relações comerciais. A arbitragem oferece celeridade e especialização técnica para disputas complexas. A jurisdição estatal é indicada quando há necessidade de medidas urgentes (tutela de urgência) ou quando o valor não justifica os custos arbitrais.",
    ],
  },
  {
    title: "Capítulo 7 — Checklist: Contratos que Toda Empresa Deve Ter",
    paragraphs: [
      "Independentemente do porte ou segmento, toda empresa deve manter um portfólio mínimo de contratos que proteja suas operações, seus colaboradores e seus ativos. A ausência de qualquer desses instrumentos representa uma vulnerabilidade jurídica que pode ser explorada em momentos de conflito.",
      "Contrato Social e Acordo de Sócios: o primeiro é obrigatório para a constituição da empresa; o segundo é o instrumento que realmente protege os sócios. Juntos, formam a base da governança corporativa.",
      "Contratos de Prestação de Serviços: para cada fornecedor ou cliente relevante, um contrato específico que defina escopo, prazos, remuneração e responsabilidades. Modelos genéricos da internet são insuficientes.",
      "Contratos de Trabalho e NDAs: além do contrato de trabalho padrão, funcionários com acesso a informações sensíveis devem assinar termos de confidencialidade específicos. Cláusulas de não-concorrência e não-solicitação complementam a proteção.",
      "Termos de Uso e Política de Privacidade: obrigatórios para empresas com presença digital. Devem ser redigidos de forma clara, acessível e em conformidade com a LGPD, o CDC e o Marco Civil da Internet.",
      "Contratos com Parceiros e Representantes Comerciais: definem território, exclusividade, metas, comissionamento e condições de rescisão. A Lei do Representante Comercial (Lei 4.886/65) prevê indenização mínima de 1/12 do total de comissões recebidas em caso de rescisão sem justa causa — cláusula contratual em contrário é nula.",
      "A revisão periódica desses contratos (pelo menos anualmente) garante que eles acompanhem a evolução do negócio, as mudanças legislativas e as novas práticas de mercado. Contratos desatualizados podem ser tão perigosos quanto a ausência de contratos.",
    ],
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existing } = await supabaseAdmin.storage
      .from("ebooks")
      .list("elaboracao-contratos", { limit: 1 });

    if (existing && existing.length > 0) {
      const filePath = `elaboracao-contratos/${existing[0].name}`;
      return new Response(
        JSON.stringify({ success: true, path: filePath, message: "E-book já existe." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Ebook Gen] Generating Elaboração de Contratos e-book PDF...");

    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const W = 595.28;
    const H = 841.89;
    const ML = 65;
    const MR = 65;
    const MT = 60;
    const MB = 70;
    const CW = W - ML - MR;

    let pageNum = 0;

    function drawChrome(page: any, num: number, isFirst: boolean) {
      page.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: COLORS.accent });
      if (!isFirst) {
        page.drawText("Guia: Elaboração de Contratos Empresariais", {
          x: ML, y: H - MT + 20, size: 7.5, font: helvetica, color: COLORS.light,
        });
      }
      page.drawLine({
        start: { x: ML, y: MB - 20 }, end: { x: W - MR, y: MB - 20 },
        thickness: 0.5, color: COLORS.rule,
      });
      const numText = `${num}`;
      const numWidth = helvetica.widthOfTextAtSize(numText, 7.5);
      page.drawText(numText, {
        x: W / 2 - numWidth / 2, y: MB - 34, size: 7.5, font: helvetica, color: COLORS.muted,
      });
    }

    function addPage() {
      pageNum++;
      const pg = pdfDoc.addPage([W, H]);
      drawChrome(pg, pageNum, pageNum === 1);
      return pg;
    }

    // ===== COVER PAGE =====
    let page = addPage();
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: COLORS.primary });
    page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: COLORS.accent });
    page.drawRectangle({ x: 0, y: 80, width: W, height: 3, color: COLORS.accent });

    let y = H - 200;
    page.drawText("Guia Completo:", {
      x: ML, y, size: 28, font: timesBold, color: COLORS.white,
    });
    y -= 40;
    page.drawText("Elaboração de", {
      x: ML, y, size: 30, font: timesBold, color: COLORS.accent,
    });
    y -= 36;
    page.drawText("Contratos", {
      x: ML, y, size: 30, font: timesBold, color: COLORS.accent,
    });

    y -= 30;
    page.drawLine({ start: { x: ML, y }, end: { x: ML + 100, y }, thickness: 2, color: COLORS.accent });
    y -= 30;

    const subtitle = "Proteja seu negócio com contratos blindados: cláusulas essenciais, LGPD, acordos societários e estratégias de resolução de disputas";
    const subLines = wrapText(subtitle, 14, CW, timesItalic);
    for (const line of subLines) {
      page.drawText(line, { x: ML, y, size: 14, font: timesItalic, color: COLORS.white });
      y -= 22;
    }

    page.drawText("João Santaroza — Assessoria Jurídica", {
      x: ML, y: 110, size: 11, font: helveticaBold, color: COLORS.accent,
    });
    page.drawText("OAB/PR 81.381", {
      x: ML, y: 95, size: 9, font: helvetica, color: COLORS.light,
    });

    // ===== TABLE OF CONTENTS =====
    page = addPage();
    y = H - MT;
    page.drawText("Sumário", { x: ML, y, size: 22, font: timesBold, color: COLORS.primary });
    y -= 10;
    page.drawLine({ start: { x: ML, y }, end: { x: ML + 60, y }, thickness: 2, color: COLORS.accent });
    y -= 30;

    for (const ch of EBOOK_CHAPTERS) {
      page.drawText(ch.title, { x: ML + 10, y, size: 11, font: timesRoman, color: COLORS.body });
      y -= 22;
    }

    // ===== CHAPTERS =====
    for (const chapter of EBOOK_CHAPTERS) {
      page = addPage();
      y = H - MT;

      page.drawRectangle({ x: ML - 15, y: y - 30, width: 3, height: 35, color: COLORS.accent });

      const titleLines = wrapText(chapter.title, 18, CW, timesBold);
      for (const line of titleLines) {
        page.drawText(line, { x: ML, y, size: 18, font: timesBold, color: COLORS.primary });
        y -= 26;
      }

      y -= 5;
      page.drawLine({ start: { x: ML, y }, end: { x: ML + 60, y }, thickness: 2, color: COLORS.accent });
      y -= 20;

      for (const para of chapter.paragraphs) {
        const lines = wrapText(para, 10.5, CW, timesRoman);
        for (const line of lines) {
          if (y < MB + 20) {
            page = addPage();
            y = H - MT;
          }
          page.drawText(line, { x: ML, y, size: 10.5, font: timesRoman, color: COLORS.body });
          y -= 16;
        }
        y -= 8;
      }
    }

    // ===== DISCLAIMER PAGE =====
    if (y < MB + 100) {
      page = addPage();
      y = H - MT;
    }
    y -= 20;
    const disclaimerH = 60;
    page.drawRectangle({
      x: ML, y: y - disclaimerH + 10, width: CW, height: disclaimerH,
      color: COLORS.bgAccent, borderColor: COLORS.rule, borderWidth: 0.5,
    });

    const disclaimer = "Este material é meramente informativo e não constitui aconselhamento jurídico. Cada caso possui particularidades que devem ser analisadas individualmente por um advogado qualificado. Conforme Provimento 205/2021 da OAB.";
    const dLines = wrapText(disclaimer, 8, CW - 24, helveticaOblique);
    let dy = y - 6;
    for (const line of dLines) {
      page.drawText(line, { x: ML + 12, y: dy, size: 8, font: helveticaOblique, color: COLORS.muted });
      dy -= 12;
    }

    dy -= 20;
    page.drawText("Precisa de orientação sobre Contratos?", {
      x: ML, y: dy, size: 12, font: timesBold, color: COLORS.primary,
    });
    dy -= 18;
    page.drawText("Entre em contato: (44) 99996-9598 | joaosantarozassessoriajuridica@gmail.com", {
      x: ML, y: dy, size: 9, font: helvetica, color: COLORS.accent,
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `elaboracao-contratos/guia-elaboracao-contratos.pdf`;

    console.log(`[Ebook Gen] Uploading: ${fileName} (${pdfBytes.length} bytes)`);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("ebooks")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[Ebook Gen] Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log("[Ebook Gen] E-book generated and uploaded successfully!");

    return new Response(
      JSON.stringify({ success: true, path: fileName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Ebook Gen] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao gerar e-book" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
