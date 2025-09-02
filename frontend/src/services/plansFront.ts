import { http } from "@/lib/http";

export type Plan = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  monthlyPriceCfa: number;
  yearlyPriceCfa: number;
  isTrial?: boolean;
  trialDays?: number;
  isPopular?: boolean;
  features: string[];
  gradient?: string;
};

export const plansFront = {
  async list(): Promise<{ items: Plan[] }> {
    const { data } = await http.get("/public/plans", {
      headers: { Accept: "application/json" },
    });

    return { items: Array.isArray(data) ? data : [] };
  },
};
