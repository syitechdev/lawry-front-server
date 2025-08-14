import { makeCrud, type NormalizedCollection } from "@/services/crud";
import { http } from "@/lib/http";

export type User = {
  id: number;
  code?: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status?: "Actif" | "Inactif" | "VIP";
  services_count?: number;
  last_activity_at?: string | null;
  roles?: string[];
  created_at?: string;
  updated_at?: string;
};

export type UserCreate = {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status?: "Actif" | "Inactif" | "VIP";
  password?: string;
  password_confirmation?: string;
  role?: "Client" | "Admin";
};

export type UserUpdate = Partial<UserCreate>;

const base = "/admin/users";

const crud = makeCrud<User, UserCreate, UserUpdate>(base);

export const users = {
  ...crud,

  async list(params?: any): Promise<NormalizedCollection<User>> {
    return await crud.list(params);
  },

  async setRole(id: number, role: "Client" | "Admin"): Promise<User> {
    const { data } = await http.put(`${base}/${id}/role`, { role });
    return data;
  },
};
