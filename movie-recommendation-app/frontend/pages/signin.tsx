import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { authAPI } from '@/utils/api';
import { t } from '@/utils/translations';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 2rem;
    max-width: 350px;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    max-width: 100%;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #f0f0f0;
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
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

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  min-height: 44px; // Better touch target

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #e50914;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
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
  
  @media (max-width: 480px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 1.5rem 0;
  color: #ccc;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }

  span {
    background: rgba(255, 255, 255, 0.05);
    padding: 0 1rem;
    position: relative;
  }
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #f0f0f0;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: #ccc;

  a {
    color: #e50914;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const InlineError = styled.div`
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: left;
`;



export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Reset session expired modal flag when user visits login page
  useEffect(() => {
    // Dispatch an event to reset the session expired modal flag
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resetSessionExpiredModal'));
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailError('');
    setPasswordError('');
    
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });
      
      // If response has error property, it means there was a validation error
      if (response && response.error) {
        const errorText = response.error;
        if (errorText.includes('Invalid credentials') || errorText.includes('Invalid email or password')) {
          setPasswordError('Invalid email or password. Please check your credentials and try again.');
        } else if (errorText.includes('email')) {
          setEmailError('Please enter a valid email address.');
        } else if (errorText.includes('password')) {
          setPasswordError('Password is required.');
        } else if (errorText.includes('User account is disabled')) {
          setError('Your account has been disabled. Please contact support.');
        } else if (errorText.includes('Must include email and password')) {
          setError('Please enter both email and password.');
        } else {
          setPasswordError('Invalid login information. Please check your email and password.');
        }
        return;
      }
      
      // setSuccess('Sign in successful! Redirecting...'); // Removed unused success state
    
      // Check if there's a redirect path stored
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      
      // Redirect to stored path or home page after successful login
      setTimeout(() => {
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin'); // Clear the stored path
          router.push(redirectPath);
        } else {
          router.push('/');
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Only handle non-validation errors (401, 500, network errors, etc.)
      if (err.message?.includes('Network error')) {
        setError('Connection error. Please check your internet connection and try again.');
      } else if (err.message?.includes('500')) {
        setError('Server error. Please try again later.');
      } else if (err.message?.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else {
        setError('An error occurred during sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear specific field errors when user starts typing
    if (e.target.name === 'email' && emailError) {
      setEmailError('');
    } else if (e.target.name === 'password' && passwordError) {
      setPasswordError('');
    }
    // Clear general error when user starts typing
    if (error) setError('');
  };

  return (
    <Container>
      <FormContainer>
        <Title>{t('auth.signIn')}</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {emailError && <InlineError>{emailError}</InlineError>}
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {passwordError && <InlineError>{passwordError}</InlineError>}
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </Form>

        <Footer>
          {t('auth.noAccount')} <Link href="/signup">{t('auth.signUp')}</Link>
        </Footer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </FormContainer>
    </Container>
  );
} 