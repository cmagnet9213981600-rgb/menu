import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/tenants — list all tenants with stats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') || ''
  const status = searchParams.get('status') // 'all' | 'active' | 'inactive'
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortDir = searchParams.get('sortDir') || 'desc'

  const where: Prisma.TenantWhereInput = {}
  if (keyword.trim()) {
    const k = keyword.trim()
    where.OR = [
      { name: { contains: k } },
      { contactName: { contains: k } },
      { contactMobile: { contains: k } },
      { domain: { contains: k } },
    ]
  }
  if (status === 'active') where.status = 1
  if (status === 'inactive') where.status = 0

  const orderBy: Prisma.TenantOrderByWithRelationInput = (() => {
    const dir = sortDir === 'asc' ? 'asc' : 'desc'
    if (sortBy === 'name') return { name: dir }
    if (sortBy === 'expireTime') return { expireTime: dir }
    return { createdAt: dir }
  })()

  const tenants = await db.tenant.findMany({ where, orderBy })

  const enriched = await Promise.all(tenants.map(async (t) => {
    const stores = await db.store.count({ where: { tenantId: t.id } })
    const users = await db.user.count({ where: { tenantId: t.id } })
    const orders = await db.order.count({ where: { tenantId: t.id } })
    const products = await db.product.count({ where: { tenantId: t.id } })
    const customers = await db.customer.count({ where: { tenantId: t.id } })
    const revenue = await db.order.aggregate({
      where: { tenantId: t.id, paid: 1 },
      _sum: { payPrice: true },
    })
    return {
      ...t,
      storesCount: stores,
      usersCount: users,
      ordersCount: orders,
      productsCount: products,
      customersCount: customers,
      revenue: revenue._sum.payPrice || 0,
    }
  }))

  // Sort by computed fields (revenue, orders, stores)
  if (sortBy === 'revenue' || sortBy === 'orders' || sortBy === 'stores') {
    enriched.sort((a, b) => {
      const av = sortBy === 'revenue' ? a.revenue : sortBy === 'orders' ? a.ordersCount : a.storesCount
      const bv = sortBy === 'revenue' ? b.revenue : sortBy === 'orders' ? b.ordersCount : b.storesCount
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }

  return NextResponse.json({ list: enriched })
}

// POST — create new tenant
export async function POST(req: NextRequest) {
  const body = await req.json()
  const tenant = await db.tenant.create({
    data: {
      name: body.name,
      contactName: body.contactName || null,
      contactMobile: body.contactMobile || null,
      domain: body.domain || null,
      accountCount: Number(body.accountCount || 10),
      status: body.status !== undefined ? Number(body.status) : 1,
      expireTime: body.expireTime ? new Date(body.expireTime) : null,
    },
  })
  return NextResponse.json(tenant)
}

// PATCH — update tenant (also used for extend)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updateData: Prisma.TenantUpdateInput = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.contactName !== undefined) updateData.contactName = data.contactName || null
  if (data.contactMobile !== undefined) updateData.contactMobile = data.contactMobile || null
  if (data.domain !== undefined) updateData.domain = data.domain || null
  if (data.accountCount !== undefined) updateData.accountCount = Number(data.accountCount)
  if (data.status !== undefined) updateData.status = Number(data.status)
  if (data.expireTime !== undefined) updateData.expireTime = data.expireTime ? new Date(data.expireTime) : null
  if (data.packageId !== undefined) updateData.packageId = data.packageId || null

  const updated = await db.tenant.update({ where: { id }, data: updateData })
  return NextResponse.json(updated)
}

// DELETE — delete tenant with all related data (cascade)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Delete all related data in proper order to avoid FK violations
  // 1. OrderItems (via orders)
  const orders = await db.order.findMany({ where: { tenantId: id }, select: { id: true } })
  if (orders.length > 0) {
    await db.orderItem.deleteMany({ where: { orderId: { in: orders.map(o => o.id) } } })
  }
  // 2. Orders
  await db.order.deleteMany({ where: { tenantId: id } })
  // 3. Tables
  await db.restaurantTable.deleteMany({ where: { tenantId: id } })
  // 4. Products
  await db.product.deleteMany({ where: { tenantId: id } })
  // 5. Categories
  await db.category.deleteMany({ where: { tenantId: id } })
  // 6. Stores
  await db.store.deleteMany({ where: { tenantId: id } })
  // 7. Users
  await db.user.deleteMany({ where: { tenantId: id } })
  // 8. Customers
  await db.customer.deleteMany({ where: { tenantId: id } })
  // 9. Coupons
  await db.coupon.deleteMany({ where: { tenantId: id } })
  // 10. Finally the tenant
  await db.tenant.delete({ where: { id } })

  return NextResponse.json({ ok: true, deleted: true })
}
