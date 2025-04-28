// src/context/UserContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { SafeUser } from "@/lib/types";

type UserContextType = {
  user: SafeUser | null;
  refreshUser?: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: undefined,
});

export function UserProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: SafeUser;
}) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}