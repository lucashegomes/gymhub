const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("gymhub:auth:token") || "";
}

export const permissionsService = {
  async getMenusForCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/menus/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { data: any[] };
    return payload.data || [];
  },
};
