import React from 'react';
import styled, { keyframes } from 'styled-components';



const lightSweep = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(90deg, transparent 0%, rgba(0, 212, 255, 0.1) 50%, transparent 100%),
      radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
    background-size: 200% 100%, 100% 100%, 100% 100%;
    animation: ${lightSweep} 3s ease-in-out infinite;
    pointer-events: none;
  }
`;

const LogoContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const ShimyImage = styled.img`
  width: 90%;
  height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.5));
`;

const ContentOverlay = styled.div`
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    bottom: 15%;
    max-width: 300px;
  }

  @media (max-width: 480px) {
    bottom: 20%;
    max-width: 250px;
  }
`;

const LoadingText = styled.div`
  color: #FFFFFF;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
  margin-bottom: 1rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    width: 150px;
  }

  @media (max-width: 480px) {
    width: 120px;
  }
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #00D4FF 0%, #7C3AED 50%, #EC4899 100%);
  border-radius: 2px;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.6) 50%,
      transparent 100%
    );
    animation: ${lightSweep} 1.5s ease-in-out infinite;
  }
`;

interface SplashScreenProps {
  progress: number;
  status: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ progress, status }) => {
  return (
    <SplashContainer>
      <LogoContainer>
        <picture>
          <source srcSet="/images/shimy.webp" type="image/webp" />
          <ShimyImage src="/images/shimy.png" alt="Shimy Movies" />
        </picture>
      </LogoContainer>
      
      <ContentOverlay>
        <LoadingText>{status}</LoadingText>
        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
      </ContentOverlay>
    </SplashContainer>
  );
};

export default SplashScreen;
