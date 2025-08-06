import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import dynamic from 'next/dynamic';


// Create a loading component for the help page
const HelpLoading = () => (
  <div style={{ 
    padding: '2rem', 
    textAlign: 'center',
    color: '#f0f0f0',
    fontSize: '1.2rem'
  }}>
    Loading help...
  </div>
);

// Main help component
function HelpContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleFAQ = (section: string, index: number) => {
    const key = `${section}-${index}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFAQ = Object.entries(faqData).reduce((acc, [section, items]) => {
    if (searchTerm === '') {
      acc[section] = items;
    } else {
      const filtered = items.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const questionMatch = item.question.toLowerCase().includes(searchLower);
        const answerMatch = typeof item.answer === 'string' && 
          item.answer.toLowerCase().includes(searchLower);
        const sectionMatch = section.toLowerCase().includes(searchLower);
        
        return questionMatch || answerMatch || sectionMatch;
      });
      if (filtered.length > 0) {
        acc[section] = filtered;
      }
    }
    return acc;
  }, {} as { [key: string]: FAQItem[] });

  // Auto-expand sections that have search results
  useEffect(() => {
    if (searchTerm !== '') {
      const newOpenItems: { [key: string]: boolean } = {};
      Object.entries(filteredFAQ).forEach(([section, items]) => {
        items.forEach((_, index) => {
          newOpenItems[`${section}-${index}`] = true;
        });
      });
      setOpenItems(newOpenItems);
    }
  }, [searchTerm, filteredFAQ]);

  // Calculate total search results
  const totalResults = Object.values(filteredFAQ).reduce((sum, items) => sum + items.length, 0);
  const hasResults = Object.keys(filteredFAQ).length > 0;

  const clearSearch = () => {
    setSearchTerm('');
    setOpenItems({});
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <>
      <HelpContainer>
        <HelpHeader>
          <h1>Help Center</h1>
          <p>
            Find answers to common questions and learn how to make the most of SHIMY. 
            Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
        </HelpHeader>

        <SearchContainer>
          <SearchInputContainer>
            <SearchInput
              type="text"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {searchTerm && (
              <ClearButton onClick={clearSearch}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </ClearButton>
            )}
          </SearchInputContainer>
          {searchTerm && (
            <SearchResults>
              {hasResults ? (
                `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`
              ) : (
                <NoResults>
                  <h3>No results found</h3>
                  <p>We couldn&apos;t find any help articles matching &quot;{searchTerm}&quot;. Try different keywords or browse our categories below.</p>
                  <SearchSuggestions>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginBottom: '0.5rem', width: '100%' }}>
                      Popular searches:
                    </span>
                    {searchSuggestions.slice(0, 8).map(suggestion => (
                      <SuggestionTag
                        key={suggestion}
                        onClick={() => setSearchTerm(suggestion)}
                      >
                        {suggestion}
                      </SuggestionTag>
                    ))}
                  </SearchSuggestions>
                  <button onClick={clearSearch}>Clear Search</button>
                </NoResults>
              )}
            </SearchResults>
          )}
          {!searchTerm && (
            <SearchResults>
              <SearchSuggestions>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', marginBottom: '0.5rem', width: '100%' }}>
                  Try searching for:
                </span>
                {searchSuggestions.slice(0, 6).map(suggestion => (
                  <SuggestionTag
                    key={suggestion}
                    onClick={() => setSearchTerm(suggestion)}
                  >
                    {suggestion}
                  </SuggestionTag>
                ))}
              </SearchSuggestions>
            </SearchResults>
          )}
        </SearchContainer>

        <QuickActions>
          <ActionCard onClick={() => window.location.href = '/contact'}>
            <h3>Contact Support</h3>
            <p>Get in touch with our support team for personalized help</p>
          </ActionCard>
          <ActionCard onClick={() => window.location.href = '/feedback'}>
            <h3>Send Feedback</h3>
            <p>Share your suggestions and help us improve SHIMY</p>
          </ActionCard>
        </QuickActions>

        {Object.entries(filteredFAQ).map(([section, items]) => (
          <FAQSection key={section}>
            <SectionTitle>
              {section}
            </SectionTitle>
            {items.map((item, index) => (
              <FAQItem key={index} isOpen={openItems[`${section}-${index}`]}>
                <FAQQuestion
                  isOpen={openItems[`${section}-${index}`]}
                  onClick={() => toggleFAQ(section, index)}
                >
                  {item.question}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </FAQQuestion>
                <FAQAnswer isOpen={openItems[`${section}-${index}`]}>
                  {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
                </FAQAnswer>
              </FAQItem>
            ))}
          </FAQSection>
        ))}

        <ContactSection>
          <h2>Still Need Help?</h2>
          <p>
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <Link href="/contact">Contact Support</Link>
        </ContactSection>
      </HelpContainer>
    </>
  );
}

const HelpContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const HelpHeader = styled.div`
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

const SearchContainer = styled.div`
  margin-bottom: 3rem;
  position: relative;
`;

const SearchResults = styled.div`
  margin-top: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  text-align: center;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  
  h3 {
    color: #00D4FF;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  button {
    background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
    }
  }
`;

const SearchSuggestions = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
`;

const SuggestionTag = styled.button`
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00D4FF;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(0, 212, 255, 0.2);
    transform: translateY(-1px);
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  padding-right: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #FFFFFF;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #00D4FF;
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #00D4FF;
    background: rgba(0, 212, 255, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FAQSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: #00D4FF;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FAQItem = styled.div<{ isOpen: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(0, 212, 255, 0.3);
  }
`;

const FAQQuestion = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: 1.5rem;
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const FAQAnswer = styled.div<{ isOpen: boolean }>`
  padding: ${({ isOpen }) => isOpen ? '0 1.5rem 1.5rem' : '0 1.5rem'};
  max-height: ${({ isOpen }) => isOpen ? '500px' : '0'};
  opacity: ${({ isOpen }) => isOpen ? '1' : '0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const ActionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    border-color: #00D4FF;
    transform: translateY(-2px);
  }

  h3 {
    color: #00D4FF;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
  }
`;

const ContactSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;

  h2 {
    color: #00D4FF;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.5rem;
  }

  a {
    color: #00D4FF;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const searchSuggestions = [
  'account', 'password', 'login', 'sign up', 'profile',
  'movies', 'favorites', 'watchlist', 'search',
  'bug', 'error', 'loading', 'slow', 'technical',
  'features', 'rating', 'reviews', 'sharing'
];

const faqData: { [key: string]: FAQItem[] } = {
  'Getting Started': [
    {
      question: 'How do I create an account?',
      answer: 'Click on the "Sign Up" button in the top right corner. Fill in your email, username, and password to create your account. You can then start exploring movies and building your watchlist.'
    },
    {
      question: 'How do I search for movies?',
      answer: 'Use the search bar at the top of the page. You can search by movie title, actor, or director. The search will show results from our extensive movie database.'
    },
    {
      question: 'How do I add movies to my favorites?',
      answer: 'When viewing a movie, click the heart icon to add it to your favorites. You can access all your favorite movies from the "Favorites" section in your account.'
    }
  ],
  'Account & Settings': [
    {
      question: 'How do I change my password?',
      answer: 'Go to your Profile page and click on "Change Password". Enter your current password and your new password twice to confirm the change.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Navigate to your Profile page and click "Edit Profile". You can update your username, email, and other personal information.'
    },
    {
             question: 'How do I delete my account?',
       answer: 'To delete your account, head over to Account page and click on &quot;Delete Account&quot;. It is sad to see you go.'
    }
  ],
  'Technical Issues': [
    {
      question: 'The website is loading slowly. What should I do?',
      answer: 'Try refreshing the page or clearing your browser cache. If the issue persists, check your internet connection or try accessing the site from a different browser.'
    },
    {
      question: 'I can\'t log in to my account. What should I do?',
      answer: 'First, make sure you\'re using the correct email and password. If you\'ve forgotten your password, use the "Forgot Password" link on the login page to reset it.'
    },
    {
      question: 'The movie information is not loading. What\'s wrong?',
      answer: 'This could be due to a temporary issue with our data provider. Try refreshing the page or check back in a few minutes. If the problem continues, contact our support team.'
    }
  ],
  'Features & Functionality': [
    {
      question: 'How do I rate movies?',
      answer: 'When viewing a movie, you can rate it by clicking on the star rating system. You can also leave a review to share your thoughts about the movie.'
    },
    {
      question: 'How do I create a watchlist?',
      answer: 'Click the "Add to Watchlist" button on any movie page to add it to your watchlist. You can view and manage your watchlist from your account page.'
    },
    {
      question: 'Can I share my favorite movies with friends?',
      answer: 'Currently, you can share movie links directly. We\'re working on adding social features to make sharing even easier in future updates.'
    }
  ]
};

// Export the help page with dynamic loading
export default dynamic(() => Promise.resolve(HelpContent), {
  ssr: true,
  loading: HelpLoading
});