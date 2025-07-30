import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { getAuthToken } from '@/utils/api';
import Layout from '@/components/Layout';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #f0f0f0;
  text-align: center;
`;

const SettingsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e50914;
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
`;

const SettingLabel = styled.div`
  color: #f0f0f0;
  font-size: 1rem;
`;

const SettingDescription = styled.div`
  color: #ccc;
  font-size: 0.9rem;
  margin-top: 0.25rem;
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

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    autoPlay: true,
    language: 'en',
    theme: 'dark',
    quality: '1080p',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelect = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <h1>⚙️ Settings</h1>
        <AuthPrompt>
          <h2>Sign in to access settings</h2>
          <p>You need to be signed in to manage your account settings and preferences.</p>
          <button onClick={handleSignIn}>Sign In</button>
        </AuthPrompt>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>⚙️ Settings</h1>

      <SettingsCard>
        <SectionTitle>Notifications</SectionTitle>
        <SettingItem>
          <div>
            <SettingLabel>Push Notifications</SettingLabel>
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
            <SettingLabel>Email Updates</SettingLabel>
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
            <SettingLabel>Auto-play Trailers</SettingLabel>
            <SettingDescription>Automatically play trailers when browsing</SettingDescription>
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
            <SettingLabel>Video Quality</SettingLabel>
            <SettingDescription>Preferred video quality for trailers</SettingDescription>
          </div>
          <Select
            value={settings.quality}
            onChange={(e) => handleSelect('quality', e.target.value)}
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="4k">4K</option>
          </Select>
        </SettingItem>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Preferences</SectionTitle>
        <SettingItem>
          <div>
            <SettingLabel>Language</SettingLabel>
            <SettingDescription>Interface language</SettingDescription>
          </div>
          <Select
            value={settings.language}
            onChange={(e) => handleSelect('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </Select>
        </SettingItem>
        <SettingItem>
          <div>
            <SettingLabel>Theme</SettingLabel>
            <SettingDescription>Appearance theme</SettingDescription>
          </div>
          <Select
            value={settings.theme}
            onChange={(e) => handleSelect('theme', e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </Select>
        </SettingItem>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Account</SectionTitle>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button>Export Data</Button>
          <Button>Clear Cache</Button>
          <Button style={{ background: '#dc3545' }}>Logout</Button>
        </div>
      </SettingsCard>
    </Layout>
  );
} 