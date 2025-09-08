import { http } from "@/lib/http";

export type ArticleStatus = "draft" | "published";

export interface CategoryApi {
  "@id"?: string;
  id: number;
  name: string;
}

export interface ArticleApi {
  "@id"?: string;
  id: number;
  title: string;
  slug?: string | null;
  status: ArticleStatus;
  excerpt?: string | null;
  content: string;
  imageUrl?: string | null;
  image_url?: string | null;
  category?: string | CategoryApi | null;   // API Platform
  category_id?: number | null;              // Public controller
  categoryObj?: CategoryApi | null;         // Public controller
  // dates
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  viewsCount?: number;                      // Public controller
}

export interface Article {
  "@id"?: string;
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  categoryIri: string | null;
  categoryObj?: { id: number; name: string } | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
  viewsCount?: number | null;
}

function backendOrigin(): string {
  try {
    const base = (http.defaults as any)?.baseURL || window.location.origin;
    const u = new URL(base);
    return `${u.protocol}//${u.host}`;
  } catch {
    return window.location.origin;
  }
}

function normalizeAssetUrl(u?: string | null): string | null {
  if (!u) return null;
  try {
    const url = new URL(u, backendOrigin());
    const back = new URL(backendOrigin());
    if (url.hostname === "localhost" && url.port === "" && back.port) {
      url.port = back.port;
    }
    return url.toString();
  } catch {
    return u;
  }
}

function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json.data)) return json.data;
  return [];
}

/** mapping commun (API Platform & contrôleur public) */
function fromApi(a: ArticleApi): Article {
  const img = normalizeAssetUrl(a.imageUrl ?? a.image_url ?? null);

  let catIri: string | null = null;
  let catObj: { id: number; name: string } | null = null;

  // ✅ priorité categoryObj si dispo
  const catFromObj = a.categoryObj;
  if (catFromObj && typeof catFromObj === "object") {
    catObj = { id: catFromObj.id, name: catFromObj.name };
    catIri = `/api/categories/${catFromObj.id}`;
  } else if (typeof a.category === "string") {
    catIri = a.category;
  } else if (a.category && typeof a.category === "object") {
    const c = a.category as CategoryApi;
    catIri = c["@id"] || (c.id ? `/api/categories/${c.id}` : null);
    catObj = { id: c.id, name: c.name };
  } else if (a.category_id) {
    catIri = `/api/categories/${a.category_id}`;
  }

  return {
    "@id": (a as any)["@id"],
    id: a.id,
    title: a.title,
    slug: a.slug || "",
    status: a.status,
    excerpt: a.excerpt || "",
    content: a.content,
    imageUrl: img,
    categoryIri: catIri,
    categoryObj: catObj ?? undefined,
    publishedAt: a.publishedAt ?? a.published_at ?? null,
    createdAt: a.createdAt ?? a.created_at ?? null,
    updatedAt: a.updatedAt ?? a.updated_at ?? null,
    authorName: (a as any).authorName ?? null,
    viewsCount: a.viewsCount ?? null,
  };
}

// ---------- mapping UI -> API (admin) ----------
function toApi(p: Partial<Article>): any {
  const out: any = {};
  if (p.title !== undefined) out.title = p.title;
  if (p.status !== undefined) out.status = p.status;
  if (p.excerpt !== undefined) out.excerpt = p.excerpt || null;
  if (p.content !== undefined) out.content = p.content;
  if (p.imageUrl !== undefined) out.imageUrl = p.imageUrl || null;
  if (p.categoryIri !== undefined) out.category = p.categoryIri || null;
  if (p.publishedAt !== undefined) out.publishedAt = p.publishedAt || null;
  return out;
}

export const articlesApi = {
  // ==== PUBLIC (/api/v1) ====
  async listPublic(
    page = 1,
    perPage = 12
  ): Promise<{ items: Article[]; total: number; page: number; perPage: number }> {
    const { data } = await http.get(`/blog`, { params: { page, per_page: perPage } });
    const items = Array.isArray(data?.items)
      ? data.items.map((r: ArticleApi) => fromApi(r))
      : extractMember(data).map((r: ArticleApi) => fromApi(r));
    const total = typeof data?.total === "number" ? data.total : items.length;
    return { items, total, page, perPage };
  },

  async showPublic(slugOrId: number | string): Promise<Article> {
    const { data } = await http.get(`/blog/${slugOrId}`);
    return fromApi(data as ArticleApi);
  },

  async findBySlugPublic(slug: string): Promise<Article | null> {
    try {
      const { data } = await http.get(`/blog/${encodeURIComponent(slug)}`);
      return fromApi(data as ArticleApi);
    } catch {
      return null;
    }
  },

  // compteur de vues
  async trackView(id: number): Promise<void> {
    try {
      await http.post(`/blog/${id}/view`);
    } catch {
      /* ignore */
    }
  },

  // ==== ADMIN (API Platform Hydra) — inchangé ====
  async list(page = 1): Promise<{ items: Article[] }> {
    const { data } = await http.get(`/articles?page=${page}`, {
      headers: { Accept: "application/ld+json" },
    });
    const rows = extractMember(data).map((r: ArticleApi) => fromApi(r));
    return { items: rows };
  },

  async create(payload: Partial<Article>): Promise<Article> {
    const { data } = await http.post(`/articles`, toApi(payload), {
      headers: {
        Accept: "application/ld+json",
        "Content-Type": "application/ld+json",
      },
    });
    return fromApi(data);
  },

  async update(id: number, patch: Partial<Article>): Promise<Article> {
    const { data } = await http.patch(`/articles/${id}`, toApi(patch), {
      headers: {
        Accept: "application/ld+json",
        "Content-Type": "application/merge-patch+json",
      },
    });
    return fromApi(data);
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/articles/${id}`, {
      headers: { Accept: "application/ld+json" },
    });
  },

  async show(id: number | string): Promise<Article> {
    const url =
      typeof id === "string" && id.startsWith("/api/") ? id : `/articles/${id}`;
    const { data } = await http.get(url, {
      headers: { Accept: "application/ld+json" },
    });
    return fromApi(data);
  },

  async findBySlug(slug: string): Promise<Article | null> {
    const { data } = await http.get(`/articles`, {
      params: { slug, itemsPerPage: 1 },
      headers: { Accept: "application/ld+json" },
    });
    const rows = extractMember(data).map((r: ArticleApi) => fromApi(r));
    return rows[0] ?? null;
  },
};
