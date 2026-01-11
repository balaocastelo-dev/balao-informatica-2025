import React, { createContext, useContext, useState, ReactNode } from 'react';
import { VoiceCallModal } from '@/components/VoiceCallModal';

interface VoiceAgentContextType {
  isOpen: boolean;
  openAgent: () => void;
  closeAgent: () => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextType | undefined>(undefined);

export const VoiceAgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openAgent = () => setIsOpen(true);
  const closeAgent = () => setIsOpen(false);

  return (
    <VoiceAgentContext.Provider value={{ isOpen, openAgent, closeAgent }}>
      {children}
      <VoiceCallModal isOpen={isOpen} onClose={closeAgent} />
    </VoiceAgentContext.Provider>
  );
};

export const useVoiceAgent = () => {
  const context = useContext(VoiceAgentContext);
  if (context === undefined) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider');
  }
  return context;
};
