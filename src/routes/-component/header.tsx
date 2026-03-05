import React, { useState, useRef, useEffect } from "react";
import { Link, useRouterState , useNavigate} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { User, Bell, Search, ChevronRight } from "lucide-react";
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'

import { logout as performLogout } from "@/services/auth";

import { toast } from "sonner";
import { useAtom } from 'jotai'
import {  userEmail, userFirstName, userLastName } from '@/store/auth'
import { useProfile } from "@/hooks/use-profile";

export const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const routerState = useRouterState();
  const navigate = useNavigate();
  
  // Use the profile hook to ensure data is loaded and synced with atoms
  useProfile();

  const [userMail] = useAtom<string | null>(userEmail)
  const [firstName] = useAtom<string | null>(userFirstName)
  const [lastName] = useAtom<string | null>(userLastName)
  
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    // Call auth service to clear tokens, invalidate profile query and redirect
    try {
      performLogout()
      // Redirect to login page after logout
      navigate({ to: "/login" })
      toast.success("Logged out successfully",{
        duration: 1000,
        richColors: true,
      })
    } catch (e) {
      console.error('Logout failed', e)
    } finally {
      setMenuOpen(false)
    }
  }

  // Generate breadcrumbs from current path
  const pathSegments = routerState.location.pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1));
  
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            {pathSegments.length > 0 && (
              <>
                {pathSegments.map((segment, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{segment}</span>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2" ref={containerRef}>
          {/* Search */}
          <div className="relative hidden md:block">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 h-9"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg z-50 py-1">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{firstName + ' ' + lastName}</p>
                  <p className="text-xs text-muted-foreground">{userMail}</p>
                </div>
                <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/" className="block px-4 py-2 text-sm hover:bg-accent" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <Separator className="my-1" />
            
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent text-destructive"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};