"use client"

import * as React from "react"
import {
  IconActivity,
  IconBroadcast,
  IconChartBar,
  IconCirclePlusFilled,
  IconDatabase,
  IconFileAnalytics,
  IconFileText,
  IconGavel,
  IconHelp,
  IconLayoutDashboard,
  IconListDetails,
  IconLogout,
  IconMail,
  IconSearch,
  IconServer,
  IconSettings,
  IconShield,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const sidebarData = {
  user: {
    name: "Dynasty Admin",
    email: "admin@dynastyrp.eu",
    avatar: "/images/avatar-default.png",
  },
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: IconLayoutDashboard,
    },
    {
      title: "City Status",
      url: "#",
      icon: IconBroadcast,
    },
    {
      title: "Operations",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Community",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Server",
      icon: IconServer,
      url: "#",
      items: [
        { title: "Live Metrics", url: "#" },
        { title: "Scheduled Jobs", url: "#" },
      ],
    },
    {
      title: "Security",
      icon: IconShield,
      url: "#",
      items: [
        { title: "Audit Log", url: "#" },
        { title: "Incident Reports", url: "#" },
      ],
    },
    {
      title: "Compliance",
      icon: IconGavel,
      url: "#",
      items: [
        { title: "Policies", url: "#" },
        { title: "Evidence Locker", url: "#" },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
    {
      title: "Help Center",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Log out",
      url: "#",
      icon: IconLogout,
    },
  ],
  documents: [
    {
      name: "Knowledge Base",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Incident Reports",
      url: "#",
      icon: IconFileAnalytics,
    },
    {
      name: "Community Updates",
      url: "#",
      icon: IconFileText,
    },
  ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconActivity className="!size-5" />
                <span className="text-base font-semibold">Dynasty Control</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuButton
              tooltip="Quick Action"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            >
              <IconCirclePlusFilled />
              <span>Create Ticket</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavDocuments items={sidebarData.documents} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}


