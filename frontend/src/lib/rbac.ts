// src/lib/rbac.ts
export type RoleName = string;
export type PermissionName = string;

export interface CurrentUserLike {
  id: number;
  name: string;
  email: string;
  roles?: RoleName[];
  permissions?: PermissionName[];
}

/** Lit l'utilisateur courant depuis localStorage (clé "current_user") */
function readUser(): CurrentUserLike | null {
  try {
    const raw = localStorage.getItem("current_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Retourne l'utilisateur courant (ou null) */
export function getUser(): CurrentUserLike | null {
  return readUser();
}

/** Test de rôle (insensible à la casse) */
export function hasRole(role: RoleName): boolean {
  const u = readUser();
  if (!u?.roles) return false;
  const target = String(role).toLowerCase();
  return u.roles.map((r) => String(r).toLowerCase()).includes(target);
}

/** Super admin = Admin / Super Admin / Administrator */
export function isSuperAdmin(): boolean {
  return ["admin", "super admin", "administrator"].some((r) => hasRole(r));
}

export function can(
  perms: PermissionName | PermissionName[],
  mode: "any" | "all" = "any"
): boolean {
  if (isSuperAdmin()) return true; // bypass total

  const u = readUser();
  const list = Array.isArray(perms) ? perms : [perms];
  if (!list.length) return true;

  const granted = new Set((u?.permissions || []).map((p) => String(p)));

  if (mode === "all") return list.every((p) => granted.has(p));
  return list.some((p) => granted.has(p));
}
