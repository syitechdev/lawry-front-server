import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Download,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
  Save,
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Toaster, toast } from "sonner";
import {
  getAdminDemande,
  markRead,
  assignDemande,
  postAdminMessage,
  uploadAdminFiles,
  changeStatus,
  setPriority,
  searchAdminUsers,
  STATUS_VALUE,
} from "@/services/demandes";
import { getCurrentUser } from "@/lib/auth";
import { getFileUrl } from "@/lib/getFileUrl";

// ------------------------------------
// UI mapping statut
// ------------------------------------
const STATUS_UI = {
  recu: { label: "Reçu", prog: 10, badge: "bg-gray-100 text-gray-800" },
  "en-cours": {
    label: "En cours",
    prog: 50,
    badge: "bg-blue-100 text-blue-800",
  },
  "en-attente-client": {
    label: "En attente client",
    prog: 30,
    badge: "bg-yellow-100 text-yellow-800",
  },
  "en-revision": {
    label: "En révision",
    prog: 75,
    badge: "bg-purple-100 text-purple-800",
  },
  termine: {
    label: "Terminé",
    prog: 100,
    badge: "bg-green-100 text-green-800",
  },
  annule: { label: "Annulé", prog: 100, badge: "bg-red-100 text-red-800" },
} as const;

// ------------------------------------
// Types
// ------------------------------------
type DemandeDetail = {
  ref: string;
  type?: { slug: string; version?: number; name?: string; variant?: any };
  service?: any;
  status: keyof typeof STATUS_UI | string;
  priority?: "urgent" | "normal";
  is_read?: boolean;
  currency?: string;
  paid_status?: string;
  paid_amount?: number | null;
  data?: Record<string, any>;
  meta?: any;
  submitted_at?: string;
  created_at?: string;
  files?: Array<{
    id: number;
    tag?: string | null;
    name: string;
    size?: number | null;
    mime?: string | null;
    created_at?: string;
    storage_path?: string;
    view_url?: string;
  }>;
  messages?: Array<{
    id: number;
    auteur: string;
    sender_role: "client" | "staff";
    sender_id?: number | null;
    is_internal: boolean;
    body: string;
    date: string;
  }>;
  author?: { id: number; name: string; email?: string } | null;
  assignee?: { id: number; name: string; email?: string } | null;
  events?: Array<{
    id: number;
    event: string;
    payload?: any;
    actor?: { id?: number | null; name?: string | null };
    created_at: string;
  }>;
};

// ------------------------------------
// Helpers
// ------------------------------------
function getClientName(d?: DemandeDetail | null) {
  if (!d) return "—";
  return (
    d.author?.name ??
    d.data?.clientNom ??
    d.data?.client_nom ??
    (d.data?.prenom && d.data?.nom
      ? `${d.data.prenom} ${d.data.nom}`
      : undefined) ??
    d.data?.nom ??
    "—"
  );
}
const badgeOf = (st: string) =>
  STATUS_UI[st as keyof typeof STATUS_UI]?.badge ?? "bg-gray-100 text-gray-800";
const labelOf = (st: string) =>
  STATUS_UI[st as keyof typeof STATUS_UI]?.label ?? st;
const progressOf = (st: string) =>
  STATUS_UI[st as keyof typeof STATUS_UI]?.prog ?? 0;

const EXCLUDE_KEYS = new Set([
  "telephone",
  "phone",
  "tel",
  "adresse",
  "address",
  "clientNom",
  "client_nom",
  "prenom",
  "nom",
]);

function formatKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function formatDate(v?: string) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", { timeZone: "Africa/Abidjan" });
}
function formatSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} Ko`;
  return `${(kb / 1024).toFixed(2)} Mo`;
}
function safeFileUrl(doc: any) {
  if (doc?.storage_path) return getFileUrl(String(doc.storage_path));

  if (doc?.view_url && !/^\/?api\//i.test(String(doc.view_url))) {
    return getFileUrl(String(doc.view_url));
  }
  return "#";
}

function formatPriceBlock(demande?: DemandeDetail | null): string {
  if (!demande) return "—";
  if (typeof demande.paid_amount === "number" && demande.paid_amount > 0) {
    return `${new Intl.NumberFormat("fr-FR").format(demande.paid_amount)} ${
      demande.currency ?? ""
    }`.trim();
  }
  const display = demande?.type?.variant?.price?.display;
  if (display) return display;
  const data = demande.data ?? {};
  const ccy =
    data?.price?.currency ||
    data?.payment?.currency ||
    data?.paiement?.currency ||
    demande.currency ||
    "XOF";
  const amt =
    Number(data?.price_amount) ||
    Number(data?.total_amount) ||
    Number(data?.amount) ||
    Number(data?.price?.amount) ||
    Number(data?.payment?.amount) ||
    Number(data?.paiement?.amount) ||
    0;
  if (amt > 0)
    return `${new Intl.NumberFormat("fr-FR").format(amt)} ${ccy}`.trim();
  return demande?.service?.price_display || "—";
}
function paidLabel(raw?: string) {
  const k = String(raw || "").toLowerCase();
  if (k.includes("paid") || k.includes("succeed") || k.includes("confirm"))
    return "Paiement confirmé";
  if (
    k.includes("pending") ||
    k.includes("initiat") ||
    k.includes("process") ||
    k.includes("unpaid") ||
    k.includes("incomplet")
  )
    return "Paiement en attente";
  if (
    k.includes("fail") ||
    k.includes("échou") ||
    k.includes("echec") ||
    k.includes("expire") ||
    k.includes("annul")
  )
    return "Paiement échoué";
  return raw || "—";
}

function paidBadge(raw?: string) {
  const k = String(raw || "").toLowerCase();
  if (k.includes("paid") || k.includes("succeed") || k.includes("confirm"))
    return "bg-green-100 text-green-800";
  if (
    k.includes("pending") ||
    k.includes("initiat") ||
    k.includes("process") ||
    k.includes("unpaid") ||
    k.includes("incomplet")
  )
    return "bg-amber-100 text-amber-800";
  if (
    k.includes("fail") ||
    k.includes("échou") ||
    k.includes("echec") ||
    k.includes("expire") ||
    k.includes("annul")
  )
    return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

// ------------------------------------
// ServiceInfo — plein largeur
// ------------------------------------
function ServiceInfo({ demande }: { demande?: DemandeDetail | null }) {
  const data = demande?.data ?? {};
  const entries = Object.entries(data).filter(([k, v]) => {
    if (EXCLUDE_KEYS.has(k)) return false;
    if (
      [
        "price",
        "payment",
        "paiement",
        "price_amount",
        "total_amount",
        "amount",
        "selected_preset",
      ].includes(k)
    )
      return false;
    if (v === null || v === undefined) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  });

  const preset = data?.selected_preset as
    | { label?: string; price?: string; currency?: string }
    | undefined;

  if (!entries.length && !preset && !demande?.type?.variant) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Infos liées au service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {demande?.type?.variant && (
          <div>
            {demande.type.variant.title && (
              <p className="font-semibold">{demande.type.variant.title}</p>
            )}
            {demande.type.variant.subtitle && (
              <p className="text-sm text-gray-500">
                {demande.type.variant.subtitle}
              </p>
            )}
            {Array.isArray(demande.type.variant.features) &&
              demande.type.variant.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {demande.type.variant.features.map((f: string, i: number) => (
                    <Badge key={i} className="bg-gray-100 text-gray-800">
                      {f}
                    </Badge>
                  ))}
                </div>
              )}
          </div>
        )}

        {preset?.label && (
          <div className="text-sm">
            <span className="font-medium">Formule :</span> {preset.label}
            {preset.price && (
              <>
                {" "}
                — {new Intl.NumberFormat("fr-FR").format(
                  Number(preset.price)
                )}{" "}
                {preset.currency || "XOF"}
              </>
            )}
          </div>
        )}

        {entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map(([k, v]) => (
              <div key={k}>
                <p className="font-medium text-sm text-gray-500">
                  {formatKey(k)}
                </p>
                <p className="font-semibold">
                  {Array.isArray(v)
                    ? v.join(", ")
                    : typeof v === "object"
                    ? JSON.stringify(v)
                    : String(v)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------
// Component
// ------------------------------------
export default function AdminDemandeDetail() {
  const { id } = useParams();
  const ref = id ?? "";
  const navigate = useNavigate();
  const me = getCurrentUser();

  const [demande, setDemande] = useState<DemandeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [nouveauStatut, setNouveauStatut] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [admins, setAdmins] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);

  const [busy, setBusy] = useState<
    | null
    | "take"
    | "status"
    | "urgent"
    | "normal"
    | "assign"
    | "upload"
    | "message"
    | "unassign"
    | "takeover"
  >(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const refresh = async () => {
    try {
      const data = await getAdminDemande(ref);
      setDemande(data);
    } catch {
      toast.error("Impossible de charger la demande");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminDemande(ref);
        setDemande(data);
        try {
          await markRead(ref);
        } catch {}
      } catch {
        toast.error("Impossible de charger la demande");
      } finally {
        setLoading(false);
      }
    })();
  }, [ref]);

  useEffect(() => {
    scrollBottom();
  }, [demande?.messages?.length]);

  const progression = useMemo(
    () => progressOf(demande?.status ?? ""),
    [demande?.status]
  );
  const typeName = useMemo(
    () =>
      demande?.type?.name ??
      demande?.meta?.type_name ??
      demande?.type?.slug ??
      "—",
    [demande]
  );

  const isMine = useMemo(() => {
    if (!demande?.assignee?.id || !me?.id) return false;
    return demande.assignee.id === me.id;
  }, [demande?.assignee?.id, me?.id]);

  // --------------------- Assignation ---------------------
  const loadAdmins = async () => {
    try {
      setAdmins(await searchAdminUsers(""));
    } catch {
      setAdmins([]);
    }
  };

  const prendreEnCharge = async () => {
    if (!demande) return;
    setBusy("take");
    try {
      await assignDemande(demande.ref);
      toast.success("Demande prise en charge");
      await refresh();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      const status = e?.response?.status;
      if (msg === "already_assigned" || status === 409) {
        const current =
          e?.response?.data?.assignee?.name ||
          demande.assignee?.name ||
          "un autre admin";
        const ok = confirm(
          `Cette demande est déjà assignée à ${current}. Prendre quand même ?`
        );
        if (ok) {
          setBusy("takeover");
          await toast.promise(assignDemande(demande.ref, { takeover: true }), {
            loading: "Prise en charge…",
            success: "Prise en charge forcée",
            error: "Échec de la prise en charge",
          });
          await refresh();
        } else {
          toast.info("Action annulée.");
        }
      } else {
        toast.error("Échec de la prise en charge");
      }
    } finally {
      setBusy(null);
    }
  };

  const seRetirer = async () => {
    if (!demande) return;
    const ok = confirm(
      "Vous allez vous désassigner de ce dossier. Continuer ?"
    );
    if (!ok) return;
    setBusy("unassign");
    try {
      await toast.promise(assignDemande(demande.ref, { userId: null }), {
        loading: "Désassignation…",
        success: "Vous n’êtes plus assigné",
        error: "Impossible de se retirer",
      });
      await refresh();
      window.location.reload();
    } finally {
      setBusy(null);
    }
  };

  const reassign = async () => {
    if (!demande || !selectedAdmin) return;
    setBusy("assign");
    try {
      await toast.promise(
        assignDemande(demande.ref, { userId: selectedAdmin }),
        {
          loading: "Réassignation…",
          success: "Dossier réassigné",
          error: "Réassignation impossible",
        }
      );
      await refresh();
      window.location.reload();
    } finally {
      setBusy(null);
      setSelectedAdmin(null);
    }
  };

  // --------------------- Messages ---------------------
  const envoyerMessage = async () => {
    const body = message.trim();
    if (!body || !demande) return;
    setBusy("message");
    await toast.promise(postAdminMessage(demande.ref, body, false), {
      loading: "Envoi du message…",
      success: "Message envoyé",
      error: "Impossible d’envoyer le message",
    });
    setBusy(null);
    setMessage("");
    await refresh();
    scrollBottom();
  };

  // --------------------- Statut / Priorité ---------------------
  const changerStatut = async () => {
    if (!nouveauStatut || !demande) return;
    setBusy("status");
    await toast.promise(changeStatus(demande.ref, nouveauStatut), {
      loading: "Mise à jour du statut…",
      success: "Statut mis à jour",
      error: "Échec de la mise à jour du statut",
    });
    setBusy(null);
    setNouveauStatut("");
    await refresh();
  };

  const markUrgent = async () => {
    if (!demande) return;
    setBusy("urgent");
    await toast.promise(setPriority(demande.ref, "urgent"), {
      loading: "Marquage urgent…",
      success: "Marqué comme urgent",
      error: "Action impossible",
    });
    setBusy(null);
    await refresh();
  };
  const markNormal = async () => {
    if (!demande) return;
    setBusy("normal");
    await toast.promise(setPriority(demande.ref, "normal"), {
      loading: "Mise à jour…",
      success: "Urgence retirée",
      error: "Action impossible",
    });
    setBusy(null);
    await refresh();
  };

  // --------------------- Upload ---------------------
  const onUpload = async () => {
    if (!files.length || !demande) return;
    setBusy("upload");
    const p = uploadAdminFiles(demande.ref, { annexes: files });
    toast.promise(p, {
      loading: "Envoi des fichiers…",
      success: "Fichiers envoyés",
      error: "Échec de l’upload",
    });
    p.then(async () => {
      setFiles([]);
      await refresh();
    }).finally(() => setBusy(null));
  };

  // --------------------- VUE CHARGEMENT ---------------------
  if (loading && !demande) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <Toaster position="top-right" richColors />
        <BackofficeSidebar
          userRole="admin"
          userName="Admin Lawry"
          userEmail="admin@lawry.ci"
        />
        <div className="ml-80 px-8 py-8">
          <div className="text-sm text-gray-500">Chargement…</div>
        </div>
      </div>
    );
  }
  if (!demande) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <Toaster position="top-right" richColors />
        <BackofficeSidebar
          userRole="admin"
          userName="Admin Lawry"
          userEmail="admin@lawry.ci"
        />
        <div className="ml-80 px-8 py-8">
          <div className="text-sm text-gray-500">Demande introuvable.</div>
        </div>
      </div>
    );
  }

  // --------------------- VUE NON ASSIGNÉE À MOI ---------------------
  if (!isMine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <Toaster position="top-right" richColors />
        <BackofficeSidebar
          userRole="admin"
          userName="Admin Lawry"
          userEmail="admin@lawry.ci"
        />

        <div className="ml-80 px-8 py-8 ">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/demandes")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux demandes
            </Button>

            <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Détails de la demande
                  </h1>
                  <p className="text-red-100">
                    ID: {demande.ref} • Service: {typeName}
                  </p>
                  {demande.assignee?.name && (
                    <p className="mt-2 text-sm text-red-100">
                      Assigné à{" "}
                      <span className="font-semibold">
                        {demande.assignee.name}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={badgeOf(demande.status ?? "")}>
                    {labelOf(demande.status ?? "")}
                  </Badge>
                  {demande.priority === "urgent" && (
                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-6">
              {/* Client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations du client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {getClientName(demande)}
                          </p>
                          <p className="text-sm text-gray-500">Nom complet</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {demande.author?.email ?? "—"}
                          </p>
                          <p className="text-sm text-gray-500">Email</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {demande.data?.telephone ?? "—"}
                          </p>
                          <p className="text-sm text-gray-500">Téléphone</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {demande.data?.adresse ?? "—"}
                          </p>
                          <p className="text-sm text-gray-500">Adresse</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Infos liées au service — FULL WIDTH */}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents fournis par le client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(demande.files ?? []).length === 0 && (
                      <div className="text-sm text-gray-500">
                        Aucun document.
                      </div>
                    )}
                    {demande.files?.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              {doc.tag ? `${doc.tag} • ` : ""}
                              {doc.mime ?? "—"} • {formatSize(doc.size)} •{" "}
                              {formatDate(doc.created_at)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={safeFileUrl(doc)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="lg:col-span-3">
                <ServiceInfo demande={demande} />
              </div>
            </div>

            <div className="space-y-6">
              {" "}
              <div className="space-y-6">
                {/* Informations de paiement — TOUJOURS VISIBLE */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Informations de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium text-sm text-gray-500">
                        Montant
                      </p>
                      <p className="font-semibold text-lg">
                        {formatPriceBlock(demande)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-500">
                        Statut
                      </p>
                      <Badge className={paidBadge(demande.paid_status)}>
                        {paidLabel(demande.paid_status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-500">
                        Devise
                      </p>
                      <p className="font-medium">{demande.currency ?? "XOF"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Gestionnaire */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gestionnaire</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Assigné à :</span>{" "}
                      {demande.assignee?.name ?? (
                        <span className="italic">Non assigné</span>
                      )}
                    </div>

                    <Button
                      onClick={prendreEnCharge}
                      disabled={busy === "take" || busy === "takeover"}
                      className="w-full bg-red-900 hover:bg-red-800"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {busy === "take" || busy === "takeover"
                        ? "Prise en charge…"
                        : "Prendre en charge"}
                    </Button>

                    <div className="border rounded p-2">
                      <div className="text-sm font-medium mb-2">
                        Réassigner à
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded px-2 py-1 w-full text-sm"
                          onFocus={loadAdmins}
                          value={selectedAdmin ?? ""}
                          onChange={(e) =>
                            setSelectedAdmin(Number(e.target.value))
                          }
                        >
                          <option value="" disabled>
                            Sélectionner un admin
                          </option>
                          {admins.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={reassign}
                          disabled={!selectedAdmin || busy === "assign"}
                        >
                          {busy === "assign" ? "…" : "OK"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Résumé */}
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Date de demande:</span>
                      <span>{formatDate(demande.created_at) || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Statut:</span>
                      <Badge className={badgeOf(demande.status ?? "")}>
                        {labelOf(demande.status ?? "")}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Priorité:</span>
                      <Badge
                        className={
                          demande.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {demande.priority === "urgent" ? "Urgent" : "Normal"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------- VUE ASSIGNÉE À MOI ---------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <Toaster position="top-right" richColors />
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/demandes")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux demandes
          </Button>

          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Traitement - {typeName}
                </h1>
                <p className="text-red-100">
                  ID: {demande.ref} • Client: {getClientName(demande)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={badgeOf(demande.status ?? "")}>
                  {labelOf(demande.status ?? "")}
                </Badge>
                <Badge
                  className={
                    demande.priority === "urgent"
                      ? "bg-red-100 text-red-800"
                      : "bg-white/20 text-white"
                  }
                >
                  {demande.priority === "urgent" ? "Urgent" : "Normal"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Infos client */}
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{getClientName(demande)}</p>
                      <p className="text-sm text-gray-500">
                        {demande.author?.email ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {demande.author?.email ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Téléphone:</span>{" "}
                      {demande.data?.telephone ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Adresse:</span>{" "}
                      {demande.data?.adresse ?? "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestion du statut */}
            <Card>
              <CardHeader>
                <CardTitle>Gestion du dossier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Changer le statut
                    </label>
                    <Select
                      value={nouveauStatut}
                      onValueChange={setNouveauStatut}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={STATUS_VALUE.recu}>
                          Reçu (10%)
                        </SelectItem>
                        <SelectItem value={STATUS_VALUE.enCours}>
                          En cours (50%)
                        </SelectItem>
                        <SelectItem value={STATUS_VALUE.enAttenteClient}>
                          En attente client (30%)
                        </SelectItem>
                        <SelectItem value={STATUS_VALUE.enRevision}>
                          En révision (75%)
                        </SelectItem>
                        <SelectItem value={STATUS_VALUE.termine}>
                          Terminé (100%)
                        </SelectItem>
                        <SelectItem value={STATUS_VALUE.annule}>
                          Annulé (100%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={changerStatut}
                      disabled={!nouveauStatut || busy === "status"}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {busy === "status" ? "Mise à jour..." : "Mettre à jour"}
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progression actuelle</span>
                    <span>{progression}%</span>
                  </div>
                  <Progress
                    value={progression}
                    className={`h-3 ${
                      nouveauStatut === STATUS_VALUE.annule
                        ? "[&>div]:bg-gray-400"
                        : progression === 100
                        ? "[&>div]:bg-green-600"
                        : progression >= 75
                        ? "[&>div]:bg-emerald-500"
                        : progression >= 50
                        ? "[&>div]:bg-blue-500"
                        : progression >= 25
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-red-500"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
            {/* Documents (rappel) */}
            <Card>
              <CardHeader>
                <CardTitle>Documents du dossier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(demande.files ?? []).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.mime ?? "—"} • {formatSize(doc.size)} •{" "}
                            {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        title="Ouvrir / Télécharger"
                      >
                        <a
                          href={safeFileUrl(doc)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                  {(demande.files ?? []).length === 0 && (
                    <div className="text-sm text-gray-500">Aucun document.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Joindre des documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Glissez vos fichiers ici ou cliquez pour sélectionner
                  </p>
                  <Input
                    type="file"
                    multiple
                    className="mb-2"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUpload}
                    disabled={files.length === 0 || busy === "upload"}
                  >
                    {busy === "upload" ? "Envoi..." : "Envoyer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Résumé */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Date de demande:</span>
                  <span>{formatDate(demande.created_at) || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Statut:</span>
                  <Badge className={badgeOf(demande.status ?? "")}>
                    {labelOf(demande.status ?? "")}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Priorité:</span>
                  <Badge
                    className={
                      demande.priority === "urgent"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {demande.priority === "urgent" ? "Urgent" : "Normal"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Informations de paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-500">Montant</p>
                  <p className="font-semibold text-lg">
                    {formatPriceBlock(demande)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-500">Statut</p>
                  <Badge className={paidBadge(demande.paid_status)}>
                    {paidLabel(demande.paid_status)}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-500">Devise</p>
                  <p className="font-medium">{demande.currency ?? "XOF"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides + gestionnaire (moi) */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  onClick={async () => {
                    setNouveauStatut(STATUS_VALUE.termine);
                    await changerStatut();
                  }}
                  disabled={busy === "status" || demande.status === "termine"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marquer comme terminé
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    onClick={markUrgent}
                    disabled={
                      busy === "urgent" || demande.priority === "urgent"
                    }
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Marquer comme urgent
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    onClick={markNormal}
                    disabled={
                      busy === "normal" || demande.priority === "normal"
                    }
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Retirer l'urgence
                  </Button>
                </div>

                {/* Gestionnaire quand c'est moi */}
                <div className="border rounded p-2 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Assigné à :</span>{" "}
                    {demande.assignee?.name ?? (
                      <span className="italic">Non assigné</span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={seRetirer}
                    disabled={busy === "unassign"}
                  >
                    {busy === "unassign" ? "…" : "Se retirer"}
                  </Button>

                  <div>
                    <div className="text-sm font-medium mb-2">Réassigner à</div>
                    <div className="flex items-center gap-2">
                      <select
                        className="border rounded px-2 py-1 w-full text-sm"
                        onFocus={loadAdmins}
                        value={selectedAdmin ?? ""}
                        onChange={(e) =>
                          setSelectedAdmin(Number(e.target.value))
                        }
                      >
                        <option value="" disabled>
                          Sélectionner un admin
                        </option>
                        {admins.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={reassign}
                        disabled={!selectedAdmin || busy === "assign"}
                      >
                        {busy === "assign" ? "…" : "OK"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="my-5">
          {/* Communication + Historique côte à côte */}
          <div className="grid grid-cols-1 lg:grid-cols-2  mt-5 gap-6">
            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Communication avec le client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {(demande.messages ?? []).map((msg) => {
                    const isClient = msg.sender_role === "client";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isClient ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[75%] shadow-sm
            ${
              isClient
                ? "bg-gray-100 text-gray-800 border border-gray-200"
                : "bg-red-600 text-white border border-red-700"
            }`}
                        >
                          <div className="flex justify-between items-center mb-1 gap-4">
                            <span className="font-medium text-sm">
                              {isClient ? "Client" : msg.auteur || "Équipe"}
                            </span>
                            <span className="text-xs opacity-80">
                              {formatDate(msg.date)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.body}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Répondre au client..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    onClick={envoyerMessage}
                    disabled={busy === "message"}
                    className="bg-red-900 hover:bg-red-800"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {busy === "message" ? "Envoi..." : "Envoyer"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Historique */}
            <Card>
              <CardHeader>
                <CardTitle>Historique du dossier</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4 pr-2">
                    {(demande.events ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-3 pb-4 border-b last:border-0"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">
                              {item.event === "assigned" && "Dossier assigné"}
                              {item.event === "reassigned" &&
                                "Dossier réassigné"}
                              {item.event === "unassigned" &&
                                "Dossier désassigné"}
                              {item.event === "status_changed" &&
                                "Statut changé"}
                              {item.event === "files_uploaded" &&
                                "Fichiers ajoutés"}
                              {item.event === "message_posted" &&
                                "Message envoyé"}
                              {![
                                "assigned",
                                "reassigned",
                                "unassigned",
                                "status_changed",
                                "files_uploaded",
                                "message_posted",
                              ].includes(item.event) && item.event}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Par {item.actor?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                    ))}

                    {(demande.events ?? []).length === 0 && (
                      <div className="text-sm text-gray-500">
                        Aucun événement.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          {/* Infos liées au service — FULL WIDTH */}
          <div className="lg:col-span-3 mt-5">
            <ServiceInfo demande={demande} />
          </div>
        </div>
      </div>
    </div>
  );
}
