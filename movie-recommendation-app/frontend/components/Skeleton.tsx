import styled from 'styled-components';

export const Skeleton = styled.div`
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export const SkeletonPoster = styled(Skeleton)`
  width: 100%;
  aspect-ratio: 2/3;
`;

export const SkeletonText = styled(Skeleton)<{ width?: string }>`
  height: 1rem;
  width: ${props => props.width || '100%'};
  margin-bottom: 0.5rem;
`;

export const SkeletonTitle = styled(SkeletonText)`
  height: 2rem;
  margin-bottom: 1rem;
`;