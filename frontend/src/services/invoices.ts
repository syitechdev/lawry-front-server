import { http } from "@/lib/http";

export type PaymentStatus =
  | "pending"
  | "initiated"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired";

export type Payment = {
  id: number;
  reference: string;
  amount: number;
  currency?: string | null;
  status: PaymentStatus;
  created_at?: string | null;
  paid_at?: string | null;
};

const LIST_PATH = "/client/payments"; 
const INVOICE_PATH = (id: number) => `/client/payments/${id}/invoice.pdf`;

export async function listMyPayments(): Promise<Payment[]> {
  const { data } = await http.get(LIST_PATH, {
    headers: { Accept: "application/json" },
  });
  return Array.isArray(data?.data) ? data.data : data;
}

export async function fetchInvoiceBlob(id: number): Promise<Blob> {
  const res = await http.get(INVOICE_PATH(id), {
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });
  return new Blob([res.data], { type: "application/pdf" });
}

export async function openInvoiceInNewTab(id: number): Promise<void> {
  const blob = await fetchInvoiceBlob(id);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
