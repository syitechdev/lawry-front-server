import { http } from "@/lib/http";

export type ContractOffer = {
  id: string | number;
  slug?: string;
  title: string;
  description?: string;
  price_text?: string | null;
  features?: string[];
  is_active?: boolean;
  ui_index?: number;
};

function extractOffersFromRequestType(rt: any): ContractOffer[] {
  const pools: any[] = []
    .concat(rt?.offers ?? [])
    .concat(rt?.items ?? [])
    .concat(rt?.variants ?? [])
    .concat(rt?.services ?? [])
    .concat(rt?.plans ?? [])
    .concat(rt?.config?.offers ?? [])
    .concat(rt?.config?.items ?? [])
    .concat(rt?.meta?.offers ?? []);

  const arr = Array.isArray(pools) ? pools : [];

  if (arr.length === 0 && (rt?.name || rt?.title)) {
    return [
      {
        id: rt.id ?? rt.slug ?? "sur-mesure",
        slug: rt.slug ?? "sur-mesure",
        title: rt.title ?? rt.name ?? "Contrat sur mesure",
        description: rt.description ?? rt.summary ?? "",
        price_text: rt.price_text ?? null,
        features: rt.features ?? [],
        is_active: rt.is_active ?? true,
        ui_index: 0,
      },
    ];
  }

  return arr
    .map((o: any, idx: number) => ({
      id: o.id ?? o.uid ?? o.uuid ?? o.slug ?? idx,
      slug: o.slug ?? o.code ?? o.key ?? undefined,
      title: o.title ?? o.name ?? o.label ?? "Contrat",
      description: o.description ?? o.summary ?? "",
      price_text: o.price_text ?? (o.price ? `${o.price} FCFA` : null),
      features: o.features ?? o.benefits ?? o.points ?? [],
      is_active: o.is_active ?? true,
      ui_index: idx,
    }))
    .filter((o: ContractOffer) => o.is_active !== false);
}

export async function fetchOffersByRequestTypeSlug(
  slug: string
): Promise<ContractOffer[]> {
  const { data } = await http.get(`/request-types/slug/${slug}`);
  return extractOffersFromRequestType(data);
}

export async function fetchActiveContractOffers(): Promise<ContractOffer[]> {
  return fetchOffersByRequestTypeSlug("rediger-contrat");
}

export async function submitContractRequest(
  payload: Record<string, any>,
  files: File[],
  offer?: { id?: string | number | null; title?: string | null }
) {
  const fd = new FormData();
  fd.append("type_slug", "rediger-contrat");
  if (offer?.id) fd.append("offer_id", String(offer.id));
  if (offer?.title) fd.append("offer_title", String(offer.title));
  fd.append("payload", JSON.stringify(payload));
  files.forEach((file, i) => fd.append(`files[${i}]`, file, file.name));

  const { data } = await http.post("/demandes", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
