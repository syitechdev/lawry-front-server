import { useEffect, useMemo, useState } from "react";
import {
  listEnterpriseTypes,
  PublicEnterpriseType,
} from "@/services/publicEnterpriseTypes";

function toSlug(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useLegalForms(current?: { sigle?: string; slug?: string }) {
  const [all, setAll] = useState<PublicEnterpriseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listEnterpriseTypes()
      .then((rows) => {
        if (!alive) return;
        setAll(rows);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const currentSlug =
    (current?.slug && current.slug) || toSlug(current?.sigle || "");
  const items = useMemo(
    () => all.filter((f) => f.slug !== currentSlug),
    [all, currentSlug]
  );

  return { items, loading };
}
