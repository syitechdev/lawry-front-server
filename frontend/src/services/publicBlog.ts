import axios from "axios";

/** ---- Types ---- */
export type ArticleApi = {
  id: number;
  title: string;
  slug: string | null;
  status: string;
  excerpt?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  categoryIri?: string | null;
  categoryObj?: { id: number; name: string } | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  viewsCount?: number | null;
  categoryName?: string | null;
};

export type Article = {
  id: number;
  title: string;
  slug: string | null;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  categoryIri?: string | null;
  categoryObj?: { id: number; name: string } | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  viewsCount?: number;
};

type ListResponse = {
  items: Article[];
  total: number;
  page: number;
  perPage: number;
};

/** ---- Base URL ---- */
const baseURL =
  (import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/g, "") ||
    "http://127.0.0.1:8000") +
  "/" +
  (import.meta.env.VITE_API_PREFIX?.replace(/^\/+/g, "") || "api/v1");

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

/** ---- Helpers ---- */
const extractMembers = (data: any): any[] => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.["hydra:member"])) return data["hydra:member"];
  if (Array.isArray(data)) return data;
  return [];
};

const fromApi = (a: ArticleApi): Article => ({
  id: a.id,
  title: a.title,
  slug: a.slug ?? null,
  excerpt: (a.excerpt ?? "").toString(),
  content: (a.content ?? "").toString(),
  imageUrl: a.imageUrl ?? null,
  categoryIri: a.categoryIri ?? undefined,
  categoryObj: a.categoryObj ?? undefined,
  publishedAt: a.publishedAt ?? undefined,
  createdAt: a.createdAt ?? undefined,
  updatedAt: a.updatedAt ?? undefined,
  viewsCount: a.viewsCount ?? 0,
});

/** ---- API publique Blog ---- */
export const publicBlog = {
  async listPublic(page = 1, perPage = 12): Promise<ListResponse> {
    const { data } = await api.get("/blog", {
      params: { page, per_page: perPage },
    });

    const raw = extractMembers(data);
    const items = raw.map((r: ArticleApi) => fromApi(r));
    const total = typeof data?.total === "number" ? data.total : items.length;

    return {
      items,
      total,
      page: data?.page ?? page,
      perPage: data?.perPage ?? perPage,
    };
  },

  async showPublic(slugOrId: number | string): Promise<Article> {
    const { data } = await api.get(`/blog/${slugOrId}`);
    return fromApi(data as ArticleApi);
  },

  async trackView(id: number): Promise<void> {
    await api.post(`/blog/${id}/view`);
  },
};
