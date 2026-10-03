import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products?tenantId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId') || ''
  const storeId = searchParams.get('storeId') || ''
  const categoryId = searchParams.get('categoryId')
  const keyword = searchParams.get('keyword') || ''

  const where: any = {}
  if (tenantId) where.tenantId = tenantId
  if (storeId) where.storeId = storeId
  if (categoryId) where.categoryId = categoryId
  if (keyword) where.name = { contains: keyword }

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ isHot: 'desc' }, { sales: 'desc' }],
  })

  const categories = await db.category.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { sort: 'asc' },
  })

  return NextResponse.json({ list: products, categories })
}

// POST — create product
export async function POST(req: NextRequest) {
  const body = await req.json()
  const product = await db.product.create({
    data: {
      tenantId: body.tenantId,
      categoryId: body.categoryId,
      storeId: body.storeId,
      name: body.name,
      description: body.description || '',
      image: body.image || '',
      price: Number(body.price),
      costPrice: Number(body.costPrice || 0),
      stock: Number(body.stock || 999),
      unit: body.unit || '份',
      isHot: body.isHot ? 1 : 0,
      isNew: body.isNew ? 1 : 0,
      isBest: body.isBest ? 1 : 0,
      isBenefit: body.isBenefit ? 1 : 0,
      status: 1,
      giveIntegral: Math.floor(Number(body.price) / 1000),
    },
  })
  return NextResponse.json(product)
}

// PATCH — update product
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const updated = await db.product.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.costPrice !== undefined && { costPrice: Number(data.costPrice) }),
      ...(data.stock !== undefined && { stock: Number(data.stock) }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.isHot !== undefined && { isHot: data.isHot ? 1 : 0 }),
      ...(data.isNew !== undefined && { isNew: data.isNew ? 1 : 0 }),
      ...(data.isBest !== undefined && { isBest: data.isBest ? 1 : 0 }),
      ...(data.isBenefit !== undefined && { isBenefit: data.isBenefit ? 1 : 0 }),
      ...(data.status !== undefined && { status: data.status ? 1 : 0 }),
      ...(data.unit && { unit: data.unit }),
      ...(data.description !== undefined && { description: data.description }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  await db.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
