import type { Course } from '../types'

export const mockCourses: Course[] = [
    {
        id: 'course-1',
        title: 'Curso Exemplo: Fundamentos de Saúde',
        slug: 'fundamentos-saude',
        description: 'Um curso completo sobre os fundamentos essenciais da saúde e bem-estar. Aprenda conceitos básicos de anatomia, fisiologia e prevenção.',
        price_cents: 9900,
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
        is_published: true,
        created_at: '2026-01-01T10:00:00Z',
        modules: [
            {
                id: 'mod-1-1',
                course_id: 'course-1',
                title: 'Introdução ao Curso',
                order: 1,
                lessons: [
                    { id: 'les-1-1-1', module_id: 'mod-1-1', title: 'Boas-vindas', content_type: 'video', content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1, duration_minutes: 5 },
                    { id: 'les-1-1-2', module_id: 'mod-1-1', title: 'Objetivos do Curso', content_type: 'video', content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 2, duration_minutes: 8 },
                ]
            },
            {
                id: 'mod-1-2',
                course_id: 'course-1',
                title: 'Conceitos Básicos',
                order: 2,
                lessons: [
                    { id: 'les-1-2-1', module_id: 'mod-1-2', title: 'Anatomia Básica', content_type: 'video', content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1, duration_minutes: 15 },
                    { id: 'les-1-2-2', module_id: 'mod-1-2', title: 'Fisiologia Essencial', content_type: 'video', content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 2, duration_minutes: 20 },
                    { id: 'les-1-2-3', module_id: 'mod-1-2', title: 'Material de Apoio', content_type: 'pdf', content_url: '/docs/material-apoio.pdf', order: 3, duration_minutes: 0 },
                ]
            }
        ]
    },
    {
        id: 'course-2',
        title: 'Curso Exemplo: Técnicas Avançadas',
        slug: 'tecnicas-avancadas',
        description: 'Aprofunde os seus conhecimentos com técnicas avançadas e práticas especializadas. Ideal para profissionais que querem expandir competências.',
        price_cents: 14900,
        image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
        is_published: true,
        created_at: '2026-01-05T10:00:00Z',
        modules: [
            {
                id: 'mod-2-1',
                course_id: 'course-2',
                title: 'Revisão de Fundamentos',
                order: 1,
                lessons: [
                    { id: 'les-2-1-1', module_id: 'mod-2-1', title: 'Resumo do Curso Anterior', content_type: 'video', content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1, duration_minutes: 10 },
                ]
            },
            {
                id: 'mod-2-2',
                course_id: 'course-2',
                title: 'Técnicas Especializadas',
                order: 2,
                lessons: [
                    { id: 'les-2-2-1', module_id: 'mod-2-2', title: 'Técnica A', content_type: 'video', content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 1, duration_minutes: 25 },
                    { id: 'les-2-2-2', module_id: 'mod-2-2', title: 'Técnica B', content_type: 'video', content_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', order: 2, duration_minutes: 30 },
                ]
            }
        ]
    }
]

export function getCourseBySlug(slug: string): Course | undefined {
    return mockCourses.find(c => c.slug === slug)
}

export function getCourseById(id: string): Course | undefined {
    return mockCourses.find(c => c.id === id)
}
