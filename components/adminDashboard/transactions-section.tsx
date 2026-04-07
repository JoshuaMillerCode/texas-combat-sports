"use client"

import { useState, useEffect, useRef } from "react"
import { useTransactionsQuery, TransactionFilters, useEventsQuery } from "@/hooks/use-queries"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"

function fmt(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDateTime(d: string | Date) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const STATUS_VARIANTS: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending:   { label: 'Pending',   className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  refunded:  { label: 'Refunded',  className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

const DATE_PRESETS = [
  { label: 'All',   startDate: '', endDate: '' },
  { label: 'Today', startDate: 'today', endDate: 'today' },
  { label: '7d',    startDate: '7', endDate: '0' },
  { label: '30d',   startDate: '30', endDate: '0' },
  { label: '90d',   startDate: '90', endDate: '0' },
]

function resolvePreset(preset: typeof DATE_PRESETS[number]) {
  if (!preset.startDate) return { startDate: '', endDate: '' }
  if (preset.startDate === 'today') {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return { startDate: d.toISOString(), endDate: end.toISOString() }
  }
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - parseInt(preset.startDate))
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

export default function TransactionsSection({ searchTerm }: { searchTerm: string }) {
  const [status, setStatus] = useState('all')
  const [eventId, setEventId] = useState('all')
  const [datePreset, setDatePreset] = useState(DATE_PRESETS[0])
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<any>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(localSearch)
      setPage(1)
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [localSearch])

  // Sync with top-level search bar
  useEffect(() => {
    if (searchTerm !== localSearch) {
      setLocalSearch(searchTerm)
    }
  }, [searchTerm])

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [status, eventId, datePreset, minAmount, maxAmount])

  const { startDate, endDate } = resolvePreset(datePreset)

  const filters: TransactionFilters = {
    status,
    eventId,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    minAmount: minAmount || undefined,
    maxAmount: maxAmount || undefined,
    page,
  }

  const { data, isLoading } = useTransactionsQuery(filters)
  const { data: eventsData } = useEventsQuery()

  const transactions: any[] = data?.transactions ?? []
  const total: number = data?.total ?? 0
  const totalPages: number = data?.totalPages ?? 1

  const statusOptions = ['all', 'confirmed', 'pending', 'refunded', 'cancelled']

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <Input
            placeholder="Order ID, name, or email…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-8 text-sm bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex rounded-md overflow-hidden border border-gray-700">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                status === s ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {/* Date preset */}
        <div className="flex rounded-md overflow-hidden border border-gray-700">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setDatePreset(preset)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                datePreset.label === preset.label ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Event filter */}
        <Select value={eventId} onValueChange={(v) => { setEventId(v); setPage(1) }}>
          <SelectTrigger className="h-8 w-48 text-xs bg-gray-800 border-gray-700 text-gray-300">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="all">All events</SelectItem>
            {(eventsData as any[] ?? []).map((e: any) => (
              <SelectItem key={e._id} value={e._id} className="text-xs">
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Amount range */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="pl-6 h-8 w-24 text-xs bg-gray-800 border-gray-700 text-white placeholder-gray-600"
            />
          </div>
          <span className="text-gray-600 text-xs">–</span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="pl-6 h-8 w-24 text-xs bg-gray-800 border-gray-700 text-white placeholder-gray-600"
            />
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/60">
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Event</th>
                  <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Tickets</th>
                  <th className="text-right py-3 px-4 text-xs font-medium uppercase text-gray-400">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-400">Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => {
                  const sv = STATUS_VARIANTS[tx.status] ?? STATUS_VARIANTS.pending
                  return (
                    <tr key={tx._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-gray-300">{tx.orderId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-sm leading-tight">{tx.customerDetails?.name}</p>
                        <p className="text-gray-500 text-xs">{tx.customerDetails?.email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-xs max-w-[160px] truncate">
                        {tx.event?.title ?? tx.metadata?.eventTitle ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-right">{tx.summary?.totalTickets ?? 0}</td>
                      <td className="py-3 px-4 text-white font-medium text-right">{fmt(tx.summary?.totalAmount ?? 0)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sv.className}`}>
                          {sv.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                        {fmtDate(tx.purchaseDate)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewing(tx)}
                          className="text-gray-500 hover:text-white transition-colors"
                          title="View order"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Showing X–Y of Z */}
        <span className="text-xs text-gray-500">
          {isLoading ? '…' : (() => {
            const from = total === 0 ? 0 : (page - 1) * 25 + 1
            const to = Math.min(page * 25, total)
            return `Showing ${from}–${to} of ${total.toLocaleString()}`
          })()}
        </span>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="h-8 w-8 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Numbered pages */}
          {(() => {
            const pages: (number | '…')[] = []
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i)
            } else {
              pages.push(1)
              if (page > 3) pages.push('…')
              for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
              if (page < totalPages - 2) pages.push('…')
              pages.push(totalPages)
            }
            return pages.map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-gray-600 text-xs">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`h-8 w-8 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                    page === p
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              )
            )
          })()}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="h-8 w-8 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader className="pr-6">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="font-mono text-sm text-gray-300 truncate">
                      {viewing.orderId}
                    </DialogTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{fmtDateTime(viewing.purchaseDate)}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${STATUS_VARIANTS[viewing.status]?.className}`}>
                    {STATUS_VARIANTS[viewing.status]?.label}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-5 pt-1">
                {/* Customer + Event side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <section>
                    <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Customer</h3>
                    <div className="bg-gray-800/60 rounded-lg px-4 py-3 space-y-0.5 text-sm h-full">
                      <p className="text-white font-medium">{viewing.customerDetails?.name}</p>
                      <p className="text-gray-400 text-xs break-all">{viewing.customerDetails?.email}</p>
                      {viewing.customerDetails?.phone && (
                        <p className="text-gray-400 text-xs">{viewing.customerDetails.phone}</p>
                      )}
                    </div>
                  </section>

                  {(viewing.event?.title || viewing.metadata?.eventTitle) && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Event</h3>
                      <div className="bg-gray-800/60 rounded-lg px-4 py-3 text-sm h-full">
                        <p className="text-white font-medium leading-snug">{viewing.event?.title ?? viewing.metadata?.eventTitle}</p>
                        {(viewing.event?.date ?? viewing.metadata?.eventDate) && (
                          <p className="text-gray-400 text-xs mt-1">
                            {fmtDate(viewing.event?.date ?? viewing.metadata?.eventDate)}
                          </p>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Ticket items */}
                {viewing.ticketItems?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Tickets</h3>
                    <div className="bg-gray-800/60 rounded-lg overflow-hidden">
                      {viewing.ticketItems.map((item: any, i: number) => (
                        <div key={i} className="px-4 py-3 border-b border-gray-700 last:border-0 flex items-start justify-between gap-4 text-sm">
                          <div className="min-w-0">
                            <p className="text-white">
                              {item.tierName}
                              <span className="text-gray-500 ml-1.5">×{item.quantity}</span>
                            </p>
                            {item.isFlashSale && (
                              <p className="text-xs text-yellow-400 mt-0.5 truncate">⚡ {item.flashSaleTitle}</p>
                            )}
                            {item.isPromoDeal && (
                              <p className="text-xs text-purple-400 mt-0.5">🎟 Promo deal</p>
                            )}
                          </div>
                          <p className="text-gray-300 flex-shrink-0">{fmt(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Summary */}
                <section>
                  <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Summary</h3>
                  <div className="bg-gray-800/60 rounded-lg px-4 py-3 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>{fmt(viewing.summary?.subtotal ?? 0)}</span>
                    </div>
                    {viewing.summary?.taxes > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Taxes</span>
                        <span>{fmt(viewing.summary.taxes)}</span>
                      </div>
                    )}
                    {viewing.summary?.fees > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Fees</span>
                        <span>{fmt(viewing.summary.fees)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-700">
                      <span>Total</span>
                      <span>{fmt(viewing.summary?.totalAmount ?? 0)}</span>
                    </div>
                  </div>
                </section>

                {/* Stripe reference */}
                <section>
                  <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Reference</h3>
                  <div className="bg-gray-800/60 rounded-lg px-4 py-3 space-y-1.5 text-xs font-mono text-gray-500 break-all">
                    {viewing.stripeSessionId && (
                      <p><span className="text-gray-600">Session </span>{viewing.stripeSessionId}</p>
                    )}
                    {viewing.stripePaymentIntentId && (
                      <p><span className="text-gray-600">Payment </span>{viewing.stripePaymentIntentId}</p>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
