import { TeamMember } from '@/types';
import antonioFrancoImg from '@/assets/team-portraits/antonio-franco.png';
import claudiaPatricioImg from '@/assets/team-portraits/claudia-patricio.png';
import joaoOliveiraImg from '@/assets/team-portraits/joao-oliveira.png';
import helenaFrancoImg from '@/assets/team-portraits/helena-franco.png';
import pedroFrancoImg from '@/assets/team-portraits/pedro-franco.png';
import nunoBangolaImg from '@/assets/team-portraits/nuno-bangola.png';
import andreLimaImg from '@/assets/team-portraits/andre-lima.png';
import vitorCoimbraImg from '@/assets/team-portraits/vitor-coimbra.png';
import joaoCiprianoImg from '@/assets/team-portraits/joao-cipriano.png';

export type TeamCategory = 'todos' | 'oftalmologia' | 'dentaria' | 'outros';

export interface TeamMemberExtended extends TeamMember {
  category: TeamCategory;
  initials: string;
}

const teamMembersBase: TeamMember[] = [
  {
    id: 'antonio-franco',
    name: 'Dr. António Franco',
    role: 'Director Geral',
    specialty: 'Oftalmologia',
    image: antonioFrancoImg,
    shortBio: 'Fundador da MediFranco, com mais de 25 anos dedicados à oftalmologia e à medicina humanizada.',
    bio: 'O Dr. António Franco fundou a MediFranco em 2000, trazendo consigo uma visão de medicina enraizada em valores humanos. Com formação especializada em oftalmologia, é o rosto de uma clínica que prioriza a relação médico-paciente e o diagnóstico interdisciplinar.',
  },
  {
    id: 'claudia-patricio',
    name: 'Cláudia Patrício',
    role: 'Optometrista',
    specialty: 'Oftalmologia',
    image: claudiaPatricioImg,
    shortBio: 'Responsável pela optometria, exames de acuidade visual e adaptação de lentes de contacto.',
    bio: 'Cláudia Patrício é optometrista na MediFranco, especializando-se em testes de visão, correcção visual e adaptação personalizada de lentes de contacto para máximo conforto dos pacientes.',
  },
  {
    id: 'joao-oliveira',
    name: 'João Oliveira',
    role: 'Ortoptista',
    specialty: 'Oftalmologia',
    image: joaoOliveiraImg,
    shortBio: 'Especialista em ortóptica, tratamento de músculos oculares e alinhamento visual.',
    bio: 'João Oliveira é ortoptista na MediFranco, dedicando-se ao diagnóstico e tratamento de distúrbios da motilidade ocular e do alinhamento visual, trabalhando em colaboração com a equipa de oftalmologia.',
  },
  {
    id: 'helena-franco',
    name: 'Drª. Helena Franco',
    role: 'Directora Clínica',
    specialty: 'Medicina Dentária',
    image: helenaFrancoImg,
    shortBio: 'Directora clínica e especialista em periodontologia, com foco na saúde gengival e prevenção.',
    bio: 'A Drª. Helena Franco é a directora clínica da MediFranco e especialista em periodontologia. Lidera a equipa de medicina dentária com uma abordagem preventiva, focando-se no tratamento de doenças gengivais e na manutenção da saúde oral a longo prazo.',
  },
  {
    id: 'pedro-franco',
    name: 'Dr. Pedro Franco',
    role: 'Dentística Estética e Reabilitação Oral',
    specialty: 'Medicina Dentária',
    image: pedroFrancoImg,
    shortBio: 'Especializado em dentística estética e reabilitação oral fixa, devolvendo sorrisos naturais.',
    bio: 'O Dr. Pedro Franco é especialista em dentística estética e reabilitação oral fixa na MediFranco. Combina técnicas avançadas de restauração com um olhar artístico para devolver sorrisos naturais e harmoniosos aos seus pacientes.',
  },
  {
    id: 'nuno-bangola',
    name: 'Dr. Nuno Bangola',
    role: 'Cirurgião Oral',
    specialty: 'Medicina Dentária',
    image: nunoBangolaImg,
    shortBio: 'Especialista em cirurgia oral, incluindo extracções complexas e procedimentos cirúrgicos.',
    bio: 'O Dr. Nuno Bangola é cirurgião oral na MediFranco, realizando procedimentos cirúrgicos que incluem extracções complexas, cirurgias pré-protéticas e tratamento de patologias da cavidade oral com precisão e segurança.',
  },
  {
    id: 'andre-lima',
    name: 'Dr. André Lima',
    role: 'Cirurgia Oral, Implantologia e Endodontia',
    specialty: 'Medicina Dentária',
    image: andreLimaImg,
    shortBio: 'Tripla especialização em cirurgia oral, implantologia e endodontia para tratamentos abrangentes.',
    bio: 'O Dr. André Lima é um profissional multifacetado na MediFranco, com especialização em cirurgia oral, implantologia e endodontia. Esta tripla competência permite-lhe oferecer soluções integradas, desde implantes dentários até tratamentos de canais radiculares.',
  },
  {
    id: 'vitor-coimbra',
    name: 'Dr. Vítor Coimbra',
    role: 'Endodontista',
    specialty: 'Medicina Dentária',
    image: vitorCoimbraImg,
    shortBio: 'Especialista em endodontia, dedicado ao tratamento de canais e preservação dentária.',
    bio: 'O Dr. Vítor Coimbra é especialista em endodontia na MediFranco, focando-se no tratamento de canais radiculares para preservar dentes danificados. Utiliza técnicas modernas e equipamento de precisão para tratamentos eficazes e confortáveis.',
  },
  {
    id: 'joao-cipriano',
    name: 'Dr. João Cipriano',
    role: 'Higienista Oral',
    specialty: 'Medicina Dentária',
    image: joaoCiprianoImg,
    shortBio: 'Responsável pela higiene oral preventiva, limpezas profissionais e educação para a saúde.',
    bio: 'O Dr. João Cipriano é higienista oral na MediFranco, dedicando-se à prevenção de doenças orais através de limpezas profissionais, destartarizações e educação dos pacientes sobre boas práticas de higiene oral diária.',
  },
];

const ownerPriority = ['antonio-franco', 'helena-franco', 'pedro-franco'];

export const teamMembers: TeamMember[] = [...teamMembersBase].sort((a, b) => {
  const aPriority = ownerPriority.indexOf(a.id);
  const bPriority = ownerPriority.indexOf(b.id);

  if (aPriority !== -1 || bPriority !== -1) {
    return (aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority)
      - (bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority);
  }

  return teamMembersBase.indexOf(a) - teamMembersBase.indexOf(b);
});

export const teamMembersExtended: TeamMemberExtended[] = teamMembers.map((member) => ({
  ...member,
  category: (['antonio-franco', 'claudia-patricio', 'joao-oliveira'].includes(member.id)
    ? 'oftalmologia'
    : 'dentaria') as TeamCategory,
  initials: member.name
    .replace(/^(Dr\.|Drª\.|Dr\.ª)\s*/i, '')
    .split(' ')
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map((n) => n[0])
    .join('')
    .toUpperCase(),
}));

export function getTeamByCategory(category: TeamCategory): TeamMemberExtended[] {
  if (category === 'todos') return teamMembersExtended;
  return teamMembersExtended.filter((m) => m.category === category);
}

export const dentalTeamIds = [
  'helena-franco',
  'pedro-franco',
  'nuno-bangola',
  'andre-lima',
  'vitor-coimbra',
  'joao-cipriano',
];

export const ophthalmologyTeamIds = [
  'antonio-franco',
  'claudia-patricio',
  'joao-oliveira',
];
