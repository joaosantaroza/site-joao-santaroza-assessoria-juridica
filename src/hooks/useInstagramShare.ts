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

// Brand colors from design system
const BRAND = {
  navy: '#041E42',
  sand: '#EDE8DF',
  bronze: '#B8945A',
  white: '#FFFFFF',
  fontFamily: 'Montserrat, Arial, sans-serif',
};

/**
 * Preloads Montserrat font for Canvas rendering.
 */
const loadFont = async () => {
  try {
    const font = new FontFace('Montserrat', 'url(https://fonts.gstatic.com/s/montserrat/v29/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2)');
    await font.load();
    document.fonts.add(font);
  } catch {
    // Fallback to Arial if font fails to load
  }
};

export const useInstagramShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const shareToStories = async (postTitle: string, imageUrl: string, siteUrl?: string) => {
    setIsSharing(true);

    try {
      // Load brand font
      await loadFont();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      canvas.width = 1080;
      canvas.height = 1920;

      // Load image via proxy to avoid CORS
      const img = await loadImageViaProxy(imageUrl);

      // Navy background (brand primary)
      ctx.fillStyle = BRAND.navy;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top accent bar (bronze)
      ctx.fillStyle = BRAND.bronze;
      ctx.fillRect(0, 0, canvas.width, 8);

      // Draw image with rounded card effect area
      const cardMargin = 60;
      const cardTop = 200;
      const cardWidth = canvas.width - cardMargin * 2;
      const aspectRatio = img.width / img.height;
      const cardHeight = Math.min(cardWidth / aspectRatio, 900);

      // Save state before clipping
      ctx.save();

      // Card shadow
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;

      // Draw rounded rectangle clip for image
      const radius = 24;
      ctx.beginPath();
      ctx.moveTo(cardMargin + radius, cardTop);
      ctx.lineTo(cardMargin + cardWidth - radius, cardTop);
      ctx.quadraticCurveTo(cardMargin + cardWidth, cardTop, cardMargin + cardWidth, cardTop + radius);
      ctx.lineTo(cardMargin + cardWidth, cardTop + cardHeight - radius);
      ctx.quadraticCurveTo(cardMargin + cardWidth, cardTop + cardHeight, cardMargin + cardWidth - radius, cardTop + cardHeight);
      ctx.lineTo(cardMargin + radius, cardTop + cardHeight);
      ctx.quadraticCurveTo(cardMargin, cardTop + cardHeight, cardMargin, cardTop + cardHeight - radius);
      ctx.lineTo(cardMargin, cardTop + radius);
      ctx.quadraticCurveTo(cardMargin, cardTop, cardMargin + radius, cardTop);
      ctx.closePath();
      ctx.clip();

      // Draw image filling the card
      const imgDrawWidth = cardWidth;
      const imgDrawHeight = cardWidth / aspectRatio;
      const imgOffsetY = cardTop + (cardHeight - imgDrawHeight) / 2;
      ctx.drawImage(img, cardMargin, imgOffsetY, imgDrawWidth, imgDrawHeight);

      // Reset clip and shadow
      ctx.restore();
      ctx.save();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Bottom gradient overlay for text readability
      const gradient = ctx.createLinearGradient(0, canvas.height - 700, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(4,30,66,0)');
      gradient.addColorStop(0.3, 'rgba(4,30,66,0.7)');
      gradient.addColorStop(1, 'rgba(4,30,66,1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 700, canvas.width, 700);

      // Decorative bronze line before title
      ctx.fillStyle = BRAND.bronze;
      ctx.fillRect(canvas.width / 2 - 60, cardTop + cardHeight + 60, 120, 4);

      // Title text
      ctx.fillStyle = BRAND.white;
      ctx.font = `bold 72px ${BRAND.fontFamily}`;
      ctx.textAlign = 'center';
      wrapText(ctx, postTitle.toUpperCase(), 540, cardTop + cardHeight + 140, 900, 90);

      // Bottom section: site name + bronze accent
      ctx.fillStyle = BRAND.bronze;
      ctx.font = `600 36px ${BRAND.fontFamily}`;
      ctx.fillText('JOÃO SANTAROZA', 540, 1740);

      ctx.fillStyle = BRAND.sand;
      ctx.font = `400 28px ${BRAND.fontFamily}`;
      ctx.fillText('ADVOCACIA', 540, 1785);

      // Bottom accent bar
      ctx.fillStyle = BRAND.bronze;
      ctx.fillRect(0, canvas.height - 8, canvas.width, 8);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/jpeg',
          0.95
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
