import { Service } from '@/types';

// Dental service images
import ortodontiaImg from '@/assets/services/ortodontia.png';
import implantologiaImg from '@/assets/services/implantologia.png';
import branqueamentoImg from '@/assets/services/branqueamento.png';
import protesesImg from '@/assets/services/proteses.png';
import endodontiaImg from '@/assets/services/endodontia.png';
import cirurgiaOralImg from '@/assets/services/cirurgia-oral.png';

// Ophthalmology service images
import consultaOftalmologiaImg from '@/assets/services/consulta-oftalmologia.png';
import cirurgiaRefrativaImg from '@/assets/services/cirurgia-refrativa.png';
import cataratasImg from '@/assets/services/cataratas.png';
import glaucomaImg from '@/assets/services/glaucoma.png';
import retinopatiaImg from '@/assets/services/retinopatia.png';
import lentesContactoImg from '@/assets/services/lentes-contacto.png';

export const dentalServices: Service[] = [
  {
    id: 'ortodontia',
    name: 'Ortodontia',
    description: 'Correção de má oclusão e alinhamento dentário com aparelhos fixos, removíveis e alinhadores invisíveis.',
    icon: 'Smile',
    category: 'dentaria',
    image: ortodontiaImg,
  },
  {
    id: 'implantologia',
    name: 'Implantologia',
    description: 'Substituição de dentes perdidos por implantes de titânio, devolvendo função e estética natural.',
    icon: 'CircleDot',
    category: 'dentaria',
    image: implantologiaImg,
  },
  {
    id: 'branqueamento',
    name: 'Branqueamento',
    description: 'Técnicas avançadas para clarear os dentes de forma segura e eficaz, com resultados duradouros.',
    icon: 'Sparkles',
    category: 'dentaria',
    image: branqueamentoImg,
  },
  {
    id: 'proteses',
    name: 'Próteses Dentárias',
    description: 'Soluções removíveis ou fixas para substituir dentes em falta e recuperar a função mastigatória.',
    icon: 'LayoutGrid',
    category: 'dentaria',
    image: protesesImg,
  },
  {
    id: 'endodontia',
    name: 'Endodontia',
    description: 'Tratamento de canais radiculares para salvar dentes danificados por cáries profundas ou traumas.',
    icon: 'Target',
    category: 'dentaria',
    image: endodontiaImg,
  },
  {
    id: 'cirurgia-oral',
    name: 'Cirurgia Oral',
    description: 'Extração de sisos, cirurgias pré-protéticas e tratamento de patologias da cavidade oral.',
    icon: 'Scissors',
    category: 'dentaria',
    image: cirurgiaOralImg,
  },
];

export const ophthalmologyServices: Service[] = [
  {
    id: 'consulta-oftalmologia',
    name: 'Consultas de Oftalmologia',
    description: 'Avaliação completa da saúde visual, incluindo exames de acuidade visual e fundo de olho.',
    icon: 'Eye',
    category: 'oftalmologia',
    image: consultaOftalmologiaImg,
  },
  {
    id: 'cirurgia-refrativa',
    name: 'Cirurgia Refrativa',
    description: 'Correção de miopia, hipermetropia e astigmatismo com tecnologia laser de última geração.',
    icon: 'Zap',
    category: 'oftalmologia',
    image: cirurgiaRefrativaImg,
  },
  {
    id: 'cataratas',
    name: 'Cirurgia de Cataratas',
    description: 'Remoção do cristalino opaco e implante de lente intraocular para visão nítida.',
    icon: 'Sun',
    category: 'oftalmologia',
    image: cataratasImg,
  },
  {
    id: 'glaucoma',
    name: 'Tratamento de Glaucoma',
    description: 'Diagnóstico precoce e tratamento para controlar a pressão intraocular e prevenir perda visual.',
    icon: 'Gauge',
    category: 'oftalmologia',
    image: glaucomaImg,
  },
  {
    id: 'retinopatia',
    name: 'Retinopatia',
    description: 'Tratamento de doenças da retina, incluindo degeneração macular e retinopatia diabética.',
    icon: 'Focus',
    category: 'oftalmologia',
    image: retinopatiaImg,
  },
  {
    id: 'lentes-contacto',
    name: 'Lentes de Contacto',
    description: 'Adaptação personalizada de lentes de contacto para correção visual e conforto máximo.',
    icon: 'Circle',
    category: 'oftalmologia',
    image: lentesContactoImg,
  },
];

export const allServices = [...dentalServices, ...ophthalmologyServices];
