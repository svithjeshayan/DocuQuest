"use client"

import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function NavMain({ items }: { items: Array<{
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  subItems?: Array<{ title: string; url: string }>
}> }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1 mt-3">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="pl-3 mb-4">
              {item.subItems && item.subItems.length > 0 ? (
                <CollapsibleMenu item={item} />
              ) : (                
                <a href={item.url}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.title}</span>
                </div>                
              </a>

              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function CollapsibleMenu({ item }: { item: any }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          {item.icon && <item.icon className="w-4 h-4" />}
          <span>{item.title}</span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="ml-6 mt-1 space-y-1">
          {item.subItems.map((subItem: any) => (
            <Link key={subItem.title} href={subItem.url} passHref legacyBehavior>
              <a className="block px-3 py-1 text-sm rounded hover:bg-accent">
                {subItem.title}
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}