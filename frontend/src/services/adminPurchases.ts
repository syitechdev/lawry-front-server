import { http } from "@/lib/http";

export type AdminMetrics = {
  total_purchases: number;
  file_purchases: number;
  downloads_count: number; // achats payés de produits "file"
  revenue_cfa: number;   
};

export async function getAdminBoutiqueMetrics(): Promise<AdminMetrics> {
    const { data } = await http.get("/admin/boutiques/metrics", {
      headers: { Accept: "application/json" },
    });
    return data as AdminMetrics;
  }
  
export type ProductPurchaseRow = {
  id: number;
  ref: string;
  status: "pending"|"paid"|"failed"|"cancelled"|"expired";
  amount: number;
  currency: string;
  created_at?: string;
  delivered_at?: string|null;
  user: { id?: number; name?: string; email?: string };
};
export type ProductPurchasesResponse = {
  stats: { product: { id:number; name:string; type:string }, purchases:number, paid_purchases:number, revenue_cfa:number };
  data: ProductPurchaseRow[];
  current_page: number;
  last_page: number;
  total: number;
};

export async function listProductPurchases(productId: number, page=1, perPage=12): Promise<ProductPurchasesResponse> {
  const { data } = await http.get(`/admin/boutiques/${productId}/purchases`, {
    params: { page, per_page: perPage }, headers: { Accept: "application/json" }
  });
  return data as ProductPurchasesResponse;
}
