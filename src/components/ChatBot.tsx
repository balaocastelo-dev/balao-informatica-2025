import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import chatbotImage from '@/assets/chatbot-robot.png';
import { useProducts } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types/product';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
const STORAGE_KEY = 'balao-chat-messages';
const STORAGE_SESSION = 'balao-chat-session';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Message[] = JSON.parse(stored);
        setMessages(parsed);
        return;
      } catch {}
    }
    setMessages([
      {
        role: 'assistant',
        content:
          'E aí! 👋 Sou o BalãoBot Expert, especialista em vendas de tecnologia da Balão da Informática. Me diz pra que você precisa — jogos, trabalho, estudo — e seu orçamento aproximado. Vou buscar em nosso estoque e te mostrar até 10 opções com link, foto e preço.'
      }
    ]);
    if (!localStorage.getItem(STORAGE_SESSION)) {
      localStorage.setItem(STORAGE_SESSION, crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const searchLocalProducts = (query: string, category?: string) => {
    const terms = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let list = products.filter(p => (p.stock ?? 0) > 0);
    if (category) {
      list = list.filter(p => p.category === category);
    }
    if (terms.length > 0) {
      list = list.filter(p => terms.every(t => p.name.toLowerCase().includes(t)));
    }
    return list.slice(0, 10);
  };

  const tryHandleActionFromAssistant = (text: string) => {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return;
      const obj = JSON.parse(match[0]);
      if (obj && obj.action === 'add_to_cart' && obj.id) {
        const prod = products.find(p => p.id === obj.id) as Product | undefined;
        if (!prod) return;
        const qty = Math.max(1, Number(obj.quantity) || 1);
        for (let i = 0; i < qty; i++) {
          addToCart(prod);
        }
        toast({ title: 'Adicionado ao carrinho!' });
      }
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const suggestions = searchLocalProducts(userMessage.content);
      if (suggestions.length > 0) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'cards', products: suggestions }
        ]);
      }
    } catch {}

    setIsLoading(true);
    let assistantContent = '';
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          session_id: localStorage.getItem(STORAGE_SESSION),
          messages: [...messages, userMessage],
          tools: ['searchProducts', 'addToCart', 'getProductDetails'],
          products: products.slice(0, 200).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            stock: p.stock
          }))
        })
      });

      if (!response.ok || !response.body) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Vou verificar no estoque e te retorno com as melhores opções.'
          }
        ]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages(prev => {
          const arr = [...prev];
          arr[arr.length - 1] = { role: 'assistant', content: assistantContent };
          return arr;
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Não encontrei exatamente isso. Vou buscar alternativas próximas.' }
      ]);
    } finally {
      setIsLoading(false);
      tryHandleActionFromAssistant(assistantContent);
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
                <p className="text-xs opacity-80">Assistente de vendas</p>
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
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <img src={chatbotImage} alt="Balão Expert" className="w-8 h-8 object-contain" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    {message.products && message.products.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {message.products.map((p) => (
                          <div
                            key={p.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              navigate(`/produto/${p.id}`);
                            }}
                            className="cursor-pointer text-left border rounded-lg p-2 bg-white hover:shadow-sm transition"
                          >
                            <div className="w-full h-24 flex items-center justify-center">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-24 object-contain"
                              />
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-medium line-clamp-2">{p.name}</p>
                              <p className="text-sm font-bold text-primary mt-1">
                                {formatPrice(p.price)}
                              </p>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(p);
                                  toast({ title: 'Adicionado ao carrinho!' });
                                }}
                                className="mt-2 w-full"
                                size="sm"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Adicionar ao carrinho
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        <RenderMessageContent
                          content={message.content}
                          onNavigate={(path) => {
                            setIsOpen(false);
                            navigate(path);
                          }}
                        />
                      </p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-primary rounded-full p-1.5 h-fit">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-2 justify-start">
                  <img src={chatbotImage} alt="Balão Expert" className="w-8 h-8 object-contain" />
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Descreva o que você precisa..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RenderMessageContent = ({ content, onNavigate }: { content: string; onNavigate: (path: string) => void }) => {
  const urlRegex = /(https?:\/\/[^\s]+|\/produto\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return (
    <>
      {parts.map((part, index) => {
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
        if (urlRegex.test(part)) {
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

export default ChatBot;
