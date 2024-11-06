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
  Building2,
  Calculator,
  Calendar,
  ClipboardList,
  FileText,
  Settings2,
  Users,
  LayoutDashboard
} from "lucide-react";
import { SectionSwitcher } from "@/components/section-switcher";

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
          }
        ],
      },
      {
        title: "Employee Management",
        url: "/admin/employees",
        icon: Users,
        items: [
          {
            title: "Employee List",
            url: "/admin/employees",
          },
          {
            title: "Government IDs",
            url: "/admin/employees/government-ids",
          },
        ],
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
          {
            title: "Biometric Management",
            url: "/admin/attendance/biometric",
          },
        ],
      },
      {
        title: "Leave Management",
        url: "/admin/leaves",
        icon: Calendar,
        items: [
          {
            title: "Leave Requests",
            url: "/admin/leaves/requests",
          },
          {
            title: "Leave Types",
            url: "/admin/leaves/types",
          },
        ],
      },
      {
        title: "Payroll",
        url: "/admin/payroll",
        icon: Calculator,
        items: [
          {
            title: "Process Payroll",
            url: "/admin/payroll/process",
          },
          {
            title: "Salary Components",
            url: "/admin/payroll/salary-components",
          },
          {
            title: "Government Contributions",
            url: "/admin/payroll/contributions",
          },
          {
            title: "Compensation",
            url: "/admin/payroll",
          }
        ],
      },
      {
        title: "Requests",
        url: "/admin/requests",
        icon: FileText,
        items: [
          {
            title: "Benefits",
            url: "/admin/requests/benefits",
          },
          {
            title: "Leave Requests",
            url: "/admin/requests/leaves",
          },
        ],
      },
      {
        title: "Company",
        url: "/admin/company",
        icon: Building2,
        items: [
          {
            title: "Holidays",
            url: "/admin/holidays",
          },
          {
            title: "Departments",
            url: "/admin/company/departments",
          },
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
            title: "User Management",
            url: "/admin/settings/users",
          },
        ],
      },
    ],
  };

  const { data: user } = useCurrentUser();

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="px-2 py-4">
          <SectionSwitcher />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}