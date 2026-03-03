import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Bell, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const { isInstallable, isInstalled, installApp, notificationPermission, requestNotificationPermission } = usePWA();
  const navigate = useNavigate();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={() => navigate('/')} onContact={() => {}} />

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <Smartphone className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-3 font-heading">
            Instale o App
          </h1>
          <p className="text-muted-foreground">
            Tenha acesso rápido ao nosso conteúdo jurídico direto do seu celular.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid gap-4 mb-10">
          {[
            { icon: Download, title: 'Acesso Rápido', desc: 'Abra direto da tela inicial, como um app nativo.' },
            { icon: Wifi, title: 'Funciona Offline', desc: 'Leia artigos já visitados mesmo sem internet.' },
            { icon: Bell, title: 'Notificações', desc: 'Receba alertas quando publicarmos novos artigos.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start p-4 bg-card rounded-lg border border-border">
              <Icon className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Install Section */}
        <div className="space-y-6">
          {isInstalled ? (
            <div className="text-center p-6 bg-accent/10 rounded-lg border border-accent/30">
              <p className="font-bold text-accent">✓ App já instalado!</p>
              <p className="text-sm text-muted-foreground mt-1">Você já pode acessar pela tela inicial.</p>
            </div>
          ) : isInstallable ? (
            <Button size="lg" className="w-full gap-2" onClick={installApp}>
              <Download className="w-5 h-5" />
              Instalar Agora
            </Button>
          ) : isIOS ? (
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-3">Como instalar no iPhone/iPad:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta)</li>
                <li>2. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                <li>3. Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
              </ol>
            </div>
          ) : (
            <div className="p-6 bg-card rounded-lg border border-border">
              <h3 className="font-bold text-foreground mb-3">Como instalar:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Abra o menu do navegador (três pontos)</li>
                <li>2. Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
              </ol>
            </div>
          )}

          {/* Notifications */}
          {notificationPermission !== 'unsupported' && notificationPermission !== 'granted' && (
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={requestNotificationPermission}
            >
              <Bell className="w-5 h-5" />
              Ativar Notificações de Artigos
            </Button>
          )}
          {notificationPermission === 'granted' && (
            <p className="text-center text-sm text-accent font-medium">
              🔔 Notificações ativadas!
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
