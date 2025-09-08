import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Download } from "lucide-react";
import { Link } from "react-router-dom";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { listMyPurchases, type MyPurchaseItem } from "@/services/purchases";

const statusBadge = (s: MyPurchaseItem["status"]) => {
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-700",
    expired: "bg-gray-100 text-gray-700",
  };
  return map[s] ?? "bg-gray-100 text-gray-700";
};

export default function ClientBoutique() {
  const [items, setItems] = useState<MyPurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await listMyPurchases({ page: p, per_page: 12 });
      setItems(res.data);
      setPage(res.current_page);
      setLastPage(res.last_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="client" userName="Client" userEmail="" />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Boutique Juridique</h1>
            <p className="text-blue-100">Vos achats et modèles disponibles</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mes Achats</CardTitle>
            <Button className="bg-red-900 hover:bg-red-800" asChild>
              <Link to="/boutique">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Parcourir la boutique
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 rounded-xl bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-gray-600">Aucun achat pour le moment.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-xl border bg-white overflow-hidden"
                  >
                    <div className="h-36 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={
                          it.product.image_url ||
                          "https://placehold.co/600x400?text=Produit"
                        }
                        alt={it.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{it.ref}</span>
                        <Badge className={statusBadge(it.status)}>
                          {it.status}
                        </Badge>
                      </div>
                      <div className="font-semibold line-clamp-2">
                        {it.product.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {it.product.type === "file" ? "Fichier" : "Service"} •{" "}
                        {it.unit_price_cfa.toLocaleString()} {it.currency}
                      </div>

                      {it.status === "paid" &&
                        it.product.type === "file" &&
                        (it.product.files_urls?.length ?? 0) > 0 && (
                          <div className="pt-2 space-y-2">
                            {it.product
                              .files_urls!.slice(0, 3)
                              .map((url, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="w-full"
                                >
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger {idx + 1}
                                  </a>
                                </Button>
                              ))}
                            {it.product.files_urls!.length > 3 && (
                              <div className="text-xs text-gray-500">
                                + {it.product.files_urls!.length - 3} fichier(s)
                                supplémentaires dans l’email
                              </div>
                            )}
                          </div>
                        )}

                      {it.status === "paid" && it.product.type !== "file" && (
                        <div className="pt-2 text-sm text-gray-600">
                          Détails de l’offre envoyés par email.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => fetchData(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm">
              Page {page} / {lastPage}
            </span>
            <Button
              variant="outline"
              disabled={page >= lastPage}
              onClick={() => fetchData(page + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
