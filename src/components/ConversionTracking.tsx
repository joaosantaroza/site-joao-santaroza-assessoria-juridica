import { useCallback } from 'react';

// Event types for conversion tracking
export type ConversionEventType = 
  | 'click_whatsapp'
  | 'click_phone'
  | 'form_submit'
  | 'ebook_download'
  | 'contact_modal_open'
  | 'service_view'
  | 'article_view'
  | 'scroll_to_contact';

interface ConversionEvent {
  event: ConversionEventType;
  category?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Push event to Google Tag Manager dataLayer
 */
const pushToDataLayer = (event: ConversionEvent) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: event.event,
      eventCategory: event.category || 'conversion',
      eventLabel: event.label,
      eventValue: event.value,
      ...event.metadata,
    });
  }
};

/**
 * Hook for tracking conversion events
 * Automatically pushes to GTM dataLayer when available
 */
export const useConversionTracking = () => {
  const trackEvent = useCallback((event: ConversionEvent) => {
    // Push to GTM dataLayer
    pushToDataLayer(event);

    // Console log in development for debugging
    if (import.meta.env.DEV) {
      console.log('[Conversion]', event);
    }
  }, []);

  const trackWhatsAppClick = useCallback((source?: string) => {
    trackEvent({
      event: 'click_whatsapp',
      category: 'engagement',
      label: source || 'unknown',
    });
  }, [trackEvent]);

  const trackPhoneClick = useCallback((source?: string) => {
    trackEvent({
      event: 'click_phone',
      category: 'engagement',
      label: source || 'unknown',
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string) => {
    trackEvent({
      event: 'form_submit',
      category: 'conversion',
      label: formName,
    });
  }, [trackEvent]);

  const trackEbookDownload = useCallback((ebookTitle: string) => {
    trackEvent({
      event: 'ebook_download',
      category: 'conversion',
      label: ebookTitle,
    });
  }, [trackEvent]);

  const trackContactModalOpen = useCallback((source?: string) => {
    trackEvent({
      event: 'contact_modal_open',
      category: 'engagement',
      label: source || 'unknown',
    });
  }, [trackEvent]);

  const trackServiceView = useCallback((serviceName: string) => {
    trackEvent({
      event: 'service_view',
      category: 'engagement',
      label: serviceName,
    });
  }, [trackEvent]);

  const trackArticleView = useCallback((articleSlug: string) => {
    trackEvent({
      event: 'article_view',
      category: 'content',
      label: articleSlug,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackWhatsAppClick,
    trackPhoneClick,
    trackFormSubmit,
    trackEbookDownload,
    trackContactModalOpen,
    trackServiceView,
    trackArticleView,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
