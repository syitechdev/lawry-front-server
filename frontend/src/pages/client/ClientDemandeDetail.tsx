import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Download,
  MessageSquare,
  FileText,
  Upload,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { getFileUrl } from "@/lib/getFileUrl";
import { getCurrentUser } from "@/lib/auth";

// -------- Types --------
type DemandeEvent = {
  id: number;
  event: string;
  actor_name?: string | null;
  created_at?: string | null;
};
type DemandeFile = {
  id: number;
  original_name: string;
  path: string; // ex: "storage/demandes/..../file.pdf"
  mime?: string | null;
  created_at?: string | null;
};
type DemandeMessage = {
  id: number;
  sender_id?: number | null; // ⬅️ utilisé pour l’alignement
  sender_role?: string | null; // fallback si pas de sender_id
  body: string;
  created_at?: string | null;
};
type DemandeDetail = {
  ref: string;
  type: { slug: string; name: string; version: number };
  status: string;
  description?: string | null;
  progress?: number | null; // si backend fournit
  submitted_at?: string | null;
};
type FormationDetail = {
  code: string;
  title: string;
  description?: string | null;
  price_cfa?: number | null;
  trainer?: string | null;
  date?: string | null;
  modules?: Array<{ title?: string; content?: string }>;
};
type RegistrationLight = {
  status: string;
  amount_cfa?: number | null;
  session_format?: string | null;
  experience?: string | null;
  created_at?: string | null;
};

// -------- Status maps --------
const STATUS_LABEL: Record<string, string> = {
  recu: "Reçu",
  en_cours: "En cours",
  en_attente_client: "En attente client",
  en_revision: "En révision",
  pret: "Terminé",
  termine: "Terminé",
  annule: "Annulé",
  paid: "Payé",
  pending: "En attente",
};
const STATUS_BADGE: Record<string, string> = {
  recu: "bg-gray-100 text-gray-800",
  en_cours: "bg-blue-100 text-blue-800",
  en_attente_client: "bg-yellow-100 text-yellow-800",
  en_revision: "bg-purple-100 text-purple-800",
  pret: "bg-green-100 text-green-800",
  termine: "bg-green-100 text-green-800",
  annule: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
};
const STATUS_PROGRESS: Record<string, number> = {
  recu: 10,
  en_cours: 50,
  en_attente_client: 30,
  en_revision: 75,
  pret: 100,
  termine: 100,
  annule: 100,
  paid: 100,
  pending: 0,
};

// -------- Helpers statut/progression --------
const clamp = (n: number) => Math.max(0, Math.min(100, n));

const normalizeStatus = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

// ⬇️ le statut prime; fallback seulement si pas de statut
const progressFromStatus = (status?: string, fallback?: number | null) => {
  const code = normalizeStatus(status);
  if (code)
    return (
      STATUS_PROGRESS[code] ??
      (typeof fallback === "number" ? clamp(fallback) : 0)
    );
  if (typeof fallback === "number") return clamp(fallback);
  return 0;
};

// -------- Helpers paiement --------
const pickCurrency = (d?: any) =>
  d?.currency || d?.price?.currency || d?.payment?.currency || "XOF";

const pickAmount = (d?: any) => {
  const n =
    d?.amount_cfa ??
    d?.amount ??
    d?.total_amount ??
    d?.price_cfa ??
    d?.price?.amount ??
    d?.payment?.amount;
  return n != null ? Number(n) : null;
};

const pickPaidStatus = (d?: any) =>
  (d?.paid_status || d?.payment_status || d?.status || "").toLowerCase();

