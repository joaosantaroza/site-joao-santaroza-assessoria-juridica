import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  CheckCircle, AlertTriangle, XCircle, Image, Link2, Sparkles, Loader2, Copy, Search
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  image_url?: string | null;
  category?: string[] | null;
}

interface SEODashboardProps {
  articles: Article[];
}

// --- SEO Score ---
function calcSEOScore(a: Article) {
  let score = 0;
  const details: string[] = [];

  // Title 30-60 chars
  const tLen = a.title?.length || 0;
  if (tLen >= 30 && tLen <= 60) { score += 25; }
  else { details.push(tLen < 30 ? 'Título muito curto' : 'Título muito longo'); }

  // Excerpt 120-160 chars
  const eLen = a.excerpt?.length || 0;
  if (eLen >= 120 && eLen <= 160) { score += 25; }
  else { details.push(eLen < 120 ? 'Descrição muito curta' : 'Descrição muito longa'); }

  // Cover image
  if (a.image_url) { score += 20; }
  else { details.push('Sem imagem de capa'); }

  // Categories
  if (a.category && a.category.length > 0 && a.category[0] !== 'Geral') { score += 15; }
  else { details.push('Sem categorias definidas'); }

  // Slug friendly
  if (a.slug && /^[a-z0-9-]+$/.test(a.slug)) { score += 15; }
  else { details.push('Slug com caracteres especiais'); }

  return { score, details };
}

