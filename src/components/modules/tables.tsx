'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { QrCode, Users, Plus, Pencil, Grid3x3 } from 'lucide-react'
import { toFaDigits, tableStatusLabel } from '@/lib/format'
import { toast } from 'sonner'

interface TableItem {
  id: string
  name: string
  seats: number
  status: number
  store: { name: string }
  storeId: string
}

interface Store {
  id: string
  name: string
}

export function TablesModule({ tenantId }: { tenantId: string }) {
  const [tables, setTables] = useState<TableItem[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStore, setFilterStore] = useState('all')
  const [editing, setEditing] = useState<TableItem | null>(null)
  const [openEditor, setOpenEditor] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [tRes, sRes] = await Promise.all([
      fetch(`/api/tables?tenantId=${tenantId}`),
      fetch(`/api/stores?tenantId=${tenantId}`),
    ])
    const [tData, sData] = await Promise.all([tRes.json(), sRes.json()])
    setTables(tData.list || [])
    setStores(sData.list || [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { load() }, [load])

  const updateStatus = async (t: TableItem, status: number) => {
    await fetch('/api/tables', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, status }),
    })
    load()
  }

  const filteredTables = filterStore === 'all' ? tables : tables.filter(t => t.storeId === filterStore)

  // Group by store
  const groupedByStore = filteredTables.reduce((acc, t) => {
    const key = t.store.name
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {} as Record<string, TableItem[]>)

  const stats = {
    total: tables.length,
    free: tables.filter(t => t.status === 0).length,
    occupied: tables.filter(t => t.status === 1).length,
    reserved: tables.filter(t => t.status === 2).length,
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="font-bold">مدیریت میزها</h2>
          <p className="text-sm text-muted-foreground">{toFaDigits(tables.length)} میز در {toFaDigits(Object.keys(groupedByStore).length)} شعبه</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="انتخاب شعبه" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه شعب</SelectItem>
              {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setOpenEditor(true) }} className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4" /> میز جدید
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'کل میزها', value: stats.total, color: 'text-blue-600 bg-blue-50' },
          { label: 'آزاد', value: stats.free, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'اشغال شده', value: stats.occupied, color: 'text-red-600 bg-red-50' },
          { label: 'رزرو شده', value: stats.reserved, color: 'text-amber-600 bg-amber-50' },
        ].map((s, i) => (
          <Card key={i} className={`p-4 ${s.color}`}>
            <div className="text-xs opacity-70">{s.label}</div>
            <div className="text-2xl font-bold">{toFaDigits(s.value)}</div>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card className="h-64 animate-pulse bg-muted/40" />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByStore).map(([storeName, storeTables]) => (
            <Card key={storeName} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Grid3x3 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold">{storeName}</h3>
                <Badge variant="secondary">{toFaDigits(storeTables.length)} میز</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {storeTables.map(t => {
                  const st = tableStatusLabel[t.status]
                  return (
                    <Card key={t.id} className={`p-4 text-center cursor-pointer hover:shadow-md transition-all border-2 ${t.status === 0 ? 'border-emerald-200' : t.status === 1 ? 'border-red-200' : 'border-amber-200'}`}
                      onClick={() => updateStatus(t, (t.status + 1) % 3)}
                    >
                      <div className="flex justify-center mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.status === 0 ? 'bg-emerald-100' : t.status === 1 ? 'bg-red-100' : 'bg-amber-100'}`}>
                          <QrCode className={`w-5 h-5 ${t.status === 0 ? 'text-emerald-600' : t.status === 1 ? 'text-red-600' : 'text-amber-600'}`} />
                        </div>
                      </div>
                      <div className="font-bold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                        <Users className="w-3 h-3" /> {toFaDigits(t.seats)} نفر
                      </div>
                      <Badge variant="outline" className={`mt-2 ${st.color}`}>{st.text}</Badge>
                    </Card>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <TableEditor open={openEditor} onOpenChange={setOpenEditor} table={editing} stores={stores} tenantId={tenantId} onSaved={load} />
    </div>
  )
}

function TableEditor({
  open, onOpenChange, table, stores, tenantId, onSaved
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  table: TableItem | null
  stores: Store[]
  tenantId: string
  onSaved: () => void
}) {
  const isEdit = !!table
  const [form, setForm] = useState({
    name: '', seats: '4', storeId: '',
  })

  useEffect(() => {
    if (table) {
      setForm({ name: table.name, seats: String(table.seats), storeId: table.storeId })
    } else {
      setForm({ name: '', seats: '4', storeId: stores[0]?.id || '' })
    }
  }, [table, stores, open])

  const save = async () => {
    if (!form.name || !form.storeId) { toast.error('نام و شعبه الزامی است'); return }
    const payload: any = { ...form, tenantId }
    if (isEdit && table) payload.id = table.id
    const r = await fetch('/api/tables', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (r.ok) {
      toast.success(isEdit ? 'میز به‌روزرسانی شد' : 'میز ایجاد شد')
      onOpenChange(false)
      onSaved()
    } else {
      toast.error('خطا')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'ویرایش میز' : 'میز جدید'}</DialogTitle>
          <DialogDescription>اطلاعات میز را وارد کنید</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>نام میز *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="میز ۱" />
          </div>
          <div>
            <Label>شعبه *</Label>
            <Select value={form.storeId} onValueChange={v => setForm({ ...form, storeId: v })}>
              <SelectTrigger><SelectValue placeholder="انتخاب..." /></SelectTrigger>
              <SelectContent>
                {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ظرفیت (نفر)</Label>
            <Input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button onClick={save} className="bg-amber-600 hover:bg-amber-700">{isEdit ? 'ذخیره' : 'ایجاد'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
