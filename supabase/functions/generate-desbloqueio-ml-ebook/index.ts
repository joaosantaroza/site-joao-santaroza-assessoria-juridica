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
    title: "Capítulo 1 — O Cenário 2025-2026: A Crise da Moderação Algorítmica",
    paragraphs: [
      "O ecossistema de comércio eletrônico na América Latina, capitaneado pelo Mercado Livre e sua infraestrutura financeira adjacente, o Mercado Pago, atingiu um nível de capilaridade que redefiniu a dinâmica do varejo digital. A partir do biênio 2025-2026, observou-se uma mudança drástica nas diretrizes de compliance, caracterizada por um endurecimento severo e frequentemente desproporcional das regras de moderação.",
      "Para lidar com o volume massivo de transações, o Mercado Livre intensificou a delegação de seu poder de moderação a sistemas de inteligência artificial, promovendo a chamada moderação automatizada de alta frequência. Os algoritmos, antes restritos a comportamentos flagrantemente ilícitos, passaram a varrer o banco de dados em busca de desvios estatísticos mínimos.",
      "Como resultado direto dessa política algorítmica agressiva, suspensões sumárias passaram a ocorrer em escala industrial, atingindo majoritariamente lojistas legítimos com anos de histórico positivo e faturamentos substanciais. A plataforma frequentemente invoca violações genéricas dos Termos de Uso, omitindo o motivo específico e qualquer detalhamento que permita ao usuário compreender a infração supostamente cometida.",
      "O sistema avalia variáveis como discrepâncias cadastrais, aumento repentino na curva de vendas, flutuações nas taxas de cancelamento e o cruzamento de impressões digitais de dispositivos e endereços IP. Se detectar que um lojista acessou sua conta a partir de uma rede utilizada por um usuário banido, pode estabelecer um vínculo artificial e suspender o vendedor legítimo.",
    ],
  },
  {
    title: "Capítulo 2 — O Impacto do Bloqueio: Da Vitrine ao Saldo Retido",
    paragraphs: [
      "O bloqueio de uma conta no Mercado Livre desencadeia uma reação em cadeia de proporções catastróficas para o empreendedor digital. Imediatamente, a vitrine digital é apagada, os anúncios são pausados e novas vendas se tornam impossíveis.",
      "Paralelamente, a plataforma impede o vendedor de interagir com clientes que já realizaram compras, impossibilitando respostas a perguntas e envio de mensagens. Isso leva à abertura de reclamações e à degradação da reputação logística do lojista.",
      "A culminância do desespero empresarial reside no congelamento absoluto dos saldos no Mercado Pago. A retenção indiscriminada do capital de giro impede o lojista de honrar compromissos inadiáveis: pagamento de fornecedores, quitação de tributos, aluguel de galpões e pagamento da folha salarial, empurrando uma operação saudável para a beira da insolvência.",
      "O lojista inicia uma peregrinação por chatbots e chamados que resulta em respostas engessadas: textos padronizados informando que a suspensão é irreversível e que os valores permanecerão congelados por até 180 dias. O sentimento de impotência se consolida quando o empresário percebe que anos de esforço foram invalidados por um algoritmo, sem observância do devido processo legal.",
    ],
  },
  {
    title: "Capítulo 3 — Seus Direitos: A Fundamentação Jurídica Completa",
    paragraphs: [
      "A tese jurídica para o desbloqueio exige a intersecção de princípios do Direito Constitucional, a tutela protetiva do Direito do Consumidor, os ditames do Marco Civil da Internet e os mecanismos reparatórios do Direito Civil e Empresarial.",
      "EFICÁCIA HORIZONTAL DOS DIREITOS FUNDAMENTAIS: As megaplataformas exercem prerrogativas análogas ao poder de polícia estatal. Ao banir um lojista sem ofertar o devido processo legal, a plataforma violenta as garantias do Art. 5º, incisos LIV e LV da Constituição Federal — direito ao contraditório e à ampla defesa. Os Termos de Uso (contratos de adesão) não possuem aptidão jurídica para revogar prerrogativas constitucionais.",
      "MARCO CIVIL DA INTERNET (Lei 12.965/2014): O Art. 7º eleva à categoria de direito do usuário a clareza das informações sobre políticas de uso e a motivação expressa para qualquer suspensão de serviços. Suspender o acesso sob justificativa genérica de 'comportamento irregular' incide em afronta ao princípio da transparência.",
      "CÓDIGO DE DEFESA DO CONSUMIDOR: A jurisprudência reconhece a incidência do CDC na relação entre plataforma e lojista, com base na vulnerabilidade tríplice: técnica (critérios opacos do algoritmo), informacional (ausência de dados sobre o motivo) e econômica (dependência financeira do saldo retido). Invoca-se o Art. 6º (práticas abusivas), Art. 39 (recusa injustificada de serviço) e Art. 14 (responsabilidade objetiva).",
      "RETENÇÃO DE VALORES: A retenção genérica do saldo por até 180 dias, sem ordem judicial ou comprovação de fraude, configura enriquecimento sem causa (Art. 884 do Código Civil) e prática abusiva. O Mercado Pago rentabiliza o capital alheio em suas próprias aplicações financeiras. Cláusulas que permitem esta retenção são fulminadas de nulidade pelo CDC.",
    ],
  },
  {
    title: "Capítulo 4 — Documentação Preventiva: Proteja-se Antes do Bloqueio",
    paragraphs: [
      "O ambiente hostil de 2026 exige que a organização documental seja encarada como medida de sobrevivência. Quando uma conta é suspensa, a plataforma frequentemente revoga o acesso ao painel de controle, impedindo a extração de relatórios e o download de notas fiscais.",
      "O lojista deve instituir uma rotina diária de backup que inclui: extratos detalhados do Mercado Pago demonstrando a liquidez diária; capturas de tela certificando a reputação da conta (termômetro verde); relatórios de desempenho e médias históricas de vendas; notas fiscais de todas as operações comercializadas.",
      "Também é essencial registrar integralmente qualquer comunicação advinda da plataforma, incluindo notificações, alertas e respostas de SAC. Comprovantes de postagem com códigos de rastreamento devem ser arquivados sistematicamente.",
      "Essa disciplina preventiva fornece o estofo probatório para as futuras medidas judiciais. Para contestar a arbitrariedade da suspensão e reivindicar indenizações, é preciso comprovar o padrão de faturamento, a regularidade fiscal e o histórico de excelência, evidências que fragilizam as alegações genéricas de 'risco' dos algoritmos.",
    ],
  },
  {
    title: "Capítulo 5 — Do Esgotamento Extrajudicial à Tutela de Urgência",
    paragraphs: [
      "A execução vitoriosa da tese depende de uma coreografia procedimental exata. Em 2026, magistrados manifestam crescente ceticismo em relação à judicialização de conflitos sem tentativa prévia de composição administrativa.",
      "FASE 1 — ESGOTAMENTO EXTRAJUDICIAL: Registrar reclamações no Consumidor.gov.br (sistema público da Senacon com prazos estritos de resposta), no Reclame Aqui e nos canais internos de SAC e ouvidoria. As respostas automáticas e lacônicas convertem-se em provas fulminantes de negligência.",
      "FASE 2 — NOTIFICAÇÃO EXTRAJUDICIAL: O escritório elabora e envia notificação aos departamentos jurídicos do Mercado Livre e Mercado Pago. Estrategicamente, sinaliza a iminência de ofensiva judicial qualificada e pode resultar em desbloqueio sem litígio. Processualmente, exige em prazo de 48-72 horas a apresentação das provas da suposta fraude. A expiração sem resolução formaliza a pretensão resistida.",
      "FASE 3 — AÇÃO JUDICIAL COM LIMINAR: A peça inaugural deve ter como cerne a Tutela de Urgência Antecipada (Liminar), requerendo inaudita altera parte: o restabelecimento do acesso à conta e o desbloqueio integral dos valores retidos. Os requisitos são o fumus boni iuris (histórico íntegro, notas fiscais, violação do dever de defesa) e o periculum in mora (risco de derrocada financeira iminente).",
      "O Judiciário tem se mostrado célere, proferindo despachos em 24 a 72 horas que ordenam o restabelecimento das operações e o desbloqueio dos fundos, sob imposição de multas diárias (astreintes) em caso de descumprimento.",
    ],
  },
  {
    title: "Capítulo 6 — Lucros Cessantes e Danos Morais: Como Calcular a Indenização",
    paragraphs: [
      "Os lucros cessantes representam a frustração da expectativa de ganho durante o período de bloqueio indevido. A apuração exige rigor técnico, tornando imperativa a perícia contábil. O perito analisará a série temporal de vendas, taxas de conversão, sazonalidade e subtrairá custos operacionais e tributos.",
      "Exemplo prático: se a loja faturava R$ 5.000/dia com margem de lucro líquido de 20%, cada dia de bloqueio resultou em R$ 1.000 de dano direto, além de custos perdidos com campanhas publicitárias e estrutura logística ociosa. A robustez técnica do parecer contábil evita o indeferimento por carência de provas.",
      "Quanto aos danos morais, a jurisprudência tem superado a tese do 'mero aborrecimento contratual'. O bloqueio indevido inflige sério abalo à imagem profissional, frustração, constrangimento perante fornecedores e sensação avassaladora de impotência. O TJSP tem fixado indenizações entre R$ 15.000 e R$ 25.000.",
      "Para maximizar as chances de êxito, a ação deve ser instruída com: relatórios de faturamento dos últimos 12 meses; extratos do Mercado Pago; prints do painel de vendas; notas fiscais de mercadorias; comprovantes de gastos com publicidade; e documentação de compromissos financeiros inadiáveis.",
    ],
  },
  {
    title: "Capítulo 7 — Perguntas Frequentes",
    paragraphs: [
      "O Mercado Livre pode suspender minha conta sem avisar? — Embora os Termos de Uso prevejam essa possibilidade, a Constituição e o Marco Civil da Internet exigem transparência, motivação expressa e oportunidade de defesa antes de medidas punitivas. Cláusulas que atribuem poder absoluto são nulas.",
      "A retenção do saldo por 180 dias é legal? — Sem reclamações abertas, litígios pendentes ou ordem judicial, a retenção genérica é questionável e pode ser revertida judicialmente. Os tribunais têm determinado a liberação imediata dos valores.",
      "Quanto tempo leva para obter a liminar? — Tutelas de urgência podem ser deferidas em 24 a 72 horas, determinando o restabelecimento imediato das operações e a liberação dos fundos retidos.",
      "Posso criar outra conta enquanto a minha está suspensa? — Criar contas alternativas pode agravar a situação, pois a plataforma detecta vínculos por IP e dados de dispositivo. A via recomendada é o desbloqueio da conta original.",
      "Preciso de advogado? — Para a notificação extrajudicial e a ação judicial, a assessoria jurídica especializada é fundamental. O advogado que domina o direito digital e as nuances do e-commerce consegue estruturar teses mais robustas e maximizar as chances de êxito.",
      "Posso cobrar indenização mesmo se já recuperei a conta? — Sim. Os lucros cessantes referem-se ao período de inatividade forçada. Os danos morais também permanecem mesmo após o restabelecimento do acesso.",
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
      .list("desbloqueio-mercado-livre", { limit: 1 });

    if (existing && existing.length > 0) {
      const filePath = `desbloqueio-mercado-livre/${existing[0].name}`;
      return new Response(
        JSON.stringify({ success: true, path: filePath, message: "E-book já existe." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Ebook Gen] Generating Desbloqueio ML e-book PDF...");

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
        page.drawText("Guia: Desbloqueio de Contas no Mercado Livre", {
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
    page.drawText("Desbloqueio de Contas", {
      x: ML, y, size: 30, font: timesBold, color: COLORS.accent,
    });
    y -= 36;
    page.drawText("no Mercado Livre", {
      x: ML, y, size: 30, font: timesBold, color: COLORS.accent,
    });

    y -= 30;
    page.drawLine({ start: { x: ML, y }, end: { x: ML + 100, y }, thickness: 2, color: COLORS.accent });
    y -= 30;

    const subtitle = "Seus direitos contra suspensões algorítmicas, retenção de saldo e como buscar indenização";
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
    page.drawText("Precisa de orientação sobre Desbloqueio de Contas?", {
      x: ML, y: dy, size: 12, font: timesBold, color: COLORS.primary,
    });
    dy -= 18;
    page.drawText("Entre em contato: (44) 99996-9598 | joaosantarozassessoriajuridica@gmail.com", {
      x: ML, y: dy, size: 9, font: helvetica, color: COLORS.accent,
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `desbloqueio-mercado-livre/guia-desbloqueio-mercado-livre.pdf`;

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
