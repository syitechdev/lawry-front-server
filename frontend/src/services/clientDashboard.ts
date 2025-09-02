import { DashboardResponse } from "@/types/dashboard";
import { http } from "@/lib/http";

export async function fetchClientDashboard(params?: {
  limit_demandes?: number;
  limit_documents?: number;
  limit_notifications?: number;
}): Promise<DashboardResponse> {
  const { data } = await http.get<DashboardResponse>("/client/dashboard", {
    params,
  });
  return data;
}
