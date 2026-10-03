'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ticket, Percent, Truck, ShoppingBag, Users, Clock } from 'lucide-react'
import { formatToman, toFaDigits } from '@/lib/format'

interface Coupon {
  id: string
  name: string
  type: number
  least: number
  value: number
  receive: number
  distribute: number
  limit: number
  status: number
  startTime: string | null
  endTime: string | null
}

const typeMap: Record<number, { label: string; icon: any; color: string }> = {
  0: { label: 'عمومی', icon: Ticket, color: 'from-amber-500 to-orange-600' },
  1: { label: 'تحویل حضوری', icon: ShoppingBag, color: 'from-teal-500 to-cyan-600' },
  2: { label: 'بیرون‌بر', icon: Truck, color: 'from-blue-500 to-indigo-600' },
}

export function CouponsModule({ tenantId }: { tenantId: string }) {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/coupons?tenantId=${tenantId}`)
      .then(r => r.json())
      .then(d => setCoupons(d.list || []))
      .finally(() => setLoading(false))
  }, [tenantId])

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">کوپن‌ها و بازاریابی</h2>
          <p className="text-sm text-muted-foreground">{toFaDigits(coupons.length)} کوپن فعال</p>
        </div>
        <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
          <Ticket className="w-4 h-4" /> کوپن جدید
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[0,1,2].map(i => <Card key={i} className="h-56 animate-pulse bg-muted/40" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map(c => {
            const type = typeMap[c.type] || typeMap[0]
            const Icon = type.icon
            const claimRate = c.distribute > 0 ? Math.round((c.receive / c.distribute) * 100) : 0
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className={`bg-gradient-to-br ${type.color} p-4 text-white relative`}>
                  <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-8 translate-y-8" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-xs opacity-80 mb-1">{type.label}</div>
                      <div className="text-3xl font-bold">{toFaDigits(c.value.toLocaleString('en-US'))}</div>
                      <div className="text-xs opacity-80">تومان تخفیف</div>
                    </div>
                    <Icon className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="relative mt-2 text-xs opacity-90">
                    حداقل سفارش: {formatToman(c.least)} ت
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-sm mb-2">{c.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1"><Users className="w-3 h-3 text-muted-foreground" /> دریافت: {toFaDigits(c.receive)}/{toFaDigits(c.distribute)}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" /> انقضا: {c.endTime ? new Date(c.endTime).toLocaleDateString('fa-IR') : '—'}</div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">نرخ دریافت</span>
                      <span className="font-medium">{toFaDigits(claimRate)}٪</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${claimRate}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">ویرایش</Button>
                    <Button size="sm" variant="ghost" className="text-red-600">حذف</Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
