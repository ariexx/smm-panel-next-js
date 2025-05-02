"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  LineChart,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminSettingsPage from "@/app/(admin)/admin/settings/page";

interface MainSidebarProps {
  user: any;
}

export function MainSidebar({ user }: MainSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    router.push("/login");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const userInitials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : user?.email
      ? user.email.substring(0, 2).toUpperCase()
      : "U";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/40 pb-2">
        <div className="flex items-center gap-2 px-4 py-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SocialBoost</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                  onClick={() => router.push("/dashboard")}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/new-order")}
                  tooltip="New Order"
                  onClick={() => router.push("/new-order")}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>New Order</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/services")}
                  tooltip="Services"
                  onClick={() => router.push("/services")}
                >
                  <Package className="h-4 w-4" />
                  <span>Services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/order-history")}
                  tooltip="Order History"
                  onClick={() => router.push("/order-history")}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Order History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/add-funds")}
                  tooltip="Add Funds"
                  onClick={() => router.push("/add-funds")}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Add Funds</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/api")}
                  tooltip="API"
                  onClick={() => router.push("/api")}
                >
                  <LineChart className="h-4 w-4" />
                  <span>API</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isActive("/settings")}
                  tooltip="Settings"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/admin")}
                    tooltip="Admin Dashboard"
                    onClick={() => router.push("/admin")}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/admin/users")}
                    tooltip="Manage Users"
                    onClick={() => router.push("/admin/users")}
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/admin/services")}
                    tooltip="Manage Services"
                    onClick={() => router.push("/admin/services")}
                  >
                    <Package className="h-4 w-4" />
                    <span>Manage Services</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive("/admin/settings")}
                    tooltip="Website Settings"
                    onClick={() => router.push("/admin/settings")}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Manage Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {user?.username || user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Balance: ${user?.balance?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
