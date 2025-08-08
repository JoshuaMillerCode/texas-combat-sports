import EventDetailClient from "@/components/events/event-detail-client"

export default function EventDetailPage({ params }: { params: { slug: string } }) {

  return <EventDetailClient params={params} />
}
