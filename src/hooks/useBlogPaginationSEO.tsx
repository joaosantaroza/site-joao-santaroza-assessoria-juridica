import { useEffect } from "react";

const CANONICAL_DOMAIN = "https://joaosantarozaadvocacia.com.br";

interface UseBlogPaginationSEOProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

/**
 * Hook to manage SEO-friendly pagination meta tags
 * Adds rel="canonical", rel="prev", and rel="next" link tags
 */
export function useBlogPaginationSEO({
  currentPage,
  totalPages,
  basePath = "/blog",
}: UseBlogPaginationSEOProps) {
  useEffect(() => {
    // Helper to get page URL
    const getPageUrl = (page: number) => {
      if (page === 1) {
        return `${CANONICAL_DOMAIN}${basePath}`;
      }
      return `${CANONICAL_DOMAIN}${basePath}?pagina=${page}`;
    };

    // Helper to create or update a link tag
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Helper to remove a link tag
    const removeLinkTag = (rel: string) => {
      const link = document.querySelector(`link[rel="${rel}"]`);
      if (link) {
        link.remove();
      }
    };

    // Set canonical URL for current page
    setLinkTag("canonical", getPageUrl(currentPage));

    // Set rel="prev" if not on first page
    if (currentPage > 1) {
      setLinkTag("prev", getPageUrl(currentPage - 1));
    } else {
      removeLinkTag("prev");
    }

    // Set rel="next" if not on last page
    if (currentPage < totalPages && totalPages > 1) {
      setLinkTag("next", getPageUrl(currentPage + 1));
    } else {
      removeLinkTag("next");
    }

    // Cleanup on unmount
    return () => {
      removeLinkTag("prev");
      removeLinkTag("next");
    };
  }, [currentPage, totalPages, basePath]);
}
