import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Filter,
  Download,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { http } from "@/lib/http";

type APIList<T> = {
  items?: T[];
  data?: T[];
  ["hydra:member"]?: T[];
  total?: number;
  ["hydra:totalItems"]?: number;
};

type RawRegistration = any;

type Row = {
  id: number;
  formation_code: string;
  participant: string;
  email?: string | null;
  status: string;
  status_label: string;
  session_format_label: string;
  formation_title?: string | null;
  created_at: string;
  lu: boolean;
};

const pickList = <T,>(payload: APIList<T> | T[] | undefined): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload["hydra:member"])) return payload["hydra:member"];
  return [];
};

const makeFormationCode = (r: any) => {
  const fid = r?.formation?.id ?? r?.formation_id ?? 0;
  return r?.formation?.code || `FORM${String(fid).padStart(3, "0")}`;
};

const adaptRow = (r: RawRegistration): Row => {
  const status = String(r?.status ?? "").toLowerCase();
  const status_label =
    status === "confirmed"
      ? "Confirmé"
      : status === "pending"
      ? "En attente"
      : status === "cancelled"
      ? "Annulé"
      : r?.status ?? "—";

  const fmt = String(r?.session_format ?? "").toLowerCase();
  const session_format_label =
    fmt === "presentiel"
      ? "Présentiel"
      : fmt === "distanciel"
      ? "En ligne"
      : "—";

  const userName: string =
    r?.participant ||
    r?.user?.name ||
    `${r?.first_name ?? r?.user?.first_name ?? ""} ${
      r?.last_name ?? r?.user?.last_name ?? ""
    }`.trim();

  return {
    id: Number(r?.id),
    formation_code: makeFormationCode(r),
    participant: String(userName || "—"),
    email: r?.email ?? r?.user?.email ?? null,
    status: r?.status ?? "",
    status_label,
    session_format_label,
    formation_title: r?.formation?.title ?? r?.formation_title ?? null,
    created_at: r?.created_at ?? r?.createdAt ?? new Date().toISOString(),
    lu: !!(r?.read_at ?? r?.readAt),
  };
};

const getStatutBadge = (label: string) => {
  const colors: Record<string, string> = {
    Confirmé: "bg-green-100 text-green-800",
    "En attente": "bg-yellow-100 text-yellow-800",
    Annulé: "bg-gray-200 text-gray-700",
  };
  return colors[label] || "bg-gray-100 text-gray-800";
};

export default function AdminFormationRegistrations() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const formationId = sp.get("formation_id")
    ? Number(sp.get("formation_id"))
    : undefined;

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<
    "" | "pending" | "confirmed" | "cancelled"
  >("");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (formationId) params.formation_id = formationId;
      if (status) params.status = status;
      if (searchTerm.trim()) params.q = searchTerm.trim();

      const { data } = await http.get("/admin/registrations", { params });
      const list = pickList<RawRegistration>(data).map(adaptRow);
      setRows(list);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Impossible de charger les inscriptions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formationId, status]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.formation_code.toLowerCase().includes(q) ||
        r.participant.toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        String(r.id).toLowerCase().includes(q) ||
        (r.formation_title || "").toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  // Calcul des données paginées
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const voirDetails = async (id: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, lu: true } : r)));
    http.post(`/admin/registrations/${id}/mark-read`).catch(() => {});
    navigate(`/admin/inscription/${id}`);
  };

  const modifierInscription = (id: number) => {
    navigate(`/admin/inscription/${id}#edit`);
  };

  const exporterDonnees = () => {
    const csvContent = [
      [
        "ID",
        "Participant",
        "Email",
        "Statut",
        "Format",
        "Formation",
        "Date",
      ].join(","),
      ...filtered.map((r) =>
        [
          r.id,
          r.participant,
          r.email ?? "",
          r.status_label,
          r.session_format_label,
          r.formation_title ?? "",
          new Date(r.created_at).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inscriptions.csv";
    a.click();
    toast.success("Données exportées avec succès");
  };

  const nonLues = filtered.filter((r) => !r.lu).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Gestion des Inscriptions
                </h1>
                <p className="text-red-100">
                  {formationId
                    ? `Formation #${formationId}`
                    : "Toutes les formations"}
                </p>
              </div>
              {nonLues > 0 && (
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="text-white font-bold">
                    {nonLues} non lues
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des Inscriptions</CardTitle>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Rechercher (code, nom, email, formation, ID)…"
                  className="w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Tous statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="cancelled">Annulé</option>
                </select>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={load}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={exporterDonnees}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Code de la formation</th>
                    <th className="text-left p-3">Participant</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-left p-3">Formation</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td className="p-6 text-gray-500" colSpan={6}>
                        Chargement…
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    paginatedData.map((r) => (
                      <tr
                        key={r.id}
                        className={`border-b hover:bg-gray-50 ${
                          !r.lu ? "bg-red-50/30" : ""
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">
                              {r.formation_code}
                            </span>
                            {!r.lu && (
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                            )}
                          </div>
                        </td>
                        <td className="p-3">{r.participant}</td>
                        <td className="p-3">
                          <Badge className={getStatutBadge(r.status_label)}>
                            {r.status_label}
                          </Badge>
                        </td>
                        <td className="p-3">{r.formation_title || "—"}</td>
                        <td className="p-3">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span
                              role="button"
                              title="Voir détails"
                              aria-label="Voir détails"
                              onClick={() => voirDetails(r.id)}
                              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </span>
                            <span
                              role="button"
                              title="Modifier"
                              aria-label="Modifier"
                              onClick={() => modifierInscription(r.id)}
                              className="p-2 rounded hover:bg-gray-100 cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td className="p-6 text-gray-500 text-center" colSpan={6}>
                        Aucune inscription trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-gray-600">
                    Page {currentPage}/{totalPages} — {paginatedData.length} sur{" "}
                    {filtered.length} éléments
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          // Afficher les numéros de page de manière intelligente
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="h-8 w-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
