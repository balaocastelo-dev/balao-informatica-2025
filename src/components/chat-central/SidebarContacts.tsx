import { Search } from 'lucide-react';
import { ChatCentralConversation } from '@/types/chatCentral';

function formatTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function SidebarContacts({
  conversations,
  activeConversationId,
  search,
  onSearchChange,
  onSelectConversation,
}: {
  conversations: ChatCentralConversation[];
  activeConversationId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectConversation: (conversationId: string) => void;
}) {
  const filtered = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      (c.lastMessagePreview || '').toLowerCase().includes(q)
    );
  });

  return (
    <aside className="w-full md:w-[360px] border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar ou iniciar nova conversa"
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nenhuma conversa</div>
        ) : (
          filtered.map((c) => {
            const isActive = c.id === activeConversationId;
            return (
              <button
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`w-full text-left px-3 py-3 flex gap-3 border-b border-border/60 hover:bg-secondary/50 ${
                  isActive ? 'bg-secondary' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {c.title.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-foreground truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground shrink-0">{formatTime(c.lastMessageAt)}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className="text-xs text-muted-foreground truncate">
                      {c.lastMessagePreview || ''}
                    </div>
                    {!!c.unreadCount && c.unreadCount > 0 && (
                      <div className="min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center">
                        {c.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

