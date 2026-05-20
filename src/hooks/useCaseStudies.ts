import { useEffect, useState } from 'react';
import { defaultCaseStudies } from '@/data/caseStudies';
import { supabase } from '@/integrations/supabase/client';
import type { CaseStudy } from '@/types/caseStudy';

const STORAGE_KEY = 'medifranco.case-studies.v1';
const UPDATE_EVENT = 'medifranco-case-studies-updated';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredCaseStudies(): CaseStudy[] {
  if (!canUseStorage()) return defaultCaseStudies;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultCaseStudies;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCaseStudies;
  } catch {
    return defaultCaseStudies;
  }
}

export function saveCaseStudies(caseStudies: CaseStudy[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(caseStudies));
  window.dispatchEvent(new Event(UPDATE_EVENT));
  persistCaseStudies(caseStudies);
}

export function resetCaseStudies() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
  persistCaseStudies(defaultCaseStudies);
}

export function useCaseStudies() {
  const [caseStudies, setCaseStudiesState] = useState<CaseStudy[]>(() => getStoredCaseStudies());

  useEffect(() => {
    const sync = () => setCaseStudiesState(getStoredCaseStudies());

    window.addEventListener('storage', sync);
    window.addEventListener(UPDATE_EVENT, sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(UPDATE_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchCaseStudies().then((remoteCaseStudies) => {
      if (cancelled || remoteCaseStudies.length === 0) return;
      setCaseStudiesState(remoteCaseStudies);

      if (canUseStorage()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteCaseStudies));
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setCaseStudies = (nextCaseStudies: CaseStudy[]) => {
    saveCaseStudies(nextCaseStudies);
    setCaseStudiesState(nextCaseStudies);
  };

  return { caseStudies, setCaseStudies };
}

type CaseStudyRow = {
  id: string;
  specialty: string;
  title: string;
  summary: string;
  detail_title: string;
  detail: string;
  icon: CaseStudy['icon'];
  metric: string;
  metric_label: string;
  before: string;
  after: string;
  image: string;
  image_alt: string;
  featured: boolean;
  sort_order: number;
};

function toCaseStudy(row: CaseStudyRow): CaseStudy {
  return {
    id: row.id,
    specialty: row.specialty,
    title: row.title,
    summary: row.summary,
    detailTitle: row.detail_title,
    detail: row.detail,
    icon: row.icon,
    metric: row.metric,
    metricLabel: row.metric_label,
    before: row.before,
    after: row.after,
    image: row.image,
    imageAlt: row.image_alt,
    featured: row.featured,
  };
}

function toRow(caseStudy: CaseStudy, sortOrder: number): CaseStudyRow {
  return {
    id: caseStudy.id,
    specialty: caseStudy.specialty,
    title: caseStudy.title,
    summary: caseStudy.summary,
    detail_title: caseStudy.detailTitle,
    detail: caseStudy.detail,
    icon: caseStudy.icon,
    metric: caseStudy.metric,
    metric_label: caseStudy.metricLabel,
    before: caseStudy.before,
    after: caseStudy.after,
    image: caseStudy.image,
    image_alt: caseStudy.imageAlt,
    featured: caseStudy.featured !== false,
    sort_order: sortOrder,
  };
}

async function fetchCaseStudies(): Promise<CaseStudy[]> {
  const { data, error } = await supabase
    .from('case_studies' as never)
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];

  return (data as CaseStudyRow[]).map(toCaseStudy);
}

async function persistCaseStudies(caseStudies: CaseStudy[]) {
  const rows = caseStudies.map((caseStudy, index) => toRow(caseStudy, index));

  const { error: deleteError } = await supabase.from('case_studies' as never).delete().neq('id', '');
  if (deleteError) return;

  await supabase.from('case_studies' as never).upsert(rows as never);
}
