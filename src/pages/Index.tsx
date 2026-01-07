import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/components/HomePage';
import { PracticeAreasHub } from '@/components/PracticeAreasHub';
import { TaxExemptionHub } from '@/components/TaxExemptionHub';
import { ServicePage } from '@/components/ServicePage';
import { ArticlePage } from '@/components/ArticlePage';
import { ContactModal } from '@/components/ContactModal';
import { SERVICES, BLOG_ARTICLES, ViewType } from '@/lib/constants';

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
    const article = BLOG_ARTICLES.find(a => `article_${a.id}` === currentView);
    if (article) {
      return article.title;
    }
    return '';
  };

  const handleArticleClick = (articleId: string) => {
    setCurrentView(`article_${articleId}`);
  };

  const renderContent = () => {
    // Check if it's an article view
    if (currentView.startsWith('article_')) {
      const articleId = currentView.replace('article_', '');
      const article = BLOG_ARTICLES.find(a => a.id === articleId);
      if (article) {
        return (
          <ArticlePage 
            article={article}
            onBack={() => setCurrentView('home')}
            onContact={() => setShowModal(true)}
          />
        );
      }
    }

    switch (currentView) {
      case 'home':
        return (
          <HomePage 
            onNavigate={setCurrentView as (view: ViewType) => void} 
            onContact={() => setShowModal(true)}
            onArticleClick={handleArticleClick}
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
            onArticleClick={handleArticleClick}
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
