import { supabase } from './supabase'

/**
 * Mock checkout - simulates Stripe Checkout behavior
 * In Phase 2, this will be replaced with real Stripe integration
 */
export async function mockCheckout(courseId: string, userId: string): Promise<{ success: boolean; redirectUrl: string }> {
    // Log the event
    await emitEvent('checkout.initiated', { courseId, userId })

    // Get configured success URL or default
    const successUrl = import.meta.env.VITE_SUCCESS_URL || '/dashboard?enrolled=true'

    // Simulate a small delay (like a real checkout would have)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock: directly create enrollment (in real app, this happens after webhook)
    const { error } = await supabase.from('academy_enrollments').insert({
        user_id: userId,
        course_id: courseId,
        stripe_session_id: `mock_session_${Date.now()}`
    })

    if (error) {
        console.error('Failed to create enrollment:', error)
        await emitEvent('checkout.failed', { courseId, userId, error: error.message })
        return { success: false, redirectUrl: import.meta.env.VITE_CANCEL_URL || '/catalog?error=true' }
    }

    await emitEvent('checkout.completed', { courseId, userId })

    return { success: true, redirectUrl: successUrl }
}

/**
 * Emit event - logs events for future n8n integration
 * In Phase 2, this will be replaced with real webhook calls
 */
export async function emitEvent(eventType: string, payload: object): Promise<void> {
    // Always log to console for debugging
    console.log(`[Academy Event] ${eventType}:`, payload)

    // Optionally log to database for audit trail
    try {
        await supabase.from('academy_integration_logs').insert({
            event_type: eventType,
            payload
        })
    } catch (e) {
        console.warn('Failed to log event to DB (table may not exist yet):', e)
    }
}

/**
 * Mock "coming soon" checkout for courses not yet available
 */
export function comingSoonCheckout(): Promise<{ success: boolean; message: string }> {
    return Promise.resolve({
        success: false,
        message: 'Este curso estará disponível em breve. Registe-se para ser notificado!'
    })
}
