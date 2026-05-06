import { useState, useEffect } from 'react';
import { Search, Mail, Phone, ArrowLeft, MailOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/admin/PageHeader';
import { cn } from '@/lib/utils';
import { useContactMessages, useUpdateContactMessageStatus } from '@/hooks/useContactMessages';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function MessagesPage() {
  const { data: messages, isLoading } = useContactMessages();
  const { mutate: updateStatus } = useUpdateContactMessageStatus();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedMessage = messages?.find((message) => message.id === selectedMessageId) || null;

  useEffect(() => {
    if (selectedMessage && selectedMessage.status === 'new') {
      updateStatus({ id: selectedMessage.id, status: 'read' });
    }
  }, [selectedMessage, updateStatus]);

  const filteredMessages =
    messages?.filter(
      (message) =>
        message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const unreadCount = messages?.filter((message) => message.status === 'new').length || 0;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Inbox Layer"
        title="Mensagens"
        subtitle={`${unreadCount} mensagens novas, com leitura mais limpa e melhor foco no conteúdo.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Inbox total</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{messages?.length || 0}</p>
          <p className="mt-2 text-sm text-slate-500">Todas as mensagens recebidas do site principal.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Não lidas</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{unreadCount}</p>
          <p className="mt-2 text-sm text-slate-500">Mensagens que ainda exigem atenção da equipa.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Pesquisa ativa</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{filteredMessages.length}</p>
          <p className="mt-2 text-sm text-slate-500">Resultados correspondentes ao filtro atual.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className={cn(shellCardClassName, 'overflow-hidden')}>
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Procurar mensagem..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[580px]">
            <div className="p-3">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-slate-500">A carregar mensagens...</div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Sem mensagens.</div>
              ) : (
                filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => setSelectedMessageId(message.id)}
                    className={cn(
                      'mb-2 w-full rounded-[1.25rem] border p-3 text-left transition',
                      selectedMessageId === message.id
                        ? 'border-cyan-200 bg-cyan-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-cyan-200 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-slate-950 text-xs font-semibold text-white">
                          {getInitials(message.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-slate-950">{message.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{format(new Date(message.created_at), 'd MMM', { locale: pt })}</span>
                            {message.status === 'new' && <div className="h-2 w-2 rounded-full bg-cyan-500" />}
                          </div>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500">{message.message}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className={cn(shellCardClassName, 'overflow-hidden')}>
          {selectedMessage ? (
            <>
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Button variant="ghost" size="icon" className="rounded-2xl xl:hidden" onClick={() => setSelectedMessageId(null)}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-slate-950 text-xs font-semibold text-white">
                        {getInitials(selectedMessage.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-950">{selectedMessage.name}</h3>
                      <p className="truncate text-sm text-slate-500">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMessage.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl border-slate-200 bg-slate-50"
                        onClick={() => {
                          window.location.href = `tel:${selectedMessage.phone}`;
                        }}
                      >
                        <Phone className="mr-2 h-3.5 w-3.5" />
                        Ligar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => {
                        window.location.href = `mailto:${selectedMessage.email}`;
                      }}
                    >
                      <Mail className="mr-2 h-3.5 w-3.5" />
                      Responder
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[580px]">
                <div className="max-w-3xl p-6">
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-semibold text-slate-950">Mensagem de contacto</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Recebida em {format(new Date(selectedMessage.created_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="whitespace-pre-wrap leading-7 text-slate-700">{selectedMessage.message}</p>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <h4 className="text-sm font-semibold text-slate-950">Detalhes de contacto</h4>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a href={`mailto:${selectedMessage.email}`} className="hover:text-cyan-700 hover:underline">
                          {selectedMessage.email}
                        </a>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a href={`tel:${selectedMessage.phone}`} className="hover:text-cyan-700 hover:underline">
                            {selectedMessage.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex h-[680px] items-center justify-center bg-slate-50/70">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                  <MailOpen className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">Seleciona uma mensagem para visualizar</p>
                <p className="mt-1 text-sm text-slate-500">A leitura detalhada aparece aqui com mais espaço e menos ruído.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
