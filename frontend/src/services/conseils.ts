import { http } from "@/lib/http";

export type Urgency = "faible" | "moyen" | "eleve" | "critique";

export type ConseilCreate = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  legal_domain: string;
  description: string;
  urgency?: Urgency | null;
  consent: boolean;
};

export type Conseil = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  legal_domain: string;
  description: string;
  urgency?: Urgency | null;
  consent: boolean;
  status: "nouveau" | "en_cours" | "traite" | "clos" | "spam";
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
};

export type ConseilStats = {
  total: number;
  unread: number;
  byStatus: Record<string, number>;
};

export async function createConseil(payload: ConseilCreate): Promise<Conseil> {
  const { data } = await http.post("/conseils-gratuits", payload);
  return data.data ?? data;
}

//Admin
type ListParams = {
  q?: string;
  status?: string;
  is_read?: boolean | string;
  per_page?: number;
};

function normalizeList(json: any): Conseil[] {
  if (!json) return [];
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json)) return json;
  return [];
}

export const conseilsAdmin = {
  async list(params: ListParams = {}): Promise<Conseil[]> {
    const { data } = await http.get("/admin/conseils-gratuits", {
      params,
    });
    return normalizeList(data);
  },

  async stats(): Promise<ConseilStats> {
    const { data } = await http.get("/admin/conseils-gratuits/stats");
    return data;
  },

  async markRead(id: number): Promise<Conseil> {
    const { data } = await http.post(`/admin/conseils-gratuits/${id}/read`);
    return data.data ?? data;
  },

  async markUnread(id: number): Promise<Conseil> {
    const { data } = await http.post(`/admin/conseils-gratuits/${id}/unread`);
    return data.data ?? data;
  },

  async updateStatus(id: number, status: Conseil["status"]): Promise<Conseil> {
    const { data } = await http.patch(`/admin/conseils-gratuits/${id}/status`, {
      status,
    });
    return data.data ?? data;
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/admin/conseils-gratuits/${id}`);
  },
};
