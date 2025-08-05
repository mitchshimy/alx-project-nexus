import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
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
  animation: ${props => !props.isLoaded ? 'shimmer 1.5s infinite' : 'none'};
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const StyledNextImage = styled(Image)<{ isLoaded: boolean }>`
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
        rootMargin: '50px 0px',
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
        <StyledNextImage
          src={src}
          alt={alt}
          width={width || 300}
          height={height || 450}
          isLoaded={isLoaded}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </ImageContainer>
  );
};

export default LazyImage; 