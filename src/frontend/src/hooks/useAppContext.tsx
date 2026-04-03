import { type ReactNode, createContext, useContext } from "react";
import type { SRMRole, UserInfo } from "../backend";
import { useInternetIdentity } from "./useInternetIdentity";
import { useGetCallerUserProfile } from "./useQueries";

interface AppContextType {
  userProfile: UserInfo | null | undefined;
  isLoadingProfile: boolean;
  isAuthenticated: boolean;
  isProfileError: boolean;
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
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  // If profile query errored, treat as no profile / no setup needed
  const role = isProfileError ? null : (userProfile?.role ?? null);
  const needsProfileSetup =
    !isProfileError &&
    isAuthenticated &&
    !isLoadingProfile &&
    isFetched &&
    userProfile === null;

  return (
    <AppContext.Provider
      value={{
        userProfile: isProfileError ? null : userProfile,
        isLoadingProfile,
        isAuthenticated,
        isProfileError,
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
