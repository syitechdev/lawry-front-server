import { http } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth";

export type DemandeListItem = {
  ref: string;
  type?: { slug: string; name?: string };
  status: string;
  priority?: string;
  is_read?: boolean;
  currency?: string;
  paid_status?: string;
  paid_amount?: number | null;
  data?: any;
  meta?: any;
  submitted_at?: string;
  created_at?: string;
  files?: any[];
  assignee?: { id: number; name: string; email?: string } | null;
  author?: { id: number; name: string; email?: string } | null;
};

export async function listAdminDemandes(params: {
  page?: number;
  per_page?: number;
  q?: string;
  type?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  unread?: boolean | string;
  date_from?: string;
  date_to?: string;
}) {
  const { data } = await http.get("/admin/demandes", { params });

  const items: DemandeListItem[] = (data?.data ?? []).map((x: any) => ({
    ref: x.ref,
    type: x.type,
    status: x.status,
    priority: x.priority,
    is_read: x.is_read,
    currency: x.currency,
    paid_status: x.paid_status,
    paid_amount: x.paid_amount,
    data: x.data,
    meta: x.meta,
    submitted_at: x.submitted_at,
    created_at: x.created_at,
    files: x.files,
    assignee: x.assignee,
    author: x.author,
  }));

  return { data: items, links: data.links, meta: data.meta };
}

export async function getUnreadCount(params?: { q?: string }) {
  const { data } = await http.get("/admin/demandes/unread-count", { params });
  return Number(data?.unread ?? 0);
}

export async function getAdminDemande(ref: string) {
  const { data } = await http.get(`/admin/demandes/${encodeURIComponent(ref)}`);
  return data as any;
}

export async function markRead(ref: string) {
  try {
    await http.post(`/admin/demandes/${encodeURIComponent(ref)}/mark-read`);
  } catch {}
}

export type UploadPayload = { files: File[]; tag?: string };

export async function uploadAdminFiles(
  ref: string,
  files: { annexes?: File[] }
) {
  const fd = new FormData();
  (files.annexes ?? []).forEach((f) => fd.append("files[annexes][]", f));
  await http.post(`/admin/demandes/${encodeURIComponent(ref)}/files`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function postAdminMessage(
  ref: string,
  body: string,
  is_internal = false
) {
  await http.post(`/admin/demandes/${encodeURIComponent(ref)}/messages`, {
    body,
    is_internal,
  });
}

export async function assignDemande(ref: string, userId?: number) {
  const me = getCurrentUser();
  const uid = userId ?? me?.id;
  if (!uid) throw new Error("user_id manquant");
  return http.post(`/admin/demandes/${encodeURIComponent(ref)}/assign`, {
    user_id: uid,
  });
}

export async function searchAdminUsers(q: string) {
  const { data } = await http.get("/admin/users", {
    params: { role: "admin", q },
  });
  return (data?.data ?? []) as Array<{
    id: number;
    name: string;
    email?: string;
  }>;
}

export async function setPriority(ref: string, priority: "urgent" | "normal") {
  const { data } = await http.patch(
    `/admin/demandes/${encodeURIComponent(ref)}/priority`,
    { priority }
  );
  return data as { ok: boolean; priority: "urgent" | "normal" };
}

export const STATUS_VALUE = {
  recu: "recu",
  enCours: "en-cours",
  enAttenteClient: "en-attente-client",
  enRevision: "en-revision",
  termine: "termine",
  annule: "annule",
} as const;

export async function changeStatus(ref: string, status: string, note?: string) {
  await http.post(`/admin/demandes/${encodeURIComponent(ref)}/status`, {
    status,
    note,
  });
}
