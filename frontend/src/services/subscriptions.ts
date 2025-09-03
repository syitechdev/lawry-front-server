import { http } from "@/lib/http";

export type SubscriptionStatus = "active" | "inactive" | "pending" | "expired";

export interface PlanSubscriptionSummary {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

export interface PlanSubscriber {
  id: number;
  userId: number;
  name: string;
  email: string;
  status: SubscriptionStatus;
  startedAt?: string | null;
  endsAt?: string | null;
}

type ListParams = {
  page?: number;
  perPage?: number;
  q?: string;
  status?: SubscriptionStatus | "all";
};

function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json.data)) return json.data;
  return Array.isArray(json) ? json : [];
}

function getTotal(json: any): number | undefined {
  // Essaye Hydra et formats communs
  return json?.["hydra:totalItems"] ?? json?.total ?? json?.meta?.total ?? undefined;
}

function apiError(err: any, fallback: string) {
  const d = err?.response?.data;
  return d?.detail || d?.description || d?.message || d?.violations?.[0]?.message || fallback;
}

export async function getPlanSubscriptionSummary(planId: number): Promise<PlanSubscriptionSummary> {
  // 1) Endpoint dédié si dispo
  try {
    const r = await http.get(`/admin/plans/${planId}/subscriptions/summary`, { headers: { Accept: "application/json" } });
    const d = r.data || {};
    return {
      total: Number(d.total ?? 0),
      active: Number(d.active ?? 0),
      inactive: Number(d.inactive ?? 0),
      pending: Number(d.pending ?? 0),
    };
  } catch (_) {
    // continue
  }


  try {
    const base = `/admin/plans/${planId}/subscriptions`;
    const common = { headers: { Accept: "application/json" } };

    const rTotal = await http.get(base, { params: { perPage: 1 }, ...common });
    const total = Number(getTotal(rTotal.data) ?? extractMember(rTotal.data).length ?? 0);

    const [rActive, rPending] = await Promise.all([
      http.get(base, { params: { perPage: 1, status: "active" }, ...common }),
      http.get(base, { params: { perPage: 1, status: "pending" }, ...common }),
    ]);

    const active = Number(getTotal(rActive.data) ?? 0);
    const pending = Number(getTotal(rPending.data) ?? 0);
    const inactive = Math.max(total - active - pending, 0);

    return { total, active, inactive, pending };
  } catch (err: any) {
    // En cas d’échec, on renvoie 0 partout (UI déverrouillée)
    return { total: 0, active: 0, inactive: 0, pending: 0 };
  }
}

export async function listPlanSubscribers(
  planId: number,
  { page = 1, perPage = 10, q = "", status = "all" }: ListParams = {}
): Promise<{ items: PlanSubscriber[]; total: number }> {
  try {
    const r = await http.get(`/admin/plans/${planId}/subscriptions`, {
      params: {
        page,
        perPage,
        q: q || undefined,
        status: status === "all" ? undefined : status,
      },
      headers: { Accept: "application/json" },
    });

    const rows = extractMember(r.data).map((x: any) => ({
      id: x.id,
      userId: x.user_id ?? x.userId ?? x.user?.id,
      name: x.user_name ?? x.userName ?? x.user?.name ?? "—",
      email: x.user_email ?? x.userEmail ?? x.user?.email ?? "—",
      status: (x.status as SubscriptionStatus) ?? "inactive",
      startedAt: x.started_at ?? x.startedAt ?? null,
      endsAt: x.ends_at ?? x.endsAt ?? null,
    })) as PlanSubscriber[];

    const total = Number(getTotal(r.data) ?? rows.length);
    return { items: rows, total };
  } catch (err: any) {
    throw new Error(apiError(err, "Impossible de charger les abonnés"));
  }
}
