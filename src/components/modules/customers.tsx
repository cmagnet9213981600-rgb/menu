'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Phone, Wallet, Award, TrendingUp, Star } from 'lucide-react'
import { formatToman, toFaDigits } from '@/lib/format'

interface Customer {
  id: string
  nickname: string | null
  phone: string | null
  avatar: string | null
  balance: number
  integral: number
  level: number
  status: number
  createdAt: string
}

export function CustomersModule({ tenantId }: { tenantId: string }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/customers?tenantId=${tenantId}`)
      .then(r => r.json())
      .then(d => setCustomers(d.list || []))
      .finally(() => setLoading(false))
  }, [tenantId])

  const totalBalance = customers.reduce((s, c) => s + c.balance, 0)
  const totalPoints = customers.reduce((s, c) => s + c.integral, 0)
  const vipCount = customers.filter(c => c.level >= 3).length

  return (
    <div className="p-6 space-y-4">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'کل مشتریان', value: customers.length, icon: Users, color: 'from-blue-500 to-indigo-600' },
          { label: 'مشتریان VIP', value: vipCount, icon: Star, color: 'from-amber-500 to-orange-600' },
          { label: 'مجموع موجودی', value: `${formatToman(totalBalance)} ت`, icon: Wallet, color: 'from-emerald-500 to-green-600' },
          { label: 'مجموع امتیازات', value: formatToman(totalPoints), icon: Award, color: 'from-purple-500 to-pink-600' },
        ].map((c, i) => {
          const Icon = c.icon
          return (
            <Card key={i} className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="font-bold truncate">{typeof c.value === 'number' ? toFaDigits(c.value) : c.value}</div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-xs">
              <tr className="text-right">
                <th className="p-3 font-medium">مشتری</th>
                <th className="p-3 font-medium">تماس</th>
                <th className="p-3 font-medium">سطح</th>
                <th className="p-3 font-medium">موجودی</th>
                <th className="p-3 font-medium">امتیاز</th>
                <th className="p-3 font-medium">عضویت</th>
                <th className="p-3 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">در حال بارگذاری...</td></tr>
              )}
              {!loading && customers.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">مشتری یافت نشد</td></tr>
              )}
              {!loading && customers.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={c.avatar || `https://i.pravatar.cc/150?u=${c.id}`} />
                        <AvatarFallback>{c.nickname?.charAt(0) || 'م'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{c.nickname || 'بدون نام'}</div>
                        <div className="text-xs text-muted-foreground">VIP {toFaDigits(c.level)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs"><Phone className="w-3 h-3 inline ml-1" />{c.phone ? toFaDigits(c.phone) : '—'}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={c.level >= 3 ? 'bg-amber-100 text-amber-700' : c.level === 2 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}>
                      <Star className="w-3 h-3 ml-1" /> سطح {toFaDigits(c.level)}
                    </Badge>
                  </td>
                  <td className="p-3"><span className="font-mono font-medium">{formatToman(c.balance)}</span> ت</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-purple-600">
                      <Award className="w-3 h-3" /> {toFaDigits(c.integral)}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={c.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                      {c.status === 1 ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
