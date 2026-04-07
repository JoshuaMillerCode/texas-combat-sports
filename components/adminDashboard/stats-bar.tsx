"use client"

import { useStatsQuery } from "@/hooks/use-queries"
import { DollarSign, Ticket, ShoppingBag, Calendar, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

function fmt(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

export default function StatsBar() {
  const { data, isLoading } = useStatsQuery()

  const stats = [
    {
      label: 'Total Revenue',
      value: isLoading ? '—' : fmt(data?.overview?.total?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Tickets Sold',
      value: isLoading ? '—' : (data?.overview?.total?.totalTickets ?? 0).toLocaleString(),
      icon: Ticket,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Total Orders',
      value: isLoading ? '—' : (data?.overview?.total?.totalTransactions ?? 0).toLocaleString(),
      icon: ShoppingBag,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Upcoming Events',
      value: isLoading ? '—' : (data?.upcomingEventsCount ?? 0).toLocaleString(),
      icon: Calendar,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      sub: data?.nextEvent ? new Date(data.nextEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 flex items-center gap-3">
          <div className={`${stat.bg} rounded-md p-2 flex-shrink-0`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{stat.label}</p>
            <p className="text-lg font-semibold text-white leading-tight">{stat.value}</p>
            {stat.sub && <p className="text-xs text-gray-500">Next: {stat.sub}</p>}
          </div>
        </div>
      ))}

      <Link
        href="/admin/analytics"
        className="hidden md:flex col-span-4 items-center justify-end gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors mt-0.5"
      >
        <TrendingUp className="h-3 w-3" />
        Full analytics
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
