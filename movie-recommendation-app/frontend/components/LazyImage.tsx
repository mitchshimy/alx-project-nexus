import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageContainer = styled.div<{ isLoaded: boolean }>`
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #1E1E1E 25%, #2A2A2A 50%, #1E1E1E 75%);
  background-size: 200% 100%;
  animation: ${props => !props.isLoaded ? 'shimmer 1s infinite' : 'none'}; // Reduced from 1.5s to 1s
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const StyledImage = styled.img<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${props => props.isLoaded ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
`;

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px 0px', // Reduced from 50px to 100px for better performance
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoaded(true);
    onError?.();
  };

  return (
    <ImageContainer
      ref={containerRef}
      isLoaded={isLoaded}
      className={className}
      style={{ width, height }}
    >
      {isInView && (
        <StyledImage
          ref={imageRef}
          src={src}
          alt={alt}
          isLoaded={isLoaded}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </ImageContainer>
  );
};

export default LazyImage; 