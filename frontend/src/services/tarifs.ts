import { http } from "@/lib/http";

export interface TarifApi {
  id: number;
  nom: string;
  prix: number;
  description?: string | null;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tarif {
  id: number;
  nom: string;
  prix: number;
  description: string;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function fromApi(t: any): Tarif {
  return {
    id: t.id,
    nom: t.nom,
    prix: t.prix,
    description: t.description ?? "",
    actif: t.actif ?? false,
    createdAt: t.createdAt ?? t.created_at,
    updatedAt: t.updatedAt ?? t.updated_at,
  };
}

export function toApi(t: Partial<Tarif>): Partial<TarifApi> {
  return {
    nom: t.nom,
    prix: t.prix,
    description: t.description ?? null,
    actif: t.actif ?? false,
  };
}

export const tarifsApi = {
  async list(): Promise<Tarif[]> {
    const r = await http.get(`/tarif_uniques`);
    const rows = (
      r.data["hydra:member"] ||
      r.data.member ||
      r.data.data ||
      []
    ).map(fromApi);
    return rows;
  },

  async create(payload: Partial<Tarif>): Promise<Tarif> {
    const r = await http.post(`/tarif_uniques`, toApi(payload), {
      headers: { "Content-Type": "application/ld+json" },
    });
    return fromApi(r.data);
  },

  async update(id: number, patch: Partial<Tarif>): Promise<Tarif> {
    const r = await http.patch(`/tarif_uniques/${id}`, toApi(patch), {
      headers: { "Content-Type": "application/merge-patch+json" },
    });
    return fromApi(r.data);
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/tarif_uniques/${id}`);
  },

  async setActive(id: number, actif: boolean): Promise<void> {
    await http.patch(
      `/admin/tarifs/${id}/active`,
      { actif },
      { headers: { Accept: "application/json" } }
    );
  },
};
