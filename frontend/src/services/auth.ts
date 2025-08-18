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
const AUTH_HEADER = "Authorization";

function applyAuthHeader(token: string | null) {
  if (token) {
    (http as any).defaults.headers.common[AUTH_HEADER] = `Bearer ${token}`;
  } else {
    delete (http as any).defaults.headers.common[AUTH_HEADER];
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function setCurrentUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  applyAuthHeader(token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  applyAuthHeader(null);
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  setSession(data.token, data.user);
  return data;
}

export async function register(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/auth/register", params);
  if (data?.token) setSession(data.token, data.user);
  return data;
}

export async function me(): Promise<User> {
  const { data } = await http.get<User>("/auth/me");
  setCurrentUser(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await http.post("/auth/logout");
  } finally {
    clearSession();
  }
}

export async function forgotPassword(email: string) {
  const { data } = await http.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(params: {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  const { data } = await http.post("/auth/reset-password", {
    token: params.token,
    email: params.email,
    password: params.password,
    password_confirmation: params.passwordConfirmation,
  });
  return data;
}

export function getAuthHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

applyAuthHeader(getToken());
