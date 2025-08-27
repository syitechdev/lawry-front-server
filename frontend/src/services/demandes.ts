import { http } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth";

export type DemandeListItem = {
  ref: string;
  type?: { slug: string; name?: string };
  status: string;
  priority?: string;
  is_read?: boolean;
  currency?: string;
  paid_status?: string;
  paid_amount?: number | null;
  data?: any;
  meta?: any;
  submitted_at?: string;
  created_at?: string;
  files?: any[];
  assignee?: { id: number; name: string; email?: string } | null;
  author?: { id: number; name: string; email?: string } | null;
};

export async function listAdminDemandes(params: {
  page?: number;
  per_page?: number;
  q?: string;
  type?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  unread?: boolean | string;
  date_from?: string;
  date_to?: string;
}) {
  const { data } = await http.get("/admin/demandes", { params });

  const items: DemandeListItem[] = (data?.data ?? []).map((x: any) => ({
    ref: x.ref,
    type: x.type,
    status: x.status,
    priority: x.priority,
    is_read: x.is_read,
    currency: x.currency,
    paid_status: x.paid_status,
    paid_amount: x.paid_amount,
    data: x.data,
    meta: x.meta,
    submitted_at: x.submitted_at,
    created_at: x.created_at,
    files: x.files,
    assignee: x.assignee,
    author: x.author,
  }));

  return { data: items, links: data.links, meta: data.meta };
}

export async function getUnreadCount(params?: { q?: string }) {
  const { data } = await http.get("/admin/demandes/unread-count", { params });
  return Number(data?.unread ?? 0);
}

export async function getAdminDemande(ref: string) {
  const { data } = await http.get(`/admin/demandes/${encodeURIComponent(ref)}`);
  return data as any;
}

export async function markRead(ref: string) {
  try {
    await http.post(`/admin/demandes/${encodeURIComponent(ref)}/mark-read`);
  } catch {}
}

export type UploadPayload = { files: File[]; tag?: string };

export async function uploadAdminFiles(
  ref: string,
  files: { annexes?: File[] }
) {
  const fd = new FormData();
  (files.annexes ?? []).forEach((f) => fd.append("files[annexes][]", f));
  await http.post(`/admin/demandes/${encodeURIComponent(ref)}/files`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function postAdminMessage(
  ref: string,
  body: string,
  is_internal = false
) {
  await http.post(`/admin/demandes/${encodeURIComponent(ref)}/messages`, {
    body,
    is_internal,
  });
}

export async function assignDemande(ref: string, userId?: number) {
  const me = getCurrentUser();
  const uid = userId ?? me?.id;
  if (!uid) throw new Error("user_id manquant");
  return http.post(`/admin/demandes/${encodeURIComponent(ref)}/assign`, {
    user_id: uid,
  });
}

export async function searchAdminUsers(q: string) {
  const { data } = await http.get("/admin/users", {
    params: { role: "admin", q },
  });
  return (data?.data ?? []) as Array<{
    id: number;
    name: string;
    email?: string;
  }>;
}

export async function setPriority(ref: string, priority: "urgent" | "normal") {
  const { data } = await http.patch(
    `/admin/demandes/${encodeURIComponent(ref)}/priority`,
    { priority }
  );
  return data as { ok: boolean; priority: "urgent" | "normal" };
}

export const STATUS_VALUE = {
  recu: "recu",
  enCours: "en-cours",
  enAttenteClient: "en-attente-client",
  enRevision: "en-revision",
  termine: "termine",
  annule: "annule",
} as const;

export async function changeStatus(ref: string, status: string, note?: string) {
  await http.post(`/admin/demandes/${encodeURIComponent(ref)}/status`, {
    status,
    note,
  });
}

export type Demande = {
  id: number;
  ref: string;
  paid_status?: "unpaid" | "pending" | "succeeded" | "failed";
  paid_amount?: number | null;
  currency?: string;
  data?: any;
  meta?: any;
  created_at?: string;
  updated_at?: string;
};

export type CreateDemandePayload = {
  type_slug: string;
  variant_key?: string | null;
  paid_status?: "unpaid" | "pending" | "succeeded" | "failed";
  currency?: string;
  data?: any;
  meta?: any;
};

export async function createDemande(
  payload: CreateDemandePayload
): Promise<Demande> {
  const { data } = await http.post("/demandes", payload, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  return data as Demande;
}

/** Construit le payload pour une demande "contrat" à partir du formulaire */
export function buildContractPayload(
  formData: {
    contractType: string;
    party1Type: string;
    party1Name: string;
    party1Address: string;
    party1Id: string;
    party1Representative?: string | null;
    party1Phone: string;
    party1Email: string;

    party2Type: string;
    party2Name: string;
    party2Address: string;
    party2Id: string;
    party2Representative?: string | null;
    party2Phone: string;
    party2Email: string;

    contractObject: string;

    party1Obligations: string;
    party2Obligations: string;

    amount: string;
    paymentTerms: string;
    latePenalties?: string | null;

    startDate: string;
    duration: string;
    terminationConditions?: string | null;

    isConfidential: boolean;
    confidentialityClause?: string | null;
    ipTransfer: boolean;
    ipTerms?: string | null;

    warranties?: string | null;
    liabilityLimitation?: string | null;

    applicableLaw: string;
    disputeResolution: string[];
  },
  selectedContractType?: { id: string; price: number } | null
): CreateDemandePayload {
  const fixedPrice = Number(selectedContractType?.price || 0);
  return {
    type_slug: "redaction-contrat",
    variant_key: selectedContractType?.id || null,
    paid_status: "unpaid",
    currency: "XOF",
    data: {
      contractType: formData.contractType,
      parties: {
        p1: {
          type: formData.party1Type,
          name: formData.party1Name,
          address: formData.party1Address,
          id: formData.party1Id,
          representative: formData.party1Representative || null,
          phone: formData.party1Phone,
          email: formData.party1Email,
        },
        p2: {
          type: formData.party2Type,
          name: formData.party2Name,
          address: formData.party2Address,
          id: formData.party2Id,
          representative: formData.party2Representative || null,
          phone: formData.party2Phone,
          email: formData.party2Email,
        },
      },
      object: formData.contractObject,
      obligations: {
        party1: formData.party1Obligations,
        party2: formData.party2Obligations,
      },
      financials: {
        amount_input: formData.amount,
        paymentTerms: formData.paymentTerms,
        latePenalties: formData.latePenalties || null,
        price_fixed: fixedPrice,
        pricing_mode: fixedPrice > 0 ? "fixed" : "quote",
      },
      duration: {
        startDate: formData.startDate,
        duration: formData.duration,
        termination: formData.terminationConditions || null,
      },
      clauses: {
        confidential: formData.isConfidential,
        confidentialityClause: formData.confidentialityClause || null,
        ipTransfer: formData.ipTransfer,
        ipTerms: formData.ipTerms || null,
        warranties: formData.warranties || null,
        liabilityLimitation: formData.liabilityLimitation || null,
      },
      law: {
        applicableLaw: formData.applicableLaw,
        disputeResolution: formData.disputeResolution,
      },
    },
    meta: { source: "website" },
  };
}
