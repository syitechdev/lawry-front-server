import { http } from "@/lib/http";

export type GenericStatus = "active" | "pending" | "expired" | "inactive";

export interface GenericServiceRow {

  type: string;        
  id: number;
  label: string;              
  status: GenericStatus;

  startedAt?: string | null;
  endsAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  period?: string | null;
  amountXof?: number | null;

  lastPaymentRef?: string | null;
  lastPaymentStatus?: string | null;
  lastPaymentAt?: string | null;
}

export interface UserServiceSummary {
  total: number;
  active: number;
  pending: number;
  expired: number;
  inactive: number;
}

export async function listUserServices(
  userId: number,
  params?: { q?: string; page?: number; perPage?: number }
) {
  const { data } = await http.get(`/admin/users/${userId}/services`, {
    params: {
      q: params?.q || undefined,
      page: params?.page || 1,
      perPage: params?.perPage || 10,
    },
  });

  return {
    items: (data?.data || []) as GenericServiceRow[],
    total: Number(data?.total ?? (data?.data?.length ?? 0)),
    page: Number(data?.page ?? 1),
    perPage: Number(data?.perPage ?? 10),
  };
}

export async function getUserServicesSummary(userId: number) {
  const { data } = await http.get(`/admin/users/${userId}/services/summary`);
  const s: UserServiceSummary = {
    total: Number(data?.total ?? 0),
    active: Number(data?.active ?? 0),
    pending: Number(data?.pending ?? 0),
    expired: Number(data?.expired ?? 0),
    inactive: Number(data?.inactive ?? 0),
  };
  return s;
}
