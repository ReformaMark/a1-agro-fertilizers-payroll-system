"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function SectionSwitcher() {
  const { state } = useSidebar();

  return (
    <SidebarMenu className="-mx-1">
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex flex-col items-center w-full">
            <div className="bg-[#8BC34A] w-full py-4 rounded-md flex flex-col items-center">
              <Image src="/logo.svg" alt="A1 Agro" width={50} height={50} className="size-16" />
              {state === "expanded" && (
                <h1 className="text-sm font-semibold text-center text-white mt-2 px-2">
                  A1 Agro Fertilizer and Chemical Supply
                </h1>
              )}
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}