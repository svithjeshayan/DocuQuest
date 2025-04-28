// src/app/dashboard/LogoutButton.tsx
"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/login" })} variant="destructive">
      Logout
    </Button>
  );
}