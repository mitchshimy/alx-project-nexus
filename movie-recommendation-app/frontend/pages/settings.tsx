import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { getAuthToken, clearApiCache, performComprehensiveLogout } from '@/utils/api';
import { getSettings, saveSettings, applyTheme, UserSettings } from '@/utils/settings';
import { t, getTranslation, setLanguage } from '@/utils/translations';
import ConfirmationModal from '@/components/ConfirmationModal';
import { 
  YOUTUBE_QUALITY_OPTIONS, 
  getAvailableQualityOptions, 
  getQualityDescription 
} from '@/utils/videoPlayer';

const MainHeading = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #f0f0f0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const Container = styled.div<{ isSidebarOpen?: boolean }>`
  max-width: ${({ isSidebarOpen }) =>
    isSidebarOpen ? 'calc(100vw - 320px)' : '1200px'
  };
  margin: ${({ isSidebarOpen }) =>
    isSidebarOpen ? '20px' : '40px auto'
  };
  padding: 2rem;
  
  @media (max-width: 1024px) {
    max-width: ${({ isSidebarOpen }) =>
      isSidebarOpen ? 'calc(100vw - 300px)' : 'calc(100vw - 100px)'
    };
    padding: 1.5rem;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    margin: 0;
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
  
  @media (min-width: 1920px) {
    max-width: ${({ isSidebarOpen }) =>
      isSidebarOpen ? 'calc(100vw - 400px)' : '1400px'
    };
    margin: ${({ isSidebarOpen }) =>
      isSidebarOpen ? '40px' : '60px auto'
    };
    padding: 3rem;
  }
  
  @media (min-width: 2560px) {
    max-width: ${({ isSidebarOpen }) =>
      isSidebarOpen ? 'calc(100vw - 500px)' : '1600px'
    };
    margin: ${({ isSidebarOpen }) =>
      isSidebarOpen ? '60px' : '80px auto'
    };
    padding: 4rem;
  }
`;



const SettingsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e50914;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 0.6rem;
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 0;
    gap: 0.4rem;
  }
`;

const SettingLabel = styled.div`
  color: #f0f0f0;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const SettingDescription = styled.div`
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 0.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 0.15rem;
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #e50914;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  font-size: 1rem;

  option {
    background: #1a1a2e;
    color: #f0f0f0;
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 0.6rem;
    width: 100%;
    max-width: 300px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.5rem;
    max-width: 100%;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #e50914;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #b2070e;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    width: 100%;
    margin-bottom: 0.5rem;
  }
`;

const AuthPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  
  h2 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  
  button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(40, 167, 69, 0.2);
`;

const SaveButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
`;

const QualityInfoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }
`;

const QualityInfoTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #e50914;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
`;

const QualityInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.8rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }
`;

const QualityInfoItem = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem;
    border-radius: 8px;
  }
`;

const QualityInfoLabel = styled.div`
  color: #f0f0f0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 0.3rem;
  }
`;

const QualityInfoDetails = styled.div`
  color: #ccc;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    gap: 0.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    gap: 0.15rem;
  }
