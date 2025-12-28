import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

interface AdminChatProps {
  currentUser: string;
}

export function AdminChat({ currentUser }: AdminChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('admin_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_chat_messages',
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (data) {
        setMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('admin_chat_messages')
        .insert([
          {
            sender_name: currentUser,
            content: newMessage.trim(),
          },
        ]);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-lg border border-border shadow-sm">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="font-semibold flex items-center gap-2">
          <User className="w-5 h-5" />
          Chat da Equipe
        </h2>
        <p className="text-xs text-muted-foreground">
          Converse com outros administradores e funcionários em tempo real.
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            Carregando mensagens...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_name === currentUser;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1 font-medium">
                      {msg.sender_name}
                    </div>
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-muted/30 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 input-field bg-background"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="btn-primary p-2 aspect-square flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
