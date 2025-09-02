import { http } from "@/lib/http";

/** Périodes canons utilisées côté UI */
export type PeriodUI = "Mois" | "Année";

/** Valeurs FR autorisées côté back (ALLOWED_COLORS) */
const ALLOWED_COLORS = [
  "Bleu",
  "Vert",
  "Rouge",
  "Jaune",
  "Violet",
  "Orange",
  "Gris",
  "Noir",
  "Blanc",
  "Cyan",
  "Rose",
] as const;
export type ColorFR = (typeof ALLOWED_COLORS)[number];

/** --------- Types API (back) --------- */
export interface PlanApi {
  "@id"?: string;
  id: number;
  slug?: string;
  code?: string;

  // Tarifs
  monthly_price_cfa?: number | null;
  yearly_price_cfa?: number | null;
  price_cfa?: number | null; // legacy (converti par la FormRequest)
  period?: string | null;

  // Flags
  is_trial?: boolean;
  trial_days?: number | null;
  is_active?: boolean;
  is_popular?: boolean;

  // Présentation
  name: string;
  color?: string | null; // FR
  description?: string | null;
  features?: string[] | null;
  gradient_from?: string | null;
  gradient_to?: string | null;
  sort_index?: number | null;

  created_at?: string;
  updated_at?: string;
}

/** --------- Types UI (front) --------- */
export interface Plan {
  id: number;
  slug?: string;
  code?: string;

  // Tarifs (toujours présents côté UI)
  monthlyPriceCfa: number; // 0 si non défini
  yearlyPriceCfa: number; // 0 si non défini
  /** Période « active » d’affichage si un seul prix est défini */
  period?: PeriodUI | null;

  // Flags
  isTrial: boolean;
  trialDays?: number | null;
  isActive: boolean;
  isPopular: boolean;

  // Présentation
  name: string;
  color: ColorFR; // toujours une valeur autorisée
  description?: string;
  features: string[];
  gradientFrom: string;
  gradientTo: string;
  sortIndex?: number | null;

  createdAt?: string;
  updatedAt?: string;
}

function normalizeColorFR(input?: string | null): ColorFR {
  const val = (input ?? "").trim();
  const found = ALLOWED_COLORS.find(
    (c) => c.toLowerCase() === val.toLowerCase()
  );
  return (found ?? "Gris") as ColorFR; // défaut doux
}

function normalizePeriod(p?: string | null): PeriodUI | null {
  if (!p) return null;
  const s = p.toLowerCase();
  const isMonthly = [
    "mois",
    "mensuel",
    "mensuelle",
    "month",
    "m",
    "mensual",
    "monthly",
  ].includes(s);
  const isYearly = [
    "annee",
    "année",
    "annuel",
    "annuelle",
    "year",
    "a",
    "yearly",
  ].includes(s);
  if (isMonthly) return "Mois";
  if (isYearly) return "Année";
  return null;
}

export function fromApi(src: any): Plan {
  const monthly = Number(src.monthly_price_cfa ?? 0) || 0;
  const yearly = Number(src.yearly_price_cfa ?? 0) || 0;

  let period: PeriodUI | null = null;
  if (monthly > 0 && yearly === 0) period = "Mois";
  if (yearly > 0 && monthly === 0) period = "Année";
  if (monthly === 0 && yearly === 0) {
    const legacyPrice = Number(src.price_cfa ?? 0) || 0;
    const legacyPeriod = normalizePeriod(src.period ?? null);
    if (legacyPrice > 0 && legacyPeriod) {
      if (legacyPeriod === "Mois") {
        src.monthly_price_cfa = legacyPrice;
      } else {
        src.yearly_price_cfa = legacyPrice;
      }
      if (!monthly && !yearly) period = legacyPeriod;
    }
  }

  return {
    id: Number(src.id),
    slug: src.slug ?? undefined,
    code: src.code ?? undefined,

    monthlyPriceCfa: Number(src.monthly_price_cfa ?? 0) || 0,
    yearlyPriceCfa: Number(src.yearly_price_cfa ?? 0) || 0,
    period: period ?? normalizePeriod(src.period ?? null),

    isTrial: Boolean(src.is_trial ?? false),
    trialDays: src.trial_days ?? null,
    isActive: Boolean(src.is_active ?? false),
    isPopular: Boolean(src.is_popular ?? false), //

    name: String(src.name ?? ""),
    color: normalizeColorFR(src.color ?? null),
    description: src.description ?? undefined,
    features: Array.isArray(src.features) ? src.features : [],
    gradientFrom: String(src.gradient_from ?? "from-blue-500"),
    gradientTo: String(src.gradient_to ?? "to-blue-600"),
    sortIndex: src.sort_index ?? null,

    createdAt: src.createdAt ?? src.created_at,
    updatedAt: src.updatedAt ?? src.updated_at,
  };
}

export function toApi(p: Partial<Plan>): Partial<PlanApi> {
  const out: Partial<PlanApi> = {};

  if (p.name !== undefined) out.name = p.name;
  if (p.slug !== undefined) out.slug = p.slug;
  if (p.code !== undefined) out.code = p.code;

  if (p.monthlyPriceCfa !== undefined)
    out.monthly_price_cfa = Number(p.monthlyPriceCfa) || 0;
  if (p.yearlyPriceCfa !== undefined)
    out.yearly_price_cfa = Number(p.yearlyPriceCfa) || 0;

  if (
    p.period &&
    p.monthlyPriceCfa === undefined &&
    p.yearlyPriceCfa === undefined
  ) {
    //
    //
  }

  if (p.isTrial !== undefined) out.is_trial = !!p.isTrial;
  if (p.trialDays !== undefined) out.trial_days = p.trialDays ?? null;

  if (p.isActive !== undefined) out.is_active = !!p.isActive;
  if (p.isPopular !== undefined) out.is_popular = !!p.isPopular;

  if (p.color !== undefined) out.color = normalizeColorFR(p.color);
  if (p.description !== undefined) out.description = p.description ?? null;
  if (p.features !== undefined) out.features = p.features ?? [];

  if (p.gradientFrom !== undefined) out.gradient_from = p.gradientFrom ?? null;
  if (p.gradientTo !== undefined) out.gradient_to = p.gradientTo ?? null;
  if (p.sortIndex !== undefined) out.sort_index = p.sortIndex ?? null;

  return out;
}

function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json.data)) return json.data;
  return Array.isArray(json) ? json : [];
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
      const r = await http.post(`/plans`, toApi(payload), {
        headers: { "Content-Type": "application/ld+json" },
      });
      return fromApi(r.data);
    } catch (err: any) {
      throw new Error(apiError(err, "Création du plan impossible"));
    }
  },

  async update(id: number, patch: Partial<Plan>): Promise<Plan> {
    try {
      const r = await http.patch(`/plans/${id}`, toApi(patch), {
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
