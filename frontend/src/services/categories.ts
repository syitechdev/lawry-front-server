import { http as _http } from "@/lib/http";

export type Category = {
  id: number;
  "@id"?: string;
  name: string; // affichage
  title?: string; // si l’API expose 'title'
};

type CategoryList = {
  items: Category[];
  total?: number;
  raw: any;
};

function parseIriId2(iri?: string | null): number | null {
  if (typeof iri !== "string") return null;
  const m = iri.match(/\/(\d+)(\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
}

function fromApiCat(j: any): Category {
  const id = typeof j.id === "number" ? j.id : parseIriId2(j["@id"]) ?? 0;

  const name = j.name ?? j.title ?? j.label ?? `Catégorie #${id}`;

  return { id, "@id": j["@id"], name, title: j.title };
}

function normalizeListCat(data: any): CategoryList {
  if (data && Array.isArray(data["hydra:member"])) {
    return {
      items: data["hydra:member"].map(fromApiCat),
      total: data["hydra:totalItems"],
      raw: data,
    };
  }
  if (data && Array.isArray(data.member)) {
    return {
      items: data.member.map(fromApiCat),
      total: data.totalItems,
      raw: data,
    };
  }
  if (data?.data && Array.isArray(data.data)) {
    return {
      items: data.data.map(fromApiCat),
      total: data?.meta?.total,
      raw: data,
    };
  }
  if (Array.isArray(data)) {
    return { items: data.map(fromApiCat), total: data.length, raw: data };
  }
  return { items: [], total: 0, raw: data };
}

export const categories = {
  async list(params?: Record<string, any>): Promise<CategoryList> {
    const { data } = await _http.get("/categories", {
      params,
      headers: { Accept: "application/ld+json" },
    });
    return normalizeListCat(data);
  },
};
