// src/app/dashboard/layout.tsx (server component)
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import { SiteHeader } from "@/components/dashboard/site-header"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // Remove sensitive fields before passing to client
  const safeUser = user;
  
  return (
    <UserProvider user={safeUser}>
      <SidebarProvider>
      {/* <AppSidebar variant="inset" /> */}
      <SidebarInset>
      
          {children}
      </SidebarInset>
    </SidebarProvider>
     
    </UserProvider>
  );
}