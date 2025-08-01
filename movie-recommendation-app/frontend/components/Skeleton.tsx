import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

export const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 8px;
`;

export const SkeletonPoster = styled(SkeletonBase)`
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 12px;
`;

export const SkeletonTitle = styled(SkeletonBase)`
  height: 24px;
  width: 80%;
  margin-bottom: 8px;
`;

export const SkeletonText = styled(SkeletonBase)`
  height: 16px;
  width: 60%;
  margin-bottom: 4px;
`;

export const SkeletonCard = styled.div`
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 16px;
`;

export const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.8rem;
  }
`;

export const SkeletonHero = styled.div`
  height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: ${shimmer} 1.5s infinite;
    opacity: 0.1;
  }
`;

export const SkeletonMovieCard = () => (
  <SkeletonCard>
    <SkeletonPoster />
    <div style={{ padding: '12px 0' }}>
      <SkeletonTitle />
      <SkeletonText />
      <SkeletonText style={{ width: '40%' }} />
    </div>
  </SkeletonCard>
);

export const SkeletonMovieGrid = () => (
  <SkeletonGrid>
    {Array.from({ length: 12 }).map((_, index) => (
      <SkeletonMovieCard key={index} />
    ))}
  </SkeletonGrid>
);