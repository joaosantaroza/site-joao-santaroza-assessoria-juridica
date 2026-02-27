import { useEffect, useState, useMemo } from 'react';
import { subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LeadsChart } from '@/components/admin/LeadsChart';
import { Sparkline } from '@/components/admin/Sparkline';
import { ActivityHeatmap } from '@/components/admin/ActivityHeatmap';
import { 
  Loader2, 
  LogOut, 
  Users, 
  Trash2, 
  Download, 
  RefreshCw,
  BookOpen,
  Phone,
  Calendar,
  ShieldAlert,
  FileText,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EbookLead {
  id: string;
  name: string;
  phone: string;
  ebook_id: string;
  ebook_title: string;
  created_at: string;
}

export default function Admin() {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [leads, setLeads] = useState<EbookLead[]>([]);
  const [whatsappClicks, setWhatsappClicks] = useState<{ area: string; created_at: string }[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('articles');
  const [whatsappPeriod, setWhatsappPeriod] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredWhatsappClicks = useMemo(() => {
    if (whatsappPeriod === 'all') return whatsappClicks;
    const days = parseInt(whatsappPeriod);
    const cutoff = subDays(new Date(), days);
    return whatsappClicks.filter(c => new Date(c.created_at) >= cutoff);
  }, [whatsappClicks, whatsappPeriod]);

  const whatsappVariation = useMemo(() => {
    if (whatsappPeriod === 'all') return null;
    const days = parseInt(whatsappPeriod);
    const now = new Date();
    const currentStart = subDays(now, days);
    const previousStart = subDays(now, days * 2);
    const current = whatsappClicks.filter(c => new Date(c.created_at) >= currentStart).length;
    const previous = whatsappClicks.filter(c => {
      const d = new Date(c.created_at);
      return d >= previousStart && d < currentStart;
    }).length;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [whatsappClicks, whatsappPeriod]);

  const leadsVariation = useMemo(() => {
    if (leads.length === 0) return null;
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);
    const current = leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length;
    const previous = leads.filter(l => {
      const d = new Date(l.created_at);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }).length;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, [leads]);

  const leadsTodayVariation = useMemo(() => {
    if (leads.length === 0) return null;
    const now = new Date();
    const today = now.toDateString();
    const yesterday = subDays(now, 1).toDateString();
    const todayCount = leads.filter(l => new Date(l.created_at).toDateString() === today).length;
    const yesterdayCount = leads.filter(l => new Date(l.created_at).toDateString() === yesterday).length;
    if (yesterdayCount === 0) return todayCount > 0 ? 100 : 0;
    return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
  }, [leads]);

  // Sparkline data: count per day for last 7 days
  const buildDailySparkline = (items: { created_at: string }[], days = 7) => {
    const now = new Date();
    return Array.from({ length: days }, (_, i) => {
      const day = subDays(now, days - 1 - i).toDateString();
      return items.filter(item => new Date(item.created_at).toDateString() === day).length;
    });
  };

  const leadsSparkline = useMemo(() => buildDailySparkline(leads), [leads]);
  const whatsappSparkline = useMemo(() => buildDailySparkline(whatsappClicks), [whatsappClicks]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchLeads();
      fetchWhatsappClicks();
    }
  }, [user, isAdmin]);

  const fetchWhatsappClicks = async () => {
    const { data } = await supabase
      .from("whatsapp_clicks")
      .select("area, created_at")
      .order("created_at", { ascending: false });
    setWhatsappClicks(data || []);
  };

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-leads', {
        method: 'GET',
      });

      if (error) {
        toast({
          title: 'Erro ao carregar leads',
          description: 'Falha ao conectar com o servidor.',
          variant: 'destructive'
        });
      } else if (data?.error) {
        toast({
          title: 'Erro ao carregar leads',
          description: data.error,
          variant: 'destructive'
        });
      } else {
        setLeads(data?.data || []);
      }
    } catch (err) {
      toast({
        title: 'Erro ao carregar leads',
        description: 'Falha inesperada ao carregar dados.',
        variant: 'destructive'
      });
    }
    setIsLoadingLeads(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { data, error } = await supabase.functions.invoke('admin-leads', {
        method: 'DELETE',
        body: { id },
      });

      if (error) {
        toast({
          title: 'Erro ao excluir',
          description: 'Falha ao conectar com o servidor.',
          variant: 'destructive'
        });
      } else if (data?.error) {
        toast({
          title: 'Erro ao excluir',
          description: data.error,
          variant: 'destructive'
        });
      } else {
        setLeads(leads.filter(lead => lead.id !== id));
        toast({
          title: 'Lead excluído',
          description: 'O registro foi removido com sucesso.'
        });
      }
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: 'Falha inesperada ao excluir registro.',
        variant: 'destructive'
      });
    }
    setDeletingId(null);
  };

  const maskPII = (value: string, type: 'name' | 'phone' | 'email'): string => {
    if (!value) return '';
    switch (type) {
      case 'name': {
        const parts = value.trim().split(/\s+/);
        return parts.map((p, i) => i === 0 ? p : p[0] + '***').join(' ');
      }
      case 'phone': {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 4) return '****';
        return digits.slice(0, 2) + '*'.repeat(digits.length - 4) + digits.slice(-2);
      }
      case 'email': {
        if (!value.includes('@')) return '***';
        const [local, domain] = value.split('@');
        return local[0] + '***@' + domain;
      }
      default:
        return value;
    }
  };

  const handleExportCSV = (masked = false) => {
    if (leads.length === 0) {
      toast({
        title: 'Nenhum dado',
        description: 'Não há leads para exportar.',
        variant: 'destructive'
      });
      return;
    }

    const headers = masked
      ? ['Nome (mascarado)', 'Telefone (mascarado)', 'E-book', 'Data']
      : ['Nome', 'Telefone', 'E-book', 'Data'];

    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${masked ? maskPII(lead.name, 'name') : lead.name}"`,
        `"${masked ? maskPII(lead.phone, 'phone') : lead.phone}"`,
        `"${lead.ebook_title}"`,
        `"${new Date(lead.created_at).toLocaleString('pt-BR')}"`
      ].join(','))
    ].join('\n');

    const suffix = masked ? '-seguro' : '-completo';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-ebooks${suffix}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: masked ? 'Exportação segura concluída' : 'Exportação completa concluída',
      description: `${leads.length} leads exportados${masked ? ' com PII mascarado' : ''}.`
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área. Entre em contato com o administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Site
            </Button>
            <Button onClick={handleSignOut} variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading text-foreground">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">João Santaroza Advocacia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="articles" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <FileText className="h-4 w-4" />
              Artigos
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <Card 
              className="border-border bg-card cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => navigate('/admin/artigos')}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground font-heading">Gerenciar Artigos</p>
                      <p className="text-sm text-muted-foreground">Criar, editar e publicar artigos do blog</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                          {leadsVariation !== null && (
                            <span className={`flex items-center text-xs font-medium ${leadsVariation > 0 ? 'text-green-500' : leadsVariation < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {leadsVariation > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : leadsVariation < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <Minus className="h-3 w-3 mr-0.5" />}
                              {leadsVariation > 0 ? '+' : ''}{leadsVariation}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Total de Leads</p>
                        {leadsVariation !== null && (
                          <p className="text-xs text-muted-foreground/70">vs últimos 30 dias</p>
                        )}
                      </div>
                    </div>
                    <Sparkline data={leadsSparkline} color="hsl(var(--accent))" trend={leadsVariation} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-[#25D366]/20 flex items-center justify-center shrink-0">
                        <MessageCircle className="h-6 w-6 text-[#25D366]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-foreground">{filteredWhatsappClicks.length}</p>
                          {whatsappVariation !== null && (
                            <span className={`flex items-center text-xs font-medium ${whatsappVariation > 0 ? 'text-green-500' : whatsappVariation < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {whatsappVariation > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : whatsappVariation < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <Minus className="h-3 w-3 mr-0.5" />}
                              {whatsappVariation > 0 ? '+' : ''}{whatsappVariation}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Cliques WhatsApp</p>
                        {whatsappVariation !== null && (
                          <p className="text-xs text-muted-foreground/70">vs período anterior</p>
                        )}
                      </div>
                    </div>
                    <Sparkline data={whatsappSparkline} color="#25D366" trend={whatsappVariation} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                        <BookOpen className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {[...new Set(leads.map(l => l.ebook_id))].length}
                        </p>
                        <p className="text-sm text-muted-foreground">E-books Ativos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                        <Calendar className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-foreground">
                            {leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
                          </p>
                          {leadsTodayVariation !== null && (
                            <span className={`flex items-center text-xs font-medium ${leadsTodayVariation > 0 ? 'text-green-500' : leadsTodayVariation < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {leadsTodayVariation > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : leadsTodayVariation < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : <Minus className="h-3 w-3 mr-0.5" />}
                              {leadsTodayVariation > 0 ? '+' : ''}{leadsTodayVariation}%
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Leads Hoje</p>
                        {leadsTodayVariation !== null && (
                          <p className="text-xs text-muted-foreground/70">vs ontem</p>
                        )}
                      </div>
                    </div>
                    <Sparkline data={leadsSparkline} color="hsl(var(--accent))" trend={leadsTodayVariation} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* WhatsApp Period Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Período WhatsApp:</span>
              <Select value={whatsappPeriod} onValueChange={setWhatsappPeriod}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todo período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Heatmap */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-heading text-base">Mapa de Calor de Atividade</CardTitle>
                <CardDescription>Distribuição de atividade por dia da semana e hora do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap leads={leads} whatsappClicks={whatsappClicks} />
              </CardContent>
            </Card>

            {/* WhatsApp Clicks by Area */}
            {filteredWhatsappClicks.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="font-heading flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-[#25D366]" />
                        Leads via WhatsApp por Área
                      </CardTitle>
                      <CardDescription>Cliques no widget de WhatsApp por área de atuação</CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        if (filteredWhatsappClicks.length === 0) return;
                        const csvContent = [
                          ['Área', 'Data'].join(','),
                          ...filteredWhatsappClicks.map(c => [
                            `"${c.area}"`,
                            `"${new Date(c.created_at).toLocaleString('pt-BR')}"`
                          ].join(','))
                        ].join('\n');
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `whatsapp-cliques-${new Date().toISOString().split('T')[0]}.csv`;
                        link.click();
                        toast({ title: 'Exportação concluída', description: `${filteredWhatsappClicks.length} cliques exportados.` });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(
                      filteredWhatsappClicks.reduce<Record<string, number>>((acc, c) => {
                        acc[c.area] = (acc[c.area] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([area, count]) => (
                        <div key={area} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                          <span className="text-sm font-medium text-foreground truncate">{area}</span>
                          <Badge variant="secondary" className="ml-2 shrink-0">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts Section */}
            <LeadsChart leads={leads} whatsappClicks={filteredWhatsappClicks} />

            {/* Leads Table */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-heading">Leads Capturados</CardTitle>
                    <CardDescription>
                      Lista de interessados que baixaram os e-books
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={fetchLeads} variant="outline" size="sm" disabled={isLoadingLeads}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLeads ? 'animate-spin' : ''}`} />
                      Atualizar
                    </Button>
                    <Button onClick={() => handleExportCSV(true)} variant="outline" size="sm" disabled={leads.length === 0} title="Exporta com dados pessoais mascarados (seguro para compartilhar)">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Seguro
                    </Button>
                    <Button onClick={() => handleExportCSV(false)} variant="ghost" size="sm" disabled={leads.length === 0} title="Exporta com todos os dados pessoais visíveis">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Completo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingLeads ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhum lead capturado ainda.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>E-book</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>
                              <a 
                                href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-accent hover:underline"
                              >
                                <Phone className="h-4 w-4" />
                                {formatPhone(lead.phone)}
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{lead.ebook_title}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(lead.created_at)}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    disabled={deletingId === lead.id}
                                  >
                                    {deletingId === lead.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. O registro de {lead.name} será removido permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(lead.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
