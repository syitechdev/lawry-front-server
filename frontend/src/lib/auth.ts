import { http } from "@/lib/http";

export type User = {
  id: number;
  name: string;
  email: string;
  roles?: string[];
};

export function getToken() {
  return localStorage.getItem("auth_token");
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("current_user");
  try {
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken() && !!getCurrentUser();
}

export function hasRole(role: string) {
  const u = getCurrentUser();
  return !!u?.roles?.includes(role);
}

export async function logout(): Promise<void> {
  try {
    const token = getToken();
    if (token) {
      await http.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Erreur API logout:", error);
  }

  // Supprimer les données locales même si l'API échoue
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user");
}
