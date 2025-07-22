import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(req: NextRequest) {
  try {
    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured")
      return NextResponse.json({ error: "Payment system configuration error" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Validate session ID format (Stripe session IDs start with 'cs_')
    if (!sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error retrieving session:", error)

    if (error instanceof Stripe.errors.StripeError) {
      const statusCode = error.statusCode || 500
      const message = error.message || "Failed to retrieve session"

      return NextResponse.json({ error: message }, { status: statusCode })
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
