import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/dashboard?tenantId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId') || ''
  const storeId = searchParams.get('storeId') || ''
  const range = Number(searchParams.get('range') || 30)

  const where: any = {}
  if (tenantId) where.tenantId = tenantId
  if (storeId) where.storeId = storeId

  const allOrders = await db.order.findMany({ where })
  const totalRevenue = allOrders.filter(o => o.paid).reduce((s, o) => s + o.payPrice, 0)
  const totalOrders = allOrders.length
  const completedOrders = allOrders.filter(o => o.status === 3).length
  const pendingOrders = allOrders.filter(o => o.status === 1 || o.status === 2).length
  const cancelledOrders = allOrders.filter(o => o.status === 4).length

  const orderTypeStats = {
    dinein: allOrders.filter(o => o.orderType === 'dinein').length,
    takeout: allOrders.filter(o => o.orderType === 'takeout').length,
    pickup: allOrders.filter(o => o.orderType === 'pickup').length,
  }

  const days: { date: string; revenue: number; orders: number }[] = []
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const dayOrders = allOrders.filter(o => o.createdAt >= d && o.createdAt < next && o.paid)
    days.push({
      date: d.toISOString().slice(5, 10),
      revenue: dayOrders.reduce((s, o) => s + o.payPrice, 0),
      orders: dayOrders.length,
    })
  }

  const items = await db.orderItem.findMany({
    where: { order: where },
  })
  const productMap = new Map<string, { name: string; image?: string | null; qty: number; revenue: number }>()
  for (const it of items) {
    const key = it.productId
    if (!productMap.has(key)) productMap.set(key, { name: it.productName, image: it.productImage, qty: 0, revenue: 0 })
    const p = productMap.get(key)!
    p.qty += it.quantity
    p.revenue += it.subtotal
  }
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 8)

  const payTypeMap: Record<string, number> = {}
  for (const o of allOrders) {
    if (!o.paid || !o.payType) continue
    payTypeMap[o.payType] = (payTypeMap[o.payType] || 0) + o.payPrice
  }

  const storesCount = await db.store.count({ where: tenantId ? { tenantId } : {} })
  const productsCount = await db.product.count({ where: tenantId ? { tenantId } : {} })
  const customersCount = await db.customer.count({ where: tenantId ? { tenantId } : {} })
  const tablesCount = await db.restaurantTable.count({ where: tenantId ? { tenantId } : {} })

  return NextResponse.json({
    summary: {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      storesCount,
      productsCount,
      customersCount,
      tablesCount,
    },
    daily: days,
    orderTypeStats,
    topProducts,
    payTypeMap,
  })
}
