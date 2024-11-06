"use client";

import { ChevronsUpDown } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function SectionSwitcher() {
  const { state } = useSidebar();

  return (
    <SidebarMenu className="-mx-1">
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-green-600 text-white">
            <span className="text-xs">A1</span>
          </div>
          {state === "expanded" && (
            <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                A1 Agro HR System
              </span>
              <span className="truncate text-xs">HR Management System</span>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}