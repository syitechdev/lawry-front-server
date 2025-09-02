// src/pages/admin/AdminConseils.tsx
import React, { useEffect, useMemo, useState } from "react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Eye,
  MailOpen,
  Mail,
  Download,
  Filter,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { conseilsAdmin } from "@/services/conseils";
import type { Conseil, ConseilStats } from "@/services/conseils";

const statusBadge = (st: string) => {
  const map: Record<string, string> = {
    nouveau: "bg-gray-100 text-gray-800",
    en_cours: "bg-blue-100 text-blue-800",
    traite: "bg-green-100 text-green-800",
    clos: "bg-purple-100 text-purple-800",
    spam: "bg-red-100 text-red-800",
  };
  return map[st] || "bg-gray-100 text-gray-800";
};

const AdminConseils: React.FC = () => {
  const { toast } = useToast();
  const success = (d: string, t = "Succès") =>
    toast({ title: t, description: d });
  const errorToast = (d: string, t = "Erreur") =>
    toast({ title: t, description: d, variant: "destructive" });

  // Data
  const [items, setItems] = useState<Conseil[]>([]);
  const [stats, setStats] = useState<ConseilStats | null>(null);
  const [loading, setLoading] = useState(true);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [viewing, setViewing] = useState<Conseil | null>(null);

  // Pagination (front)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const load = async () => {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([
        conseilsAdmin.list({ per_page: 200 }),
        conseilsAdmin.stats(),
      ]);
      setItems(list);
      setStats(st);
    } catch (e) {
      console.error(e);
      errorToast("Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    //
  }, []);

  const filtered = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return items;
    return items.filter((c) => {
      return (
        (c.first_name + " " + c.last_name).toLowerCase().includes(t) ||
        c.email.toLowerCase().includes(t) ||
        (c.phone || "").toLowerCase().includes(t) ||
        c.legal_domain.toLowerCase().includes(t) ||
        c.description.toLowerCase().includes(t) ||
        c.status.toLowerCase().includes(t)
      );
    });
  }, [items, searchTerm]);

  // pagination calculée
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => setPage(1), [searchTerm, pageSize, items]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const firstIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastIndex = Math.min(page * pageSize, total);

  // actions
  const onView = async (c: Conseil) => {
    setViewing(c);
    if (!c.is_read) {
      try {
        const updated = await conseilsAdmin.markRead(c.id);
        setItems((arr) => arr.map((x) => (x.id === c.id ? updated : x)));
        setStats(await conseilsAdmin.stats());
      } catch {
        // silencieux
      }
    }
  };

  const onMarkRead = async (c: Conseil) => {
    try {
      const updated = await conseilsAdmin.markRead(c.id);
      setItems((arr) => arr.map((x) => (x.id === c.id ? updated : x)));
      setStats(await conseilsAdmin.stats());
      success("Marqué comme lu");
    } catch {
      errorToast("Impossible de marquer comme lu");
    }
  };

  const onMarkUnread = async (c: Conseil) => {
    try {
      const updated = await conseilsAdmin.markUnread(c.id);
      setItems((arr) => arr.map((x) => (x.id === c.id ? updated : x)));
      setStats(await conseilsAdmin.stats());
      success("Marqué comme non-lu");
    } catch {
      errorToast("Impossible de marquer comme non-lu");
    }
  };

  const onChangeStatus = async (c: Conseil, status: Conseil["status"]) => {
    try {
      const updated = await conseilsAdmin.updateStatus(c.id, status);
      setItems((arr) => arr.map((x) => (x.id === c.id ? updated : x)));
      setStats(await conseilsAdmin.stats());
      success("Statut mis à jour");
    } catch {
      errorToast("Mise à jour du statut impossible");
    }
  };

  const onDelete = async (c: Conseil) => {
    if (!confirm(`Supprimer la demande de ${c.first_name} ${c.last_name} ?`))
      return;
    try {
      await conseilsAdmin.remove(c.id);
      setItems((arr) => arr.filter((x) => x.id !== c.id));
      setStats(await conseilsAdmin.stats());
      success("Demande supprimée");
    } catch {
      errorToast("Suppression impossible");
    }
  };

  const exportCsv = () => {
    const rows = [
      [
        "ID",
        "Nom",
        "Email",
        "Téléphone",
        "Domaine",
        "Urgence",
        "Statut",
        "Lu",
        "Date",
        "Description",
      ],
      ...filtered.map((c) => [
        c.id,
        `${c.first_name} ${c.last_name}`,
        c.email,
        c.phone || "",
        c.legal_domain,
        c.urgency || "",
        c.status,
        c.is_read ? "Oui" : "Non",
        new Date(c.created_at).toLocaleString(),
        (c.description || "").replace(/\s+/g, " ").slice(0, 300),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conseils_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success("Export CSV terminé");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Conseils Gratuits</h1>
            <p className="text-red-100">
              Demandes entrantes, suivi & traitement
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.unread}</div>
                <p className="text-sm text-blue-100">Non lus</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-slate-200">Total</p>
              </CardContent>
            </Card>
            {Object.entries(stats.byStatus).map(([st, count]) => (
              <Card key={st} className="bg-white shadow">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-sm uppercase">{st}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des demandes</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Rechercher (nom, email, domaine, statut)…"
                  className="w-full sm:w-72"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" className="w-full sm:w-auto" disabled>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={exportCsv}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nom</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Domaine</th>
                    <th className="p-3 text-left">Urgence</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-left">Lu</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="p-4 text-center" colSpan={9}>
                        Chargement…
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    pageItems.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{c.id}</td>
                        <td className="p-3">
                          {c.first_name} {c.last_name}
                        </td>
                        <td className="p-3">{c.email}</td>
                        <td className="p-3">{c.legal_domain}</td>
                        <td className="p-3">{c.urgency || "—"}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge className={statusBadge(c.status)}>
                              {c.status}
                            </Badge>
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={c.status}
                              onChange={(e) =>
                                onChangeStatus(
                                  c,
                                  e.target.value as Conseil["status"]
                                )
                              }
                            >
                              <option value="nouveau">nouveau</option>
                              <option value="en_cours">en_cours</option>
                              <option value="traite">traite</option>
                              <option value="clos">clos</option>
                              <option value="spam">spam</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-3">
                          {c.is_read ? (
                            <Badge className="bg-green-100 text-green-800">
                              Lu
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              Non lu
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {new Date(c.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Voir"
                              onClick={() => onView(c)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              title="Supprimer"
                              onClick={() => onDelete(c)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {!loading && pageItems.length === 0 && (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={9}>
                        Aucune demande
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (front) */}
            {!loading && total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <div className="text-sm text-gray-600">
                  {`${firstIndex}–${lastIndex} sur ${total}`}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Par page</label>
                  <select
                    className="border rounded-md px-2 py-1"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      «
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <span className="px-2 text-sm text-gray-700">
                      Page {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Suivant
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      »
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View dialog */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Demande — {viewing.first_name} {viewing.last_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p>{viewing.email}</p>
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <p>{viewing.phone || "—"}</p>
                </div>
                <div>
                  <Label>Domaine</Label>
                  <p>{viewing.legal_domain}</p>
                </div>
                <div>
                  <Label>Urgence</Label>
                  <p>{viewing.urgency || "—"}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={statusBadge(viewing.status)}>
                    {viewing.status}
                  </Badge>
                </div>
                <div>
                  <Label>Lu</Label>
                  <p>{viewing.is_read ? "Oui" : "Non"}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="whitespace-pre-line">{viewing.description}</p>
              </div>
              <div>
                <Label>Reçue le</Label>
                <p>{new Date(viewing.created_at).toLocaleString()}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminConseils;
