// Seed script — populate demo data for yshop-drink inspired cafe/restaurant SaaS
import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // -------- Tenant 1: Coffee Chain --------
  const tenant1 = await db.tenant.create({
    data: {
      name: 'گروه کافه‌های تهران',
      contactName: 'علی رضایی',
      contactMobile: '09120000001',
      domain: 'tehrancoffee.ir',
      accountCount: 50,
      status: 1,
      expireTime: new Date('2027-12-31'),
    },
  })

  // Tenant 2: Restaurant chain
  const tenant2 = await db.tenant.create({
    data: {
      name: 'رستوران‌های زنجیره‌ای شیلا',
      contactName: 'مریم احمدی',
      contactMobile: '09120000002',
      domain: 'shilarest.ir',
      accountCount: 100,
      status: 1,
      expireTime: new Date('2027-06-30'),
    },
  })

  // Tenant 3: small cafe
  const tenant3 = await db.tenant.create({
    data: {
      name: 'کافه آرت‌هاوس',
      contactName: 'سعید کریمی',
      contactMobile: '09120000003',
      accountCount: 5,
      status: 1,
    },
  })

  // -------- Tenant Packages --------
  await db.tenantPackage.create({
    data: { name: 'پایه', remark: 'تا ۲ شعبه، تا ۱۰ کاربر', menuIds: '["dashboard","orders","menu","tables"]', status: 1 },
  })
  await db.tenantPackage.create({
    data: { name: 'حرفه‌ای', remark: 'تا ۱۰ شعبه، تا ۱۰۰ کاربر', menuIds: '["dashboard","orders","menu","tables","customers","coupons","reports"]', status: 1 },
  })
  await db.tenantPackage.create({
    data: { name: 'سازمانی', remark: 'نامحدود', menuIds: '["dashboard","orders","menu","tables","customers","coupons","reports","settings","tenants"]', status: 1 },
  })

  // -------- Users --------
  await db.user.create({
    data: { tenantId: tenant1.id, username: 'admin', password: '123456', nickname: 'مدیر گروه', role: 'admin', status: 1, avatar: 'https://i.pravatar.cc/150?img=1' },
  })
  await db.user.create({
    data: { tenantId: tenant1.id, username: 'manager1', password: '123456', nickname: 'مدیر شعبه ۱', role: 'manager', status: 1, avatar: 'https://i.pravatar.cc/150?img=2' },
  })
  await db.user.create({
    data: { tenantId: tenant1.id, username: 'cashier1', password: '123456', nickname: 'صندوق‌دار', role: 'cashier', status: 1, avatar: 'https://i.pravatar.cc/150?img=3' },
  })
  await db.user.create({
    data: { tenantId: tenant2.id, username: 'shila_admin', password: '123456', nickname: 'مدیر شیلا', role: 'admin', status: 1, avatar: 'https://i.pravatar.cc/150?img=4' },
  })
  await db.user.create({
    data: { tenantId: tenant3.id, username: 'arthouse', password: '123456', nickname: 'مدیر آرت‌هاوس', role: 'admin', status: 1, avatar: 'https://i.pravatar.cc/150?img=5' },
  })

  // -------- Stores --------
  const store1 = await db.store.create({
    data: {
      tenantId: tenant1.id, name: 'کافه تهران - شعبه ونک', phone: '02188880001',
      address: 'تهران، ونک، خیابان ملاصدرا', latitude: 35.7575, longitude: 51.4100,
      startTime: '08:00', endTime: '24:00', distance: 5, minPrice: 100000, deliveryPrice: 30000,
      notice: 'همیشه قهوه تازه!', status: 1,
    },
  })
  const store2 = await db.store.create({
    data: {
      tenantId: tenant1.id, name: 'کافه تهران - شعبه سعادت‌آباد', phone: '02188880002',
      address: 'تهران، سعادت‌آباد', startTime: '09:00', endTime: '23:00',
      distance: 4, minPrice: 80000, deliveryPrice: 25000, status: 1,
    },
  })
  const store3 = await db.store.create({
    data: {
      tenantId: tenant1.id, name: 'کافه تهران - شعبه میرداماد', phone: '02188880003',
      address: 'تهران، میرداماد', startTime: '08:30', endTime: '24:00',
      distance: 6, minPrice: 100000, deliveryPrice: 35000, status: 1,
    },
  })

  const store4 = await db.store.create({
    data: {
      tenantId: tenant2.id, name: 'رستوران شیلا - شعبه فرشته', phone: '02188880004',
      address: 'تهران، فرشته', startTime: '12:00', endTime: '02:00',
      distance: 8, minPrice: 250000, deliveryPrice: 40000, status: 1,
    },
  })
  const store5 = await db.store.create({
    data: {
      tenantId: tenant2.id, name: 'رستوران شیلا - شعبه آفریقا', phone: '02188880005',
      address: 'تهران، آفریقا', startTime: '12:00', endTime: '02:00',
      distance: 8, minPrice: 250000, deliveryPrice: 40000, status: 1,
    },
  })

  const store6 = await db.store.create({
    data: {
      tenantId: tenant3.id, name: 'کافه آرت‌هاوس - شعبه اصلی', phone: '02188880006',
      address: 'تهران، الهیه', startTime: '10:00', endTime: '24:00',
      distance: 3, minPrice: 120000, deliveryPrice: 30000, status: 1,
    },
  })

  // -------- Tables --------
  for (const store of [store1, store2, store3, store4, store5, store6]) {
    for (let i = 1; i <= 8; i++) {
      const seats = i % 3 === 0 ? 6 : i % 2 === 0 ? 4 : 2
      const status = i <= 3 ? 1 : i === 4 ? 2 : 0
      await db.restaurantTable.create({
        data: {
          tenantId: store.tenantId,
          storeId: store.id,
          name: `میز ${i}`,
          seats,
          status,
        },
      })
    }
  }

  // -------- Categories --------
  const categories1: any[] = []
  const catNames1 = ['قهوه', 'چای', 'دسر', 'کیک', 'نوشیدنی سرد', 'صبحانه']
  for (const name of catNames1) {
    categories1.push(await db.category.create({ data: { tenantId: tenant1.id, name, sort: categories1.length } }))
  }
  const categories2: any[] = []
  const catNames2 = ['پیتزا', 'پاستا', 'سالاد', 'سوپ', 'خوراک ایرانی', 'دسر', 'نوشیدنی']
  for (const name of catNames2) {
    categories2.push(await db.category.create({ data: { tenantId: tenant2.id, name, sort: categories2.length } }))
  }
  const categories3: any[] = []
  const catNames3 = ['قهوه تخصصی', 'نوشیدنی', 'کیک و شیرینی']
  for (const name of catNames3) {
    categories3.push(await db.category.create({ data: { tenantId: tenant3.id, name, sort: categories3.length } }))
  }

  // -------- Products --------
  const cafeProducts = [
    { name: 'اسپرسو', price: 45000, cost: 12000, cat: 'قهوه', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', isHot: 1, sales: 320 },
    { name: 'کاپوچینو', price: 65000, cost: 18000, cat: 'قهوه', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', isHot: 1, sales: 510, isBest: 1 },
    { name: 'لاته', price: 70000, cost: 20000, cat: 'قهوه', image: 'https://images.unsplash.com/photo-1561882468-9110e03e4f4b?w=400', sales: 480, isNew: 1 },
    { name: 'موکا', price: 75000, cost: 22000, cat: 'قهوه', image: 'https://images.unsplash.com/photo-1572490122747-3968b75ccbe9?w=400', sales: 220 },
    { name: 'آمریکانو', price: 50000, cost: 13000, cat: 'قهوه', image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=400', sales: 280 },
    { name: 'فلچ وایت', price: 68000, cost: 19000, cat: 'قهوه', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe9d82a5?w=400', sales: 190, isNew: 1 },
    { name: 'چای سیاه', price: 30000, cost: 5000, cat: 'چای', image: 'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=400', sales: 150 },
    { name: 'چای ماسالا', price: 45000, cost: 8000, cat: 'چای', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400', sales: 95 },
    { name: 'چای سبز', price: 35000, cost: 6000, cat: 'چای', image: 'https://images.unsplash.com/photo-1627435601181-285828836e19?w=400', sales: 120 },
    { name: 'چیزکیک', price: 95000, cost: 35000, cat: 'دسر', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400', isHot: 1, sales: 210, isBenefit: 1 },
    { name: 'تریفل', price: 110000, cost: 40000, cat: 'دسر', image: 'https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=400', sales: 130 },
    { name: 'تیرامیسو', price: 120000, cost: 45000, cat: 'دسر', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', sales: 175, isBest: 1 },
    { name: 'کیک شکلاتی', price: 85000, cost: 30000, cat: 'کیک', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', sales: 240 },
    { name: 'کیک هویج', price: 80000, cost: 28000, cat: 'کیک', image: 'https://images.unsplash.com/photo-1598703434838-39f4cb1e1f3d?w=400', sales: 140 },
    { name: 'آیس لاته', price: 75000, cost: 22000, cat: 'نوشیدنی سرد', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400', sales: 290, isHot: 1, isNew: 1 },
    { name: 'آیس آمریکانو', price: 55000, cost: 15000, cat: 'نوشیدنی سرد', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe9d82a5?w=400', sales: 220 },
    { name: 'اسموتی توت‌فرنگی', price: 95000, cost: 30000, cat: 'نوشیدنی سرد', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400', sales: 180, isBenefit: 1 },
    { name: 'املت', price: 70000, cost: 25000, cat: 'صبحانه', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', sales: 130 },
    { name: 'املت قارچ', price: 85000, cost: 32000, cat: 'صبحانه', image: 'https://images.unsplash.com/photo-1590650046871-92c887180603?w=400', sales: 110 },
    { name: 'نان و پنیر و سبزی', price: 65000, cost: 20000, cat: 'صبحانه', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a886de?w=400', sales: 165 },
  ]

  for (const p of cafeProducts) {
    const cat = categories1.find(c => c.name === p.cat)
    if (!cat) continue
    await db.product.create({
      data: {
        tenantId: tenant1.id, categoryId: cat.id, storeId: store1.id,
        name: p.name, image: p.image, price: p.price, costPrice: p.cost,
        stock: 999, sales: p.sales, ficti: Math.floor(p.sales / 3),
        isHot: p.isHot || 0, isBest: p.isBest || 0, isNew: p.isNew || 0, isBenefit: p.isBenefit || 0,
        unit: 'لیوان', status: 1,
        giveIntegral: Math.floor(p.price / 1000),
      },
    })
  }

  const restProducts = [
    { name: 'پیتزا مارگاریتا', price: 180000, cost: 70000, cat: 'پیتزا', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', isHot: 1, sales: 320, isBest: 1 },
    { name: 'پیتزا پپرونی', price: 220000, cost: 85000, cat: 'پیتزا', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', isHot: 1, sales: 410 },
    { name: 'پیتزا چهار پنیر', price: 240000, cost: 95000, cat: 'پیتزا', image: 'https://images.unsplash.com/photo-1513104890138-7c749659e59d?w=400', sales: 280 },
    { name: 'پاستا آلفردو', price: 195000, cost: 75000, cat: 'پاستا', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', sales: 240, isNew: 1 },
    { name: 'پاستا بولونز', price: 210000, cost: 80000, cat: 'پاستا', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400', sales: 290 },
    { name: 'سالاد سزار', price: 145000, cost: 50000, cat: 'سالاد', image: 'https://images.unsplash.com/photo-1551243079-cb9d8f3b1f0a?w=400', sales: 180, isBenefit: 1 },
    { name: 'سالاد یونانی', price: 135000, cost: 45000, cat: 'سالاد', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', sales: 145 },
    { name: 'سوپ قارچ', price: 95000, cost: 30000, cat: 'سوپ', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', sales: 120 },
    { name: 'سوپ مرغ', price: 105000, cost: 35000, cat: 'سوپ', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', sales: 110 },
    { name: 'چلوکباب کوبیده', price: 285000, cost: 110000, cat: 'خوراک ایرانی', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', isHot: 1, sales: 520, isBest: 1 },
    { name: 'چلوکباب برگ', price: 365000, cost: 150000, cat: 'خوراک ایرانی', image: 'https://images.unsplash.com/photo-1567297021264-82a26afe6c2a?w=400', isHot: 1, sales: 380 },
    { name: 'زیرشک با مرغ', price: 295000, cost: 120000, cat: 'خوراک ایرانی', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', sales: 260 },
    { name: 'پاناکوتا', price: 125000, cost: 40000, cat: 'دسر', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', sales: 165 },
    { name: 'بستنی وانیلی', price: 75000, cost: 25000, cat: 'دسر', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', sales: 200 },
    { name: 'نوشابه', price: 35000, cost: 15000, cat: 'نوشیدنی', image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400', sales: 680 },
    { name: 'دوغ', price: 40000, cost: 12000, cat: 'نوشیدنی', image: 'https://images.unsplash.com/photo-1626078436890-9af5ae9e3a36?w=400', sales: 540 },
  ]

  for (const p of restProducts) {
    const cat = categories2.find(c => c.name === p.cat)
    if (!cat) continue
    await db.product.create({
      data: {
        tenantId: tenant2.id, categoryId: cat.id, storeId: store4.id,
        name: p.name, image: p.image, price: p.price, costPrice: p.cost,
        stock: 999, sales: p.sales, ficti: Math.floor(p.sales / 3),
        isHot: p.isHot || 0, isBest: p.isBest || 0, isNew: p.isNew || 0, isBenefit: p.isBenefit || 0,
        unit: 'پرس', status: 1,
        giveIntegral: Math.floor(p.price / 1000),
      },
    })
  }

  const arthouseProducts = [
    { name: 'V60 pour-over', price: 95000, cost: 25000, cat: 'قهوه تخصصی', image: 'https://images.unsplash.com/photo-1495475281980-08f8e0a32ce5?w=400', isHot: 1, sales: 180, isBest: 1 },
    { name: 'Aeropress', price: 95000, cost: 25000, cat: 'قهوه تخصصی', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', sales: 130, isNew: 1 },
    { name: 'کولد برو', price: 110000, cost: 30000, cat: 'قهوه تخصصی', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400', isHot: 1, sales: 220 },
    { name: 'چای ترش', price: 65000, cost: 18000, cat: 'نوشیدنی', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400', sales: 145 },
    { name: 'لیموناد', price: 75000, cost: 22000, cat: 'نوشیدنی', image: 'https://images.unsplash.com/photo-1523677011781-c7bbdbf9e936?w=400', sales: 110 },
    { name: 'کراسان', price: 65000, cost: 22000, cat: 'کیک و شیرینی', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', sales: 250, isBenefit: 1 },
    { name: 'کوکی شکلاتی', price: 55000, cost: 18000, cat: 'کیک و شیرینی', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', sales: 190 },
    { name: 'براونی', price: 85000, cost: 28000, cat: 'کیک و شیرینی', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400', sales: 165, isBest: 1 },
  ]

  for (const p of arthouseProducts) {
    const cat = categories3.find(c => c.name === p.cat)
    if (!cat) continue
    await db.product.create({
      data: {
        tenantId: tenant3.id, categoryId: cat.id, storeId: store6.id,
        name: p.name, image: p.image, price: p.price, costPrice: p.cost,
        stock: 999, sales: p.sales, ficti: Math.floor(p.sales / 3),
        isHot: p.isHot || 0, isBest: p.isBest || 0, isNew: p.isNew || 0, isBenefit: p.isBenefit || 0,
        unit: 'عدد', status: 1,
        giveIntegral: Math.floor(p.price / 1000),
      },
    })
  }

  // -------- Customers --------
  const customerNames = ['رضا کاظمی', 'فاطمه نوری', 'محمد تهرانی', 'زهرا یوسفی', 'حسین مرادی', 'مریم رحیمی', 'علی موسوی', 'سارا حسینی', 'امیر عباسی', 'نگار کریمی', 'بهنام رستمی', 'الهام شریفی']
  for (let i = 0; i < customerNames.length; i++) {
    const tenant = i < 5 ? tenant1 : i < 9 ? tenant2 : tenant3
    await db.customer.create({
      data: {
        tenantId: tenant.id,
        nickname: customerNames[i],
        phone: `0912${1000000 + i}`,
        balance: Math.floor(Math.random() * 500000),
        integral: Math.floor(Math.random() * 5000),
        level: Math.floor(Math.random() * 3) + 1,
        status: 1,
      },
    })
  }

  // -------- Coupons --------
  await db.coupon.create({
    data: { tenantId: tenant1.id, name: 'تخفیف ۲۰٪ کافه', type: 0, least: 100000, value: 20000, receive: 145, distribute: 1000, limit: 1, status: 1, endTime: new Date('2026-12-31') },
  })
  await db.coupon.create({
    data: { tenantId: tenant1.id, name: 'ارسال رایگان', type: 2, least: 150000, value: 30000, receive: 88, distribute: 500, limit: 1, status: 1, endTime: new Date('2026-12-31') },
  })
  await db.coupon.create({
    data: { tenantId: tenant2.id, name: 'تخفیف پیتزا', type: 0, least: 200000, value: 50000, receive: 220, distribute: 1000, limit: 1, status: 1, endTime: new Date('2026-12-31') },
  })
  await db.coupon.create({
    data: { tenantId: tenant2.id, name: 'تخفیف تحویل حضوری', type: 1, least: 250000, value: 30000, receive: 75, distribute: 500, limit: 1, status: 1, endTime: new Date('2026-12-31') },
  })
  await db.coupon.create({
    data: { tenantId: tenant3.id, name: 'تخفیف ۱۰٪', type: 0, least: 80000, value: 10000, receive: 50, distribute: 300, limit: 1, status: 1, endTime: new Date('2026-12-31') },
  })

  // -------- Orders (recent 30 days) --------
  const allProducts = await db.product.findMany()
  const orderTypes = ['dinein', 'takeout', 'pickup']
  const payTypes = ['cash', 'card', 'wechat', 'alipay']

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date()
    date.setDate(date.getDate() - dayOffset)
    const ordersPerDay = 5 + Math.floor(Math.random() * 12)

    for (let i = 0; i < ordersPerDay; i++) {
      const rnd = Math.random()
      const tenant = rnd < 0.5 ? tenant1 : rnd < 0.85 ? tenant2 : tenant3
      const stores = tenant.id === tenant1.id ? [store1, store2, store3] : tenant.id === tenant2.id ? [store4, store5] : [store6]
      const store = stores[Math.floor(Math.random() * stores.length)]
      const tenantProducts = allProducts.filter(p => p.tenantId === tenant.id)
      if (tenantProducts.length === 0) continue

      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)]
      const itemCount = 1 + Math.floor(Math.random() * 4)
      const items: any[] = []
      for (let j = 0; j < itemCount; j++) {
        const product = tenantProducts[Math.floor(Math.random() * tenantProducts.length)]
        const qty = 1 + Math.floor(Math.random() * 3)
        items.push({ product, qty, subtotal: product.price * qty })
      }
      const totalPrice = items.reduce((sum, it) => sum + it.subtotal, 0)
      const payPrice = orderType === 'takeout' ? totalPrice + store.deliveryPrice : totalPrice

      const orderDate = new Date(date)
      orderDate.setHours(10 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60))

      const status = dayOffset === 0
        ? (Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 : 3)
        : 3

      const paid = status >= 1 ? 1 : 0
      const order = await db.order.create({
        data: {
          tenantId: tenant.id,
          storeId: store.id,
          orderNo: `ORD${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          orderType,
          shippingType: orderType === 'takeout' ? 1 : 2,
          numberId: orderType === 'pickup' ? 100 + Math.floor(Math.random() * 900) : null,
          verifyCode: orderType === 'pickup' ? String(Math.floor(Math.random() * 9000) + 1000) : null,
          status,
          totalNum: items.reduce((s, it) => s + it.qty, 0),
          totalPrice,
          payPrice,
          payType: paid ? payTypes[Math.floor(Math.random() * payTypes.length)] : null,
          paid,
          payTime: paid ? orderDate : null,
          get_time: orderType === 'pickup' ? new Date(orderDate.getTime() + 30 * 60 * 1000) : null,
          remark: Math.random() < 0.3 ? 'بدون پیاز' : null,
          address: orderType === 'takeout' ? 'تهران، ' + ['ونک', 'سعادت‌آباد', 'میرداماد', 'فرشته', 'الهیه'][Math.floor(Math.random() * 5)] : null,
          customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
          customerPhone: `0912${1000000 + Math.floor(Math.random() * 12)}`,
          createdAt: orderDate,
          updatedAt: orderDate,
        },
      })

      await db.orderItem.createMany({
        data: items.map(it => ({
          orderId: order.id,
          productId: it.product.id,
          productName: it.product.name,
          productImage: it.product.image,
          price: it.product.price,
          costPrice: it.product.costPrice,
          quantity: it.qty,
          subtotal: it.subtotal,
        })),
      })
    }
  }

  console.log('✅ Seeded successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