function scoreColor(s: number) {
  if (s >= 80) return 'text-green-400';
  if (s >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBadge(s: number) {
  if (s >= 80) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Bom</Badge>;
  if (s >= 50) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Regular</Badge>;
  return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Crítico</Badge>;
}

// --- Alt Text ---
function findMissingAlt(content: string) {
  const issues: string[] = [];
  // HTML img without alt or alt=""
  const imgRegex = /<img\s[^>]*?(?:alt\s*=\s*["']\s*["']|(?!.*alt\s*=))[^>]*?>/gi;
  const htmlImgs = content.match(imgRegex) || [];
  htmlImgs.forEach(() => issues.push('img HTML sem alt'));

  // Also catch <img> without alt attribute at all
  const allImgs = content.match(/<img\s[^>]*?>/gi) || [];
  allImgs.forEach(tag => {
    if (!/alt\s*=/i.test(tag) && !issues.includes('img HTML sem alt')) {
      issues.push('img HTML sem alt');
    }
  });

  // Markdown ![](url) with empty alt
  const mdRegex = /!\[\s*\]\([^)]+\)/g;
  const mdImgs = content.match(mdRegex) || [];
  mdImgs.forEach(() => issues.push('Markdown img sem alt'));

  return issues;
}

// --- Broken Links ---
function findBrokenLinks(content: string, validSlugs: Set<string>) {
  const broken: string[] = [];
  // Match /blog/slug patterns
  const linkRegex = /(?:href=["']|]\()\/blog\/([a-z0-9-]+)/gi;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const slug = match[1];
    if (!validSlugs.has(slug)) {
      broken.push(`/blog/${slug}`);
    }
  }
  return broken;
}

export function SEODashboard({ articles }: SEODashboardProps) {
  const [keywordsLoading, setKeywordsLoading] = useState<Record<string, boolean>>({});
  const [keywords, setKeywords] = useState<Record<string, string[]>>({});

  const validSlugs = useMemo(() => new Set(articles.map(a => a.slug)), [articles]);

  const seoScores = useMemo(() =>
    articles.map(a => ({ ...a, ...calcSEOScore(a) })).sort((a, b) => a.score - b.score),
    [articles]
  );

  const altIssues = useMemo(() =>
    articles.map(a => ({ ...a, issues: findMissingAlt(a.content) })).filter(a => a.issues.length > 0),
    [articles]
  );

  const brokenLinks = useMemo(() =>
    articles.map(a => ({ ...a, broken: findBrokenLinks(a.content, validSlugs) })).filter(a => a.broken.length > 0),
    [articles]
  );

  const avgScore = seoScores.length ? Math.round(seoScores.reduce((s, a) => s + a.score, 0) / seoScores.length) : 0;

  const suggestKeywords = async (article: Article) => {
    setKeywordsLoading(p => ({ ...p, [article.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('suggest-keywords', {
        body: { title: article.title, excerpt: article.excerpt, category: article.category }
      });
      if (error) throw error;
      setKeywords(p => ({ ...p, [article.id]: data.keywords || [] }));
      toast.success('Keywords geradas com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar keywords');
    } finally {
      setKeywordsLoading(p => ({ ...p, [article.id]: false }));
    }
  };

  const copyKeywords = (kws: string[]) => {
    navigator.clipboard.writeText(kws.join(', '));
    toast.success('Keywords copiadas!');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription>Score Médio SEO</CardDescription>
            <CardTitle className={`text-3xl ${scoreColor(avgScore)}`}>{avgScore}/100</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={avgScore} className="h-2" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription>Artigos Analisados</CardDescription>
            <CardTitle className="text-3xl text-foreground">{articles.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">artigos publicados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription>Sem Alt Text</CardDescription>
            <CardTitle className={`text-3xl ${altIssues.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {altIssues.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">artigos com imagens sem alt</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription>Links Quebrados</CardDescription>
            <CardTitle className={`text-3xl ${brokenLinks.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {brokenLinks.reduce((s, a) => s + a.broken.length, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">links internos inválidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="scores" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="scores" className="gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Search className="h-3.5 w-3.5" /> Meta Tags
          </TabsTrigger>
          <TabsTrigger value="alt" className="gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Image className="h-3.5 w-3.5" /> Alt Text
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Link2 className="h-3.5 w-3.5" /> Links
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-1.5 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Keywords IA
          </TabsTrigger>
        </TabsList>

        {/* Meta Tags Score */}
        <TabsContent value="scores">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Pontuação de Meta Tags</CardTitle>
              <CardDescription>Análise de título, descrição, imagem, categorias e slug</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Artigo</TableHead>
                    <TableHead className="w-24 text-center">Score</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead>Problemas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seoScores.map(a => (
                    <TableRow key={a.id} className="border-border">
                      <TableCell className="max-w-[300px] truncate font-medium">{a.title}</TableCell>
                      <TableCell className={`text-center font-bold ${scoreColor(a.score)}`}>{a.score}</TableCell>
                      <TableCell className="text-center">{scoreBadge(a.score)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.details.length === 0 ? (
                          <span className="flex items-center gap-1 text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Tudo OK</span>
                        ) : a.details.join(' • ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alt Text */}
        <TabsContent value="alt">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Imagens sem Alt Text</CardTitle>
              <CardDescription>Artigos com imagens que precisam de texto alternativo</CardDescription>
            </CardHeader>
            <CardContent>
              {altIssues.length === 0 ? (
                <div className="text-center py-8 text-green-400 flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8" />
                  <p>Todos os artigos possuem alt text nas imagens!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Artigo</TableHead>
                      <TableHead className="w-32 text-center">Problemas</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {altIssues.map(a => (
                      <TableRow key={a.id} className="border-border">
                        <TableCell className="max-w-[300px] truncate font-medium">{a.title}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" /> {a.issues.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.issues.join(', ')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broken Links */}
        <TabsContent value="links">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Links Internos Quebrados</CardTitle>
              <CardDescription>Links para artigos que não existem ou não estão publicados</CardDescription>
            </CardHeader>
            <CardContent>
              {brokenLinks.length === 0 ? (
                <div className="text-center py-8 text-green-400 flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8" />
                  <p>Nenhum link interno quebrado encontrado!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Artigo</TableHead>
                      <TableHead>Links Quebrados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brokenLinks.map(a => (
                      <TableRow key={a.id} className="border-border">
                        <TableCell className="max-w-[300px] truncate font-medium">{a.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {a.broken.map((link, i) => (
                              <Badge key={i} variant="outline" className="text-red-400 border-red-500/30">
                                <XCircle className="h-3 w-3 mr-1" /> {link}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Keywords */}
        <TabsContent value="keywords">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Sugestões de Palavras-chave com IA</CardTitle>
              <CardDescription>Gere keywords SEO otimizadas para cada artigo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Artigo</TableHead>
                    <TableHead>Keywords Sugeridas</TableHead>
                    <TableHead className="w-32 text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map(a => (
                    <TableRow key={a.id} className="border-border">
                      <TableCell className="max-w-[250px] truncate font-medium">{a.title}</TableCell>
                      <TableCell>
                        {keywords[a.id] ? (
                          <div className="flex flex-wrap gap-1.5">
                            {keywords[a.id].map((kw, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                            ))}
                            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => copyKeywords(keywords[a.id])}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Clique em "Gerar" para obter sugestões</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={keywordsLoading[a.id]}
                          onClick={() => suggestKeywords(a)}
                          className="gap-1.5"
                        >
                          {keywordsLoading[a.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          Gerar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
