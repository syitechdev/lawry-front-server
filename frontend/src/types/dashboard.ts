export type DashboardStats = {
  demandes_en_cours: number;
  demandes_pretes: number;
  notifications_non_lues: number;
};

export type DashboardDemande = {
  ref: string;
  type: { slug: string; version: number; name: string };
  status: string;
  priority: string;
  paid_status: string;
  paid_amount: number | null;
  submitted_at: string | null;
  progress?: number | null;
  selected_preset?: {
    price?: number | null;
    price_display?: string;
    pricing_mode?: string;
    currency?: string;
    variant_key?: string;
    meta?: any;
  } | null;
};

export type DashboardDocument = {
  id: number;
  demande_ref: string;
  tag: string | null;
  original_name: string;
  path: string;
  mime: string | null;
  size: number;
  created_at: string | null;
};

export type DashboardNotification = {
  id: number;
  demande_ref: string;
  event: string;
  actor_name: string | null;
  payload: any;
  created_at: string | null;
  read_at: string | null;
};

export type DashboardResponse = {
  stats: DashboardStats;
  recent_demandes: DashboardDemande[];
  recent_documents: DashboardDocument[];
  recent_notifications: DashboardNotification[];
  meta: any;
};
