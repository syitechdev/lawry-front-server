import { http } from "@/lib/http";

export type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;

  is_read: boolean;
  read_at?: string | null;
  read_by?: number | null;

  status: "nouveau" | "en_cours" | "traite" | "clos" | "spam";
  assigned_to?: number | null;
  handled_at?: string | null;

  ip_address?: string | null;
  user_agent?: string | null;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type ContactCreate = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
};

export type ContactUpdateStatus = {
  status: Contact["status"];
};

export type ContactAssign = {
  assigned_to: number | null;
};

export type ContactStats = {
  total: number;
  unread: number;
  byStatus: Record<Contact["status"], number>;
};

export async function createContact(payload: ContactCreate): Promise<Contact> {
  const { data } = await http.post("/contacts", payload);
  return data.data ?? data;
}

export async function listContacts(params?: {
  q?: string;
  status?: Contact["status"];
  is_read?: boolean;
  per_page?: number;
  page?: number;
}): Promise<{ data: Contact[]; meta?: any }> {
  const { data } = await http.get("/admin/contacts", { params });
  return data;
}

export async function getContact(id: number): Promise<Contact> {
  const { data } = await http.get(`/admin/contacts/${id}`);
  return data.data ?? data;
}

export async function markContactRead(id: number): Promise<Contact> {
  const { data } = await http.post(`/admin/contacts/${id}/read`);
  return data.data ?? data;
}

export async function markContactUnread(id: number): Promise<Contact> {
  const { data } = await http.post(`/admin/contacts/${id}/unread`);
  return data.data ?? data;
}

export async function updateContactStatus(
  id: number,
  payload: ContactUpdateStatus
): Promise<Contact> {
  const { data } = await http.post(`/admin/contacts/${id}/status`, payload);
  return data.data ?? data;
}

export async function assignContact(
  id: number,
  payload: ContactAssign
): Promise<Contact> {
  const { data } = await http.post(`/admin/contacts/${id}/assign`, payload);
  return data.data ?? data;
}

export async function deleteContact(id: number): Promise<void> {
  await http.delete(`/admin/contacts/${id}`);
}

export async function getContactStats(): Promise<ContactStats> {
  const { data } = await http.get("/admin/contacts/stats");
  return data;
}
