'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Pencil, Trash2, Flame, Star, Sparkles, TrendingUp, Package, Eye } from 'lucide-react'
import { formatToman, toFaDigits } from '@/lib/format'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomerMenuPreview } from './customer-menu-preview'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description?: string | null
  image?: string | null
  price: number
  costPrice: number
  stock: number
  sales: number
  unit: string
  isHot: number
  isNew: number
  isBest: number
  isBenefit: number
  status: number
  category: { name: string }
  categoryId: string
}

export function MenuModule({ tenantId, storeId }: { tenantId: string; storeId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [editing, setEditing] = useState<Product | null>(null)
  const [openEditor, setOpenEditor] = useState(false)
  const [creating, setCreating] = useState(false)
  const [openPreview, setOpenPreview] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams({ tenantId, keyword })
    if (storeId) q.set('storeId', storeId)
    if (activeCat !== 'all') q.set('categoryId', activeCat)
    const r = await fetch(`/api/products?${q.toString()}`)
    const d = await r.json()
    setProducts(d.list || [])
    setCategories(d.categories || [])
    setLoading(false)
  }, [tenantId, storeId, keyword, activeCat])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditing(null)
    setCreating(true)
    setOpenEditor(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setCreating(false)
    setOpenEditor(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
    toast.success('محصول حذف شد')
    load()
  }

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="جستجوی محصول..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pr-10" />
          </div>
          <Button variant="outline" onClick={() => setOpenPreview(true)} className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
            <Eye className="w-4 h-4" /> پیش‌نمایش مشتری
          </Button>
          <Button onClick={openCreate} className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4" /> محصول جدید
          </Button>
        </div>

        {categories.length > 0 && (
          <Tabs value={activeCat} onValueChange={setActiveCat} className="mt-3">
            <ScrollArea className="w-full">
              <TabsList className="flex w-max">
                <TabsTrigger value="all">همه</TabsTrigger>
                {categories.map(c => (
                  <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </Tabs>
        )}
      </Card>

      {/* Products grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[0,1,2,3,4,5,6,7].map(i => <Card key={i} className="h-64 animate-pulse bg-muted/40" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map(p => (
            <Card key={p.id} className="overflow-hidden flex flex-col group">
              <div className="relative aspect-square bg-muted overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {p.isHot === 1 && <Badge className="bg-red-500 hover:bg-red-500"><Flame className="w-3 h-3 ml-1" /> داغ</Badge>}
                  {p.isNew === 1 && <Badge className="bg-blue-500 hover:bg-blue-500"><Sparkles className="w-3 h-3 ml-1" /> جدید</Badge>}
                  {p.isBest === 1 && <Badge className="bg-amber-500 hover:bg-amber-500"><Star className="w-3 h-3 ml-1" /> برتر</Badge>}
                  {p.isBenefit === 1 && <Badge className="bg-emerald-500 hover:bg-emerald-500"><TrendingUp className="w-3 h-3 ml-1" /> پیشنهاد</Badge>}
                </div>
                {p.status === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">غیرفعال</Badge>
                  </div>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <div className="text-xs text-muted-foreground mb-1">{p.category.name}</div>
                <h3 className="font-medium text-sm mb-1 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>فروش: {toFaDigits(p.sales)}</span>
                  <span>·</span>
                  <span>موجودی: {toFaDigits(p.stock)}</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="font-bold text-amber-600">{formatToman(p.price)} ت</div>
                    <div className="text-[10px] text-muted-foreground">هزینه: {formatToman(p.costPrice)} ت</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          محصولی یافت نشد
        </Card>
      )}

      <ProductEditor
        open={openEditor}
        onOpenChange={setOpenEditor}
        product={editing}
        categories={categories}
        tenantId={tenantId}
        storeId={storeId}
        onSaved={load}
      />

      <CustomerMenuPreview
        open={openPreview}
        onOpenChange={setOpenPreview}
        tenantId={tenantId}
        storeId={storeId}
      />
    </div>
  )
}

function ProductEditor({
  open, onOpenChange, product, categories, tenantId, storeId, onSaved
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  product: Product | null
  categories: Category[]
  tenantId: string
  storeId: string
  onSaved: () => void
}) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name: '', description: '', image: '', price: '', costPrice: '', stock: '999',
    unit: '份', categoryId: '', isHot: false, isNew: false, isBest: false, isBenefit: false,
  })

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || '',
        image: product.image || '',
        price: String(product.price),
        costPrice: String(product.costPrice),
        stock: String(product.stock),
        unit: product.unit,
        categoryId: product.categoryId,
        isHot: product.isHot === 1,
        isNew: product.isNew === 1,
        isBest: product.isBest === 1,
        isBenefit: product.isBenefit === 1,
      })
    } else {
      setForm({
        name: '', description: '', image: '', price: '', costPrice: '', stock: '999',
        unit: '份', categoryId: categories[0]?.id || '',
        isHot: false, isNew: false, isBest: false, isBenefit: false,
      })
    }
  }, [product, categories, open])

  const save = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('نام، قیمت و دسته‌بندی الزامی است')
      return
    }
    const payload: any = { ...form, tenantId, storeId }
    if (isEdit && product) payload.id = product.id

    const method = isEdit ? 'PATCH' : 'POST'
    const r = await fetch('/api/products', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    if (r.ok) {
      toast.success(isEdit ? 'محصول به‌روزرسانی شد' : 'محصول ایجاد شد')
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
          <DialogTitle>{isEdit ? 'ویرایش محصول' : 'ایجاد محصول جدید'}</DialogTitle>
          <DialogDescription>اطلاعات محصول را وارد کنید</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>نام محصول *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>دسته‌بندی *</Label>
              <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>آدرس تصویر</Label>
            <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            {form.image && <img src={form.image} alt="" className="mt-2 w-24 h-24 rounded-lg object-cover" />}
          </div>

          <div>
            <Label>توضیحات</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label>قیمت فروش (ت) *</Label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label>قیمت هزینه (ت)</Label>
              <Input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
            </div>
            <div>
              <Label>موجودی</Label>
              <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <Label>واحد</Label>
              <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>برچسب‌ها</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {[
                { key: 'isHot', label: 'داغ', icon: Flame, color: 'text-red-500' },
                { key: 'isNew', label: 'جدید', icon: Sparkles, color: 'text-blue-500' },
                { key: 'isBest', label: 'برتر', icon: Star, color: 'text-amber-500' },
                { key: 'isBenefit', label: 'پیشنهاد', icon: TrendingUp, color: 'text-emerald-500' },
              ].map(b => {
                const Icon = b.icon
                return (
                  <label key={b.key} className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50">
                    <Icon className={`w-4 h-4 ${b.color}`} />
                    <span className="text-sm flex-1">{b.label}</span>
                    <Switch
                      checked={(form as any)[b.key]}
                      onCheckedChange={v => setForm({ ...form, [b.key]: v })}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button onClick={save} className="bg-amber-600 hover:bg-amber-700">{isEdit ? 'ذخیره تغییرات' : 'ایجاد محصول'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
