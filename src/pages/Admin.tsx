import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  ShieldAlert
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
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchLeads();
    }
  }, [user, isAdmin]);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    const { data, error } = await supabase
      .from('ebook_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro ao carregar leads',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setLeads(data || []);
    }
    setIsLoadingLeads(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('ebook_leads')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setLeads(leads.filter(lead => lead.id !== id));
      toast({
        title: 'Lead excluído',
        description: 'O registro foi removido com sucesso.'
      });
    }
    setDeletingId(null);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast({
        title: 'Nenhum dado',
        description: 'Não há leads para exportar.',
        variant: 'destructive'
      });
      return;
    }

    const headers = ['Nome', 'Telefone', 'E-book', 'Data'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.name}"`,
        `"${lead.phone}"`,
        `"${lead.ebook_title}"`,
        `"${new Date(lead.created_at).toLocaleString('pt-BR')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-ebooks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Exportação concluída',
      description: `${leads.length} leads exportados.`
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Gestão de Leads</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{leads.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {[...new Set(leads.map(l => l.ebook_id))].length}
                  </p>
                  <p className="text-sm text-muted-foreground">E-books Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {leads.filter(l => {
                      const today = new Date();
                      const leadDate = new Date(l.created_at);
                      return leadDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Leads Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Leads Capturados</CardTitle>
                <CardDescription>
                  Lista de interessados que baixaram os e-books
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchLeads} variant="outline" size="sm" disabled={isLoadingLeads}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingLeads ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={leads.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
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
                            className="flex items-center gap-2 text-primary hover:underline"
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
      </main>
    </div>
  );
}
