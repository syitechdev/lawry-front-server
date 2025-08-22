// src/services/rbac.ts
import { http } from "@/lib/http";

/** Rôle côté API */
export interface RbacRole {
  id: number;
  name: string;
  is_system: boolean;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

/** Permission atomique */
export interface PermissionItem {
  name: string; // ex: "articles.read"
  action: string; // ex: "read"
  label: string; // ex: "Lire / Voir"
}

/** Groupe de permissions (par ressource) */
export interface PermissionGroup {
  group: string; // ex: "articles"
  label: string; // ex: "Articles"
  items: PermissionItem[];
}

/** Normalise les payloads typiques (array, {data:[]}, Hydra) vers un tableau */
function normalizeArray<T = any>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload.data)) return payload.data as T[];
  // API Platform (Hydra / JSON-LD)
  const hydra = (payload as any)["hydra:member"];
  if (Array.isArray(hydra)) return hydra as T[];
  return [];
}

/** Liste des rôles */
export async function listRoles(): Promise<RbacRole[]> {
  const { data } = await http.get("/admin/rbac/roles");
  return normalizeArray<RbacRole>(data);
}

/** Création d’un rôle (+ option clone) */
export async function createRole(params: {
  name: string;
  clone_from?: number | null;
}): Promise<RbacRole> {
  const { data } = await http.post("/admin/rbac/roles", params);
  return data as RbacRole;
}

/** Renommage d’un rôle */
export async function renameRole(id: number, name: string): Promise<RbacRole> {
  const { data } = await http.patch(`/admin/rbac/roles/${id}`, { name });
  return data as RbacRole;
}

/** Suppression d’un rôle */
export async function deleteRole(id: number): Promise<{ ok: boolean }> {
  const { data } = await http.delete(`/admin/rbac/roles/${id}`);
  return data as { ok: boolean };
}

/** Liste des groupes de permissions */
export async function listPermissionGroups(): Promise<PermissionGroup[]> {
  const { data } = await http.get("/admin/rbac/permissions");
  return normalizeArray<PermissionGroup>(data);
}

/** Synchronise les permissions d’un rôle (remplace tout par `permissions`) */
export async function syncRolePermissions(
  id: number,
  permissions: string[]
): Promise<{ ok: boolean; permissions: string[] }> {
  const { data } = await http.put(`/admin/rbac/roles/${id}/permissions`, {
    permissions,
  });
  return data as { ok: boolean; permissions: string[] };
}
