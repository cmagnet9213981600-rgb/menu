import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/tenants/[id]/restore — restore tenant data from backup JSON
// Body: { backup: {...}, mode: 'replace' | 'merge' }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { backup, mode = 'replace' } = body

  if (!backup || !backup.tenant) {
    return NextResponse.json({ error: 'invalid backup format' }, { status: 400 })
  }

  const tenant = await db.tenant.findUnique({ where: { id } })
  if (!tenant) return NextResponse.json({ error: 'tenant not found' }, { status: 404 })

  // In 'replace' mode, wipe existing data first
  if (mode === 'replace') {
    const existingOrders = await db.order.findMany({ where: { tenantId: id }, select: { id: true } })
    if (existingOrders.length > 0) {
      await db.orderItem.deleteMany({ where: { orderId: { in: existingOrders.map(o => o.id) } } })
    }
    await db.order.deleteMany({ where: { tenantId: id } })
    await db.restaurantTable.deleteMany({ where: { tenantId: id } })
    await db.product.deleteMany({ where: { tenantId: id } })
    await db.category.deleteMany({ where: { tenantId: id } })
    await db.store.deleteMany({ where: { tenantId: id } })
    await db.user.deleteMany({ where: { tenantId: id } })
    await db.customer.deleteMany({ where: { tenantId: id } })
    await db.coupon.deleteMany({ where: { tenantId: id } })
  }

  // Restore stores
  const storeIdMap = new Map<string, string>()
  for (const s of backup.stores || []) {
    const oldId = s.id
    delete s.id
    delete s.tenantId
    delete s.createdAt
    delete s.updatedAt
    const newStore = await db.store.create({ data: { ...s, tenantId: id } })
    storeIdMap.set(oldId, newStore.id)
  }

  // Helper to convert ISO string dates to Date objects
  const convertDates = (obj: any, fields: string[]) => {
    for (const f of fields) {
      if (obj[f] && typeof obj[f] === 'string') {
        obj[f] = new Date(obj[f])
      }
    }
    return obj
  }

  // Restore categories
  const catIdMap = new Map<string, string>()
  for (const c of backup.categories || []) {
    const oldId = c.id
    delete c.id
    delete c.tenantId
    delete c.createdAt
    delete c.updatedAt
    const newCat = await db.category.create({ data: { ...c, tenantId: id } })
    catIdMap.set(oldId, newCat.id)
  }

  // Restore products (need to map categoryId & storeId)
  const prodIdMap = new Map<string, string>()
  // Ensure at least one fallback category exists for products without one
  let fallbackCatId: string | null = null
  const getFallbackCat = async () => {
    if (!fallbackCatId) {
      const c = await db.category.create({ data: { tenantId: id, name: 'بازگردانی شده', sort: 999 } })
      fallbackCatId = c.id
    }
    return fallbackCatId
  }
  for (const p of backup.products || []) {
    const oldId = p.id
    delete p.id
    delete p.tenantId
    delete p.createdAt
    delete p.updatedAt
    // categoryId is required in schema — must map or fallback
    if (p.categoryId && catIdMap.has(p.categoryId)) {
      p.categoryId = catIdMap.get(p.categoryId)
    } else {
      p.categoryId = await getFallbackCat()
    }
    // storeId is optional — delete if can't map
    if (p.storeId && storeIdMap.has(p.storeId)) {
      p.storeId = storeIdMap.get(p.storeId)
    } else {
      delete p.storeId
    }
    const newProd = await db.product.create({ data: { ...p, tenantId: id } })
    prodIdMap.set(oldId, newProd.id)
  }

  // Restore tables (map storeId)
  for (const t of backup.tables || []) {
    delete t.id
    delete t.tenantId
    delete t.createdAt
    delete t.updatedAt
    if (t.storeId && storeIdMap.has(t.storeId)) t.storeId = storeIdMap.get(t.storeId)
    else continue
    await db.restaurantTable.create({ data: { ...t, tenantId: id } })
  }

  // Restore users
  for (const u of backup.users || []) {
    delete u.id
    delete u.tenantId
    delete u.createdAt
    delete u.updatedAt
    await db.user.create({ data: { ...u, tenantId: id } })
  }

  // Restore customers
  for (const c of backup.customers || []) {
    delete c.id
    delete c.tenantId
    delete c.createdAt
    delete c.updatedAt
    await db.customer.create({ data: { ...c, tenantId: id } })
  }

  // Restore coupons
  for (const c of backup.coupons || []) {
    delete c.id
    delete c.tenantId
    delete c.createdAt
    delete c.updatedAt
    convertDates(c, ['startTime', 'endTime'])
    await db.coupon.create({ data: { ...c, tenantId: id } })
  }

  // Restore orders with items
  let ordersRestored = 0
  let itemsRestored = 0
  // Ensure at least one fallback store exists for orders without one
  let fallbackStoreId: string | null = null
  const getFallbackStore = async () => {
    if (!fallbackStoreId) {
      const s = await db.store.create({
        data: {
          tenantId: id,
          name: 'شعبه بازگردانی شده',
          distance: 0,
          minPrice: 0,
          deliveryPrice: 0,
          status: 1,
        },
      })
      fallbackStoreId = s.id
    }
    return fallbackStoreId
  }
  // If no stores were restored but orders exist, we need at least one store
  if (storeIdMap.size === 0 && (backup.orders || []).length > 0) {
    await getFallbackStore()
  }
  for (const o of backup.orders || []) {
    const items = o.items || []
    delete o.id
    delete o.tenantId
    delete o.createdAt
    delete o.updatedAt
    delete o.items
    // storeId is required — map or fallback
    if (o.storeId && storeIdMap.has(o.storeId)) {
      o.storeId = storeIdMap.get(o.storeId)
    } else {
      o.storeId = await getFallbackStore()
    }
    // tableId is optional — null is OK
    if (o.tableId) o.tableId = null
    // userId is optional
    if (o.userId) o.userId = null
    // get_time may need conversion
    if (o.get_time && typeof o.get_time === 'string') {
      o.get_time = new Date(o.get_time)
    }
    if (o.payTime && typeof o.payTime === 'string') {
      o.payTime = new Date(o.payTime)
    }

    try {
      const newOrder = await db.order.create({ data: { ...o, tenantId: id } })
      ordersRestored++

      for (const it of items) {
        delete it.id
        delete it.createdAt
        it.orderId = newOrder.id
        // productId is required — map or skip
        if (it.productId && prodIdMap.has(it.productId)) {
          it.productId = prodIdMap.get(it.productId)
        } else {
          continue // skip items without valid product
        }
        try {
          await db.orderItem.create({ data: it })
          itemsRestored++
        } catch (e) {
          // skip invalid item
        }
      }
    } catch (e) {
      // skip invalid order
    }
  }

  return NextResponse.json({
    ok: true,
    mode,
    restored: {
      stores: storeIdMap.size,
      categories: catIdMap.size,
      products: prodIdMap.size,
      orders: ordersRestored,
      orderItems: itemsRestored,
      users: (backup.users || []).length,
      customers: (backup.customers || []).length,
      coupons: (backup.coupons || []).length,
      tables: (backup.tables || []).length,
    },
  })
}
