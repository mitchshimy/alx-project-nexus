import { getVideoQuality, getAutoPlayTrailers } from './settings';

export interface VideoPlayerConfig {
  quality: string;
  autoPlay: boolean;
  muted: boolean;
  controls: boolean;
  loop: boolean;
  rel: number;
  modestbranding: number;
  fs: number; // Fullscreen control
  iv_load_policy: number; // Annotations
  cc_load_policy: number; // Closed captions
  color: string; // Video color
  playsinline: number; // iOS inline playback
}

export interface YouTubeQualityOption {
  label: string;
  value: string;
  resolution: string;
  bitrate?: string;
  description: string;
}

export const YOUTUBE_QUALITY_OPTIONS: YouTubeQualityOption[] = [
  {
    label: '4K Ultra HD',
    value: 'hd2160',
    resolution: '3840x2160',
    bitrate: '~45 Mbps',
    description: 'Best quality, highest data usage'
  },
  {
    label: '1440p QHD',
    value: 'hd1440',
    resolution: '2560x1440',
    bitrate: '~20 Mbps',
    description: 'Very high quality'
  },
  {
    label: '1080p Full HD',
    value: 'hd1080',
    resolution: '1920x1080',
    bitrate: '~8 Mbps',
    description: 'High quality, balanced'
  },
  {
    label: '720p HD',
    value: 'hd720',
    resolution: '1280x720',
    bitrate: '~5 Mbps',
    description: 'Good quality, lower data usage'
  },
  {
    label: '480p SD',
    value: 'large',
    resolution: '854x480',
    bitrate: '~2.5 Mbps',
    description: 'Standard quality, minimal data'
  },
  {
    label: '360p SD',
    value: 'medium',
    resolution: '640x360',
    bitrate: '~1.5 Mbps',
    description: 'Low quality, minimal data usage'
  }
];

export const getVideoPlayerConfig = (): VideoPlayerConfig => {
  const quality = getVideoQuality();
  const autoPlay = getAutoPlayTrailers();
  
  return {
    quality,
    autoPlay,
    muted: autoPlay, // Mute autoplay videos to comply with browser policies
    controls: true,
    loop: false,
    rel: 0, // Don't show related videos
    modestbranding: 1, // Hide YouTube branding
    fs: 1, // Allow fullscreen
    iv_load_policy: 3, // Hide annotations
    cc_load_policy: 0, // Don't show closed captions by default
    color: 'white', // White color scheme
    playsinline: 1 // Enable inline playback on iOS
  };
};

export const buildYouTubeEmbedUrl = (videoKey: string, config?: Partial<VideoPlayerConfig>): string => {
  const defaultConfig = getVideoPlayerConfig();
  const finalConfig = { ...defaultConfig, ...config };
  
  const params = new URLSearchParams({
    autoplay: finalConfig.autoPlay ? '1' : '0',
    mute: finalConfig.muted ? '1' : '0',
    controls: finalConfig.controls ? '1' : '0',
    loop: finalConfig.loop ? '1' : '0',
    rel: finalConfig.rel.toString(),
    modestbranding: finalConfig.modestbranding.toString(),
    fs: finalConfig.fs.toString(),
    iv_load_policy: finalConfig.iv_load_policy.toString(),
    cc_load_policy: finalConfig.cc_load_policy.toString(),
    color: finalConfig.color,
    playsinline: finalConfig.playsinline.toString(),
    // Enhanced quality parameter
    vq: getQualityParameter(finalConfig.quality),
    // Additional quality controls
    v: getQualityParameter(finalConfig.quality), // Alternative quality parameter
    // Performance optimizations
    enablejsapi: '1', // Enable JavaScript API
    origin: typeof window !== 'undefined' ? window.location.origin : '', // Set origin for security
    widget_referrer: typeof window !== 'undefined' ? window.location.href : '' // Set referrer
  });
  
  return `https://www.youtube.com/embed/${videoKey}?${params.toString()}`;
};

export const getQualityParameter = (quality: string): string => {
  // Enhanced quality mapping with fallbacks
  const qualityMap: { [key: string]: string } = {
    '4k': 'hd2160',
    '1440p': 'hd1440',
    '1080p': 'hd1080',
    '720p': 'hd720',
    '480p': 'large',
    '360p': 'medium',
    'auto': 'hd720' // Default fallback
  };
  
  return qualityMap[quality] || qualityMap['auto'];
};

export const getQualityOption = (quality: string): YouTubeQualityOption | undefined => {
  return YOUTUBE_QUALITY_OPTIONS.find(option => option.value === getQualityParameter(quality));
};

export const shouldAutoPlayTrailer = (): boolean => {
  return getAutoPlayTrailers();
};

export const getPreferredVideoQuality = (): string => {
  return getVideoQuality();
};

// Enhanced function to get video quality display name
export const getQualityDisplayName = (quality: string): string => {
  const qualityOption = getQualityOption(quality);
  return qualityOption ? qualityOption.label : 'HD';
};

// Enhanced function to get quality description
export const getQualityDescription = (quality: string): string => {
  const qualityOption = getQualityOption(quality);
  return qualityOption ? qualityOption.description : 'Standard quality';
};

// Enhanced function to check if user's device supports the selected quality
export const isQualitySupported = (quality: string): boolean => {
  if (typeof window === 'undefined') {
    return true; // Default to supported on server-side
  }
  
  // Enhanced quality support check with network consideration
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const connection = (navigator as any).connection;
  
  // Check network capabilities
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' || 
    connection.effectiveType === '3g'
  );
  
  switch (quality) {
    case '4k':
      return screenWidth >= 3840 || screenHeight >= 2160;
    case '1440p':
      return screenWidth >= 2560 || screenHeight >= 1440;
    case '1080p':
      return screenWidth >= 1920 || screenHeight >= 1080;
    case '720p':
      return screenWidth >= 1280 || screenHeight >= 720;
    case '480p':
      return true; // Always supported
    case '360p':
      return true; // Always supported
    default:
      return true;
  }
};

// Enhanced function to get optimal quality based on device capabilities and network
export const getOptimalQuality = (): string => {
  if (typeof window === 'undefined') {
    return '720p'; // Default quality on server-side
  }
  
  const preferredQuality = getPreferredVideoQuality();
  const connection = (navigator as any).connection;
  
  // Check network conditions
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' || 
    connection.effectiveType === '3g'
  );
  
  const isLimitedData = connection && connection.saveData;
  
  // If slow connection or limited data, downgrade quality
  if (isSlowConnection || isLimitedData) {
    return '480p';
  }
  
  if (isQualitySupported(preferredQuality)) {
    return preferredQuality;
  }
  
  // Fallback to lower quality if preferred quality is not supported
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  
  if (screenWidth >= 2560 || screenHeight >= 1440) {
    return '1440p';
  } else if (screenWidth >= 1920 || screenHeight >= 1080) {
    return '1080p';
  } else if (screenWidth >= 1280 || screenHeight >= 720) {
    return '720p';
  } else {
    return '480p'; // Default fallback
  }
};

// Function to get all available quality options for a device
export const getAvailableQualityOptions = (): YouTubeQualityOption[] => {
  const connection = (navigator as any).connection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' || 
    connection.effectiveType === '3g'
  );
  
  if (isSlowConnection) {
    return YOUTUBE_QUALITY_OPTIONS.filter(option => 
      ['large', 'medium'].includes(option.value)
    );
  }
  
  return YOUTUBE_QUALITY_OPTIONS.filter(option => 
    isQualitySupported(option.value.replace('hd', '').replace('p', '') + 'p')
  );
}; 