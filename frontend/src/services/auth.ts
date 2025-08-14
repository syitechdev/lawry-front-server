// src/services/auth.ts
import { http } from "@/lib/http";

export type User = {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  phone?: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "current_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  // adapte si besoin (ex: "/login")
  const { data } = await http.post<LoginResponse>("/auth/login", { email, password });
  setSession(data.token, data.user);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await http.post("/auth/logout");
  } finally {
    clearSession();
  }
}
