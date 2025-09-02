// src/pages/admin/AdminContacts.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  Filter,
  Download,
  CheckCircle2,
  MailOpen,
  Mail,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { useToast } from "@/hooks/use-toast";
import {
  listContacts,
  getContactStats,
  markContactRead,
  markContactUnread,
  updateContactStatus,
  deleteContact,
  type Contact,
  type ContactStats,
} from "@/services/contacts";

const STATUS_OPTIONS: Contact["status"][] = [
  "nouveau",
  "en_cours",
  "traite",
  "clos",
  "spam",
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    nouveau: "bg-gray-100 text-gray-800",
    en_cours: "bg-blue-100 text-blue-800",
    traite: "bg-green-100 text-green-800",
    clos: "bg-purple-100 text-purple-800",
    spam: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const AdminContacts: React.FC = () => {
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);

  // toast
  const { toast } = useToast();
  const success = (description: string, title = "Succès") =>
    toast({ title, description });
  const errorToast = (description: string, title = "Erreur") =>
    toast({ title, description, variant: "destructive" });

  // data
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ContactStats | null>(null);

  // petits états d'actions par ligne
  const [updatingRead, setUpdatingRead] = useState<Record<number, boolean>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<number, boolean>>(
    {}
  );

  // pagination front
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    try {
      // Récupère un gros lot puis on pagine côté front
      const res = await listContacts({ per_page: 500 });
      setItems(res.data || res);

      const s = await getContactStats();
      setStats(s);
    } catch (e) {
      console.error(e);
      errorToast("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // filtre
  const filtered = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return items;
    return items.filter((c) => {
      return (
        c.email.toLowerCase().includes(t) ||
        c.subject.toLowerCase().includes(t) ||
        c.message.toLowerCase().includes(t) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(t)
      );
    });
  }, [items, searchTerm]);

  // pagination calculée
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => setPage(1), [searchTerm, pageSize, items.length]); // reset page si filtre/size change
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const firstIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastIndex = Math.min(page * pageSize, total);
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // helpers local update
  const updateLocalItem = (id: number, patch: Partial<Contact>) => {
    setItems((list) =>
      list.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };
  const incUnread = (delta: number) => {
    setStats((s) => (s ? { ...s, unread: Math.max(0, s.unread + delta) } : s));
  };

  // actions
  const onView = async (c: Contact) => {
    // Marquer en "lu" si nécessaire avant d'ouvrir le dialog
    if (!c.is_read) {
      setUpdatingRead((m) => ({ ...m, [c.id]: true }));
      try {
        await markContactRead(c.id);
        updateLocalItem(c.id, {
          is_read: true,
          read_at: new Date().toISOString(),
        });
        incUnread(-1);
      } catch {
        errorToast("Impossible de marquer comme lu");
      } finally {
        setUpdatingRead((m) => {
          const { [c.id]: _, ...rest } = m;
          return rest;
        });
      }
    }
    setViewingContact({ ...c, is_read: true });
  };

  const onMarkRead = async (c: Contact) => {
    if (c.is_read) return;
    setUpdatingRead((m) => ({ ...m, [c.id]: true }));
    try {
      await markContactRead(c.id);
      updateLocalItem(c.id, {
        is_read: true,
        read_at: new Date().toISOString(),
      });
      incUnread(-1);
      success("Message marqué comme lu");
    } catch {
      errorToast("Impossible de marquer comme lu");
    } finally {
      setUpdatingRead((m) => {
        const { [c.id]: _, ...rest } = m;
        return rest;
      });
    }
  };

  const onMarkUnread = async (c: Contact) => {
    if (!c.is_read) return;
    setUpdatingRead((m) => ({ ...m, [c.id]: true }));
    try {
      await markContactUnread(c.id);
      updateLocalItem(c.id, { is_read: false, read_at: null });
      incUnread(+1);
      success("Message marqué comme non-lu");
    } catch {
      errorToast("Impossible de marquer comme non-lu");
    } finally {
      setUpdatingRead((m) => {
        const { [c.id]: _, ...rest } = m;
        return rest;
      });
    }
  };

  const onChangeStatus = async (c: Contact, next: Contact["status"]) => {
    if (c.status === next) return;
    setUpdatingStatus((m) => ({ ...m, [c.id]: true }));
    try {
      await updateContactStatus(c.id, { status: next });
      updateLocalItem(c.id, {
        status: next,
        handled_at:
          next === "traite" || next === "clos"
            ? new Date().toISOString()
            : c.handled_at ?? null,
      });
      success("Statut mis à jour");
      // mettre à jour stats.byStatus en local si déjà chargées
      setStats((s) => {
        if (!s) return s;
        const by = { ...s.byStatus };
        const prev = c.status;
        if (by[prev as keyof typeof by] !== undefined)
          by[prev as keyof typeof by] = Math.max(
            0,
            by[prev as keyof typeof by] - 1
          );
        if (by[next as keyof typeof by] !== undefined)
          by[next as keyof typeof by] = (by[next as keyof typeof by] || 0) + 1;
        return { ...s, byStatus: by };
      });
    } catch {
      errorToast("Impossible de mettre à jour le statut");
    } finally {
      setUpdatingStatus((m) => {
        const { [c.id]: _, ...rest } = m;
        return rest;
      });
    }
  };

  const onDelete = async (c: Contact) => {
    if (!confirm(`Supprimer le message de ${c.first_name} ${c.last_name} ?`))
      return;
    try {
      await deleteContact(c.id);
      setItems((list) => list.filter((it) => it.id !== c.id));
      // MAJ stats locales
      setStats((s) => {
        if (!s) return s;
        const by = { ...s.byStatus };
        if (by[c.status as keyof typeof by] !== undefined) {
          by[c.status as keyof typeof by] = Math.max(
            0,
            by[c.status as keyof typeof by] - 1
          );
        }
        const unreadDelta = c.is_read ? 0 : -1;
        return {
          ...s,
          total: Math.max(0, s.total - 1),
          unread: Math.max(0, s.unread + unreadDelta),
          byStatus: by,
        };
      });
      success("Message supprimé");
    } catch {
      errorToast("Impossible de supprimer");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["ID", "Nom", "Email", "Téléphone", "Sujet", "Statut", "Lu", "Date"],
      ...filtered.map((c) => [
        c.id,
        `${c.first_name} ${c.last_name}`,
        c.email,
        c.phone || "",
        c.subject,
        c.status,
        c.is_read ? "Oui" : "Non",
        new Date(c.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success("Export CSV terminé");
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
            <h1 className="text-3xl font-bold mb-2">Gestion des Messages</h1>
            <p className="text-red-100">
              Base de données des messages de contact
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
            {Object.entries(stats.byStatus).map(([st, count]) => (
              <Card
                key={st}
                className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 shadow-md"
              >
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-sm uppercase">{st}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des Messages</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Rechercher (nom, email, sujet, message)…"
                  className="w-full sm:w-64"
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
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Nom</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Sujet</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-left">Lu</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="p-4 text-center" colSpan={8}>
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
                        <td className="p-3">{c.subject}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge className={statusBadge(c.status)}>
                              {c.status}
                            </Badge>
                            <select
                              className="border rounded-md px-2 py-1 text-sm"
                              value={c.status}
                              disabled={!!updatingStatus[c.id]}
                              onChange={(e) =>
                                onChangeStatus(
                                  c,
                                  e.target.value as Contact["status"]
                                )
                              }
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
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
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Voir"
                              onClick={() => onView(c)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* {c.is_read ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Marquer non-lu"
                                disabled={!!updatingRead[c.id]}
                                onClick={() => onMarkUnread(c)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Marquer lu"
                                disabled={!!updatingRead[c.id]}
                                onClick={() => onMarkRead(c)}
                              >
                                <MailOpen className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              title="Traiter (raccourci)"
                              onClick={() => onChangeStatus(c, "traite")}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button> */}

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
                </tbody>
              </table>
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun message trouvé
              </div>
            )}

            {/* Pagination front */}
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <div className="text-sm text-gray-600">
                  {total === 0
                    ? "0 résultat"
                    : `${firstIndex}–${lastIndex} sur ${total}`}
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
                      disabled={!canPrev}
                    >
                      «
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!canPrev}
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
                      disabled={!canNext}
                    >
                      Suivant
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={!canNext}
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

      {/* View */}
      {viewingContact && (
        <Dialog
          open={!!viewingContact}
          onOpenChange={() => setViewingContact(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Message de {viewingContact.first_name}{" "}
                {viewingContact.last_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <p>{viewingContact.email}</p>
              </div>
              <div>
                <Label>Téléphone</Label>
                <p>{viewingContact.phone || "—"}</p>
              </div>
              <div>
                <Label>Sujet</Label>
                <p>{viewingContact.subject}</p>
              </div>
              <div>
                <Label>Message</Label>
                <p className="whitespace-pre-line">{viewingContact.message}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminContacts;
