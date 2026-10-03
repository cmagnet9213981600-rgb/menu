'use client'
import { useEffect, useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, X, Plus, Minus, Search, MapPin, Star, Flame, Sparkles, TrendingUp, Heart, ShoppingCart, ChevronLeft, Coffee, Trash2, ArrowLeft } from 'lucide-react'
import { formatToman, toFaDigits } from '@/lib/format'
import { toast } from 'sonner'

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
  category: { name: string; id: string }
  categoryId: string
}

interface Category {
  id: string
  name: string
}

interface CartItem {
  product: Product
  qty: number
}

interface Store {
  id: string
  name: string
  notice?: string | null
  startTime?: string | null
  endTime?: string | null
  address?: string | null
  deliveryPrice: number
  minPrice: number
}

const ORDER_TYPES = [
  { key: 'dinein', label: 'داخل سالن', icon: '🍽️' },
  { key: 'takeout', label: 'بیرون‌بر', icon: '🛵' },
  { key: 'pickup', label: 'تحویل حضوری', icon: '🥡' },
]

export function CustomerMenuPreview({ open, onOpenChange, tenantId, storeId }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  tenantId: string
  storeId: string
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState<string>('all')
  const [keyword, setKeyword] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [orderType, setOrderType] = useState('dinein')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Compute phone scale based on viewport height
  useEffect(() => {
    const updateScale = () => {
      const vh = window.innerHeight
      const availableH = vh - 100 // account for dialog padding
      const scale = Math.min(1, availableH / 680)
      document.documentElement.style.setProperty('--phone-scale', String(scale))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const q = new URLSearchParams({ tenantId })
    if (storeId) q.set('storeId', storeId)
    fetch(`/api/products?${q.toString()}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.list || [])
        setCategories(d.categories || [])
      })
      .finally(() => setLoading(false))

    // Load store info
    fetch(`/api/stores?tenantId=${tenantId}`)
      .then(r => r.json())
      .then(d => {
        const list: Store[] = d.list || []
        if (storeId) {
          setStore(list.find(s => s.id === storeId) || null)
        } else if (list.length > 0) {
          setStore(list[0])
        }
      })
  }, [open, tenantId, storeId])

  const filteredProducts = useMemo(() => {
    let result = products
    if (activeCat !== 'all') result = result.filter(p => p.categoryId === activeCat)
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(k))
    }
    return result
  }, [products, activeCat, keyword])

  const cartCount = cart.reduce((s, c) => s + c.qty, 0)
  const cartTotal = cart.reduce((s, c) => s + c.qty * c.product.price, 0)
  const deliveryFee = orderType === 'takeout' && store ? store.deliveryPrice : 0
  const grandTotal = cartTotal + deliveryFee

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id)
      if (existing) {
        return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { product, qty: 1 }]
    })
    toast.success(`${product.name} به سبد اضافه شد`)
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(c => {
        if (c.product.id !== productId) return c
        const newQty = c.qty + delta
        return { ...c, qty: Math.max(0, newQty) }
      }).filter(c => c.qty > 0)
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId))
  }

  const checkout = () => {
    toast.success(`سفارش شما با موفقیت ثبت شد! مبلغ نهایی: ${formatToman(grandTotal)} ت`)
    setCart([])
    setShowCart(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden max-h-[95vh] flex flex-col" dir="rtl">
        <DialogTitle className="sr-only">پیش‌نمایش منو از دید مشتری</DialogTitle>
        <DialogDescription className="sr-only">شبیه‌ساز موبایل منوی مشتری</DialogDescription>
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left side: explanation */}
          <div className="hidden md:block w-72 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-950 p-6 border-l overflow-y-auto shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">پیش‌نمایش مشتری</div>
                <div className="text-xs text-muted-foreground">نمای منو از دید مشتری</div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              این دقیقاً همان چیزی است که مشتری وقتی با موبایل خود QR کد میز را اسکن می‌کند می‌بیند.
              می‌توانید محصولات را به سبد اضافه کنید و فرآیند سفارش‌گیری را تست کنید.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-lg border">
                <div className="text-xs font-medium mb-1">📱 ویژگی‌های نسخه مشتری:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• انتخاب نوع سفارش (سالن/بیرون‌بر/حضوری)</li>
                  <li>• مرور منو بر اساس دسته‌بندی</li>
                  <li>• جستجوی محصول</li>
                  <li>• افزودن به سبد خرید</li>
                  <li>• محاسبه خودکار هزینه ارسال</li>
                  <li>• تسویه حساب</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-100 dark:bg-amber-950/40 rounded-lg">
                <div className="text-xs font-medium">💡 نکته</div>
                <div className="text-xs text-muted-foreground mt-1">
                  در نسخه اصلی yshop-drink، این صفحه با UniApp برای وب، WeChat Mini Program و H5 ساخته می‌شود.
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2">
                Tenant: <span className="font-mono">{tenantId.slice(0, 8)}…</span>
                <br />
                {store && <>شعبه: <strong>{store.name}</strong></>}
              </div>
            </div>
          </div>

          {/* Right side: phone mockup */}
          <div className="flex-1 bg-gray-100 dark:bg-zinc-950 p-2 md:p-4 flex items-center justify-center overflow-hidden" style={{minHeight: 0}}>
            <div className="origin-center flex items-center justify-center" style={{
              transform: 'scale(var(--phone-scale, 0.7))',
              transformOrigin: 'center center',
              height: 'calc(680px * var(--phone-scale, 0.7))',
              width: 'calc(360px * var(--phone-scale, 0.7))',
              maxHeight: 'calc(100vh - 100px)',
            }}>
            <div className="w-[360px] h-[680px] bg-black rounded-[3rem] p-3 shadow-2xl shrink-0">
              <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden relative flex flex-col">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50" />

                {/* App header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white pt-8 pb-4 px-4">
                  {/* Store info */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-base">{store?.name || 'کافه دمو'}</div>
                      {store?.address && (
                        <div className="text-xs opacity-90 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> <span className="truncate max-w-[200px]">{store.address}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Order type tabs */}
                  <div className="flex gap-1 bg-white/20 rounded-lg p-1">
                    {ORDER_TYPES.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setOrderType(t.key)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                          orderType === t.key ? 'bg-white text-amber-700' : 'text-white'
                        }`}
                      >
                        <span className="ml-1">{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notice banner */}
                {store?.notice && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs px-4 py-2 border-b">
                    📢 {store.notice}
                  </div>
                )}

                {/* Search */}
                <div className="px-4 py-2 border-b">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="جستجوی محصول..."
                      value={keyword}
                      onChange={e => setKeyword(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-zinc-800 rounded-lg py-2 pr-9 pl-3 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Category tabs */}
                {categories.length > 0 && (
                  <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white dark:bg-zinc-900 border-b">
                    <button
                      onClick={() => setActiveCat('all')}
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                        activeCat === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      همه
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCat(c.id)}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                          activeCat === c.id ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Products list */}
                <div className="flex-1 overflow-y-auto">
                  {loading && (
                    <div className="p-4 space-y-3">
                      {[0,1,2].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
                    </div>
                  )}

                  {!loading && filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-400">
                      محصولی یافت نشد
                    </div>
                  )}

                  <div className="p-3 space-y-2">
                    {filteredProducts.map(p => {
                      const inCart = cart.find(c => c.product.id === p.id)
                      return (
                        <div key={p.id} className="flex gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700">
                          {/* Image */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-700 shrink-0 relative">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Coffee className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {/* Badges */}
                            <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                              {p.isHot === 1 && <span className="text-[9px] bg-red-500 text-white px-1 py-0.5 rounded">داغ</span>}
                              {p.isNew === 1 && <span className="text-[9px] bg-blue-500 text-white px-1 py-0.5 rounded">جدید</span>}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-medium text-sm line-clamp-1">{p.name}</h3>
                              {p.isBest === 1 && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                            </div>
                            {p.isBenefit === 1 && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-0.5">
                                <TrendingUp className="w-3 h-3" /> پیشنهاد ویژه
                              </div>
                            )}
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              فروش: {toFaDigits(p.sales)} · واحد: {p.unit}
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="font-bold text-amber-600 text-sm">
                                {formatToman(p.price)} <span className="text-[10px] text-gray-400">ت</span>
                              </div>
                              {/* Add to cart / qty controls */}
                              {inCart ? (
                                <div className="flex items-center gap-2 bg-amber-500 rounded-full">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQty(p.id, -1) }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="w-6 h-6 flex items-center justify-center text-white"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-white text-xs font-bold min-w-[16px] text-center">{toFaDigits(inCart.qty)}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQty(p.id, 1) }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="w-6 h-6 flex items-center justify-center text-white"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); addToCart(p) }}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Cart bar (when items exist) */}
                {cartCount > 0 && !showCart && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCart(true) }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {toFaDigits(cartCount)}
                        </span>
                      </div>
                      <span className="text-sm font-medium">مشاهده سبد</span>
                    </div>
                    <div className="font-bold">{formatToman(cartTotal)} ت</div>
                  </button>
                )}

                {/* Cart modal */}
                {showCart && (
                  <div className="absolute inset-0 bg-black/50 z-40 flex items-end" onClick={() => setShowCart(false)}>
                    <div
                      className="bg-white dark:bg-zinc-900 w-full rounded-t-2xl max-h-[80%] flex flex-col"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-bold">سبد خرید</h3>
                        <button onClick={() => setShowCart(false)} className="text-gray-400">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {cart.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            سبد خرید خالی است
                          </div>
                        ) : (
                          cart.map(c => (
                            <div key={c.product.id} className="flex gap-3 p-2 border-b last:border-0">
                              {c.product.image && (
                                <img src={c.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{c.product.name}</div>
                                <div className="text-xs text-amber-600">{formatToman(c.product.price)} ت</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); updateQty(c.product.id, -1) }} onPointerDown={(e) => e.stopPropagation()} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-bold w-5 text-center">{toFaDigits(c.qty)}</span>
                                <button onClick={(e) => { e.stopPropagation(); updateQty(c.product.id, 1) }} onPointerDown={(e) => e.stopPropagation()} className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button onClick={() => removeFromCart(c.product.id)} className="w-6 h-6 text-red-500 flex items-center justify-center">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {cart.length > 0 && (
                        <div className="border-t p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">جمع کل:</span>
                            <span>{formatToman(cartTotal)} ت</span>
                          </div>
                          {deliveryFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">هزینه ارسال:</span>
                              <span>{formatToman(deliveryFee)} ت</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-base">
                            <span>مبلغ نهایی:</span>
                            <span className="text-amber-600">{formatToman(grandTotal)} ت</span>
                          </div>
                          <Button
                            onClick={checkout}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
                          >
                            ثبت سفارش
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
