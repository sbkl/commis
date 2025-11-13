"use client";

import * as React from "react";
import { api } from "@commis/api/src/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";

interface UserContextProps {
  user: typeof api.users.query.me._returnType;
}

interface UserProviderProps {
  preloadedUserQuery: Preloaded<typeof api.users.query.me>;
  children: React.ReactNode;
}

const UserContext = React.createContext<UserContextProps | undefined>(
  undefined
);

export function UserProvider({
  children,
  preloadedUserQuery,
}: UserProviderProps) {
  const user = usePreloadedQuery(preloadedUserQuery);

  return <UserContext value={{ user }}>{children}</UserContext>;
}

export function useMe() {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useMe must be used within a UserProvider");
  }
  return context;
}
