import { http } from "@/lib/http";

export type EnterpriseTypeOffer = {
  id: number;
  enterprise_type_id: number;
  key: string;
  title: string;
  subtitle?: string | null;
  pill?: string | null;
  is_active: boolean;
  pricing_mode: "fixed" | "from" | "quote";
  price_amount_abidjan?: number | null;
  price_amount_interior?: number | null;
  currency?: string | null;
  features_json?: string[]; // backend renvoie array
  delivery_min_days?: number | null;
  delivery_max_days?: number | null;
  cta?: string | null;
  sort_index?: number | null;
  meta?: Record<string, any> | null;
};

function extractList(payload: any): EnterpriseTypeOffer[] {
  if (Array.isArray(payload)) return payload as EnterpriseTypeOffer[];
  if (payload && Array.isArray(payload["hydra:member"]))
    return payload["hydra:member"] as EnterpriseTypeOffer[];
  if (payload && Array.isArray(payload.items))
    return payload.items as EnterpriseTypeOffer[];
  if (payload && Array.isArray(payload.data))
    return payload.data as EnterpriseTypeOffer[];
  return [];
}

async function list(enterpriseTypeId: number): Promise<EnterpriseTypeOffer[]> {
  const { data } = await http.get(
    `/admin/enterprise-types/${enterpriseTypeId}/offers`,
    { headers: { Accept: "application/json" } }
  );
  return extractList(data);
}

type UpsertPayload = Partial<
  Omit<EnterpriseTypeOffer, "id" | "enterprise_type_id">
>;

async function create(
  enterpriseTypeId: number,
  payload: UpsertPayload
): Promise<EnterpriseTypeOffer> {
  const { data } = await http.post(
    `/admin/enterprise-types/${enterpriseTypeId}/offers`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return data as EnterpriseTypeOffer;
}

async function update(
  offerId: number,
  payload: UpsertPayload
): Promise<EnterpriseTypeOffer> {
  const { data } = await http.patch(
    `/admin/enterprise-type-offers/${offerId}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return data as EnterpriseTypeOffer;
}

async function remove(offerId: number): Promise<void> {
  await http.delete(`/admin/enterprise-type-offers/${offerId}`, {
    headers: { Accept: "application/json" },
  });
}

async function publish(offerId: number): Promise<void> {
  await http.post(
    `/admin/enterprise-type-offers/${offerId}/publish`,
    {},
    { headers: { Accept: "application/json" } }
  );
}

async function unpublish(offerId: number): Promise<void> {
  await http.post(
    `/admin/enterprise-type-offers/${offerId}/unpublish`,
    {},
    { headers: { Accept: "application/json" } }
  );
}

async function reorder(
  enterpriseTypeId: number,
  orderIds: number[]
): Promise<void> {
  const items = orderIds.map((id, idx) => ({ id, sort_index: idx }));
  await http.post(
    `/admin/enterprise-types/${enterpriseTypeId}/offers/reorder`,
    { items },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
}

export const enterpriseTypeOffers = {
  list,
  create,
  update,
  remove,
  publish,
  unpublish,
  reorder,
};
