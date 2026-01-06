export type WhatsAppConnectionStatus = 'connected' | 'disconnected' | 'qr';

export interface ChatCentralConversation {
  id: string;
  title: string;
  avatarUrl?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export type ChatCentralMessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatCentralMessage {
  id: string;
  conversationId: string;
  author: 'customer' | 'agent';
  text: string;
  createdAt: string;
  status?: ChatCentralMessageStatus;
  agentName?: string;
}

