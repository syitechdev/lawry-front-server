import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Search } from "lucide-react";
import {
  listPlanSubscribers,
  type PlanSubscriber,
} from "@/services/subscriptions";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  planId: number;
  planName: string;
};

function toCsv(rows: PlanSubscriber[]) {
  const head = ["ID", "UserID", "Nom", "Email", "Statut", "Début", "Fin"];
  const body = rows.map((r) => [
    r.id,
    r.userId,
    `"${(r.name || "").replace(/"/g, '""')}"`,
    `"${(r.email || "").replace(/"/g, '""')}"`,
    r.status,
    r.startedAt ?? "",
    r.endsAt ?? "",
  ]);
  const csv = [head, ...body].map((l) => l.join(",")).join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

export default function SubscribersModal({
  open,
  onClose,
  planId,
  planName,
}: Props) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PlanSubscriber[]>([]);
  const [total, setTotal] = useState(0);

  // Debounce simple
  const [qLive, setQLive] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQLive(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const pages = useMemo(
    () => Math.max(Math.ceil(total / perPage), 1),
    [total, perPage]
  );

  const load = async () => {
    setLoading(true);
    try {
      const { items, total } = await listPlanSubscribers(planId, {
        page,
        perPage,
        q: qLive,
      });
      setRows(items);
      setTotal(total);
    } catch (e: any) {
      toast.error(e?.message || "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, perPage, qLive, planId]);

  const onExport = () => {
    const blob = toCsv(rows);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnés_${planName.replace(/\s+/g, "_")}_page${page}.csv`;
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Abonnés — {planName}</DialogTitle>
        </DialogHeader>

        <Card className="border-none shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="q" className="text-xs text-gray-500">
                  Recherche par nom/email
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
                    <th className="text-left px-3 py-2">#</th>
                    <th className="text-left px-3 py-2">Nom</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Statut</th>
                    <th className="text-left px-3 py-2">Début</th>
                    <th className="text-left px-3 py-2">Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        Chargement…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        Aucun abonné
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2">{r.id}</td>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2">{r.email}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              r.status === "active"
                                ? "bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                                : r.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full"
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
