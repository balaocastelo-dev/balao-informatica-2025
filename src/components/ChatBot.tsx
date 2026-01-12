import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Loader2, ShoppingCart, Trash2, Mic, MicOff, Phone, Volume2 } from 'lucide-react';
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
const ASSISTANT_ENABLED = false;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const clarifyText = 'Como posso ajudar você hoje? Posso sugerir produtos, tirar dúvidas ou ajudar com seu pedido.';
  
  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SESSION);
    setMessages([
      { role: 'assistant', content: 'Olá! Sou o Balão Expert. ' + clarifyText }
    ]);
    setHasGreeted(true);
    localStorage.setItem(STORAGE_SESSION, crypto.randomUUID());
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        sendMessage(text);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceMode = () => {
    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    if (newMode) {
      speak('Modo de voz ativado. Pode falar comigo!');
      startListening();
    } else {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  };

  const speak = (text: string) => {
    if (!isVoiceMode) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.onend = () => {
      if (isVoiceMode) startListening();
    };
    window.speechSynthesis.speak(utterance);
  };

  const inferIntent = (text: string): { category?: string; budget?: number; query: string; usage?: string } => {
    const t = text.toLowerCase();
    const catMap: Record<string, string> = {
      'impressora': 'impressoras',
      'notebook': 'notebooks',
      'pc gamer': 'pc-gamer',
      'pc office': 'pc-office',
      'placa de vídeo': 'placa-de-video',
      'placas de vídeo': 'placa-de-video',
      'gpu': 'placa-de-video',
      'placa mae': 'placas-mae',
      'placa-mãe': 'placas-mae',
      'memoria': 'memoria-ram',
      'memória': 'memoria-ram',
      'ram': 'memoria-ram',
      'ssd': 'ssd-hd',
      'hd': 'ssd-hd',
      'fonte': 'fontes',
      'gabinete': 'gabinetes',
      'cooler': 'coolers',
      'monitor': 'monitores',
      'console': 'consoles',
      'iphone': 'iphone',
      'ipad': 'ipad',
      'macbook': 'macbook',
      'apple': 'apple',
    };
    const usageMap: Record<string, string> = {
      'jogo': 'jogos',
      'gamer': 'jogos',
      'jogos': 'jogos',
      'trabalho': 'trabalho',
      'office': 'trabalho',
      'planilha': 'trabalho',
      'estudo': 'estudo',
      'escola': 'estudo',
      'faculdade': 'estudo',
      'universidade': 'estudo',
      'edição': 'trabalho',
      'stream': 'jogos',
    };
    let category: string | undefined;
    for (const key of Object.keys(catMap)) {
      if (t.includes(key)) {
        category = catMap[key];
        break;
      }
    }
    let usage: string | undefined;
    for (const key of Object.keys(usageMap)) {
      if (t.includes(key)) {
        usage = usageMap[key];
        break;
      }
    }
    const budgetMatch = t.match(/(\d{3,6})(?:\s*|,|\.|k|\s*mil)?/);
    const budget = budgetMatch ? Number(budgetMatch[1]) : undefined;
    return { category, budget, query: text, usage };
  };

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
        content: 'Olá! Sou o Balão Expert. ' + clarifyText
      }
    ]);
    setHasGreeted(true);
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

  const sendMessage = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const intent = inferIntent(userMessage.content);
      const nextContext = {
        category: intent.category ?? chatContext.category,
        usage: intent.usage ?? chatContext.usage,
        budget: intent.budget ?? chatContext.budget
      };
      setChatContext(nextContext);
      const usageCategoryMap: Record<string, string> = {
        'jogos': 'pc-gamer',
        'trabalho': 'pc-office',
        'estudo': 'notebooks'
      };
      const derivedCategory =
        nextContext.category ||
        (nextContext.usage ? usageCategoryMap[nextContext.usage] : undefined);

      let suggestions = searchLocalProducts(intent.query, derivedCategory);
      if (suggestions.length === 0 && derivedCategory) {
        suggestions = products
          .filter(p => (p.stock ?? 0) > 0 && p.category === derivedCategory)
          .slice(0, 10);
      }
      
      if (suggestions.length > 0) {
        const replyText = `Encontrei algumas opções de ${derivedCategory || 'produtos'} para você:`;
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: replyText },
          { role: 'assistant', content: 'cards', products: suggestions }
        ]);
        speak(replyText);
        return;
      }
    } catch {}

    // If truly nothing found (edge-case), keep a minimal clarification without repeating
    if (!hasGreeted) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: clarifyText }
      ]);
      setHasGreeted(true);
      speak(clarifyText);
    }

    if (ASSISTANT_ENABLED) {
      setIsLoading(true);
    }
    
    // Fallback if not enabled or no results
    if (!ASSISTANT_ENABLED) {
       const replyText = "Desculpe, não encontrei produtos específicos com essa descrição. Tente buscar por categorias como 'PC Gamer', 'Notebooks' ou 'Impressoras'.";
       setMessages(prev => [
        ...prev,
        { role: 'assistant', content: replyText }
      ]);
      speak(replyText);
      return;
    }

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
        const replyText = 'Vou verificar no estoque e te retorno com as melhores opções.';
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: replyText
          }
        ]);
        speak(replyText);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let sseBuffer = '';
      let assistantText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        sseBuffer += chunk;

        const lines = sseBuffer.split(/\r?\n/);
        // Keep last line if not terminated by newline
        sseBuffer = lines[lines.length - 1]?.trim() ? lines[lines.length - 1] : '';

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          if (line === 'data: [DONE]') continue;
          if (line.startsWith('data:')) {
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              const json = JSON.parse(payload);
              const choice = (json?.choices || [])[0];
              const delta = choice?.delta;
              const contentPiece = typeof delta?.content === 'string' ? delta.content : '';
              if (contentPiece) {
                assistantText += contentPiece;
                setMessages(prev => {
                  const arr = [...prev];
                  arr[arr.length - 1] = { role: 'assistant', content: assistantText };
                  return arr;
                });
              }
            } catch {
              // ignore non-JSON or partial frames
            }
          } else {
            // ignore non-SSE lines like "OPENROUTER PROCESSING"
          }
        }
      }
      assistantContent = assistantText || assistantContent;
      speak(assistantContent);
    } catch {
      const replyText = 'Não encontrei exatamente isso. Vou buscar alternativas próximas.';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: replyText }
      ]);
      speak(replyText);
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
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearHistory();
              }}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar histórico
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
                                className="mt-2 w-full flex items-center justify-center gap-2"
                                size="sm"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Comprar
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
              <Button
                variant={isVoiceMode ? "destructive" : "outline"}
                size="icon"
                onClick={toggleVoiceMode}
                title={isVoiceMode ? "Desativar voz" : "Ativar voz"}
                className={isVoiceMode ? "animate-pulse" : ""}
              >
                {isVoiceMode ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isVoiceMode ? "Pode falar..." : "Descreva o que você precisa..."}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} size="icon">
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
