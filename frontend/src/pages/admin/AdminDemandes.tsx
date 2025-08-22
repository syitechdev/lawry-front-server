import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Filter,
  Download,
  Eye,
  Edit,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast } from "sonner";

import { http } from "@/lib/http";
import {
  listAdminDemandes,
  getUnreadCount,
  markRead,
  DemandeListItem,
} from "@/services/demandes";

const PER_PAGE = 10;

function statutLabel(status: string) {
  const m: Record<string, string> = {
    recu: "Reçu",
    "en-cours": "En cours",
    "en-attente-client": "En attente client",
    "en-revision": "En révision",
    termine: "Traité",
    annule: "Annulé",
  };
  return m[status] || status;
}

function badgeClass(status: string) {
  const m: Record<string, string> = {
    recu: "bg-gray-100 text-gray-800",
    "en-cours": "bg-blue-100 text-blue-800",
    "en-attente-client": "bg-yellow-100 text-yellow-800",
    "en-revision": "bg-purple-100 text-purple-800",
    termine: "bg-green-100 text-green-800",
    annule: "bg-gray-100 text-gray-800",
  };
  return m[status] || "bg-gray-100 text-gray-800";
}

function clientNameOf(d: DemandeListItem) {
  return (
    d.author?.name ||
    d.meta?.client_name ||
    d.data?.clientNom ||
    d.data?.nom ||
    d.data?.client ||
    "—"
  );
}

export default function AdminDemandes() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [items, setItems] = useState<DemandeListItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load(p = page, query = q) {
    setLoading(true);
    try {
      const res = await listAdminDemandes({
        page: p,
        per_page: PER_PAGE,
        q: query,
      });
      setItems(res.data || []);
      setLastPage(res.meta?.last_page || 1);
      setTotal(res.meta?.total || (res.data ? res.data.length : 0));
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Impossible de charger les demandes"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadUnread() {
    try {
      const n = await getUnreadCount({});
      setUnreadCount(Number.isFinite(n) ? n : 0);
    } catch {
      // silencieux
    }
  }

  useEffect(() => {
    load(1, "");
    loadUnread();
    //
  }, []);

  useEffect(() => {
    //
    load(page, q);
    //
  }, [page]);

  const triggerSearch = async () => {
    setPage(1);
    await load(1, q);
    await loadUnread();
  };

  const goDetail = async (ref: string) => {
    try {
      await markRead(ref);
    } catch {}
    await loadUnread();
    navigate("/admin/demande/" + encodeURIComponent(ref));
  };

  const exporterDonnees = async () => {
    try {
      const res = await http.get("/admin/demandes/export", {
        params: { q },
        responseType: "blob",
        headers: { Accept: "text/csv" },
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `demandes-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Export impossible");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="lg:ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Gestion des Demandes
                </h1>
                <p className="text-red-100">
                  Suivi et traitement des demandes clients
                </p>
              </div>
              {unreadCount > 0 && (
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="text-white font-bold">
                    {unreadCount} non lues
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des Demandes</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Rechercher..."
                  className="w-full sm:w-64"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") triggerSearch();
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={triggerSearch}
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
                    <th className="text-left p-3">Réf.</th>
                    <th className="text-left p-3">Client</th>
                    <th className="text-left p-3">Service</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-left p-3">Assigné à</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d) => (
                    <tr
                      key={d.ref}
                      className={`border-b hover:bg-gray-50 ${
                        !d.is_read ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">{d.ref}</span>
                          {!d.is_read && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">{clientNameOf(d)}</td>
                      <td className="p-3">
                        {(d.type && (d.type.name || d.type.slug)) || "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={badgeClass(d.status)}>
                            {statutLabel(d.status)}
                          </Badge>
                          {d.priority === "urgent" && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {(d.assignee && d.assignee.name) || "—"}
                      </td>
                      <td className="p-3">
                        {d.created_at
                          ? new Date(d.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Voir détails"
                            onClick={() => goDetail(d.ref)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Assigner"
                            onClick={() => goDetail(d.ref)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Messages"
                            onClick={() => goDetail(d.ref)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Modifier"
                            onClick={() => goDetail(d.ref)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune demande trouvée
              </div>
            )}

            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-sm text-gray-600">
                Page {page} / {lastPage} — {items.length} / {total} éléments
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
