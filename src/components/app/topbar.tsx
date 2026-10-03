'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Store, ChevronLeft, Menu, Moon, Sun, Bell } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Store {
  id: string
  name: string
}

interface TopBarProps {
  title: string
  subtitle?: string
  onToggleSidebar: () => void
  stores: Store[]
}

export function TopBar({ title, subtitle, onToggleSidebar, stores }: TopBarProps) {
  const { currentTenant, currentStoreId, setStoreId } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="h-16 border-b bg-card/80 backdrop-blur flex items-center gap-3 px-4 shrink-0">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>

      {/* Tenant badge */}
      {currentTenant && (
        <Badge variant="secondary" className="hidden md:flex gap-2 px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium">{currentTenant.name}</span>
        </Badge>
      )}

      {/* Store selector */}
      {stores.length > 0 && (
        <Select value={currentStoreId || 'all'} onValueChange={(v) => setStoreId(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] hidden md:flex">
            <Store className="w-4 h-4 ml-2" />
            <SelectValue placeholder="همه شعب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه شعب</SelectItem>
            {stores.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
      </Button>

      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>

      <Avatar className="w-9 h-9">
        <AvatarImage src="https://i.pravatar.cc/150?img=1" />
        <AvatarFallback>مدیر</AvatarFallback>
      </Avatar>
    </header>
  )
}
