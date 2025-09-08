import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listProductPurchases,
  type ProductPurchaseRow,
} from "@/services/adminPurchases";
import { Download } from "lucide-react";

function statusClass(s: ProductPurchaseRow["status"]) {
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-700",
    expired: "bg-gray-100 text-gray-700",
  };
  return map[s] ?? "bg-gray-100 text-gray-700";
}

export default function ProductPurchasesModal({
  productId,
  open,
  onClose,
}: {
  productId: number;
  open: boolean;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<ProductPurchaseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [stats, setStats] = useState<{
    product: { id: number; name: string; type: string };
    purchases: number;
    paid_purchases: number;
    revenue_cfa: number;
  } | null>(null);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await listProductPurchases(productId, p, 12);
      setRows(res.data);
      setPage(res.current_page);
      setLastPage(res.last_page);
      setStats(res.stats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData(1);
  }, [open, productId]);

  const exportCsv = () => {
    const header = [
      "ref",
      "status",
      "amount",
      "currency",
      "user_name",
      "user_email",
      "created_at",
    ];
    const lines = rows.map((r) =>
      [
        r.ref,
        r.status,
        r.amount,
        r.currency,
        r.user.name || "",
        r.user.email || "",
        r.created_at || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchases_${productId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Achats — {stats?.product.name}{" "}
            <span className="text-xs text-gray-500">
              ({stats?.product.type})
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* mini stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">Achats (tous statuts)</div>
            <div className="text-lg font-semibold">{stats?.purchases ?? 0}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">Achats payés</div>
            <div className="text-lg font-semibold">
              {stats?.paid_purchases ?? 0}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">CA (FCFA)</div>
            <div className="text-lg font-semibold">
              {(stats?.revenue_cfa ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
            <div>Réf</div>
            <div>Statut</div>
            <div>Montant</div>
            <div>Client</div>
            <div>Email</div>
            <div>Achat</div>
          </div>
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">Aucun achat.</div>
          ) : (
            rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-7 px-3 py-2 border-t text-sm"
              >
                <div className="font-mono">{r.ref}</div>
                <div>
                  <Badge className={statusClass(r.status)}>{r.status}</Badge>
                </div>
                <div className="font-medium">
                  {r.amount.toLocaleString()} {r.currency}
                </div>
                <div className="truncate">{r.user.name || "—"}</div>
                <div className="truncate">{r.user.email || "—"}</div>
                <div className="text-gray-500 text-xs">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                </div>
              </div>
            ))
          )}
        </div>

        {/* footer */}
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <div className="flex items-center gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
