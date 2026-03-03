import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (!wasDismissed && isInstallable && !isInstalled) {
      const timer = setTimeout(() => setDismissed(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleInstall = async () => {
    await installApp();
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-card border border-border rounded-xl shadow-2xl p-4"
        >
          <button onClick={handleDismiss} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">Instale nosso app</p>
              <p className="text-xs text-muted-foreground mt-1">
                Acesse rápido pelo celular, funciona offline e receba notificações de novos artigos.
              </p>
              <Button size="sm" className="mt-3 w-full gap-2" onClick={handleInstall}>
                <Download className="w-4 h-4" />
                Instalar App
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
