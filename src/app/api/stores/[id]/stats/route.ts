import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/stores/[id]/stats — get store-specific stats
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const store = await db.store.findUnique({ where: { id } })
  if (!store) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const orders = await db.order.findMany({ where: { storeId: id } })
  const tables = await db.restaurantTable.findMany({ where: { storeId: id } })
  const products = await db.product.findMany({ where: { storeId: id } })

  // Order type breakdown
  const orderTypeStats = {
    dinein: orders.filter(o => o.orderType === 'dinein').length,
    takeout: orders.filter(o => o.orderType === 'takeout').length,
    pickup: orders.filter(o => o.orderType === 'pickup').length,
  }

  // Status breakdown
  const statusStats = {
    pending: orders.filter(o => o.status === 0).length,
    paid: orders.filter(o => o.status === 1).length,
    preparing: orders.filter(o => o.status === 2).length,
    completed: orders.filter(o => o.status === 3).length,
    cancelled: orders.filter(o => o.status === 4).length,
  }

  // Last 14 days revenue
  const days: { date: string; revenue: number; orders: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(d.getDate() + 1)
    const dayOrders = orders.filter(o => o.createdAt >= d && o.createdAt < next && o.paid)
    days.push({
      date: d.toISOString().slice(5, 10),
      revenue: dayOrders.reduce((s, o) => s + o.payPrice, 0),
      orders: dayOrders.length,
    })
  }

  // Pay type breakdown
  const payTypeMap: Record<string, number> = {}
  for (const o of orders) {
    if (!o.paid || !o.payType) continue
    payTypeMap[o.payType] = (payTypeMap[o.payType] || 0) + o.payPrice
  }

  // Tables summary
  const tableStats = {
    total: tables.length,
    free: tables.filter(t => t.status === 0).length,
    occupied: tables.filter(t => t.status === 1).length,
    reserved: tables.filter(t => t.status === 2).length,
  }

  // Top products (by revenue)
  const items = await db.orderItem.findMany({
    where: { order: { storeId: id } },
  })
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>()
  for (const it of items) {
    if (!productMap.has(it.productId)) productMap.set(it.productId, { name: it.productName, qty: 0, revenue: 0 })
    const p = productMap.get(it.productId)!
    p.qty += it.quantity
    p.revenue += it.subtotal
  }
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return NextResponse.json({
    store,
    summary: {
      totalRevenue: orders.filter(o => o.paid).reduce((s, o) => s + o.payPrice, 0),
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? orders.filter(o => o.paid).reduce((s, o) => s + o.payPrice, 0) / Math.max(1, orders.filter(o => o.paid).length) : 0,
      productsCount: products.length,
      tablesCount: tables.length,
    },
    orderTypeStats,
    statusStats,
    tableStats,
    daily: days,
    payTypeMap,
    topProducts,
  })
}
