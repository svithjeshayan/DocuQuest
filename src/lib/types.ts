// src/lib/types.ts
import { User } from "@prisma/client";

export type UserWithRelations = User & {
};

export type SafeUser = Omit<UserWithRelations, "password"> & {
};