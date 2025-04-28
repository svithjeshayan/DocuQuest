"use client"

import type * as React from "react"
import { useUser } from "@/context/UserContext"
import {
  LayoutDashboardIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  BellIcon,
  SettingsIcon,
  HelpCircleIcon,
  LibraryIcon,
  GraduationCapIcon,
  SchoolIcon,
  BusIcon,
  BookmarkIcon,
  BarChartIcon,
  FileArchiveIcon
} from "lucide-react"
import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMain = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboardIcon 
  },
  { 
    title: "Students", 
    url: "/students", 
    icon: GraduationCapIcon,
    subItems: [
      { title: "All Students", url: "/students" },
      { title: "Admissions", url: "/students/admissions" },
      { title: "Attendance", url: "/students/attendance" },
      { title: "Promotions", url: "/students/promotions" }
    ]
  },
  { 
    title: "Staff", 
    url: "/staff", 
    icon: UsersIcon,
    subItems: [
      { title: "All Students", url: "/students" },
      { title: "Admissions", url: "/students/admissions" },
      { title: "Attendance", url: "/students/attendance" },
      { title: "Promotions", url: "/students/promotions" }
    ]
  },
  { 
    title: "Academics", 
    url: "/academics", 
    icon: BookOpenIcon,
    subItems: [
      { title: "Classes", url: "/academics/classes" },
      { title: "Subjects", url: "/academics/subjects" },
      { title: "Timetable", url: "/academics/timetable" },
      { title: "Examinations", url: "/academics/exams" }
    ]
  },
  { 
    title: "Finance", 
    url: "/finance", 
    icon: CreditCardIcon,
    subItems: [
      { title: "Charts of Accounts", url: "/dashboard/finance/charts-of-accounts" },
      { title: "Payments", url: "/finance/payments" },
      { title: "Expenses", url: "/finance/expenses" }
    ]
  }
]

// Secondary Navigation Items
const navSecondary = [
  { 
    title: "Library", 
    url: "/library", 
    icon: LibraryIcon 
  },
  { 
    title: "Transport", 
    url: "/transport", 
    icon: BusIcon 
  },
  { 
    title: "Reports", 
    url: "/reports", 
    icon: BarChartIcon,
    subItems: [
      { title: "Student Reports", url: "/reports/students" },
      { title: "Financial Reports", url: "/reports/finance" },
      { title: "Attendance Reports", url: "/reports/attendance" }
    ]
  }
]

// Documents/Resources
const documents = [
  { 
    name: "Syllabus", 
    url: "/documents/syllabus", 
    icon: BookmarkIcon 
  },
  { 
    name: "Exam Papers", 
    url: "/documents/exams", 
    icon: FileTextIcon 
  },
  { 
    name: "Archives", 
    url: "/documents/archives", 
    icon: FileArchiveIcon 
  }
]

// System Navigation
const systemNav = [
  { 
    title: "Calendar", 
    url: "/calendar", 
    icon: CalendarIcon 
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: SettingsIcon 
  }
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#" className="flex items-center space-x-2">
                <span className="text-base font-semibold">
                  {user?.firstName || "User's Name"}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main School Management Sections */}
        <NavMain items={navMain} />
        
        {/* Secondary Sections */}
        <NavSecondary items={navSecondary} />
        
        {/* Documents/Resources */}
        <NavDocuments items={documents} />
        
        {/* System Sections */}
        <NavSecondary 
          items={systemNav} 
          className="mt-auto border-t pt-2"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          avatar: "/default-avatar.jpg",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}