import { supabase } from './supabase'

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const isStripeConfigured = !!stripePublicKey

/**
 * Redirects to Stripe Checkout or falls back to mock enrollment.
 * Dev (no key): enrolls directly. Prod (with key): Edge Function creates Checkout Session.
 */
export async function redirectToCheckout(
    courseId: string,
    userId: string,
    courseTitle: string,
    priceCents: number
): Promise<{ success: boolean; redirectUrl: string }> {
    if (!stripePublicKey) {
        const { error } = await supabase.from('academy_enrollments').insert({
            user_id: userId,
            course_id: courseId,
            stripe_session_id: `mock_session_${Date.now()}`,
        })

        if (error) {
            console.error('Mock enrollment failed:', error)
            return { success: false, redirectUrl: `/checkout/cancel?courseId=${courseId}` }
        }

        return {
            success: true,
            redirectUrl: `/checkout/success?courseId=${courseId}&mock=true`,
        }
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { courseId, courseTitle, priceCents },
    })

    if (error || !data?.checkoutUrl) {
        console.error('Checkout session creation failed:', error)
        return { success: false, redirectUrl: `/checkout/cancel?courseId=${courseId}` }
    }

    window.location.href = data.checkoutUrl
    return { success: true, redirectUrl: '' }
}
