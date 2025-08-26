import { http } from "@/lib/http";

export interface AdminRequestType {
  id: number;
  name: string;
  slug: string;
  unread_count?: number;
}

/**
 * Liste tous les RequestType visibles côté admin.
 * Retourne toujours un tableau, même si l’API renvoie { data: [...] }.
 */
export async function listRequestTypes(): Promise<AdminRequestType[]> {
  const { data } = await http.get("/admin/request-types");
  const list: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];
  return list
    .filter((t) => t?.slug && t?.name)
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      unread_count: t.unread_count,
    }));
}

/** Compteur des demandes non lues (admin) */
export async function getUnreadDemandesCount(): Promise<number> {
  const { data } = await http.get("/admin/demandes/unread-count");
  const c = Number(data?.unread ?? 0);
  return Number.isFinite(c) ? c : 0;
}

/** Compteur des inscriptions non lues (admin) */
export async function getUnreadRegistrationsCount(): Promise<number> {
  const { data } = await http.get("/admin/registrations/unread-count");
  const c = Number(data?.count ?? 0);
  return Number.isFinite(c) ? c : 0;
}
