import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId') || ''
  const storeId = searchParams.get('storeId') || ''

  const where: any = {}
  if (tenantId) where.tenantId = tenantId
  if (storeId) where.storeId = storeId

  const tables = await db.restaurantTable.findMany({
    where,
    include: { store: true },
    orderBy: [{ storeId: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json({ list: tables })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const table = await db.restaurantTable.create({
    data: {
      tenantId: body.tenantId,
      storeId: body.storeId,
      name: body.name,
      seats: Number(body.seats || 4),
      status: 0,
    },
  })
  return NextResponse.json(table)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const updated = await db.restaurantTable.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.seats !== undefined && { seats: Number(data.seats) }),
      ...(data.status !== undefined && { status: Number(data.status) }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  await db.restaurantTable.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
