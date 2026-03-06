import { resolveApiAssetUrl } from "@/services/core/media";
const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export interface AuthPermission {
  id: string;
  resource: string;
  action: string;
  screen: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  photoUrl?: string;
  roleId: string;
  status: "active" | "inactive" | "blocked";
  lastLogin?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  permissions: AuthPermission[];
  featureFlags: string[];
}

function normalizeUser(user: AuthUser): AuthUser {
  return {
    ...user,
    photoUrl: resolveApiAssetUrl(user.photoUrl),
  };
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((payload as { message?: string }).message || `HTTP ${response.status}`);
  }

  return payload as T;
}

export const authService = {
  async login(identifier: string, password: string) {
    const response = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });

    return {
      ...response,
      user: normalizeUser(response.user),
    };
  },

  logout(token: string) {
    return request<{ success: boolean; message: string }>(
      "/auth/logout",
      {
        method: "POST",
      },
      token,
    );
  },

  async getCurrentUser(token: string) {
    const response = await request<{ data: AuthUser; success: boolean }>("/auth/me", { method: "GET" }, token);
    return {
      ...response,
      data: normalizeUser(response.data),
    };
  },

  requestPasswordReset(identifier: string) {
    return request<{ success: boolean; message: string; resetToken?: string }>("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
  },

  resetPassword(token: string, password: string) {
    return request<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },
};
