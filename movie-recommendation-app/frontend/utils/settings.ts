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
  return settings.language;
};

export const getTheme = (): string => {
  const settings = getSettings();
  return settings.theme;
};

export const saveSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const applyTheme = (theme: string): void => {
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
  const settings = getSettings();
  applyTheme(settings.theme);
}; 