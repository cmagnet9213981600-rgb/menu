import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tenants/[id]/backup — export complete tenant data as JSON
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const tenant = await db.tenant.findUnique({ where: { id } })
  if (!tenant) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const [stores, users, categories, products, orders, tables, customers, coupons] = await Promise.all([
    db.store.findMany({ where: { tenantId: id } }),
    db.user.findMany({ where: { tenantId: id } }),
    db.category.findMany({ where: { tenantId: id } }),
    db.product.findMany({ where: { tenantId: id } }),
    db.order.findMany({ where: { tenantId: id }, include: { items: true } }),
    db.restaurantTable.findMany({ where: { tenantId: id } }),
    db.customer.findMany({ where: { tenantId: id } }),
    db.coupon.findMany({ where: { tenantId: id } }),
  ])

  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tenant,
    stores,
    users,
    categories,
    products,
    orders: orders.map(o => ({ ...o, items: o.items })),
    tables,
    customers,
    coupons,
    stats: {
      stores: stores.length,
      users: users.length,
      categories: categories.length,
      products: products.length,
      orders: orders.length,
      tables: tables.length,
      customers: customers.length,
      coupons: coupons.length,
    },
  }

  return NextResponse.json(backup)
}
