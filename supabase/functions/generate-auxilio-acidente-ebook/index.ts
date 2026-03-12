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

// E-book chapters content
const EBOOK_CHAPTERS = [
  {
    title: "Capítulo 1 — O que é o Auxílio-Acidente?",
    paragraphs: [
      "O auxílio-acidente é um benefício previdenciário de natureza indenizatória, previsto no artigo 86 da Lei 8.213/91. Diferente de outros benefícios do INSS, ele não substitui o salário do trabalhador — ele complementa a renda como forma de compensação por uma redução permanente na capacidade de trabalho.",
      "Para ter direito ao auxílio-acidente, o segurado deve preencher três requisitos fundamentais: (1) ser segurado do INSS na qualidade de empregado, trabalhador avulso ou segurado especial; (2) ter sofrido acidente de qualquer natureza ou doença ocupacional; e (3) ter ficado com sequelas que reduzam permanentemente a capacidade para o trabalho habitual.",
      "É importante destacar que o auxílio-acidente corresponde a 50% do salário de benefício e é pago mensalmente até a aposentadoria do segurado. Trata-se de um dos poucos benefícios do INSS que pode ser acumulado com o salário do trabalho, justamente por sua natureza indenizatória.",
      "O benefício não exige incapacidade total — basta que haja uma redução da capacidade laborativa. Por exemplo, um trabalhador que sofreu uma lesão no ombro e, após a alta médica, consegue trabalhar mas com limitações, tem direito ao auxílio-acidente.",
    ],
  },
  {
    title: "Capítulo 2 — Conversão de Auxílio-Doença em Auxílio-Acidente",
    paragraphs: [
      "Uma das situações mais comuns envolve segurados que recebem auxílio-doença (B31) e, ao receberem alta do INSS, permanecem com sequelas permanentes. Nesses casos, o benefício deveria ser automaticamente convertido em auxílio-acidente (B94), mas frequentemente isso não ocorre.",
      "O procedimento correto, conforme a legislação, é o seguinte: quando a perícia médica do INSS constata que o segurado está apto a retornar ao trabalho, mas identifica sequelas que reduzem sua capacidade laborativa, deve haver a conversão automática do auxílio-doença em auxílio-acidente.",
      "Na prática, o INSS muitas vezes simplesmente cessa o auxílio-doença sem conceder o auxílio-acidente. Quando isso acontece, o segurado pode requerer administrativamente a conversão ou, caso negado, ingressar com ação judicial para garantir o benefício.",
      "Para a conversão judicial, são necessários: laudo médico particular detalhando as sequelas permanentes, documentação do auxílio-doença cessado, exames complementares que comprovem a redução da capacidade laborativa e, em muitos casos, perícia judicial.",
      "A jurisprudência dos Tribunais Regionais Federais tem sido amplamente favorável aos segurados nesses casos, reconhecendo que a cessação do auxílio-doença com sequelas permanentes gera automaticamente o direito ao auxílio-acidente.",
    ],
  },
  {
    title: "Capítulo 3 — Acumulação com Salário e Outros Benefícios",
    paragraphs: [
      "Uma das principais vantagens do auxílio-acidente é a possibilidade de acumulação com o salário. Como se trata de benefício indenizatório — e não substitutivo da renda —, o segurado continua trabalhando normalmente e recebe o auxílio como compensação pela redução da capacidade.",
      "O Superior Tribunal de Justiça (STJ) consolidou o entendimento de que o auxílio-acidente pode ser acumulado com qualquer atividade remunerada. Isso significa que o trabalhador que retorna às suas funções após o acidente ou doença ocupacional recebe tanto seu salário integral quanto o auxílio-acidente de 50% do salário de benefício.",
      "Contudo, existem vedações importantes: o auxílio-acidente não pode ser acumulado com aposentadoria. Quando o segurado se aposenta, o auxílio-acidente é cessado, mas seu valor é incorporado ao cálculo da aposentadoria como salário de contribuição.",
      "Também não é possível acumular dois auxílios-acidente. Se o segurado sofrer um novo acidente e tiver direito a um novo auxílio-acidente, será mantido o mais vantajoso financeiramente.",
      "A Reforma da Previdência (EC 103/2019) manteve as regras do auxílio-acidente para fatos geradores anteriores a 13/11/2019. Para eventos posteriores, as regras de cálculo podem diferir, sendo fundamental a análise caso a caso.",
    ],
  },
  {
    title: "Capítulo 4 — Retroativos: Como Recuperar Valores Atrasados",
    paragraphs: [
      "Muitos segurados que tinham direito ao auxílio-acidente nunca o receberam, seja por desconhecimento, seja por negativa indevida do INSS. Nesses casos, é possível pleitear judicialmente os valores retroativos, que podem representar quantias significativas.",
      "O prazo prescricional para cobrar as parcelas atrasadas é de 5 anos, contados a partir do ajuizamento da ação. Porém, o direito ao benefício em si não prescreve — apenas as parcelas mais antigas. Isso significa que o benefício pode ser concedido a qualquer momento, mas os valores retroativos se limitam aos últimos 60 meses.",
      "O Tema 862 do STJ definiu importantes parâmetros para o cálculo dos retroativos, incluindo a aplicação de correção monetária pelo INPC e juros de mora conforme o Manual de Cálculos da Justiça Federal.",
      "Em termos práticos, considere o seguinte exemplo: um segurado que deveria receber R$ 800/mês de auxílio-acidente há 5 anos teria direito a aproximadamente R$ 48.000 em valores nominais, podendo ultrapassar R$ 60.000 com a devida correção monetária e juros.",
      "Para maximizar os valores retroativos, é fundamental reunir documentação robusta: laudos médicos da época do acidente, histórico de tratamentos, documentos do auxílio-doença cessado e informes de rendimentos do período.",
    ],
  },
  {
    title: "Capítulo 5 — Doenças Ocupacionais e o Nexo Causal",
    paragraphs: [
      "As doenças ocupacionais são equiparadas a acidentes de trabalho pela legislação previdenciária (art. 20 da Lei 8.213/91). Isso significa que trabalhadores acometidos por LER/DORT, perda auditiva induzida por ruído (PAIR), problemas de coluna e outras condições relacionadas ao trabalho podem ter direito ao auxílio-acidente.",
      "O elemento central para o reconhecimento do direito é o nexo causal — ou seja, a comprovação de que a doença tem relação direta ou indireta com a atividade profissional exercida. Esse nexo pode ser estabelecido por perícia médica judicial, documentação médica ou pelo Nexo Técnico Epidemiológico Previdenciário (NTEP).",
      "Setores com maior incidência de doenças ocupacionais incluem: frigoríficos (LER/DORT por movimentos repetitivos), construção civil (lesões na coluna e membros), metalurgia (perda auditiva por exposição ao ruído), bancários (LER/DORT e transtornos mentais) e profissionais de saúde (doenças osteomusculares).",
      "Quando o INSS não reconhece o nexo causal, é possível contestar judicialmente. A perícia judicial, realizada por médico perito nomeado pelo juiz, geralmente é mais detalhada e considera o histórico completo do trabalhador, incluindo as condições do ambiente de trabalho.",
      "Importante: mesmo doenças degenerativas podem ser equiparadas a acidente de trabalho quando as condições laborais contribuíram para seu agravamento. Esse é um ponto frequentemente ignorado pelos peritos do INSS, mas amplamente reconhecido pela jurisprudência.",
    ],
  },
  {
    title: "Capítulo 6 — Perícia Médica: Como se Preparar",
    paragraphs: [
      "A perícia médica é o momento decisivo na concessão do auxílio-acidente. Seja na via administrativa (INSS) ou judicial, uma preparação adequada pode fazer a diferença entre a concessão e a negativa do benefício.",
      "Documentos essenciais para a perícia: laudos médicos detalhados com descrição das sequelas, exames complementares (ressonância, tomografia, audiometria, etc.), relatório do médico do trabalho, CAT (Comunicação de Acidente de Trabalho) se houver, e histórico completo de tratamentos realizados.",
      "Durante a perícia, é fundamental ser objetivo e honesto sobre suas limitações. Descreva detalhadamente como as sequelas afetam sua rotina de trabalho e atividades diárias. Evite minimizar ou exagerar os sintomas — ambas as atitudes podem prejudicar seu caso.",
      "Na perícia judicial, o perito nomeado pelo juiz emitirá um laudo pericial que será analisado junto com as demais provas do processo. O advogado pode formular quesitos (perguntas técnicas) ao perito, direcionando a análise para os pontos relevantes do caso.",
      "Caso o laudo pericial seja desfavorável, ainda é possível apresentar parecer técnico de assistente, impugnar o laudo ou solicitar nova perícia com outro profissional. A decisão final cabe ao juiz, que analisará o conjunto probatório.",
    ],
  },
  {
    title: "Capítulo 7 — Perguntas Frequentes",
    paragraphs: [
      "Quem tem direito ao auxílio-acidente? — Empregados com carteira assinada, trabalhadores avulsos e segurados especiais que sofreram acidente ou doença ocupacional e ficaram com sequelas permanentes que reduzem a capacidade de trabalho.",
      "Quanto tempo demora o processo judicial? — Em média, processos de auxílio-acidente tramitam entre 1 e 3 anos na Justiça Federal. Em alguns casos, é possível obter tutela de urgência (liminar) para antecipar o recebimento do benefício.",
      "Posso receber auxílio-acidente se já estou aposentado? — Não. O auxílio-acidente é cessado com a aposentadoria, mas seu valor deve ser incorporado ao cálculo do benefício de aposentadoria.",
      "O que acontece se o INSS negar meu pedido? — Você pode recorrer administrativamente à Junta de Recursos do INSS ou ingressar diretamente com ação judicial. A via judicial costuma ser mais efetiva.",
      "Preciso de advogado para pedir o auxílio-acidente? — Para o pedido administrativo, não é obrigatório. Porém, para a via judicial, especialmente em ações que envolvem retroativos significativos, a assessoria jurídica especializada é fundamental para garantir todos os seus direitos.",
      "O auxílio-acidente é vitalício? — Ele é pago até a data da aposentadoria. Não há prazo fixo de duração, pois se mantém enquanto o segurado estiver em atividade laboral e não se aposentar.",
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

    // Check if ebook already exists
    const { data: existing } = await supabaseAdmin.storage
      .from("ebooks")
      .list("auxilio-acidente", { limit: 1 });

    if (existing && existing.length > 0) {
      // Return existing file path
      const filePath = `auxilio-acidente/${existing[0].name}`;
      return new Response(
        JSON.stringify({ success: true, path: filePath, message: "E-book já existe." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Ebook Gen] Generating Auxílio-Acidente e-book PDF...");

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
        page.drawText("Guia Completo do Auxílio-Acidente", {
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
    // Full navy background
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: COLORS.primary });
    // Accent bar top
    page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: COLORS.accent });
    // Accent bar bottom
    page.drawRectangle({ x: 0, y: 80, width: W, height: 3, color: COLORS.accent });

    // Title
    let y = H - 200;
    const coverTitle = "Guia Completo do";
    const coverTitle2 = "Auxílio-Acidente";
    page.drawText(coverTitle, {
      x: ML, y, size: 28, font: timesBold, color: COLORS.white,
    });
    y -= 40;
    page.drawText(coverTitle2, {
      x: ML, y, size: 34, font: timesBold, color: COLORS.accent,
    });

    y -= 30;
    page.drawLine({ start: { x: ML, y }, end: { x: ML + 100, y }, thickness: 2, color: COLORS.accent });
    y -= 30;

    const subtitle = "Seus direitos, requisitos e como garantir o benefício do INSS";
    const subLines = wrapText(subtitle, 14, CW, timesItalic);
    for (const line of subLines) {
      page.drawText(line, { x: ML, y, size: 14, font: timesItalic, color: COLORS.white });
      y -= 22;
    }

    // Author
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

    for (let i = 0; i < EBOOK_CHAPTERS.length; i++) {
      const ch = EBOOK_CHAPTERS[i];
      page.drawText(ch.title, { x: ML + 10, y, size: 11, font: timesRoman, color: COLORS.body });
      y -= 22;
    }

    // ===== CHAPTERS =====
    for (const chapter of EBOOK_CHAPTERS) {
      page = addPage();
      y = H - MT;

      // Chapter title
      page.drawRectangle({ x: ML - 15, y: y - 30, width: 3, height: 35, color: COLORS.accent });

      const titleLines = wrapText(chapter.title, 18, CW, timesBold);
      for (const line of titleLines) {
        page.drawText(line, { x: ML, y, size: 18, font: timesBold, color: COLORS.primary });
        y -= 26;
      }

      y -= 5;
      page.drawLine({ start: { x: ML, y }, end: { x: ML + 60, y }, thickness: 2, color: COLORS.accent });
      y -= 20;

      // Paragraphs
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

    // CTA
    dy -= 20;
    page.drawText("Precisa de orientação sobre Auxílio-Acidente?", {
      x: ML, y: dy, size: 12, font: timesBold, color: COLORS.primary,
    });
    dy -= 18;
    page.drawText("Entre em contato: (44) 99996-9598 | joaosantarozassessoriajuridica@gmail.com", {
      x: ML, y: dy, size: 9, font: helvetica, color: COLORS.accent,
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `auxilio-acidente/guia-completo-auxilio-acidente.pdf`;

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
