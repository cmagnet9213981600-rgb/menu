'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import {
  Building2, Users, Store, ShoppingBag, Coins, Phone, Globe, Calendar, CheckCircle2, XCircle,
  Search, Plus, Pencil, Trash2, Download, Upload, RefreshCw, TrendingUp, TrendingDown,
  ArrowLeft, Clock, Database, RotateCcw, AlertTriangle, FileJson, Filter, List, LayoutGrid,
  Package, ShoppingCart, Star, Settings2, Eye
} from 'lucide-react'
import { formatToman, toFaDigits } from '@/lib/format'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface Tenant {
  id: string
  name: string
  contactName?: string | null
  contactMobile?: string | null
  domain?: string | null
  packageId?: string | null
  accountCount: number
  status: number
  expireTime?: string | null
  createdAt: string
  // computed
  storesCount: number
  usersCount: number
  ordersCount: number
  productsCount: number
  customersCount: number
  revenue: number
}

type SortKey = 'createdAt' | 'name' | 'revenue' | 'orders' | 'stores' | 'expireTime'
type ViewMode = 'grid' | 'list'

export function TenantsModule() {
  const { setTenant } = useAppStore()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [view, setView] = useState<ViewMode>('grid')

  // Dialog states
  const [editing, setEditing] = useState<Tenant | null>(null)
  const [openEditor, setOpenEditor] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null)
  const [extendTarget, setExtendTarget] = useState<Tenant | null>(null)
  const [backupTarget, setBackupTarget] = useState<Tenant | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<Tenant | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams({
      keyword,
      status: statusFilter,
      sortBy,
      sortDir,
    })
    try {
      const r = await fetch(`/api/tenants?${q.toString()}`)
      const d = await r.json()
      setTenants(d.list || [])
    } catch (e) {
      toast.error('خطا در بارگذاری tenantها')
    } finally {
      setLoading(false)
    }
  }, [keyword, statusFilter, sortBy, sortDir])

  useEffect(() => { load() }, [load])

  // Summary stats
  const summary = useMemo(() => ({
    total: tenants.length,
    active: tenants.filter(t => t.status === 1).length,
    expired: tenants.filter(t => t.expireTime && new Date(t.expireTime) < new Date()).length,
    totalRevenue: tenants.reduce((s, t) => s + t.revenue, 0),
    totalStores: tenants.reduce((s, t) => s + t.storesCount, 0),
    totalOrders: tenants.reduce((s, t) => s + t.ordersCount, 0),
  }), [tenants])

  const enter = (t: Tenant) => {
    setTenant(t as any)
    toast.success(`وارد پنل ${t.name} شدید`)
  }

  const openCreate = () => { setEditing(null); setOpenEditor(true) }
  const openEdit = (t: Tenant) => { setEditing(t); setOpenEditor(true) }

  const toggleStatus = async (t: Tenant) => {
    const newStatus = t.status === 1 ? 0 : 1
    await fetch('/api/tenants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, status: newStatus }),
    })
    toast.success(newStatus === 1 ? 'tenant فعال شد' : 'tenant غیرفعال شد')
    load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const r = await fetch(`/api/tenants?id=${deleteTarget.id}`, { method: 'DELETE' })
      if (r.ok) {
        toast.success(`tenant «${deleteTarget.name}» و تمام داده‌های مربوطه حذف شد`)
        setDeleteTarget(null)
        load()
      } else {
        toast.error('خطا در حذف tenant')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  const handleBackup = async (t: Tenant) => {
    setBackupTarget(t)
    try {
      const r = await fetch(`/api/tenants/${t.id}/backup`)
      const data = await r.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = t.name.replace(/[^\u0600-\u06FF\w]/g, '_').slice(0, 30)
      a.download = `backup-${safeName}-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`بک‌آپ tenant «${t.name}» دانلود شد (${data.stats.orders} سفارش، ${data.stats.products} محصول)`)
      setBackupTarget(null)
    } catch (e) {
      toast.error('خطا در ایجاد بک‌آپ')
      setBackupTarget(null)
    }
  }

  const handleRestoreUpload = async (t: Tenant, file: File, mode: 'replace' | 'merge') => {
    try {
      const text = await file.text()
      const backup = JSON.parse(text)
      const r = await fetch(`/api/tenants/${t.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup, mode }),
      })
      const result = await r.json()
      if (result.ok) {
        toast.success(`بازگردانی موفق: ${result.restored.orders} سفارش، ${result.restored.products} محصول، ${result.restored.stores} شعبه`)
        load()
      } else {
        toast.error('خطا در بازگردانی: ' + (result.error || 'نامشخص'))
      }
    } catch (e) {
      toast.error('فایل بک‌آپ نامعتبر است')
    }
    setRestoreTarget(null)
  }

  const isExpired = (t: Tenant) => t.expireTime ? new Date(t.expireTime) < new Date() : false
  const daysUntilExpiry = (t: Tenant) => {
    if (!t.expireTime) return null
    const diff = new Date(t.expireTime).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            مدیریت Tenantها (Super Admin)
          </h2>
          <p className="text-sm text-muted-foreground">مدیریت کامل مستاجران پلتفرم — ایجاد، ویرایش، تمدید، بک‌آپ و حذف</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4" /> tenant جدید
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'کل Tenantها', value: summary.total, icon: Building2, color: 'from-amber-500 to-orange-600' },
          { label: 'فعال', value: summary.active, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
          { label: 'منقضی شده', value: summary.expired, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
          { label: 'کل شعب', value: summary.totalStores, icon: Store, color: 'from-blue-500 to-indigo-600' },
          { label: 'کل سفارش‌ها', value: summary.totalOrders, icon: ShoppingBag, color: 'from-purple-500 to-pink-600' },
          { label: 'درآمد پلتفرم', value: `${formatToman(summary.totalRevenue)} ت`, icon: Coins, color: 'from-teal-500 to-cyan-600' },
        ].map((c, i) => {
          const Icon = c.icon
          return (
            <Card key={i} className="p-4">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="font-bold truncate">{typeof c.value === 'number' ? toFaDigits(c.value) : c.value}</div>
            </Card>
          )
        })}
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="جستجو بر اساس نام، مخاطب، تلفن، دامنه..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="active">فقط فعال</SelectItem>
              <SelectItem value="inactive">فقط غیرفعال</SelectItem>
              <SelectItem value="expired">منقضی شده</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">تاریخ ایجاد</SelectItem>
              <SelectItem value="name">نام</SelectItem>
              <SelectItem value="revenue">درآمد</SelectItem>
              <SelectItem value="orders">تعداد سفارش</SelectItem>
              <SelectItem value="stores">تعداد شعب</SelectItem>
              <SelectItem value="expireTime">تاریخ انقضا</SelectItem>
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

          <Button variant="outline" size="icon" onClick={load} title="بارگذاری مجدد">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {loading ? 'در حال بارگذاری...' : `${toFaDigits(tenants.length)} tenant یافت شد`}
        </div>
      </Card>

      {/* Tenants list */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0,1,2].map(i => <Card key={i} className="h-80 animate-pulse bg-muted/40" />)}
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map(t => {
            const expired = isExpired(t)
            const days = daysUntilExpiry(t)
            return (
              <Card key={t.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{t.name}</h3>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="outline" className={t.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                          {t.status === 1 ? 'فعال' : 'غیرفعال'}
                        </Badge>
                        {expired && (
                          <Badge variant="outline" className="bg-red-100 text-red-700">منقضی</Badge>
                        )}
                        {!expired && days !== null && days < 14 && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700">{toFaDigits(days)} روز</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground mb-3 flex-1">
                  {t.contactName && (
                    <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 shrink-0" /> {t.contactName}</div>
                  )}
                  {t.contactMobile && (
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> {toFaDigits(t.contactMobile)}</div>
                  )}
                  {t.domain && (
                    <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{t.domain}</span></div>
                  )}
                  {t.expireTime && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className={expired ? 'text-red-600 font-medium' : ''}>
                        انقضا: {new Date(t.expireTime).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 mb-3 text-center">
                  <div className="rounded-lg bg-muted/50 p-1.5">
                    <div className="text-[10px] text-muted-foreground">شعب</div>
                    <div className="font-bold text-sm">{toFaDigits(t.storesCount)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-1.5">
                    <div className="text-[10px] text-muted-foreground">سفارش‌ها</div>
                    <div className="font-bold text-sm">{toFaDigits(t.ordersCount)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-1.5">
                    <div className="text-[10px] text-muted-foreground">محصولات</div>
                    <div className="font-bold text-sm">{toFaDigits(t.productsCount)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 mb-3">
                  <span className="text-xs text-muted-foreground">درآمد:</span>
                  <span className="font-bold text-amber-700 text-sm">{formatToman(t.revenue)} ت</span>
                </div>

                {/* Action grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => openEdit(t)}>
                    <Pencil className="w-3 h-3" /> ویرایش
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setExtendTarget(t)}>
                    <Clock className="w-3 h-3" /> تمدید
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => enter(t)}>
                    <ArrowLeft className="w-3 h-3" /> ورود
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleBackup(t)} disabled={backupTarget?.id === t.id}>
                    <Download className="w-3 h-3" /> بک‌آپ
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setRestoreTarget(t)}>
                    <Upload className="w-3 h-3" /> بازیابی
                  </Button>
                  <Button size="sm" variant={t.status === 1 ? 'destructive' : 'default'} className="gap-1 text-xs" onClick={() => toggleStatus(t)}>
                    {t.status === 1 ? <><XCircle className="w-3 h-3" /> غیرفعال</> : <><CheckCircle2 className="w-3 h-3" /> فعال</>}
                  </Button>
                </div>

                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 text-xs" onClick={() => setDeleteTarget(t)}>
                  <Trash2 className="w-3.5 h-3.5 ml-1" /> حذف کامل tenant
                </Button>
              </Card>
            )
          })}
        </div>
      ) : (
        // List view — table
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b text-xs">
                <tr className="text-right">
                  <th className="p-3 font-medium">Tenant</th>
                  <th className="p-3 font-medium">مخاطب</th>
                  <th className="p-3 font-medium">انقضا</th>
                  <th className="p-3 font-medium">شعب</th>
                  <th className="p-3 font-medium">سفارش</th>
                  <th className="p-3 font-medium">درآمد</th>
                  <th className="p-3 font-medium">وضعیت</th>
                  <th className="p-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => {
                  const expired = isExpired(t)
                  const days = daysUntilExpiry(t)
                  return (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {t.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{t.name}</div>
                            {t.domain && <div className="text-xs text-muted-foreground truncate">{t.domain}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        <div>{t.contactName || '—'}</div>
                        <div className="text-muted-foreground">{t.contactMobile ? toFaDigits(t.contactMobile) : ''}</div>
                      </td>
                      <td className="p-3 text-xs">
                        {t.expireTime ? (
                          <div className={expired ? 'text-red-600 font-medium' : days !== null && days < 14 ? 'text-amber-600' : ''}>
                            {new Date(t.expireTime).toLocaleDateString('fa-IR')}
                            {days !== null && <div className="text-[10px] text-muted-foreground">{toFaDigits(days)} روز</div>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-3 font-bold">{toFaDigits(t.storesCount)}</td>
                      <td className="p-3 font-bold">{toFaDigits(t.ordersCount)}</td>
                      <td className="p-3 font-mono font-bold text-amber-600">{formatToman(t.revenue)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={t.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                          {t.status === 1 ? 'فعال' : 'غیرفعال'}
                        </Badge>
                        {expired && <Badge variant="outline" className="bg-red-100 text-red-700 mr-1">منقضی</Badge>}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => openEdit(t)} title="ویرایش">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => setExtendTarget(t)} title="تمدید">
                            <Clock className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => handleBackup(t)} title="بک‌آپ">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => setRestoreTarget(t)} title="بازیابی">
                            <Upload className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => enter(t)} title="ورود">
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="w-7 h-7 text-red-600" onClick={() => setDeleteTarget(t)} title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && tenants.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          tenantی با این مشخصات یافت نشد
        </Card>
      )}

      {/* Editor Dialog */}
      <TenantEditor
        open={openEditor}
        onOpenChange={setOpenEditor}
        tenant={editing}
        onSaved={load}
      />

      {/* Extend Dialog */}
      <ExtendDialog
        tenant={extendTarget}
        onClose={() => setExtendTarget(null)}
        onSaved={() => { setExtendTarget(null); load() }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              تأیید حذف tenant
            </AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف tenant «<strong>{deleteTarget?.name}</strong>» مطمئن هستید؟
              <br />
              این عملیات <strong className="text-red-600">غیرقابل بازگشت</strong> است و تمام داده‌های زیر حذف خواهند شد:
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-sm">
                {deleteTarget && (
                  <ul className="space-y-1">
                    <li>• {toFaDigits(deleteTarget.storesCount)} شعبه</li>
                    <li>• {toFaDigits(deleteTarget.ordersCount)} سفارش</li>
                    <li>• {toFaDigits(deleteTarget.productsCount)} محصول</li>
                    <li>• {toFaDigits(deleteTarget.customersCount)} مشتری</li>
                    <li>• {toFaDigits(deleteTarget.usersCount)} کاربر</li>
                    <li>• تمام کوپن‌ها، میزها و دسته‌بندی‌ها</li>
                  </ul>
                )}
              </div>
              <div className="mt-2 text-xs">💡 پیشنهاد: قبل از حذف، یک بک‌آپ از tenant تهیه کنید.</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              بله، حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <RestoreDialog
        tenant={restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onRestore={handleRestoreUpload}
      />
    </div>
  )
}

// ============== Tenant Editor ==============
function TenantEditor({
  open, onOpenChange, tenant, onSaved
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  tenant: Tenant | null
  onSaved: () => void
}) {
  const isEdit = !!tenant
  const [form, setForm] = useState({
    name: '', contactName: '', contactMobile: '', domain: '',
    accountCount: '10', status: true, expireTime: '',
  })
  const [seedDemo, setSeedDemo] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (tenant) {
      setForm({
        name: tenant.name,
        contactName: tenant.contactName || '',
        contactMobile: tenant.contactMobile || '',
        domain: tenant.domain || '',
        accountCount: String(tenant.accountCount),
        status: tenant.status === 1,
        expireTime: tenant.expireTime ? tenant.expireTime.split('T')[0] : '',
      })
      setSeedDemo(false)
    } else {
      // Default new tenant: expire in 1 year
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      setForm({
        name: '', contactName: '', contactMobile: '', domain: '',
        accountCount: '10', status: true, expireTime: d.toISOString().split('T')[0],
      })
      setSeedDemo(true)
    }
  }, [tenant, open])

  const save = async () => {
    if (!form.name) { toast.error('نام tenant الزامی است'); return }
    setSaving(true)
    try {
      const payload: any = { ...form, status: form.status ? 1 : 0 }
      if (isEdit && tenant) {
        payload.id = tenant.id
        const r = await fetch('/api/tenants', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (r.ok) toast.success('tenant به‌روزرسانی شد')
        else throw new Error()
      } else {
        const r = await fetch('/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const created = await r.json()
        if (seedDemo && created.id) {
          // Seed demo data for new tenant
          await fetch(`/api/tenants/${created.id}/seed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: form.name }),
          })
          toast.success(`tenant ایجاد شد و ${toFaDigits(7)} محصول نمونه اضافه شد`)
        } else {
          toast.success('tenant ایجاد شد')
        }
      }
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('خطا در ذخیره‌سازی')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-600" />
            {isEdit ? `ویرایش tenant: ${tenant?.name}` : 'ایجاد tenant جدید'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'اطلاعات tenant را ویرایش کنید' : 'برای ایجاد tenant جدید، اطلاعات زیر را پر کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>نام tenant (کافه/رستوران) *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: کافه دمو" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>نام مخاطب</Label>
              <Input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
            </div>
            <div>
              <Label>موبایل مخاطب</Label>
              <Input value={form.contactMobile} onChange={e => setForm({ ...form, contactMobile: e.target.value })} placeholder="0912..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>دامنه (اختیاری)</Label>
              <Input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="cafe-demo.ir" dir="ltr" />
            </div>
            <div>
              <Label>تعداد کاربر مجاز</Label>
              <Input type="number" value={form.accountCount} onChange={e => setForm({ ...form, accountCount: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>تاریخ انقضا</Label>
              <Input type="date" value={form.expireTime} onChange={e => setForm({ ...form, expireTime: e.target.value })} dir="ltr" />
            </div>
            <div>
              <Label>وضعیت</Label>
              <label className="flex items-center gap-2 h-10 px-3 rounded-md border">
                <Switch checked={form.status} onCheckedChange={v => setForm({ ...form, status: v })} />
                <span className="text-sm">{form.status ? 'فعال' : 'غیرفعال'}</span>
              </label>
            </div>
          </div>

          {!isEdit && (
            <label className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg cursor-pointer">
              <Switch checked={seedDemo} onCheckedChange={setSeedDemo} />
              <div>
                <div className="text-sm font-medium">ایجاد داده‌های نمونه</div>
                <div className="text-xs text-muted-foreground">شعبه اصلی، ۳ دسته، ۷ محصول نمونه و ۶ میز به‌طور خودکار ایجاد می‌شود</div>
              </div>
            </label>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button onClick={save} disabled={saving} className="bg-amber-600 hover:bg-amber-700 gap-2">
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد tenant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============== Extend Dialog ==============
function ExtendDialog({
  tenant, onClose, onSaved
}: {
  tenant: Tenant | null
  onClose: () => void
  onSaved: () => void
}) {
  const [extendDays, setExtendDays] = useState('30')
  const [extendToDate, setExtendToDate] = useState('')
  const [mode, setMode] = useState<'days' | 'date'>('days')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (tenant?.expireTime) {
      setExtendToDate(tenant.expireTime.split('T')[0])
    } else {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      setExtendToDate(d.toISOString().split('T')[0])
    }
    setExtendDays('30')
    setMode('days')
  }, [tenant])

  if (!tenant) return null

  const currentExpiry = tenant.expireTime ? new Date(tenant.expireTime) : null
  const isExpired = currentExpiry ? currentExpiry < new Date() : false

  const doExtend = async () => {
    setSaving(true)
    let newDate: Date
    if (mode === 'days') {
      const base = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date()
      newDate = new Date(base)
      newDate.setDate(newDate.getDate() + Number(extendDays))
    } else {
      newDate = new Date(extendToDate)
    }

    try {
      await fetch('/api/tenants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tenant.id, expireTime: newDate.toISOString() }),
      })
      toast.success(`حساب tenant تا ${newDate.toLocaleDateString('fa-IR')} تمدید شد`)
      onSaved()
    } catch {
      toast.error('خطا در تمدید')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!tenant} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            تمدید حساب tenant
          </DialogTitle>
          <DialogDescription>
            tenant: <strong>{tenant.name}</strong>
            {currentExpiry && (
              <div className="mt-2">
                وضعیت فعلی:{' '}
                {isExpired ? (
                  <Badge variant="outline" className="bg-red-100 text-red-700">منقضی شده در {currentExpiry.toLocaleDateString('fa-IR')}</Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700">معتبر تا {currentExpiry.toLocaleDateString('fa-IR')}</Badge>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Tabs value={mode} onValueChange={(v: any) => setMode(v)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="days">تمدید بر اساس روز</TabsTrigger>
              <TabsTrigger value="date">تعیین تاریخ مشخص</TabsTrigger>
            </TabsList>

            <TabsContent value="days" className="space-y-3 mt-3">
              <Label>تعداد روز تمدید</Label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 90, 180, 365].map(d => (
                  <button
                    key={d}
                    onClick={() => setExtendDays(String(d))}
                    className={`p-2 rounded-lg border text-sm ${extendDays === String(d) ? 'bg-amber-500 text-white border-amber-500' : 'hover:bg-muted'}`}
                  >
                    {d === 365 ? '۱ سال' : `${toFaDigits(d)} روز`}
                  </button>
                ))}
              </div>
              <Input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)} placeholder="یا تعداد روز دلخواه..." />
            </TabsContent>

            <TabsContent value="date" className="space-y-3 mt-3">
              <Label>تاریخ انقضای جدید</Label>
              <Input type="date" value={extendToDate} onChange={e => setExtendToDate(e.target.value)} dir="ltr" />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={doExtend} disabled={saving} className="bg-amber-600 hover:bg-amber-700 gap-2">
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            تمدید حساب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============== Restore Dialog ==============
function RestoreDialog({
  tenant, onClose, onRestore
}: {
  tenant: Tenant | null
  onClose: () => void
  onRestore: (t: Tenant, file: File, mode: 'replace' | 'merge') => Promise<void>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'replace' | 'merge'>('replace')
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    if (tenant) {
      setFile(null)
      setMode('replace')
    }
  }, [tenant])

  if (!tenant) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const doRestore = async () => {
    if (!file) { toast.error('فایل بک‌آپ را انتخاب کنید'); return }
    setRestoring(true)
    try {
      await onRestore(tenant, file, mode)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <Dialog open={!!tenant} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600" />
            بازیابی tenant از بک‌آپ
          </DialogTitle>
          <DialogDescription>
            tenant: <strong>{tenant.name}</strong>
            <br />
            فایل بک‌آپ JSON را انتخاب کنید تا داده‌ها بازگردانی شوند.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>فایل بک‌آپ (JSON)</Label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="block w-full text-sm border rounded-md p-2 cursor-pointer"
            />
            {file && (
              <div className="mt-2 text-xs flex items-center gap-2 text-emerald-600">
                <FileJson className="w-4 h-4" />
                {file.name} ({toFaDigits(Math.round(file.size / 1024))} KB)
              </div>
            )}
          </div>

          <div>
            <Label>حالت بازیابی</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <label className={`p-3 rounded-lg border cursor-pointer ${mode === 'replace' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : ''}`}>
                <input type="radio" name="mode" checked={mode === 'replace'} onChange={() => setMode('replace')} className="sr-only" />
                <RotateCcw className="w-4 h-4 mb-1" />
                <div className="text-sm font-medium">جایگزینی کامل</div>
                <div className="text-xs text-muted-foreground">حذف داده‌های فعلی و بازگردانی از بک‌آپ</div>
              </label>
              <label className={`p-3 rounded-lg border cursor-pointer ${mode === 'merge' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : ''}`}>
                <input type="radio" name="mode" checked={mode === 'merge'} onChange={() => setMode('merge')} className="sr-only" />
                <Plus className="w-4 h-4 mb-1" />
                <div className="text-sm font-medium">ادغام</div>
                <div className="text-xs text-muted-foreground">افزودن به داده‌های فعلی</div>
              </label>
            </div>
          </div>

          {mode === 'replace' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>هشدار:</strong> در حالت جایگزینی، تمام داده‌های فعلی tenant (شامل سفارش‌ها، محصولات، شعب و ...) حذف شده و با داده‌های بک‌آپ جایگزین می‌شوند.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={doRestore} disabled={restoring || !file} className="bg-amber-600 hover:bg-amber-700 gap-2">
            {restoring && <RefreshCw className="w-4 h-4 animate-spin" />}
            بازیابی
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
