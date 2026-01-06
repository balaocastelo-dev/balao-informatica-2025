import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCheck, Paperclip, Send, Smile } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatCentralConversation, ChatCentralMessage } from '@/types/chatCentral';

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function StatusIcon({ status }: { status?: ChatCentralMessage['status'] }) {
  if (status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-sky-500" />;
  if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
  if (status === 'sent') return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
  return null;
}

export function ChatWindow({
  conversation,
  messages,
  agentLabel,
  onSendText,
}: {
  conversation: ChatCentralConversation | null;
  messages: ChatCentralMessage[];
  agentLabel: string;
  onSendText: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const convMessages = useMemo(() => {
    if (!conversation) return [];
    return messages
      .filter((m) => m.conversationId === conversation.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [conversation, messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [convMessages.length, conversation?.id]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText('');
  };

  if (!conversation) {
    return (
      <section className="flex-1 bg-muted/20 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-xl font-semibold text-foreground">Central de Atendimento</div>
          <div className="text-sm text-muted-foreground mt-2">
            Selecione uma conversa à esquerda para começar.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-muted/20">
      <div className="h-14 px-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {conversation.avatarUrl ? (
              <img src={conversation.avatarUrl} alt={conversation.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {conversation.title.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground truncate">{conversation.title}</div>
            <div className="text-xs text-muted-foreground truncate">{agentLabel}</div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="px-4 py-4 space-y-2">
          {convMessages.map((m) => {
            const isAgent = m.author === 'agent';
            return (
              <div key={m.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-lg px-3 py-2 shadow-sm ${
                    isAgent ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                  }`}
                >
                  {isAgent && m.agentName && (
                    <div className="text-[11px] opacity-90 mb-1">{m.agentName}</div>
                  )}
                  <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>
                  <div className={`mt-1 flex items-center gap-1 justify-end text-[11px] ${isAgent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    <span>{formatTime(m.createdAt)}</span>
                    {isAgent && <StatusIcon status={m.status} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" type="button">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" type="button">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite uma mensagem"
            className="input-field flex-1"
          />
          <button
            onClick={handleSend}
            className="btn-primary flex items-center gap-2"
            type="button"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
      </div>
    </section>
  );
}

