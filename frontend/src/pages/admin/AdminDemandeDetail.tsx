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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  type?: { slug: string; version?: number; name?: string };
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
    view_url: string;
  }>;
  messages?: Array<{
    id: number;
    auteur: string;
    sender_role: "client" | "staff";
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

// masquer les infos "contact" pour la section service
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

function ServiceInfo({ data }: { data?: Record<string, any> }) {
  const entries = Object.entries(data ?? {}).filter(([k, v]) => {
    if (EXCLUDE_KEYS.has(k)) return false;
    if (v === null || v === undefined) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    return true;
  });
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Infos liées au service
        </CardTitle>
      </CardHeader>
      <CardContent>
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
  const [enCharge, setEnCharge] = useState(false);

  const [message, setMessage] = useState("");
  const [nouveauStatut, setNouveauStatut] = useState("");
  const [messageDialog, setMessageDialog] = useState(false);
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
  >(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const refresh = async () => {
    try {
      const data = await getAdminDemande(ref);
      setDemande(data);
      const mine = !!(
        data?.assignee?.id &&
        me?.id &&
        data.assignee.id === me.id
      );
      setEnCharge(mine);
    } catch {
      // silencieux
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
        const mine = !!(
          data?.assignee?.id &&
          me?.id &&
          data.assignee.id === me.id
        );
        setEnCharge(mine);
      } catch {
        toast.error("Impossible de charger la demande");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // --------------------- Actions ---------------------
  const prendreEnCharge = async () => {
    if (!demande) return;
    setBusy("take");
    await toast.promise(assignDemande(demande.ref), {
      loading: "Prise en charge...",
      success: "Demande prise en charge",
      error: "Échec de la prise en charge",
    });
    setBusy(null);
    await refresh();
  };

  const envoyerMessage = async () => {
    const body = message.trim();
    if (!body || !demande) return;
    setBusy("message");
    await toast.promise(postAdminMessage(demande.ref, body, false), {
      loading: "Envoi du message...",
      success: "Message envoyé",
      error: "Impossible d’envoyer le message",
    });
    setBusy(null);
    setMessage("");
    setMessageDialog(false);
    await refresh();
    scrollBottom();
  };

  const changerStatut = async () => {
    if (!nouveauStatut || !demande) return;
    setBusy("status");
    await toast.promise(changeStatus(demande.ref, nouveauStatut), {
      loading: "Mise à jour du statut...",
      success: "Statut mis à jour",
      error: "Échec de la mise à jour du statut",
    });
    setBusy(null);
    setNouveauStatut("");
    await refresh();
  };

  // const onUpload = async () => {
  //   if (!files.length || !demande) return;
  //   setBusy("upload");
  //   await toast.promise(uploadAdminFiles(demande.ref, { annexes: files }), {
  //     loading: "Envoi des fichiers...",
  //     success: "Fichiers envoyés",
  //     error: "Échec de l’upload",
  //   });
  //   setBusy(null);
  //   setFiles([]);
  //   await refresh();
  // };
  const onUpload = async () => {
    if (!files.length || !demande) return;
    setBusy("upload");
    const p = uploadAdminFiles(demande.ref, { annexes: files });
    toast.promise(p, {
      loading: "Envoi des fichiers...",
      success: "Fichiers envoyés",
      error: "Échec de l’upload",
    });
    p.then(async () => {
      setFiles([]);
      await refresh();
    }).finally(() => setBusy(null));
  };

  const markUrgent = async () => {
    if (!demande) return;
    setBusy("urgent");
    await toast.promise(setPriority(demande.ref, "urgent"), {
      loading: "Marquage urgent...",
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
      loading: "Mise à jour de l'urgence...",
      success: "Urgence retirée",
      error: "Action impossible",
    });
    setBusy(null);
    await refresh();
  };

  const loadAdmins = async () => {
    try {
      setAdmins(await searchAdminUsers(""));
    } catch {
      setAdmins([]);
    }
  };

  const reassign = async () => {
    if (!demande || !selectedAdmin) return;
    setBusy("assign");
    await toast.promise(assignDemande(demande.ref, selectedAdmin), {
      loading: "Réassignation...",
      success: "Dossier réassigné",
      error: "Réassignation impossible",
    });
    setBusy(null);
    await refresh();
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

  // --------------------- VUE INITIALE (non prise en charge) ---------------------
  if (!enCharge) {
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
                    Détails de la demande
                  </h1>
                  <p className="text-red-100">
                    ID: {demande?.ref} • Service: {typeName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={badgeOf(demande?.status ?? "")}>
                    {labelOf(demande?.status ?? "")}
                  </Badge>
                  {demande?.priority === "urgent" && (
                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            {demande?.author?.email ?? "—"}
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
                            {demande?.data?.telephone ?? "—"}
                          </p>
                          <p className="text-sm text-gray-500">Téléphone</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {demande?.data?.adresse ?? "—"}
                          </p>
                          <p className="text-sm text-gray-500">Adresse</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Infos liées au service */}
              <ServiceInfo data={demande?.data} />

              {/* Documents fournis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents fournis par le client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(demande?.files ?? []).length === 0 && (
                      <div className="text-sm text-gray-500">
                        Aucun document.
                      </div>
                    )}
                    {demande?.files?.map((doc) => (
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
                              {doc.mime ?? "—"} •{" "}
                              {doc.size
                                ? `${Math.round(doc.size / 1024)} Ko`
                                : ""}{" "}
                              •{" "}
                              {doc.created_at
                                ? new Date(doc.created_at).toLocaleString()
                                : ""}
                            </p>
                          </div>
                        </div>
                        <a href={doc.view_url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
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
                      {demande?.paid_amount
                        ? `${demande.paid_amount} ${demande.currency ?? ""}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Statut</p>
                    <Badge className="bg-green-100 text-green-800">
                      {demande?.paid_status ?? "—"}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Devise</p>
                    <p className="font-medium">{demande?.currency ?? "—"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={prendreEnCharge}
                    disabled={busy === "take"}
                    className="w-full bg-red-900 hover:bg-red-800"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {busy === "take"
                      ? "Prise en charge..."
                      : "Prendre en charge la demande"}
                  </Button>

                  <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Envoyer un message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Envoyer un message au client</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Votre message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button
                          onClick={envoyerMessage}
                          disabled={busy === "message"}
                          className="w-full"
                        >
                          {busy === "message" ? "Envoi..." : "Envoyer"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Date de demande:</span>
                    <span>
                      {demande?.created_at
                        ? new Date(demande.created_at).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Statut:</span>
                    <Badge className={badgeOf(demande?.status ?? "")}>
                      {labelOf(demande?.status ?? "")}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Priorité:</span>
                    <Badge
                      className={
                        demande?.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {demande?.priority === "urgent" ? "Urgent" : "Normal"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Infos liées au service (doublée côté droit aussi si tu préfères) */}
              <ServiceInfo data={demande?.data} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------- VUE TRAITEMENT (prise en charge) ---------------------
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
                  ID: {demande?.ref} • Client: {getClientName(demande)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={badgeOf(demande?.status ?? "")}>
                  {labelOf(demande?.status ?? "")}
                </Badge>
                <Badge
                  className={
                    demande?.priority === "urgent"
                      ? "bg-red-100 text-red-800"
                      : "bg-white/20 text-white"
                  }
                >
                  {demande?.priority === "urgent" ? "Urgent" : "Normal"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
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
                  {/* <Progress value={progression} className="h-3" /> */}
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

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Communication avec le client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {(demande?.messages ?? []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender_role === "client"
                          ? "bg-gray-50 mr-8"
                          : "bg-red-50 ml-8"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">
                          {msg.auteur}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.date ? new Date(msg.date).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  ))}
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
                    {(demande?.events ?? []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-3 pb-4 border-b last:border-0"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">
                              {item.event === "assigned" && "Dossier assigné"}
                              {item.event === "status_changed" &&
                                "Statut changé"}
                              {item.event === "files_uploaded" &&
                                "Fichiers ajoutés"}
                              {item.event === "message_posted" &&
                                "Message envoyé"}
                              {![
                                "assigned",
                                "status_changed",
                                "files_uploaded",
                                "message_posted",
                              ].includes(item.event) && item.event}
                            </p>
                            <span className="text-xs text-gray-500">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString()
                                : ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Par {item.actor?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                    ))}

                    {(demande?.events ?? []).length === 0 && (
                      <div className="text-sm text-gray-500">
                        Aucun événement.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
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
                        {demande?.author?.email ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {demande?.author?.email ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Téléphone:</span>{" "}
                      {demande?.data?.telephone ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Adresse:</span>{" "}
                      {demande?.data?.adresse ?? "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Infos liées au service — visible aussi en traitement */}
            <ServiceInfo data={demande?.data} />

            {/* Rappel Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents du dossier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(demande?.files ?? []).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.mime ?? "—"} •{" "}
                            {doc.size
                              ? `${Math.round(doc.size / 1024)} Ko`
                              : ""}{" "}
                            •{" "}
                            {doc.created_at
                              ? new Date(doc.created_at).toLocaleString()
                              : ""}
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
                          href={
                            doc.storage_path
                              ? getFileUrl(doc.storage_path)
                              : "#"
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                  {(demande?.files ?? []).length === 0 && (
                    <div className="text-sm text-gray-500">Aucun document.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
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
                  disabled={busy === "status" || demande?.status === "termine"}
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
                      busy === "urgent" || demande?.priority === "urgent"
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
                      busy === "normal" || demande?.priority === "normal"
                    }
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Retirer l'urgence
                  </Button>
                </div>

                <div className="border rounded p-2">
                  <div className="text-sm font-medium mb-2">Réassigner à</div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 w-full text-sm"
                      onFocus={loadAdmins}
                      value={selectedAdmin ?? ""}
                      onChange={(e) => setSelectedAdmin(Number(e.target.value))}
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
                      {busy === "assign" ? "..." : "OK"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Petit rappel statut/priorité */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Date de demande:</span>
                  <span>
                    {demande?.created_at
                      ? new Date(demande.created_at).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Statut:</span>
                  <Badge className={badgeOf(demande?.status ?? "")}>
                    {labelOf(demande?.status ?? "")}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Priorité:</span>
                  <Badge
                    className={
                      demande?.priority === "urgent"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {demande?.priority === "urgent" ? "Urgent" : "Normal"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
