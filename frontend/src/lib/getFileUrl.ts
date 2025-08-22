export const getFileUrl = (filepath: string) => {
  const raw = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
  const base = raw.replace(/\/api(\/v\d+)?\/?$/i, "");
  return `${base.replace(/\/+$/, "")}/${String(filepath).replace(/^\/+/, "")}`;
};
