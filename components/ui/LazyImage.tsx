import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  isBackground?: boolean;
}

const LazyImage = ({ src, alt, className, isBackground = false, ...props }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      setHasError(true);
    };
  }, [src]);
  
  const placeholderClass = `bg-zinc-800/80 animate-pulse`;

  if (isBackground) {
    return (
      <div
        className={`${className} bg-cover bg-center transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url('${src}')` }}
        role="img"
        aria-label={alt}
        {...props}
      >
        {!isLoaded && <div className={`absolute inset-0 ${placeholderClass}`}></div>}
      </div>
    );
  }

  if (hasError) {
    return (
        <div className={`${className} flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs text-center p-2`}>
            <span>{alt || "Kon afbeelding niet laden"}</span>
        </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full transition-opacity duration-500 ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        {...props}
      />
      {!isLoaded && (
        <div className={`absolute inset-0 ${placeholderClass}`}></div>
      )}
    </div>
  );
};

export default LazyImage;