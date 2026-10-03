'use client'
import { Coffee, LayoutDashboard, ShoppingBag, UtensilsCrossed, Store, Grid3x3, Users, Ticket, Building2, Settings, ChartBar, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModuleKey =
  | 'dashboard' | 'orders' | 'menu' | 'stores' | 'tables'
  | 'customers' | 'coupons' | 'reports' | 'tenants' | 'settings'

interface NavItem {
  key: ModuleKey
  label: string
  icon: LucideIcon
  desc: string
}

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'داشبورد', icon: LayoutDashboard, desc: 'نمای کلی' },
  { key: 'orders', label: 'سفارشات', icon: ShoppingBag, desc: 'مدیریت سفارش‌ها' },
  { key: 'menu', label: 'منو و محصولات', icon: UtensilsCrossed, desc: 'مدیریت منو' },
  { key: 'stores', label: 'شعب', icon: Store, desc: 'مدیریت شعب' },
  { key: 'tables', label: 'میزها', icon: Grid3x3, desc: 'میزها و رزرو' },
  { key: 'customers', label: 'مشتریان', icon: Users, desc: 'مدیریت مشتری' },
  { key: 'coupons', label: 'کوپن‌ها', icon: Ticket, desc: 'بازاریابی' },
  { key: 'reports', label: 'گزارش‌ها', icon: ChartBar, desc: 'تحلیل فروش' },
  { key: 'tenants', label: 'مدیریت Tenantها', icon: Building2, desc: 'مدیریت مستاجران' },
  { key: 'settings', label: 'تنظیمات', icon: Settings, desc: 'پیکربندی' },
]

interface SidebarProps {
  active: ModuleKey
  onChange: (k: ModuleKey) => void
  collapsed: boolean
}

export function Sidebar({ active, onChange, collapsed }: SidebarProps) {
  return (
    <aside className={cn(
      'h-full bg-card border-l flex flex-col transition-all duration-300 shrink-0',
      collapsed ? 'w-[72px]' : 'w-64'
    )}>
      <div className="h-16 flex items-center gap-3 px-4 border-b">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">YShop Drink</div>
            <div className="text-[11px] text-muted-foreground truncate">سیستم مدیریت کافه</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                'hover:bg-accent',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <div className="flex-1 min-w-0 text-right">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className={cn('text-[10px] truncate', isActive ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{item.desc}</div>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t text-[10px] text-muted-foreground text-center">
        {!collapsed ? 'نسخه دمو ۱.۰ · بر اساس yshop-drink' : 'v1.0'}
      </div>
    </aside>
  )
}
