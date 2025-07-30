import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { authAPI, getAuthToken } from '@/utils/api';
import Layout from '@/components/Layout';

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #fff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(0, 212, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #00d4ff;
  font-weight: 600;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #00d4ff 0%, #ff6b35 100%);
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.2);
  }
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const Value = styled.div`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.5rem 0;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #00d4ff;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%);
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
    
    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AuthPrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2rem auto;
  max-width: 500px;
  
  h2 {
    color: #fff;
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  button {
    background: linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%);
    border: none;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2rem auto;
  max-width: 500px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  color: #ff6b6b;
  margin: 2rem auto;
  max-width: 500px;
  backdrop-filter: blur(10px);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%);
  
  &:hover {
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.2);
  border-radius: 12px;
  color: #28a745;
  margin: 1rem 0;
  backdrop-filter: blur(10px);
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.9)'};
  transition: transform 0.3s ease;
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
    color: #fff;
  }
`;

const SubmitButton = styled(Button)`
  flex: 1;
`;

const ErrorText = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const SuccessText = styled.div`
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Edit profile modal state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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
        
        console.log('User profile:', userProfile);
        console.log('User stats:', userStats);
        
        setUser(userProfile);
        setStats(userStats);
      } catch (err: any) {
        console.error('Error loading user data:', err);
        if (err.message.includes('401')) {
          setError('Authentication required. Please sign in again.');
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

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
    setEditFirstName(user?.first_name || '');
    setEditLastName(user?.last_name || '');
    setEditEmail(user?.email || '');
    setEditUsername(user?.username || '');
    setProfileError('');
    setProfileSuccess('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFirstName || !editLastName) {
      setProfileError('First name and last name are required');
      return;
    }
    
    setIsUpdatingProfile(true);
    setProfileError('');
    
    try {
      // Make the actual API call to update profile
      const updatedProfile = await authAPI.updateProfile({
        first_name: editFirstName,
        last_name: editLastName,
        // Note: email and username are read-only in the serializer
        // so we can't update them through this endpoint
      });
      
      // Update local state with the response from the server
      setUser(updatedProfile);
      
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowEditProfileModal(false);
        setProfileSuccess('');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.message?.includes('400')) {
        setProfileError('Invalid data provided. Please check your information.');
      } else if (error.message?.includes('401')) {
        setProfileError('Authentication required. Please sign in again.');
      } else {
        setProfileError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCloseEditProfileModal = () => {
    setShowEditProfileModal(false);
    setEditFirstName('');
    setEditLastName('');
    setEditEmail('');
    setEditUsername('');
    setProfileError('');
    setProfileSuccess('');
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear all errors first
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    setPasswordError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all required fields.');
      return;
    }
    
    if (newPassword.length < 8) {
      setNewPasswordError('New password must be at least 8 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Make the actual API call to change password
      const result = await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      // If result is null, it means there was a validation error
      if (result === null) {
        // Set specific error message for current password
        setCurrentPasswordError('Current password is incorrect. Please try again.');
        return;
      }
      
      setPasswordSuccess('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
      
    } catch (error: any) {
      // Only handle non-validation errors (401, 500, network errors, etc.)
      console.error('Password change failed:', error);
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    setPasswordSuccess('');
  };

  const handlePrivacySettings = () => {
    setMessage('Privacy settings functionality coming soon!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setMessage('Delete account functionality coming soon!');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date string:', dateString);
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.log('Error formatting date:', error, 'Date string:', dateString);
      return 'N/A';
    }
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || user?.email || 'N/A';
  };

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('User data for member since:', {
        date_joined: user.date_joined,
        type: typeof user.date_joined,
        formatted: formatDate(user.date_joined)
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <Title>👤 Profile</Title>
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
        <Title>👤 Profile</Title>
        <LoadingMessage>Loading your profile...</LoadingMessage>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Title>👤 Profile</Title>
        <ErrorMessage>{error}</ErrorMessage>
      </Layout>
    );
  }

  return (
    <Layout>
      <Title>👤 Profile</Title>

      {message && <SuccessMessage>{message}</SuccessMessage>}

      <ProfileCard>
        <SectionTitle>Account Information</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <Label>Full Name</Label>
            <Value>{getDisplayName()}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Email</Label>
            <Value>{user?.email || 'N/A'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Username</Label>
            <Value>{user?.username || 'N/A'}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Member Since</Label>
            <Value>{formatDate(user?.date_joined)}</Value>
          </InfoItem>
        </InfoGrid>
        <Button onClick={handleEditProfile}>Edit Profile</Button>
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
        <ActionButtons>
          <Button onClick={handleChangePassword}>Change Password</Button>
          <DangerButton onClick={handleDeleteAccount}>Delete Account</DangerButton>
        </ActionButtons>
      </ProfileCard>

      <Modal $isOpen={showPasswordModal}>
        <ModalContent $isOpen={showPasswordModal}>
          <ModalTitle>Change Password</ModalTitle>
          <form onSubmit={handlePasswordSubmit}>
            <FormGroup>
              <FormLabel>Current Password</FormLabel>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) setCurrentPasswordError('');
                }}
                required
                disabled={isChangingPassword}
              />
              {currentPasswordError && <ErrorText>{currentPasswordError}</ErrorText>}
              {passwordSuccess && <SuccessText>{passwordSuccess}</SuccessText>}
            </FormGroup>
            <FormGroup>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError('');
                }}
                required
                disabled={isChangingPassword}
              />
              {newPasswordError && <ErrorText>{newPasswordError}</ErrorText>}
            </FormGroup>
            <FormGroup>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                required
                disabled={isChangingPassword}
              />
              {confirmPasswordError && <ErrorText>{confirmPasswordError}</ErrorText>}
            </FormGroup>
            <ButtonGroup>
              <CancelButton onClick={handleClosePasswordModal}>Cancel</CancelButton>
              <SubmitButton type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </SubmitButton>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal $isOpen={showEditProfileModal}>
        <ModalContent $isOpen={showEditProfileModal}>
          <ModalTitle>Edit Profile</ModalTitle>
          <form onSubmit={handleProfileSubmit}>
            <FormGroup>
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="Enter your first name"
                disabled={isUpdatingProfile}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Enter your last name"
                disabled={isUpdatingProfile}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={true}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                Email cannot be changed
              </small>
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={true}
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                Username cannot be changed
              </small>
            </FormGroup>
            
            {profileError && <ErrorText>{profileError}</ErrorText>}
            {profileSuccess && <SuccessText>{profileSuccess}</SuccessText>}
            
            <ButtonGroup>
              <CancelButton onClick={handleCloseEditProfileModal}>Cancel</CancelButton>
              <SubmitButton type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
              </SubmitButton>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>
    </Layout>
  );
} 