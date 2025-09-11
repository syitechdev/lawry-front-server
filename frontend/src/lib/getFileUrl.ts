// frontend/src/lib/getFileUrl.ts
export const getFileUrl = (filepath: string) => {
  if (!filepath) return "#";

  if (/^https?:\/\//i.test(filepath)) return encodeURI(filepath);

  const raw = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
  const rawTrim = raw.replace(/\/+$/, ""); // trim fin

  if (/^\/?api\//i.test(filepath)) {
    const path = `/${filepath.replace(/^\/+/, "")}`;
    return encodeURI(`${rawTrim}${path}`);
  }

  const appBase = rawTrim.replace(/\/api(\/v\d+)?$/i, "");
  const path = `/${String(filepath).replace(/^\/+/, "")}`;
  return encodeURI(`${appBase}${path}`);
};
