'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, ShoppingBag, Users, Store, Grid3x3, Clock, CheckCircle2, XCircle, Coins } from 'lucide-react'
import { formatToman, toFaDigits } from '@/lib/format'
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
  orderTypeStats: { dinein: number; takeout: number; pickup: number }
  topProducts: { name: string; image?: string | null; qty: number; revenue: number }[]
  payTypeMap: Record<string, number>
}

const PAY_COLORS: Record<string, string> = {
  cash: '#10b981',
  card: '#3b82f6',
  wechat: '#22c55e',
  alipay: '#06b6d4',
}

export function DashboardModule({ tenantId, storeId }: { tenantId: string; storeId: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const q = new URLSearchParams({ tenantId })
    if (storeId) q.set('storeId', storeId)
    fetch(`/api/dashboard?${q.toString()}`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [tenantId, storeId])

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-4">{[0,1,2,3].map(i => <Card key={i} className="h-28 animate-pulse bg-muted/40" />)}</div>
        <Card className="h-80 animate-pulse bg-muted/40" />
      </div>
    )
  }

  const s = data.summary
  const orderTypePie = [
    { name: 'داخل سالن', value: data.orderTypeStats.dinein, color: '#a855f7' },
    { name: 'بیرون‌بر', value: data.orderTypeStats.takeout, color: '#06b6d4' },
    { name: 'تحویل حضوری', value: data.orderTypeStats.pickup, color: '#14b8a6' },
  ]
  const payTypePie = Object.entries(data.payTypeMap).map(([k, v]) => ({
    name: k === 'cash' ? 'نقدی' : k === 'card' ? 'کارت' : k === 'wechat' ? 'وی‌چت' : 'علی‌پی',
    value: v,
    color: PAY_COLORS[k] || '#94a3b8',
  }))

  const cards = [
    { label: 'درآمد کل', value: `${formatToman(s.totalRevenue)} ت`, icon: Coins, color: 'from-amber-500 to-orange-600', textColor: 'text-amber-700' },
    { label: 'کل سفارش‌ها', value: toFaDigits(s.totalOrders), icon: ShoppingBag, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-700' },
    { label: 'در انتظار/در حال', value: toFaDigits(s.pendingOrders), icon: Clock, color: 'from-amber-400 to-yellow-500', textColor: 'text-amber-700' },
    { label: 'تکمیل شده', value: toFaDigits(s.completedOrders), icon: CheckCircle2, color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-700' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Top stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <Card key={i} className="p-5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">{c.label}</div>
                  <div className="text-2xl font-bold">{c.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'تعداد شعب', value: s.storesCount, icon: Store },
          { label: 'محصولات', value: s.productsCount, icon: ShoppingBag },
          { label: 'مشتریان', value: s.customersCount, icon: Users },
          { label: 'میزها', value: s.tablesCount, icon: Grid3x3 },
        ].map((c, i) => {
          const Icon = c.icon
          return (
            <Card key={i} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="font-bold">{toFaDigits(c.value)}</div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Revenue chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold">روند درآمد روزانه</h3>
            <p className="text-xs text-muted-foreground">۳۰ روز گذشته</p>
          </div>
          <Badge variant="outline" className="gap-1 text-emerald-700">
            <TrendingUp className="w-3 h-3" />
            میانگین روزانه: {formatToman(Math.round(data.daily.reduce((s, d) => s + d.revenue, 0) / Math.max(1, data.daily.length)))} ت
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.daily}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'inherit' }} reversed />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}K`} orientation="right" />
            <Tooltip
              formatter={(v: number) => [`${formatToman(v)} تومان`, 'درآمد']}
              labelFormatter={(l) => `تاریخ: ${toFaDigits(l)}`}
              contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#rev)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders per day bar chart */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">تعداد سفارش‌ها در روز</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.daily.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} reversed />
              <YAxis tick={{ fontSize: 11 }} orientation="right" />
              <Tooltip
                formatter={(v: number) => [toFaDigits(v), 'سفارش']}
                labelFormatter={(l) => `تاریخ: ${toFaDigits(l)}`}
                contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }}
              />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Order type pie */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">تفکیک نوع سفارش</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={orderTypePie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {orderTypePie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => toFaDigits(v)} contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }} />
              <Legend wrapperStyle={{ fontFamily: 'inherit', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">پرفروش‌ترین محصولات</h3>
            <Badge variant="outline">۸ مورد</Badge>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pl-1">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {toFaDigits(i + 1)}
                </div>
                {p.image && (
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{toFaDigits(p.qty)} عدد فروخته شده</div>
                </div>
                <div className="text-sm font-bold whitespace-nowrap">{formatToman(p.revenue)} ت</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment breakdown */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">تفکیک روش‌های پرداخت</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={payTypePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry: any) => entry.name}>
                {payTypePie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${formatToman(v)} تومان`} contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {payTypePie.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: p.color }} />
                  <span>{p.name}</span>
                </div>
                <span className="font-mono font-medium">{formatToman(p.value)} ت</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
