import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService, type AuthPermission, type AuthUser } from "@/services/auth/auth.service";

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  permissions: AuthPermission[];
  featureFlags: string[];
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      hasPermission,
      canViewScreen,
    }),
    [user, token, permissions, featureFlags],
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
