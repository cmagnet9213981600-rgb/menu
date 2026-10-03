import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/tenants/[id]/seed — populate demo data for a new tenant
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const tenantName = body.name || 'کافه جدید'

  const tenant = await db.tenant.findUnique({ where: { id } })
  if (!tenant) return NextResponse.json({ error: 'tenant not found' }, { status: 404 })

  // Create default store
  const store = await db.store.create({
    data: {
      tenantId: id,
      name: `${tenantName} - شعبه اصلی`,
      phone: '',
      address: '',
      startTime: '09:00',
      endTime: '23:00',
      distance: 5,
      minPrice: 50000,
      deliveryPrice: 25000,
      notice: 'به کافه ما خوش آمدید!',
      status: 1,
    },
  })

  // Default admin user
  await db.user.create({
    data: {
      tenantId: id,
      username: 'admin',
      password: '123456',
      nickname: 'مدیر',
      role: 'admin',
      status: 1,
      avatar: 'https://i.pravatar.cc/150?u=new',
    },
  })

  // Default categories
  const cats = ['قهوه گرم', 'نوشیدنی سرد', 'کیک و دسر']
  const catIds: string[] = []
  for (const name of cats) {
    const c = await db.category.create({ data: { tenantId: id, name, sort: catIds.length } })
    catIds.push(c.id)
  }

  // Default products
  const defaultProducts = [
    { name: 'اسپرسو', price: 45000, cost: 12000, cat: 0, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', isHot: 1 },
    { name: 'کاپوچینو', price: 65000, cost: 18000, cat: 0, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', isHot: 1, isBest: 1 },
    { name: 'لاته', price: 70000, cost: 20000, cat: 0, image: 'https://images.unsplash.com/photo-1561882468-9110e03e4f4b?w=400' },
    { name: 'آیس لاته', price: 75000, cost: 22000, cat: 1, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400', isNew: 1 },
    { name: 'آیس آمریکانو', price: 55000, cost: 15000, cat: 1, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe9d82a5?w=400' },
    { name: 'چیزکیک', price: 95000, cost: 35000, cat: 2, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', isHot: 1, isBenefit: 1 },
    { name: 'تیرامیسو', price: 110000, cost: 40000, cat: 2, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', isBest: 1 },
  ]

  for (const p of defaultProducts) {
    await db.product.create({
      data: {
        tenantId: id,
        categoryId: catIds[p.cat],
        storeId: store.id,
        name: p.name,
        image: p.image,
        price: p.price,
        costPrice: p.cost,
        stock: 999,
        sales: 0,
        ficti: 0,
        isHot: p.isHot || 0,
        isBest: p.isBest || 0,
        isNew: p.isNew || 0,
        isBenefit: p.isBenefit || 0,
        unit: 'پرس',
        status: 1,
        giveIntegral: Math.floor(p.price / 1000),
      },
    })
  }

  // Default tables
  for (let i = 1; i <= 6; i++) {
    await db.restaurantTable.create({
      data: {
        tenantId: id,
        storeId: store.id,
        name: `میز ${i}`,
        seats: i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2,
        status: 0,
      },
    })
  }

  return NextResponse.json({
    ok: true,
    created: {
      store: 1,
      user: 1,
      categories: cats.length,
      products: defaultProducts.length,
      tables: 6,
    },
  })
}
