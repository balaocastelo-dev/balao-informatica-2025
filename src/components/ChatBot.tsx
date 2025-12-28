import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProducts } from '@/contexts/ProductContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import chatbotImage from '@/assets/chatbot-robot.png';
import type { Product } from '@/types/product';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
const WHATSAPP_NUMBER = '5519987510267';

// Function to render message content with clickable links
const RenderMessageContent = ({ content, onNavigate }: { content: string; onNavigate: (path: string) => void }) => {
  // Regex to detect URLs and internal product links
  const urlRegex = /(https?:\/\/[^\s]+|\/produto\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        // Check if it's an internal product link
        if (part.startsWith('/produto/')) {
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(part);
              }}
              className="text-primary underline hover:text-primary/80 break-all text-left"
            >
              {part}
            </button>
          );
        }
        // Check if it's an external URL
        if (urlRegex.test(part)) {
          urlRegex.lastIndex = 0;
          // Check if it's our site URL
          if (part.includes('balao.info') || part.includes('localhost')) {
            const path = part.replace(/https?:\/\/[^\/]+/, '');
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(path || '/');
                }}
                className="text-primary underline hover:text-primary/80 break-all text-left"
              >
                {part}
              </button>
            );
          }
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'E aí! 👋 Sou o Balão Expert, seu especialista em hardware da Balão da Informática. Me diz o que você precisa — se é montar um PC, encontrar uma peça ou tirar dúvida técnica, tô aqui pra resolver!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [canSuggest, setCanSuggest] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Olá! Vim pelo site da Balão da Informática e gostaria de mais informações.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    try {
      const terms = input.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const filtered = products
        .filter(p => (p.stock || 0) > 0)
        .filter(p => terms.every(t => p.name.toLowerCase().includes(t)))
        .slice(0, 10);
      setSuggestions(filtered);
      setCanSuggest(false);
    } catch {
      setSuggestions([]);
    }
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0), userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          products: products.slice(0, 100).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            stock: p.stock
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar mensagem');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
                return newMessages;
              });
              if (assistantContent.length > 40) {
                setCanSuggest(true);
              }
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      });
      // Remove empty assistant message if error
      if (!assistantContent) {
        setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

      {/* Chat Window - Right side */}
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
                <p className="text-xs opacity-80">Especialista em Hardware</p>
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

          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BA5C] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Prefere falar pelo WhatsApp? Clique aqui!
          </button>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <img 
                      src={chatbotImage} 
                      alt="Balão Expert" 
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap"><RenderMessageContent content={message.content} onNavigate={(path) => { setIsOpen(false); navigate(path); }} /></p>
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-primary rounded-full p-1.5 h-fit">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {!isLoading && suggestions.length > 0 && canSuggest && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setIsOpen(false); navigate(`/produto/${p.id}`); }}
                      className="text-left bg-muted rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-shadow"
                    >
                      <div className="aspect-video bg-background flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="text-xs text-muted-foreground">Sem imagem</div>
                        )}
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-medium line-clamp-2">{p.name}</div>
                        <div className="text-xs text-primary font-bold mt-1">
                          {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-2 justify-start">
                  <img 
                    src={chatbotImage} 
                    alt="Balão Expert" 
                    className="w-8 h-8 object-contain"
                  />
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
