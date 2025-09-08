import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listMyPayments,
  openInvoiceInNewTab,
  type Payment,
} from "@/services/invoices";
import { Loader2 } from "lucide-react";

const fXOF = (n: number, currency = "XOF") =>
  new Intl.NumberFormat("fr-FR").format(n) + " " + currency;

const statusUI: Record<Payment["status"], { label: string; badge: string }> = {
  pending: { label: "En attente", badge: "bg-blue-100 text-blue-800" },
  initiated: { label: "Initié", badge: "bg-blue-100 text-blue-800" },
  processing: { label: "Traitement", badge: "bg-blue-100 text-blue-800" },
  succeeded: { label: "Payé", badge: "bg-green-100 text-green-800" },
  failed: { label: "Échoué", badge: "bg-red-100 text-red-800" },
  cancelled: { label: "Annulé", badge: "bg-gray-100 text-gray-800" },
  expired: { label: "Expiré", badge: "bg-gray-100 text-gray-800" },
};

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR") : "";

const ClientPaiements = () => {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // id du paiement dont on ouvre la facture (pour le spinner par bouton)
  const [openingId, setOpeningId] = useState<number | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await listMyPayments();
        if (mounted) setItems(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const empty = !loading && total === 0;
  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  // Handler avec état de chargement
  const handleOpenInvoice = async (id: number) => {
    setOpeningId(id);
    try {
      // au cas où openInvoiceInNewTab ne renvoie pas une Promise, on le wrappe
      await Promise.resolve(openInvoiceInNewTab(id));
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="client"
        userName="Jean Kouassi"
        userEmail="jean@email.com"
      />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Mes Paiements</h1>
            <p className="text-blue-100">
              Gestion de vos factures et paiements
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Mes Paiements et Factures</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Par page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-lg animate-pulse bg-white/40 h-20"
                  />
                ))}
              </div>
            )}

            {empty && (
              <div className="p-6 text-center text-gray-600">
                Aucun paiement pour le moment.
              </div>
            )}

            {!loading && total > 0 && (
              <>
                <div className="space-y-4">
                  {pageItems.map((p) => {
                    const d = p.paid_at || p.created_at;
                    const s = statusUI[p.status];
                    const canInvoice = p.status === "succeeded";
                    const isOpening = openingId === p.id;
                    return (
                      <div
                        key={p.id}
                        className="p-4 border rounded-lg bg-white"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">
                              Facture #{p.reference}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(d)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="font-bold">
                              {fXOF(p.amount, p.currency ?? "XOF")}
                            </p>
                            <Badge className={s.badge}>{s.label}</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canInvoice || isOpening}
                              aria-busy={isOpening}
                              title={
                                !canInvoice
                                  ? "La facture sera disponible une fois le paiement réussi."
                                  : undefined
                              }
                              onClick={() => handleOpenInvoice(p.id)}
                            >
                              {isOpening ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Ouverture…
                                </>
                              ) : (
                                "Voir ma facture"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination controls */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    {total === 0
                      ? "0"
                      : `${(safePage - 1) * pageSize + 1}–${Math.min(
                          safePage * pageSize,
                          total
                        )}`}{" "}
                    sur {total}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goTo(safePage - 1)}
                      disabled={safePage <= 1}
                    >
                      Précédent
                    </Button>

                    <div className="hidden md:flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const n = i + 1;
                        const active =
                          n === safePage
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50";
                        return (
                          <button
                            key={n}
                            onClick={() => goTo(n)}
                            className={`h-8 w-8 rounded-md border text-sm ${active}`}
                            aria-label={`Page ${n}`}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goTo(safePage + 1)}
                      disabled={safePage >= totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientPaiements;
