'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Phone, Clock, Plus, Pencil, Truck, Coins, Building, QrCode, BarChart3, Trash2, Eye, Image as ImageIcon, Settings2, Table2, ShoppingBag, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { formatToman, toFaDigits, tableStatusLabel, orderTypeLabel, orderStatusLabel, payTypeLabel } from '@/lib/format'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

interface Store {
  id: string
  name: string
  phone?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  startTime?: string | null
  endTime?: string | null
  distance: number
  minPrice: number
  deliveryPrice: number
  notice?: string | null
  images?: string | null
  status: number
}

interface StoreStats {
  store: Store
  summary: {
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
    productsCount: number
    tablesCount: number
  }
  orderTypeStats: { dinein: number; takeout: number; pickup: number }
  statusStats: { pending: number; paid: number; preparing: number; completed: number; cancelled: number }
  tableStats: { total: number; free: number; occupied: number; reserved: number }
  daily: { date: string; revenue: number; orders: number }[]
  payTypeMap: Record<string, number>
  topProducts: { name: string; qty: number; revenue: number }[]
}

export function StoresModule({ tenantId }: { tenantId: string }) {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Store | null>(null)
  const [openEditor, setOpenEditor] = useState(false)
  const [statsStore, setStatsStore] = useState<Store | null>(null)
  const [qrStore, setQrStore] = useState<Store | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch(`/api/stores?tenantId=${tenantId}`)
    const d = await r.json()
    setStores(d.list || [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setOpenEditor(true) }
  const openEdit = (s: Store) => { setEditing(s); setOpenEditor(true) }

  const toggleStatus = async (s: Store) => {
    await fetch('/api/stores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, status: s.status === 1 ? 0 : 1 }),
    })
    toast.success(s.status === 1 ? 'شعبه بسته شد' : 'شعبه باز شد')
    load()
  }

  const handleDelete = async (s: Store) => {
    if (!confirm(`آیا از حذف شعبه «${s.name}» مطمئن هستید؟ تمام سفارشات و میزهای این شعبه نیز حذف خواهند شد.`)) return
    await fetch(`/api/stores?id=${s.id}`, { method: 'DELETE' })
    toast.success('شعبه حذف شد')
    load()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">مدیریت شعب</h2>
          <p className="text-sm text-muted-foreground">{toFaDigits(stores.length)} شعبه · {toFaDigits(stores.filter(s => s.status === 1).length)} شعبه فعال</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4" /> شعبه جدید
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[0,1,2].map(i => <Card key={i} className="h-72 animate-pulse bg-muted/40" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map(s => (
            <Card key={s.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{s.name}</h3>
                    <Badge variant="outline" className={s.status === 1 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                      {s.status === 1 ? 'باز' : 'بسته'}
                    </Badge>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground flex-1">
                {s.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> <span className="truncate">{s.phone}</span></div>}
                {s.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> <span className="truncate">{s.address}</span></div>}
                {s.startTime && s.endTime && (
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> {toFaDigits(s.startTime)} تا {toFaDigits(s.endTime)}</div>
                )}
                <div className="flex items-center gap-2"><Truck className="w-4 h-4 shrink-0" /> شعاع ارسال: {toFaDigits(s.distance)} کیلومتر</div>
                <div className="flex items-center gap-2"><Coins className="w-4 h-4 shrink-0" /> حداقل سفارش: {formatToman(s.minPrice)} ت</div>
              </div>

              {s.notice && (
                <div className="text-xs bg-amber-50 dark:bg-amber-950/30 rounded p-2 mt-3">
                  <span className="font-medium">اعلامیه: </span>{s.notice}
                </div>
              )}

              {/* Action grid */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setStatsStore(s)}>
                  <BarChart3 className="w-3.5 h-3.5" /> آمار
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setQrStore(s)}>
                  <QrCode className="w-3.5 h-3.5" /> QR منو
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(s)}>
                  <Settings2 className="w-3.5 h-3.5" /> ویرایش
                </Button>
                <Button size="sm" variant={s.status === 1 ? 'destructive' : 'default'} onClick={() => toggleStatus(s)}>
                  {s.status === 1 ? 'بستن' : 'باز کردن'}
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="text-red-600 mt-1" onClick={() => handleDelete(s)}>
                <Trash2 className="w-3.5 h-3.5 ml-1" /> حذف شعبه
              </Button>
            </Card>
          ))}
        </div>
      )}

      <StoreEditor open={openEditor} onOpenChange={setOpenEditor} store={editing} tenantId={tenantId} onSaved={load} />
      <StoreStatsDialog store={statsStore} onClose={() => setStatsStore(null)} />
      <StoreQRDialog store={qrStore} onClose={() => setQrStore(null)} />
    </div>
  )
}

