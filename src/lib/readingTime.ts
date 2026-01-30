/**
 * Calculates estimated reading time based on content
 * Average reading speed: 200-250 words per minute (using 200 for more conservative estimate)
 */

const WORDS_PER_MINUTE = 200;

/**
 * Strips HTML tags and returns plain text
 */
function stripHtml(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  // Replace multiple spaces with single space
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

/**
 * Counts words in a text string
 */
function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // Split by whitespace and filter empty strings
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculates reading time from content (HTML or plain text)
 * @param content - The article content (HTML or plain text)
 * @returns Reading time string formatted as "X min"
 */
export function calculateReadingTime(content: string): string {
  if (!content || content.trim().length === 0) {
    return '1 min';
  }

  // Strip HTML if present
  const plainText = stripHtml(content);
  const wordCount = countWords(plainText);
  
  // Calculate minutes, minimum 1 minute
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  
  return `${minutes} min`;
}

/**
 * Returns word count for display purposes
 */
export function getWordCount(content: string): number {
  if (!content || content.trim().length === 0) {
    return 0;
  }
  const plainText = stripHtml(content);
  return countWords(plainText);
}
