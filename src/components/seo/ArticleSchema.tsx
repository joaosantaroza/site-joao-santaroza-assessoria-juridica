import { useEffect } from 'react';
import { CONTACT_INFO } from '@/lib/constants';

const BASE_URL = 'https://joaosantarozaadvocacia.com.br';

interface ArticleSchemaProps {
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  categories: string[];
  readTime: string;
  content?: string;
}

/**
 * Injects Article JSON-LD schema for Google rich snippets
 * @see https://developers.google.com/search/docs/appearance/structured-data/article
 */
export const ArticleSchema = ({
  title,
  slug,
  excerpt,
  image,
  datePublished,
  dateModified,
  categories,
  readTime,
  content,
}: ArticleSchemaProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-schema';

    // Extract word count from content
    const wordCount = content
      ? content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
      : undefined;

    // Parse date to ISO format
    const parseDate = (dateStr: string): string => {
      // Handle "DD de Mês de YYYY" format
      const months: Record<string, string> = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
      };
      
      const match = dateStr.match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
      if (match) {
        const [, day, month, year] = match;
        const monthNum = months[month.toLowerCase()] || '01';
        return `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
      
      // Try to parse as ISO or return current date
      try {
        return new Date(dateStr).toISOString().split('T')[0];
      } catch {
        return new Date().toISOString().split('T')[0];
      }
    };

    const isoDatePublished = parseDate(datePublished);
    const isoDateModified = dateModified ? parseDate(dateModified) : isoDatePublished;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${BASE_URL}/blog/${slug}#article`,
      headline: title,
      description: excerpt,
      image: {
        '@type': 'ImageObject',
        url: image.startsWith('http') ? image : `${BASE_URL}${image}`,
        width: 1200,
        height: 630,
      },
      datePublished: isoDatePublished,
      dateModified: isoDateModified,
      author: {
        '@type': 'Person',
        '@id': `${BASE_URL}/#founder`,
        name: CONTACT_INFO.lawyerName,
        url: BASE_URL,
        jobTitle: 'Advogado',
        worksFor: {
          '@type': 'LegalService',
          '@id': `${BASE_URL}/#organization`,
          name: 'João Santaroza Assessoria Jurídica',
        },
      },
      publisher: {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'João Santaroza Assessoria Jurídica',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/assets/lawyer-photo.jpg`,
          width: 600,
          height: 600,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/blog/${slug}`,
      },
      articleSection: categories.join(', '),
      keywords: categories.join(', '),
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      ...(wordCount && { wordCount }),
      ...(readTime && {
        timeRequired: `PT${readTime.replace(/\D/g, '')}M`,
      }),
    };

    script.textContent = JSON.stringify(schema);

    // Remove existing script if present
    const existing = document.getElementById('article-schema');
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('article-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, slug, excerpt, image, datePublished, dateModified, categories, readTime, content]);

  return null;
};
