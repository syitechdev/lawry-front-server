import { http } from "@/lib/http";

export type RegistrationCreate = {
  user_id?: number;
  guest?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    profession?: string | null;
    company?: string | null;
  };
  formations: number[];
  preferences: {
    session_format: "presentiel" | "distanciel" | "mixte";
    preferred_dates?: string | null;
    motivation: string;
    specific_needs?: string | null;
  };
  total_price: number;
  payment_required: boolean;
};

export const registrations = {
  async create(payload: RegistrationCreate) {
    const { data } = await http.post(
      "/public/formation-registrations",
      payload
    );
    return data;
  },
};
