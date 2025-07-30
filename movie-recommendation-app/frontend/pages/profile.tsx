import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { authAPI, getAuthToken } from '@/utils/api';
import Layout from '@/components/Layout';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #f0f0f0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e50914;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const Value = styled.div`
  color: #f0f0f0;
  font-size: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.4rem;
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
  min-height: 44px; // Better touch target

  &:hover {
    background: #b2070e;
  }

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.8rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.6rem;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem;
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #e50914;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const StatLabel = styled.div`
  color: #ccc;
  font-size: 0.9rem;
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.2rem;
`;

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        const [userProfile, userStats] = await Promise.all([
          authAPI.getProfile(),
          authAPI.getUserStats()
        ]);
        
        setUser(userProfile);
        setStats(userStats);
      } catch (err: any) {
        console.error('Error loading user data:', err);
        if (err.message.includes('401')) {
          setError('Authentication required');
        } else {
          setError('Failed to load profile data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSignIn = () => {
    router.push('/signin');
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <h1>👤 Profile</h1>
        <AuthPrompt>
          <h2>Sign in to view your profile</h2>
          <p>You need to be signed in to access your profile and account settings.</p>
          <button onClick={handleSignIn}>Sign In</button>
        </AuthPrompt>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <h1>👤 Profile</h1>
        <LoadingMessage>Loading your profile...</LoadingMessage>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <h1>👤 Profile</h1>
        <div style={{ color: '#e74c3c', textAlign: 'center', padding: '2rem' }}>
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>👤 Profile</h1>

      <ProfileCard>
        <SectionTitle>Account Information</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <Label>Full Name</Label>
            <Value>{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || 'N/A'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Email</Label>
            <Value>{user?.email || 'N/A'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Member Since</Label>
            <Value>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Username</Label>
            <Value>{user?.username || 'N/A'}</Value>
          </InfoItem>
        </InfoGrid>
        <Button>Edit Profile</Button>
      </ProfileCard>

      <ProfileCard>
        <SectionTitle>Your Activity</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatNumber>{stats?.favorites_count || 0}</StatNumber>
            <StatLabel>Favorites</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats?.watchlist_count || 0}</StatNumber>
            <StatLabel>Watchlist</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats?.ratings_count || 0}</StatNumber>
            <StatLabel>Reviews</StatLabel>
          </StatCard>
        </StatsGrid>
      </ProfileCard>

      <ProfileCard>
        <SectionTitle>Account Actions</SectionTitle>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button>Change Password</Button>
          <Button>Privacy Settings</Button>
          <Button style={{ background: '#dc3545' }}>Delete Account</Button>
        </div>
      </ProfileCard>
    </Layout>
  );
} 