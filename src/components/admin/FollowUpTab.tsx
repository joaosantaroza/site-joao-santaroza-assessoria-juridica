import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getFollowUpMessage, buildWhatsAppLink, getStepLabel } from '@/lib/followUpTemplates';
import {
  Loader2,
  RefreshCw,
  MessageCircle,
  Check,
  SkipForward,
  Clock,
  AlertCircle,
  Phone,
  Copy,
} from 'lucide-react';

interface FollowUp {
  id: string;
  lead_type: string;
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  practice_area: string;
  follow_up_date: string;
  sequence_step: number;
  status: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export function FollowUpTab() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .order('follow_up_date', { ascending: true });
    if (!error) setFollowUps((data as FollowUp[]) || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const updateData: Record<string, unknown> = { status };
    if (status === 'completed') updateData.completed_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('follow_ups')
      .update(updateData)
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status.', variant: 'destructive' });
    } else {
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updateData } as FollowUp : f));
      toast({ title: 'Atualizado', description: `Follow-up marcado como ${status === 'completed' ? 'concluído' : 'pulado'}.` });
    }
    setUpdatingId(null);
  };

  const saveNotes = async (id: string, notes: string) => {
    await supabase.from('follow_ups').update({ notes }).eq('id', id);
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = followUps.filter(f => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') return f.status === 'pending' && f.follow_up_date < today;
    return f.status === statusFilter;
  });

  const pendingToday = followUps.filter(f => f.status === 'pending' && f.follow_up_date <= today).length;
  const overdue = followUps.filter(f => f.status === 'pending' && f.follow_up_date < today).length;
  const completedToday = followUps.filter(f => f.status === 'completed' && f.completed_at?.startsWith(today)).length;
  const totalPending = followUps.filter(f => f.status === 'pending').length;

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado!', description: 'Mensagem copiada para a área de transferência.' });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingToday}</p>
                <p className="text-sm text-muted-foreground">Para hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overdue}</p>
                <p className="text-sm text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <Check className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedToday}</p>
                <p className="text-sm text-muted-foreground">Concluídos hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPending}</p>
                <p className="text-sm text-muted-foreground">Total pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-heading">Follow-ups</CardTitle>
              <CardDescription>Acompanhamento de leads com mensagens WhatsApp pré-formatadas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Atrasados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="skipped">Pulados</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchFollowUps} variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum follow-up encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((fu) => {
                const message = getFollowUpMessage(fu.practice_area, fu.sequence_step, fu.lead_name);
                const waLink = buildWhatsAppLink(fu.lead_phone, message);
                const isOverdue = fu.status === 'pending' && fu.follow_up_date < today;
                const isToday = fu.follow_up_date === today;

                return (
                  <div
                    key={fu.id}
                    className={`p-4 rounded-lg border ${
                      isOverdue ? 'border-destructive/50 bg-destructive/5' :
                      isToday ? 'border-yellow-500/50 bg-yellow-500/5' :
                      'border-border bg-muted/20'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">{fu.lead_name}</span>
                          <Badge variant="secondary">{fu.practice_area}</Badge>
                          <Badge variant={fu.lead_type === 'ebook' ? 'outline' : 'default'} className="text-xs">
                            {fu.lead_type === 'ebook' ? 'E-book' : 'Agendamento'}
                          </Badge>
                          <Badge variant={isOverdue ? 'destructive' : isToday ? 'default' : 'outline'} className="text-xs">
                            {getStepLabel(fu.sequence_step)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {fu.lead_phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                          </span>
                          <span>Data: {new Date(fu.follow_up_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          {fu.status !== 'pending' && (
                            <Badge variant={fu.status === 'completed' ? 'secondary' : 'outline'}>
                              {fu.status === 'completed' ? 'Concluído' : 'Pulado'}
                            </Badge>
                          )}
                        </div>

                        {/* Message preview */}
                        <div className="bg-muted/40 rounded-md p-3 text-sm text-muted-foreground relative">
                          <p className="pr-8">{message}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => copyMessage(message)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Notes */}
                        {fu.status === 'pending' && (
                          <Textarea
                            placeholder="Anotações..."
                            defaultValue={fu.notes || ''}
                            className="text-sm h-16 resize-none"
                            onBlur={(e) => saveNotes(fu.id, e.target.value)}
                          />
                        )}
                      </div>

                      {/* Actions */}
                      {fu.status === 'pending' && (
                        <div className="flex lg:flex-col gap-2 shrink-0">
                          <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white w-full">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === fu.id}
                            onClick={() => updateStatus(fu.id, 'completed')}
                          >
                            {updatingId === fu.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                            Concluído
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={updatingId === fu.id}
                            onClick={() => updateStatus(fu.id, 'skipped')}
                          >
                            <SkipForward className="h-4 w-4 mr-1" />
                            Pular
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
