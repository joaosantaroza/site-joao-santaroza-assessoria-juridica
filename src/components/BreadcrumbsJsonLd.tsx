import { useEffect } from "react";

const CANONICAL_DOMAIN = "https://joaosantarozaadvocacia.com.br";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * Component that injects JSON-LD structured data for breadcrumbs
 * Helps Google display breadcrumb trails in search results
 */
export function BreadcrumbsJsonLd({ items }: BreadcrumbsJsonLdProps) {
  useEffect(() => {
    const scriptId = "breadcrumbs-jsonld";
    
    // Remove existing script if present
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Build breadcrumb list
    const itemListElement = items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${CANONICAL_DOMAIN}${item.path}`,
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };

    // Create and inject script
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items]);

  return null;
}
