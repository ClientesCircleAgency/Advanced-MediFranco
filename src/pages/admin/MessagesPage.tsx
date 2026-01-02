import { useState } from 'react';
import { Search, Send, Bot, User, Phone, Calendar, FileText, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  isBot?: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  content: string;
  time: string;
  isOutgoing: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

// Mock data para demonstração
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Joana Martins',
    lastMessage: 'Gostaria de remarcar para terça...',
    time: '10:42',
    unread: true,
    isBot: true,
  },
  {
    id: '2',
    name: 'Pedro Nunes',
    lastMessage: 'Qual é o preço do implante?',
    time: 'Ontem',
    unread: true,
  },
  {
    id: '3',
    name: 'Maria Silva',
    lastMessage: 'Obrigada pela confirmação!',
    time: 'Ontem',
  },
  {
    id: '4',
    name: 'António Costa',
    lastMessage: 'Vou chegar 10 minutos atrasado',
    time: 'Seg',
  },
  {
    id: '5',
    name: 'Ana Ferreira',
    lastMessage: 'Preciso de uma receita médica',
    time: 'Dom',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Olá Joana! A sua consulta é amanhã às 10:00. Confirma?',
    time: '10:30',
    isOutgoing: true,
    status: 'read',
  },
  {
    id: '2',
    content: 'Bom dia. Infelizmente não consigo ir. Gostaria de remarcar para terça.',
    time: '10:42',
    isOutgoing: false,
  },
];

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [messages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex h-[calc(100vh-48px)] gap-0 -m-6">
      {/* Lista de conversas */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Procurar conversa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Conversations list */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={cn(
                  'w-full p-4 flex items-start gap-3 text-left transition-colors hover:bg-accent/50',
                  selectedConversation?.id === conversation.id && 'bg-accent border-l-4 border-l-primary'
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(conversation.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn(
                      'font-medium text-sm truncate',
                      conversation.unread ? 'text-foreground' : 'text-foreground'
                    )}>
                      {conversation.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {conversation.time}
                    </span>
                  </div>
                  <p className={cn(
                    'text-sm truncate',
                    conversation.unread ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}>
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área de chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-[hsl(40,30%,94%)]">
          {/* Chat header */}
          <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {getInitials(selectedConversation.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bot className="h-3 w-3" />
                  <span>Bot respondeu há 5 min</span>
                </div>
              </div>
            </div>
            <Button variant="default" size="sm" className="gap-2">
              Assumir Controlo
            </Button>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.isOutgoing ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
                      message.isOutgoing
                        ? 'bg-[hsl(145,60%,92%)] text-foreground rounded-br-md'
                        : 'bg-card text-foreground rounded-bl-md border border-border'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      message.isOutgoing ? 'justify-end' : 'justify-start'
                    )}>
                      <span className="text-[10px] text-muted-foreground">{message.time}</span>
                      {message.isOutgoing && message.status === 'read' && (
                        <svg className="h-3 w-3 text-primary" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          <path d="M6.854 10.146a.5.5 0 0 1 0 .708l-.647.646.647-.646a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708l3.5 3.5z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message input */}
          <div className="bg-card border-t border-border p-4">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  placeholder="Escreva uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="pr-20 bg-muted/50 border-0 h-12 rounded-full"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button size="icon" className="h-12 w-12 rounded-full shrink-0">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Selecione uma conversa para começar</p>
          </div>
        </div>
      )}

      {/* Sidebar de contexto (opcional, para quando há paciente associado) */}
      {selectedConversation && (
        <div className="w-72 border-l border-border bg-card p-4 hidden xl:block">
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {getInitials(selectedConversation.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
            <p className="text-sm text-muted-foreground">Paciente desde 2023</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Telefone</p>
                <p className="text-foreground">+351 912 345 678</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Próxima Consulta</p>
                <p className="text-foreground">Amanhã, 10:00</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Última Consulta</p>
                <p className="text-foreground">15 Dez 2025</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-medium text-sm text-foreground mb-3">Ações Rápidas</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Agendar Consulta
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                Ver Ficha
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
