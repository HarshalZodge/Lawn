'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Calendar, FileText, Users, MapPin, 
  CheckSquare, Map, FolderOpen, IndianRupee, Briefcase, 
  Zap, UserCheck, BarChart3, MessageSquare, Crown, 
  LogOut, ShieldAlert, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { db } from '@/lib/mock-db';
import { Profile, UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Owner', 'Manager', 'Accountant', 'Reception Staff', 'Event Coordinator', 'Super Admin'] },
  { name: 'Visual Calendar', href: '/calendar', icon: Calendar, roles: ['Owner', 'Manager', 'Accountant', 'Reception Staff', 'Event Coordinator', 'Super Admin'] },
  { name: 'Bookings', href: '/bookings', icon: FileText, roles: ['Owner', 'Manager', 'Accountant', 'Reception Staff', 'Super Admin'] },
  { name: 'Customers CRM', href: '/customers', icon: Users, roles: ['Owner', 'Manager', 'Reception Staff', 'Super Admin'] },
  { name: 'Venue & Slots', href: '/venues', icon: MapPin, roles: ['Owner', 'Manager', 'Super Admin'] },
  { name: 'Event Operations', href: '/operations', icon: CheckSquare, roles: ['Owner', 'Manager', 'Event Coordinator', 'Staff', 'Super Admin'] },
  { name: 'Venue Map Layout', href: '/map', icon: Map, roles: ['Owner', 'Manager', 'Event Coordinator', 'Super Admin'] },
  { name: 'Documents', href: '/documents', icon: FolderOpen, roles: ['Owner', 'Manager', 'Accountant', 'Super Admin'] },
  { name: 'Finance & Invoices', href: '/finance', icon: IndianRupee, roles: ['Owner', 'Accountant', 'Super Admin'] },
  { name: 'Vendor Manager', href: '/vendors', icon: Briefcase, roles: ['Owner', 'Manager', 'Accountant', 'Super Admin'] },
  { name: 'Generator Operations', href: '/operations/utility', icon: Zap, roles: ['Owner', 'Manager', 'Staff', 'Super Admin'] },
  { name: 'Staff & Attendance', href: '/staff', icon: UserCheck, roles: ['Owner', 'Manager', 'Super Admin'] },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, roles: ['Owner', 'Accountant', 'Super Admin'] },
  { name: 'WhatsApp Templates', href: '/whatsapp', icon: MessageSquare, roles: ['Owner', 'Manager', 'Super Admin'] },
  { name: 'Owner Center', href: '/owner', icon: Crown, roles: ['Owner', 'Super Admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Initialize user profile
    const user = db.getCurrentUser();
    const profiles = db.getProfiles();
    setCurrentUser(user);
    setAllProfiles(profiles);
    setAuthChecked(true);
  }, []);

  const handleRoleChange = (userId: string) => {
    db.setCurrentUser(userId);
    const updated = db.getCurrentUser();
    setCurrentUser(updated);
    setRoleMenuOpen(false);
    
    // Redirect to home/dashboard on role switch to re-validate permissions
    router.refresh();
  };

  // Permission verification
  const currentItem = SIDEBAR_ITEMS.find(item => pathname.startsWith(item.href));
  const hasPermission = currentUser && currentItem 
    ? currentItem.roles.includes(currentUser.role) 
    : true;

  if (!authChecked || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-ivory">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-primary border-t-gold-primary"></div>
          <p className="font-heading text-lg font-medium text-purple-primary">Loading Bhagyalaxmi ERP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-ivory overflow-hidden">
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex md:flex-col md:w-72 bg-purple-dark border-r border-border-light text-white relative z-20 shadow-luxury flex-shrink-0">
        {/* LOGO & TAGLINE */}
        <div className="p-6 border-b border-purple-primary flex items-center space-x-3 bg-purple-dark relative">
          <div className="absolute top-0 right-0 left-0 h-1 gold-shimmer"></div>
          <img src="/logo.png" alt="Bhagyalaxmi Logo" className="h-10 w-10 rounded-lg object-cover border border-gold-primary/30" />
          <div>
            <h1 className="font-heading text-xl font-bold tracking-wide text-gold-primary leading-tight">
              Bhagyalaxmi ERP
            </h1>
            <p className="text-[9px] text-purple-light/80 tracking-widest font-sans uppercase">
              Wedding Venue OS
            </p>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-purple-primary">
          {SIDEBAR_ITEMS.map((item) => {
            const isAuthorized = item.roles.includes(currentUser.role);
            const isActive = pathname.startsWith(item.href);
            
            if (!isAuthorized) return null;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-gold-primary text-purple-dark shadow-md font-semibold scale-[1.02]" 
                    : "text-purple-light hover:bg-purple-primary/40 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-purple-dark" : "text-gold-primary"
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-purple-dark animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM PROFILE / LOGOUT */}
        <div className="p-4 border-t border-purple-primary bg-purple-primary/20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gold-primary text-purple-dark font-bold flex items-center justify-center border-2 border-border-light shadow-md">
              {currentUser.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{currentUser.fullName}</p>
              <span className="inline-block bg-gold-primary/20 text-gold-primary text-[10px] px-2 py-0.5 rounded font-medium border border-gold-primary/30 mt-0.5">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          
          <aside className="relative flex flex-col w-64 max-w-xs bg-purple-dark text-white shadow-luxury h-full z-50">
            <div className="p-6 border-b border-purple-primary flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" alt="Bhagyalaxmi Logo" className="h-8 w-8 rounded-lg object-cover" />
                <div>
                  <h1 className="font-heading text-lg font-bold text-gold-primary leading-none">Bhagyalaxmi</h1>
                  <p className="text-[9px] text-purple-light uppercase mt-0.5">Wedding Venue OS</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-purple-light hover:text-white hover:bg-purple-primary/50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const isAuthorized = item.roles.includes(currentUser.role);
                const isActive = pathname.startsWith(item.href);
                
                if (!isAuthorized) return null;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg",
                      isActive 
                        ? "bg-gold-primary text-purple-dark font-semibold shadow-md" 
                        : "text-purple-light hover:bg-purple-primary/40 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-purple-dark" : "text-gold-primary")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-purple-primary bg-purple-primary/20">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-gold-primary text-purple-dark font-bold flex items-center justify-center">
                  {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{currentUser.fullName}</p>
                  <p className="text-[10px] text-gold-primary truncate">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-border-light flex items-center justify-between px-6 z-10 shadow-sm">
          {/* Burger menu for Mobile */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-purple-primary hover:bg-ivory"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* PAGE TITLE */}
          <div className="hidden md:block">
            <h2 className="font-heading text-lg font-semibold text-purple-primary capitalize">
              {pathname === '/dashboard' ? 'Overview' : pathname.split('/')[1]?.replace('-', ' ')}
            </h2>
          </div>

          {/* TOP RIGHT TOOLBAR */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* ROLE SELECTOR (FOR DEMO/TESTING RBAC) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-ivory border border-border-light hover:border-gold-primary rounded-lg text-xs font-medium text-dark transition-all shadow-sm"
                title="Switch role instantly to test access control permissions"
              >
                <ShieldAlert className="h-4 w-4 text-gold-primary animate-pulse" />
                <span className="hidden sm:inline">Role Simulator:</span>
                <span className="font-semibold text-purple-primary">{currentUser.role}</span>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-border-light rounded-xl shadow-luxury-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-border-light">
                    <p className="text-xs font-bold text-dark uppercase tracking-wider">Simulate Workspace Role</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Test restricted page modules in real-time.</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {allProfiles.map((prof) => (
                      <button
                        key={prof.id}
                        onClick={() => handleRoleChange(prof.id)}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs flex flex-col transition-colors",
                          prof.id === currentUser.id 
                            ? "bg-purple-light/40 text-purple-primary font-semibold border-l-4 border-purple-primary" 
                            : "hover:bg-ivory text-dark"
                        )}
                      >
                        <span className="font-medium">{prof.fullName}</span>
                        <span className="text-[10px] text-gray-500 italic mt-0.5">{prof.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICATIONS */}
            <button className="p-2 text-gray-400 hover:text-purple-primary rounded-full hover:bg-ivory relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-gold-primary rounded-full animate-ping"></span>
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-ivory scroll-smooth relative">
          {hasPermission ? (
            children
          ) : (
            <div className="flex h-[80%] flex-col items-center justify-center text-center p-6">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-300 mb-4 animate-bounce">
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-purple-dark">Access Denied</h3>
              <p className="text-gray-600 max-w-md mt-2 text-sm">
                Your simulated role <span className="font-semibold text-purple-primary">"{currentUser.role}"</span> does not have authorization to view the <span className="font-medium text-dark">{currentItem?.name}</span> module.
              </p>
              <button
                onClick={() => setRoleMenuOpen(true)}
                className="mt-6 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-purple-dark shadow-md transition-all font-medium text-sm border border-gold-primary/30"
              >
                Switch Role to Owner or Super Admin
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
