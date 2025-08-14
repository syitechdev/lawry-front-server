import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import { plans as plansApi } from "@/services/plans";
import type { Plan, PeriodAPI } from "@/services/plans";

type Props = {
  open: boolean;
  plan: Plan | null; // null => création
  onClose: () => void;
  onSubmitted?: () => void; // callback pour recharger la liste
};

const COLORS = [
  "Bleu",
  "Vert",
  "Rouge",
  "Jaune",
  "Violet",
  "Orange",
  "Gris",
  "Noir",
  "Blanc",
  "Cyan",
  "Rose",
] as const;

const PERIODS: PeriodAPI[] = ["Mois", "Année"];

export default function PlanEditForm({
  open,
  plan,
  onClose,
  onSubmitted,
}: Props) {
  const isEdit = !!plan;

  // Form state
  const [name, setName] = useState("");
  const [priceCfa, setPriceCfa] = useState<number>(0);
  const [period, setPeriod] = useState<PeriodAPI>("Mois");
  const [color, setColor] = useState<string>("Bleu");
  const [description, setDescription] = useState<string>("");
  const [featuresText, setFeaturesText] = useState<string>(""); // textarea (1 ligne par feature)
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPopular, setIsPopular] = useState<boolean>(false);

  const title = isEdit ? "Modifier le Plan" : "Créer un Plan";

  // Reset form à chaque ouverture / changement plan
  useEffect(() => {
    if (!open) return;
    if (isEdit && plan) {
      setName(plan.name ?? "");
      setPriceCfa(Number(plan.priceCfa ?? 0));
      setPeriod((plan.period as PeriodAPI) || "Mois");
      setColor(plan.color || "Bleu");
      setDescription(plan.description || "");
      setFeaturesText(
        Array.isArray(plan.features) ? plan.features.join("\n") : ""
      );
      setIsActive(!!plan.isActive);
      setIsPopular(!!plan.isPopular);
    } else {
      setName("");
      setPriceCfa(0);
      setPeriod("Mois");
      setColor("Bleu");
      setDescription("");
      setFeaturesText("");
      setIsActive(true);
      setIsPopular(false);
    }
  }, [open, isEdit, plan]);

  const features = useMemo(() => {
    const parts = featuresText
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    return parts;
  }, [featuresText]);

  const onSubmit = async () => {
    // validations rapides
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (Number.isNaN(priceCfa) || priceCfa < 0) {
      toast.error("Le prix doit être un entier positif");
      return;
    }
    if (!PERIODS.includes(period)) {
      toast.error("Période invalide");
      return;
    }
    if (!COLORS.includes(color as any)) {
      toast.error("Couleur invalide");
      return;
    }

    const payload = {
      name: name.trim(),
      priceCfa: Math.trunc(priceCfa),
      period,
      color,
      description: description.trim() || "",
      features,
      isActive,
      isPopular,
    };

    try {
      if (isEdit && plan) {
        await plansApi.update(plan.id, payload);
        toast.success("Plan modifié avec succès");
      } else {
        await plansApi.create(payload);
        toast.success("Nouveau plan créé");
      }
      onSubmitted?.();
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error(
        e?.message ||
          (isEdit ? "Échec de la modification" : "Échec de la création")
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan-name">Nom</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Basique / Pro / Entreprise…"
              />
            </div>
            <div>
              <Label htmlFor="plan-price">Prix (FCFA)</Label>
              <Input
                id="plan-price"
                type="number"
                value={priceCfa}
                onChange={(e) =>
                  setPriceCfa(parseInt(e.target.value || "0", 10))
                }
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan-period">Période</Label>
              <select
                id="plan-period"
                className="w-full p-2 border rounded-md"
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodAPI)}
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="plan-color">Couleur</Label>
              <select
                id="plan-color"
                className="w-full p-2 border rounded-md"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="plan-description">Description</Label>
            <Input
              id="plan-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du plan…"
            />
          </div>

          <div>
            <Label htmlFor="plan-features">Fonctionnalités (1 par ligne)</Label>
            <textarea
              id="plan-features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              rows={5}
              placeholder={"Consultation illimitée\nSupport prioritaire\n…"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between border rounded-md p-2">
              <div>
                <Label className="block">Actif</Label>
                <p className="text-xs text-gray-500">Le plan est disponible</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between border rounded-md p-2">
              <div>
                <Label className="block">Populaire</Label>
                <p className="text-xs text-gray-500">Mise en avant</p>
              </div>
              <Switch checked={isPopular} onCheckedChange={setIsPopular} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button className="bg-red-900 hover:bg-red-800" onClick={onSubmit}>
            {isEdit ? "Sauvegarder" : "Créer le Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
