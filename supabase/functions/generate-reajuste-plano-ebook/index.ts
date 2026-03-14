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
    title: "Capítulo 1 — Panorama do Mercado de Saúde Suplementar 2025-2026",
    paragraphs: [
      "O mercado de saúde suplementar no Brasil atravessa um período de tensão regulatória sem precedentes. Com mais de 50 milhões de beneficiários, o setor movimenta centenas de bilhões de reais por ano, mas a assimetria informacional entre operadoras e consumidores atinge níveis alarmantes.",
      "Em 2025, a ANS fixou o teto de reajuste para planos individuais e familiares em 6,06%. No entanto, planos coletivos — que representam mais de 80% do mercado — não estão sujeitos a esse limite, ficando à mercê de negociações frequentemente desequilibradas. Operadoras têm aplicado reajustes entre 15% e 45%, alegando aumento da sinistralidade e da inflação médica (VCMH).",
      "A concentração do mercado em poucas operadoras dominantes agrava o cenário. Com opções limitadas, o beneficiário se vê refém de reajustes que consomem parcela crescente da renda familiar. A migração para outro plano frequentemente implica cumprimento de novos períodos de carência, tornando a troca inviável para quem está em tratamento.",
      "Diante desse quadro, o Judiciário tem se mostrado cada vez mais receptivo a teses consumeristas que contestam reajustes abusivos, especialmente quando a operadora não comprova a razoabilidade atuarial do índice aplicado. A inversão do ônus da prova, prevista no CDC, tem sido instrumento decisivo nessas demandas.",
    ],
  },
  {
    title: "Capítulo 2 — A Tese do Falso Coletivo",
    paragraphs: [
      "A tese do falso coletivo representa uma das mais importantes inovações jurisprudenciais no direito à saúde dos últimos anos. Ela ataca frontalmente a prática de operadoras que comercializam planos coletivos por adesão através de entidades de fachada — sindicatos, associações profissionais e, especialmente, MEIs criados exclusivamente para viabilizar a contratação.",
      "O raciocínio jurídico é elegante: se o contrato é celebrado por intermédio de uma pessoa jurídica que não exerce atividade econômica real, não há coletividade genuína. O MEI aberto unicamente para contratar o plano não configura empresa; o sindicato que não representa efetivamente a categoria não confere legitimidade à adesão.",
      "Nessas hipóteses, o contrato deve ser requalificado como individual, submetendo-se integralmente à regulação da ANS — inclusive ao teto de reajuste anual. O TJSP e o TJRJ lideram a jurisprudência favorável, com decisões que determinam a aplicação retroativa do índice da ANS e a restituição dos valores pagos a maior.",
      "A prova da natureza de falso coletivo pode ser construída com: contrato social do MEI demonstrando inatividade ou atividade incompatível; declaração de faturamento zero; ausência de empregados registrados; comprovação de que o plano atende exclusivamente o titular e seus dependentes, sem qualquer vínculo profissional real com a entidade intermediária.",
      "A força da tese reside na prevalência da realidade sobre a forma. O princípio da primazia da realidade, importado do Direito do Trabalho, impede que artifícios formais (como a criação de um CNPJ) desnaturem a proteção consumerista que a lei confere ao contratante individual.",
    ],
  },
  {
    title: "Capítulo 3 — Sinistralidade e o Dever de Transparência",
    paragraphs: [
      "O reajuste por sinistralidade é o mecanismo mais utilizado por operadoras para justificar aumentos expressivos em planos coletivos. A sinistralidade mede a relação entre os custos assistenciais (consultas, exames, internações) e a receita de mensalidades. Quando esse índice ultrapassa determinado patamar, a operadora alega desequilíbrio atuarial.",
      "Contudo, a mera alegação de sinistralidade elevada não autoriza reajustes arbitrários. O CDC impõe à operadora o dever de transparência: ela deve apresentar a composição atuarial completa, discriminando o VCMH (Variação de Custos Médico-Hospitalares), a taxa de sinistralidade efetiva do grupo, a margem administrativa e o lucro.",
      "Na prática, operadoras raramente cumprem esse dever. Enviam notificações lacônicas informando o percentual de reajuste sem qualquer detalhamento. Essa omissão configura violação ao Art. 6º, III do CDC (direito à informação adequada) e autoriza a inversão do ônus da prova prevista no Art. 6º, VIII.",
      "A perícia atuarial judicial tem revelado distorções graves: inclusão de custos administrativos inflados, diluição de sinistros de grupos distintos, e aplicação de margens de segurança excessivas. Em muitos casos, o reajuste tecnicamente justificável é inferior à metade do índice aplicado pela operadora.",
      "O TJSP tem determinado, em sede de tutela de urgência, a limitação provisória do reajuste ao índice da ANS até que a operadora comprove a razoabilidade do percentual pretendido — efetivamente invertendo a dinâmica de poder na relação contratual.",
    ],
  },
  {
    title: "Capítulo 4 — Faixa Etária e o Estatuto do Idoso",
    paragraphs: [
      "O reajuste por mudança de faixa etária é uma das formas mais insidiosas de majoração do plano de saúde. A RN 63/2003 da ANS estabelece 10 faixas etárias, sendo a última a partir dos 59 anos. O reajuste da última faixa não pode ser superior a seis vezes o valor da primeira faixa.",
      "Na prática, operadoras concentram aumentos expressivos na faixa dos 54-58 anos (a penúltima faixa), burlando a proteção do Estatuto do Idoso. Essa manobra é conhecida como 'reajuste da penúltima faixa' e tem sido sistematicamente combatida nos tribunais.",
      "O Art. 15, §3º do Estatuto do Idoso (Lei 10.741/2003) veda expressamente a discriminação do idoso nos planos de saúde mediante cobranças diferenciadas em razão da idade. O Tema 952 do STJ consolidou que reajustes por faixa etária são legítimos desde que previstos contratualmente e calculados de forma razoável, sem inviabilizar a permanência do beneficiário.",
      "Quando o reajuste resulta em aumento superior a 100% da mensalidade na passagem para a faixa dos 59 anos, os tribunais têm considerado a cláusula abusiva e determinado a readequação do valor. A proteção se estende a beneficiários que completaram 60 anos durante a vigência do contrato, mesmo que este tenha sido celebrado antes do Estatuto.",
      "A estratégia processual ideal combina o pedido de nulidade da cláusula de reajuste etário com a restituição dos valores pagos a maior, acrescidos de correção monetária e juros de mora. Em casos de vulnerabilidade extrema (idoso em tratamento oncológico, por exemplo), tutelas de urgência têm sido deferidas em caráter liminar.",
    ],
  },
  {
    title: "Capítulo 5 — Proteção contra Cancelamento Unilateral",
    paragraphs: [
      "O cancelamento unilateral do plano de saúde pela operadora é uma das situações mais dramáticas enfrentadas por consumidores. Frequentemente, o cancelamento ocorre justamente quando o beneficiário mais precisa da cobertura — durante um tratamento complexo, uma internação ou uma investigação diagnóstica.",
      "O Tema 1082 do STJ representou um marco na proteção do consumidor ao estabelecer que a operadora não pode rescindir unilateralmente o contrato coletivo com menos de 30 beneficiários sem oferecer alternativa de migração para outro plano, sem cumprimento de novas carências.",
      "Além disso, a jurisprudência pacífica proíbe o cancelamento durante tratamento em curso. A Súmula 302 do STJ determina que a operadora é responsável pela cobertura mesmo após a rescisão, enquanto o beneficiário estiver internado. Por analogia, tratamentos continuados (quimioterapia, radioterapia, fisioterapia) também são protegidos.",
      "O cancelamento retaliativo — motivado pelo ajuizamento de ação judicial contra a operadora — é considerado prática abusiva gravíssima, ensejando não apenas a manutenção forçada do contrato, mas também indenização por danos morais. Os tribunais têm fixado valores entre R$ 10.000 e R$ 30.000 nessas hipóteses.",
      "A tutela de urgência para manutenção do plano pode ser obtida em 24-72 horas, com imposição de multa diária (astreintes) em caso de descumprimento. O juiz pode determinar que a operadora mantenha todos os atendimentos e autorizações durante o trâmite da ação.",
    ],
  },
  {
    title: "Capítulo 6 — Roadmap Processual: Da Notificação à Liminar",
    paragraphs: [
      "A execução vitoriosa da tese contra reajuste abusivo depende de uma estratégia processual bem estruturada, que maximize as chances de obtenção de tutela de urgência e minimize o desgaste do beneficiário.",
      "FASE 1 — DOCUMENTAÇÃO: Reunir todos os boletos e comprovantes de pagamento dos últimos 3 anos; contratos e aditivos do plano; notificações de reajuste recebidas da operadora; extratos de utilização (consultas, exames, internações); e comunicações com a administradora do benefício. Se o plano é via MEI, incluir contrato social, declarações anuais e comprovação de inatividade.",
      "FASE 2 — RECLAMAÇÃO ADMINISTRATIVA: Registrar reclamação na ANS (canais digitais), no Procon e no Consumidor.gov.br. As respostas automáticas e insatisfatórias convertem-se em prova da resistência da operadora. Simultaneamente, enviar Notificação Extrajudicial solicitando a composição atuarial completa do reajuste e a readequação ao índice da ANS.",
      "FASE 3 — AÇÃO JUDICIAL: A petição inicial deve conter pedido de Tutela de Urgência Antecipada para: (a) limitar provisoriamente o reajuste ao índice da ANS; (b) impedir o cancelamento do plano; (c) determinar a manutenção de todos os atendimentos. Os requisitos são o fumus boni iuris (demonstração da abusividade) e o periculum in mora (risco de perda da cobertura ou comprometimento da renda).",
      "FASE 4 — PERÍCIA E SENTENÇA: Requerimento de perícia atuarial para apuração do reajuste tecnicamente justificável. O perito analisará a composição de custos da operadora, a sinistralidade real do grupo e a razoabilidade do índice aplicado. A sentença pode determinar a aplicação retroativa do índice correto e a restituição dos valores pagos a maior.",
      "O prazo médio para obtenção de tutela de urgência é de 5 a 15 dias. Ações em juizados especiais (causa até 40 salários mínimos) tendem a ser mais céleres. A gratuidade de justiça pode ser requerida quando o reajuste compromete parcela significativa da renda.",
    ],
  },
  {
    title: "Capítulo 7 — Restituição Retroativa e Cálculo de Valores",
    paragraphs: [
      "A restituição retroativa é um dos aspectos mais relevantes da ação contra reajuste abusivo. Quando o Judiciário reconhece que o índice aplicado foi superior ao legalmente admitido, o beneficiário tem direito à devolução de todas as diferenças pagas nos últimos 3 anos.",
      "O cálculo é simples em sua lógica: subtrai-se do valor efetivamente pago aquele que seria devido caso o reajuste legítimo (índice ANS) tivesse sido aplicado. A diferença mensal é corrigida monetariamente e acrescida de juros de mora de 1% ao mês desde cada desembolso.",
      "Exemplo prático: se a mensalidade era de R$ 800 e a operadora aplicou reajuste de 25% (elevando para R$ 1.000), quando o índice da ANS era de 6,06% (mensalidade correta de R$ 848,48), a diferença mensal é de R$ 151,52. Em 36 meses, o valor principal atinge R$ 5.454,72, podendo ultrapassar R$ 7.000 com correção e juros.",
      "Para planos familiares com múltiplos beneficiários, os valores se multiplicam proporcionalmente. Famílias com 3-4 dependentes podem ter restituições superiores a R$ 20.000, tornando a ação economicamente vantajosa mesmo considerando os custos advocatícios.",
      "Além da restituição, o juiz pode determinar a readequação prospectiva da mensalidade, aplicando o índice correto para os reajustes futuros. Isso garante não apenas a reparação do dano passado, mas a prevenção de novos abusos.",
      "Em casos de conduta particularmente gravosa da operadora (cancelamento retaliativo, negativa de cobertura, desídia no atendimento), cabe pedido de danos morais, com precedentes variando entre R$ 5.000 e R$ 30.000 conforme a gravidade e as circunstâncias do caso.",
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
      .list("reajuste-plano-saude", { limit: 1 });

    if (existing && existing.length > 0) {
      const filePath = `reajuste-plano-saude/${existing[0].name}`;
      return new Response(
        JSON.stringify({ success: true, path: filePath, message: "E-book já existe." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[Ebook Gen] Generating Reajuste Plano de Saúde e-book PDF...");

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
        page.drawText("Guia: Reajuste Abusivo em Planos de Saúde", {
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
    page.drawText("Reajuste Abusivo em", {
      x: ML, y, size: 30, font: timesBold, color: COLORS.accent,
    });
    y -= 36;
    page.drawText("Planos de Saúde", {
      x: ML, y, size: 30, font: timesBold, color: COLORS.accent,
    });

    y -= 30;
    page.drawLine({ start: { x: ML, y }, end: { x: ML + 100, y }, thickness: 2, color: COLORS.accent });
    y -= 30;

    const subtitle = "Identifique reajustes ilegais, conheça a tese do falso coletivo e saiba como recuperar valores pagos a mais";
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
    page.drawText("Precisa de orientação sobre Planos de Saúde?", {
      x: ML, y: dy, size: 12, font: timesBold, color: COLORS.primary,
    });
    dy -= 18;
    page.drawText("Entre em contato: (44) 99996-9598 | joaosantarozassessoriajuridica@gmail.com", {
      x: ML, y: dy, size: 9, font: helvetica, color: COLORS.accent,
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `reajuste-plano-saude/guia-reajuste-plano-saude.pdf`;

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
