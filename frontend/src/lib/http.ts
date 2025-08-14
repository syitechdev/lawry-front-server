import axios, { AxiosInstance } from "axios";

const rawBase = (import.meta.env as Record<string, string | undefined>)
  .VITE_API_BASE_URL;
const rawPrefix = (import.meta.env as Record<string, string | undefined>)
  .VITE_API_PREFIX;

const base =
  rawBase && rawBase.trim().length ? rawBase : "http://127.0.0.1:8000";
const prefix = rawPrefix && rawPrefix.trim().length ? rawPrefix : "/api/v1";

const trimEnd = (s: string) => s.replace(/\/+$/g, "");
const trimStart = (s: string) => s.replace(/^\/+/g, "");
const baseURL = `${trimEnd(base)}/${trimStart(prefix)}`;

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: "application/ld+json",
  },
});

if (!rawBase || !rawPrefix) {
  console.warn(
    "[http] VITE_API_BASE_URL ou VITE_API_PREFIX manquants. Utilisation des valeurs par défaut:",
    baseURL
  );
}

http.interceptors.request.use((config) => {
  const t = localStorage.getItem("auth_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;

  if (
    config.data instanceof FormData &&
    config.headers &&
    "Content-Type" in config.headers
  ) {
    delete (config.headers as any)["Content-Type"];
  }
  if (
    config.method?.toLowerCase() === "get" &&
    config.headers &&
    "Content-Type" in config.headers
  ) {
    delete (config.headers as any)["Content-Type"];
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_user");
      if (!location.pathname.includes("/login"))
        location.href = "/login?expired=1";
    }
    return Promise.reject(err);
  }
);
