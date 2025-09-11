type AnyObj = Record<string, any>;

export const CURRENCY_FALLBACK = "XOF";

export function formatDate(value?: string | number | Date): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Abidjan",
  });
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} Ko`;
  return `${(kb / 1024).toFixed(2)} Mo`;
}

export function formatCurrency(amount: number, currency = CURRENCY_FALLBACK): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " " + currency;
}

/** Règle de priorité pour le prix/affichage montant */
export function formatPrice(demande: AnyObj): string {
  //paiement effectif
  const paidAmount = demande?.paid_amount;
  const paidCurrency = demande?.currency || CURRENCY_FALLBACK;
  if (typeof paidAmount === "number" && paidAmount > 0) {
    return formatCurrency(paidAmount, paidCurrency);
  }

  //price display struct (type.variant.price.display)
  const display = demande?.type?.variant?.price?.display as string | undefined;
  if (display && display.trim()) return display;

  //data.price / data.total_amount / data.amount
  const data = demande?.data as AnyObj | undefined;
  const dataCurrency =
    data?.price?.currency || data?.payment?.currency || data?.paiement?.currency || CURRENCY_FALLBACK;

  const numericCandidate =
    Number(data?.price_amount) ||
    Number(data?.total_amount) ||
    Number(data?.amount) ||
    Number(data?.price?.amount) ||
    Number(data?.payment?.amount) ||
    Number(data?.paiement?.amount);

  if (!Number.isNaN(numericCandidate) && numericCandidate > 0) {
    return formatCurrency(numericCandidate, dataCurrency);
  }

  // service.price_display (ex: "Sur devis")
  const serviceDisplay = demande?.service?.price_display as string | undefined;
  if (serviceDisplay && serviceDisplay.trim()) return serviceDisplay;

  return "—";
}

//URL finale d’un fichier : priorité à view_url puis fallback storage_path 
export function fileUrl(doc: AnyObj, getFileUrl?: (path: string) => string): string {
  if (doc?.view_url) return String(doc.view_url);
  if (doc?.storage_path && typeof getFileUrl === "function") {
    return getFileUrl(String(doc.storage_path));
  }
  return "#";
}

//Statut → label/badge/progress (fallback contrôlé) 
const STATUS_UI = {
  recu: { label: "Reçu", prog: 10, badge: "bg-gray-100 text-gray-800" },
  "en-cours": { label: "En cours", prog: 50, badge: "bg-blue-100 text-blue-800" },
  "en-attente-client": { label: "En attente client", prog: 30, badge: "bg-yellow-100 text-yellow-800" },
  "en-revision": { label: "En révision", prog: 75, badge: "bg-purple-100 text-purple-800" },
  termine: { label: "Terminé", prog: 100, badge: "bg-green-100 text-green-800" },
  annule: { label: "Annulé", prog: 100, badge: "bg-red-100 text-red-800" },
} as const;

export function formatStatus(st?: string) {
  const key = (st || "").trim() as keyof typeof STATUS_UI;
  return STATUS_UI[key] || { label: st || "Inconnu", prog: 0, badge: "bg-gray-100 text-gray-800" };
}
