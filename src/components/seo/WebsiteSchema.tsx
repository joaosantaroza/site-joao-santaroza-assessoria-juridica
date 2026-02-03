import { useEffect } from 'react';

const BASE_URL = 'https://joaosantarozaadvocacia.com.br';
const SITE_NAME = 'João Santaroza Assessoria Jurídica';

/**
 * Injects WebSite JSON-LD schema with SearchAction for sitelinks search box
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */
export const WebsiteSchema = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'website-schema';
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ['João Santaroza Advogado', 'Assessoria Jurídica Maringá'],
      url: BASE_URL,
      description: 'Assessoria jurídica especializada em isenção de imposto de renda, desbloqueio de contas e direito empresarial.',
      inLanguage: 'pt-BR',
      publisher: {
        '@id': `${BASE_URL}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    script.textContent = JSON.stringify(schema);

    const existing = document.getElementById('website-schema');
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('website-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
};
