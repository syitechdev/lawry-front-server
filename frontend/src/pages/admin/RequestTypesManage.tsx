import { useEffect, useMemo, useState } from "react";
import { http } from "@/lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Edit, Plus, Trash2 } from "lucide-react";

type RequestType = {
  id: number;
  name: string;
  slug: string;
  version?: number | null;
  is_active: boolean;
  pricing_mode?: "quote" | "fixed" | "from" | null;
  price_amount?: number | null;
  currency?: string | null;
  variants_csv?: string | null;
  features_csv?: string | null;
  config?: any;
  demandes_count?: number;
  locked?: boolean; // renvoyé par l'API (accessor)
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

export default function RequestTypesManage() {
  const [items, setItems] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RequestType | null>(null);
  const [form, setForm] = useState<RequestType>({
    id: 0,
    name: "",
    slug: "",
    version: 1,
    is_active: true,
    pricing_mode: "quote",
    price_amount: null,
    currency: "XOF",
    variants_csv: "",
    features_csv: "",
    config: {},
  });

  const resetForm = () => {
    setEditing(null);
    setForm({
      id: 0,
      name: "",
      slug: "",
      version: 1,
      is_active: true,
      pricing_mode: "quote",
      price_amount: null,
      currency: "XOF",
      variants_csv: "",
      features_csv: "",
      config: {},
    });
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };
  const openEdit = (rt: RequestType) => {
    setEditing(rt);
    setForm({
      ...rt,
      version: rt.version ?? 1,
      pricing_mode: (rt.pricing_mode ?? "quote") as any,
      currency: rt.currency ?? "XOF",
      variants_csv: rt.variants_csv ?? "",
      features_csv: rt.features_csv ?? "",
      config: rt.config ?? {},
    });
    setOpen(true);
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await http.get<RequestType[]>("/admin/request-types");
      setItems(data);
    } catch {
      toast.error("Impossible de charger les types");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchList();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const k = q.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(k) || i.slug.toLowerCase().includes(k)
    );
  }, [items, q]);

  const save = async () => {
    try {
      const payload = { ...form };
      if (editing) {
        await http.put(`/admin/request-types/${editing.id}`, payload);
        toast.success("Type mis à jour");
      } else {
        await http.post(`/admin/request-types`, payload);
        toast.success("Type créé");
      }
      setOpen(false);
      fetchList();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Échec de l’enregistrement");
    }
  };

  const toggleActive = async (rt: RequestType, next: boolean) => {
    try {
      await http.patch(`/admin/request-types/${rt.id}/toggle`, {
        is_active: next,
      });
      toast.success(next ? "Activé" : "Désactivé");
      fetchList();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Action impossible");
    }
  };

  const destroy = async (rt: RequestType) => {
    if (!confirm(`Supprimer le type "${rt.name}" ?`)) return;
    try {
      await http.delete(`/admin/request-types/${rt.id}`);
      toast.success("Type supprimé");
      fetchList();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Suppression impossible");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Types de demandes</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher (nom, slug)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-56"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Modifier le type" : "Nouveau type"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((f) => ({
                          ...f,
                          name,
                          slug: editing ? f.slug : slugify(name),
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          slug: slugify(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">Version</label>
                    <Input
                      type="number"
                      min={1}
                      value={form.version ?? 1}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          version: Number(e.target.value || 1),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mode de prix</label>
                    <select
                      className="border rounded px-2 py-2 w-full text-sm"
                      value={form.pricing_mode ?? "quote"}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          pricing_mode: e.target.value as any,
                        }))
                      }
                    >
                      <option value="quote">Sur devis</option>
                      <option value="fixed">Fixe</option>
                      <option value="from">À partir de</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Montant</label>
                      <Input
                        type="number"
                        value={form.price_amount ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            price_amount:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Devise</label>
                      <Input
                        value={form.currency ?? "XOF"}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, currency: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Variants (CSV)
                    </label>
                    <Input
                      value={form.variants_csv ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, variants_csv: e.target.value }))
                      }
                      placeholder="ex: Standard, Premium"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Features (CSV)
                    </label>
                    <Input
                      value={form.features_csv ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, features_csv: e.target.value }))
                      }
                      placeholder="ex: clause A, clause B"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Config (JSON)</label>
                  <Textarea
                    className="font-mono text-xs"
                    rows={6}
                    value={JSON.stringify(form.config ?? {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const val = JSON.parse(e.target.value || "{}");
                        setForm((f) => ({ ...f, config: val }));
                      } catch {
                        // ignore pour la saisie
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sert à définir les champs / vues spécifiques au type (voir
                    plus bas).
                  </p>
                </div>

                <div className="flex items-center justify-between border rounded p-3">
                  <div>
                    <p className="text-sm font-medium">Actif</p>
                    <p className="text-xs text-gray-500">
                      {editing?.locked
                        ? "Impossible de désactiver : des demandes sont liées."
                        : "Rend le type disponible pour les demandes."}
                    </p>
                  </div>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(next) =>
                      setForm((f) => ({ ...f, is_active: next }))
                    }
                    disabled={!!editing?.locked && form.is_active === true}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={save}>
                    {editing ? "Enregistrer" : "Créer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Demandes liées</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm">
                      Chargement…
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm">
                      Aucun type.
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  filtered.map((rt) => (
                    <TableRow key={rt.id}>
                      <TableCell className="font-medium">{rt.name}</TableCell>
                      <TableCell className="text-gray-600">{rt.slug}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            rt.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {rt.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{rt.demandes_count ?? 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(rt)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Éditer
                          </Button>
                          <Switch
                            checked={rt.is_active}
                            onCheckedChange={(next) => toggleActive(rt, next)}
                            disabled={
                              !!rt.locked &&
                              rt.is_active &&
                              !next /* bloquer passage à false */
                            }
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => destroy(rt)}
                            disabled={!!rt.locked}
                            title={
                              rt.locked
                                ? "Impossible: des demandes existent"
                                : "Supprimer"
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
