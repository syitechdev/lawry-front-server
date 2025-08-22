import { useEffect, useMemo, useState } from "react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
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
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Plus, Edit, Trash2 } from "lucide-react";
import {
  requestTypes,
  type RequestType,
  type VariantCard,
} from "@/services/requestTypes";

type FormCard = {
  key: string;
  title: string;
  subtitle?: string;
  pricing_mode: "fixed" | "from" | "quote";
  price_amount?: number | null;
  currency?: string | null;
  features?: string[];
  cta?: string;
  active?: boolean;
};

type Overview = {
  total_products: number;
  active_products: number;
  downloads: number;
  revenue_fcfa: number;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const uniqueKey = (base: string, existing: string[]) => {
  let k = slugify(base) || "carte";
  if (!existing.includes(k)) return k;
  let i = 2;
  while (existing.includes(`${k}-${i}`)) i++;
  return `${k}-${i}`;
};

const priceText = (c: FormCard) => {
  if (c.pricing_mode === "quote" || !c.price_amount) return "Sur devis";
  const amount = Number(c.price_amount || 0).toLocaleString("fr-FR");
  return c.pricing_mode === "from"
    ? `À partir de ${amount} ${c.currency ?? ""}`.trim()
    : `${amount} ${c.currency ?? ""}`.trim();
};

export default function AdminRedigerContrat() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rt, setRt] = useState<RequestType | null>(null);
  const [cards, setCards] = useState<FormCard[]>([]);
  const [order, setOrder] = useState<string[]>([]);

  // dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<FormCard | null>(null);
  const [newFeature, setNewFeature] = useState("");

  const empty: FormCard = {
    key: "",
    title: "",
    subtitle: "",
    pricing_mode: "from",
    price_amount: 0,
    currency: "XOF",
    features: [],
    cta: "Commander ce contrat",
    active: true,
  };
  const [form, setForm] = useState<FormCard>({ ...empty });

  const typeSlug = "rediger-contrat";

  const load = async () => {
    setLoading(true);
    try {
      const found = await requestTypes.getBySlug(typeSlug);
      if (!found) {
        toast({
          variant: "destructive",
          title: "Introuvable",
          description: `RequestType ${typeSlug} non trouvé.`,
        });
        return;
      }
      setRt(found);
      const cfg = found.config || {};
      const arr = (cfg.variant_cards ?? []) as VariantCard[];
      const normalized: FormCard[] = arr.map((c) => ({
        key: c.key,
        title: c.title,
        subtitle: c.subtitle ?? "",
        pricing_mode: c.pricing_mode,
        price_amount: c.price_amount ?? null,
        currency: c.currency ?? found.currency ?? "XOF",
        features: (c.features ?? []).map(String),
        cta: c.cta ?? "Commander ce contrat",
        active: c.active ?? true,
      }));
      setCards(normalized);
      setOrder(
        ((cfg.order ?? []) as string[]).length
          ? (cfg.order as string[])
          : normalized.map((x) => x.key)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    //
  }, []);

  useEffect(() => {
    if (!openCreate) setNewFeature("");
  }, [openCreate]);

  useEffect(() => {
    if (!editing) setNewFeature("");
  }, [editing]);

  const addFeature = () => {
    const v = newFeature.trim();
    if (!v) return;
    const exists = (form.features ?? []).some(
      (f) => f.toLowerCase() === v.toLowerCase()
    );
    if (exists) {
      toast({
        variant: "destructive",
        title: "Déjà ajouté",
        description: "Ce module existe déjà.",
      });
      return;
    }
    setForm({ ...form, features: [...(form.features ?? []), v] });
    setNewFeature("");
  };

  const removeFeature = (idx: number) => {
    const next = (form.features ?? []).filter((_, i) => i !== idx);
    setForm({ ...form, features: next });
  };

  const toKey = (raw: string) => {
    const existing = cards.map((c) => c.key);
    return uniqueKey(raw, existing);
  };

  const saveConfig = async (
    silent = false,
    cardsOverride?: FormCard[],
    orderOverride?: string[]
  ) => {
    if (!rt) return;
    const effectiveCards = cardsOverride ?? cards;
    const effectiveOrder =
      orderOverride && orderOverride.length
        ? orderOverride
        : effectiveCards.map((c) => c.key);

    const config = {
      variant_cards: effectiveCards,
      order: effectiveOrder,
    };

    try {
      const updated = await requestTypes.putConfig(rt.id, config);
      setRt(updated);
      if (!silent)
        toast({
          title: "Sauvegardé",
          description: "Configuration mise à jour.",
        });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          e?.response?.data?.message || "Impossible d’enregistrer la config",
      });
    }
  };

  // create
  const openCreateDialog = () => {
    setForm({ ...empty, currency: rt?.currency ?? "XOF" });
    setOpenCreate(true);
  };

  const previewCreateKey = useMemo(
    () => (form.title ? toKey(form.title) : ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.title, cards]
  );

  const stats = useMemo(() => {
    const total = cards.length;
    const active = cards.filter((c) => c.active).length;
    return { total, active };
  }, [cards]);

  const createCard = async () => {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Titre requis" });
      return;
    }
    const key = toKey(form.title);
    const newCard: FormCard = { ...form, key };
    const nextCards = [...cards, newCard];
    const nextOrder = order.includes(key) ? order : [...order, key];

    setCards(nextCards);
    setOrder(nextOrder);
    setOpenCreate(false);
    await saveConfig(false, nextCards, nextOrder);
  };

  // edit
  const openEditDialog = (c: FormCard) => {
    setEditing(c);
    setForm({ ...c });
  };

  const applyEdit = async () => {
    if (!editing) return;

    const safeFeatures =
      form.features && form.features.length > 0
        ? form.features
        : editing.features;

    const edited: FormCard = {
      ...form,
      key: editing.key,
      features: safeFeatures,
    };

    const nextCards = cards.map((c) => (c.key === editing.key ? edited : c));
    const nextOrder = order.map((k) => (k === editing.key ? editing.key : k));

    setCards(nextCards);
    setOrder(nextOrder);
    setEditing(null);
    await saveConfig(false, nextCards, nextOrder);
  };

  // ===== DELETE =====
  const removeCard = async (key: string) => {
    if (!confirm("Supprimer cette carte ?")) return;

    const nextCards = cards.filter((c) => c.key !== key);
    const nextOrder = order.filter((k) => k !== key);

    setCards(nextCards);
    setOrder(nextOrder);
    await saveConfig(false, nextCards, nextOrder);
  };

  // acrtive /desactive
  const toggleActive = async (key: string) => {
    const nextCards = cards.map((c) =>
      c.key === key ? { ...c, active: !c.active } : c
    );
    const nowActive = nextCards.find((c) => c.key === key)?.active;
    setCards(nextCards);

    await saveConfig(true, nextCards, order); // silencieux
    toast({
      title: nowActive ? "Carte activée" : "Carte désactivée",
      description: nowActive
        ? "La carte est désormais visible côté client."
        : "La carte ne sera plus proposée au client.",
    });
  };

  const sortedCards = useMemo(() => {
    const map = new Map(cards.map((c) => [c.key, c]));
    return order.map((k) => map.get(k)).filter(Boolean) as FormCard[];
  }, [cards, order]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-10 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Rédiger un contrat</h1>
                <p className="text-red-100">
                  Gérez les cartes visibles côté client (titre, prix, points,
                  CTA).
                </p>
              </div>
              <Dialog
                open={openCreate}
                onOpenChange={(o) => {
                  setOpenCreate(o);
                  if (!o) setForm({ ...empty }); // reset si on ferme
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-white text-red-800 hover:bg-red-50"
                    onClick={openCreateDialog}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Nouvelle carte
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter une carte</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Titre</Label>
                        <Input
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                        />
                        <p className="text-[11px] text-gray-500 mt-1">
                          Clé auto:&nbsp;
                          <span className="font-mono">
                            {previewCreateKey || "—"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <Label>Sous-titre</Label>
                        <Input
                          placeholder="CDI, CDD, stage, freelance"
                          value={form.subtitle}
                          onChange={(e) =>
                            setForm({ ...form, subtitle: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Mode de prix</Label>
                        <select
                          className="w-full border rounded-md p-2"
                          value={form.pricing_mode}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              pricing_mode: e.target
                                .value as FormCard["pricing_mode"],
                            })
                          }
                        >
                          <option value="from">À partir de…</option>
                          <option value="fixed">Prix fixe</option>
                          <option value="quote">Sur devis</option>
                        </select>
                      </div>
                      <div>
                        <Label>Montant</Label>
                        <Input
                          type="number"
                          value={form.price_amount ?? ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              price_amount: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          disabled={form.pricing_mode === "quote"}
                        />
                      </div>
                      <div>
                        <Label>Devise</Label>
                        <Input
                          value={form.currency ?? ""}
                          onChange={(e) =>
                            setForm({ ...form, currency: e.target.value })
                          }
                          disabled={form.pricing_mode === "quote"}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Modules</Label>

                      <div className="flex gap-3">
                        <Input
                          placeholder="Ajouter un module"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addFeature();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          className="bg-red-900 hover:bg-red-800"
                          onClick={addFeature}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Ajouter
                        </Button>
                      </div>

                      <p className="text-[12px] text-gray-500 mt-2">
                        Les modules apparaîtront dans la fiche détaillée.
                      </p>

                      {(form.features ?? []).length > 0 && (
                        <ul className="mt-3 grid gap-2">
                          {(form.features ?? []).map((f, i) => (
                            <li
                              key={`${f}-${i}`}
                              className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                            >
                              <span className="text-gray-700">{f}</span>
                              <button
                                type="button"
                                onClick={() => removeFeature(i)}
                                className="text-red-600 hover:text-red-700"
                                aria-label="Supprimer le module"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Texte du bouton</Label>
                        <Input
                          value={form.cta ?? ""}
                          onChange={(e) =>
                            setForm({ ...form, cta: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                        <Switch
                          checked={!!form.active}
                          onCheckedChange={(v) =>
                            setForm({ ...form, active: !!v })
                          }
                        />
                        <Label>Actif</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setOpenCreate(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-red-900 hover:bg-red-800"
                      onClick={createCard}
                    >
                      Créer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="text-4xl font-extrabold leading-none">
                  {stats.total.toLocaleString("fr-FR")}
                </div>
                <p className="text-base mt-2 text-white/90">Cartes totales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="text-4xl font-extrabold leading-none">
                  {stats.active.toLocaleString("fr-FR")}
                </div>
                <p className="text-base mt-2 text-white/90">Cartes actives</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CARTES — 3 par ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCards.map((c) => (
            <Card key={c.key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-[22px] leading-6">
                      {c.title}
                    </CardTitle>
                    {c.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{c.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {c.active ? "Actif" : "Inactif"}
                    </Badge>
                    <Switch
                      checked={!!c.active}
                      onCheckedChange={() => toggleActive(c.key)}
                    />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-extrabold text-gray-900">
                  {priceText(c)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {(c.features ?? []).length === 0 && (
                    <li className="text-sm text-gray-500">—</li>
                  )}
                  {(c.features ?? []).map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(c)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeCard(c.key)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loading && sortedCards.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-20">
              Aucune carte. Cliquez sur “Nouvelle carte”.
            </div>
          )}
        </div>
      </div>

      {/* EDIT dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la carte</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Clé (auto)</Label>
                  <Input value={editing.key} disabled className="font-mono" />
                </div>
              </div>
              <div>
                <Label>Sous-titre</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Mode de prix</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={form.pricing_mode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricing_mode: e.target
                          .value as FormCard["pricing_mode"],
                      })
                    }
                  >
                    <option value="from">À partir de…</option>
                    <option value="fixed">Prix fixe</option>
                    <option value="quote">Sur devis</option>
                  </select>
                </div>
                <div>
                  <Label>Montant</Label>
                  <Input
                    type="number"
                    value={form.price_amount ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price_amount: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    disabled={form.pricing_mode === "quote"}
                  />
                </div>
                <div>
                  <Label>Devise</Label>
                  <Input
                    value={form.currency ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    disabled={form.pricing_mode === "quote"}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Modules</Label>

                <div className="flex gap-3">
                  <Input
                    placeholder="Ajouter un module"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    className="bg-red-900 hover:bg-red-800"
                    onClick={addFeature}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                  </Button>
                </div>

                <p className="text-[12px] text-gray-500 mt-2">
                  Les modules apparaîtront dans la fiche détaillée.
                </p>

                {(form.features ?? []).length > 0 && (
                  <ul className="mt-3 grid gap-2">
                    {(form.features ?? []).map((f, i) => (
                      <li
                        key={`${f}-${i}`}
                        className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">{f}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Supprimer le module"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Texte du bouton</Label>
                  <Input
                    value={form.cta ?? ""}
                    onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <Switch
                    checked={!!form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: !!v })}
                  />
                  <Label>Actif</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={applyEdit}
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
}
