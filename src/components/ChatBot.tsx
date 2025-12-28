import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import chatbotImage from '@/assets/chatbot-robot.png';

 

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
 

 

 

 

 

  return (
    <>
      {/* Chat Button - Right side with robot image and floating animation */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 transition-transform hover:scale-110 ${isOpen ? 'hidden' : ''}`}
        aria-label="Abrir chat"
      >
        <img 
          src={chatbotImage} 
          alt="Balão Expert" 
          className="w-32 h-32 object-contain animate-float-glow"
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={chatbotImage} 
                alt="Balão Expert" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h3 className="font-semibold">Balão Expert</h3>
                <p className="text-xs opacity-80">Chat desativado</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <p className="text-sm text-muted-foreground">O assistente está temporariamente desativado. Vamos configurá-lo novamente em breve.</p>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <Button disabled className="w-full">Em manutenção</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
