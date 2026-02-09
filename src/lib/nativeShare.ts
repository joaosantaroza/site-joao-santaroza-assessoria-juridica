/**
 * Shares content using the native Web Share API when available (mobile),
 * with fallback to clipboard copy + redirect for desktop.
 */
export const nativeShareWithImage = async (
  title: string,
  url: string,
  imageUrl?: string,
  fallbackRedirectUrl?: string
): Promise<{ method: 'native' | 'fallback'; success: boolean }> => {
  // Try native share with file (works on mobile)
  if (navigator.share && imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "post-cover.jpg", { type: "image/jpeg" });

      // Check if sharing files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: `Confira: ${title}\n${url}`,
        });
        return { method: 'native', success: true };
      }
    } catch (error: any) {
      // User cancelled or error - fall through to fallback
      if (error?.name === 'AbortError') {
        return { method: 'native', success: false };
      }
    }
  }

  // Try native share without file
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `Confira: ${title}`,
        url,
      });
      return { method: 'native', success: true };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { method: 'native', success: false };
      }
    }
  }

  // Fallback: copy link + open redirect
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // ignore
  }

  if (fallbackRedirectUrl) {
    setTimeout(() => {
      window.open(fallbackRedirectUrl, '_blank', 'noopener,noreferrer');
    }, 300);
  }

  return { method: 'fallback', success: true };
};
