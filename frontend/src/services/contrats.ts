import { http } from "@/lib/http";

// ---- Types d'API ----
export type VariantCard = {
  key: string;
  title: string;
  subtitle?: string;
  features?: string[];
  pricing_mode?: "quote" | "fixed" | "from";
  price_amount?: number | null;
  currency?: string | null;
  order?: number;
};

export type ContratsCatalog = {
  type: {
    name: string;
    slug: string; // "rediger-contrat"
    version: number;
    pricing_mode?: "quote" | "fixed" | "from";
    price_amount?: number | null;
    currency?: string | null;
  };
  variants: VariantCard[];
};

export type FieldSchema = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "date"
    | "checkbox"
    | "repeater"
    | "files";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  schema?: FieldSchema[];
  accept?: string[];
  max_files?: number;
};

export type VariantDetail = {
  type: { slug: string; version: number };
  variant: VariantCard & { form_schema: FieldSchema[] };
};

export async function getContratsCatalog(): Promise<ContratsCatalog> {
  const { data } = await http.get("/request-types/rediger-contrat");
  return data;
}

export async function getContratVariant(key: string): Promise<VariantDetail> {
  const { data } = await http.get(
    `/request-types/rediger-contrat/variants/${encodeURIComponent(key)}`
  );
  return data;
}

type FileMap = Record<string, File[]>;

function appendData(form: FormData, value: any, parent: string) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((v, i) => {
      appendData(form, v, `${parent}[${i}]`);
    });
  } else if (typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => {
      appendData(form, v, `${parent}[${k}]`);
    });
  } else {
    form.append(parent, String(value));
  }
}

export async function createDemandeContrat(params: {
  variantKey: string;
  data: any;
  fileMap?: FileMap;
  urgent?: boolean;
}) {
  const fd = new FormData();
  fd.append("type", "rediger-contrat");
  fd.append("variant_key", params.variantKey);
  if (params.urgent !== undefined)
    fd.append("urgent", params.urgent ? "1" : "0");

  appendData(fd, params.data, "data");

  if (params.fileMap) {
    Object.entries(params.fileMap).forEach(([tag, files]) => {
      files?.forEach((f) => fd.append(`files[${tag}][]`, f));
    });
  }

  const { data } = await http.post("/demandes", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { ref: string; id: number; message: string };
}
