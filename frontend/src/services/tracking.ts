import { http } from "@/lib/http";

export type TrackingStep = {
  name: string;
  status: "completed" | "current" | "pending";
  date?: string | null;
};

export type TrackingResponse = {
  number: string;
  type: string;
  status:
    | "recu"
    | "en-cours"
    | "en-attente-client"
    | "en-revision"
    | "termine"
    | "annule"
    | string;
  progress: number;
  dates: {
    created_at?: string | null;
    submitted_at?: string | null;
    estimated_completion?: string | null;
  };
  client_hint?: string | null;
  steps: TrackingStep[];
};

export async function trackDemande(
  ref: string
): Promise<TrackingResponse | null> {
  try {
    const { data } = await http.get("/track", { params: { ref } });
    const tracking = data?.tracking ?? data?.data?.tracking ?? null;

    return tracking as TrackingResponse | null;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}
