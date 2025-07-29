import { useState } from 'react';
import styled from 'styled-components';

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

const ProfileCard = styled.div`
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
`;

const Value = styled.div`
  color: #f0f0f0;
  font-size: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
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

  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #e50914;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #ccc;
  font-size: 0.9rem;
`;

export default function Profile() {
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2024',
    membership: 'Premium',
    favorites: 24,
    watchlist: 15,
    reviews: 8,
  });

  return (
    <Container>
      <Title>👤 Profile</Title>

      <ProfileCard>
        <SectionTitle>Account Information</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <Label>Full Name</Label>
            <Value>{user.name}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Email</Label>
            <Value>{user.email}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Member Since</Label>
            <Value>{user.joinDate}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Membership</Label>
            <Value>{user.membership}</Value>
          </InfoItem>
        </InfoGrid>
        <Button>Edit Profile</Button>
      </ProfileCard>

      <ProfileCard>
        <SectionTitle>Your Activity</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatNumber>{user.favorites}</StatNumber>
            <StatLabel>Favorites</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{user.watchlist}</StatNumber>
            <StatLabel>Watchlist</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{user.reviews}</StatNumber>
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
    </Container>
  );
} 