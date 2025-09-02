import { http as _http } from "@/lib/http";

export type Category = {
  id: number;
  "@id"?: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  return {
    id,
    "@id": j["@id"],
    name: j.name ?? j.title ?? j.label ?? `Catégorie #${id}`,
    slug: j.slug ?? null,
    description: j.description ?? null,
    createdAt: j.createdAt ?? j.created_at,
    updatedAt: j.updatedAt ?? j.updated_at,
  };
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

export const categories = {
  async list(params?: Record<string, any>): Promise<CategoryList> {
    try {
      const { data } = await _http.get(`/categories`, {
        params,
        headers: { Accept: "application/ld+json" },
      });
      return normalizeListCat(data);
    } catch (err: any) {
      throw new Error(apiError(err, "Impossible de charger les catégories"));
    }
  },

  async get(idOrIri: number | string): Promise<Category> {
    try {
      let url: string;
      let extra: any = {};

      if (typeof idOrIri === "string") {
        if (idOrIri.startsWith("/api/")) {
          // essaie d’extraire l’ID de l’IRI (tu as déjà parseIriId2 dans ce fichier)
          const id = parseIriId2(idOrIri);
          if (id) {
            url = `/categories/${id}`;
          } else {
            // fallback: construit une URL absolue et neutralise baseURL d’Axios
            const base =
              (_http.defaults as any)?.baseURL || window.location.origin;
            const origin = new URL(base);
            url = `${origin.origin}${idOrIri}`;
            extra.baseURL = undefined;
          }
        } else {
          url = `/categories/${idOrIri}`;
        }
      } else {
        url = `/categories/${idOrIri}`;
      }

      const { data } = await _http.get(url, {
        ...extra,
        headers: { Accept: "application/ld+json" },
      });
      return fromApiCat(data);
    } catch (err: any) {
      throw new Error(apiError(err, "Impossible de charger la catégorie"));
    }
  },
  async create(payload: Partial<Category>): Promise<Category> {
    try {
      const body: any = {};
      if (payload.name !== undefined) body.name = payload.name;
      if (payload.description !== undefined)
        body.description = payload.description ?? null;

      const { data } = await _http.post(`/categories`, body, {
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
      });
      return fromApiCat(data);
    } catch (err: any) {
      throw new Error(apiError(err, "Création de la catégorie impossible"));
    }
  },

  async update(id: number, patch: Partial<Category>): Promise<Category> {
    try {
      const body: any = {};
      if (patch.name !== undefined) body.name = patch.name;
      if (patch.description !== undefined)
        body.description = patch.description ?? null;

      const { data } = await _http.patch(`/categories/${id}`, body, {
        headers: {
          "Content-Type": "application/merge-patch+json",
          Accept: "application/ld+json",
        },
      });
      return fromApiCat(data);
    } catch (err: any) {
      throw new Error(apiError(err, "Mise à jour de la catégorie impossible"));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await _http.delete(`/categories/${id}`, {
        headers: { Accept: "application/ld+json" },
      });
    } catch (err: any) {
      throw new Error(apiError(err, "Suppression de la catégorie impossible"));
    }
  },
};
