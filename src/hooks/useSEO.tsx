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
  keywords?: string[];
  modifiedTime?: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop';
const SITE_NAME = 'João Santaroza | Assessoria Jurídica';
const BASE_URL = 'https://joaosantarozaadvocacia.com.br';

// Default SEO keywords for the law firm
const DEFAULT_KEYWORDS = [
  'advogado Maringá',
  'assessoria jurídica Paraná',
  'isenção imposto de renda',
  'direito trabalhista Maringá',
  'advogado previdenciário',
  'João Santaroza advogado',
];

export function useSEO({
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedTime,
  section,
  keywords = [],
  modifiedTime,
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

    // Combine default keywords with article-specific keywords
    const allKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])];
    
    // Basic meta tags
    setMetaTag('meta[name="description"]', description);
    setMetaTag('meta[name="keywords"]', allKeywords.join(', '));
    setMetaTag('meta[name="robots"]', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('meta[name="googlebot"]', 'index, follow');
    
    // Geo meta tags for local SEO
    setMetaTag('meta[name="geo.region"]', 'BR-PR');
    setMetaTag('meta[name="geo.placename"]', 'Maringá');
    setMetaTag('meta[name="geo.position"]', '-23.4205;-51.9333');
    setMetaTag('meta[name="ICBM"]', '-23.4205, -51.9333');
    
    // Open Graph tags
    setMetaTag('meta[property="og:title"]', fullTitle);
    setMetaTag('meta[property="og:description"]', description);
    setMetaTag('meta[property="og:image"]', image);
    setMetaTag('meta[property="og:image:width"]', '1200');
    setMetaTag('meta[property="og:image:height"]', '630');
    setMetaTag('meta[property="og:type"]', type);
    setMetaTag('meta[property="og:site_name"]', SITE_NAME);
    setMetaTag('meta[property="og:locale"]', 'pt_BR');
    
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
      if (modifiedTime) {
        setMetaTag('meta[property="article:modified_time"]', modifiedTime);
      }
      if (section) {
        setMetaTag('meta[property="article:section"]', section);
      }
      // Add article tags from keywords
      keywords.forEach((keyword, index) => {
        setMetaTag(`meta[property="article:tag"][data-index="${index}"]`, keyword);
      });
    }

    // Twitter Card tags - optimized for article sharing
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', fullTitle);
    setMetaTag('meta[name="twitter:description"]', description);
    setMetaTag('meta[name="twitter:image"]', image);
    setMetaTag('meta[name="twitter:image:alt"]', title);
    setMetaTag('meta[name="twitter:site"]', '@joaosantaroza');
    
    // Article-specific Twitter meta for better attribution
    if (type === 'article' && author) {
      setMetaTag('meta[name="twitter:creator"]', '@joaosantaroza');
      setMetaTag('meta[name="twitter:label1"]', 'Escrito por');
      setMetaTag('meta[name="twitter:data1"]', author);
      setMetaTag('meta[name="twitter:label2"]', 'Tempo de leitura');
      setMetaTag('meta[name="twitter:data2"]', section || '5 min');
    }

    // Cleanup: reset to defaults when component unmounts
    return () => {
      document.title = SITE_NAME;
      setMetaTag('meta[name="description"]', 'Escritório especializado em Isenção de Imposto de Renda para portadores de doenças graves, desbloqueio de contas judiciais, direito do trabalho e contratos empresariais. Advogado em Maringá, Paraná.');
      setMetaTag('meta[name="keywords"]', DEFAULT_KEYWORDS.join(', '));
      setMetaTag('meta[property="og:title"]', SITE_NAME);
      setMetaTag('meta[property="og:description"]', 'Superação de entraves financeiros e execuções judiciais. Diagnóstico preciso para liberação de contas e reestruturação de passivos.');
      setMetaTag('meta[property="og:image"]', DEFAULT_IMAGE);
      setMetaTag('meta[property="og:type"]', 'website');
      setLinkTag('canonical', BASE_URL);
    };
  }, [title, description, image, url, type, author, publishedTime, section, keywords, modifiedTime]);
}
