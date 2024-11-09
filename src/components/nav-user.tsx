"use client"

import { LogOut } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthActions } from "@convex-dev/auth/react"

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function NavUser({ user }: { user: User }) {
  const { signOut } = useAuthActions()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            signOut();
            window.location.href = "/auth";
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}