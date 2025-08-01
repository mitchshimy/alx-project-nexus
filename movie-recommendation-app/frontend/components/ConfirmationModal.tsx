import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ModalMessage = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'danger' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.$variant === 'danger' ? `
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    
    &:hover {
      background: rgba(239, 68, 68, 0.3);
      border-color: rgba(239, 68, 68, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }
  `}
`;

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'secondary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'secondary',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <ModalMessage>{message}</ModalMessage>
        <ButtonGroup>
          <Button onClick={onCancel}>
            {cancelText}
          </Button>
          <Button $variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
} 