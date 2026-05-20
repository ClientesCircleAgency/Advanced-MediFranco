export type CaseStudyIcon = 'smile' | 'eye' | 'shield';

export interface CaseStudy {
  id: string;
  specialty: string;
  title: string;
  summary: string;
  detailTitle: string;
  detail: string;
  icon: CaseStudyIcon;
  metric: string;
  metricLabel: string;
  before: string;
  after: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
}
