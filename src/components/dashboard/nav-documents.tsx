"use client"

import { ChevronDownIcon, FolderIcon, MoreHorizontalIcon, ShareIcon, type LucideIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"


type SubItem = {
  name: string;
  url: string;
}

type Item ={
  name: string;
  url: string;
  icon: LucideIcon;
  subItems?: SubItem[];
}

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
    subItems?: Array<{ name: string; url: string }>
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            {item.subItems && item.subItems.length > 0 ? (
              <CollapsibleDocumentItem item={item} isMobile={isMobile} />
            ) : (
              <>
                <Link href={item.url} passHref legacyBehavior>
                  <SidebarMenuButton asChild>
                    <a className="flex items-center gap-2 w-full">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
                <DocumentActionsMenu isMobile={isMobile} />
              </>
            )}
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontalIcon className="text-sidebar-foreground/70 w-4 h-4" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function CollapsibleDocumentItem({ item, isMobile }: { item: Item, isMobile: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <item.icon className="w-4 h-4" />
          <span>{item.name}</span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="ml-6 space-y-1">
          {item.subItems?.map((subItem: SubItem) => (
            <div key={subItem.name} className="flex items-center justify-between">
              <Link href={subItem.url} passHref legacyBehavior>
                <a className="flex items-center gap-2 w-full py-1 text-sm">
                  <item.icon className="w-4 h-4" />
                  <span>{subItem.name}</span>
                </a>
              </Link>
              <DocumentActionsMenu isMobile={isMobile} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentActionsMenu({ isMobile }: { isMobile: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction showOnHover className="rounded-sm data-[state=open]:bg-accent">
          <MoreHorizontalIcon className="w-4 h-4" />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-24 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        <DropdownMenuItem>
          <FolderIcon className="w-4 h-4 mr-2" />
          <span>Open</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ShareIcon className="w-4 h-4 mr-2" />
          <span>Share</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}