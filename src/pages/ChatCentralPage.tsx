import { useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
import { AdminGate } from '@/components/chat-central/AdminGate';
import { SidebarContacts } from '@/components/chat-central/SidebarContacts';
import { ChatWindow } from '@/components/chat-central/ChatWindow';
import { QRCodeModal } from '@/components/chat-central/QRCodeModal';
import { ChatCentralProvider, useChatCentral } from '@/contexts/ChatCentralContext';

function ChatCentralShell() {
  const {
    agentName,
    status,
    qrCodeImageUrl,
    conversations,
    activeConversationId,
    activeConversation,
    search,
    setSearch,
    selectConversation,
    requestQrCode,
    disconnect,
    sendText,
    messagesByConversation,
  } = useChatCentral();

  const [configOpen, setConfigOpen] = useState(false);

  const messages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesByConversation[activeConversationId] || [];
  }, [activeConversationId, messagesByConversation]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="font-semibold text-foreground truncate">Chat Central</div>
          <div className="text-sm text-muted-foreground truncate">Atendente: {agentName}</div>
        </div>
        <button
          type="button"
          onClick={() => setConfigOpen(true)}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
          title="Configurar instância"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <SidebarContacts
          conversations={conversations}
          activeConversationId={activeConversationId}
          search={search}
          onSearchChange={setSearch}
          onSelectConversation={selectConversation}
        />
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          agentLabel={`Conexão: ${
            status === 'connected' ? 'Conectado' : status === 'qr' ? 'Aguardando QR Code' : 'Desconectado'
          }`}
          onSendText={sendText}
        />
      </div>

      <QRCodeModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        status={status}
        qrCodeImageUrl={qrCodeImageUrl}
        onRequestQrCode={requestQrCode}
        onDisconnect={disconnect}
      />
    </div>
  );
}

export default function ChatCentralPage() {
  return (
    <AdminGate>
      <ChatCentralProvider>
        <ChatCentralShell />
      </ChatCentralProvider>
    </AdminGate>
  );
}
