import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChatCentralConversation, ChatCentralMessage, WhatsAppConnectionStatus } from '@/types/chatCentral';

type GatewayInstanceStatusResponse = {
  status: WhatsAppConnectionStatus;
  qrCodeImageUrl?: string | null;
};

type GatewayConversationResponse = ChatCentralConversation;
type GatewayMessageResponse = ChatCentralMessage;

type GatewayEvent =
  | { type: 'connection.status'; status: WhatsAppConnectionStatus; qrCodeImageUrl?: string | null }
  | { type: 'conversations.snapshot'; conversations: GatewayConversationResponse[] }
  | { type: 'conversation.upsert'; conversation: GatewayConversationResponse }
  | { type: 'messages.snapshot'; conversationId: string; messages: GatewayMessageResponse[] }
  | { type: 'message.new'; message: GatewayMessageResponse }
  | { type: 'message.status'; conversationId: string; messageId: string; status: ChatCentralMessage['status'] };

type ChatCentralContextType = {
  agentName: string;
  gatewayEnabled: boolean;
  status: WhatsAppConnectionStatus;
  qrCodeImageUrl: string | null;

  conversations: ChatCentralConversation[];
  activeConversationId: string | null;
  activeConversation: ChatCentralConversation | null;
  search: string;

  messagesByConversation: Record<string, ChatCentralMessage[]>;

  setSearch: (value: string) => void;
  selectConversation: (conversationId: string) => void;

  requestQrCode: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendText: (text: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshActiveMessages: () => Promise<void>;
};

const ChatCentralContext = createContext<ChatCentralContextType | undefined>(undefined);

const GATEWAY_BASE_URL = import.meta.env.VITE_WHATSAPP_GATEWAY_URL as string | undefined;

function upsertConversation(list: ChatCentralConversation[], convo: ChatCentralConversation) {
  const idx = list.findIndex((c) => c.id === convo.id);
  if (idx === -1) return [convo, ...list];
  const next = [...list];
  next[idx] = { ...next[idx], ...convo };
  return next;
}

function mergeMessages(existing: ChatCentralMessage[], incoming: ChatCentralMessage[]) {
  const map = new Map<string, ChatCentralMessage>();
  for (const m of existing) map.set(m.id, m);
  for (const m of incoming) map.set(m.id, { ...(map.get(m.id) || {}), ...m });
  return Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function upsertMessage(existing: ChatCentralMessage[], incoming: ChatCentralMessage) {
  const idx = existing.findIndex((m) => m.id === incoming.id);
  if (idx === -1) return [...existing, incoming].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const next = [...existing];
  next[idx] = { ...next[idx], ...incoming };
  return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function ChatCentralProvider({ children }: { children: ReactNode }) {
  const agentName = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('admin_user');
      if (stored) {
        const parsed = JSON.parse(stored) as { name?: string } | null;
        const name = parsed?.name?.trim();
        if (name) return name;
      }
    } catch {
      // ignore
    }
    return 'Atendente';
  }, []);

  const gatewayEnabled = !!GATEWAY_BASE_URL;

  const fetchGatewayJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    if (!GATEWAY_BASE_URL) {
      throw new Error('Missing VITE_WHATSAPP_GATEWAY_URL');
    }
    const res = await fetch(`${GATEWAY_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`Gateway error: ${res.status}`);
    return (await res.json()) as T;
  };

  const [status, setStatus] = useState<WhatsAppConnectionStatus>('disconnected');
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ChatCentralConversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatCentralMessage[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  const sseRef = useRef<EventSource | null>(null);
  const pollingRef = useRef<number | null>(null);
  const pollingMessagesRef = useRef<number | null>(null);

  const refreshStatus = async () => {
    if (!gatewayEnabled) return;
    try {
      const data = await fetchGatewayJson<GatewayInstanceStatusResponse>('/instance/status');
      setStatus(data.status);
      setQrCodeImageUrl(data.qrCodeImageUrl || null);
    } catch {
      setStatus('disconnected');
      setQrCodeImageUrl(null);
    }
  };

  const refreshConversations = async () => {
    if (!gatewayEnabled) return;
    try {
      const data = await fetchGatewayJson<GatewayConversationResponse[]>('/conversations');
      setConversations(data);
      if (!activeConversationId && data.length > 0) {
        setActiveConversationId(data[0].id);
      }
    } catch {
      setConversations([]);
    }
  };

  const refreshActiveMessages = async () => {
    if (!gatewayEnabled) return;
    if (!activeConversationId) return;
    try {
      const data = await fetchGatewayJson<GatewayMessageResponse[]>(`/conversations/${activeConversationId}/messages?limit=50`);
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: mergeMessages(prev[activeConversationId] || [], data),
      }));
    } catch {
      setMessagesByConversation((prev) => ({ ...prev, [activeConversationId]: prev[activeConversationId] || [] }));
    }
  };

  const applyGatewayEvent = (event: GatewayEvent) => {
    if (event.type === 'connection.status') {
      setStatus(event.status);
      setQrCodeImageUrl(event.qrCodeImageUrl || null);
      return;
    }

    if (event.type === 'conversations.snapshot') {
      setConversations(event.conversations);
      return;
    }

    if (event.type === 'conversation.upsert') {
      setConversations((prev) => upsertConversation(prev, event.conversation));
      return;
    }

    if (event.type === 'messages.snapshot') {
      setMessagesByConversation((prev) => ({
        ...prev,
        [event.conversationId]: mergeMessages(prev[event.conversationId] || [], event.messages),
      }));
      return;
    }

    if (event.type === 'message.new') {
      setMessagesByConversation((prev) => {
        const conversationId = event.message.conversationId;
        return {
          ...prev,
          [conversationId]: upsertMessage(prev[conversationId] || [], event.message),
        };
      });
      setConversations((prev) =>
        upsertConversation(prev, {
          id: event.message.conversationId,
          title: prev.find((c) => c.id === event.message.conversationId)?.title || 'Contato',
          lastMessagePreview: event.message.text,
          lastMessageAt: event.message.createdAt,
        })
      );
      return;
    }

    if (event.type === 'message.status') {
      setMessagesByConversation((prev) => {
        const list = prev[event.conversationId] || [];
        const idx = list.findIndex((m) => m.id === event.messageId);
        if (idx === -1) return prev;
        const next = [...list];
        next[idx] = { ...next[idx], status: event.status };
        return { ...prev, [event.conversationId]: next };
      });
    }
  };

  useEffect(() => {
    if (!gatewayEnabled) return;

    const eventsUrl = `${GATEWAY_BASE_URL}/events`;
    try {
      const sse = new EventSource(eventsUrl);
      sseRef.current = sse;

      sse.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data) as GatewayEvent;
          if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) return;
          applyGatewayEvent(parsed);
        } catch {
          return;
        }
      };

      sse.onerror = () => {
        sse.close();
        sseRef.current = null;
      };
    } catch {
      sseRef.current = null;
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
    };
  }, [gatewayEnabled]);

  useEffect(() => {
    if (!gatewayEnabled) return;

    refreshStatus();
    refreshConversations();

    pollingRef.current = window.setInterval(() => {
      if (!sseRef.current) {
        refreshStatus();
        refreshConversations();
      }
    }, 5000);

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [gatewayEnabled, activeConversationId]);

  useEffect(() => {
    if (!gatewayEnabled) return;

    if (pollingMessagesRef.current) window.clearInterval(pollingMessagesRef.current);
    pollingMessagesRef.current = null;

    if (!activeConversationId) return;

    refreshActiveMessages();
    pollingMessagesRef.current = window.setInterval(() => {
      if (!sseRef.current) refreshActiveMessages();
    }, 3000);

    return () => {
      if (pollingMessagesRef.current) window.clearInterval(pollingMessagesRef.current);
      pollingMessagesRef.current = null;
    };
  }, [gatewayEnabled, activeConversationId]);

  const requestQrCode = async () => {
    if (!gatewayEnabled) {
      setStatus('qr');
      setQrCodeImageUrl(null);
      return;
    }
    try {
      const data = await fetchGatewayJson<GatewayInstanceStatusResponse>('/instance/qr', { method: 'POST' });
      setStatus(data.status);
      setQrCodeImageUrl(data.qrCodeImageUrl || null);
    } catch {
      setStatus('qr');
      setQrCodeImageUrl(null);
    }
  };

  const disconnect = async () => {
    if (!gatewayEnabled) {
      setStatus('disconnected');
      setQrCodeImageUrl(null);
      setConversations([]);
      setMessagesByConversation({});
      setActiveConversationId(null);
      return;
    }
    try {
      await fetchGatewayJson<{ ok: true }>('/instance/disconnect', { method: 'POST' });
    } finally {
      setStatus('disconnected');
      setQrCodeImageUrl(null);
      setConversations([]);
      setMessagesByConversation({});
      setActiveConversationId(null);
    }
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const sendText = async (text: string) => {
    if (!activeConversationId) return;
    const nowIso = new Date().toISOString();
    const optimistic: ChatCentralMessage = {
      id: `${nowIso}:${Math.random().toString(16).slice(2)}`,
      conversationId: activeConversationId,
      author: 'agent',
      text,
      createdAt: nowIso,
      status: 'sent',
      agentName,
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [activeConversationId]: upsertMessage(prev[activeConversationId] || [], optimistic),
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, lastMessagePreview: text, lastMessageAt: nowIso }
          : c
      )
    );

    if (!gatewayEnabled) return;

    try {
      await fetchGatewayJson<{ ok: true; messageId?: string }>(`/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
          m.id === optimistic.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    } catch {
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
          m.id === optimistic.id ? { ...m, status: 'sent' } : m
        ),
      }));
    }
  };

  const value: ChatCentralContextType = {
    agentName,
    gatewayEnabled,
    status,
    qrCodeImageUrl,
    conversations,
    activeConversationId,
    activeConversation,
    search,
    messagesByConversation,
    setSearch,
    selectConversation,
    requestQrCode,
    disconnect,
    sendText,
    refreshConversations,
    refreshActiveMessages,
  };

  return <ChatCentralContext.Provider value={value}>{children}</ChatCentralContext.Provider>;
}

export function useChatCentral() {
  const ctx = useContext(ChatCentralContext);
  if (!ctx) throw new Error('useChatCentral must be used within a ChatCentralProvider');
  return ctx;
}
