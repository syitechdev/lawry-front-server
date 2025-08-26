// src/services/requestTypeRegistry.ts
import type { AdminRequestType } from "@/services/adminRequestTypes";

/** Types à épingler en tête de liste (ordre = ordre d'apparition ici) */
export const PINNED_TYPES = ["creer-entreprise"] as const;

/** Règles spéciales par slug (label override + route d’admin) */
export const REQUEST_TYPE_ADMIN_ROUTES: Record<
  string,
  { label?: string; path?: (slug: string) => string }
> = {
  // Créer une entreprise : page d’édition de cartes (variants)
  "creer-entreprise": {
    label: "Créer une entreprise",
    path: () => "/admin/types/creer-entreprise",
  },
  // tu peux en ajouter d’autres ici si un jour tu veux une page dédiée
};

export function labelForRequestType(t: AdminRequestType): string {
  return REQUEST_TYPE_ADMIN_ROUTES[t.slug]?.label ?? t.name;
}

export function pathForRequestType(t: AdminRequestType): string {
  const entry = REQUEST_TYPE_ADMIN_ROUTES[t.slug];
  return entry?.path
    ? entry.path(t.slug)
    : `/admin/types/${encodeURIComponent(t.slug)}`;
}

/** dédoublonne par slug */
export function dedupeBySlug(list: AdminRequestType[]): AdminRequestType[] {
  const m = new Map<string, AdminRequestType>();
  for (const t of list) if (t.slug && !m.has(t.slug)) m.set(t.slug, t);
  return Array.from(m.values());
}

/** tri : pin d’abord (PINNED_TYPES), puis alpha */
export function sortTypes(list: AdminRequestType[]): AdminRequestType[] {
  const pinIndex = (slug: string) => {
    const i = PINNED_TYPES.indexOf(slug as (typeof PINNED_TYPES)[number]);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  return [...list].sort((a, b) => {
    const ai = pinIndex(a.slug);
    const bi = pinIndex(b.slug);
    if (ai !== bi) return ai - bi;
    return a.name.localeCompare(b.name, "fr");
  });
}
