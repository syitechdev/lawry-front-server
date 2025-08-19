import { http } from "@/lib/http";

const LS_KEY = "my_registrations";

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Array<{ k: string; fid: number }>) : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: Array<{ k: string; fid: number }>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch {}
}

export async function listMyFormationIds(): Promise<number[]> {
  try {
    const { data } = await http.get("/public/registrations/mine");
    const arr = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.["hydra:member"])
      ? data["hydra:member"]
      : Array.isArray(data)
      ? data
      : [];
    const ids = arr
      .map((r: any) => r?.formation_id ?? r?.formationId ?? r?.formation?.id)
      .filter((x: any) => typeof x === "number");
    return Array.from(new Set(ids));
  } catch {
    return [];
  }
}

export async function checkAlreadyRegistered(
  formationId: number,
  userKey: string | null
): Promise<boolean> {
  try {
    const mine = await listMyFormationIds();
    if (mine.includes(formationId)) return true;
  } catch {}
  const rows = readLocal();
  if (userKey) {
    return rows.some((r) => r.k === userKey && r.fid === formationId);
  }
  return false;
}

export function markRegisteredLocal(
  formationId: number,
  userKey: string | null
) {
  const rows = readLocal();
  if (userKey && !rows.some((r) => r.k === userKey && r.fid === formationId)) {
    rows.push({ k: userKey, fid: formationId });
    writeLocal(rows);
  }
}

export async function createRegistration(payload: any) {
  try {
    const { data } = await http.post("/public/registrations", payload);
    return data;
  } catch (e: any) {
    try {
      const { data } = await http.post("/public/registrations", payload);
      return data;
    } catch (err) {
      throw err || e;
    }
  }
}

export type AdminRegistrationRow = {
  id: number;
  formation_id?: number;
  formation_title?: string | null;
  participant: string; // "Prénom Nom"
  email?: string | null;
  phone?: string | null;
  status: string; // raw: "pending" | "confirmed" | "cancelled" | ...
  status_label: string; // "En attente" | "Confirmé" | "Annulé" | autre
  session_format?: "presentiel" | "distanciel" | null;
  session_format_label: string; // "Présentiel" | "En ligne" | "—"
  created_at: string; // ISO date
  lu: boolean; // true si read_at présent (déjà consulté)
};

function _pickList<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload["hydra:member"])) return payload["hydra:member"];
  return [];
}

function _adaptAdminRow(r: any): AdminRegistrationRow {
  const statusRaw = String(r?.status ?? "").toLowerCase();
  const status_label =
    statusRaw === "confirmed"
      ? "Confirmé"
      : statusRaw === "pending"
      ? "En attente"
      : statusRaw === "cancelled"
      ? "Annulé"
      : r?.status ?? "—";

  const fmt = String(r?.session_format ?? "").toLowerCase();
  const session_format_label =
    fmt === "presentiel"
      ? "Présentiel"
      : fmt === "distanciel"
      ? "En ligne"
      : "—";

  const first =
    r?.first_name ??
    r?.user?.first_name ??
    (r?.user?.name ? String(r.user.name).split(" ")[0] : "") ??
    "";
  const last =
    r?.last_name ??
    r?.user?.last_name ??
    (r?.user?.name ? String(r.user.name).split(" ").slice(1).join(" ") : "") ??
    "";

  const participant =
    `${first} ${last}`.trim() || r?.participant || r?.user?.name || "—";

  return {
    id: Number(r?.id),
    formation_id: r?.formation_id ?? r?.formation?.id,
    formation_title: r?.formation?.title ?? r?.formation_title ?? null,
    participant,
    email: r?.email ?? r?.user?.email ?? null,
    phone: r?.phone ?? r?.user?.phone ?? null,
    status: r?.status ?? "",
    status_label,
    session_format: r?.session_format ?? null,
    session_format_label,
    created_at: r?.created_at ?? r?.createdAt ?? new Date().toISOString(),
    lu: !!(r?.read_at ?? r?.readAt),
  };
}

export async function adminListRegistrations(params?: {
  formation_id?: number;
  q?: string;
  status?: string;
}): Promise<AdminRegistrationRow[]> {
  const { data } = await http.get("/admin/registrations", { params });
  const list = _pickList<any>(data).map(_adaptAdminRow);
  return list;
}

export async function adminMarkRegistrationRead(id: number): Promise<void> {
  try {
    await http.post(`/admin/registrations/${id}/mark-read`);
  } catch {
    //
  }
}
