export interface UserSettings {
  notifications: boolean;
  emailUpdates: boolean;
  autoPlay: boolean;
  language: string;
  theme: string;
  quality: string;
}

export const defaultSettings: UserSettings = {
  notifications: true,
  emailUpdates: false,
  autoPlay: true,
  language: 'en',
  theme: 'dark',
  quality: '1080p',
};

export const getSettings = (): UserSettings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  
  try {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      return { ...defaultSettings, ...parsedSettings };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
};

export const getVideoQuality = (): string => {
  const settings = getSettings();
  return settings.quality;
};

export const getAutoPlayTrailers = (): boolean => {
  const settings = getSettings();
  return settings.autoPlay;
};

export const getLanguage = (): string => {
  const settings = getSettings();
  return settings.language || 'en';
};

export const getTheme = (): string => {
  const settings = getSettings();
  return settings.theme;
};

export const saveSettings = (settings: UserSettings): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const applyTheme = (theme: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    // Auto theme - follow system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
};

export const initializeSettings = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  const settings = getSettings();
  applyTheme(settings.theme);
};

export const persistLanguagePreference = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Get current language preference
    const currentLanguage = getLanguage();
    
    // Ensure the language setting is saved in userSettings
    const savedSettings = localStorage.getItem('userSettings');
    let settings = savedSettings ? JSON.parse(savedSettings) : {};
    
    // Only update if language is not already set or is different
    if (!settings.language || settings.language !== currentLanguage) {
      settings.language = currentLanguage;
      localStorage.setItem('userSettings', JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Error persisting language preference:', error);
  }
};

export const resetLanguageToDefault = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const savedSettings = localStorage.getItem('userSettings');
    let settings = savedSettings ? JSON.parse(savedSettings) : {};
    
    // Reset language to English
    settings.language = 'en';
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: 'en' } 
    }));
  } catch (error) {
    console.error('Error resetting language to default:', error);
  }
}; 