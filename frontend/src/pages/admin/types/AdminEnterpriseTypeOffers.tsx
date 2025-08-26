import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  enterpriseTypes,
  type EnterpriseType,
} from "@/services/enterpriseTypes";
import {
  enterpriseTypeOffers,
  type EnterpriseTypeOffer,
} from "@/services/enterpriseTypeOffers";

type PriceOption = { label: string; price_text: string };

type FormOffer = {
  key: string;
  title: string;
  subtitle?: string;
  pill?: string | null;
  is_active: boolean;
  pricing_mode: "fixed" | "from" | "quote";
  price_amount_abidjan?: number | null;
  price_amount_interior?: number | null;
  currency?: string | null;
  features_json: string[];
  delivery_min_days?: number | null;
  delivery_max_days?: number | null;
  cta?: string | null;
  meta?: {
    options_with_price?: PriceOption[];
  } | null;
};

const emptyOffer: FormOffer = {
  key: "",
  title: "",
  subtitle: "",
  pill: "",
  is_active: true,
  pricing_mode: "from",
  price_amount_abidjan: null,
  price_amount_interior: null,
  currency: "XOF",
  features_json: [],
  delivery_min_days: null,
  delivery_max_days: null,
  cta: "Choisir cette offre",
  meta: { options_with_price: [] },
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const priceText = (o: FormOffer) => {
  if (o.pricing_mode === "quote") return "Sur devis";
  const cur = o.currency ?? "";
  const toStr = (n?: number | null) =>
    typeof n === "number" && !Number.isNaN(n)
      ? Number(n).toLocaleString("fr-FR")
      : null;
  const abj = toStr(o.price_amount_abidjan);
  const int = toStr(o.price_amount_interior);

  if (o.pricing_mode === "fixed") {
    if (abj && int && abj !== int)
      return `Abidjan: ${abj} ${cur} • Intérieur: ${int} ${cur}`;
    const any = abj ?? int;
    return any ? `${any} ${cur}` : "—";
  }

  // "from"
  if (abj && int) {
    const minNum = Math.min(
      Number(o.price_amount_abidjan ?? 0),
      Number(o.price_amount_interior ?? 0)
    );
    return `À partir de ${minNum.toLocaleString("fr-FR")} ${cur}`;
  }
  const anyNum = o.price_amount_abidjan ?? o.price_amount_interior;
  return typeof anyNum === "number"
    ? `À partir de ${Number(anyNum).toLocaleString("fr-FR")} ${cur}`
    : "À partir de —";
};

export default function AdminEnterpriseTypeOffers() {
  const { toast } = useToast();
  const { sigle = "" } = useParams();
  const navigate = useNavigate();

  const [type, setType] = useState<EnterpriseType | null>(null);
  const [offers, setOffers] = useState<EnterpriseTypeOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<EnterpriseTypeOffer | null>(null);

  const [form, setForm] = useState<FormOffer>({ ...emptyOffer });
  const [newFeature, setNewFeature] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);

  // options with price (admin UI)
  const [optLabel, setOptLabel] = useState("");
  const [optPriceText, setOptPriceText] = useState("");

  // --- helper sûr: récupère le type par sigle, avec fallback si findBySigle n'existe pas
  const fetchTypeBySigle = async (
    s: string
  ): Promise<EnterpriseType | null> => {
    const needle = (s || "").trim();
    if (!needle) return null;

    // si le service expose findBySigle, on l'utilise
    const anySvc = enterpriseTypes as any;
    if (typeof anySvc.findBySigle === "function") {
      try {
        const t = await anySvc.findBySigle(needle);
        if (t) return t as EnterpriseType;
      } catch {
        /* ignore, on fallback */
      }
    }

    // fallback: list() puis filtre local
    try {
      const { items } = await enterpriseTypes.list();
      return (
        items.find((x) => x.sigle.toLowerCase() === needle.toLowerCase()) ||
        null
      );
    } catch {
      return null;
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const t = await fetchTypeBySigle(sigle);
      if (!t) {
        toast({
          variant: "destructive",
          title: "Type introuvable",
          description: `Aucun type avec le sigle ${sigle}.`,
        });
        navigate("/admin/types-entreprise");
        return;
      }
      setType(t);
      const list = await enterpriseTypeOffers.list(t.id);
      setOffers(list);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erreur de chargement",
        description: e?.message || "Impossible de charger les offres",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigle]);

  const stats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter((o) => o.is_active).length;
    return { total, active };
  }, [offers]);

  // ===== helpers form =====
  const openCreateDialog = () => {
    setForm({ ...emptyOffer });
    setNewFeature("");
    setOptLabel("");
    setOptPriceText("");
    setOpenCreate(true);
  };

  const autoKey = useMemo(
    () => (form.title ? slugify(form.title) : ""),
    [form.title]
  );

  const addFeature = () => {
    const v = newFeature.trim();
    if (!v) return;
    const exists = (form.features_json ?? []).some(
      (f) => f.toLowerCase() === v.toLowerCase()
    );
    if (exists) {
      toast({ variant: "destructive", title: "Module déjà ajouté" });
      return;
    }
    setForm({ ...form, features_json: [...(form.features_json ?? []), v] });
    setNewFeature("");
  };

  const removeFeature = (idx: number) => {
    const next = (form.features_json ?? []).filter((_, i) => i !== idx);
    setForm({ ...form, features_json: next });
  };

  const addOptionWithPrice = () => {
    const label = optLabel.trim();
    const price_text = optPriceText.trim();
    if (!label) return;
    const current = form.meta?.options_with_price ?? [];
    setForm({
      ...form,
      meta: {
        ...(form.meta ?? {}),
        options_with_price: [...current, { label, price_text }],
      },
    });
    setOptLabel("");
    setOptPriceText("");
  };

  const removeOptionWithPrice = (idx: number) => {
    const current = form.meta?.options_with_price ?? [];
    const next = current.filter((_, i) => i !== idx);
    setForm({
      ...form,
      meta: { ...(form.meta ?? {}), options_with_price: next },
    });
  };

  // ===== validations & normalization =====
  const normalizePayload = (f: FormOffer) => {
    const isQuote = f.pricing_mode === "quote";
    return {
      ...f,
      key: f.key || autoKey || "offre",
      currency: isQuote ? "XOF" : f.currency ?? "XOF",
      price_amount_abidjan: isQuote ? null : f.price_amount_abidjan ?? null,
      price_amount_interior: isQuote ? null : f.price_amount_interior ?? null,
      features_json: Array.isArray(f.features_json) ? f.features_json : [],
      meta: {
        ...(f.meta ?? {}),
        options_with_price: (f.meta?.options_with_price ?? [])
          .filter((o) => (o?.label ?? "").trim().length > 0)
          .map((o) => ({
            label: o.label.trim(),
            price_text: (o.price_text ?? "").trim(),
          })),
      },
    };
  };

  const validateBeforeSave = (f: FormOffer) => {
    if (!f.title.trim()) {
      toast({ variant: "destructive", title: "Titre requis" });
      return false;
    }
    if (f.pricing_mode !== "quote") {
      const anyPrice =
        typeof f.price_amount_abidjan === "number" ||
        typeof f.price_amount_interior === "number";
      if (!anyPrice) {
        toast({
          variant: "destructive",
          title: "Prix requis",
          description:
            "Renseigne au moins un prix (Abidjan ou Intérieur) pour les modes 'À partir de' / 'Prix fixe'.",
        });
        return false;
      }
    }
    return true;
  };

  // ===== création =====
  const createOffer = async () => {
    if (!type) return;
    if (!validateBeforeSave(form)) return;

    const payload = normalizePayload(form);

    try {
      setLoadingCreate(true);
      const created = await enterpriseTypeOffers.create(type.id, payload);
      setOffers((prev) => [...prev, created]);
      setOpenCreate(false);
      toast({ title: "Offre créée" });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erreur création",
        description:
          e?.response?.data?.message ||
          e?.message ||
          "Impossible de créer l’offre",
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  // ===== édition =====
  const openEdit = (o: EnterpriseTypeOffer) => {
    setEditing(o);
    setForm({
      key: o.key,
      title: o.title,
      subtitle: o.subtitle ?? "",
      pill: o.pill ?? "",
      is_active: !!o.is_active,
      pricing_mode: o.pricing_mode,
      price_amount_abidjan: o.price_amount_abidjan ?? null,
      price_amount_interior: o.price_amount_interior ?? null,
      currency: o.currency ?? "XOF",
      features_json: Array.isArray(o.features_json) ? o.features_json : [],
      delivery_min_days: o.delivery_min_days ?? null,
      delivery_max_days: o.delivery_max_days ?? null,
      cta: o.cta ?? "Choisir cette offre",
      meta: {
        options_with_price: Array.isArray(o.meta?.options_with_price)
          ? (o.meta!.options_with_price as PriceOption[])
          : [],
      },
    });
    setNewFeature("");
    setOptLabel("");
    setOptPriceText("");
  };

  const applyEdit = async () => {
    if (!editing) return;
    if (!validateBeforeSave(form)) return;

    const payload = normalizePayload(form);

    try {
      const updated = await enterpriseTypeOffers.update(editing.id, payload);
      setOffers((prev) => prev.map((x) => (x.id === editing.id ? updated : x)));
      setEditing(null);
      toast({ title: "Offre mise à jour" });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erreur mise à jour",
        description:
          e?.response?.data?.message || "Impossible de mettre à jour",
      });
    }
  };

  // ===== suppression =====
  const remove = async (id: number) => {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await enterpriseTypeOffers.remove(id);
      setOffers((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Offre supprimée" });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erreur suppression",
        description: e?.response?.data?.message || "Suppression impossible",
      });
    }
  };

  // ===== publish toggle =====
  const toggleActive = async (o: EnterpriseTypeOffer) => {
    try {
      if (o.is_active) await enterpriseTypeOffers.unpublish(o.id);
      else await enterpriseTypeOffers.publish(o.id);

      setOffers((prev) =>
        prev.map((x) => (x.id === o.id ? { ...x, is_active: !x.is_active } : x))
      );
      toast({ title: o.is_active ? "Offre dépubliée" : "Offre publiée" });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: e?.response?.data?.message || "Action impossible",
      });
    }
  };

  // ===== reorder =====
  const move = async (id: number, dir: "up" | "down") => {
    if (!type) return;
    const idx = offers.findIndex((x) => x.id === id);
    if (idx < 0) return;

    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= offers.length) return;

    const next = [...offers];
    [next[idx], next[target]] = [next[target], next[idx]];
    setOffers(next);

    try {
      await enterpriseTypeOffers.reorder(
        type.id,
        next.map((x) => x.id)
      );
    } catch {
      load(); // rollback si échec
    }
  };

  const sorted = offers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="admin" />

      <div className="ml-80 px-10 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {type?.signification ?? type?.sigle ?? "…"}{" "}
                  {type?.signification && type?.sigle ? (
                    <span className="text-red-100">• {type.sigle}</span>
                  ) : null}
                </h1>
                <p className="text-red-100">
                  Gérez les offres visibles côté client (prix Abidjan /
                  Intérieur, modules, délais, CTA).
                </p>
              </div>
              <Button
                className="bg-white text-red-800 hover:bg-red-50"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4 mr-2" /> Nouvelle offre
              </Button>
            </div>
          </div>
        </div>

        {/* Modale contrôlée - Création */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Créer une offre</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6">
              {/* titre + sous-titre */}
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
                    Clé auto :{" "}
                    <span className="font-mono">{autoKey || "—"}</span>
                  </p>
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
              </div>

              {/* pill + pricing + currency + active */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Badge (pill)</Label>
                  <Input
                    placeholder="Populaire, Express…"
                    value={form.pill ?? ""}
                    onChange={(e) => setForm({ ...form, pill: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mode de prix</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={form.pricing_mode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricing_mode: e.target
                          .value as FormOffer["pricing_mode"],
                      })
                    }
                  >
                    <option value="from">À partir de…</option>
                    <option value="fixed">Prix fixe</option>
                    <option value="quote">Sur devis</option>
                  </select>
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
                <div className="flex items-center gap-3 mt-6">
                  <Switch
                    checked={!!form.is_active}
                    onCheckedChange={(v) =>
                      setForm({ ...form, is_active: !!v })
                    }
                  />
                  <Label>Actif</Label>
                </div>
              </div>

              {/* prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Prix Abidjan</Label>
                  <Input
                    type="number"
                    value={form.price_amount_abidjan ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price_amount_abidjan: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    disabled={form.pricing_mode === "quote"}
                  />
                  {form.pricing_mode !== "quote" &&
                    typeof form.price_amount_abidjan !== "number" &&
                    typeof form.price_amount_interior !== "number" && (
                      <p className="text-[11px] text-red-600 mt-1">
                        Renseigne au moins un prix (Abidjan ou Intérieur).
                      </p>
                    )}
                </div>
                <div>
                  <Label>Prix Intérieur</Label>
                  <Input
                    type="number"
                    value={form.price_amount_interior ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price_amount_interior: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    disabled={form.pricing_mode === "quote"}
                  />
                </div>
              </div>

              {/* délais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Délais (min jours)</Label>
                  <Input
                    type="number"
                    value={form.delivery_min_days ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        delivery_min_days: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Délais (max jours)</Label>
                  <Input
                    type="number"
                    value={form.delivery_max_days ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        delivery_max_days: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              {/* éléments inclus */}
              <div>
                <Label>Éléments inclus (modules)</Label>
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
                    className="bg-red-900 hover:bg-red-800"
                    type="button"
                    onClick={addFeature}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                  </Button>
                </div>
                {(form.features_json ?? []).length > 0 && (
                  <ul className="mt-3 grid gap-2">
                    {form.features_json.map((f, i) => (
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

              {/* options avec prix */}
              <div>
                <Label>Options avec prix</Label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Libellé (ex: Rattachement fiscal)"
                      value={optLabel}
                      onChange={(e) => setOptLabel(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      placeholder='Prix (ex: "79 000 FCFA" ou "à partir de 75 000 FCFA")'
                      value={optPriceText}
                      onChange={(e) => setOptPriceText(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Button
                      className="w-full bg-red-900 hover:bg-red-800"
                      type="button"
                      onClick={addOptionWithPrice}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Ajouter
                    </Button>
                  </div>
                </div>

                {Boolean(form.meta?.options_with_price?.length) && (
                  <ul className="mt-3 grid gap-2">
                    {form.meta!.options_with_price!.map((o, i) => (
                      <li
                        key={`${o.label}-${i}`}
                        className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {o.label} —{" "}
                          <span className="font-medium">
                            {o.price_text || "—"}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeOptionWithPrice(i)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Supprimer l’option"
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* CTA */}
              <div>
                <Label>Texte bouton (CTA)</Label>
                <Input
                  value={form.cta ?? ""}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenCreate(false)}>
                Annuler
              </Button>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={createOffer}
                disabled={loadingCreate}
              >
                {loadingCreate ? "Création..." : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="text-4xl font-extrabold leading-none">
                  {stats.total}
                </div>
                <p className="text-base mt-2 text-white/90">Offres totales</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="text-4xl font-extrabold leading-none">
                  {stats.active}
                </div>
                <p className="text-base mt-2 text-white/90">Offres actives</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {sorted.map((o, idx) => {
            const formLike: FormOffer = {
              key: o.key,
              title: o.title,
              subtitle: o.subtitle ?? "",
              pill: o.pill ?? "",
              is_active: o.is_active,
              pricing_mode: o.pricing_mode,
              price_amount_abidjan: o.price_amount_abidjan ?? null,
              price_amount_interior: o.price_amount_interior ?? null,
              currency: o.currency ?? "XOF",
              features_json: Array.isArray(o.features_json)
                ? o.features_json
                : [],
              delivery_min_days: o.delivery_min_days ?? null,
              delivery_max_days: o.delivery_max_days ?? null,
              cta: o.cta ?? "",
              meta: {
                options_with_price: Array.isArray(o.meta?.options_with_price)
                  ? (o.meta!.options_with_price as PriceOption[])
                  : [],
              },
            };

            return (
              <Card key={o.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[22px] leading-6">
                        {o.title}
                      </CardTitle>
                      {o.subtitle && (
                        <p className="text-sm text-gray-500 mt-1">
                          {o.subtitle}
                        </p>
                      )}
                      {o.pill && (
                        <Badge className="mt-2 bg-amber-100 text-amber-700 border border-amber-200">
                          {o.pill}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          o.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {o.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      <Switch
                        checked={!!o.is_active}
                        onCheckedChange={() => toggleActive(o)}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-xl font-extrabold text-gray-900">
                    {priceText(formLike)}
                  </div>
                  {(o.delivery_min_days || o.delivery_max_days) && (
                    <div className="text-xs text-gray-600 mt-1">
                      Délais: {o.delivery_min_days ?? "?"}–
                      {o.delivery_max_days ?? "?"} j.
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {(o.features_json ?? []).length === 0 && (
                      <li className="text-sm text-gray-500">—</li>
                    )}
                    {(o.features_json ?? []).map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {!!formLike.meta?.options_with_price?.length && (
                    <div className="pt-1">
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        Options avec prix :
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {formLike.meta!.options_with_price!.map((op, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span>{op.label}</span>
                            <span className="font-medium">
                              {op.price_text || "—"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEdit(o)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Modifier
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => remove(o.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => move(o.id, "up")}
                      disabled={idx === 0}
                      title="Monter"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => move(o.id, "down")}
                      disabled={idx === sorted.length - 1}
                      title="Descendre"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!loading && sorted.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-20">
              Aucune offre. Clique sur “Nouvelle offre”.
            </div>
          )}
        </div>
      </div>

      {/* EDIT dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Modifier l’offre</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6">
              {/* même UI que création, réutilise l’état `form` */}
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
                  <Label>Clé</Label>
                  <Input
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sous-titre</Label>
                  <Input
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm({ ...form, subtitle: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Badge (pill)</Label>
                  <Input
                    value={form.pill ?? ""}
                    onChange={(e) => setForm({ ...form, pill: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Mode de prix</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={form.pricing_mode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pricing_mode: e.target
                          .value as FormOffer["pricing_mode"],
                      })
                    }
                  >
                    <option value="from">À partir de…</option>
                    <option value="fixed">Prix fixe</option>
                    <option value="quote">Sur devis</option>
                  </select>
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
                <div className="flex items-center gap-3 mt-6">
                  <Switch
                    checked={!!form.is_active}
                    onCheckedChange={(v) =>
                      setForm({ ...form, is_active: !!v })
                    }
                  />
                  <Label>Actif</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Prix Abidjan</Label>
                  <Input
                    type="number"
                    value={form.price_amount_abidjan ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price_amount_abidjan: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    disabled={form.pricing_mode === "quote"}
                  />
                </div>
                <div>
                  <Label>Prix Intérieur</Label>
                  <Input
                    type="number"
                    value={form.price_amount_interior ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price_amount_interior: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    disabled={form.pricing_mode === "quote"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Délais (min jours)</Label>
                  <Input
                    type="number"
                    value={form.delivery_min_days ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        delivery_min_days: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Délais (max jours)</Label>
                  <Input
                    type="number"
                    value={form.delivery_max_days ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        delivery_max_days: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </div>

              {/* éléments inclus */}
              <div>
                <Label>Éléments inclus (modules)</Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ajouter un module"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = newFeature.trim();
                        if (!v) return;
                        if (
                          !(form.features_json ?? []).some(
                            (f) => f.toLowerCase() === v.toLowerCase()
                          )
                        ) {
                          setForm({
                            ...form,
                            features_json: [...(form.features_json ?? []), v],
                          });
                        }
                        setNewFeature("");
                      }
                    }}
                  />
                  <Button
                    className="bg-red-900 hover:bg-red-800"
                    type="button"
                    onClick={() => {
                      const v = newFeature.trim();
                      if (!v) return;
                      if (
                        !(form.features_json ?? []).some(
                          (f) => f.toLowerCase() === v.toLowerCase()
                        )
                      ) {
                        setForm({
                          ...form,
                          features_json: [...(form.features_json ?? []), v],
                        });
                      }
                      setNewFeature("");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                  </Button>
                </div>

                {(form.features_json ?? []).length > 0 && (
                  <ul className="mt-3 grid gap-2">
                    {form.features_json.map((f, i) => (
                      <li
                        key={`${f}-${i}`}
                        className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">{f}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              features_json: (form.features_json ?? []).filter(
                                (_, x) => x !== i
                              ),
                            })
                          }
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

              {/* options avec prix */}
              <div>
                <Label>Options avec prix</Label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Libellé"
                      value={optLabel}
                      onChange={(e) => setOptLabel(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      placeholder='Prix (ex: "79 000 FCFA")'
                      value={optPriceText}
                      onChange={(e) => setOptPriceText(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Button
                      className="w-full bg-red-900 hover:bg-red-800"
                      type="button"
                      onClick={addOptionWithPrice}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Ajouter
                    </Button>
                  </div>
                </div>

                {Boolean(form.meta?.options_with_price?.length) && (
                  <ul className="mt-3 grid gap-2">
                    {form.meta!.options_with_price!.map((o, i) => (
                      <li
                        key={`${o.label}-${i}`}
                        className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {o.label} —{" "}
                          <span className="font-medium">
                            {o.price_text || "—"}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeOptionWithPrice(i)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Supprimer l’option"
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <Label>Texte bouton (CTA)</Label>
                <Input
                  value={form.cta ?? ""}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                />
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
