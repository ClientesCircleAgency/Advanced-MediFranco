import { TeamMember } from '@/types';

export type TeamCategory = 'todos' | 'oftalmologia' | 'dentaria' | 'outros';

export interface TeamMemberExtended extends TeamMember {
  category: TeamCategory;
  initials: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: 'antonio-franco',
    name: 'Dr. António Franco',
    role: 'Director Geral',
    specialty: 'Oftalmologia',
    image: '',
    shortBio: 'Fundador da MediFranco, com mais de 25 anos dedicados à oftalmologia e à medicina humanizada.',
    bio: 'O Dr. António Franco fundou a MediFranco em 2000, trazendo consigo uma visão de medicina enraizada em valores humanos. Com formação especializada em oftalmologia, é o rosto de uma clínica que prioriza a relação médico-paciente e o diagnóstico interdisciplinar.',
  },
  {
    id: 'pedro-gomes',
    name: 'Dr. Pedro Gomes',
    role: 'Oftalmologista',
    specialty: 'Oftalmologia',
    image: '',
    shortBio: 'Especialista em oftalmologia com foco em diagnóstico e tratamento de patologias oculares.',
    bio: 'O Dr. Pedro Gomes é oftalmologista na MediFranco, dedicando-se ao diagnóstico e tratamento de diversas patologias oculares. A sua abordagem combina rigor clínico com atenção personalizada a cada paciente.',
  },
  {
    id: 'claudia-patricio',
    name: 'Cláudia Patrício',
    role: 'Optometrista',
    specialty: 'Oftalmologia',
    image: '',
    shortBio: 'Responsável pela optometria, exames de acuidade visual e adaptação de lentes de contacto.',
    bio: 'Cláudia Patrício é optometrista na MediFranco, especializando-se em testes de visão, correcção visual e adaptação personalizada de lentes de contacto para máximo conforto dos pacientes.',
  },
  {
    id: 'joao-oliveira',
    name: 'João Oliveira',
    role: 'Ortoptista',
    specialty: 'Oftalmologia',
    image: '',
    shortBio: 'Especialista em ortóptica, tratamento de músculos oculares e alinhamento visual.',
    bio: 'João Oliveira é ortoptista na MediFranco, dedicando-se ao diagnóstico e tratamento de distúrbios da motilidade ocular e do alinhamento visual, trabalhando em colaboração com a equipa de oftalmologia.',
  },
  {
    id: 'helena-franco',
    name: 'Drª. Helena Franco',
    role: 'Directora Clínica',
    specialty: 'Medicina Dentária',
    image: '',
    shortBio: 'Directora clínica e especialista em periodontologia, com foco na saúde gengival e prevenção.',
    bio: 'A Drª. Helena Franco é a directora clínica da MediFranco e especialista em periodontologia. Lidera a equipa de medicina dentária com uma abordagem preventiva, focando-se no tratamento de doenças gengivais e na manutenção da saúde oral a longo prazo.',
  },
  {
    id: 'pedro-franco',
    name: 'Dr. Pedro Franco',
    role: 'Dentística Estética e Reabilitação Oral',
    specialty: 'Medicina Dentária',
    image: '',
    shortBio: 'Especializado em dentística estética e reabilitação oral fixa, devolvendo sorrisos naturais.',
    bio: 'O Dr. Pedro Franco é especialista em dentística estética e reabilitação oral fixa na MediFranco. Combina técnicas avançadas de restauração com um olhar artístico para devolver sorrisos naturais e harmoniosos aos seus pacientes.',
  },
  {
    id: 'nuno-bangola',
    name: 'Dr. Nuno Bangola',
    role: 'Cirurgião Oral',
    specialty: 'Medicina Dentária',
    image: '',
    shortBio: 'Especialista em cirurgia oral, incluindo extracções complexas e procedimentos cirúrgicos.',
    bio: 'O Dr. Nuno Bangola é cirurgião oral na MediFranco, realizando procedimentos cirúrgicos que incluem extracções complexas, cirurgias pré-protéticas e tratamento de patologias da cavidade oral com precisão e segurança.',
  },
  {
    id: 'andre-lima',
    name: 'Dr. André Lima',
    role: 'Cirurgia Oral, Implantologia e Endodontia',
    specialty: 'Medicina Dentária',
    image: '',
    shortBio: 'Tripla especialização em cirurgia oral, implantologia e endodontia para tratamentos abrangentes.',
    bio: 'O Dr. André Lima é um profissional multifacetado na MediFranco, com especialização em cirurgia oral, implantologia e endodontia. Esta tripla competência permite-lhe oferecer soluções integradas, desde implantes dentários até tratamentos de canais radiculares.',
  },
  {
    id: 'vitor-coimbra',
    name: 'Dr. Vítor Coimbra',
    role: 'Endodontista',
    specialty: 'Medicina Dentária',
    image: '',
    shortBio: 'Especialista em endodontia, dedicado ao tratamento de canais e preservação dentária.',
    bio: 'O Dr. Vítor Coimbra é especialista em endodontia na MediFranco, focando-se no tratamento de canais radiculares para preservar dentes danificados. Utiliza técnicas modernas e equipamento de precisão para tratamentos eficazes e confortáveis.',
  },
  {
    id: 'joao-cipriano',
    name: 'João Cipriano',
    role: 'Higienista Oral',
    specialty: 'Medicina Dentária',
    image: '',
    shortBio: 'Responsável pela higiene oral preventiva, limpezas profissionais e educação para a saúde.',
    bio: 'João Cipriano é higienista oral na MediFranco, dedicando-se à prevenção de doenças orais através de limpezas profissionais, destartarizações e educação dos pacientes sobre boas práticas de higiene oral diária.',
  },
];

export const teamMembersExtended: TeamMemberExtended[] = teamMembers.map((member) => ({
  ...member,
  category: (['Dr. António Franco', 'Dr. Pedro Gomes', 'Cláudia Patrício', 'João Oliveira'].includes(member.name)
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
  'pedro-gomes',
  'claudia-patricio',
  'joao-oliveira',
];
