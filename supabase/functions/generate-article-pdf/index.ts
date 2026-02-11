import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Strip HTML tags and decode common entities */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "  • ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Wrap text to fit within a given width */
function wrapText(
  text: string,
  font: ReturnType<typeof StandardFonts>,
  fontSize: number,
  maxWidth: number,
  fontObj: any
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const para of paragraphs) {
    if (para.trim() === "") {
      lines.push("");
      continue;
    }
    const words = para.split(/\s+/);
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
  }

  return lines;
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

    console.log(`[PDF Gen] Generating PDF for article: ${slug}`);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const margin = 60;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 16;
    const titleFontSize = 20;
    const bodyFontSize = 11;
    const excerptFontSize = 12;

    // Prepare text
    const plainContent = stripHtml(content);
    const bodyLines = wrapText(plainContent, StandardFonts.Helvetica, bodyFontSize, contentWidth, helvetica);

    // --- Build pages ---
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Draw title (wrapped)
    const titleLines = wrapText(title, StandardFonts.HelveticaBold, titleFontSize, contentWidth, helveticaBold);
    for (const line of titleLines) {
      if (y < margin + 40) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, { x: margin, y, size: titleFontSize, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
      y -= titleFontSize + 6;
    }

    y -= 10;

    // Draw separator line
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 20;

    // Draw excerpt if available
    if (excerpt) {
      const excerptLines = wrapText(stripHtml(excerpt), StandardFonts.Helvetica, excerptFontSize, contentWidth, helvetica);
      for (const line of excerptLines) {
        if (y < margin + 40) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(line, { x: margin, y, size: excerptFontSize, font: helvetica, color: rgb(0.4, 0.4, 0.4) });
        y -= excerptFontSize + 4;
      }
      y -= 16;
    }

    // Draw body content
    for (const line of bodyLines) {
      if (y < margin + 20) {
        // Add page number to current page
        const pageNum = pdfDoc.getPageCount();
        page.drawText(`${pageNum}`, {
          x: pageWidth / 2 - 5,
          y: margin / 2,
          size: 9,
          font: helvetica,
          color: rgb(0.6, 0.6, 0.6),
        });

        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      if (line === "") {
        y -= lineHeight * 0.6;
        continue;
      }

      // Detect bullet points
      const isBullet = line.startsWith("  • ");

      page.drawText(line, {
        x: isBullet ? margin + 10 : margin,
        y,
        size: bodyFontSize,
        font: helvetica,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= lineHeight;
    }

    // Page number on last page
    const lastPageNum = pdfDoc.getPageCount();
    page.drawText(`${lastPageNum}`, {
      x: pageWidth / 2 - 5,
      y: margin / 2,
      size: 9,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // Footer on last page
    y -= 30;
    if (y > margin + 40) {
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 16;
      page.drawText("Este conteúdo é meramente informativo e não substitui a consulta a um advogado.", {
        x: margin,
        y,
        size: 8,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
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