// =======================================================
// Component
// =======================================================
const ClientDemandeDetail = () => {
  const { ref: refParam } = useParams<{ ref: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Fallback si jamais le param route ne passe pas
  const match = location.pathname.match(/\/(demande|formation)\/([^/]+)$/i);
  const resolvedRef = refParam ?? match?.[2] ?? "";

  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<"demande" | "formation" | null>(null);

  const [demande, setDemande] = useState<DemandeDetail | null>(null);
  const [events, setEvents] = useState<DemandeEvent[]>([]);
  const [files, setFiles] = useState<DemandeFile[]>([]);
  const [messages, setMessages] = useState<DemandeMessage[]>([]);
  const [message, setMessage] = useState("");

  const [formation, setFormation] = useState<FormationDetail | null>(null);
  const [registration, setRegistration] = useState<RegistrationLight | null>(
    null
  );

  const [detailUrl, setDetailUrl] = useState<string>("");

  const me = getCurrentUser(); // utilisé pour l’alignement des messages

  // ------- Load initial -------
  useEffect(() => {
    let alive = true;

    if (!resolvedRef) {
      setLoading(false);
      toast.error("Référence manquante dans l’URL.");
      return;
    }

    const url = `/client/orders/${encodeURIComponent(resolvedRef)}`;
    setDetailUrl(url);

    (async () => {
      setLoading(true);
      try {
        const { data } = await http.get(url);
        if (!alive) return;

        if (data?.kind === "formation") {
          setKind("formation");
          setDemande(null);
          setEvents([]);
          setFiles([]);
          setMessages([]);
          setFormation(data.formation ?? null);
          setRegistration(data.registration ?? null);
        } else if (data?.kind === "demande") {
          setKind("demande");
          const d: DemandeDetail = data.demande;
          // ⬇️ on ne force pas progress ici; on laisse le useMemo calculer
          setFormation(null);
          setRegistration(null);
          setDemande(d);
          setEvents(Array.isArray(data.events) ? data.events : []);
          setFiles(Array.isArray(data.files) ? data.files : []);
          setMessages(Array.isArray(data.messages) ? data.messages : []);

          try {
            await http.post(
              `/client/demandes/${encodeURIComponent(resolvedRef)}/mark-read`
            );
          } catch {}
        } else {
          toast.error("Réponse inattendue (type inconnu).");
        }
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger le détail.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [resolvedRef]);

  // ------- Refresh (réutilise l’URL) -------
  const refresh = async () => {
    if (!detailUrl) return;
    try {
      const { data } = await http.get(detailUrl);
      if (data?.kind === "formation") {
        setKind("formation");
        setDemande(null);
        setEvents([]);
        setFiles([]);
        setMessages([]);
        setFormation(data.formation ?? null);
        setRegistration(data.registration ?? null);
      } else if (data?.kind === "demande") {
        setKind("demande");
        const d: DemandeDetail = data.demande;
        setFormation(null);
        setRegistration(null);
        setDemande(d);
        setEvents(Array.isArray(data.events) ? data.events : []);
        setFiles(Array.isArray(data.files) ? data.files : []);
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      }
    } catch {}
  };

  // ------- Memos / UI helpers -------
  const demandeProgress = useMemo(() => {
    return progressFromStatus(demande?.status, demande?.progress ?? null);
  }, [demande?.status, demande?.progress]);

  const badgeClass = (code: string) =>
    STATUS_BADGE[code] ?? "bg-gray-100 text-gray-800";
  const badgeLabel = (code: string) =>
    STATUS_LABEL[code] ?? (code ? code[0].toUpperCase() + code.slice(1) : "—");

  // ------- Actions -------
  const envoyerMessage = async () => {
    if (!message.trim() || !demande) return;
    const body = message.trim();
    setMessage("");
    try {
      await http.post(
        `/client/demandes/${encodeURIComponent(demande.ref)}/messages`,
        { body }
      );
      toast.success("Message envoyé");
      await refresh();
    } catch {
      toast.error("Échec d’envoi du message");
      setMessage(body);
    }
  };

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || !demande) return;
    const form = new FormData();
    Array.from(fileList).forEach((f) => form.append("files[]", f));
    try {
      await http.post(
        `/client/demandes/${encodeURIComponent(demande.ref)}/files`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Fichier(s) envoyés");
      await refresh();
    } catch {
      toast.error("Échec d’upload");
    }
  };

  const backTo = () => navigate("/client/commandes");

  // ===================== UI =====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar userRole="client" userName="—" userEmail="—" />
        <div className="lg:ml-80 px-6 py-8">
          <p className="text-xs text-gray-500 mb-2">
            ref: <code>{resolvedRef || "(vide)"}</code>
          </p>
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-40 rounded bg-gray-200" />
            <div className="h-28 rounded-xl bg-red-200/30" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 rounded-xl bg-gray-200 lg:col-span-2" />
              <div className="h-64 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Vue Formation ----------
  if (kind === "formation" && formation) {
    const paid = (registration?.status ?? "").toLowerCase() === "paid";
    const pay = registration?.amount_cfa ?? formation.price_cfa ?? null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar
          userRole="client"
          userName="Jean Kouassi"
          userEmail="jean@email.com"
        />
        <div className="lg:ml-80 px-6 py-8">
          <p className="text-xs text-gray-500 mb-2">
            ref: <code>{resolvedRef}</code>
          </p>
          <Button variant="outline" onClick={backTo} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>

          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">{formation.title}</h1>
                <p className="text-red-100">
                  Code: {formation.code} • Formateur: {formation.trainer ?? "—"}
                </p>
              </div>
              <Badge
                className={paid ? STATUS_BADGE.paid : STATUS_BADGE.pending}
              >
                {paid ? "Payé" : "En attente"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Détails de la formation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formation.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p>{formation.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formation.date ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montant</p>
                      <p className="font-medium">
                        {pay
                          ? `${Number(pay).toLocaleString("fr-FR")} XOF`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Format</p>
                      <p className="font-medium">
                        {registration?.session_format ?? "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {Array.isArray(formation.modules) &&
                formation.modules.length > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Programme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[28rem] overflow-y-auto pr-1 space-y-4">
                        {formation.modules.map((m, i) => (
                          <div key={i} className="p-3 border rounded-lg">
                            <p className="font-medium">
                              {m.title ?? `Module ${i + 1}`}
                            </p>
                            {m.content && (
                              <p className="text-sm text-gray-600 mt-1">
                                {m.content}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Informations d’inscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Statut paiement</span>
                    <span className="font-medium">
                      {paid ? "Payé" : "En attente"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Montant</span>
                    <span className="font-medium">
                      {pay ? `${Number(pay).toLocaleString("fr-FR")} XOF` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Vue Demande ----------
  if (kind === "demande" && demande) {
    const statusCode = normalizeStatus(demande.status);
    const progress = clamp(demandeProgress);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar
          userRole="client"
          userName="Jean Kouassi"
          userEmail="jean@email.com"
        />
        <div className="lg:ml-80 px-6 py-8">
          <p className="text-xs text-gray-500 mb-2">
            ref: <code>{resolvedRef}</code>
          </p>
          <Button variant="outline" onClick={backTo} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>

          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {demande.type?.name ?? "Demande"}
                </h1>
                <p className="text-red-100">
                  Ref: {demande.ref} • Type: {demande.type?.slug}
                </p>
              </div>
              <Badge className={badgeClass(statusCode)}>
                {badgeLabel(statusCode)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Détails de la demande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demande.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p>{demande.description}</p>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Historique du dossier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[28rem] overflow-y-auto pr-1 space-y-4">
                    {events.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        Aucun événement.
                      </div>
                    ) : (
                      events.map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-start space-x-3 pb-4 border-b last:border-0"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{ev.event}</p>
                              <span className="text-xs text-gray-500">
                                {ev.created_at
                                  ? new Date(ev.created_at).toLocaleString(
                                      "fr-FR"
                                    )
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Par {ev.actor_name || "Système"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                    {messages.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        Aucun message.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine =
                          (typeof msg.sender_id === "number" &&
                            me?.id &&
                            msg.sender_id === me.id) ||
                          ((msg.sender_role ?? "").toLowerCase() === "client" &&
                            !msg.sender_id);

                        const ts = msg.created_at
                          ? new Date(msg.created_at).toLocaleString("fr-FR")
                          : "";

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isMine ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-lg max-w-[85%] shadow-sm border
                                ${
                                  isMine
                                    ? "bg-white border-red-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                            >
                              <div className="flex justify-between items-center mb-1 gap-4">
                                <span className="font-medium text-sm">
                                  {isMine ? "Vous" : "Équipe"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {ts}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.body}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <Textarea
                      placeholder="Tapez votre message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mb-2"
                    />
                    <Button
                      onClick={envoyerMessage}
                      className="bg-red-900 hover:bg-red-800"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" /> Envoyer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              {/* Paiement (toujours affiché) */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const amount = pickAmount(demande);
                    const currency = pickCurrency(demande);
                    const paidCode = pickPaidStatus(demande);
                    const isPaid = ["paid", "succeeded", "termine"].includes(
                      paidCode
                    );
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Montant</span>
                          <span className="font-medium">
                            {amount != null
                              ? `${amount.toLocaleString("fr-FR")} ${currency}`
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Statut</span>
                          <Badge
                            className={
                              isPaid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {isPaid ? "Payé" : paidCode || "—"}
                          </Badge>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[28rem] overflow-y-auto pr-1 space-y-3">
                    {files.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        Aucun document disponible.
                      </div>
                    ) : (
                      files.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 text-red-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {doc.original_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {doc.mime || "—"} •{" "}
                                {doc.created_at
                                  ? new Date(doc.created_at).toLocaleDateString(
                                      "fr-FR"
                                    )
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={getFileUrl(doc.path)}
                              target="__blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Joindre des documents</span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(e) => uploadFiles(e.target.files)}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Fallback ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="client" userName="—" userEmail="—" />
      <div className="lg:ml-80 px-6 py-8">
        <p className="text-xs text-gray-500 mb-3">
          ref: <code>{resolvedRef || "(vide)"}</code>
        </p>
        <p className="text-sm text-gray-600">Aucune donnée trouvée.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/client/commandes")}
        >
          Retour à la liste
        </Button>
      </div>
    </div>
  );
};

export default ClientDemandeDetail;
