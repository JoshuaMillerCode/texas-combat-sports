export interface TicketTier {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  stripePriceId: string
  maxQuantity: number
}

export interface CheckoutSessionData {
  eventId: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  tickets: {
    tierName: string
    quantity: number
    price: number
    stripePriceId: string
  }[]
  customerEmail?: string
}

export interface StripeCheckoutSession {
  id: string
  url: string
}
