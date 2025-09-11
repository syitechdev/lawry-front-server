import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  MessageSquare,
  Eye,
  Bell,
  ShoppingCart,
  CreditCard,
  User,
  Circle,
  Smartphone,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { getFileUrl } from "@/lib/getFileUrl";

// ---- Types API
type DashboardStats = {
  demandes_en_cours: number;
  demandes_pretes: number;
  notifications_non_lues: number;
};

type DashboardDemande = {
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

type DashboardDocument = {
  id: number;
  demande_ref: string;
  tag: string | null;
  original_name: string;
  path: string;
  mime: string | null;
  size: number;
  created_at: string | null;
};

type DashboardNotification = {
  id: number;
  demande_ref: string;
  event: string;
  actor_name: string | null;
  payload: any;
  created_at: string | null;
  read_at: string | null;
};

type DashboardResponse = {
  stats: DashboardStats;
  recent_demandes: DashboardDemande[];
  recent_documents: DashboardDocument[];
  recent_notifications: DashboardNotification[];
  meta: any;
};

const STATUS_LABEL: Record<string, string> = {
  recu: "Reçu",
  en_cours: "En cours",
  en_attente_client: "En attente client",
  en_revision: "En révision",
  pret: "Terminé", // "
  termine: "Terminé",
  annule: "Annulé",
};

const STATUS_BADGE: Record<string, string> = {
  recu: "bg-gray-100 text-gray-800",
  en_cours: "bg-blue-100 text-blue-800",
  en_attente_client: "bg-yellow-100 text-yellow-800",
  en_revision: "bg-purple-100 text-purple-800",
  pret: "bg-green-100 text-green-800",
  termine: "bg-green-100 text-green-800",
  annule: "bg-red-100 text-red-800",
};

const STATUS_PROGRESS: Record<string, number> = {
  recu: 10,
  en_cours: 50,
  en_attente_client: 30,
  en_revision: 75,
  termine: 100,
  pret: 100,
  annule: 100,
};

const ClientDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    demandes_en_cours: 0,
    demandes_pretes: 0,
    notifications_non_lues: 0,
  });
  const [demandes, setDemandes] = useState<DashboardDemande[]>([]);
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    []
  );

  // ---- Load API
  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get<DashboardResponse>(
          "/client/dashboard",
          {
            params: {
              limit_demandes: 33,
              limit_documents: 35,
              limit_notifications: 105,
            },
          }
        );
        setStats(data.stats);
        setDemandes(data.recent_demandes);
        setDocuments(data.recent_documents);
        setNotifications(data.recent_notifications);
      } catch {
        toast.error("Impossible de charger votre tableau de bord");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const notificationsNonLues = stats.notifications_non_lues;
  const demandesEnCours = stats.demandes_en_cours;

  const ouvrirDemande = (ref: string) => {
    navigate(`/client/demande/${ref}`);
  };

  const getStatutBadge = (code: string) =>
    STATUS_BADGE[code] ?? "bg-gray-100 text-gray-800";

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  const normalizeStatus = (s?: string) =>
    (s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") //
      .trim()
      .replace(/[\s-]+/g, "_");

  const getProgress = (d: DashboardDemande) => {
    const code = normalizeStatus(d.status);
    if (code && STATUS_PROGRESS[code] !== undefined) {
      return STATUS_PROGRESS[code];
    }
    if (typeof d.progress === "number") {
      return clamp(d.progress);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar userRole="client" userName="—" userEmail="—" />
        <div className="lg:ml-80 px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-24 rounded-xl bg-red-200/30" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-28 rounded-xl bg-gray-200" />
              <div className="h-28 rounded-xl bg-gray-200" />
              <div className="h-28 rounded-xl bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="h-64 rounded-xl bg-gray-200" />
              <div className="h-64 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="client"
        userName="Jean Kouassi"
        userEmail="jean@email.com"
      />

      <div className="lg:ml-80 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl lg:rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Mon Espace Client
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Gérez vos demandes et suivez vos dossiers juridiques
                </p>
              </div>
              <div className="text-center lg:text-right space-y-2">
                <p className="text-lg sm:text-xl font-bold">Bienvenue </p>
                {/* <p className="text-red-200 text-sm">Client Premium</p> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
                  asChild
                >
                  <Link to="/chatbot?section=app-download">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Télécharger l'app
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Demandes En Cours
              </CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demandesEnCours}</div>
              <p className="text-xs text-blue-100">Suivi en temps réel</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documents prêts
              </CardTitle>
              <Download className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-green-100">À télécharger</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Notifications
              </CardTitle>
              <MessageSquare className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationsNonLues}</div>
              <p className="text-xs text-yellow-100">Récentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 lg:mb-8">
          {/* Mes Demandes (scrollable) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Mes Demandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[28rem] overflow-y-auto pr-1 space-y-4">
                {demandes.length === 0 && (
                  <div className="text-sm text-gray-600">
                    Aucune demande récente.
                  </div>
                )}
                {demandes.map((d) => {
                  const label = STATUS_LABEL[d.status] ?? d.status;
                  const progress = getProgress(d);
                  return (
                    <div
                      key={d.ref}
                      className="border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md border-gray-200"
                      onClick={() => ouvrirDemande(d.ref)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm sm:text-base truncate">
                            {d.type.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Ref: {d.ref}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0 ml-2">
                          <Badge
                            className={`${getStatutBadge(d.status)} text-xs`}
                          >
                            {label} ({progress}%)
                          </Badge>
                          {d.paid_status === "paid" && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Payé
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span>Progression</span>
                          <span>{progress}%</span>
                        </div>
                        {/* Progression : valeur dérivée ou fournie par l'API */}
                        <Progress value={progress} className="h-2" />
                      </div>

                      {d.selected_preset?.price_display && (
                        <div className="text-xs sm:text-sm text-gray-600">
                          Offre: {d.selected_preset.price_display}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            ouvrirDemande(d.ref);
                          }}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Voir détails
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notifications (scrollable) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Notifications Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[28rem] overflow-y-auto pr-1 space-y-3">
                {notifications.length === 0 && (
                  <div className="text-sm text-gray-600">
                    Aucune notification récente.
                  </div>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Circle className="h-2 w-2 text-red-500 fill-current" />
                      <Bell className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">
                        <span className="font-medium">
                          {n.actor_name || "Système"}
                        </span>{" "}
                        {n.event} —{" "}
                        <span className="text-gray-600">
                          Demande {n.demande_ref}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {n.created_at?.replace("T", " ").replace("Z", "")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents (scrollable) */}
        <Card className="shadow-lg mb-6 lg:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Documents Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[28rem] overflow-y-auto pr-1 space-y-3">
              {documents.length === 0 ? (
                <div className="text-sm text-gray-600">
                  Aucun document disponible.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {doc.original_name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {doc.mime || "—"} • {doc.created_at?.split("T")[0]} •{" "}
                          {doc.demande_ref}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm w-full sm:w-auto flex-shrink-0"
                      asChild
                    >
                      <a
                        href={getFileUrl(doc.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Télécharger
                      </a>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <ShoppingCart className="h-6 sm:h-8 w-6 sm:w-8 text-red-700 mx-auto mb-3" />
              <h3 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">
                Boutique
              </h3>
              <p className="text-xs sm:text-sm text-red-700 mb-4">
                Modèles et documents juridiques
              </p>
              <Button
                className="bg-red-900 hover:bg-red-800 w-full text-xs sm:text-sm"
                asChild
              >
                <Link to="/client/boutique">Parcourir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <CreditCard className="h-6 sm:h-8 w-6 sm:w-8 text-blue-700 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                Paiements
              </h3>
              <p className="text-xs sm:text-sm text-blue-700 mb-4">
                Gérez vos factures
              </p>
              <Button
                variant="outline"
                className="border-blue-700 text-blue-700 w-full text-xs sm:text-sm"
                asChild
              >
                <Link to="/client/paiements">Voir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-green-700 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">
                Mon Profil
              </h3>
              <p className="text-xs sm:text-sm text-green-700 mb-4">
                Informations personnelles
              </p>
              <Button
                variant="outline"
                className="border-green-700 text-green-700 w-full text-xs sm:text-sm"
                asChild
              >
                <Link to="/client/profil">Modifier</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <Smartphone className="h-6 sm:h-8 w-6 sm:w-8 text-purple-700 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">
                App Mobile
              </h3>
              <p className="text-xs sm:text-sm text-purple-700 mb-4">
                Téléchargez l'application
              </p>
              <Button
                className="bg-purple-700 hover:bg-purple-800 w-full text-xs sm:text-sm"
                asChild
              >
                <Link to="/chatbot?section=app-download">Télécharger</Link>
              </Button>
            </CardContent>
          </Card>
        </div> */}

        {/* Aide */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Besoin d'aide ?
            </h3>
            <p className="text-red-700 mb-4 text-sm sm:text-base">
              Notre équipe est là pour vous accompagner dans vos démarches
              juridiques
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                className="bg-red-900 hover:bg-red-800 w-full sm:w-auto text-xs sm:text-sm"
                asChild
              >
                <Link to="/chatbot">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Lawry AI
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-red-900 text-red-900 hover:bg-red-50 w-full sm:w-auto text-xs sm:text-sm"
                asChild
              >
                <Link to="/contact">Contacter un conseiller</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
