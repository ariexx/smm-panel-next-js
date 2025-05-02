"use client";

import { useRouter } from "next/navigation";
import { DollarSign, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MainHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search services..."
              className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/dashboard/invite")}
      >
        <Users className="mr-2 h-4 w-4" />
        Invite Friends
      </Button>
      <Button size="sm" onClick={() => router.push("/add-funds")}>
        <DollarSign className="mr-2 h-4 w-4" />
        Add Funds
      </Button>
    </header>
  );
}
