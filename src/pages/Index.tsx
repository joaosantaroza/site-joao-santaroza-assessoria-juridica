import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/components/HomePage';
import { PracticeAreasHub } from '@/components/PracticeAreasHub';
import { TaxExemptionHub } from '@/components/TaxExemptionHub';
import { ServicePage } from '@/components/ServicePage';
import { ContactModal } from '@/components/ContactModal';
import { SERVICES, ViewType } from '@/lib/constants';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType | string>('home');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { 
    window.scrollTo(0, 0); 
  }, [currentView]);

  const getModalSubject = () => {
    if (currentView !== 'home' && SERVICES[currentView as keyof typeof SERVICES]) {
      return SERVICES[currentView as keyof typeof SERVICES].title;
    }
    return '';
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage 
            onNavigate={setCurrentView as (view: ViewType) => void} 
            onContact={() => setShowModal(true)}
          />
        );
      case 'practice_areas':
        return <PracticeAreasHub onNavigate={setCurrentView as (view: ViewType) => void} onBack={() => setCurrentView('home')} />;
      case 'tax_hub':
        return <TaxExemptionHub onSelect={setCurrentView as (view: ViewType) => void} onBack={() => setCurrentView('practice_areas')} />;
      default:
        if (SERVICES[currentView as keyof typeof SERVICES]) {
          return (
            <ServicePage 
              service={SERVICES[currentView as keyof typeof SERVICES]} 
              onBack={() => setCurrentView('practice_areas')} 
              onContact={() => setShowModal(true)} 
            />
          );
        }
        return (
          <HomePage 
            onNavigate={setCurrentView as (view: ViewType) => void} 
            onContact={() => setShowModal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-accent selection:text-accent-foreground">
      <Navbar onNavigate={setCurrentView} onContact={() => setShowModal(true)} />
      
      <main>
        {renderContent()}
      </main>

      <Footer />

      <ContactModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        initialSubject={getModalSubject()} 
      />
    </div>
  );
};

export default Index;
