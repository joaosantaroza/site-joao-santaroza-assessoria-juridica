/**
 * Generates a branded Instagram card (1080x1350) with:
 * - Navy background (#041E42)
 * - Article cover image with rounded corners and white border
 * - Bronze accent line
 * - Article title in uppercase
 * - Site URL footer
 */

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const NAVY = '#041E42';
const BRONZE = '#B8945A';
const WHITE = '#FFFFFF';
const SITE_URL = 'joaosantarozaadvocacia.com.br';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateInstagramCard(
  title: string,
  imageBlob: Blob
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Load image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(imageBlob);
  });

  // Image area with rounded corners and white border
  const imgPadding = 50;
  const imgY = 80;
  const imgW = CARD_WIDTH - imgPadding * 2;
  const imgH = 650;
  const borderRadius = 16;
  const borderWidth = 4;

  // White border
  ctx.fillStyle = WHITE;
  drawRoundedRect(ctx, imgPadding - borderWidth, imgY - borderWidth, imgW + borderWidth * 2, imgH + borderWidth * 2, borderRadius + borderWidth);
  ctx.fill();

  // Clip and draw image
  ctx.save();
  drawRoundedRect(ctx, imgPadding, imgY, imgW, imgH, borderRadius);
  ctx.clip();
  
  // Cover fit
  const imgRatio = img.width / img.height;
  const boxRatio = imgW / imgH;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, imgPadding, imgY, imgW, imgH);
  ctx.restore();

  URL.revokeObjectURL(img.src);

  // Bronze accent line
  const lineY = imgY + imgH + 50;
  const lineW = 60;
  ctx.fillStyle = BRONZE;
  ctx.fillRect((CARD_WIDTH - lineW) / 2, lineY, lineW, 4);

  // Title
  const titleY = lineY + 40;
  const titleMaxW = CARD_WIDTH - 100;
  const titleText = title.toUpperCase();
  
  ctx.fillStyle = WHITE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Determine font size based on title length
  let fontSize = 52;
  if (titleText.length > 80) fontSize = 40;
  else if (titleText.length > 50) fontSize = 44;
  
  ctx.font = `700 ${fontSize}px 'Montserrat', 'Arial', sans-serif`;
  const lines = wrapText(ctx, titleText, titleMaxW, fontSize * 1.3);
  
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], CARD_WIDTH / 2, titleY + i * (fontSize * 1.3));
  }

  // Footer - bronze line + site URL
  const footerLineY = CARD_HEIGHT - 80;
  ctx.fillStyle = BRONZE;
  ctx.fillRect((CARD_WIDTH - 40) / 2, footerLineY, 40, 3);

  ctx.fillStyle = BRONZE;
  ctx.font = `400 26px 'Montserrat', 'Arial', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(SITE_URL, CARD_WIDTH / 2, footerLineY + 20);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.92);
  });
}
