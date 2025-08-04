import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { shouldAutoPlayTrailer, buildYouTubeEmbedUrl, getOptimalQuality, getQualityOption } from '@/utils/videoPlayer';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaInfoCircle } from 'react-icons/fa';

interface TrailerPreviewProps {
  videoKey: string;
  movieTitle: string;
  onClose?: () => void;
  autoPlay?: boolean;
}

const PreviewContainer = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 450px;
`;

const VideoIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  font-size: 18px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;



const QualityInfo = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
`;

const QualityTooltip = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 50px;
  left: 10px;
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 11px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 200px;
  z-index: 1001;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(0, 0, 0, 0.95);
  }
`;

export default function TrailerPreview({ 
  videoKey, 
  movieTitle, 
  onClose, 
  autoPlay 
}: TrailerPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentQuality, setCurrentQuality] = useState('720p');
  const [showQualityInfo, setShowQualityInfo] = useState(false);

  useEffect(() => {
    // Get optimal quality based on user settings and device capabilities
    const optimalQuality = getOptimalQuality();
    setCurrentQuality(optimalQuality);
    
    // Show preview after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-play logic based on user settings
    const shouldAutoPlay = autoPlay !== undefined ? autoPlay : shouldAutoPlayTrailer();
    
    if (shouldAutoPlay) {
      setIsPlaying(true);
    }
  }, [autoPlay]);

  useEffect(() => {
    // Auto-close trailer after 30 seconds for testing (can be increased to 2-3 minutes)
    const autoCloseTimer = setTimeout(() => {
      console.log('Auto-closing trailer preview');
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, 30000); // 30 seconds for testing

    return () => {
      clearTimeout(autoCloseTimer);
    };
  }, [onClose]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, you would control the iframe player
    // For now, we'll just toggle the state
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    // In a real implementation, you would control the iframe player
    // For now, we'll just toggle the state
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const getVideoUrl = () => {
    return buildYouTubeEmbedUrl(videoKey, {
      autoPlay: isPlaying,
      muted: isMuted,
      quality: currentQuality
    });
  };

  const getQualityDisplayName = (quality: string): string => {
    const qualityOption = getQualityOption(quality);
    return qualityOption ? qualityOption.label : 'HD';
  };

  const getQualityDetails = () => {
    const qualityOption = getQualityOption(currentQuality);
    if (!qualityOption) return null;
    
    return {
      resolution: qualityOption.resolution,
      bitrate: qualityOption.bitrate
    };
  };

  const qualityDetails = getQualityDetails();

  return (
    <PreviewContainer isVisible={isVisible}>
      <VideoWrapper>
        <VideoIframe
          src={getVideoUrl()}
          title={`${movieTitle} Trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        
        <QualityInfo onClick={() => setShowQualityInfo(!showQualityInfo)}>
          <FaInfoCircle size={12} />
          {getQualityDisplayName(currentQuality)}
        </QualityInfo>
        
        {showQualityInfo && qualityDetails && (
          <QualityTooltip isVisible={showQualityInfo}>
            <div><strong>Resolution:</strong> {qualityDetails.resolution}</div>
            <div><strong>Bitrate:</strong> {qualityDetails.bitrate}</div>
          </QualityTooltip>
        )}
        
        <CloseButton onClick={handleClose}>
          ×
        </CloseButton>
        
        <Controls>
          <ControlButton onClick={handlePlayPause}>
            {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
          </ControlButton>
          
          <ControlButton onClick={handleMuteToggle}>
            {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
          </ControlButton>
        </Controls>
      </VideoWrapper>
    </PreviewContainer>
  );
} 