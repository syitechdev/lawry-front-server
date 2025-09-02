export function normalizeSigle(input: string): string {
  return (input || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export const FORM_ROUTES: Record<string, string> = {
  SAS: "/creer-entreprise/sas/formulaire",
  SASU: "/creer-entreprise/sasu/formulaire",
  SARL: "/creer-entreprise/sarl/formulaire",
  SARLU: "/creer-entreprise/sarlu/formulaire",
  SA: "/creer-entreprise/sa/formulaire",
  SAU: "/creer-entreprise/sau/formulaire",
  SCI: "/creer-entreprise/sci/formulaire",
  "ENTREPRISE INDIVIDUELLE":
    "/creer-entreprise/entreprise-individuelle/formulaire",
  FONDATION: "/creer-entreprise/fondation/formulaire",
  ONG: "/creer-entreprise/ong/formulaire",
  ASSOCIATION: "/creer-entreprise/association/formulaire",
  SCOOP: "/creer-entreprise/scoop/formulaire",
};

export const DEFAULT_FORM_ROUTE = "/creer-entreprise/demande";

export function buildFormUrl(typeSigle: string, offerKey?: string) {
  const key = normalizeSigle(typeSigle);
  const base = FORM_ROUTES[key] || DEFAULT_FORM_ROUTE;
  if (offerKey) return `${base}?offer=${encodeURIComponent(offerKey)}`;
  return base;
}
