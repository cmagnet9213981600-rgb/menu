'use client'
import { useEffect, useState } from 'react'
import { Sidebar, type ModuleKey, navItems } from '@/components/app/sidebar'
import { TopBar } from '@/components/app/topbar'
import { TenantSelector } from '@/components/app/tenant-selector'
import { DashboardModule } from '@/components/modules/dashboard'
import { OrdersModule } from '@/components/modules/orders'
import { MenuModule } from '@/components/modules/menu'
import { StoresModule } from '@/components/modules/stores'
import { TablesModule } from '@/components/modules/tables'
import { CustomersModule } from '@/components/modules/customers'
import { CouponsModule } from '@/components/modules/coupons'
import { ReportsModule } from '@/components/modules/reports'
import { TenantsModule } from '@/components/modules/tenants'
import { SettingsModule } from '@/components/modules/settings'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { LogOut, Store as StoreIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const { currentTenant, currentStoreId, setTenant } = useAppStore()
  const [active, setActive] = useState<ModuleKey>('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])

  // Load stores for topbar selector
  useEffect(() => {
    if (!currentTenant) {
      setStores([])
      return
    }
    fetch(`/api/stores?tenantId=${currentTenant.id}`)
      .then(r => r.json())
      .then(d => setStores((d.list || []).map((s: any) => ({ id: s.id, name: s.name }))))
      .catch(() => setStores([]))
  }, [currentTenant])

  // Auto-collapse on small screens
  useEffect(() => {
    const handler = () => setCollapsed(window.innerWidth < 1024)
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!currentTenant) {
    return <TenantSelector />
  }

  const activeNav = navItems.find(n => n.key === active)
  const title = activeNav?.label || ''
  const subtitle = activeNav?.desc || ''

  const logout = () => {
    setTenant(null)
    setActive('dashboard')
    toast.info('از پنل خارج شدید')
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden" dir="rtl">
      <Sidebar active={active} onChange={setActive} collapsed={collapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setCollapsed(c => !c)}
          stores={stores}
        />

        <main className="flex-1 overflow-y-auto bg-muted/20">
          {active === 'dashboard' && <DashboardModule tenantId={currentTenant.id} storeId={currentStoreId} />}
          {active === 'orders' && <OrdersModule tenantId={currentTenant.id} storeId={currentStoreId} />}
          {active === 'menu' && <MenuModule tenantId={currentTenant.id} storeId={currentStoreId} />}
          {active === 'stores' && <StoresModule tenantId={currentTenant.id} />}
          {active === 'tables' && <TablesModule tenantId={currentTenant.id} />}
          {active === 'customers' && <CustomersModule tenantId={currentTenant.id} />}
          {active === 'coupons' && <CouponsModule tenantId={currentTenant.id} />}
          {active === 'reports' && <ReportsModule tenantId={currentTenant.id} storeId={currentStoreId} />}
          {active === 'tenants' && <TenantsModule />}
          {active === 'settings' && <SettingsModule />}
        </main>

        {/* Quick logout bar */}
        <footer className="border-t bg-card px-4 py-2 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <StoreIcon className="w-3 h-3" />
            <span>Tenant فعال: <strong className="text-foreground">{currentTenant.name}</strong></span>
            {currentStoreId && stores.find(s => s.id === currentStoreId) && (
              <span>· شعبه: <strong className="text-foreground">{stores.find(s => s.id === currentStoreId)?.name}</strong></span>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={logout} className="h-7 text-xs gap-1">
            <LogOut className="w-3 h-3" /> تغییر tenant
          </Button>
        </footer>
      </div>
    </div>
  )
}