// ============== Store Editor (enhanced) ==============
function StoreEditor({
  open, onOpenChange, store, tenantId, onSaved
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  store: Store | null
  tenantId: string
  onSaved: () => void
}) {
  const isEdit = !!store
  const [form, setForm] = useState({
    name: '', phone: '', address: '', latitude: '', longitude: '',
    startTime: '09:00', endTime: '23:00',
    distance: '5', minPrice: '0', deliveryPrice: '30000',
    notice: '', images: '', status: true,
  })

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name, phone: store.phone || '', address: store.address || '',
        latitude: store.latitude ? String(store.latitude) : '',
        longitude: store.longitude ? String(store.longitude) : '',
        startTime: store.startTime || '09:00', endTime: store.endTime || '23:00',
        distance: String(store.distance), minPrice: String(store.minPrice),
        deliveryPrice: String(store.deliveryPrice), notice: store.notice || '',
        images: '', status: store.status === 1,
      })
    } else {
      setForm({
        name: '', phone: '', address: '', latitude: '', longitude: '',
        startTime: '09:00', endTime: '23:00',
        distance: '5', minPrice: '0', deliveryPrice: '30000',
        notice: '', images: '', status: true,
      })
    }
  }, [store, open])

  const save = async () => {
    if (!form.name) { toast.error('نام شعبه الزامی است'); return }
    const payload: any = {
      ...form,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      tenantId,
    }
    if (isEdit && store) payload.id = store.id
    const r = await fetch('/api/stores', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (r.ok) {
      toast.success(isEdit ? 'شعبه به‌روزرسانی شد' : 'شعبه ایجاد شد')
      onOpenChange(false)
      onSaved()
    } else {
      toast.error('خطا در ذخیره‌سازی')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'ویرایش شعبه' : 'شعبه جدید'}</DialogTitle>
          <DialogDescription>اطلاعات کامل شعبه را وارد کنید</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">اطلاعات اصلی</TabsTrigger>
            <TabsTrigger value="location">موقعیت و ساعت</TabsTrigger>
            <TabsTrigger value="delivery">ارسال و تصاویر</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <Label>نام شعبه *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="کافه تهران - شعبه ونک" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>تلفن</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="02188880001" />
              </div>
              <div>
                <Label>وضعیت</Label>
                <label className="flex items-center gap-2 h-10 px-3 rounded-md border">
                  <Switch checked={form.status} onCheckedChange={v => setForm({ ...form, status: v })} />
                  <span className="text-sm">{form.status ? 'باز' : 'بسته'}</span>
                </label>
              </div>
            </div>
            <div>
              <Label>آدرس کامل</Label>
              <Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} placeholder="تهران، ونک، خیابان ملاصدرا، پلاک ۱۲۳" />
            </div>
            <div>
              <Label>اعلامیه شعبه</Label>
              <Textarea value={form.notice} onChange={e => setForm({ ...form, notice: e.target.value })} rows={2} placeholder="همیشه قهوه تازه!" />
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ساعت شروع کار</Label>
                <Input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} placeholder="08:00" />
              </div>
              <div>
                <Label>ساعت پایان کار</Label>
                <Input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} placeholder="23:00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>عرض جغرافیایی (Latitude)</Label>
                <Input type="number" step="0.0001" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} placeholder="35.7575" />
              </div>
              <div>
                <Label>طول جغرافیایی (Longitude)</Label>
                <Input type="number" step="0.0001" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} placeholder="51.4100" />
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-muted-foreground">
              💡 مختصات جغرافیایی برای نمایش شعبه روی نقشه و محاسبه فاصله مشتری در سفارش‌های بیرون‌بر استفاده می‌شود.
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>شعاع ارسال (km)</Label>
                <Input type="number" step="0.5" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} />
              </div>
              <div>
                <Label>حداقل سفارش (ت)</Label>
                <Input type="number" value={form.minPrice} onChange={e => setForm({ ...form, minPrice: e.target.value })} />
              </div>
              <div>
                <Label>هزینه ارسال (ت)</Label>
                <Input type="number" value={form.deliveryPrice} onChange={e => setForm({ ...form, deliveryPrice: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>تصاویر شعبه (URLها، هر خط یک تصویر)</Label>
              <Textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} rows={3} placeholder="https://..." />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button onClick={save} className="bg-amber-600 hover:bg-amber-700">{isEdit ? 'ذخیره تغییرات' : 'ایجاد شعبه'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============== Store Stats Dialog ==============
function StoreStatsDialog({ store, onClose }: { store: Store | null; onClose: () => void }) {
  const [stats, setStats] = useState<StoreStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!store) { setStats(null); return }
    setLoading(true)
    fetch(`/api/stores/${store.id}/stats`)
      .then(r => r.json())
      .then(d => setStats(d))
      .finally(() => setLoading(false))
  }, [store])

  if (!store) return null

  const orderTypePie = stats ? [
    { name: 'داخل سالن', value: stats.orderTypeStats.dinein, color: '#a855f7' },
    { name: 'بیرون‌بر', value: stats.orderTypeStats.takeout, color: '#06b6d4' },
    { name: 'تحویل حضوری', value: stats.orderTypeStats.pickup, color: '#14b8a6' },
  ].filter(d => d.value > 0) : []

  const statusPie = stats ? [
    { name: 'تکمیل شده', value: stats.statusStats.completed, color: '#10b981' },
    { name: 'در حال آماده‌سازی', value: stats.statusStats.preparing, color: '#f59e0b' },
    { name: 'پرداخت شده', value: stats.statusStats.paid, color: '#3b82f6' },
    { name: 'در انتظار', value: stats.statusStats.pending, color: '#94a3b8' },
    { name: 'لغو شده', value: stats.statusStats.cancelled, color: '#ef4444' },
  ].filter(d => d.value > 0) : []

  return (
    <Dialog open={!!store} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            آمار شعبه: {store.name}
          </DialogTitle>
          <DialogDescription>نمای کلی عملکرد این شعبه در ۱۴ روز گذشته</DialogDescription>
        </DialogHeader>

        {loading && <div className="h-96 animate-pulse bg-muted/40 rounded-lg" />}

        {stats && (
          <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'درآمد کل', value: `${formatToman(stats.summary.totalRevenue)} ت`, icon: Coins, color: 'text-amber-600' },
                { label: 'کل سفارش‌ها', value: toFaDigits(stats.summary.totalOrders), icon: ShoppingBag, color: 'text-blue-600' },
                { label: 'میانگین سفارش', value: `${formatToman(Math.round(stats.summary.avgOrderValue))} ت`, icon: BarChart3, color: 'text-emerald-600' },
                { label: 'تعداد میزها', value: toFaDigits(stats.summary.tablesCount), icon: Table2, color: 'text-purple-600' },
              ].map((c, i) => {
                const Icon = c.icon
                return (
                  <Card key={i} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${c.color}`} />
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                    </div>
                    <div className="font-bold text-sm">{c.value}</div>
                  </Card>
                )
              })}
            </div>

            {/* Daily revenue */}
            <Card className="p-4">
              <h3 className="font-bold text-sm mb-3">روند درآمد روزانه (۱۴ روز اخیر)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} reversed />
                  <YAxis tick={{ fontSize: 10 }} orientation="right" tickFormatter={v => `${Math.round(v / 1000)}K`} />
                  <Tooltip formatter={(v: number) => `${formatToman(v)} ت`} labelFormatter={l => `تاریخ: ${toFaDigits(l)}`} contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }} />
                  <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Order type pie */}
              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3">تفکیک نوع سفارش</h3>
                {orderTypePie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={orderTypePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e: any) => e.name}>
                        {orderTypePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => toFaDigits(v)} contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="text-center text-xs text-muted-foreground py-8">داده‌ای موجود نیست</div>}
              </Card>

              {/* Status pie */}
              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3">تفکیک وضعیت سفارش‌ها</h3>
                {statusPie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e: any) => e.name}>
                        {statusPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => toFaDigits(v)} contentStyle={{ fontFamily: 'inherit', direction: 'rtl' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="text-center text-xs text-muted-foreground py-8">داده‌ای موجود نیست</div>}
              </Card>
            </div>

            {/* Tables & Top products */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3">وضعیت میزها</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="text-xs text-muted-foreground">کل</div>
                    <div className="font-bold text-lg">{toFaDigits(stats.tableStats.total)}</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
                    <div className="text-xs text-muted-foreground">آزاد</div>
                    <div className="font-bold text-lg text-emerald-600">{toFaDigits(stats.tableStats.free)}</div>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
                    <div className="text-xs text-muted-foreground">اشغال</div>
                    <div className="font-bold text-lg text-red-600">{toFaDigits(stats.tableStats.occupied)}</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                    <div className="text-xs text-muted-foreground">رزرو</div>
                    <div className="font-bold text-lg text-amber-600">{toFaDigits(stats.tableStats.reserved)}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold text-sm mb-3">پرفروش‌ترین محصولات</h3>
                <div className="space-y-2">
                  {stats.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-amber-500 text-white text-xs flex items-center justify-center shrink-0">{toFaDigits(i + 1)}</span>
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {toFaDigits(p.qty)} عدد · {formatToman(p.revenue)} ت
                      </span>
                    </div>
                  ))}
                  {stats.topProducts.length === 0 && <div className="text-center text-xs text-muted-foreground py-4">داده‌ای موجود نیست</div>}
                </div>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============== Store QR Dialog ==============
function StoreQRDialog({ store, onClose }: { store: Store | null; onClose: () => void }) {
  if (!store) return null

  // Simulated QR URL — points to mobile menu
  const menuUrl = `https://yshop-drink.demo/menu/${store.id}`
  const tableQrData = (tableNum: number) => `${menuUrl}?table=${tableNum}`

  return (
    <Dialog open={!!store} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            QR کد منوی شعبه
          </DialogTitle>
          <DialogDescription>
            مشتریان با اسکن این QR کد می‌توانند منو را در موبایل خود ببینند و سفارش بدهند
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-amber-100">
            <QRCodeSVG
              value={menuUrl}
              size={200}
              level="H"
              fgColor="#92400e"
              bgColor="#ffffff"
            />
          </div>
          <div className="mt-4 text-center">
            <div className="font-bold">{store.name}</div>
            <div className="text-xs text-muted-foreground mt-1 break-all">{menuUrl}</div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-xs w-full">
            <div className="font-medium mb-1">💡 راهنما:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• این QR را روی میزها یا دیوار شعبه چاپ کنید</li>
              <li>• هر میز می‌تواند QR اختصاصی خود را داشته باشد</li>
              <li>• برای تولید QR اختصاصی هر میز، به بخش «میزها» مراجعه کنید</li>
            </ul>
          </div>

          <Button
            className="mt-4 w-full gap-2"
            variant="outline"
            onClick={() => {
              const svg = document.querySelector('svg')
              if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg)
                const blob = new Blob([svgData], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `qr-${store.name}.svg`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('QR کد دانلود شد')
              }
            }}
          >
            <ImageIcon className="w-4 h-4" /> دانلود QR کد
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
