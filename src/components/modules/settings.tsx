'use client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/lib/store'
import { Package, Building2, User, Lock, Bell, Globe, Database, Shield, Server, Code } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsModule() {
  const { currentTenant, setTenant } = useAppStore()

  const packages = [
    { name: 'پایه', price: '۲۹۹٬۰۰۰', features: ['تا ۲ شعبه', 'تا ۱۰ کاربر', 'داشبورد و سفارشات', 'پشتیبانی ایمیلی'] },
    { name: 'حرفه‌ای', price: '۸۹۹٬۰۰۰', features: ['تا ۱۰ شعبه', 'تا ۱۰۰ کاربر', 'گزارش‌های پیشرفته', 'کوپن و بازاریابی', 'پشتیبانی تلفنی'] },
    { name: 'سازمانی', price: 'تماسی', features: ['شعبه نامحدود', 'کاربر نامحدود', 'تمام ماژول‌ها', 'API دسترسی', 'پشتیبانی اختصاصی'] },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-bold">تنظیمات سیستم</h2>
        <p className="text-sm text-muted-foreground">پیکربندی tenant، پلن و سیستم</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current tenant info */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold">اطلاعات Tenant فعلی</h3>
          </div>
          {currentTenant ? (
            <div className="space-y-3">
              <div>
                <Label>نام tenant</Label>
                <Input value={currentTenant.name} readOnly />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>مخاطب</Label>
                  <Input value={currentTenant.contactName || ''} readOnly />
                </div>
                <div>
                  <Label>موبایل</Label>
                  <Input value={currentTenant.contactMobile || ''} readOnly />
                </div>
              </div>
              <div>
                <Label>دامنه</Label>
                <Input value={currentTenant.domain || ''} readOnly />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm">وضعیت:</span>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">فعال</Badge>
              </div>
              <Button variant="outline" className="w-full" onClick={() => toast.info('در نسخه دمو قابل ویرایش نیست')}>
                ویرایش اطلاعات tenant
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">tenant انتخاب نشده</p>
          )}
        </Card>

        {/* Plan packages */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold">پلن SaaS</h3>
          </div>
          <div className="space-y-3">
            {packages.map((p, i) => (
              <div key={i} className={`p-4 rounded-lg border-2 ${i === 1 ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm">
                    <span className="font-bold text-amber-600">{p.price}</span>
                    {p.price !== 'تماسی' && <span className="text-xs text-muted-foreground"> / ماهانه</span>}
                  </div>
                </div>
                <ul className="space-y-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-500" /> {f}
                    </li>
                  ))}
                </ul>
                {i === 1 && <Badge className="mt-2 bg-amber-500 hover:bg-amber-500">پیشنهاد ویژه</Badge>}
              </div>
            ))}
          </div>
        </Card>

        {/* System settings */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold">تنظیمات سیستم</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'اعلان سفارش جدید', desc: 'نمایش اعلان هنگام دریافت سفارش', enabled: true },
              { label: 'صدای اعلان', desc: 'پخش صدا هنگام دریافت سفارش', enabled: true },
              { label: 'چاپ خودکار فاکتور', desc: 'چاپ خودکار پس از تکمیل سفارش', enabled: false },
              { label: 'تأیید خودکار سفارش', desc: 'تأیید خودکار سفارش‌های پرداخت شده', enabled: false },
              { label: 'حالت تاریک', desc: 'تم تاریک برای پنل', enabled: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30">
                <div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <Switch defaultChecked={s.enabled} onCheckedChange={() => toast.info('تنظیمات در دمو ذخیره نمی‌شود')} />
              </div>
            ))}
          </div>
        </Card>

        {/* Tech stack */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold">اطلاعات فنی</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">فریم‌ورک</span>
              <span className="font-mono">Next.js 16 + TypeScript</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">پایگاه داده</span>
              <span className="font-mono">Prisma + SQLite</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">UI Library</span>
              <span className="font-mono">shadcn/ui + Tailwind 4</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">نمودار</span>
              <span className="font-mono">Recharts</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-muted-foreground">معماری اصلی</span>
              <span className="font-mono">بر اساس yshop-drink</span>
            </div>
            <div className="text-xs text-muted-foreground mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              این دمو بر اساس پروژه متن‌باز yshop-drink (مجوز MIT) طراحی شده و معماری multi-tenant و ماژول‌های اصلی آن را پیاده‌سازی می‌کند. نسخه اصلی از Spring Boot + Vue 3 + UniApp استفاده می‌کند، در حالی که این دمو با Next.js پیاده‌سازی شده برای ارزیابی سریع.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
