import { http } from "@/lib/http";

export type PublicOffer = {
  id: number;
  enterprise_type_id: number;
  key: string;
  title: string;
  subtitle?: string | null;
  is_active: boolean;
  pricing_mode: "fixed" | "from" | "quote";
  price_amount_abidjan?: number | null;
  price_amount_interior?: number | null;
  currency?: string | null;
  features?: string[];
  features_json?: string[];
  pill?: string | null;
  cta?: string | null;
  sort_index?: number | null;
  meta?: {
    options_with_price?: { label: string; price_text?: string | null }[];
  } | null;
};

type ApiResponse = { items?: PublicOffer[] } | PublicOffer[];

export async function getOffersBySigle(sigle: string): Promise<PublicOffer[]> {
  try {
    const { data } = await http.get(
      `/enterprise-types/${encodeURIComponent(sigle)}/offers`,
      { headers: { Accept: "application/json" } }
    );

    const list =
      (Array.isArray(data) && data) ||
      (Array.isArray(data?.offers) && data.offers) ||
      (Array.isArray(data?.items) && data.items) ||
      (Array.isArray((data as any)?.["hydra:member"]) &&
        (data as any)["hydra:member"]) ||
      [];

    return (list as any[]).filter(Boolean) as PublicOffer[];
  } catch (e: any) {
    if (e?.response?.status === 404) return [];
    return [];
  }
}
