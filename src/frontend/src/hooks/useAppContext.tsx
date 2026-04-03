import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { SRMRole, UserInfo } from "../backend";
import { SRMRole as SRMRoleEnum } from "../backend";
import { useInternetIdentity } from "./useInternetIdentity";
import { useGetCallerUserProfile } from "./useQueries";

interface AppContextType {
  userProfile: UserInfo | null | undefined;
  isLoadingProfile: boolean;
  isAuthenticated: boolean;
  role: SRMRole | null;
  needsProfileSetup: boolean;
  refetchProfile: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    isFetched,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  const role = userProfile?.role ?? null;
  const needsProfileSetup =
    isAuthenticated && !isLoadingProfile && isFetched && userProfile === null;

  return (
    <AppContext.Provider
      value={{
        userProfile,
        isLoadingProfile,
        isAuthenticated,
        role,
        needsProfileSetup,
        refetchProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
