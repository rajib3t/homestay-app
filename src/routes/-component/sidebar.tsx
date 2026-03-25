import React, { useState, useEffect } from 'react'
import { getSidebarOpen, subscribeSidebar, updateSidebarItem, setSidebarOpen } from '@/state/sidebarAtom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Home,
  FileText,
  Settings,
  MessageSquare,
  Activity,
  User,
  LogOut,
  MapPin,
  VectorSquare,
  Component 
} from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { env } from '@/lib/env'

const menuItems: Array<{
  title: string
  icon: any
  url?: string
  children?: Array<{ title: string; url: string }>
}> = [
  { title: 'Dashboard', icon: Home, url: '/dashboard' },
  {
    title: 'Locations',
    icon: MapPin,
    children: [
      { title: 'Countries', url: '/countries' },
      { title: 'Cities', url: '/cities' },
      { title: 'Locations', url: '/locations' },
    ],
  },
  {
    title: 'Attributes',
    icon: VectorSquare,
    children: [
      { title: 'Amenities', url: '/amenities' },
      { title: 'Facilities', url: '/facility' },
      { title: 'Bed Types', url: '/bed-types' },
    ],
  },
  {
    title: 'Vendors',
    icon: Component,
    url: '/vendors',
  },
  {
    title: 'Bookings',
    icon: Activity,
    url: '/bookings',
  },
  { title: 'Appointments', icon: FileText, url: '/appointments' },
  { title: 'Consultations', icon: MessageSquare, url: '/consultations' },
  { title: 'Health Monitoring', icon: Activity, url: '/monitoring' },
]

const settingsItems = [
  { title: 'Settings', icon: Settings, url: '/settings' },
  { title: 'Profile', icon: User, url: '/profile' },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(getSidebarOpen())
  const normalizePath = (p?: string) => {
    if (!p) return '/'
    if (p === '/') return p
    return p.replace(/\/+$/, '') || '/'
  }
  const [currentPath, setCurrentPath] = useState<string>(normalizePath(window.location.pathname))

  const routerState = useRouterState()

  // Open menu parents that match the current path (and keep atom in sync)
  useEffect(() => {
    const openForPath = (pathname = routerState.location.pathname) => {
      const normalized = normalizePath(pathname)
      setCurrentPath(normalized)
      // Start fresh so unrelated parents are closed when navigating
      const next: Record<string, boolean> = {}

      menuItems.forEach((item) => {
        if (item.children) {
          const matches = item.children.some((c) => {
            if (!c.url) return false
            const u = normalizePath(c.url)
            return normalized === u || normalized.startsWith(u + '/') || normalized.startsWith(u)
          })
          if (matches) next[item.title] = true
        }
      })

      setOpenItems(next)
      setSidebarOpen(next)
    }

    openForPath()
  }, [routerState.location.pathname])

  const toggleItem = (title: string) => {
    updateSidebarItem(title)
  }

  useEffect(() => {
    const unsub = subscribeSidebar(() => setOpenItems(getSidebarOpen()))
    return unsub
  }, [])

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{env.get('APP_NAME')}</span>
              {/* <span className="text-xs text-muted-foreground">{env.get('APP_DESCRIPTION')}</span> */}
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children ? (
                    <React.Fragment>
                      {/** Parent button: active if any child matches currentPath */}
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => toggleItem(item.title)}
                        isActive={
                          item.children?.some((c) => {
                            if (!c.url) return false
                            const u = normalizePath(c.url)
                            return currentPath === u || currentPath.startsWith(u + '/') || currentPath.startsWith(u)
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <item.icon />
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            className={`transition-transform ${openItems[item.title] ? 'rotate-180' : ''}`}
                          />
                        )}
                      </SidebarMenuButton>

                      {openItems[item.title] && !isCollapsed && (
                        <div className="mt-1 space-y-1 pl-6">
                          <SidebarMenu>
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton
                                asChild
                                tooltip={child.title}
                                isActive={
                                  child.url
                                    ? ((): boolean => {
                                        const u = normalizePath(child.url as string)
                                        return currentPath === u || currentPath.startsWith(u + '/') || currentPath.startsWith(u)
                                      })()
                                    : false
                                }
                              >
                                <Link to={child.url}>
                                  <span className="text-sm">{child.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                          </SidebarMenu>
                        </div>
                      )}
                    </React.Fragment>
                  ) : (
                    <SidebarMenuButton asChild tooltip={item.title}>
                      
                      <Link to={item.url}>
                      <div className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link to={item.url}>
                      <div className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Separator className="mb-2" />
        <div className="px-2 py-1">
          <Button
            variant="ghost"
            size={isCollapsed ? 'icon' : 'default'}
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}