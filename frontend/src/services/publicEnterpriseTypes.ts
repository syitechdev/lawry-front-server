import { http } from "@/lib/http";

export type PublicEnterpriseType = {
  id: number;
  sigle: string;
  signification: string;
  description?: string | null;
  slug: string;
};

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fromApi(j: any): PublicEnterpriseType {
  return {
    id: Number(j.id ?? 0),
    sigle: j.sigle ?? "",
    signification: j.signification ?? "",
    description: j.description ?? "",
    slug: j.slug ?? slugify(j.sigle ?? ""),
  };
}

export async function listEnterpriseTypes(): Promise<PublicEnterpriseType[]> {
  try {
    const { data } = await http.get(`/enterprise-types`, {
      headers: { Accept: "application/json" },
    });

    const raw =
      (Array.isArray(data) && data) ||
      (Array.isArray(data?.items) && data.items) ||
      (Array.isArray(data?.data) && data.data) ||
      (Array.isArray((data as any)?.["hydra:member"]) &&
        (data as any)["hydra:member"]) ||
      [];

    return raw.map(fromApi);
  } catch {
    return [];
  }
}
