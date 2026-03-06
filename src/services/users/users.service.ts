const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

function authHeaders() {
  const token = localStorage.getItem("gymhub:auth:token") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `HTTP ${response.status}`);
  }

  return data as T;
}

export const usersService = {
  list(params = "?page=1&pageSize=50") {
    return request<{ data: any[]; total: number; page: number; pageSize: number; totalPages: number }>(`/users${params}`);
  },
  create(payload: Record<string, unknown>) {
    return request<{ data: any; success: boolean; message: string }>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Record<string, unknown>) {
    return request<{ data: any; success: boolean; message: string }>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  remove(id: string) {
    return request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  },
  uploadPhoto(id: string, file: File) {
    const token = localStorage.getItem("gymhub:auth:token") || "";
    const formData = new FormData();
    formData.append("photo", file);

    return fetch(`${API_BASE_URL}/users/${id}/photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || `HTTP ${response.status}`);
      }
      return data as { data: any; success: boolean; message: string };
    });
  },
};
