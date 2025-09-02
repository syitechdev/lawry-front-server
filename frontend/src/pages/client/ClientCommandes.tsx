import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, MessageSquare, Download, Star, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { http } from "@/lib/http";
import { toast } from "sonner";

type OrderItem = {
  kind: "demande" | "formation";
  ref: string; // DEM-... ou FORM...
  title: string;
  status: string; // code
  status_label?: string; // label lisible
  progress?: number; // 0..100 (idem)
  paid_status?: string; //
  ordered_at: string | null;
  model_id: number;
  extra?: {
    amount_cfa?: number;
    date?: string;
    formation_title?: string;
    formation_code?: string;
  } | null;
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

const ClientCommandes = () => {
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const perPage = 4;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get<{ data: OrderItem[] } | OrderItem[]>(
          "/client/orders"
        );
        const items: OrderItem[] = Array.isArray(data) ? data : data.data;

        const withComputed = items.map((it) => {
          const code = (it.status || "").toLowerCase();
          return {
            ...it,
            status: code,
            status_label:
              it.status_label ??
              STATUS_LABEL[code] ??
              (code ? code[0].toUpperCase() + code.slice(1) : "—"),
            progress:
              typeof it.progress === "number"
                ? it.progress
                : STATUS_PROGRESS[code] ?? 0,
          };
        });

        withComputed.sort((a, b) => {
          const da = a.ordered_at ? Date.parse(a.ordered_at) : 0;
          const db = b.ordered_at ? Date.parse(b.ordered_at) : 0;
          return db - da;
        });

        setAllItems(withComputed);
      } catch (e) {
        toast.error("Impossible de charger vos commandes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // calcul pagination locale
  const total = allItems.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [lastPage, page]);

  const items = useMemo(() => {
    const start = (page - 1) * perPage;
    return allItems.slice(start, start + perPage);
  }, [allItems, page]);

  const getBadge = (code: string) =>
    STATUS_BADGE[code] ?? "bg-gray-100 text-gray-800";

  const goDetail = (item: OrderItem) => {
    if (item.kind === "demande") navigate(`/client/demande/${item.ref}`);
    else navigate(`/client/formation/${item.ref}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="client"
        userName="Jean Kouassi"
        userEmail="jean@email.com"
      />

      <div className="lg:ml-80 px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Mes Commandes
            </h1>
            <p className="text-red-100">Suivi de vos demandes et formations</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Historique</CardTitle>
              <Button className="bg-blue-900 hover:bg-red-800" asChild>
                <Link to="/services">Nouvelle Demande</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <div className="text-sm text-gray-600">Aucun élément.</div>
                  ) : (
                    items.map((it) => (
                      <div
                        key={`${it.kind}-${it.ref}`}
                        className="border rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-semibold">
                                {it.title}
                              </h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {it.kind === "demande"
                                  ? "Demande"
                                  : "Formation"}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              {it.kind === "demande" ? "Ref" : "Code"} #{it.ref}
                            </p>
                            {it.ordered_at && (
                              <p className="text-sm text-gray-500">
                                Le{" "}
                                {it.ordered_at
                                  .replace("T", " ")
                                  .replace("Z", "")}
                              </p>
                            )}
                          </div>
                          <Badge className={getBadge(it.status)}>
                            {it.status_label}{" "}
                            {typeof it.progress === "number"
                              ? `(${it.progress}%)`
                              : ""}
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progression</span>
                            <span>{it.progress ?? 0}%</span>
                          </div>
                          <Progress value={it.progress ?? 0} className="h-3" />
                        </div>

                        {it.kind === "formation" &&
                          it.extra?.amount_cfa != null && (
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Montant</p>
                                <p className="font-medium">
                                  {Number(it.extra.amount_cfa).toLocaleString(
                                    "fr-FR"
                                  )}{" "}
                                  XOF
                                </p>
                              </div>
                              {it.extra.date && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Date de session
                                  </p>
                                  <p className="font-medium">
                                    {String(it.extra.date)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goDetail(it)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir le dossier
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Messagerie
                          </Button>
                          {it.kind === "demande" && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Documents
                            </Button>
                          )}
                          {it.status === "termine" && (
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4 mr-1" />
                              Évaluer
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination locale */}
                {total > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Page {page} / {Math.max(1, Math.ceil(total / perPage))} •{" "}
                      {total} éléments
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Précédent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= Math.ceil(total / perPage)}
                        onClick={() =>
                          setPage((p) =>
                            Math.min(Math.ceil(total / perPage), p + 1)
                          )
                        }
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientCommandes;
