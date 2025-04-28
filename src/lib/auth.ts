// src/lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../app/api/auth/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  return session;
}

export async function getAuthenticatedUserWithRoles() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}