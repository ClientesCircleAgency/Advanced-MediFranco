import dentalFinalResultImg from '@/assets/clinical-cases/dental-final-result.png';
import ophthalmologyFinalResultImg from '@/assets/clinical-cases/ophthalmology-final-result.png';
import familyFinalResultImg from '@/assets/clinical-cases/family-final-result.png';
import type { CaseStudy } from '@/types/caseStudy';

export const defaultCaseStudies: CaseStudy[] = [
  {
    id: 'dental-reabilitacao-estetica-funcional',
    specialty: 'Medicina Dentaria',
    title: 'Reabilitacao estetica e funcional',
    summary:
      'Plano combinado para devolver seguranca ao sorriso, com foco em funcao mastigatoria, proporcao e naturalidade.',
    detailTitle: 'Planeamento por fases',
    detail:
      'Exemplo editorial de acompanhamento clinico. A equipa organiza diagnostico, prioridades funcionais e expectativas esteticas antes de definir as etapas do plano. Cada caso deve ser avaliado individualmente em consulta.',
    icon: 'smile',
    metric: '3 fases',
    metricLabel: 'Diagnostico, tratamento e revisao',
    before: 'Desconforto ao sorrir',
    after: 'Sorriso mais estavel',
    image: dentalFinalResultImg,
    imageAlt: 'Planeamento de caso clinico de medicina dentaria',
    featured: true,
  },
  {
    id: 'oftalmologia-acompanhamento-cataratas',
    specialty: 'Oftalmologia',
    title: 'Acompanhamento de cataratas',
    summary:
      'Avaliacao clinica, exames complementares e orientacao clara para uma decisao medica mais tranquila.',
    detailTitle: 'Avaliacao visual completa',
    detail:
      'O acompanhamento privilegia avaliacao clinica, exames complementares e explicacao clara das opcoes disponiveis. A decisao terapeutica depende sempre da observacao medica e das necessidades de cada pessoa.',
    icon: 'eye',
    metric: '360',
    metricLabel: 'Avaliacao visual completa',
    before: 'Visao turva',
    after: 'Plano de tratamento claro',
    image: ophthalmologyFinalResultImg,
    imageAlt: 'Avaliacao oftalmologica para cataratas',
    featured: true,
  },
  {
    id: 'saude-integrada-prevencao-familia',
    specialty: 'Saude integrada',
    title: 'Prevencao em familia',
    summary:
      'Consultas coordenadas para diferentes idades, reduzindo atrasos no diagnostico e simplificando o seguimento.',
    detailTitle: 'Seguimento no mesmo espaco',
    detail:
      'A coordenacao entre areas clinicas ajuda a reduzir dispersao, melhorar o seguimento e orientar cada pessoa para a consulta indicada. A informacao apresentada e ilustrativa e nao substitui aconselhamento profissional.',
    icon: 'shield',
    metric: '1 equipa',
    metricLabel: 'Duas areas clinicas no mesmo espaco',
    before: 'Consultas dispersas',
    after: 'Seguimento centralizado',
    image: familyFinalResultImg,
    imageAlt: 'Consulta clinica integrada na MediFranco',
    featured: true,
  },
];
