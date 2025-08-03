import { useState } from 'react';
import styled from 'styled-components';
import Layout from '@/components/Layout';
import { showError } from '@/utils/api';

const FeedbackContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const FeedbackHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1rem;
    line-height: 1.6;
  }
`;

const FeedbackForm = styled.form`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #FFFFFF;
    font-weight: 500;
    font-size: 0.95rem;
  }

  input, textarea, select {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #FFFFFF;
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
      outline: none;
      border-color: #00D4FF;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const RatingButton = styled.button<{ isSelected: boolean }>`
  background: ${({ isSelected }) => isSelected ? '#00D4FF' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${({ isSelected }) => isSelected ? '#00D4FF' : 'rgba(255, 255, 255, 0.2)'};
  color: ${({ isSelected }) => isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;

  &:hover {
    background: ${({ isSelected }) => isSelected ? '#00D4FF' : 'rgba(255, 255, 255, 0.2)'};
    border-color: #00D4FF;
  }
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #22C55E;
  text-align: center;
  margin-bottom: 1rem;
`;

const FeedbackTypes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const TypeCard = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) => isSelected ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ isSelected }) => isSelected ? '#00D4FF' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: #00D4FF;
    transform: translateY(-2px);
  }

  h3 {
    color: ${({ isSelected }) => isSelected ? '#00D4FF' : '#FFFFFF'};
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
`;

const FeatureRequestSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const FeatureItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }

  label {
    margin: 0;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }
`;

const feedbackTypes = [
  {
    id: 'bug',
    title: 'Bug Report',
    description: 'Report a problem or issue you encountered'
  },
  {
    id: 'feature',
    title: 'Feature Request',
    description: 'Suggest a new feature or improvement'
  },
  {
    id: 'improvement',
    title: 'General Improvement',
    description: 'Share ideas to make SHIMY better'
  },
  {
    id: 'praise',
    title: 'Praise',
    description: 'Tell us what you love about SHIMY'
  }
];

const featureRequests = [
  'Dark/Light theme toggle',
  'Movie recommendations based on watch history',
  'Social features (share lists with friends)',
  'Watch party functionality',
  'Mobile app',
  'Offline movie information',
  'Advanced search filters',
  'Movie reviews and ratings',
  'Personal movie statistics',
  'Export watchlist to other platforms'
];

export default function Feedback({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    subject: '',
    description: '',
    rating: 0,
    features: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type
    }));
  };

  const handleRatingSelect = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - in a real app, you'd send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just show success
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        type: '',
        subject: '',
        description: '',
        rating: 0,
        features: []
      });

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      showError('Error', 'Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FeedbackContainer>
        <FeedbackHeader>
          <h1>Send Feedback</h1>
          <p>
            Your feedback helps us make SHIMY better! Share your thoughts, report issues, 
            or suggest new features. We read every piece of feedback.
          </p>
        </FeedbackHeader>

        {showSuccess && (
          <SuccessMessage>
            Thank you for your feedback! We appreciate your input and will review it carefully.
          </SuccessMessage>
        )}

        <FeedbackForm onSubmit={handleSubmit}>
          <FormGroup>
            <label>What type of feedback is this? *</label>
            <FeedbackTypes>
              {feedbackTypes.map(type => (
                <TypeCard
                  key={type.id}
                  isSelected={formData.type === type.id}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <h3>{type.title}</h3>
                  <p>{type.description}</p>
                </TypeCard>
              ))}
            </FeedbackTypes>
          </FormGroup>

          <Row>
            <FormGroup>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name (optional)"
              />
            </FormGroup>
            <FormGroup>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email (optional)"
              />
            </FormGroup>
          </Row>

          <FormGroup>
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              placeholder="Brief description of your feedback"
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Please provide detailed information about your feedback..."
            />
          </FormGroup>

          <FormGroup>
            <label>How would you rate your overall experience with SHIMY?</label>
            <RatingContainer>
              {[1, 2, 3, 4, 5].map(rating => (
                <RatingButton
                  key={rating}
                  type="button"
                  isSelected={formData.rating === rating}
                  onClick={() => handleRatingSelect(rating)}
                >
                  {rating}
                </RatingButton>
              ))}
            </RatingContainer>
          </FormGroup>

          {formData.type === 'feature' && (
            <FeatureRequestSection>
              <FormGroup>
                <label>Which features would you like to see? (Select all that apply)</label>
                <FeatureList>
                  {featureRequests.map(feature => (
                    <FeatureItem key={feature}>
                      <input
                        type="checkbox"
                        id={feature}
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      <label htmlFor={feature}>{feature}</label>
                    </FeatureItem>
                  ))}
                </FeatureList>
              </FormGroup>
            </FeatureRequestSection>
          )}

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </SubmitButton>
        </FeedbackForm>
      </FeedbackContainer>
    </>
  );
} 