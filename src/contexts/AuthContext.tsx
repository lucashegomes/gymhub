import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService, type AuthPermission, type AuthUser } from "@/services/auth/auth.service";

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  permissions: AuthPermission[];
  featureFlags: string[];
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  updateCurrentUser: (patch: Partial<AuthUser>) => void;
  hasPermission: (resource: string, action: string) => boolean;
  canViewScreen: (screen: string) => boolean;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const TOKEN_KEY = "gymhub:auth:token";
const AUTH_DATA_KEY = "gymhub:auth:data";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<AuthPermission[]>([]);
  const [featureFlags, setFeatureFlags] = useState<string[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_DATA_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        user: AuthUser;
        permissions: AuthPermission[];
        featureFlags: string[];
      };

      setUser(parsed.user);
      setPermissions(parsed.permissions || []);
      setFeatureFlags(parsed.featureFlags || []);
    } catch {
      localStorage.removeItem(AUTH_DATA_KEY);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    setIsAuthLoading(true);
    authService
      .getCurrentUser(token)
      .then((response) => {
        setUser(response.data);

        const raw = localStorage.getItem(AUTH_DATA_KEY);
        if (!raw) return;

        try {
          const parsed = JSON.parse(raw) as { permissions: AuthPermission[]; featureFlags: string[] };
          localStorage.setItem(
            AUTH_DATA_KEY,
            JSON.stringify({
              user: response.data,
              permissions: parsed.permissions || [],
              featureFlags: parsed.featureFlags || [],
            }),
          );
        } catch {
          // ignore parsing issues
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(AUTH_DATA_KEY);
        setToken(null);
        setUser(null);
        setPermissions([]);
        setFeatureFlags([]);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsAuthLoading(false);
    }
  }, [token]);

  const persistAuth = (data: { token: string; user: AuthUser; permissions: AuthPermission[]; featureFlags: string[] }) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(
      AUTH_DATA_KEY,
      JSON.stringify({ user: data.user, permissions: data.permissions, featureFlags: data.featureFlags }),
    );

    setToken(data.token);
    setUser(data.user);
    setPermissions(data.permissions || []);
    setFeatureFlags(data.featureFlags || []);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_DATA_KEY);
    setToken(null);
    setUser(null);
    setPermissions([]);
    setFeatureFlags([]);
  };

  const login = async (identifier: string, password: string) => {
    const response = await authService.login(identifier, password);
    persistAuth(response);
  };

  const logout = async () => {
    if (token) {
      await authService.logout(token).catch(() => undefined);
    }
    clearAuth();
  };

  const refreshCurrentUser = async () => {
    if (!token) return;

    const response = await authService.getCurrentUser(token);
    setUser(response.data);

    const raw = localStorage.getItem(AUTH_DATA_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { permissions: AuthPermission[]; featureFlags: string[] };
      localStorage.setItem(
        AUTH_DATA_KEY,
        JSON.stringify({
          user: response.data,
          permissions: parsed.permissions || [],
          featureFlags: parsed.featureFlags || [],
        }),
      );
    } catch {
      // ignore parsing issues
    }
  };

  const updateCurrentUser = (patch: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };

      const raw = localStorage.getItem(AUTH_DATA_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { permissions: AuthPermission[]; featureFlags: string[] };
          localStorage.setItem(
            AUTH_DATA_KEY,
            JSON.stringify({
              user: next,
              permissions: parsed.permissions || [],
              featureFlags: parsed.featureFlags || [],
            }),
          );
        } catch {
          // ignore local storage parsing issues
        }
      }

      return next;
    });
  };

  const hasPermission = (resource: string, action: string) => {
    return permissions.some((permission) => permission.resource === resource && permission.action === action);
  };

  const canViewScreen = (screen: string) => {
    return permissions.some((permission) => permission.screen === screen && permission.action === "view");
  };

  const value = useMemo<AuthContextData>(
    () => ({
      user,
      token,
      permissions,
      featureFlags,
      isAuthLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshCurrentUser,
      updateCurrentUser,
      hasPermission,
      canViewScreen,
    }),
    [user, token, permissions, featureFlags, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
