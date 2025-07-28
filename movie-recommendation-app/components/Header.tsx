import styled from 'styled-components';

const HeaderBar = styled.header`
  width: 100%;
  background: ${({ theme }) => (theme as any).colors.primary};
  color: #fff;
  padding: 20px 0;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;
const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  text-align: center;
  letter-spacing: 1px;
`;
const Nav = styled.nav`
  margin-top: 8px;
  text-align: center;
`;

export default function Header() {
  return (
    <HeaderBar>
      <Title>🎬 Movie Recommendation App</Title>
      <Nav>
        {/* Add nav links here if needed */}
      </Nav>
    </HeaderBar>
  );
} 