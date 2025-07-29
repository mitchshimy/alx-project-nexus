import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const DURATION = 1000;
const FADE_DURATION = 500;

const fadeOutAnimation = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

// ✅ Use a transient prop: $fadeOut
const SplashContainer = styled.div<{ $fadeOut: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${({ $fadeOut }) => $fadeOut && fadeOutAnimation} ${FADE_DURATION}ms ease-out forwards;
`;

const Logo = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5rem;
`;

const LoadingBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: 0;
  background: #00d4ff;
  animation: load ${DURATION}ms ease-in-out forwards;

  @keyframes load {
    0% { width: 0; }
    100% { width: 100%; }
  }
`;

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);
  const timerStarted = useRef(false);

  useEffect(() => {
    if (timerStarted.current) return;
    timerStarted.current = true;

    const splashTimer = setTimeout(() => {
      setFade(true);
    }, DURATION);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleAnimationEnd = () => {
    if (fade) onDone();
  };

  return (
    <SplashContainer $fadeOut={fade} onAnimationEnd={handleAnimationEnd}>
      <Logo>SHIMY</Logo>
      <LoadingBar>
        <Progress />
      </LoadingBar>
    </SplashContainer>
  );
}
