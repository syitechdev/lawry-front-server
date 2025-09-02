import { http } from "@/lib/http";

export type PeriodAPI = "Mois" | "Année";

export interface PlanApi {
  "@id"?: string;
  id: number;
  code?: string;
  name: string;
  slug?: string;
  monthly_price_cfa?: number;
  yearly_price_cfa?: number;
  is_trial?: boolean;
  trial_days?: number | null;
  color: string;
  description?: string | null;
  features?: string[] | null;
  gradient_from?: string | null;
  gradient_to?: string | null;
  is_active?: boolean;
  is_popular?: boolean;
  created_at?: string;
  updated_at?: string;
  price_cfa?: number;
  period?: string | null;
}

export interface Plan {
  id: number;
  code?: string;
  name: string;
  slug?: string;
  monthlyPriceCfa: number;
  yearlyPriceCfa: number;
  isTrial: boolean;
  trialDays: number | null;
  color: string;
  description?: string;
  features: string[];
  gradientFrom?: string | null;
  gradientTo?: string | null;
  isActive: boolean;
  isPopular: boolean;
  createdAt?: string;
  updatedAt?: string;
  priceCfa?: number;
  period?: PeriodAPI | null;
}

const COLOR_TO_UI = (c: string) => c;
const COLOR_TO_API = (c: string) => c;

function normalizePeriod(p?: string | null): PeriodAPI | null {
  if (!p) return null;
  const s = p.toLowerCase();
  if (
    ["mois", "mensuel", "mensuelle", "month", "m", "mensual", "monthly"].includes(
      s
    )
  )
    return "Mois";
  if (
    ["annee", "année", "annuel", "annuelle", "year", "a", "yearly"].includes(s)
  )
    return "Année";
  return null;
}

export function fromApi(p: any): Plan {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    slug: p.slug,

    monthlyPriceCfa: Number(p.monthly_price_cfa ?? p.monthlyPriceCfa ?? 0) || 0,
    yearlyPriceCfa: Number(p.yearly_price_cfa ?? p.yearlyPriceCfa ?? 0) || 0,

    isTrial: !!(p.is_trial ?? p.isTrial ?? false),
    trialDays: p.trial_days ?? p.trialDays ?? null,

    color: COLOR_TO_UI(p.color),
    description: p.description ?? "",
    features: Array.isArray(p.features) ? p.features : [],

    gradientFrom: p.gradient_from ?? p.gradientFrom ?? null,
    gradientTo: p.gradient_to ?? p.gradientTo ?? null,

    isActive: !!(p.is_active ?? p.isActive ?? false),
    isPopular: !!(p.is_popular ?? p.isPopular ?? false),

    createdAt: p.createdAt ?? p.created_at,
    updatedAt: p.updatedAt ?? p.updated_at,

    priceCfa: p.price_cfa ?? p.priceCfa ?? 0,
    period: normalizePeriod(p.period),
  };
}

export function toApi(p: Partial<Plan>): Partial<PlanApi> {
  const base: Partial<PlanApi> = {};
  if (p.name !== undefined) base.name = p.name;
  if (p.slug !== undefined) base.slug = p.slug;
  if (p.monthlyPriceCfa !== undefined)
    base.monthly_price_cfa = p.monthlyPriceCfa;
  if (p.yearlyPriceCfa !== undefined)
    base.yearly_price_cfa = p.yearlyPriceCfa;
  if (p.isTrial !== undefined) base.is_trial = p.isTrial;
  if (p.trialDays !== undefined) base.trial_days = p.trialDays;

  if (p.color !== undefined) base.color = COLOR_TO_API(p.color);
  if (p.description !== undefined) base.description = p.description ?? null;
  if (p.features !== undefined) base.features = p.features ?? [];
  if (p.gradientFrom !== undefined) base.gradient_from = p.gradientFrom;
  if (p.gradientTo !== undefined) base.gradient_to = p.gradientTo;

  if (p.isActive !== undefined) base.is_active = p.isActive;
  if (p.isPopular !== undefined) base.is_popular = p.isPopular;

  return base;
}

function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member; //
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"]; //
  if (Array.isArray(json.data)) return json.data; 
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
