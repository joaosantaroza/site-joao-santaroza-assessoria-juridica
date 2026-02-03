import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

const PLACEHOLDER = '/placeholder.svg';

/**
 * Optimized image component with:
 * - Lazy loading
 * - Async decoding
 * - Fallback on error
 * - Aspect ratio control
 * - Accessibility attributes
 */
export const OptimizedImage = ({
  src,
  alt,
  fallback = PLACEHOLDER,
  aspectRatio = 'auto',
  className,
  ...props
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  const handleError = () => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio])}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  );
};
