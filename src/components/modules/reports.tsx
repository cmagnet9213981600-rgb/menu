'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts'
import { formatToman, toFaDigits } from '@/lib/format'
import { TrendingUp, TrendingDown, ShoppingBag, DollarSign, Coins, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DashboardData {
  summary: {
    totalRevenue: number
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
    storesCount: number
    productsCount: number
    customersCount: number
    tablesCount: number
  }
  daily: { date: string; revenue: number; orders: number }[]
  topProducts: { name: string; qty: number; revenue: number }[]
  payTypeMap: Record<string, number>
}

export function ReportsModule({ tenantId, storeId }: { tenantId: string; storeId: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [range, setRange] = useState(30)

  useEffect(() => {
    const q = new URLSearchParams({ tenantId, range: String(range) })
    if (storeId) q.set('storeId', storeId)
    fetch(`/api/dashboard?${q.toString()}`)
      .then(r => r.json())
      .then(d => setData(d))
  }, [tenantId, storeId, range])

  if (!data) return <div className="p-6"><Card className="h-96 animate-pulse bg-muted/40" /></div>

  // Compute extra metrics
  const totalRevenue = data.summary.totalRevenue
  const totalOrders = data.summary.totalOrders
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const completionRate = totalOrders > 0 ? (data.summary.completedOrders / totalOrders) * 100 : 0
  const cancelRate = totalOrders > 0 ? (data.summary.cancelledOrders / totalOrders) * 100 : 0

  // Last 7 days vs prev 7 days
  const last7 = data.daily.slice(-7)
  const prev7 = data.daily.slice(-14, -7)
  const last7Rev = last7.reduce((s, d) => s + d.revenue, 0)
  const prev7Rev = prev7.reduce((s, d) => s + d.revenue, 0)
  const growth = prev7Rev > 0 ? ((last7Rev - prev7Rev) / prev7Rev) * 100 : 0

  const kpis = [
    { label: 'میانگین ارزش سفارش', value: `${formatToman(Math.round(avgOrder))} ت`, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'نرخ تکمیل', value: `${toFaDigits(Math.round(completionRate))}٪`, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'نرخ لغو', value: `${toFaDigits(Math.round(cancelRate))}٪`, icon: TrendingDown, color: 'text-red-600' },
    { label: `رشد هفتگی`, value: `${growth >= 0 ? '+' : ''}${toFaDigits(Math.round(growth))}٪`, icon: growth >= 0 ? TrendingUp : TrendingDown, color: growth >= 0 ? 'text-emerald-600' : 'text-red-600' },
  ]

  const topProductsData = data.topProducts.slice(0, 10).map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    تعداد: p.qty,
    درآمد: p.revenue,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Range selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">بازه گزارش:</span>
        {[7, 14, 30].map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${range === r ? 'bg-amber-600 text-white' : 'bg-muted hover:bg-muted/70'}`}
          >
            {toFaDigits(r)} روز
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <Icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            </Card>
          )
        })}
      </div>

      {/* Revenue trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold">روند درآمد و تعداد سفارش</h3>
            <p className="text-xs text-muted-foreground">آخرین {toFaDigits(range)} روز</p>
          </div>
          <Badge variant="outline" className="text-emerald-700">
            مجموع: {formatToman(totalRevenue)} ت
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} reversed />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} orientation="right" tickFormatter={v => `${Math.round(v / 1000)}K`} />
            <YAxis yAxisId="right" orientation="left" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }}
              formatter={(v: number, name: string) => name === 'درآمد' ? [`${formatToman(v)} ت`, name] : [toFaDigits(v), name]}
              labelFormatter={(l) => `تاریخ: ${toFaDigits(l)}`}
            />
            <Legend wrapperStyle={{ fontFamily: 'inherit', fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="revenue" name="درآمد" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="orders" name="سفارش‌ها" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top products */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">۱۰ محصول برتر بر اساس تعداد فروش</h3>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={topProductsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} orientation="right" />
            <Tooltip contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }}
              formatter={(v: number, name: string) => name === 'درآمد' ? [`${formatToman(v)} ت`, name] : [toFaDigits(v), name]}
            />
            <Legend wrapperStyle={{ fontFamily: 'inherit', fontSize: 12 }} />
            <Bar dataKey="تعداد" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="درآمد" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Payment methods summary */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">خلاصه روش‌های پرداخت</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(data.payTypeMap).map(([k, v]) => (
            <div key={k} className="p-4 rounded-lg border">
              <div className="text-xs text-muted-foreground">
                {k === 'cash' ? 'نقدی' : k === 'card' ? 'کارت' : k === 'wechat' ? 'وی‌چت' : 'علی‌پی'}
              </div>
              <div className="font-bold text-lg">{formatToman(v)} ت</div>
              <div className="text-xs text-muted-foreground">
                {toFaDigits(Math.round((v / totalRevenue) * 100))}٪ از کل
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
