import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Newspaper } from 'lucide-react';
import { BlogPostDialog } from '@/components/admin/blog/BlogPostDialog';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import type { BlogPost } from '@/types/blog';
import { PageHeader } from '@/components/admin/PageHeader';
import { cn } from '@/lib/utils';

const initialMockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Novos Avancos na Oftalmologia em 2024',
    subtitle: 'Descubra as tecnologias que estao a revolucionar o tratamento da visao',
    author: 'Dr. Franco',
    slug: 'novos-avancos-oftalmologia-2024',
    content: '<p>Conteudo do artigo...</p>',
    images: ['https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop'],
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'A Importancia do Check-up Dentario',
    subtitle: 'Porque deve visitar o dentista a cada 6 meses',
    author: 'Dra. Silva',
    slug: 'importancia-checkup-dentario',
    content: '<p>Conteudo do artigo...</p>',
    images: ['https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=2000&auto=format&fit=crop'],
    published_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>(initialMockPosts);
  const isLoading = false;

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja remover este artigo?')) {
      setPosts((current) => current.filter((post) => post.id !== id));
      toast.success('Artigo removido com sucesso.');
    }
  };

  const filteredPosts = posts.filter(
    (post) => post.title.toLowerCase().includes(search.toLowerCase()) || post.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Editorial Surface"
        title="Blog"
        subtitle="Gestão editorial alinhada com o mesmo sistema visual da dashboard."
        actions={
          <Button onClick={() => { setSelectedPost(null); setIsDialogOpen(true); }} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
            <Plus className="mr-2 h-4 w-4" />
            Novo artigo
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Artigos</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{posts.length}</p>
          <p className="mt-2 text-sm text-slate-500">Itens atualmente disponíveis no catálogo editorial.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Resultados filtrados</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{filteredPosts.length}</p>
          <p className="mt-2 text-sm text-slate-500">Correspondências com a pesquisa atual.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Estado</p>
          <p className="mt-3 font-display text-2xl text-slate-950">Operacional</p>
          <p className="mt-2 text-sm text-slate-500">Superfície editorial pronta para evolução futura com dados reais.</p>
        </div>
      </div>

      <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-950">Artigos publicados</h2>
            <p className="mt-1 text-sm text-slate-500">Lista mais limpa, respirada e consistente com o resto da administração.</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Pesquisar por título ou autor..."
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">A carregar...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Newspaper className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-700">Nenhum artigo encontrado</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-950">{post.title}</p>
                    {post.subtitle && <p className="mt-1 line-clamp-1 text-sm text-slate-500">{post.subtitle}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span>{post.author}</span>
                      <span>{post.published_at ? format(new Date(post.published_at), 'd MMM yyyy', { locale: pt }) : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 bg-slate-50" onClick={() => { setSelectedPost(post); setIsDialogOpen(true); }}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Apagar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BlogPostDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} post={selectedPost} />
    </div>
  );
}
