'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Eye, ArrowLeft, RefreshCw, Truck, ShoppingBag, Utensils, MapPin, Phone, User, Clock } from 'lucide-react'
import { formatToman, toFaDigits, orderStatusLabel, orderTypeLabel, payTypeLabel } from '@/lib/format'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OrderItem {
  id: string
  productName: string
  productImage?: string | null
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  orderNo: string
  orderType: string
  status: number
  totalNum: number
  totalPrice: number
  payPrice: number
  payType: string | null
  paid: number
  payTime: string | null
  get_time: string | null
  remark: string | null
  address: string | null
  customerName: string | null
  customerPhone: string | null
  numberId: number | null
  verifyCode: string | null
  createdAt: string
  store?: { name: string } | null
  items?: OrderItem[]
  table?: { name: string } | null
}

const STATUS_FILTERS: { value: string; label: string; status?: number }[] = [
  { value: 'all', label: 'همه' },
  { value: 'pending', label: 'در انتظار پرداخت', status: 0 },
  { value: 'paid', label: 'پرداخت شده', status: 1 },
  { value: 'preparing', label: 'در حال آماده‌سازی', status: 2 },
  { value: 'completed', label: 'تکمیل شده', status: 3 },
  { value: 'cancelled', label: 'لغو شده', status: 4 },
]

