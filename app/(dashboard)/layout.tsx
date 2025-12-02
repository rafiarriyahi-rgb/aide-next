'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-context';
import { Home, TrendingUp, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppLogoWithText } from '@/components/icons/custom-logos';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: 'Home',
    url: '/home',
    icon: Home,
  },
  {
    title: 'Analytics',
    url: '/analytic',
    icon: TrendingUp,
  },
  {
    title: 'Account',
    url: '/account',
    icon: User,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4A90E2]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-center">
              <AppLogoWithText size={140} />
            </div>
          </SidebarHeader>

          <SidebarContent className="pt-4 px-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 pb-2 mb-1">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`
                            rounded-lg transition-all duration-200 h-11
                            ${isActive
                              ? 'bg-white text-[#667eea] shadow-sm border border-[#667eea]/20 hover:shadow-md'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }
                          `}
                        >
                          <Link href={item.url} className="flex items-center gap-3 px-4 py-2.5">
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-[#667eea]' : 'text-slate-500'}`} />
                            <span className={`font-medium text-[15px] ${isActive ? 'font-semibold' : ''}`}>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white border border-slate-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {userProfile?.username || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {userProfile?.email || ''}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start gap-2 text-slate-700 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-slate-300 h-10 font-medium"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
            <SidebarTrigger className="text-slate-600 hover:text-slate-900 hover:bg-slate-100" />
            <h1 className="text-xl font-bold text-slate-900">
              {menuItems.find((item) => item.url === pathname)?.title || 'Dashboard'}
            </h1>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
