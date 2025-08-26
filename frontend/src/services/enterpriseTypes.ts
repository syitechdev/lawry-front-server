import { http } from "@/lib/http";

export type EnterpriseTypeApi = {
  "@id"?: string;
  id?: number;
  sigle: string;
  signification: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  offers_count?: number;
  offres_count?: number;
  offersCount?: number;
};

export type EnterpriseType = {
  id: number;
  sigle: string;
  signification: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  offersCount?: number;
};

function iriId(iri?: string): number | null {
  if (!iri) return null;
  const m = iri.match(/\/(\d+)(\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
}

function pickOffersCount(j: any): number | undefined {
  const a = j?.offers_count,
    b = j?.offres_count,
    c = j?.offersCount;
  const val =
    typeof a === "number"
      ? a
      : typeof b === "number"
      ? b
      : typeof c === "number"
      ? c
      : undefined;
  return typeof val === "number" && val >= 0 ? val : undefined;
}

function fromApi(j: any): EnterpriseType {
  const id = typeof j.id === "number" ? j.id : iriId(j["@id"]) ?? 0;
  return {
    id,
    sigle: j.sigle ?? "",
    signification: j.signification ?? "",
    description: j.description ?? "",
    createdAt: j.createdAt ?? j.created_at,
    updatedAt: j.updatedAt ?? j.updated_at,
    offersCount: pickOffersCount(j),
  };
}

function toApi(p: Partial<EnterpriseType>): Partial<EnterpriseTypeApi> {
  const body: Partial<EnterpriseTypeApi> = {};
  if (p.sigle !== undefined) body.sigle = p.sigle.toUpperCase();
  if (p.signification !== undefined) body.signification = p.signification;
  if (p.description !== undefined) body.description = p.description ?? null;
  return body;
}

function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json.items)) return json.items;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
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

async function counts(): Promise<Record<number, number>> {
  const r = await http.get(`/admin/enterprise-types/offers-counts`, {
    headers: { Accept: "application/json" },
  });
  const rows = extractMember(r.data);
  const map: Record<number, number> = {};
  for (const j of rows) {
    const id = typeof j.id === "number" ? j.id : iriId(j["@id"]) ?? null;
    const c = pickOffersCount(j);
    if (id) map[id] = c ?? 0;
  }
  return map;
}

export const enterpriseTypes = {
  async list(): Promise<{ items: EnterpriseType[] }> {
    try {
      const r = await http.get(`/enterprise_types`, {
        headers: { Accept: "application/ld+json" },
      });
      let rows: EnterpriseType[] = extractMember(r.data).map(fromApi);
      try {
        const c = await counts();
        rows = rows.map((it) => ({
          ...it,
          offersCount: c[it.id] ?? it.offersCount ?? 0,
        }));
      } catch {}
      return { items: rows };
    } catch (err: any) {
      throw new Error(
        apiError(err, "Impossible de charger les types d’entreprise")
      );
    }
  },

  async create(payload: Partial<EnterpriseType>): Promise<EnterpriseType> {
    try {
      const r = await http.post(`/enterprise_types`, toApi(payload), {
        headers: { "Content-Type": "application/ld+json" },
      });
      return fromApi(r.data);
    } catch (err: any) {
      throw new Error(apiError(err, "Création impossible"));
    }
  },

  async update(
    id: number,
    patch: Partial<EnterpriseType>
  ): Promise<EnterpriseType> {
    try {
      const r = await http.patch(`/enterprise_types/${id}`, toApi(patch), {
        headers: { "Content-Type": "application/merge-patch+json" },
      });
      return fromApi(r.data);
    } catch (err: any) {
      throw new Error(apiError(err, "Mise à jour impossible"));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await http.delete(`/enterprise_types/${id}`);
    } catch (err: any) {
      throw new Error(apiError(err, "Suppression impossible"));
    }
  },

  counts,
};
