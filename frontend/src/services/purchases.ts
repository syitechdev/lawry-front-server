import { http } from "@/lib/http";

export type PurchaseProduct = {
  name: string;
  code?: string;
  type: "file" | "service" | string;
  image_url?: string | null;
  files_urls?: string[];
};

export type MyPurchaseItem = {
  id: number;
  ref: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "expired";
  unit_price_cfa: number;
  currency: string;
  delivered_at?: string | null;
  created_at?: string | null;
  product: PurchaseProduct;
};

export type MyPurchaseList = {
  data: MyPurchaseItem[];
  current_page: number;
  last_page: number;
  total: number;
};

export async function listMyPurchases(params?: { page?: number; per_page?: number }): Promise<MyPurchaseList> {
  const { data } = await http.get("/client/purchases", {
    params: { page: params?.page ?? 1, per_page: params?.per_page ?? 12 },
    headers: { Accept: "application/json" },
  });
  return data as MyPurchaseList;
}
