import { useState } from 'react';

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
};

/**
 * Loads an image via the proxy edge function to bypass CORS,
 * then creates an object URL that can be used with Canvas.
 */
const loadImageViaProxy = async (imageUrl: string): Promise<HTMLImageElement> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/proxy-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch image via proxy');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = objectUrl;
  });
};

export const useInstagramShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const shareToStories = async (postTitle: string, imageUrl: string, siteUrl?: string) => {
    setIsSharing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      canvas.width = 1080;
      canvas.height = 1920;

      // Load image via proxy to avoid CORS
      const img = await loadImageViaProxy(imageUrl);

      // Black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image centered
      const aspectRatio = img.width / img.height;
      const drawWidth = 1080;
      const drawHeight = 1080 / aspectRatio;
      const drawY = (1920 - drawHeight) / 2;
      ctx.drawImage(img, 0, drawY, drawWidth, drawHeight);

      // Dark gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      wrapText(ctx, postTitle, 540, 1400, 900, 100);

      // Site name
      ctx.font = '40px Arial';
      ctx.fillStyle = '#C9A84C';
      ctx.fillText('João Santaroza Advocacia', 540, 1700);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/jpeg',
          0.9
        )
      );
      const file = new File([blob], 'story.jpg', { type: 'image/jpeg' });

      // Try native share
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: postTitle,
          text: postTitle,
        });
        return { success: true, method: 'native' as const };
      }

      // Fallback: download the image
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `story-${Date.now()}.jpg`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      // Copy URL and open Instagram
      if (siteUrl) {
        await navigator.clipboard.writeText(siteUrl).catch(() => {});
      }
      setTimeout(() => {
        window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
      }, 500);

      return { success: true, method: 'fallback' as const };
    } catch (error) {
      console.error('Erro ao gerar Story:', error);
      return { success: false, method: 'fallback' as const };
    } finally {
      setIsSharing(false);
    }
  };

  return { shareToStories, isSharing };
};
