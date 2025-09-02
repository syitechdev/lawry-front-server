import { http } from "@/lib/http";

const PUBLIC_BASE = "/newsletter";
const ADMIN_BASE = "/admin/newsletter";

export type NewsletterSubscribePayload = {
  email: string;
};

export type NewsletterResponse = {
  message?: string;
  data?: unknown;
};

export type NewsletterSub = {
  id: number;
  email: string;
  unsubscribed_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
};

export type NewsletterStats = {
  total: number;
  active: number;
  unsubscribed: number;
};

//Public
export async function newsletterSubscribe(
  payload: NewsletterSubscribePayload
): Promise<NewsletterResponse> {
  const { data } = await http.post(`${PUBLIC_BASE}/subscribe`, payload);
  return data;
}

export async function newsletterUnsubscribe(
  email: string
): Promise<NewsletterResponse> {
  const { data } = await http.post(`${PUBLIC_BASE}/unsubscribe`, { email });
  return data;
}

//Admin
export async function listNewsletter(params?: {
  q?: string;
  only?: "active" | "unsub";
  per_page?: number; //
  page?: number; //
}): Promise<{ data: NewsletterSub[]; meta: any | null }> {
  const { data } = await http.get(ADMIN_BASE, { params });

  if (Array.isArray(data)) {
    return { data, meta: null };
  }
  if (Array.isArray(data?.data)) {
    return { data: data.data, meta: data.meta ?? data.links ?? null };
  }
  return { data: [], meta: null };
}

export async function getNewsletterStats(): Promise<NewsletterStats> {
  const { data } = await http.get(`${ADMIN_BASE}/stats`);
  return data;
}

export async function deleteNewsletter(id: number): Promise<void> {
  await http.delete(`${ADMIN_BASE}/${id}`);
}
