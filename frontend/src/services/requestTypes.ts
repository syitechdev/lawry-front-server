import { http } from "@/lib/http";

export type VariantCard = {
  key: string;
  title: string;
  subtitle?: string | null;
  pricing_mode: "fixed" | "from" | "quote";
  price_amount?: number | null;
  currency?: string | null;
  features?: string[];
  cta?: string;
  active?: boolean;
  pill?: string | null;
};

export type RequestType = {
  id: number;
  name: string;
  slug: string;
  version?: number;
  is_active: boolean;
  pricing_mode?: "fixed" | "from" | "quote" | null;
  price_amount?: number | null;
  currency?: string | null;
  variants_csv?: string | null;
  features_csv?: string | null;
  variants?: string[];
  features?: string[];
  price_display?: string;
  demandes_count?: number;
  locked?: boolean;
  config?: {
    variant_cards?: VariantCard[];
    order?: string[];
    [k: string]: any;
  } | null;
};

const baseAdmin = "/admin/request-types";
const basePublic = "/request-types"; // route publique existante

function extractList(payload: any): RequestType[] {
  if (Array.isArray(payload)) return payload as RequestType[];
  if (payload && Array.isArray(payload["hydra:member"]))
    return payload["hydra:member"] as RequestType[];
  if (payload && Array.isArray(payload.items))
    return payload.items as RequestType[];
  if (payload && Array.isArray(payload.data))
    return payload.data as RequestType[];
  return [];
}

async function list(params?: Record<string, any>): Promise<RequestType[]> {
  const { data } = await http.get(baseAdmin, { params });
  return extractList(data);
}

async function get(id: number): Promise<RequestType> {
  const { data } = await http.get(`${baseAdmin}/${id}`);
  return data as RequestType;
}

async function getBySlug(slug: string): Promise<RequestType | null> {
  // 1) endpoint PUBLIC (disponible dans tes routes)
  try {
    const { data } = await http.get(
      `${basePublic}/slug/${encodeURIComponent(slug)}`
    );
    if (data?.slug === slug) return data as RequestType;
  } catch {}

  // 2) si tu ajoutes plus tard une route ADMIN /admin/request-types/slug/{slug}
  try {
    const { data } = await http.get(
      `${baseAdmin}/slug/${encodeURIComponent(slug)}`
    );
    if (data?.slug === slug) return data as RequestType;
  } catch {}

  // 3) fallback admin via ?slug=
  try {
    const { data } = await http.get(baseAdmin, { params: { slug } });
    const arr = extractList(data);
    if (arr.length) {
      return arr.find((r) => r.slug === slug) ?? arr[0];
    }
  } catch {}

  // 4) dernier fallback : liste + filtre front
  const items = await list();
  return items.find((r) => r.slug === slug) ?? null;
}

async function putConfig(
  id: number,
  config: Record<string, any>
): Promise<RequestType> {
  try {
    const res = await http.patch(`${baseAdmin}/${id}/config`, { config });
    const data = res?.data;
    if (data && Object.keys(data).length > 0) return data as RequestType;
    return await get(id);
  } catch (e: any) {
    const current = await get(id);

    const payload: any = {
      name: current.name,
      slug: current.slug,
      version: current.version ?? 1,
      is_active: current.is_active,
      pricing_mode: current.pricing_mode ?? null,
      price_amount: current.price_amount ?? null,
      currency: current.currency ?? "XOF",
      variants_csv: current.variants_csv ?? null,
      features_csv: current.features_csv ?? null,
      config,
    };

    delete payload.id;
    delete payload.demandes_count;
    delete payload.price_display;
    delete payload.locked;

    const { data } = await http.put(`${baseAdmin}/${id}`, payload, {
      headers: { "Content-Type": "application/ld+json" },
    });
    return data as RequestType;
  }
}

export const requestTypes = {
  list,
  get,
  getBySlug,
  putConfig,
};
