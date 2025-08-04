import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';
import { authAPI } from '../utils/api';

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

const FormCard = styled.div`
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

const InputGroup = styled.div`
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

const SuccessMessage = styled.div`
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const result = await authAPI.register({
        email: formData.email,
        username: formData.email.split('@')[0], // Use email prefix as username
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: firstName,
        last_name: lastName,
      });
      
      // Check if the API returned an error
      if (result && result.error) {
        setError(result.error);
        return;
      }
      
      setSuccess('Account created successfully! Signing you in...');
      
      // Automatically sign in the user after successful registration
      setTimeout(async () => {
        try {
          // Sign in with the newly created account
          const loginResult = await authAPI.login({
            email: formData.email,
            password: formData.password,
          });
          
          // Check if login was successful
          if (loginResult && loginResult.error) {
            console.error('Auto-login error:', loginResult.error);
            // If auto-login fails, redirect to sign in page
            router.push('/signin');
            return;
          }
          
          // Redirect to home page after successful auto-login
          router.push('/');
          // Remove page reload to avoid splash screen
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          // If auto-login fails, redirect to sign in page
          router.push('/signin');
        }
      }, 1500);
      
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      // Handle network errors or other exceptions
      if (err.message.includes('Network error')) {
        setError('Connection error. Please check your internet connection and try again.');
      } else if (err.message.includes('500')) {
        setError('Server error. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
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
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <Container>
      <FormCard>
        <Title>Sign Up</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">Email</Label>
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
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
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
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <SocialButton type="button" disabled={loading}>
          Continue with Google
        </SocialButton>

        <Footer>
          Already have an account? <Link href="/signin">Sign In</Link>
        </Footer>
      </FormCard>
    </Container>
  );
} 