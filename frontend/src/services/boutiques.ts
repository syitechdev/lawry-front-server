import { http } from "@/lib/http";
import { uploadImage } from "@/services/upload";

export interface BoutiqueApi {
  "@id"?: string;
  id: number;
  code?: string;
  name: string;
  price_cfa?: number;
  priceCfa?: number;

  description?: string | null;
  files?: string[] | null;

  is_active?: boolean;
  isActive?: boolean;

  image_url?: string | null;
  imageUrl?: string | null;
  image_path?: string | null;
  imagePath?: string | null;

  category?:
    | string
    | { "@id"?: string; id?: number; name?: string }
    | number
    | null;
  category_id?: number | null;
  categoryId?: number | null;

  downloads_count?: number | null;
  downloadsCount?: number | null;

  rating?: string | number | null;

  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface Produit {
  "@id"?: string;
  id: number;
  code?: string;
  nom: string;
  prix: number;
  description: string;
  fichiers: string[];
  actif: boolean;
  image: string;
  categorie: string;
  categorieId?: number | null;

  note: number;
  telecharges: number;
  createdAt?: string;
  updatedAt?: string;
}

export const PLACEHOLDER = "/placeholder.svg";

// -------- Helpers --------
function parseNumberSafe(v: unknown, dflt = 0): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : dflt;
}
function iriId(iri?: string | null): number | null {
  if (!iri || typeof iri !== "string") return null;
  const m = iri.match(/\/(\d+)(\?.*)?$/);
  return m ? parseInt(m[1], 10) : null;
}
function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json.data)) return json.data;
  return [];
}
function pickMessage(err: any, fallback: string) {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.description ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

// -------- Mapping API -> UI --------
function apiToUi(b: BoutiqueApi): Produit {
  const prix = parseNumberSafe(b.price_cfa ?? b.priceCfa, 0);
  const actif = b.is_active ?? b.isActive ? true : false;

  let image: string = PLACEHOLDER;
  const rawUrl = b.image_url ?? b.imageUrl ?? null;
  const rawPath = b.image_path ?? b.imagePath ?? null;

  if (typeof rawUrl === "string" && rawUrl.trim()) {
    image = rawUrl;
  } else if (typeof rawPath === "string" && rawPath.trim()) {
    image = /^https?:\/\//i.test(rawPath)
      ? rawPath
      : `/storage/${rawPath.replace(/^\/?storage\/?/, "")}`;
  }

  // catégorie affichage + id
  let categorieId: number | null | undefined =
    b.category_id ?? b.categoryId ?? null;
  let categorieLabel = "Non classé";
  if (typeof b.category === "string") {
    const idFromIri = iriId(b.category);
    if (idFromIri) {
      categorieId = idFromIri;
      categorieLabel = `Catégorie #${idFromIri}`;
    }
  } else if (typeof b.category === "number") {
    categorieId = b.category;
    categorieLabel = `Catégorie #${b.category}`;
  } else if (typeof b.category === "object" && b.category) {
    const idFromIri = iriId((b.category as any)["@id"]);
    if (idFromIri) {
      categorieId = idFromIri;
      categorieLabel = `Catégorie #${idFromIri}`;
    } else if ((b.category as any).name) {
      categorieLabel = String((b.category as any).name);
    }
  }

  const downloads = parseNumberSafe(
    b.downloads_count ?? b.downloadsCount ?? 0,
    0
  );
  const noteNum = parseNumberSafe(b.rating ?? 0, 0);

  return {
    "@id": b["@id"],
    id: b.id,
    code: b.code,
    nom: b.name,
    prix,
    description: b.description ?? "",
    fichiers: Array.isArray(b.files) ? b.files : [],
    actif,
    image,
    categorie: categorieLabel,
    categorieId,
    note: noteNum,
    telecharges: downloads,
    createdAt: b.createdAt ?? b.created_at,
    updatedAt: b.updatedAt ?? b.updated_at,
  };
}

// -------- Mapping UI -> API (JSON) --------
function uiToApi(
  p: Partial<Produit>,
  extra?: { imageUrl?: string }
): Partial<BoutiqueApi> {
  const out: Partial<BoutiqueApi> = {};
  if (p.nom !== undefined) out.name = p.nom;
  if (p.prix !== undefined) out.price_cfa = p.prix;
  if (p.description !== undefined) out.description = p.description ?? "";
  if (p.fichiers !== undefined) out.files = p.fichiers ?? [];
  if (p.actif !== undefined) out.is_active = p.actif;

  if (p.categorieId !== undefined) out.category_id = p.categorieId ?? null;

  if (p.telecharges !== undefined) out.downloads_count = p.telecharges;
  if (p.note !== undefined) out.rating = parseNumberSafe(p.note, 0).toFixed(1);

  if (extra?.imageUrl) (out as any).image_url = extra.imageUrl;

  return out;
}

// -------- API --------
export const boutique = {
  async list(): Promise<{ items: Produit[] }> {
    try {
      const { data } = await http.get(`/boutiques?order[created_at]=desc`, {
        headers: { Accept: "application/ld+json" },
      });
      const rows = extractMember(data).map((r: BoutiqueApi) => apiToUi(r));
      return { items: rows };
    } catch (err) {
      throw new Error(pickMessage(err, "Impossible de charger les produits"));
    }
  },

  async get(idOrIri: number | string): Promise<Produit> {
    try {
      const url =
        typeof idOrIri === "string" && idOrIri.startsWith("/api/")
          ? idOrIri
          : `/boutiques/${idOrIri}`;
      const { data } = await http.get(url, {
        headers: { Accept: "application/ld+json" },
      });
      return apiToUi(data);
    } catch (err) {
      throw new Error(pickMessage(err, "Impossible de charger le produit"));
    }
  },

  // create(payload, undefined, imageUrl)
  async create(
    payload: Partial<Produit>,
    _imageFile?: File | undefined,
    imageUrl?: string
  ): Promise<Produit> {
    try {
      const body = uiToApi(payload, { imageUrl });
      const { data } = await http.post(`/boutiques`, body, {
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
      });
      return apiToUi(data);
    } catch (err) {
      throw new Error(pickMessage(err, "Création du produit impossible"));
    }
  },

  async update(
    id: number,
    patch: Partial<Produit>,
    imageFile?: File
  ): Promise<Produit> {
    try {
      let imageUrl: string | undefined;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const body = uiToApi(patch, { imageUrl });
      const { data } = await http.patch(`/boutiques/${id}`, body, {
        headers: {
          "Content-Type": "application/merge-patch+json",
          Accept: "application/ld+json",
        },
      });
      return apiToUi(data);
    } catch (err) {
      throw new Error(pickMessage(err, "Mise à jour du produit impossible"));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await http.delete(`/boutiques/${id}`, {
        headers: { Accept: "application/ld+json" },
      });
    } catch (err) {
      throw new Error(pickMessage(err, "Suppression impossible"));
    }
  },

  async setActive(id: number, isActive: boolean): Promise<void> {
    try {
      await http.patch(
        `/admin/boutiques/${id}/active`,
        { is_active: isActive },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    } catch (err) {
      throw new Error(pickMessage(err, "Échec de la mise à jour du statut"));
    }
  },
};
