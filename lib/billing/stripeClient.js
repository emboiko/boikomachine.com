import Stripe from 'stripe'

let stripeClient = null
let stripeClientKey = ''

export const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    return null
  }

  if (!stripeClient || stripeClientKey !== secretKey) {
    stripeClient = new Stripe(secretKey)
    stripeClientKey = secretKey
  }

  return stripeClient
}
