import { NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/billing/stripeClient'
import { recordStripePayment } from '@/lib/services/workOrderService'

export const POST = async (request) => {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ message: 'Stripe webhook is not configured.' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  const body = await request.text()

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    try {
      await recordStripePayment(event.data.object)
    } catch (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
