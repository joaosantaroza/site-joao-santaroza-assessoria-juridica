import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  section?: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop';
const SITE_NAME = 'João Santaroza | Assessoria Jurídica';
const BASE_URL = 'https://joaosantarozaadvocacia.com.br';

export function useSEO({
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedTime,
  section,
}: SEOProps) {
  useEffect(() => {
    // Update title
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (selector: string, content: string, attr: string = 'content') => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (element) {
        element.setAttribute(attr, content);
      } else {
        element = document.createElement('meta');
        const [attrName, attrValue] = selector.replace('meta[', '').replace(']', '').split('=');
        element.setAttribute(attrName, attrValue.replace(/"/g, ''));
        element.setAttribute(attr, content);
        document.head.appendChild(element);
      }
    };

    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (element) {
        element.href = href;
      } else {
        element = document.createElement('link');
        element.rel = rel;
        element.href = href;
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    setMetaTag('meta[name="description"]', description);
    
    // Open Graph tags
    setMetaTag('meta[property="og:title"]', fullTitle);
    setMetaTag('meta[property="og:description"]', description);
    setMetaTag('meta[property="og:image"]', image);
    setMetaTag('meta[property="og:type"]', type);
    setMetaTag('meta[property="og:site_name"]', SITE_NAME);
    
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
      setMetaTag('meta[property="og:url"]', fullUrl);
      setLinkTag('canonical', fullUrl);
    }

    // Article-specific Open Graph tags
    if (type === 'article') {
      if (author) {
        setMetaTag('meta[property="article:author"]', author);
      }
      if (publishedTime) {
        setMetaTag('meta[property="article:published_time"]', publishedTime);
      }
      if (section) {
        setMetaTag('meta[property="article:section"]', section);
      }
    }

    // Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', fullTitle);
    setMetaTag('meta[name="twitter:description"]', description);
    setMetaTag('meta[name="twitter:image"]', image);

    // Cleanup: reset to defaults when component unmounts
    return () => {
      document.title = SITE_NAME;
      setMetaTag('meta[name="description"]', 'Escritório especializado em Isenção de Imposto de Renda para portadores de doenças graves, desbloqueio de contas judiciais, direito do trabalho e contratos empresariais.');
      setMetaTag('meta[property="og:title"]', SITE_NAME);
      setMetaTag('meta[property="og:description"]', 'Superação de entraves financeiros e execuções judiciais. Diagnóstico preciso para liberação de contas e reestruturação de passivos.');
      setMetaTag('meta[property="og:image"]', DEFAULT_IMAGE);
      setMetaTag('meta[property="og:type"]', 'website');
      setLinkTag('canonical', BASE_URL);
    };
  }, [title, description, image, url, type, author, publishedTime, section]);
}
