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

// ✅ Unification des toasts: shadcn
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { formations, type Formation } from "@/services/formations";
import { categories as catSvc, type Category } from "@/services/categories";

type FormType = {
  title: string;
  description?: string | null;
  price_cfa: number;
  duration: string;
  max_participants: number;
  type: "Présentiel" | "Webinaire" | "En ligne";
  date: string; // YYYY-MM-DD
  trainer: string;
  active: boolean;
  category_id: number | null; // select
};

const TYPES: Array<FormType["type"]> = ["Présentiel", "Webinaire", "En ligne"];

// convertit ISO -> YYYY-MM-DD pour l’input date
function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  // cas "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  // cas ISO
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const AdminFormations = () => {
  const { toast } = useToast();
  const success = (description: string, title = "Succès") =>
    toast({ title, description });
  const errorToast = (description: string, title = "Erreur") =>
    toast({ title, description, variant: "destructive" });
  const info = (description: string, title = "Info") =>
    toast({ title, description });

  // UI dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewing, setViewing] = useState<Formation | null>(null);
  const [editing, setEditing] = useState<Formation | null>(null);

  // data
  const [items, setItems] = useState<Formation[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  // forms
  const emptyCreate: FormType = {
    title: "",
    description: "",
    price_cfa: 0,
    duration: "",
    max_participants: 1,
    type: "Présentiel",
    date: "",
    trainer: "",
    active: true,
    category_id: null,
  };
  const [createForm, setCreateForm] = useState<FormType>(emptyCreate);

  const [editForm, setEditForm] = useState<FormType>({
    title: "",
    description: "",
    price_cfa: 0,
    duration: "",
    max_participants: 1,
    type: "Présentiel",
    date: "",
    trainer: "",
    active: true,
    category_id: null,
  });

  // load
  const loadCats = async () => {
    setLoadingCats(true);
    try {
      const res = await catSvc.list({ order: { name: "asc" } });
      setCats(res.items);
    } catch (e: any) {
      console.error(e);
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
    } catch (e: any) {
      console.error(e);
      errorToast("Erreur lors du chargement des formations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
    loadFormations();
  }, []);

  // helpers
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

  // CREATE
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

      const created = await formations.create({
        title: createForm.title,
        description: createForm.description ?? null,
        price_cfa: Number(createForm.price_cfa),
        duration: createForm.duration,
        max_participants: Number(createForm.max_participants),
        type: createForm.type,
        date: createForm.date, // YYYY-MM-DD
        trainer: createForm.trainer,
        active: !!createForm.active,
        // ⚠️ le service convertit category_id -> category IRI
        category_id: createForm.category_id,
      });

      setItems((s) => [created, ...s]);
      setIsCreateOpen(false);
      success("Formation créée avec succès");
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Création impossible";
      errorToast(msg);
    }
  };

  // EDIT
  const openEdit = (f: Formation) => {
    setEditing(f);
    setEditForm({
      title: f.title || "",
      description: f.description ?? "",
      price_cfa: f.price_cfa ?? 0,
      duration: f.duration || "",
      max_participants: f.max_participants ?? 1,
      type: (f.type as any) || "Présentiel",
      date: toDateInputValue(f.date),
      trainer: f.trainer || "",
      active: !!f.active,
      category_id:
        f.category_id ??
        f.categoryId ??
        (typeof f.category === "string"
          ? Number(String(f.category).split("/").pop())
          : null),
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
      if (changed(Number(editForm.price_cfa), Number(original.price_cfa)))
        payload.price_cfa = Number(editForm.price_cfa);
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

      if (changed(editForm.category_id ?? null, origCatId ?? null)) {
        payload.category_id = editForm.category_id; // le service convertit en IRI pour PATCH
      }

      if (Object.keys(payload).length === 0) {
        return info("Aucun changement détecté.");
      }

      const updated = await formations.update(editing.id, payload);
      setItems((s) => s.map((it) => (it.id === updated.id ? updated : it)));
      setEditing(null);
      success("Formation modifiée avec succès");
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        "Mise à jour impossible";
      errorToast(msg);
    }
  };

  // DELETE
  const handleDelete = async (f: Formation) => {
    if (!confirm(`Supprimer ${f.title} ?`)) return;
    try {
      await formations.remove(f.id);
      setItems((s) => s.filter((x) => x.id !== f.id));
      success("Formation supprimée");
    } catch (e: any) {
      console.error(e);
      errorToast(e?.response?.data?.message || "Suppression impossible");
    }
  };

  // TOGGLE ACTIVE custom
  const toggleActive = async (f: Formation) => {
    try {
      const updated = await formations.setActive(f.id, !f.active);
      setItems((s) => s.map((x) => (x.id === f.id ? updated : x)));
      success("Statut mis à jour");
    } catch (e: any) {
      console.error(e);
      errorToast("Impossible de changer le statut");
    }
  };

  // stats (démo)
  const stats = useMemo(() => {
    const activeCount = items.filter((f) => f.active).length;
    const webinarCount = items.filter((f) => f.type === "Webinaire").length;
    const totalCA = 0;
    const participants = 0;
    return { activeCount, webinarCount, totalCA, participants };
  }, [items]);

  const typeBadge = (type?: string) => {
    const colors: Record<string, string> = {
      Présentiel: "bg-blue-100 text-blue-800",
      Webinaire: "bg-purple-100 text-purple-800",
      "En ligne": "bg-orange-100 text-orange-800",
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

      <div className="ml-80 px-8 py-8">
        {/* Header + Create */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Gestion des Formations
                </h1>
                <p className="text-red-100">
                  Organisez vos formations et webinaires juridiques
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
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une Nouvelle Formation</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="c-title">Titre</Label>
                      <Input
                        id="c-title"
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
                      <Label htmlFor="c-desc">Description</Label>
                      <Textarea
                        id="c-desc"
                        value={createForm.description ?? ""}
                        onChange={(e) =>
                          setCreateForm((s) => ({
                            ...s,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="c-price">Prix (FCFA)</Label>
                        <Input
                          id="c-price"
                          type="number"
                          value={createForm.price_cfa}
                          onChange={(e) =>
                            setCreateForm((s) => ({
                              ...s,
                              price_cfa: Number(e.target.value || 0),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="c-duration">Durée</Label>
                        <Input
                          id="c-duration"
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
                        <Label htmlFor="c-max">Max participants</Label>
                        <Input
                          id="c-max"
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="c-type">Type</Label>
                        <select
                          id="c-type"
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
                        <Label htmlFor="c-category">Catégorie</Label>
                        <select
                          id="c-category"
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="c-date">Date</Label>
                        <Input
                          id="c-date"
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
                        <Label htmlFor="c-trainer">Formateur</Label>
                        <Input
                          id="c-trainer"
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!!createForm.active}
                        onCheckedChange={(checked) =>
                          setCreateForm((s) => ({ ...s, active: !!checked }))
                        }
                      />
                      <Label>Actif</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
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
                      Créer la Formation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats */}
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

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((formation) => (
            <Card
              key={formation.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-lg">{formation.title}</CardTitle>
                    <p className="text-sm font-mono text-gray-500">
                      {formation.code ||
                        `FORM${String(formation.id).padStart(3, "0")}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!!formation.active}
                      onCheckedChange={() => toggleActive(formation)}
                      className="scale-75"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
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

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  {formation.description || "—"}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="font-bold text-lg text-red-800">
                      {(formation.price_cfa ?? 0).toLocaleString()} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="font-medium">
                        {formation.duration || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="font-medium">
                        {formation.date
                          ? new Date(formation.date).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participants</p>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="font-medium">
                        {/* placeholder sans module d'inscriptions */}— /{" "}
                        {(formation.max_participants ?? 0).toString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Formateur</p>
                  <p className="font-medium">{formation.trainer || "—"}</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewing(formation)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(formation)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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

      {/* View Dialog */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails — {viewing.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prix</Label>
                  <p className="font-bold text-red-800">
                    {(viewing.price_cfa ?? 0).toLocaleString()} FCFA
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

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la Formation</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="e-title">Titre</Label>
                <Input
                  id="e-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="e-desc">Description</Label>
                <Textarea
                  id="e-desc"
                  value={editForm.description ?? ""}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="e-price">Prix (FCFA)</Label>
                  <Input
                    id="e-price"
                    type="number"
                    value={editForm.price_cfa}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        price_cfa: Number(e.target.value || 0),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="e-duration">Durée</Label>
                  <Input
                    id="e-duration"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, duration: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="e-max">Max participants</Label>
                  <Input
                    id="e-max"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="e-type">Type</Label>
                  <select
                    id="e-type"
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
                  <Label htmlFor="e-category">Catégorie</Label>
                  <select
                    id="e-category"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="e-date">Date</Label>
                  <Input
                    id="e-date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="e-trainer">Formateur</Label>
                  <Input
                    id="e-trainer"
                    value={editForm.trainer}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, trainer: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={!!editForm.active}
                  onCheckedChange={(checked) =>
                    setEditForm((s) => ({ ...s, active: !!checked }))
                  }
                />
                <Label>Actif</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
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

      {/* Toaster shadcn (assure l’affichage des toasts sur cette page) */}
      <Toaster />
    </div>
  );
};

export default AdminFormations;
