'use client'
import { useEffect, useMemo, useState } from 'react'
import { Building2, ArrowLeft, Sparkles, Search, LayoutGrid, List, Filter, TrendingUp, TrendingDown, Globe, Phone, Users, Store as StoreIcon, Calendar, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/lib/store'
import { formatToman, toFaDigits } from '@/lib/format'

interface TenantInfo {
  id: string
  name: string
  contactName?: string | null
  contactMobile?: string | null
  domain?: string | null
  accountCount: number
  status: number
  expireTime?: string | null
  storesCount: number
  usersCount: number
  ordersCount: number
  revenue: number
}

type SortKey = 'name' | 'revenue' | 'orders' | 'stores' | 'created'
type ViewMode = 'grid' | 'list'

export function TenantSelector() {
  const { setTenant } = useAppStore()
  const [tenants, setTenants] = useState<TenantInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Filter / search state
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('revenue')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [view, setView] = useState<ViewMode>('grid')

  useEffect(() => {
    fetch('/api/tenants')
      .then(r => r.json())
      .then(d => setTenants(d.list || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = [...tenants]
    // keyword search across name, contactName, contactMobile, domain
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      result = result.filter(t =>
        t.name.toLowerCase().includes(k) ||
        (t.contactName || '').toLowerCase().includes(k) ||
        (t.contactMobile || '').includes(k) ||
        (t.domain || '').toLowerCase().includes(k)
      )
    }
    // status filter
    if (statusFilter !== 'all') {
      result = result.filter(t => statusFilter === 'active' ? t.status === 1 : t.status !== 1)
    }
    // sort
    result.sort((a, b) => {
      let av: any, bv: any
      switch (sortBy) {
        case 'name': av = a.name; bv = b.name; break
        case 'revenue': av = a.revenue; bv = b.revenue; break
        case 'orders': av = a.ordersCount; bv = b.ordersCount; break
        case 'stores': av = a.storesCount; bv = b.storesCount; break
        case 'created': av = a.id; bv = b.id; break
      }
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [tenants, keyword, statusFilter, sortBy, sortDir])

  // Stats summary
  const summary = useMemo(() => ({
    total: tenants.length,
    active: tenants.filter(t => t.status === 1).length,
    totalRevenue: tenants.reduce((s, t) => s + t.revenue, 0),
    totalStores: tenants.reduce((s, t) => s + t.storesCount, 0),
  }), [tenants])

  const toggleSort = (k: SortKey) => {
    if (sortBy === k) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(k)
      setSortDir('desc')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-lg shadow-orange-200 dark:shadow-none">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            YShop Drink — دمو سیستم مدیریت کافه و رستوران
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            یک پلتفرم SaaS چندمستاجری برای مدیریت کافه و رستوران. ابتدا یک tenant (مستاجر) را برای ورود انتخاب کنید.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'کل Tenantها', value: toFaDigits(summary.total), icon: Building2, color: 'from-amber-500 to-orange-600' },
            { label: 'Tenantهای فعال', value: toFaDigits(summary.active), icon: Building2, color: 'from-emerald-500 to-green-600' },
            { label: 'کل شعب', value: toFaDigits(summary.totalStores), icon: StoreIcon, color: 'from-blue-500 to-indigo-600' },
            { label: 'درآمد پلتفرم', value: `${formatToman(summary.totalRevenue)} ت`, icon: Coins, color: 'from-purple-500 to-pink-600' },
          ].map((c, i) => {
            const Icon = c.icon
            return (
              <Card key={i} className="p-4 flex items-center gap-3 bg-card/80 backdrop-blur">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  <div className="font-bold truncate">{c.value}</div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Toolbar: search + filters + view mode */}
        <Card className="p-4 mb-4 bg-card/80 backdrop-blur">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس نام tenant، مخاطب، تلفن یا دامنه..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="active">فقط فعال</SelectItem>
                <SelectItem value="inactive">فقط غیرفعال</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">مرتب بر اساس درآمد</SelectItem>
                <SelectItem value="orders">مرتب بر اساس سفارش‌ها</SelectItem>
                <SelectItem value="stores">مرتب بر اساس شعب</SelectItem>
                <SelectItem value="name">مرتب بر اساس نام</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} title={sortDir === 'asc' ? 'صعودی' : 'نزولی'}>
              {sortDir === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </Button>

            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button size="sm" variant={view === 'grid' ? 'default' : 'ghost'} onClick={() => setView('grid')} className="px-2">
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button size="sm" variant={view === 'list' ? 'default' : 'ghost'} onClick={() => setView('list')} className="px-2">
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Result count */}
          <div className="mt-3 text-xs text-muted-foreground">
            {loading ? 'در حال بارگذاری...' : `${toFaDigits(filtered.length)} tenant یافت شد از مجموع ${toFaDigits(tenants.length)} tenant`}
          </div>
        </Card>

        {/* Tenants */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0,1,2].map(i => <Card key={i} className="h-72 animate-pulse bg-muted/40" />)}
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Card
                key={t.id}
                className="p-6 hover:shadow-xl transition-all cursor-pointer group bg-card/80 backdrop-blur border-2 hover:border-amber-400 dark:hover:border-amber-600"
                onClick={() => setTenant(t as any)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <Badge variant="outline" className={t.status === 1 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                    <span className={`w-2 h-2 rounded-full ml-1 ${t.status === 1 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {t.status === 1 ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                <h3 className="font-bold text-lg mb-1 truncate">{t.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 truncate">
                  {t.contactName ? `مدیر: ${t.contactName}` : 'بدون مدیر'}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <div className="text-xs text-muted-foreground">شعب</div>
                    <div className="font-bold">{toFaDigits(t.storesCount)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <div className="text-xs text-muted-foreground">کاربران</div>
                    <div className="font-bold">{toFaDigits(t.usersCount)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <div className="text-xs text-muted-foreground">سفارش‌ها</div>
                    <div className="font-bold">{toFaDigits(t.ordersCount)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>درآمد کل:</span>
                  <span className="font-mono font-bold text-foreground">{formatToman(t.revenue)} ت</span>
                </div>

                <Button className="w-full gap-2 group-hover:bg-amber-600">
                  ورود به پنل مدیریت
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          // List view — table-like
          <Card className="overflow-hidden bg-card/80 backdrop-blur">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b text-xs">
                  <tr className="text-right">
                    <th className="p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1">نام Tenant {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="p-3 font-medium">مخاطب</th>
                    <th className="p-3 font-medium">دامنه</th>
                    <th className="p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('stores')}>
                      <div className="flex items-center gap-1">شعب {sortBy === 'stores' && (sortDir === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="p-3 font-medium">کاربران</th>
                    <th className="p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('orders')}>
                      <div className="flex items-center gap-1">سفارش‌ها {sortBy === 'orders' && (sortDir === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('revenue')}>
                      <div className="flex items-center gap-1">درآمد {sortBy === 'revenue' && (sortDir === 'asc' ? '↑' : '↓')}</div>
                    </th>
                    <th className="p-3 font-medium">وضعیت</th>
                    <th className="p-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {t.name.charAt(0)}
                          </div>
                          <span className="font-medium">{t.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        <div>{t.contactName || '—'}</div>
                        <div className="text-muted-foreground">{t.contactMobile ? toFaDigits(t.contactMobile) : ''}</div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{t.domain ? (
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {t.domain}</span>
                      ) : '—'}</td>
                      <td className="p-3 font-bold">{toFaDigits(t.storesCount)}</td>
                      <td className="p-3 text-xs">{toFaDigits(t.usersCount)}/{toFaDigits(t.accountCount)}</td>
                      <td className="p-3 font-bold">{toFaDigits(t.ordersCount)}</td>
                      <td className="p-3 font-mono font-bold text-amber-600">{formatToman(t.revenue)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={t.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                          {t.status === 1 ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button size="sm" onClick={() => setTenant(t as any)} className="bg-amber-600 hover:bg-amber-700">
                          ورود
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground bg-card/80">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            tenantی با این مشخصات یافت نشد
          </Card>
        )}

        {/* Feature list */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { icon: '🏪', label: 'مدیریت چند شعبه' },
            { icon: '🛒', label: 'سفارش‌گیری dinein/takeout/pickup' },
            { icon: '🪑', label: 'مدیریت میز و QR کد' },
            { icon: '🎫', label: 'کوپن و بازاریابی' },
            { icon: '👥', label: 'مدیریت مشتری و امتیاز' },
            { icon: '📊', label: 'گزارش و تحلیل فروش' },
            { icon: '🏢', label: 'پشتیبانی multi-tenant' },
            { icon: '💰', label: 'صندوق و فاکتور' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-card/60 backdrop-blur">
              <span className="text-lg">{f.icon}</span>
              <span className="text-xs">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
