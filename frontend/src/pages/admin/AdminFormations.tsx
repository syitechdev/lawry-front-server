import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Users,
  Clock,
  Video,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { formations, type Formation } from "@/services/formations";
import { categories as catSvc, type Category } from "@/services/categories";
import ModulesInput from "@/components/ModulesInput";
import { LEVELS, TYPES } from "@/constants/formations";

type FormType = {
  title: string;
  description?: string | null;
  price_cfa: number | null;
  price_type?: "fixed" | "quote";
  duration: string;
  max_participants: number;
  type: "Présentiel" | "Webinaire" | "En ligne";
  level?: string;
  date: string;
  trainer: string;
  active: boolean;
  category_id: number | null;
  modules?: string[];
};

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const AdminFormations = () => {
  const { toast } = useToast();
  const success = (d: string, t = "Succès") =>
    toast({ title: t, description: d });
  const errorToast = (d: string, t = "Erreur") =>
    toast({ title: t, description: d, variant: "destructive" });
  const info = (d: string, t = "Info") => toast({ title: t, description: d });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewing, setViewing] = useState<Formation | null>(null);
  const [editing, setEditing] = useState<Formation | null>(null);

  const [items, setItems] = useState<Formation[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  const emptyCreate: FormType = {
    title: "",
    description: "",
    price_cfa: 0,
    price_type: "fixed",
    duration: "",
    max_participants: 1,
    type: "Présentiel",
    level: LEVELS[0],
    date: "",
    trainer: "",
    active: true,
    category_id: null,
    modules: [],
  };
  const [createForm, setCreateForm] = useState<FormType>(emptyCreate);
  const [editForm, setEditForm] = useState<FormType>({ ...emptyCreate });

  const loadCats = async () => {
    setLoadingCats(true);
    try {
      const res = await catSvc.list({ order: { name: "asc" } });
      setCats(res.items);
    } catch {
      errorToast("Erreur lors du chargement des catégories");
    } finally {
      setLoadingCats(false);
    }
  };

  const loadFormations = async () => {
    setLoading(true);
    try {
      const res = await formations.list({ order: { date: "desc" } });
      setItems(res.items);
    } catch {
      errorToast("Erreur lors du chargement des formations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
    loadFormations();
  }, []);

  const catName = (f?: Formation | null) => {
    if (!f) return "—";
    const id =
      f.category_id ??
      f.categoryId ??
      (typeof f.category === "string"
        ? Number(String(f.category).split("/").pop())
        : null);
    const found = cats.find((c) => c.id === id);
    return found?.name ?? "—";
  };

  const openCreate = () => {
    setCreateForm(emptyCreate);
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    try {
      if (!createForm.title.trim()) return errorToast("Le titre est requis");
      if (!createForm.date) return errorToast("La date est requise");
      if (!createForm.category_id)
        return errorToast("La catégorie est requise");
      const modules = (createForm.modules ?? [])
        .map((m) => String(m).trim())
        .filter(Boolean);
      const payload: any = {
        title: createForm.title,
        description: createForm.description ?? null,
        price_cfa:
          createForm.price_type === "fixed"
            ? Number(createForm.price_cfa ?? 0)
            : null,
        price_type: createForm.price_type,
        duration: createForm.duration,
        max_participants: Number(createForm.max_participants),
        type: createForm.type,
        level: createForm.level,
        date: createForm.date,
        trainer: createForm.trainer,
        active: !!createForm.active,
        category_id: createForm.category_id,
        modules,
      };
      const created = await formations.create(payload);
      setItems((s) => [created, ...s]);
      setIsCreateOpen(false);
      success("Formation créée avec succès");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Création impossible";
      errorToast(msg);
    }
  };

  const openEdit = (f: Formation) => {
    setEditing(f);
    setEditForm({
      title: f.title || "",
      description: f.description ?? "",
      price_cfa: f.price_cfa ?? 0,
      price_type: (f.price_type as any) || "fixed",
      duration: f.duration || "",
      max_participants: f.max_participants ?? 1,
      type: (f.type as any) || "Présentiel",
      level: f.level ?? LEVELS[0],
      date: toDateInputValue(f.date),
      trainer: f.trainer || "",
      active: !!f.active,
      category_id:
        f.category_id ??
        f.categoryId ??
        (typeof f.category === "string"
          ? Number(String(f.category).split("/").pop())
          : null),
      modules: (f.modules as string[] | undefined) ?? [],
    });
  };

  const handleEdit = async () => {
    if (!editing) return;
    try {
      const original = editing;
      const changed = (a: any, b: any) =>
        JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
      const payload: any = {};
      if (changed(editForm.title, original.title))
        payload.title = editForm.title;
      if (changed(editForm.description ?? null, original.description ?? null))
        payload.description = editForm.description ?? null;
      if (
        changed(editForm.price_type ?? "fixed", original.price_type ?? "fixed")
      )
        payload.price_type = editForm.price_type;
      if (
        changed(
          Number(editForm.price_cfa ?? null),
          Number(original.price_cfa ?? null)
        )
      )
        payload.price_cfa =
          editForm.price_type === "fixed"
            ? Number(editForm.price_cfa ?? 0)
            : null;
      if (changed(editForm.duration, original.duration))
        payload.duration = editForm.duration;
      if (
        changed(
          Number(editForm.max_participants),
          Number(original.max_participants)
        )
      )
        payload.max_participants = Number(editForm.max_participants);
      if (changed(editForm.type, original.type)) payload.type = editForm.type;
      if (changed(editForm.level ?? null, original.level ?? null))
        payload.level = editForm.level;
      if (changed(editForm.date, toDateInputValue(original.date)))
        payload.date = editForm.date;
      if (changed(editForm.trainer, original.trainer))
        payload.trainer = editForm.trainer;
      if (changed(!!editForm.active, !!original.active))
        payload.active = !!editForm.active;
      const origCatId =
        original.category_id ??
        original.categoryId ??
        (typeof original.category === "string"
          ? Number(String(original.category).split("/").pop())
          : null);
      if (changed(editForm.category_id ?? null, origCatId ?? null))
        payload.category_id = editForm.category_id;
      if (
        changed(
          JSON.stringify(editForm.modules ?? []),
          JSON.stringify(original.modules ?? [])
        )
      )
        payload.modules = (editForm.modules ?? [])
          .map((m: string) => m.trim())
          .filter(Boolean);
      if (Object.keys(payload).length === 0)
        return info("Aucun changement détecté.");
      const updated = await formations.update(editing.id, payload);
      setItems((s) => s.map((it) => (it.id === updated.id ? updated : it)));
      setEditing(null);
      success("Formation modifiée avec succès");
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Mise à jour impossible";
      errorToast(msg);
    }
  };

  const handleDelete = async (f: Formation) => {
    if (!confirm(`Supprimer ${f.title} ?`)) return;
    try {
      await formations.remove(f.id);
      setItems((s) => s.filter((x) => x.id !== f.id));
      success("Formation supprimée");
    } catch (e: any) {
      errorToast(e?.response?.data?.message || "Suppression impossible");
    }
  };

  const toggleActive = async (f: Formation) => {
    try {
      const updated = await formations.setActive(f.id, !f.active);
      setItems((s) => s.map((x) => (x.id === f.id ? updated : x)));
      success("Statut mis à jour");
    } catch {
      errorToast("Impossible de changer le statut");
    }
  };

  const stats = useMemo(() => {
    const activeCount = items.filter((f) => f.active).length;
    const webinarCount = items.filter((f) => f.type === "Webinaire").length;
    const totalCA = items.reduce((acc, cur) => {
      const v = typeof cur.price_cfa === "number" ? cur.price_cfa : 0;
      if (cur.price_type !== "quote" && v > 0) return acc + v;
      return acc;
    }, 0);
    const participants = 0;
    return { activeCount, webinarCount, totalCA, participants };
  }, [items]);

  const typeBadge = (type?: string) => {
    const colors: Record<string, string> = {
      Présentiel: "bg-blue-100 text-blue-800",
      Webinaire: "bg-purple-100 text-purple-800",
      "En ligne": "bg-orange-100 text-orange-800",
      Hybride: "bg-green-100 text-green-800",
    };
    return colors[type || ""] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />
      <div className="ml-80 px-10 py-10">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Gestion des Formations
                </h1>
                <p className="text-red-100 max-w-xl">
                  Organisez vos formations et webinaires juridiques.
                </p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-white text-red-800 hover:bg-red-50"
                    onClick={openCreate}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Formation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Créer une Nouvelle Formation</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Titre</Label>
                        <Input
                          value={createForm.title}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Formateur</Label>
                        <Input
                          value={createForm.trainer}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              trainer: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={createForm.description ?? ""}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Modules</Label>
                        <ModulesInput
                          value={createForm.modules}
                          onChange={(modules) =>
                            setCreateForm((s) => ({ ...s, modules }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={createForm.type}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              type: e.target.value as FormType["type"],
                            }))
                          }
                        >
                          {TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Niveau</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={createForm.level}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              level: e.target.value,
                            }))
                          }
                        >
                          {LEVELS.map((lv) => (
                            <option key={lv} value={lv}>
                              {lv}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Type de prix</Label>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="priceTypeCreate"
                              value="fixed"
                              checked={createForm.price_type === "fixed"}
                              onChange={() =>
                                setCreateForm((s) => ({
                                  ...s,
                                  price_type: "fixed",
                                }))
                              }
                            />{" "}
                            Prix fixe
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="priceTypeCreate"
                              value="quote"
                              checked={createForm.price_type === "quote"}
                              onChange={() =>
                                setCreateForm((s) => ({
                                  ...s,
                                  price_type: "quote",
                                  price_cfa: null,
                                }))
                              }
                            />{" "}
                            Sur devis
                          </label>
                        </div>
                      </div>
                      <div>
                        <Label>Montant (FCFA)</Label>
                        <Input
                          type="number"
                          value={createForm.price_cfa ?? ""}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              price_cfa: e.target.value
                                ? Number(e.target.value)
                                : null,
                            }))
                          }
                          disabled={createForm.price_type === "quote"}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Durée</Label>
                        <Input
                          value={createForm.duration}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              duration: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Max participants</Label>
                        <Input
                          type="number"
                          value={createForm.max_participants}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              max_participants: Number(e.target.value || 0),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={createForm.date}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Catégorie</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={createForm.category_id ?? ""}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              category_id: e.target.value
                                ? Number(e.target.value)
                                : null,
                            }))
                          }
                          disabled={loadingCats}
                        >
                          <option value="">— Choisir —</option>
                          {cats.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={!!createForm.active}
                        onCheckedChange={(checked) =>
                          setCreateForm((s) => ({ ...s, active: !!checked }))
                        }
                      />
                      <Label>Actif</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-red-900 hover:bg-red-800"
                      onClick={handleCreate}
                    >
                      Créer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.activeCount}</div>
              <p className="text-sm text-blue-100">Formations actives</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.participants}</div>
              <p className="text-sm text-green-100">Participants inscrits</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.webinarCount}</div>
              <p className="text-sm text-purple-100">Webinaires</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {stats.totalCA.toLocaleString()}
              </div>
              <p className="text-sm text-yellow-100">CA (FCFA)</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((formation) => (
            <Card
              key={formation.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-[22px] leading-6">
                      {formation.title}
                    </CardTitle>
                    <p className="text-xs font-mono text-gray-400 mt-1">
                      {formation.code ||
                        `FORM${String(formation.id).padStart(3, "0")}`}
                    </p>
                  </div>
                  <Switch
                    checked={!!formation.active}
                    onCheckedChange={() => toggleActive(formation)}
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge className={typeBadge(formation.type)}>
                    {formation.type === "Webinaire" ? (
                      <Video className="h-3 w-3 mr-1" />
                    ) : (
                      <Users className="h-3 w-3 mr-1" />
                    )}
                    {formation.type}
                  </Badge>
                  <Badge variant="secondary">{catName(formation)}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-gray-600 text-sm">
                  {formation.description || "—"}
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="font-extrabold text-xl text-red-800">
                      {formation.price_type === "quote" ||
                      formation.price_cfa == null
                        ? "Sur devis"
                        : `${formation.price_cfa.toLocaleString()} FCFA`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <div className="flex items-center text-lg font-medium">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      {formation.duration || "—"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-base">
                      {formation.date
                        ? new Date(formation.date).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-base">{`— / ${(
                      formation.max_participants ?? 0
                    ).toString()}`}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Formateur</p>
                  <p className="text-lg font-semibold">
                    {formation.trainer || "—"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setViewing(formation)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" /> Voir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openEdit(formation)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(formation)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {viewing && (
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails — {viewing.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID / Code</Label>
                  <p className="font-mono">{viewing.code || viewing.id}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <Badge className={typeBadge(viewing.type)}>
                    {viewing.type}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p>{viewing.description || "—"}</p>
              </div>

              <div>
                <Label>Modules</Label>
                <div className="flex flex-wrap gap-2">
                  {(viewing.modules ?? []).length === 0 ? (
                    <span className="text-gray-500">—</span>
                  ) : (
                    (viewing.modules ?? []).map((m, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
                      >
                        {m}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix</Label>
                  <p className="font-bold text-red-800">
                    {viewing.price_type === "quote" || viewing.price_cfa == null
                      ? "Sur devis"
                      : `${viewing.price_cfa.toLocaleString()} FCFA`}
                  </p>
                </div>
                <div>
                  <Label>Durée</Label>
                  <p>{viewing.duration || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <p>
                    {viewing.date
                      ? new Date(viewing.date).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <p>{catName(viewing)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Formateur</Label>
                  <p>{viewing.trainer || "—"}</p>
                </div>
                <div>
                  <Label>Actif</Label>
                  <p>{viewing.active ? "Oui" : "Non"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier la Formation</DialogTitle>
            </DialogHeader>
            <div className="overflox-y-scrooll">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Formateur</Label>
                  <Input
                    value={editForm.trainer}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, trainer: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description ?? ""}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Modules</Label>
                  <ModulesInput
                    value={editForm.modules}
                    onChange={(modules) =>
                      setEditForm((s) => ({ ...s, modules }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        type: e.target.value as FormType["type"],
                      }))
                    }
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Niveau</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={editForm.level}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, level: e.target.value }))
                    }
                  >
                    {LEVELS.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type de prix</Label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priceTypeEdit"
                        value="fixed"
                        checked={editForm.price_type === "fixed"}
                        onChange={() =>
                          setEditForm((s) => ({ ...s, price_type: "fixed" }))
                        }
                      />{" "}
                      Prix fixe
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="priceTypeEdit"
                        value="quote"
                        checked={editForm.price_type === "quote"}
                        onChange={() =>
                          setEditForm((s) => ({
                            ...s,
                            price_type: "quote",
                            price_cfa: null,
                          }))
                        }
                      />{" "}
                      Sur devis
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Montant (FCFA)</Label>
                  <Input
                    type="number"
                    value={editForm.price_cfa ?? ""}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        price_cfa: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    disabled={editForm.price_type === "quote"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Durée</Label>
                  <Input
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, duration: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Max participants</Label>
                  <Input
                    type="number"
                    value={editForm.max_participants}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        max_participants: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={editForm.category_id ?? ""}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        category_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    disabled={loadingCats}
                  >
                    <option value="">— Choisir —</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={!!editForm.active}
                  onCheckedChange={(checked) =>
                    setEditForm((s) => ({ ...s, active: !!checked }))
                  }
                />
                <Label>Actif</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={handleEdit}
              >
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Toaster />
    </div>
  );
};

export default AdminFormations;
