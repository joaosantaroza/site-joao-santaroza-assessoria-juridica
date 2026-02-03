import { useEffect } from 'react';
import { CONTACT_INFO } from '@/lib/constants';

const BASE_URL = 'https://joaosantarozaadvocacia.com.br';

/**
 * Injects LocalBusiness + LegalService JSON-LD schema for Google rich snippets
 * Optimized for local SEO and Google Business Profile integration
 */
export const LocalBusinessSchema = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'local-business-schema';
    
    const schema = {
      '@context': 'https://schema.org',
      '@type': ['LegalService', 'LocalBusiness'],
      '@id': `${BASE_URL}/#organization`,
      name: 'João Santaroza Assessoria Jurídica',
      alternateName: 'João Santaroza Advogado',
      description: 'Assessoria jurídica especializada em isenção de imposto de renda para portadores de doenças graves, desbloqueio de contas judiciais, direito do trabalho e contratos empresariais.',
      url: BASE_URL,
      logo: `${BASE_URL}/assets/lawyer-photo.jpg`,
      image: `${BASE_URL}/assets/lawyer-photo.jpg`,
      telephone: CONTACT_INFO.phone,
      email: CONTACT_INFO.email,
      priceRange: '$$',
      currenciesAccepted: 'BRL',
      paymentAccepted: 'Dinheiro, Cartão, PIX, Transferência',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Maringá',
        addressRegion: 'PR',
        addressCountry: 'BR',
        postalCode: '87020-000',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -23.4205,
        longitude: -51.9333,
      },
      areaServed: [
        {
          '@type': 'Country',
          name: 'Brasil',
        },
        {
          '@type': 'State',
          name: 'Paraná',
        },
        {
          '@type': 'City',
          name: 'Maringá',
        },
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      sameAs: [
        `https://instagram.com/${CONTACT_INFO.instagram.replace('@', '')}`,
        `https://wa.me/55${CONTACT_INFO.whatsapp.replace(/\D/g, '')}`,
      ],
      founder: {
        '@type': 'Person',
        '@id': `${BASE_URL}/#founder`,
        name: 'João Victor Mendes Brant Santaroza',
        jobTitle: 'Advogado',
        description: 'Advogado especializado em Direito Tributário e Empresarial',
        knowsAbout: [
          'Isenção de Imposto de Renda',
          'Direito Tributário',
          'Direito do Trabalho',
          'Contratos Empresariais',
          'Desbloqueio de Contas',
        ],
        memberOf: {
          '@type': 'Organization',
          name: 'OAB - Ordem dos Advogados do Brasil',
          department: 'Seccional Paraná',
        },
        identifier: {
          '@type': 'PropertyValue',
          name: 'OAB/PR',
          value: '81.381',
        },
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Serviços Jurídicos',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Isenção de Imposto de Renda',
              description: 'Assessoria para isenção de IR para portadores de HIV e outras moléstias graves',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Desbloqueio de Contas',
              description: 'Assessoria jurídica para liberação de contas bloqueadas judicialmente',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Direito do Trabalho',
              description: 'Orientação jurídica para empresas e empregados em questões trabalhistas',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Contratos Empresariais',
              description: 'Elaboração e revisão de contratos empresariais e societários',
            },
          },
        ],
      },
    };

    script.textContent = JSON.stringify(schema);

    const existing = document.getElementById('local-business-schema');
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('local-business-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return null;
};
