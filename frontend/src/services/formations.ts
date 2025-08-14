import { http } from "@/lib/http";

export type Formation = {
  id: number;
  "@id"?: string;
  code?: string;
  title: string;
  description?: string | null;
  price_cfa?: number;
  duration?: string;
  max_participants?: number;
  type?: "Présentiel" | "Webinaire" | "En ligne";
  date?: string;
  trainer?: string;
  active: boolean;
  category?: string | { "@id": string } | null;
  category_id?: number | null;
  categoryId?: number | null;
  created_at?: string;
  updated_at?: string;
};

type FormationList = {
  items: Formation[];
  total?: number;
  raw: any;
};

function parseIriId(iri?: string | null): number | null {
  if (typeof iri !== "string") return null;
  const m = iri.match(/\/(\d+)(\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
}

function fromApi(j: any): Formation {
  const id = typeof j.id === "number" ? j.id : parseIriId(j["@id"]) ?? 0;

  const price_cfa = j.price_cfa ?? j.priceCfa ?? undefined;
  const max_participants = j.max_participants ?? j.maxParticipants ?? undefined;
  const date = j.date ?? undefined;
  const created_at = j.created_at ?? j.createdAt ?? undefined;
  const updated_at = j.updated_at ?? j.updatedAt ?? undefined;
  const category = j.category ?? null;

  let category_id: number | null = null;
  if (typeof j.category_id === "number") category_id = j.category_id;
  else if (typeof j.categoryId === "number") category_id = j.categoryId;
  else if (typeof category === "string") category_id = parseIriId(category);
  else if (category && typeof category === "object" && category["@id"])
    category_id = parseIriId(category["@id"]);

  return {
    id,
    "@id": j["@id"],
    code: j.code,
    title: j.title,
    description: j.description ?? null,
    price_cfa,
    duration: j.duration,
    max_participants,
    type: j.type,
    date,
    trainer: j.trainer,
    active: !!j.active,
    category,
    category_id,
    categoryId: category_id,
    created_at,
    updated_at,
  };
}

function normalizeList(data: any): FormationList {
  if (data && Array.isArray(data["hydra:member"])) {
    return {
      items: data["hydra:member"].map(fromApi),
      total: data["hydra:totalItems"],
      raw: data,
    };
  }
  if (data && Array.isArray(data.member)) {
    return {
      items: data.member.map(fromApi),
      total: data.totalItems,
      raw: data,
    };
  }
  if (data?.data && Array.isArray(data.data)) {
    return {
      items: data.data.map(fromApi),
      total: data?.meta?.total,
      raw: data,
    };
  }
  if (Array.isArray(data)) {
    return { items: data.map(fromApi), total: data.length, raw: data };
  }
  return { items: [], total: 0, raw: data };
}

function iriForCategoryId(id: number) {
  return `/api/v1/categories/${id}`;
}

function toApiPayload(input: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    switch (k) {
      case "price_cfa":
        out["priceCfa"] = v;
        break;
      case "max_participants":
        out["maxParticipants"] = v;
        break;
      case "created_at":
        out["createdAt"] = v;
        break;
      case "updated_at":
        out["updatedAt"] = v;
        break;
      case "category_id":
      case "categoryId":
        out["category"] = v !== null ? iriForCategoryId(Number(v)) : null;
        break;
      default:
        out[k] = v;
    }
  }
  return out;
}

export const formations = {
  async list(params?: Record<string, any>): Promise<FormationList> {
    const { data } = await http.get("/formations", {
      params,
      headers: { Accept: "application/ld+json" },
    });
    return normalizeList(data);
  },

  async create(payload: Record<string, any>): Promise<Formation> {
    const body = toApiPayload(payload);
    if (payload.category_id && !body.category) {
      body.category = iriForCategoryId(Number(payload.category_id));
    }
    const { data } = await http.post("/formations", body, {
      headers: {
        "Content-Type": "application/ld+json",
        Accept: "application/ld+json",
      },
    });
    return fromApi(data);
  },

  async update(id: number, payload: Record<string, any>): Promise<Formation> {
    const body = toApiPayload(payload);
    if ("category_id" in payload && !("category" in body)) {
      body.category =
        payload.category_id !== null
          ? iriForCategoryId(Number(payload.category_id))
          : null;
    }
    const { data } = await http.patch(`/formations/${id}`, body, {
      headers: {
        "Content-Type": "application/merge-patch+json",
        Accept: "application/ld+json",
      },
    });
    return fromApi(data);
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/formations/${id}`);
  },

  async setActive(id: number, active: boolean) {
    const { data } = await http.patch(
      `/admin/formations/${id}/active`,
      { active },
      { headers: { "Content-Type": "application/json" } }
    );
    return fromApi(data);
  },
};
