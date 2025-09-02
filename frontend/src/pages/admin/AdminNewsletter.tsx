// src/pages/admin/AdminNewsletter.tsx
import React, { useEffect, useMemo, useState } from "react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Filter, Trash2 } from "lucide-react";
import {
  listNewsletter,
  getNewsletterStats,
  deleteNewsletter,
  type NewsletterSub,
  type NewsletterStats,
} from "@/services/newsletter";

const statusBadge = (s: "active" | "unsub") =>
  s === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-800";

const AdminNewsletter: React.FC = () => {
  const { toast } = useToast();
  const success = (d: string, t = "Succès") =>
    toast({ title: t, description: d });
  const errorToast = (d: string, t = "Erreur") =>
    toast({ title: t, description: d, variant: "destructive" });

  // data
  const [items, setItems] = useState<NewsletterSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NewsletterStats | null>(null);

  // UI
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "unsub">("all");

  // pagination (front)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = async () => {
    setLoading(true);
    try {
      // on charge large et on pagine côté front
      const res = await listNewsletter({ per_page: 1000 });
      setItems(res.data as NewsletterSub[]);
      const s = await getNewsletterStats();
      setStats(s);
    } catch (e) {
      console.error(e);
      errorToast("Erreur de chargement des inscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // filtrage
  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    const base = items.filter((it) => {
      if (filter === "active" && it.unsubscribed_at) return false;
      if (filter === "unsub" && !it.unsubscribed_at) return false;
      return true;
    });
    if (!t) return base;
    return base.filter((it) => it.email.toLowerCase().includes(t));
  }, [items, search, filter]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => setPage(1), [search, filter, pageSize, items.length]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const start = (page - 1) * pageSize;
  const pageItems = useMemo(
    () => filtered.slice(start, start + pageSize),
    [filtered, start, pageSize]
  );

  const onDelete = async (sub: NewsletterSub) => {
    if (!confirm(`Supprimer l'inscription ${sub.email} ?`)) return;
    try {
      await deleteNewsletter(sub.id);
      setItems((arr) => arr.filter((x) => x.id !== sub.id));
      setStats((s) => {
        if (!s) return s;
        const wasActive = !sub.unsubscribed_at;
        return {
          total: Math.max(0, s.total - 1),
          active: Math.max(0, s.active - (wasActive ? 1 : 0)),
          unsubscribed: Math.max(0, s.unsubscribed - (wasActive ? 0 : 1)),
        };
      });
      success("Inscription supprimée");
    } catch (e) {
      console.error(e);
      errorToast("Suppression impossible");
    }
  };

  const exportCsv = () => {
    // export des EMAILS filtrés (format simple)
    const rows = [
      ["email", "status", "created_at", "unsubscribed_at"],
      ...filtered.map((s) => [
        s.email,
        s.unsubscribed_at ? "unsubscribed" : "active",
        new Date(s.created_at).toISOString(),
        s.unsubscribed_at ? new Date(s.unsubscribed_at).toISOString() : "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success("Export CSV généré");
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

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
            <h1 className="text-3xl font-bold mb-2">Inscriptions Newsletter</h1>
            <p className="text-red-100">
              Liste des abonnés, stats et export CSV
            </p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-blue-100">
                  Total inscrits (toutes lignes)
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-sm text-green-100">Actifs</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stats.unsubscribed}</div>
                <p className="text-sm text-gray-100">Désinscrits</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des inscriptions</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Rechercher un email…"
                  className="w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex gap-2">
                  <select
                    className="border rounded-md px-2 py-1 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    title="Filtrer"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actifs</option>
                    <option value="unsub">Désinscrits</option>
                  </select>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled
                  >
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
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-left">Inscrit le</th>
                    <th className="p-3 text-left">Désinscrit le</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="p-4 text-center" colSpan={6}>
                        Chargement…
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    pageItems.map((s) => {
                      const status: "active" | "unsub" = s.unsubscribed_at
                        ? "unsub"
                        : "active";
                      return (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{s.id}</td>
                          <td className="p-3 font-medium">{s.email}</td>
                          <td className="p-3">
                            <Badge className={statusBadge(status)}>
                              {status === "active" ? "Actif" : "Désinscrit"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            {s.unsubscribed_at
                              ? new Date(s.unsubscribed_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Supprimer"
                              onClick={() => onDelete(s)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune inscription trouvée
              </div>
            )}

            {/* Pagination front */}
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <div className="text-sm text-gray-600">
                  {total === 0
                    ? "0 résultat"
                    : `${start + 1}–${Math.min(
                        start + pageSize,
                        total
                      )} sur ${total}`}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Par page</label>
                  <select
                    className="border rounded-md px-2 py-1"
                    value={pageSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPageSize(val);
                      setPage(1);
                    }}
                  >
                    <option value={10}>10</option>
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
    </div>
  );
};

export default AdminNewsletter;
