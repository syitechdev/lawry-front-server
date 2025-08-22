import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Search, Eye, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { http } from "@/lib/http";
import { markRead, STATUS_VALUE } from "@/services/demandes";

// Mapping d'affichage (même logique que dans le détail)
const STATUS_UI = {
  recu: { label: "Reçu", badge: "bg-gray-100 text-gray-800" },
  "en-cours": { label: "En cours", badge: "bg-blue-100 text-blue-800" },
  "en-attente-client": {
    label: "En attente client",
    badge: "bg-yellow-100 text-yellow-800",
  },
  "en-revision": {
    label: "En révision",
    badge: "bg-purple-100 text-purple-800",
  },
  termine: { label: "Terminé", badge: "bg-green-100 text-green-800" },
  annule: { label: "Annulé", badge: "bg-red-100 text-red-800" },
} as const;

type DemandeItem = {
  ref: string;
  type?: { slug: string; name?: string };
  status: keyof typeof STATUS_UI | string;
  priority?: "urgent" | "normal";
  is_read?: boolean;
  author?: { name?: string; email?: string } | null;
  created_at?: string;
};

type ApiList<T> =
  | { "hydra:member": T[]; "hydra:totalItems"?: number }
  | { data: T[]; total?: number }
  | T[];

export default function DemandesList() {
  const { slug } = useParams(); // /admin/demandes/types/:slug
  const navigate = useNavigate();

  // Filtres / état UI
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  // Liste
  const [items, setItems] = useState<DemandeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);

  const title = useMemo(
    () => (slug ? `Demandes — ${slug}` : "Demandes"),
    [slug]
  );

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const { data } = await http.get<ApiList<DemandeItem>>("/admin/demandes", {
        params: {
          page,
          per_page: perPage,
          q: q || undefined,
          status: status || undefined,
          type: slug || undefined, // <- filtre par type via :slug
          unread: unreadOnly ? 1 : undefined, // <- non-lus
        },
      });

      let list: DemandeItem[] = [];
      let totalCount = 0;

      if (Array.isArray(data)) {
        list = data;
        totalCount = data.length;
      } else if ("hydra:member" in data) {
        list = data["hydra:member"] as DemandeItem[];
        totalCount = Number(data["hydra:totalItems"] ?? list.length);
      } else if ("data" in data) {
        list = data.data as DemandeItem[];
        totalCount = Number((data as any).total ?? list.length);
      }

      setItems(list);
      setTotal(totalCount);
    } catch (e) {
      toast.error("Impossible de charger les demandes");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // reset page si slug/filtres changent
  }, [slug, status, unreadOnly]);

  useEffect(() => {
    fetchDemandes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, slug, status, unreadOnly]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const labelOf = (st: string) =>
    STATUS_UI[st as keyof typeof STATUS_UI]?.label ?? st;
  const badgeOf = (st: string) =>
    STATUS_UI[st as keyof typeof STATUS_UI]?.badge ??
    "bg-gray-100 text-gray-800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-800" />
          {title}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDemandes}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-1 md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par client, ref, email…"
                    className="pl-8"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchDemandes();
                    }}
                  />
                </div>
                <Button onClick={fetchDemandes} disabled={loading}>
                  Rechercher
                </Button>
              </div>
            </div>

            <div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value={STATUS_VALUE.recu}>Reçu</SelectItem>
                  <SelectItem value={STATUS_VALUE.enCours}>En cours</SelectItem>
                  <SelectItem value={STATUS_VALUE.enAttenteClient}>
                    En attente client
                  </SelectItem>
                  <SelectItem value={STATUS_VALUE.enRevision}>
                    En révision
                  </SelectItem>
                  <SelectItem value={STATUS_VALUE.termine}>Terminé</SelectItem>
                  <SelectItem value={STATUS_VALUE.annule}>Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              Non lus seulement
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-gray-500"
                    >
                      Chargement…
                    </TableCell>
                  </TableRow>
                )}

                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-gray-500"
                    >
                      Aucune demande.
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  items.map((d) => {
                    const unread = d.is_read === false;
                    return (
                      <TableRow
                        key={d.ref}
                        className={unread ? "bg-red-50/50" : ""}
                      >
                        <TableCell className="font-medium">{d.ref}</TableCell>
                        <TableCell>
                          {d.type?.name ?? d.type?.slug ?? "—"}
                        </TableCell>
                        <TableCell>{d.author?.name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge className={badgeOf(String(d.status))}>
                            {labelOf(String(d.status))}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              d.priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {d.priority === "urgent" ? "Urgent" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {d.created_at
                            ? new Date(d.created_at).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {unread && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await markRead(d.ref);
                                    toast.success("Marquée comme lue");
                                    fetchDemandes();
                                  } catch {
                                    toast.error(
                                      "Impossible de marquer comme lue"
                                    );
                                  }
                                }}
                              >
                                Marquer lu
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(`/admin/demandes/${d.ref}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination simple */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div>
              {total > 0 ? (
                <span>
                  Page {page} / {totalPages} • {total} résultat(s)
                </span>
              ) : (
                <span>—</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
