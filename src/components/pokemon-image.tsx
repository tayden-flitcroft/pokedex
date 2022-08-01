'use client';
import Image from 'next/image';
import { useCallback, useState } from 'react';
export function PokemonImage({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const imageSource = failedSource === src ? '/image-not-found.png' : src;
  const loaded = loadedSource === imageSource;
  // Cached images can finish before React attaches the load handler.
  const imageRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth > 0)
        setLoadedSource(imageSource);
    },
    [imageSource],
  );
  return (
    <div className="artwork-frame" aria-busy={!loaded}>
      {!loaded && (
        <span className="artwork-loading" aria-hidden="true">
          <span className="artwork-spinner" />
        </span>
      )}
      <Image
        ref={imageRef}
        className={`pokemon-artwork ${className}`}
        data-loaded={loaded}
        src={imageSource}
        alt={alt}
        width={475}
        height={475}
        sizes="(max-width: 700px) 45vw, (max-width: 1100px) 32vw, 300px"
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoadedSource(imageSource)}
        onError={() => {
          if (imageSource === '/image-not-found.png')
            setLoadedSource(imageSource);
          else setFailedSource(src);
        }}
      />
    </div>
  );
}