`;

// Create a loading component for the settings page
const SettingsLoading = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center',
    color: '#f0f0f0',
    fontSize: '1.2rem'
  }}>
    Loading settings...
  </div>
);

// Main settings component
function SettingsContent({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [availableQualityOptions, setAvailableQualityOptions] = useState(YOUTUBE_QUALITY_OPTIONS);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    // Initialize settings
    const currentSettings = getSettings();
    setSettings(currentSettings);
    
    // Get available quality options for this device
    setAvailableQualityOptions(getAvailableQualityOptions());
  }, []);

  const handleToggle = (key: keyof UserSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasUnsavedChanges(true);
  };

  const handleSelect = (key: keyof UserSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
    
    // Apply language changes immediately
    if (key === 'language') {
      applyLanguageChange(value);
    }
  };

  const applyLanguageChange = (language: string) => {
    // Use the new setLanguage function to properly persist the language
    setLanguage(language);
    
    // Force a re-render by updating the document title
    document.title = getTranslation('settings.title', language);
  };

  const handleSaveSettings = () => {
    try {
      saveSettings(settings);
      setSaveMessage(t('settings.saved'));
      setHasUnsavedChanges(false);
      
      // Apply settings immediately
      applySettings(settings);
      
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    }
  };

  const applySettings = (newSettings: UserSettings) => {
    // Apply language setting
    applyLanguageChange(newSettings.language);

    // Apply theme setting
    applyTheme(newSettings.theme);

    // Store video quality preference for use in video components
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredVideoQuality', newSettings.quality);
      
      // Store auto-play preference for use in video components
      localStorage.setItem('autoPlayTrailers', newSettings.autoPlay.toString());
    }
  };

  const handleSignIn = async () => {
    // Store current path and redirect to sign-in page
    const { redirectToSignIn } = await import('@/utils/api');
    redirectToSignIn(router.asPath);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Use the comprehensive logout function
    performComprehensiveLogout();
    
    // Force a page reload to clear all cached data and state
    window.location.href = '/';
  };

  const handleClearCache = () => {
    setShowClearCacheModal(true);
  };

  const confirmClearCache = () => {
    // Clear in-memory API cache
    clearApiCache();
    
    // Clear localStorage except for settings and auth tokens
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('userSettings');
      const authToken = localStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('access_token');
      
      localStorage.clear();
      
      // Restore important items
      if (settings) localStorage.setItem('userSettings', settings);
      if (authToken) localStorage.setItem('authToken', authToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (accessToken) localStorage.setItem('access_token', accessToken);
    }
    
    // Clear any other potential cache items
    if (typeof window !== 'undefined') {
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      // Clear any cached images by reloading them
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src) {
          img.src = img.src + '?t=' + Date.now();
        }
      });
    }
    
    setSaveMessage('Cache cleared successfully! All cached data has been removed.');
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
    
    setShowClearCacheModal(false);
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        settings: settings,
        timestamp: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSaveMessage('Data exported successfully!');
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setSaveMessage('Error exporting data. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container isSidebarOpen={isSidebarOpen}>
        <h1>⚙️ {t('settings.title')}</h1>
        <AuthPrompt>
          <h2>{t('auth.signIn')}</h2>
          <p>You need to be signed in to manage your account settings and preferences.</p>
          <button onClick={handleSignIn}>{t('auth.signIn')}</button>
        </AuthPrompt>
      </Container>
    );
  }

  return (
    <Container isSidebarOpen={isSidebarOpen}>
      <MainHeading>⚙️ {t('settings.title')}</MainHeading>

      {saveMessage && <SuccessMessage>{saveMessage}</SuccessMessage>}

      <SettingsCard>
        <SectionTitle>{t('settings.notifications')}</SectionTitle>
        <SettingItem>
          <div>
            <SettingLabel>{t('settings.notifications')}</SettingLabel>
            <SettingDescription>Receive notifications for new releases and updates</SettingDescription>
          </div>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
            <span></span>
          </Toggle>
        </SettingItem>
        <SettingItem>
          <div>
            <SettingLabel>{t('settings.emailUpdates')}</SettingLabel>
            <SettingDescription>Receive weekly email updates about new content</SettingDescription>
          </div>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.emailUpdates}
              onChange={() => handleToggle('emailUpdates')}
            />
            <span></span>
          </Toggle>
        </SettingItem>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Playback</SectionTitle>
        <SettingItem>
          <div>
            <SettingLabel>{t('settings.autoPlay')}</SettingLabel>
            <SettingDescription>
              {settings.autoPlay 
                ? 'Trailers will automatically play when you hover over movie cards for 2 seconds'
                : 'Trailers will only play when you manually click the play button'
              }
            </SettingDescription>
          </div>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.autoPlay}
              onChange={() => handleToggle('autoPlay')}
            />
            <span></span>
          </Toggle>
        </SettingItem>
        <SettingItem>
          <div>
            <SettingLabel>Mobile Auto-Play</SettingLabel>
            <SettingDescription>
              {settings.mobileAutoPlay 
                ? 'Trailers will automatically play when you long-press movie cards for 0.8 seconds'
                : 'Trailers will only play when you manually click the play button on mobile'
              }
            </SettingDescription>
          </div>
          <Toggle>
            <input
              type="checkbox"
              checked={settings.mobileAutoPlay}
              onChange={() => handleToggle('mobileAutoPlay')}
            />
            <span></span>
          </Toggle>
        </SettingItem>
        <SettingItem>
          <div>
            <SettingLabel>{t('settings.videoQuality')}</SettingLabel>
            <SettingDescription>
              {getQualityDescription(settings.quality)}
            </SettingDescription>
          </div>
          <Select
            value={settings.quality}
            onChange={(e) => handleSelect('quality', e.target.value)}
          >
            {availableQualityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.resolution}) - {option.description}
              </option>
            ))}
          </Select>
        </SettingItem>
        
        {/* Quality Information Card */}
        <QualityInfoCard>
          <QualityInfoTitle>Quality Information</QualityInfoTitle>
          <QualityInfoGrid>
            {availableQualityOptions.map((option) => (
              <QualityInfoItem key={option.value}>
                <QualityInfoLabel>{option.label}</QualityInfoLabel>
                <QualityInfoDetails>
                  <span>Resolution: {option.resolution}</span>
                  <span>Bitrate: {option.bitrate}</span>
                </QualityInfoDetails>
              </QualityInfoItem>
            ))}
          </QualityInfoGrid>
        </QualityInfoCard>
      </SettingsCard>
      <SettingsCard>
        <SectionTitle>Preferences</SectionTitle>
        <SettingItem>
          <div>
            <SettingLabel>{t('settings.language')}</SettingLabel>
            <SettingDescription>Interface language (changes apply immediately)</SettingDescription>
          </div>
          <Select
            value={settings.language}
            onChange={(e) => handleSelect('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="de">Deutsch (German)</option>
            <option value="it">Italiano (Italian)</option>
            <option value="pt">Português (Portuguese)</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="ko">한국어 (Korean)</option>
            <option value="zh">中文 (Chinese)</option>
          </Select>
        </SettingItem>
        <SettingItem>
          <div>
            <SettingLabel>{t('settings.theme')}</SettingLabel>
            <SettingDescription>Appearance theme</SettingDescription>
          </div>
          <Select
            value={settings.theme}
            onChange={(e) => handleSelect('theme', e.target.value)}
          >
            <option value="dark">{t('theme.dark')}</option>
            <option value="light">{t('theme.light')}</option>
            <option value="auto">{t('theme.auto')}</option>
          </Select>
        </SettingItem>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Account</SectionTitle>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          flexDirection: 'column'
        }}>
          <Button onClick={handleExportData}>{t('settings.export')}</Button>
          <Button onClick={handleClearCache}>{t('settings.clearCache')}</Button>
          <Button style={{ background: '#dc3545' }} onClick={handleLogout}>{t('settings.logout')}</Button>
        </div>
      </SettingsCard>

      {hasUnsavedChanges && (
        <SettingsCard>
          <SectionTitle>{t('settings.save')}</SectionTitle>
          <p style={{ color: '#ccc', marginBottom: '1rem' }}>
            {t('settings.unsaved')}. Click the button below to save your settings.
          </p>
          <SaveButton onClick={handleSaveSettings}>{t('settings.save')}</SaveButton>
        </SettingsCard>
      )}

      <ConfirmationModal
        isOpen={showClearCacheModal}
        title="Clear Cache"
        message="Are you sure you want to clear the cache? This will remove all stored data and cached API responses."
        confirmText="Clear Cache"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmClearCache}
        onCancel={() => setShowClearCacheModal(false)}
      />

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout? You will be signed out of your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </Container>
  );
}

// Export the settings page with dynamic loading
export default dynamic(() => Promise.resolve(SettingsContent), {
  ssr: true,
  loading: SettingsLoading
});