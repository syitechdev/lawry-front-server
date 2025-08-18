import { http } from "@/lib/http";

export type ArticleStatus = "draft" | "published";

export interface CategoryApi {
  "@id": string;
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
  image_url?: string | null; // fallback si jamais
  category?: string | CategoryApi | null; // IRI ou objet
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
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

function fromApi(a: ArticleApi): Article {
  const img = normalizeAssetUrl(a.imageUrl ?? a.image_url ?? null);

  const catIri =
    typeof a.category === "string"
      ? a.category
      : a.category && typeof a.category === "object"
      ? (a.category as CategoryApi)["@id"] || null
      : null;

  const catObj =
    typeof a.category === "object" && a.category
      ? {
          id: (a.category as CategoryApi).id,
          name: (a.category as CategoryApi).name,
        }
      : null;

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
    categoryObj: catObj,
    publishedAt: a.publishedAt ?? null,
    createdAt: a.createdAt ?? null,
    updatedAt: a.updatedAt ?? null,
    authorName: (a as any).authorName ?? null,
  };
}

// ---------- mapping UI -> API ----------
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
};
