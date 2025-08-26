import { http } from "@/lib/http";

export type OfferMeta = {
  id?: string | number | null;
  slug?: string | null;
  title?: string | null;
  price?: number | null;
  pricing_mode?: "fixed" | "from" | "quote" | null;
  currency?: string | null;
};

const priceText = (
  p: number | null | undefined,
  pm?: "fixed" | "from" | "quote" | null,
  currency?: string
) => {
  const curr = currency || "XOF";
  if (
    pm === "quote" ||
    p === null ||
    p === undefined ||
    Number.isNaN(Number(p))
  ) {
    return "Sur devis";
  }
  const n = Number(p).toLocaleString("fr-FR");
  return pm === "from" ? `À partir de ${n} ${curr}` : `${n} ${curr}`;
};

export async function submitContractRequest(
  payload: Record<string, any>,
  files: File[],
  offer: OfferMeta | undefined,
  variantKey: string
) {
  const fd = new FormData();

  // Type (slug)
  fd.append("type", "rediger-contrat");

  fd.append("variant_key", variantKey);

  fd.append("urgent", "false");

  // Données
  for (const [k, v] of Object.entries(payload || {})) {
    if (Array.isArray(v)) {
      v.forEach((val, i) => fd.append(`data[${k}][${i}]`, String(val)));
    } else if (v !== undefined && v !== null) {
      fd.append(`data[${k}]`, String(v));
    }
  }

  if (payload.partie1Telephone)
    fd.append("data[phone]", String(payload.partie1Telephone));
  if (payload.partie1Email)
    fd.append("data[email]", String(payload.partie1Email));

  const spLabel = offer?.title || variantKey || "Contrat";
  const spPrice = typeof offer?.price === "number" ? offer?.price : null;
  const spMode = offer?.pricing_mode ?? null;
  const spCurr = offer?.currency ?? "XOF";
  const spText = priceText(spPrice, spMode, spCurr);

  fd.append("data[selected_preset][label]", String(spLabel));
  fd.append("data[selected_preset][price_display]", spText);
  fd.append("data[selected_preset][pricing_mode]", String(spMode ?? ""));
  fd.append("data[selected_preset][currency]", String(spCurr));
  if (typeof spPrice === "number") {
    fd.append("data[selected_preset][price]", String(spPrice));
  }

  (files || [])
    .filter((f) => f && f.size > 0)
    .forEach((f) => fd.append("files[attachments][]", f));

  const res = await http.post("/demandes", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}
