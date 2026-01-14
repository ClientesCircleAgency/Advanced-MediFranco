export interface Course {
    id: string
    title: string
    slug: string
    description: string
    price_cents: number
    image_url: string
    is_published: boolean
    created_at: string
    updated_at?: string
    modules?: Module[]
}

export interface Module {
    id: string
    course_id: string
    title: string
    order: number
    created_at?: string
    lessons?: Lesson[]
}

export interface Lesson {
    id: string
    module_id: string
    title: string
    content_type: 'video' | 'pdf' | 'text'
    content_url: string
    order: number
    duration_minutes?: number
    created_at?: string
}

export interface Enrollment {
    id: string
    user_id: string
    course_id: string
    stripe_session_id?: string
    stripe_customer_id?: string
    stripe_payment_intent_id?: string
    enrolled_at: string
    expires_at?: string
    course?: Course
}

export interface Progress {
    id: string
    user_id: string
    lesson_id: string
    completed_at: string
}

export interface User {
    id: string
    email: string
    name?: string
}
