"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Calculator,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings2,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
        items: [
          {
            title: "Overview",
            url: "/admin",
          },
          {
            title: "Reports",
            url: "/admin/reports",
          }
        ],
      },
      {
        title: "Reports",
        url: "/admin/reports",
        icon: FileText,
        items: [
          {
            title: "Overview",
            url: "/admin",
          },
          {
            title: "Reports",
            url: "/admin/reports",
          }
        ],
      },
      {
        title: "Employee List",
        url: "/admin/employees",
        icon: Users,
      },
      {
        title: "Attendance",
        url: "/admin/attendance",
        icon: ClipboardList,
        items: [
          {
            title: "Daily Records",
            url: "/admin/attendance",
          },
        ],
      },
      {
        title: "Requests",
        url: "/admin/requests",
        icon: FileText,
        items: [
          {
            title: "Vouchers",
            url: "/admin/requests/benefits",
          },
          {
            title: "Leave Requests",
            url: "/admin/requests/leaves",
          },
          {
            title: "Loans",
            url: "/admin/requests/loans",
          },
          // {
          //   title: "VALE",
          //   url: "/admin/requests/cash-advance",
          // }
        ],
      },
      {
        title: "Payroll",
        url: "/admin/payroll",
        icon: Calculator,
        items: [
          {
            title: "Payroll Sheet",
            url: "/admin/payroll/process",
          },
          {
            title: "Salary Components",
            url: "/admin/payroll/salary-components",
          },
          {
            title: "Voucher Types",
            url: "/admin/payroll",
          }
          // ,
          // {
          //   title: "Salary Components",
          //   url: "/admin/payroll/salary-components",
          // },
          // {
          //   title: "Government Contributions",
          //   url: "/admin/payroll/contributions",
          // },
          // {
          //   title: "Compensation",
          //   url: "/admin/payroll",
          // }
        ],
      },
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings2,
        items: [
          {
            title: "System Settings",
            url: "/admin/settings/system",
          },
          {
            title: "User Profile",
            url: "/admin/settings/user-profile",
          },
          {
            title: "Holidays",
            url: "/admin/holidays",
          },
        ],
      },
    ],
  };

  const { data: user } = useCurrentUser();

  if (!user) return null;

  return (
    <Sidebar collapsible="none" {...props} className="bg-white h-screen sticky top-0 left-0">
      <SidebarHeader>
        <Link href="/admin" className="flex flex-col items-center mb-8">
          <div className="bg-[#8BC34A] w-full py-4 rounded-md flex flex-col items-center">
            <Image src="/logo.svg" alt="A1 Agro" width={50} height={50} className="size-16" />
            <h1 className="text-sm font-semibold text-center text-white mt-2 px-2">
              A1 Agro Fertilizer and Chemical Supply
            </h1>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}