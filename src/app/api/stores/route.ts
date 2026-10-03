import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/stores?tenantId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId') || ''

  const where: any = {}
  if (tenantId) where.tenantId = tenantId

  const stores = await db.store.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ list: stores })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const store = await db.store.create({
    data: {
      tenantId: body.tenantId,
      name: body.name,
      phone: body.phone || '',
      address: body.address || '',
      startTime: body.startTime || '09:00',
      endTime: body.endTime || '23:00',
      distance: Number(body.distance || 5),
      minPrice: Number(body.minPrice || 0),
      deliveryPrice: Number(body.deliveryPrice || 0),
      notice: body.notice || '',
      status: 1,
    },
  })
  return NextResponse.json(store)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const updated = await db.store.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.distance !== undefined && { distance: Number(data.distance) }),
      ...(data.minPrice !== undefined && { minPrice: Number(data.minPrice) }),
      ...(data.deliveryPrice !== undefined && { deliveryPrice: Number(data.deliveryPrice) }),
      ...(data.notice !== undefined && { notice: data.notice }),
      ...(data.status !== undefined && { status: data.status ? 1 : 0 }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  await db.store.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
