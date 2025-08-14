import { http } from "@/lib/http";

export type PeriodAPI = "Mois" | "Année";

export interface PlanApi {
  "@id"?: string;
  id: number;
  code?: string;
  name: string;
  price_cfa: number;
  period: PeriodAPI;
  color: string;
  description?: string | null;
  features?: string[] | null;
  is_active?: boolean;
  is_popular?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Plan {
  id: number;
  code?: string;
  name: string;
  priceCfa: number;
  period: PeriodAPI;
  color: string;
  description?: string;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Couleurs: on reste en FR pour coller aux règles backend
const COLOR_TO_UI = (c: string) => c;
const COLOR_TO_API = (c: string) => c;

export function fromApi(p: any): Plan {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    priceCfa: p.price_cfa ?? p.priceCfa ?? 0,
    period: p.period,
    color: p.color,
    description: p.description ?? "",
    features: Array.isArray(p.features) ? p.features : [],
    isActive: p.is_active ?? p.isActive ?? false,
    isPopular: p.is_popular ?? p.isPopular ?? false,
    createdAt: p.createdAt ?? p.created_at,
    updatedAt: p.updatedAt ?? p.updated_at,
  };
}

export function toApi(p: Partial<Plan>): Partial<PlanApi> {
  const base: Partial<PlanApi> = {};
  if (p.name !== undefined) base.name = p.name;
  if (p.priceCfa !== undefined) base.price_cfa = p.priceCfa;
  if (p.period !== undefined) base.period = p.period;
  if (p.color !== undefined) base.color = COLOR_TO_API(p.color);
  if (p.description !== undefined) base.description = p.description ?? null;
  if (p.features !== undefined) base.features = p.features ?? [];
  if (p.isActive !== undefined) base.is_active = p.isActive;
  if (p.isPopular !== undefined) base.is_popular = p.isPopular;
  return base;
}

function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member; // API Platform Laravel
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"]; // Hydra
  if (Array.isArray(json.data)) return json.data; // fallback
  return [];
}

export function iriId(iri?: string): number | null {
  if (!iri || typeof iri !== "string") return null;
  const m = iri.match(/\/(\d+)(\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
}

function apiError(err: any, fallback: string) {
  const d = err?.response?.data;
  return (
    d?.detail ||
    d?.description ||
    d?.message ||
    d?.violations?.[0]?.message ||
    fallback
  );
}

export const plans = {
  async list(): Promise<{ items: Plan[] }> {
    try {
      const r = await http.get(`/plans`, {
        params: { "order[created_at]": "desc" },
      });
      const rows = extractMember(r.data).map((x: any) => fromApi(x));
      return { items: rows };
    } catch (err: any) {
      throw new Error(apiError(err, "Impossible de charger les plans"));
    }
  },

  async get(idOrIri: number | string): Promise<Plan> {
    try {
      const url =
        typeof idOrIri === "string" && idOrIri.startsWith("/api/")
          ? idOrIri
          : `/plans/${idOrIri}`;
      const r = await http.get(url);
      return fromApi(r.data);
    } catch (err: any) {
      throw new Error(apiError(err, "Impossible de charger le plan"));
    }
  },

  async create(payload: Partial<Plan>): Promise<Plan> {
    try {
      const body = toApi(payload);
      const r = await http.post(`/plans`, body, {
        // API Platform POST => JSON-LD
        headers: { "Content-Type": "application/ld+json" },
      });
      return fromApi(r.data);
    } catch (err: any) {
      throw new Error(apiError(err, "Création du plan impossible"));
    }
  },

  async update(id: number, patch: Partial<Plan>): Promise<Plan> {
    try {
      const body = toApi(patch);
      const r = await http.patch(`/plans/${id}`, body, {
        // API Platform PATCH => merge-patch
        headers: { "Content-Type": "application/merge-patch+json" },
      });
      return fromApi(r.data);
    } catch (err: any) {
      throw new Error(apiError(err, "Mise à jour du plan impossible"));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await http.delete(`/plans/${id}`);
    } catch (err: any) {
      throw new Error(apiError(err, "Suppression impossible"));
    }
  },

  async setActive(id: number, isActive: boolean): Promise<void> {
    try {
      await http.patch(
        `/admin/plans/${id}/active`,
        { is_active: isActive },
        { headers: { Accept: "application/json" } }
      );
    } catch (err: any) {
      throw new Error(apiError(err, "Échec de la mise à jour du statut"));
    }
  },

  async setPopular(id: number, isPopular: boolean): Promise<void> {
    try {
      await http.patch(
        `/admin/plans/${id}/popular`,
        { is_popular: isPopular },
        { headers: { Accept: "application/json" } }
      );
    } catch (err: any) {
      throw new Error(apiError(err, "Échec de la mise à jour populaire"));
    }
  },
};
