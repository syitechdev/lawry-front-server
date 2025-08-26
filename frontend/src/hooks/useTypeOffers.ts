import { useEffect, useMemo, useState } from "react";
import {
  getOffersBySigle,
  PublicOffer,
} from "@/services/publicEnterpriseTypeOffers";

export type OfferVM = {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  isQuote: boolean;
  priceInterior?: number | null;
  priceAbidjan?: number | null;
  currency?: string;
  features: string[];
  options: { name: string; price: string }[];
  cta?: string | null;
};

function pickFeatures(o?: PublicOffer | null): string[] {
  if (!o) return [];
  const a = Array.isArray(o.features) ? o.features : [];
  const b = Array.isArray(o.features_json) ? o.features_json : [];
  return (a.length ? a : b).filter(
    (x) => typeof x === "string" && x.trim().length > 0
  );
}

function pickOptions(
  o?: PublicOffer | null
): { name: string; price: string }[] {
  const rows = o?.meta?.options_with_price ?? [];
  return rows
    ?.filter((r) => (r?.label ?? "").trim().length > 0)
    ?.map((r) => ({
      name: r.label.trim(),
      price: (r.price_text ?? "").trim(),
    }));
}

function toVM(o: PublicOffer): OfferVM {
  return {
    id: o.id,
    key: o.key,
    title: o.title,
    subtitle: o.subtitle ?? undefined,
    isQuote: o.pricing_mode === "quote",
    priceAbidjan: o.price_amount_abidjan ?? null,
    priceInterior: o.price_amount_interior ?? null,
    currency: o.currency ?? "XOF",
    features: pickFeatures(o),
    options: pickOptions(o),
    cta: o.cta ?? null,
  };
}

export function useTypeOffers(typeSigle: string) {
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    getOffersBySigle(typeSigle)
      .then((rows) => {
        if (!alive) return;
        setOffers(rows.filter((o) => !!o?.is_active));
      })
      .catch(() => {
        if (!alive) return;
        setOffers([]);
        setError(null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [typeSigle]);

  const basic = useMemo(() => {
    // priorité fixed > from ; sinon, premier non-quote
    const fixed = offers.find((o) => o.pricing_mode === "fixed");
    const from = offers.find((o) => o.pricing_mode === "from");
    const other = offers.find((o) => o.pricing_mode !== "quote");
    const found = fixed || from || other || null;
    return found ? toVM(found) : null;
  }, [offers]);

  const quote = useMemo(() => {
    const q = offers.find((o) => o.pricing_mode === "quote");
    return q ? toVM(q) : null;
  }, [offers]);

  return { basic, quote, loading, error };
}

// utils d’affichage
export function formatFCFA(n?: number | null): string {
  if (typeof n !== "number") return "—";
  return `${n.toLocaleString("fr-FR")} FCFA`;
}
