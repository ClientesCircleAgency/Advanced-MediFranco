import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BookOpenCheck, ImagePlus, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCaseStudies, resetCaseStudies } from '@/hooks/useCaseStudies';
import { cn } from '@/lib/utils';
import type { CaseStudy, CaseStudyIcon } from '@/types/caseStudy';

type CaseStudyFormState = Omit<CaseStudy, 'id'> & { id?: string };

const shellCardClassName =
  'rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-cyan-950/5 backdrop-blur-sm';
const DRAFT_STORAGE_KEY = 'medifranco.admin.case-study-editor-draft';

const emptyForm: CaseStudyFormState = {
  specialty: '',
  title: '',
  summary: '',
  detailTitle: '',
  detail: '',
  icon: 'smile',
  metric: '',
  metricLabel: '',
  before: '',
  after: '',
  image: '',
  imageAlt: '',
  featured: true,
};

export default function CaseStudiesPage() {
  const { caseStudies, setCaseStudies } = useCaseStudies();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(() => getStoredEditorDraft()?.open ?? false);
  const [form, setForm] = useState<CaseStudyFormState>(() => getStoredEditorDraft()?.form ?? emptyForm);

  useEffect(() => {
    if (!isDialogOpen) return;

    sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        open: true,
        form,
      })
    );
  }, [form, isDialogOpen]);

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return caseStudies;

    return caseStudies.filter((caseStudy) =>
      [caseStudy.title, caseStudy.specialty, caseStudy.summary]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [caseStudies, search]);

  const openNewDialog = () => {
    setForm(emptyForm);
    setIsDialogOpen(true);
    storeEditorDraft(emptyForm);
  };

  const openEditDialog = (caseStudy: CaseStudy) => {
    setForm(caseStudy);
    setIsDialogOpen(true);
    storeEditorDraft(caseStudy);
  };

  const updateField = <Key extends keyof CaseStudyFormState>(key: Key, value: CaseStudyFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Escolha um ficheiro de imagem.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Use uma imagem com menos de 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;

      setForm((current) => ({
        ...current,
        image: reader.result as string,
        imageAlt: current.imageAlt || file.name.replace(/\.[^/.]+$/, ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.specialty.trim() || !form.summary.trim()) {
      toast.error('Preencha pelo menos area, titulo e resumo.');
      return;
    }

    const nextCaseStudy: CaseStudy = {
      id: form.id ?? `case-${Date.now()}`,
      specialty: form.specialty.trim(),
      title: form.title.trim(),
      summary: form.summary.trim(),
      detailTitle: form.detailTitle.trim() || 'Mais informacao',
      detail: form.detail.trim(),
      icon: form.icon,
      metric: form.metric.trim(),
      metricLabel: form.metricLabel.trim(),
      before: form.before.trim(),
      after: form.after.trim(),
      image: form.image.trim(),
      imageAlt: form.imageAlt.trim() || form.title.trim(),
      featured: form.featured,
    };

    const exists = caseStudies.some((item) => item.id === nextCaseStudy.id);
    const nextCaseStudies = exists
      ? caseStudies.map((item) => (item.id === nextCaseStudy.id ? nextCaseStudy : item))
      : [nextCaseStudy, ...caseStudies];

    setCaseStudies(nextCaseStudies);
    closeEditor();
    toast.success(exists ? 'Caso atualizado com sucesso.' : 'Caso criado com sucesso.');
  };

  const closeEditor = () => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    setIsDialogOpen(false);
    setForm(emptyForm);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setIsDialogOpen(true);
      return;
    }

    if (document.visibilityState === 'hidden') {
      setIsDialogOpen(true);
      return;
    }

    closeEditor();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem a certeza que deseja remover este caso de estudo?')) return;

    setCaseStudies(caseStudies.filter((caseStudy) => caseStudy.id !== id));
    toast.success('Caso removido com sucesso.');
  };

  const handleReset = () => {
    if (!confirm('Repor os casos de estudo iniciais? As alteracoes locais serao removidas.')) return;

    resetCaseStudies();
    toast.success('Casos iniciais repostos.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MediFranco Case Library"
        title="Casos de Estudo"
        subtitle="Crie e edite os cards que aparecem na homepage e na pagina publica de casos."
        actions={
          <Button onClick={openNewDialog} className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
            <Plus className="mr-2 h-4 w-4" />
            Novo caso
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Casos</p>
          <p className="mt-3 font-display text-4xl text-slate-950">{caseStudies.length}</p>
          <p className="mt-2 text-sm text-slate-500">Itens disponiveis no site.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Em destaque</p>
          <p className="mt-3 font-display text-4xl text-slate-950">
            {caseStudies.filter((item) => item.featured !== false).length}
          </p>
          <p className="mt-2 text-sm text-slate-500">Podem aparecer na homepage.</p>
        </div>
        <div className={cn(shellCardClassName, 'p-5')}>
          <p className="text-sm text-slate-500">Pagina publica</p>
          <p className="mt-3 font-display text-2xl text-slate-950">/casos-estudo</p>
          <p className="mt-2 text-sm text-slate-500">Cada card abre uma ficha detalhada.</p>
        </div>
      </div>

      <div className={cn(shellCardClassName, 'p-5 lg:p-6')}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-950">Cards publicados</h2>
            <p className="mt-1 text-sm text-slate-500">Gerir texto, imagem, resumo, metricas e informacao do pop-up.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Pesquisar casos..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-slate-50" onClick={handleReset}>
              Repor iniciais
            </Button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredCases.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <BookOpenCheck className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-700">Nenhum caso encontrado</p>
            </div>
          ) : (
            filteredCases.map((caseStudy) => (
              <div key={caseStudy.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <img
                      src={caseStudy.image}
                      alt={caseStudy.imageAlt}
                      className="h-20 w-24 shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary">{caseStudy.specialty}</p>
                      <p className="mt-1 text-base font-semibold text-slate-950">{caseStudy.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{caseStudy.summary}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-2xl border-slate-200 bg-slate-50" onClick={() => openEditDialog(caseStudy)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-2xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" onClick={() => handleDelete(caseStudy.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-3xl"
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar caso de estudo' : 'Novo caso de estudo'}</DialogTitle>
            <DialogDescription>
              Estes dados alimentam o card publico e o pop-up de detalhe.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Area clinica">
              <Input value={form.specialty} onChange={(event) => updateField('specialty', event.target.value)} />
            </Field>
            <Field label="Icone">
              <select
                value={form.icon}
                onChange={(event) => updateField('icon', event.target.value as CaseStudyIcon)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="smile">Sorriso</option>
                <option value="eye">Olho</option>
                <option value="shield">Escudo</option>
              </select>
            </Field>
            <Field label="Titulo">
              <Input value={form.title} onChange={(event) => updateField('title', event.target.value)} />
            </Field>
            <Field label="Imagem" className="md:col-span-2">
              <div className="grid gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 sm:grid-cols-[11rem_1fr] sm:items-center">
                <div className="flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-white">
                  {form.image ? (
                    <img src={form.image} alt={form.imageAlt || 'Preview'} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Upload da imagem do card</p>
                    <p className="mt-1 text-sm text-slate-500">PNG, JPG ou WebP. Recomendado: imagem horizontal com menos de 2 MB.</p>
                  </div>
                  <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <Upload className="mr-2 h-4 w-4" />
                    Escolher imagem
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        handleImageUpload(event.target.files?.[0]);
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            </Field>
            <Field label="Texto alternativo da imagem">
              <Input value={form.imageAlt} onChange={(event) => updateField('imageAlt', event.target.value)} />
            </Field>
            <Field label="Metrica principal">
              <Input value={form.metric} onChange={(event) => updateField('metric', event.target.value)} />
            </Field>
            <Field label="Legenda da metrica">
              <Input value={form.metricLabel} onChange={(event) => updateField('metricLabel', event.target.value)} />
            </Field>
            <Field label="Antes">
              <Input value={form.before} onChange={(event) => updateField('before', event.target.value)} />
            </Field>
            <Field label="Depois">
              <Input value={form.after} onChange={(event) => updateField('after', event.target.value)} />
            </Field>
            <Field label="Destaque na homepage">
              <select
                value={form.featured === false ? 'false' : 'true'}
                onChange={(event) => updateField('featured', event.target.value === 'true')}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="true">Sim</option>
                <option value="false">Nao</option>
              </select>
            </Field>
            <Field label="Resumo" className="md:col-span-2">
              <Textarea rows={3} value={form.summary} onChange={(event) => updateField('summary', event.target.value)} />
            </Field>
            <Field label="Titulo do pop-up" className="md:col-span-2">
              <Input value={form.detailTitle} onChange={(event) => updateField('detailTitle', event.target.value)} />
            </Field>
            <Field label="Informacao do pop-up" className="md:col-span-2">
              <Textarea rows={5} value={form.detail} onChange={(event) => updateField('detail', event.target.value)} />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-2xl" onClick={closeEditor}>
              Cancelar
            </Button>
            <Button className="rounded-2xl" onClick={handleSave}>
              Guardar caso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getStoredEditorDraft(): { open: boolean; form: CaseStudyFormState } | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed?.open || !parsed?.form) return null;

    return parsed;
  } catch {
    return null;
  }
}

function storeEditorDraft(form: CaseStudyFormState) {
  sessionStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({
      open: true,
      form,
    })
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</Label>
      {children}
    </div>
  );
}
