import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Search } from "lucide-react";
import {
  listUserServices,
  type GenericServiceRow,
} from "@/services/userServices";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
};

function toCsv(rows: GenericServiceRow[]) {
  const head = [
    "Type",
    "ID",
    "Label",
    "Statut",
    "Début",
    "Fin",
    "Créé le",
    "MAJ le",
    "Période",
    "Montant XOF",
    "Dernier paiement",
    "Statut paiement",
    "Payé le",
  ];
  const body = rows.map((r) => [
    r.type,
    r.id,
    r.label,
    r.status,
    r.startedAt ?? "",
    r.endsAt ?? "",
    r.createdAt ?? "",
    r.updatedAt ?? "",
    r.period ?? "",
    r.amountXof ?? "",
    r.lastPaymentRef ?? "",
    r.lastPaymentStatus ?? "",
    r.lastPaymentAt ?? "",
  ]);
  const csv = [head, ...body]
    .map((row) =>
      row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

export default function UserServicesModal({
  open,
  onClose,
  userId,
  userName,
}: Props) {
  const [q, setQ] = useState("");
  const [qLive, setQLive] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<GenericServiceRow[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setQLive(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const pages = useMemo(
    () => Math.max(Math.ceil(total / perPage), 1),
    [total, perPage]
  );

  const load = async () => {
    if (!open) return;
    setLoading(true);
    try {
      const { items, total } = await listUserServices(userId, {
        q: qLive,
        page,
        perPage,
      });
      setRows(items);
      setTotal(total);
    } catch (e: any) {
      toast.error(e?.message || "Impossible de charger les services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [open, userId, page, perPage, qLive]);

  const onExport = () => {
    const blob = toCsv(rows);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `services_${userName.replace(/\s+/g, "_")}_page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Services — {userName}</DialogTitle>
        </DialogHeader>

        <Card className="border-none shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="q" className="text-xs text-gray-500">
                  Recherche (type, label, statut…)
                </Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" />
                  <Input
                    id="q"
                    value={q}
                    onChange={(e) => {
                      setPage(1);
                      setQ(e.target.value);
                    }}
                    className="pl-8"
                    placeholder="Rechercher…"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="perPage" className="text-xs text-gray-500">
                  Par page
                </Label>
                <select
                  id="perPage"
                  className="border rounded px-2 py-2 text-sm"
                  value={perPage}
                  onChange={(e) => {
                    setPage(1);
                    setPerPage(parseInt(e.target.value) || 10);
                  }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-auto rounded border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Label</th>
                    <th className="text-left px-3 py-2">Statut</th>
                    <th className="text-left px-3 py-2">Début</th>
                    <th className="text-left px-3 py-2">Fin</th>
                    <th className="text-left px-3 py-2">Créé le</th>
                    <th className="text-left px-3 py-2">MAJ le</th>
                    <th className="text-left px-3 py-2">Période</th>
                    <th className="text-left px-3 py-2">Montant</th>
                    <th className="text-left px-3 py-2">Dernier paiement</th>
                    <th className="text-left px-3 py-2">Statut paiement</th>
                    <th className="text-left px-3 py-2">Payé le</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center py-6 text-gray-500"
                      >
                        Chargement…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="text-center py-6 text-gray-500"
                      >
                        Aucun service
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={`${r.type}-${r.id}`} className="border-t">
                        <td className="px-3 py-2">{r.type}</td>
                        <td className="px-3 py-2">{r.label}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              r.status === "active"
                                ? "bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                : r.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full"
                                : r.status === "expired"
                                ? "bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
                                : "bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                            }
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {r.startedAt
                            ? new Date(r.startedAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {r.endsAt
                            ? new Date(r.endsAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {r.updatedAt
                            ? new Date(r.updatedAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2">{r.period ?? "—"}</td>
                        <td className="px-3 py-2">
                          {typeof r.amountXof === "number"
                            ? `${r.amountXof.toLocaleString()} XOF`
                            : "—"}
                        </td>
                        <td className="px-3 py-2">{r.lastPaymentRef ?? "—"}</td>
                        <td className="px-3 py-2">
                          {r.lastPaymentStatus ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          {r.lastPaymentAt
                            ? new Date(r.lastPaymentAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                Page {page} / {pages} — {total} résultat(s)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(p + 1, pages))}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
