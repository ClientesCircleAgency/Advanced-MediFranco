import { useState } from 'react';
import { Search, Mail, Phone, ArrowLeft, MailOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useContactMessages } from '@/hooks/useContactMessages';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function MessagesPage() {
  const { data: messages, isLoading } = useContactMessages();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedMessage = messages?.find(m => m.id === selectedMessageId) || null;

  const filteredMessages = messages?.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleBack = () => {
    setSelectedMessageId(null);
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Lista de mensagens - hidden on mobile when message selected */}
      <div className={cn(
        'w-full md:w-80 lg:w-72 xl:w-80 border-r border-border bg-card flex flex-col shrink-0',
        selectedMessage && 'hidden md:flex'
      )}>
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Procurar mensagem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-0 text-sm"
            />
          </div>
        </div>

        {/* Messages list */}
        <ScrollArea className="flex-1">
          <div>
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                A carregar mensagens...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Sem mensagens
              </div>
            ) : (
              filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessageId(message.id)}
                  className={cn(
                    'w-full px-3 py-3 flex items-center gap-3 text-left transition-colors hover:bg-accent/50 border-b border-border/50',
                    selectedMessageId === message.id && 'bg-accent border-l-4 border-l-primary'
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(message.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-foreground truncate">
                        {message.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'd MMM', { locale: pt })}
                        </span>
                        {message.status === 'new' && (
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                        )}
                      </div>
                    </div>
                    <p className={cn(
                      'text-sm truncate mt-0.5',
                      message.status === 'new' ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      Novo Contacto
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área de visualização da mensagem */}
      {selectedMessage ? (
        <div className={cn(
          'flex-1 flex flex-col bg-background min-w-0',
          !selectedMessage && 'hidden md:flex'
        )}>
          {/* Message header */}
          <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getInitials(selectedMessage.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">{selectedMessage.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{selectedMessage.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedMessage.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-2"
                  onClick={() => handleCall(selectedMessage.phone)}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ligar</span>
                </Button>
              )}
              <Button
                size="sm"
                className="h-8 gap-2"
                onClick={() => handleEmail(selectedMessage.email)}
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Responder</span>
              </Button>
            </div>
          </div>

          {/* Message content */}
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-3xl">
              <div className="mb-6">
                <h2 className="text-xl font-serif italic text-foreground mb-2">
                  Mensagem de Contacto
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>De: {selectedMessage.name}</span>
                  <span>•</span>
                  <span>{format(new Date(selectedMessage.created_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}</span>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Contact details card */}
              <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-medium text-sm text-foreground mb-3">Detalhes de Contacto</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MailOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Selecione uma mensagem para visualizar</p>
          </div>
        </div>
      )}
    </div>
  );
}
