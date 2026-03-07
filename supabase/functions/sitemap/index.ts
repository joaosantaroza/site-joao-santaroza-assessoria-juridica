import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://joaosantarozaadvocacia.com.br";

// Static pages with their priority and change frequency
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/especialidades", priority: "0.9", changefreq: "monthly" },
  { path: "/areas-de-atuacao", priority: "0.8", changefreq: "monthly" },
  { path: "/isencao-de-imposto-de-renda", priority: "0.8", changefreq: "monthly" },
];

serve(async (req) => {
  // Allow any origin for sitemap (it's public data)
  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "Access-Control-Allow-Origin": "*",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(generateSitemap([]), { headers });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch published blog posts
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, created_at")
      .eq("published", true)
      .or("scheduled_at.is.null,scheduled_at.lte.now()")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error.message);
      return new Response(generateSitemap([]), { headers });
    }

    console.log(`Generating sitemap with ${posts?.length || 0} blog posts`);

    const sitemap = generateSitemap(posts || []);

    return new Response(sitemap, { headers });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(generateSitemap([]), { headers });
  }
});

function generateSitemap(posts: Array<{ slug: string; updated_at: string; created_at: string }>) {
  const today = new Date().toISOString().split("T")[0];

  // Generate static page entries
  const staticEntries = STATIC_PAGES.map(
    (page) => `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join("");

  // Generate blog post entries
  const blogEntries = posts
    .map((post) => {
      const lastmod = (post.updated_at || post.created_at).split("T")[0];
      return `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
</urlset>`;
}
