import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenantId') || ''

  const where: any = {}
  if (tenantId) where.tenantId = tenantId

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ list: users })
}
