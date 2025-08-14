// src/services/services.ts
import { http } from "@/lib/http";

/**
 * Format renvoyé par l'API (mix camelCase/snake_case possible).
 * On rend la lecture tolérante et on normalise côté UI.
 */
export interface ServiceApi {
  "@id"?: string;
  id: number;
  code?: string;

  // titre / description
  title: string;
  description?: string | null;

  // le backend peut accepter string/number et renvoyer camelCase
  price_cfa?: string | number | null;
  priceCfa?: string | number | null;

  duration_days?: string | null;
  durationDays?: string | null;

  is_active?: string | boolean | null;
  isActive?: string | boolean | null;

  // parfois string côté API, parfois array en réponse
  documents?: string | string[] | null;

  orders_count?: string | number | null;
  ordersCount?: string | number | null;

  rating?: string | number | null;

  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Format utilisé par le UI (propre et typé) */
export interface Service {
  "@id"?: string;
  id: number;
  code?: string;
  nom: string;
  description: string;
  prix: number; // nombre pour l'affichage/calculs
  duree: string;
  statut: "Actif" | "Inactif"; // lisible pour le UI
  documents: string[]; // tableau dans le UI
  commandes: number;
  note: number;
  createdAt?: string;
  updatedAt?: string;
}

/* ================= helpers ================= */

function extractMember(json: any): any[] {
  if (!json) return [];
  if (Array.isArray(json.member)) return json.member;
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"];
  if (Array.isArray(json.data)) return json.data;
  return [];
}

const toNum = (v: unknown, d = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : d;
};

const toStr = (v: unknown): string | undefined => {
  if (v === null || v === undefined) return undefined;
  return String(v);
};

const ratingToString = (v: unknown): string | undefined => {
  const n = toNum(v);
  if (!Number.isFinite(n)) return undefined;
  return n.toFixed(1); // e.g. "0.0"
};

const boolToString10 = (b: unknown): string | undefined => {
  if (b === null || b === undefined) return undefined;
  const val = typeof b === "boolean" ? b : String(b).toLowerCase() === "true";
  return val ? "1" : "0";
};

const csvToArray = (v: string): string[] =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/* =============== API -> UI ================= */

function fromApi(a: ServiceApi): Service {
  // documents: la réponse peut être déjà un array OU une string CSV
  let docs: string[] = [];
  if (Array.isArray(a.documents)) {
    docs = a.documents;
  } else if (typeof a.documents === "string") {
    docs = csvToArray(a.documents);
  }

  // statut: peut arriver en "1"/"0", "true"/"false" ou bool
  const rawActive = a.isActive ?? a.is_active;
  const active =
    typeof rawActive === "string"
      ? rawActive === "1" ||
        rawActive.toLowerCase() === "true" ||
        rawActive === "on"
      : !!rawActive;

  const rawPrice = a.priceCfa ?? a.price_cfa;
  const rawDuration = a.durationDays ?? a.duration_days;

  const rawOrders = a.ordersCount ?? a.orders_count;

  return {
    "@id": a["@id"],
    id: a.id,
    code: a.code,
    nom: String(a.title || ""),
    description: String(a.description || ""),
    prix: toNum(rawPrice, 0),
    duree: String(rawDuration || ""),
    statut: active ? "Actif" : "Inactif",
    documents: docs,
    commandes: toNum(rawOrders, 0),
    note: toNum(a.rating, 0),
    createdAt: a.createdAt ?? a.created_at,
    updatedAt: a.updatedAt ?? a.updated_at,
  };
}

/* =============== UI -> API =================
   On sérialise "comme ton backend aime":
   - prix/rating en string
   - is_active en "1"/"0"
   - documents en string CSV
   - on envoie à la fois snake_case ET camelCase (tolisant)
   ========================================== */

function toApi(p: Partial<Service>): Partial<ServiceApi> {
  const out: Partial<ServiceApi> = {};

  if (p.nom !== undefined) out.title = p.nom;
  if (p.description !== undefined) out.description = p.description ?? "";

  if (p.prix !== undefined) {
    const v = toStr(p.prix) ?? "0";
    out.price_cfa = v;
    out.priceCfa = v; // tolérance si le normalizer attend camelCase
  }

  if (p.duree !== undefined) {
    const v = p.duree ?? "";
    out.duration_days = v;
    out.durationDays = v;
  }

  if (p.statut !== undefined) {
    const s10 = p.statut === "Actif" ? "1" : "0";
    out.is_active = s10;
    out.isActive = s10; // tolérance
  }

  if (p.documents !== undefined) {
    const csv = Array.isArray(p.documents)
      ? p.documents.join(", ")
      : toStr(p.documents) ?? "";
    out.documents = csv; // l'API veut une string à l'input
  }

  if (p.commandes !== undefined) {
    const v = toStr(p.commandes) ?? "0";
    out.orders_count = v;
    out.ordersCount = v;
  }

  if (p.note !== undefined) {
    const v = ratingToString(p.note) ?? "0.0";
    out.rating = v;
  }

  return out;
}

/* =============== API calls ================= */

function pickMessage(err: any, fallback: string) {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.description ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

export const servicesApi = {
  async list(): Promise<{ items: Service[] }> {
    try {
      // tri par createdAt (camel) pour coller à la sortie
      const { data } = await http.get(`/services?order[createdAt]=desc`, {
        headers: { Accept: "application/ld+json" },
      });
      const rows = extractMember(data).map((r: ServiceApi) => fromApi(r));
      return { items: rows };
    } catch (err) {
      throw new Error(pickMessage(err, "Impossible de charger les services"));
    }
  },

  async get(idOrIri: number | string): Promise<Service> {
    try {
      const url =
        typeof idOrIri === "string" && idOrIri.startsWith("/api/")
          ? idOrIri
          : `/services/${idOrIri}`;
      const { data } = await http.get(url, {
        headers: { Accept: "application/ld+json" },
      });
      return fromApi(data);
    } catch (err) {
      throw new Error(pickMessage(err, "Impossible de charger le service"));
    }
  },

  async create(payload: Partial<Service>): Promise<Service> {
    try {
      const body = toApi(payload);
      const { data } = await http.post(`/services`, body, {
        headers: {
          Accept: "application/ld+json",
          "Content-Type": "application/ld+json",
          Prefer: "return=representation",
        },
      });
      return fromApi(data);
    } catch (err) {
      throw new Error(pickMessage(err, "Création du service impossible"));
    }
  },

  async update(id: number, patch: Partial<Service>): Promise<Service> {
    try {
      const body = toApi(patch);
      const { data } = await http.patch(`/services/${id}`, body, {
        headers: {
          Accept: "application/ld+json",
          "Content-Type": "application/merge-patch+json",
          Prefer: "return=representation",
        },
      });
      return fromApi(data);
    } catch (err) {
      throw new Error(pickMessage(err, "Mise à jour du service impossible"));
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await http.delete(`/services/${id}`, {
        headers: { Accept: "application/ld+json" },
      });
    } catch (err) {
      throw new Error(pickMessage(err, "Suppression impossible"));
    }
  },

  async setActive(id: number, isActive: boolean): Promise<void> {
    try {
      // le toggle fonctionne chez toi : on garde "1"/"0"
      await http.patch(
        `/services/${id}`,
        {
          is_active: boolToString10(isActive),
          isActive: boolToString10(isActive),
        },
        {
          headers: {
            Accept: "application/ld+json",
            "Content-Type": "application/merge-patch+json",
          },
        }
      );
    } catch (err) {
      throw new Error(pickMessage(err, "Échec de la mise à jour du statut"));
    }
  },
};
