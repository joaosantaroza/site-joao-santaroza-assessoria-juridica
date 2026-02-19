import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb, grayscale } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Brand colors (HSL converted to RGB 0-1)
const COLORS = {
  primary: rgb(0.153, 0.227, 0.373),    // Navy blue
  accent: rgb(0.698, 0.533, 0.294),       // Bronze/gold
  accentLight: rgb(0.698, 0.533, 0.294),
  body: rgb(0.15, 0.15, 0.15),
  muted: rgb(0.45, 0.45, 0.45),
  light: rgb(0.75, 0.75, 0.75),
  rule: rgb(0.85, 0.85, 0.85),
  bgAccent: rgb(0.96, 0.94, 0.91),
};

/** Strip HTML tags, decode entities, detect headings/bullets */
interface ContentBlock {
  type: "heading" | "subheading" | "bullet" | "paragraph" | "blank";
  text: string;
}

function parseHtmlToBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  // Split by major block elements
  const segments = html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, "\n[[H2]]$1[[/H2]]\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, "\n[[H3]]$1[[/H3]]\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gis, "\n[[H3]]$1[[/H3]]\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gis, "\n[[LI]]$1[[/LI]]\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n");

  const lines = segments.split("\n");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      blocks.push({ type: "blank", text: "" });
      continue;
    }

    const h2Match = line.match(/\[\[H2\]\](.*?)\[\[\/H2\]\]/);
    if (h2Match) {
      blocks.push({ type: "heading", text: h2Match[1].trim() });
      continue;
    }

    const h3Match = line.match(/\[\[H3\]\](.*?)\[\[\/H3\]\]/);
    if (h3Match) {
      blocks.push({ type: "subheading", text: h3Match[1].trim() });
      continue;
    }

    const liMatch = line.match(/\[\[LI\]\](.*?)\[\[\/LI\]\]/);
    if (liMatch) {
      blocks.push({ type: "bullet", text: liMatch[1].trim() });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

/** Wrap text to fit within a given width */
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey");
    if (!authHeader && !apiKeyHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: authHeader || `Bearer ${apiKeyHeader}` } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasRole } = await supabaseAdmin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Permissão negada." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, content, excerpt, slug, articleId } = await req.json();

    if (!title || !content || !slug || !articleId) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: title, content, slug, articleId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[PDF Gen] Generating styled PDF for article: ${slug}`);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const marginLeft = 65;
    const marginRight = 65;
    const marginTop = 60;
    const marginBottom = 70;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Font sizes
    const TITLE_SIZE = 22;
    const HEADING_SIZE = 15;
    const SUBHEADING_SIZE = 12;
    const BODY_SIZE = 10.5;
    const EXCERPT_SIZE = 11;
    const FOOTER_SIZE = 7.5;
    const HEADER_SIZE = 7.5;

    // Line heights
    const BODY_LINE = 16;
    const HEADING_LINE = 20;
    const TITLE_LINE = 28;

    // Parse content into structured blocks
    const blocks = parseHtmlToBlocks(content);

    // --- Helper: draw page header & footer ---
    let currentPageNum = 0;

    function drawPageChrome(page: any, pageNum: number, isFirst: boolean) {
      // Top accent line
      page.drawRectangle({
        x: 0,
        y: pageHeight - 3,
        width: pageWidth,
        height: 3,
        color: COLORS.accent,
      });

      if (!isFirst) {
        // Header with article title (truncated)
        const headerText = title.length > 70 ? title.substring(0, 67) + "..." : title;
        page.drawText(headerText, {
          x: marginLeft,
          y: pageHeight - marginTop + 20,
          size: HEADER_SIZE,
          font: helvetica,
          color: COLORS.light,
        });
      }

      // Footer line
      page.drawLine({
        start: { x: marginLeft, y: marginBottom - 20 },
        end: { x: pageWidth - marginRight, y: marginBottom - 20 },
        thickness: 0.5,
        color: COLORS.rule,
      });

      // Page number
      const numText = `${pageNum}`;
      const numWidth = helvetica.widthOfTextAtSize(numText, FOOTER_SIZE);
      page.drawText(numText, {
        x: pageWidth / 2 - numWidth / 2,
        y: marginBottom - 34,
        size: FOOTER_SIZE,
        font: helvetica,
        color: COLORS.muted,
      });

      // Brand footer on first page
      if (isFirst) {
        const brand = "Diego Lopes Advogados Associados";
        page.drawText(brand, {
          x: marginLeft,
          y: marginBottom - 34,
          size: FOOTER_SIZE,
          font: helveticaBold,
          color: COLORS.accent,
        });
      }
    }

    function addNewPage(): any {
      currentPageNum++;
      const pg = pdfDoc.addPage([pageWidth, pageHeight]);
      drawPageChrome(pg, currentPageNum, currentPageNum === 1);
      return pg;
    }

    // --- Build pages ---
    let page = addNewPage();
    let y = pageHeight - marginTop;

    // ===== COVER / TITLE SECTION =====
    // Decorative accent bar on left
    page.drawRectangle({
      x: marginLeft - 15,
      y: y - 80,
      width: 3,
      height: 80,
      color: COLORS.accent,
    });

    // Draw title
    const titleLines = wrapText(title, TITLE_SIZE, contentWidth, timesBold);
    for (const line of titleLines) {
      page.drawText(line, {
        x: marginLeft,
        y,
        size: TITLE_SIZE,
        font: timesBold,
        color: COLORS.primary,
      });
      y -= TITLE_LINE;
    }

    y -= 8;

    // Separator
    page.drawLine({
      start: { x: marginLeft, y },
      end: { x: marginLeft + 80, y },
      thickness: 2,
      color: COLORS.accent,
    });
    y -= 20;

    // Excerpt / lead paragraph
    if (excerpt) {
      const excerptLines = wrapText(excerpt, EXCERPT_SIZE, contentWidth - 20, timesItalic);
      for (const line of excerptLines) {
        if (y < marginBottom + 40) {
          page = addNewPage();
          y = pageHeight - marginTop;
        }
        page.drawText(line, {
          x: marginLeft + 10,
          y,
          size: EXCERPT_SIZE,
          font: timesItalic,
          color: COLORS.muted,
        });
        y -= EXCERPT_SIZE + 5;
      }
      y -= 20;
    }

    // ===== BODY CONTENT =====
    let prevBlockType = "";
    let isFirstParagraph = true;

    for (const block of blocks) {
      if (block.type === "blank") {
        if (prevBlockType === "blank") continue; // collapse multiple blanks
        y -= BODY_LINE * 0.4;
        prevBlockType = "blank";
        continue;
      }

      if (block.type === "heading") {
        y -= 18; // extra space before heading
        if (y < marginBottom + 60) {
          page = addNewPage();
          y = pageHeight - marginTop;
        }

        // Accent bar before heading
        page.drawRectangle({
          x: marginLeft,
          y: y - 2,
          width: 40,
          height: 2,
          color: COLORS.accent,
        });
        y -= 10;

        const hLines = wrapText(block.text, HEADING_SIZE, contentWidth, timesBold);
        for (const line of hLines) {
          if (y < marginBottom + 40) {
            page = addNewPage();
            y = pageHeight - marginTop;
          }
          page.drawText(line, {
            x: marginLeft,
            y,
            size: HEADING_SIZE,
            font: timesBold,
            color: COLORS.primary,
          });
          y -= HEADING_LINE;
        }
        y -= 4;
        prevBlockType = "heading";
        continue;
      }

      if (block.type === "subheading") {
        y -= 12;
        if (y < marginBottom + 50) {
          page = addNewPage();
          y = pageHeight - marginTop;
        }
        const shLines = wrapText(block.text, SUBHEADING_SIZE, contentWidth, helveticaBold);
        for (const line of shLines) {
          if (y < marginBottom + 40) {
            page = addNewPage();
            y = pageHeight - marginTop;
          }
          page.drawText(line, {
            x: marginLeft,
            y,
            size: SUBHEADING_SIZE,
            font: helveticaBold,
            color: COLORS.primary,
          });
          y -= SUBHEADING_SIZE + 6;
        }
        y -= 4;
        prevBlockType = "subheading";
        continue;
      }

      if (block.type === "bullet") {
        const bulletIndent = 20;
        const bulletLines = wrapText(block.text, BODY_SIZE, contentWidth - bulletIndent - 10, timesRoman);

        for (let i = 0; i < bulletLines.length; i++) {
          if (y < marginBottom + 20) {
            page = addNewPage();
            y = pageHeight - marginTop;
          }

          if (i === 0) {
            // Draw bullet dot
            page.drawCircle({
              x: marginLeft + bulletIndent / 2,
              y: y + 3,
              size: 2,
              color: COLORS.accent,
            });
          }

          page.drawText(bulletLines[i], {
            x: marginLeft + bulletIndent,
            y,
            size: BODY_SIZE,
            font: timesRoman,
            color: COLORS.body,
          });
          y -= BODY_LINE;
        }
        y -= 2;
        prevBlockType = "bullet";
        continue;
      }

      // Paragraph
      const font = isFirstParagraph ? timesItalic : timesRoman;
      const fontSize = isFirstParagraph ? BODY_SIZE + 0.5 : BODY_SIZE;
      const pLines = wrapText(block.text, fontSize, contentWidth, font);

      for (const line of pLines) {
        if (y < marginBottom + 20) {
          page = addNewPage();
          y = pageHeight - marginTop;
        }
        page.drawText(line, {
          x: marginLeft,
          y,
          size: fontSize,
          font,
          color: isFirstParagraph ? COLORS.muted : COLORS.body,
        });
        y -= BODY_LINE;
      }
      y -= BODY_LINE * 0.3;

      if (isFirstParagraph) isFirstParagraph = false;
      prevBlockType = "paragraph";
    }

    // ===== LEGAL DISCLAIMER =====
    y -= 20;
    if (y < marginBottom + 80) {
      page = addNewPage();
      y = pageHeight - marginTop;
    }

    // Disclaimer box
    const disclaimerY = y;
    const disclaimerHeight = 50;
    page.drawRectangle({
      x: marginLeft,
      y: disclaimerY - disclaimerHeight + 10,
      width: contentWidth,
      height: disclaimerHeight,
      color: COLORS.bgAccent,
      borderColor: COLORS.rule,
      borderWidth: 0.5,
    });

    const disclaimerText = "Este conteúdo é meramente informativo e não substitui a consulta a um advogado qualificado. Para orientação jurídica personalizada, entre em contato conosco.";
    const disclaimerLines = wrapText(disclaimerText, 8, contentWidth - 24, helveticaOblique);
    let dy = disclaimerY - 6;
    for (const line of disclaimerLines) {
      page.drawText(line, {
        x: marginLeft + 12,
        y: dy,
        size: 8,
        font: helveticaOblique,
        color: COLORS.muted,
      });
      dy -= 12;
    }

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `articles/${slug}-${Date.now()}.pdf`;

    console.log(`[PDF Gen] Uploading PDF: ${fileName} (${pdfBytes.length} bytes)`);

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("blog-images")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[PDF Gen] Upload error:", uploadError);
      throw new Error(`Erro ao fazer upload do PDF: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("blog-images")
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Update blog post with PDF URL
    const { error: updateError } = await supabaseAdmin
      .from("blog_posts")
      .update({ pdf_url: pdfUrl })
      .eq("id", articleId);

    if (updateError) {
      console.error("[PDF Gen] Update error:", updateError);
    }

    console.log(`[PDF Gen] PDF generated successfully: ${pdfUrl}`);

    return new Response(
      JSON.stringify({ success: true, pdf_url: pdfUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[PDF Gen] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao gerar PDF" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
