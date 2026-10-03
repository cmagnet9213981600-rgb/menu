import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/orders?tenantId=xxx&storeId=xxx&status=xxx&page=1&pageSize=20
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId') || ''
  const storeId = searchParams.get('storeId') || ''
  const status = searchParams.get('status')
  const orderType = searchParams.get('orderType')
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 20)

  const where: any = {}
  if (tenantId) where.tenantId = tenantId
  if (storeId) where.storeId = storeId
  if (status && status !== 'all') where.status = Number(status)
  if (orderType && orderType !== 'all') where.orderType = orderType

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        store: true,
        items: true,
        table: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ])

  return NextResponse.json({ list: orders, total, page, pageSize })
}

// PATCH /api/orders — update status
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status } = body
  const updated = await db.order.update({
    where: { id },
    data: { status: Number(status), updatedAt: new Date() },
  })
  return NextResponse.json(updated)
}