export function OrdersModule({ tenantId, storeId }: { tenantId: string; storeId: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [orderTypeFilter, setOrderTypeFilter] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [openDetail, setOpenDetail] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams({
      tenantId,
      page: String(page),
      pageSize: '15',
      status: statusFilter,
      orderType: orderTypeFilter,
    })
    if (storeId) q.set('storeId', storeId)
    const r = await fetch(`/api/orders?${q.toString()}`)
    const d = await r.json()
    setOrders(d.list || [])
    setTotal(d.total || 0)
    setLoading(false)
  }, [tenantId, storeId, page, statusFilter, orderTypeFilter])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      toast.success('وضعیت سفارش به‌روزرسانی شد')
      loadOrders()
    } catch {
      toast.error('خطا در به‌روزرسانی')
    }
  }

  const showDetail = (o: Order) => {
    setDetailOrder(o)
    setOpenDetail(true)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی شماره سفارش، نام مشتری، تلفن..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="نوع سفارش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه انواع</SelectItem>
              <SelectItem value="dinein">داخل سالن</SelectItem>
              <SelectItem value="takeout">بیرون‌بر</SelectItem>
              <SelectItem value="pickup">تحویل حضوری</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadOrders}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }} className="mt-3">
          <ScrollArea className="w-full">
            <TabsList className="flex w-max">
              {STATUS_FILTERS.map(f => (
                <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </Tabs>
      </Card>

      {/* Orders list */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-xs">
              <tr className="text-right">
                <th className="p-3 font-medium">شماره سفارش</th>
                <th className="p-3 font-medium">نوع</th>
                <th className="p-3 font-medium">مشتری</th>
                <th className="p-3 font-medium">مبلغ</th>
                <th className="p-3 font-medium">پرداخت</th>
                <th className="p-3 font-medium">وضعیت</th>
                <th className="p-3 font-medium">زمان</th>
                <th className="p-3 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">در حال بارگذاری...</td></tr>
              )}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">سفارشی یافت نشد</td></tr>
              )}
              {!loading && orders.map(o => {
                const st = orderStatusLabel[o.status]
                const ot = orderTypeLabel[o.orderType]
                return (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-mono text-xs">{o.orderNo}</div>
                      {o.numberId && <div className="text-xs text-muted-foreground">شماره تحویل: {toFaDigits(o.numberId)}</div>}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={ot.color}>
                        {o.orderType === 'dinein' && <Utensils className="w-3 h-3 ml-1" />}
                        {o.orderType === 'takeout' && <Truck className="w-3 h-3 ml-1" />}
                        {o.orderType === 'pickup' && <ShoppingBag className="w-3 h-3 ml-1" />}
                        {ot.text}
                      </Badge>
                      {o.table && <div className="text-xs text-muted-foreground mt-1">{o.table.name}</div>}
                    </td>
                    <td className="p-3">
                      <div className="text-xs">{o.customerName || '—'}</div>
                      <div className="text-xs text-muted-foreground">{o.customerPhone || ''}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold">{formatToman(o.payPrice)} ت</div>
                      <div className="text-xs text-muted-foreground">{toFaDigits(o.totalNum)} مورد</div>
                    </td>
                    <td className="p-3">
                      {o.paid ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          {o.payType ? payTypeLabel[o.payType] || o.payType : 'پرداخت شده'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">پرداخت نشده</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className={st.color}>{st.text}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleString('fa-IR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" onClick={() => showDetail(o)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="p-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              نمایش {toFaDigits((page - 1) * 15 + 1)} تا {toFaDigits(Math.min(page * 15, total))} از {toFaDigits(total)}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>قبلی</Button>
              <Button variant="outline" size="sm" disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)}>بعدی</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  جزئیات سفارش {detailOrder.orderNo}
                </DialogTitle>
                <DialogDescription>
                  {orderTypeLabel[detailOrder.orderType].text} · {orderStatusLabel[detailOrder.status].text}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {/* Customer info */}
                <Card className="p-4 space-y-2">
                  <div className="text-sm font-medium mb-2">اطلاعات مشتری</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> {detailOrder.customerName || '—'}</div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {detailOrder.customerPhone || '—'}</div>
                    {detailOrder.address && (
                      <div className="flex items-center gap-2 col-span-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {detailOrder.address}</div>
                    )}
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> {new Date(detailOrder.createdAt).toLocaleString('fa-IR')}</div>
                  </div>
                  {detailOrder.remark && (
                    <div className="text-sm bg-amber-50 dark:bg-amber-950/30 rounded p-2 mt-2">
                      <span className="font-medium">یادداشت: </span>{detailOrder.remark}
                    </div>
                  )}
                </Card>

                {/* Pickup info */}
                {detailOrder.orderType === 'pickup' && (
                  <Card className="p-4">
                    <div className="text-sm font-medium mb-2">اطلاعات تحویل</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>شماره تحویل: <span className="font-bold text-amber-600">{toFaDigits(detailOrder.numberId || 0)}</span></div>
                      <div>کد تأیید: <span className="font-mono font-bold text-emerald-600">{toFaDigits(detailOrder.verifyCode || '')}</span></div>
                      {detailOrder.get_time && <div>زمان تحویل: {new Date(detailOrder.get_time).toLocaleString('fa-IR')}</div>}
                    </div>
                  </Card>
                )}

                {/* Items */}
                <Card className="p-4">
                  <div className="text-sm font-medium mb-3">اقلام سفارش</div>
                  <div className="space-y-2">
                    {detailOrder.items?.map(it => (
                      <div key={it.id} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                        {it.productImage && <img src={it.productImage} alt={it.productName} className="w-10 h-10 rounded object-cover" />}
                        <div className="flex-1">
                          <div className="font-medium">{it.productName}</div>
                          <div className="text-xs text-muted-foreground">{formatToman(it.price)} × {toFaDigits(it.quantity)}</div>
                        </div>
                        <div className="font-bold">{formatToman(it.subtotal)} ت</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">جمع کل:</span><span>{formatToman(detailOrder.totalPrice)} ت</span></div>
                    <div className="flex justify-between font-bold text-base"><span>مبلغ نهایی:</span><span className="text-amber-600">{formatToman(detailOrder.payPrice)} ت</span></div>
                  </div>
                </Card>

                {/* Status actions */}
                <div className="flex gap-2 flex-wrap">
                  {detailOrder.status === 0 && (
                    <Button onClick={() => { handleStatusChange(detailOrder.id, 1); setOpenDetail(false) }} className="bg-blue-600 hover:bg-blue-700">تأیید پرداخت</Button>
                  )}
                  {detailOrder.status === 1 && (
                    <Button onClick={() => { handleStatusChange(detailOrder.id, 2); setOpenDetail(false) }} className="bg-amber-600 hover:bg-amber-700">شروع آماده‌سازی</Button>
                  )}
                  {detailOrder.status === 2 && (
                    <Button onClick={() => { handleStatusChange(detailOrder.id, 3); setOpenDetail(false) }} className="bg-emerald-600 hover:bg-emerald-700">تکمیل سفارش</Button>
                  )}
                  {(detailOrder.status === 0 || detailOrder.status === 1) && (
                    <Button variant="outline" onClick={() => { handleStatusChange(detailOrder.id, 4); setOpenDetail(false) }} className="text-red-600 hover:bg-red-50">لغو سفارش</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
