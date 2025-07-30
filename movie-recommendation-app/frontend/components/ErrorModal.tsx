import React from 'react';
import styled from 'styled-components';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div<{ $isOpen: boolean; $type: string }>`
  background: ${props => {
    switch (props.$type) {
      case 'error':
        return 'linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #1a1a1a 0%, #1a2a1a 100%)';
      default:
        return 'linear-gradient(135deg, #1a1a1a 0%, #1a1a2a 100%)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'error':
        return 'rgba(239, 68, 68, 0.3)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.3)';
      default:
        return 'rgba(59, 130, 246, 0.3)';
    }
  }};
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.9)'};
  transition: all 0.3s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
`;

const Icon = styled.div<{ $type: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 1.5rem;
  background: ${props => {
    switch (props.$type) {
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  }};
  color: white;
  box-shadow: 0 8px 16px ${props => {
    switch (props.$type) {
      case 'error':
        return 'rgba(239, 68, 68, 0.3)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.3)';
      default:
        return 'rgba(59, 130, 246, 0.3)';
    }
  }};
`;

const Title = styled.h2<{ $type: string }>`
  color: ${props => {
    switch (props.$type) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  }};
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Message = styled.p`
  color: #e5e7eb;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const Button = styled.button<{ $type: string }>`
  background: ${props => {
    switch (props.$type) {
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  }};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px ${props => {
      switch (props.$type) {
        case 'error':
          return 'rgba(239, 68, 68, 0.4)';
        case 'warning':
          return 'rgba(245, 158, 11, 0.4)';
        default:
          return 'rgba(59, 130, 246, 0.4)';
      }
    }};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ErrorModal: React.FC<ErrorModalProps> = ({ 
  isOpen, 
  onClose, 
  title = 'Error', 
  message, 
  type = 'error' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent $isOpen={isOpen} $type={type} onClick={(e) => e.stopPropagation()}>
        <Icon $type={type}>
          {getIcon()}
        </Icon>
        <Title $type={type}>{title}</Title>
        <Message>{message}</Message>
        <Button $type={type} onClick={onClose}>
          Got it
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ErrorModal; 