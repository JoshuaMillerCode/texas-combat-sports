"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useStatsQuery } from "@/hooks/use-queries"
import { ArrowLeft, Loader2, DollarSign, Ticket, ShoppingBag, TrendingUp, RefreshCw, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"

function fmt(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}
function fmtShort(cents: number) {
  if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}k`
  return fmt(cents)
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',
  pending: '#eab308',
  refunded: '#ef4444',
  cancelled: '#6b7280',
}
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DATE_RANGES = [
  { label: '7d',  value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: 'All', value: 'all' as const },
]

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [days, setDays] = useState<number | 'all'>('all')
  const { data, isLoading, refetch } = useStatsQuery(days)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/admin/login'
    }
  }, [isAuthenticated, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  const overview = data?.overview?.total ?? {}
  const tickets = data?.overview?.tickets ?? {}
  const analytics = data?.analytics ?? {}
  const dailyRevenue: any[] = data?.dailyRevenue ?? []
  const revenueByEvent: any[] = data?.revenueByEvent ?? []

  const revenueChartData = dailyRevenue.map((d: any) => ({
    date: new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Math.round(d.totalRevenue / 100),
    tickets: d.totalTickets,
  }))

  const monthlyData = (analytics.monthlyTrends ?? [])
    .slice().reverse()
    .map((m: any) => ({
      month: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
      revenue: Math.round(m.revenue / 100),
      transactions: m.transactions,
      tickets: m.tickets,
    }))

  const statusData = (analytics.statusBreakdown ?? []).map((s: any) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
    color: STATUS_COLORS[s._id] ?? '#6b7280',
  }))

  // Merge any remaining duplicate tier names (e.g. promo deals sharing a tierId with GA)
  const mergedTiers = Object.values(
    (analytics.topTicketTiers ?? []).reduce((acc: any, tier: any) => {
      const name = tier.tierName
      if (acc[name]) {
        acc[name].totalSold += tier.totalSold
        acc[name].revenue += tier.revenue
        acc[name].promoRevenue += tier.promoRevenue ?? 0
      } else {
        acc[name] = { name, totalSold: tier.totalSold, revenue: tier.revenue, promoRevenue: tier.promoRevenue ?? 0 }
      }
      return acc
    }, {})
  ).sort((a: any, b: any) => b.totalSold - a.totalSold) as any[]

  const hasPromoRevenue = mergedTiers.some((t: any) => t.promoRevenue > 0)

  // Revenue by event chart data
  const eventChartData = revenueByEvent
    .slice(0, 8)
    .map((e: any) => ({
      name: e.eventTitle?.length > 18 ? e.eventTitle.slice(0, 18) + '…' : e.eventTitle,
      fullName: e.eventTitle,
      revenue: Math.round(e.revenue / 100),
      tickets: e.tickets,
      orders: e.orders,
    }))
    .reverse() // bottom-to-top on horizontal bar

  const dateLabel = days === 'all' ? 'all time' : `last ${days} days`

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                Analytics
              </h1>
              <p className="text-xs text-gray-500">Texas Combat Sports — Revenue & Performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Date range filter */}
            <div className="flex rounded-md overflow-hidden border border-gray-700">
              {DATE_RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setDays(r.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    days === r.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: isLoading ? '—' : fmt(overview.totalRevenue ?? 0), sub: dateLabel, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Avg Order Value', value: isLoading ? '—' : fmt(overview.avgTransactionValue ?? 0), sub: dateLabel, icon: Ticket, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Tickets Sold',   value: isLoading ? '—' : (overview.totalTickets ?? 0).toLocaleString(), sub: dateLabel, icon: Ticket, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'Total Orders',   value: isLoading ? '—' : (overview.totalTransactions ?? 0).toLocaleString(), sub: dateLabel, icon: ShoppingBag, color: 'text-red-400', bg: 'bg-red-400/10' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${kpi.bg} rounded-md p-2`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Taxes Collected</p>
            <p className="text-xl font-bold text-white">{isLoading ? '—' : fmt(overview.totalTaxes ?? 0)}</p>
            <p className="text-xs text-gray-600 mt-0.5">{dateLabel}</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Upcoming Events</p>
            <p className="text-xl font-bold text-white">{data?.upcomingEventsCount ?? '—'}</p>
            {data?.nextEvent && (
              <p className="text-xs text-gray-500 mt-1">
                Next: {data.nextEvent.title} · {new Date(data.nextEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Revenue by Event */}
        {revenueByEvent.length > 0 && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Revenue by Event</h2>
            <p className="text-xs text-gray-500 mb-6">Confirmed orders · {dateLabel}</p>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={Math.max(180, eventChartData.length * 48)}>
              <BarChart data={eventChartData} layout="vertical" margin={{ left: 8, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={fmtShort}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelFormatter={(_: any, payload: any) => payload?.[0]?.payload?.fullName ?? ''}
                  formatter={(val: any, name: string) => [
                    name === 'revenue' ? `$${Number(val).toLocaleString()}` : val,
                    name === 'revenue' ? 'Revenue' : 'Tickets',
                  ]}
                />
                <Bar dataKey="revenue" fill="#ef4444" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#9ca3af', fontSize: 11, formatter: (v: number) => `$${v.toLocaleString()}` }} />
              </BarChart>
            </ResponsiveContainer>

            {/* Table below chart */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase text-gray-400">Event</th>
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase text-gray-400">Date</th>
                    <th className="text-right py-2 px-3 text-xs font-medium uppercase text-gray-400">Orders</th>
                    <th className="text-right py-2 px-3 text-xs font-medium uppercase text-gray-400">Tickets</th>
                    <th className="text-right py-2 px-3 text-xs font-medium uppercase text-gray-400">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByEvent.map((e: any) => (
                    <tr key={e._id ?? e.eventTitle} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40">
                      <td className="py-2.5 px-3 text-white font-medium">{e.eventTitle}</td>
                      <td className="py-2.5 px-3 text-gray-400 text-xs whitespace-nowrap">
                        {e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 text-right">{e.orders}</td>
                      <td className="py-2.5 px-3 text-gray-300 text-right">{e.tickets}</td>
                      <td className="py-2.5 px-3 text-white font-medium text-right">{fmt(e.revenue)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-600">
                    <td className="py-2.5 px-3 text-gray-400 font-medium" colSpan={2}>Total</td>
                    <td className="py-2.5 px-3 text-gray-300 text-right font-medium">
                      {revenueByEvent.reduce((s: number, e: any) => s + e.orders, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-gray-300 text-right font-medium">
                      {revenueByEvent.reduce((s: number, e: any) => s + e.tickets, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-white text-right font-bold">
                      {fmt(revenueByEvent.reduce((s: number, e: any) => s + e.revenue, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 30-Day Revenue Chart */}
        {revenueChartData.length > 0 && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Daily Revenue</h2>
            <p className="text-xs text-gray-500 mb-4">Confirmed revenue · {dateLabel}</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f9fafb', fontSize: 12 }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          {monthlyData.length > 0 && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-white mb-1">Monthly Revenue</h2>
              <p className="text-xs text-gray-500 mb-4">Last 12 months (all time)</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={fmtShort} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f9fafb', fontSize: 12 }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Order Status */}
          {statusData.length > 0 && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-white mb-1">Order Status</h2>
              <p className="text-xs text-gray-500 mb-4">All-time breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusData.map((entry: any) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#f9fafb', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Ticket Tiers */}
        {mergedTiers.length > 0 && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-white mb-1">Top Ticket Tiers</h2>
            <p className="text-xs text-gray-500 mb-4">By units sold · all time</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-3 text-xs font-medium uppercase text-gray-400">Tier</th>
                    <th className="text-right py-2 px-3 text-xs font-medium uppercase text-gray-400">Sold</th>
                    <th className="text-right py-2 px-3 text-xs font-medium uppercase text-gray-400">Revenue</th>
                    {hasPromoRevenue && (
                      <th className="text-right py-2 px-3 text-xs font-medium uppercase text-gray-400">Promo Revenue</th>
                    )}
                    <th className="text-right py-2 px-3 text-xs font-medium uppercase text-gray-400">Total</th>
                    <th className="w-32 py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const maxRevenue = Math.max(...mergedTiers.map((t: any) => t.revenue + t.promoRevenue), 1)
                    return mergedTiers.map((tier: any) => {
                      const total = tier.revenue + tier.promoRevenue
                      return (
                        <tr key={tier.name} className="border-b border-gray-800 last:border-0">
                          <td className="py-2.5 px-3 text-white">{tier.name}</td>
                          <td className="py-2.5 px-3 text-gray-300 text-right">{tier.totalSold}</td>
                          <td className="py-2.5 px-3 text-gray-300 text-right">{fmt(tier.revenue)}</td>
                          {hasPromoRevenue && (
                            <td className="py-2.5 px-3 text-gray-300 text-right">
                              {tier.promoRevenue > 0 ? fmt(tier.promoRevenue) : <span className="text-gray-600">—</span>}
                            </td>
                          )}
                          <td className="py-2.5 px-3 text-white font-medium text-right">{fmt(total)}</td>
                          <td className="py-2.5 px-3">
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: `${(total / maxRevenue) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
