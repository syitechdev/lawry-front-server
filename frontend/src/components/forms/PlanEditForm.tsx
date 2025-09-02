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
import type { Plan } from "@/services/plans";

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
type ColorFR = (typeof COLORS)[number];

type Props = {
  open: boolean;
  plan: Plan | null; // null => création
  onClose: () => void;
  onSubmitted?: () => void; // callback pour recharger la liste
};

export default function PlanEditForm({
  open,
  plan,
  onClose,
  onSubmitted,
}: Props) {
  const isEdit = !!plan;
  const title = isEdit ? "Modifier le Plan" : "Créer un Plan";

  // ---------- STATE ----------
  const [name, setName] = useState("");
  const [color, setColor] = useState<ColorFR>("Gris");
  const [description, setDescription] = useState<string>("");
  const [featuresText, setFeaturesText] = useState<string>(""); // 1 ligne par feature

  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPopular, setIsPopular] = useState<boolean>(false);

  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [trialDays, setTrialDays] = useState<number | null>(null);

  const [monthlyPriceCfa, setMonthlyPriceCfa] = useState<number>(0);
  const [yearlyPriceCfa, setYearlyPriceCfa] = useState<number>(0);

  // (optionnel) dégradés si tu les utilises côté public
  const [gradientFrom, setGradientFrom] = useState<string>("from-blue-500");
  const [gradientTo, setGradientTo] = useState<string>("to-blue-600");

  // ---------- HELPERS ----------
  const features = useMemo(() => {
    return (featuresText || "")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
  }, [featuresText]);

  // Normalise une couleur côté UI sur la liste FR
  function normalizeColorFR(input?: string | null): ColorFR {
    const val = (input ?? "").trim();
    const found = COLORS.find((c) => c.toLowerCase() === val.toLowerCase());
    return (found ?? "Gris") as ColorFR;
  }

  // Quand on bascule en essai ⇒ forcer les prix à 0
  useEffect(() => {
    if (isTrial) {
      setMonthlyPriceCfa(0);
      setYearlyPriceCfa(0);
    }
  }, [isTrial]);

  // Reset form à chaque ouverture / changement plan
  useEffect(() => {
    if (!open) return;

    if (isEdit && plan) {
      const pAny = plan as any; // tolère anciens champs si le service n'est pas encore à jour

      setName(plan.name ?? "");
      setColor(normalizeColorFR((plan as any).color ?? "Gris"));
      setDescription(plan.description ?? "");
      setFeaturesText(
        Array.isArray(plan.features) ? plan.features.join("\n") : ""
      );

      setIsActive(!!(plan as any).isActive ?? true);
      setIsPopular(!!(plan as any).isPopular ?? false);

      // Préfère le nouveau modèle mensuel/annuel ; sinon fallback depuis priceCfa/period
      const monthly =
        Number(pAny.monthlyPriceCfa ?? pAny.monthly_price_cfa ?? 0) || 0;
      const yearly =
        Number(pAny.yearlyPriceCfa ?? pAny.yearly_price_cfa ?? 0) || 0;

      if (monthly > 0 || yearly > 0) {
        setMonthlyPriceCfa(monthly);
        setYearlyPriceCfa(yearly);
      } else {
        // legacy: un seul priceCfa + period
        const legacyPrice = Number(pAny.priceCfa ?? pAny.price_cfa ?? 0) || 0;
        const legacyPeriod = String(pAny.period ?? "").toLowerCase();
        const isMonthly = [
          "mois",
          "mensuel",
          "mensuelle",
          "month",
          "m",
          "mensual",
          "monthly",
        ].includes(legacyPeriod);
        const isYearly = [
          "annee",
          "année",
          "annuel",
          "annuelle",
          "year",
          "a",
          "yearly",
        ].includes(legacyPeriod);
        setMonthlyPriceCfa(isMonthly ? legacyPrice : 0);
        setYearlyPriceCfa(isYearly ? legacyPrice : 0);
      }

      const trial = Boolean(pAny.isTrial ?? pAny.is_trial ?? false);
      setIsTrial(trial);
      setTrialDays(
        trial ? Number(pAny.trialDays ?? pAny.trial_days ?? 14) : null
      );

      setGradientFrom(
        String(pAny.gradientFrom ?? pAny.gradient_from ?? "from-blue-500")
      );
      setGradientTo(
        String(pAny.gradientTo ?? pAny.gradient_to ?? "to-blue-600")
      );
    } else {
      setName("");
      setColor("Gris");
      setDescription("");
      setFeaturesText("");

      setIsActive(true);
      setIsPopular(false);

      setIsTrial(false);
      setTrialDays(null);

      setMonthlyPriceCfa(0);
      setYearlyPriceCfa(0);

      setGradientFrom("from-blue-500");
      setGradientTo("to-blue-600");
    }
  }, [open, isEdit, plan]);

  // ---------- SUBMIT ----------
  const onSubmit = async () => {
    // validations front rapides
    if (!name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (!COLORS.includes(color as ColorFR)) {
      toast.error("Couleur invalide");
      return;
    }

    const m = Math.trunc(Number(monthlyPriceCfa) || 0);
    const y = Math.trunc(Number(yearlyPriceCfa) || 0);

    if (isTrial) {
      if (m !== 0 || y !== 0) {
        toast.error("Un plan d’essai doit avoir des prix mensuel/annuel à 0.");
        return;
      }
      if (!trialDays || trialDays < 1 || trialDays > 60) {
        toast.error("Indique un nombre de jours d’essai entre 1 et 60.");
        return;
      }
    } else {
      if (m <= 0 && y <= 0) {
        toast.error("Indique un prix mensuel ou annuel > 0 (hors essai).");
        return;
      }
    }

    // payload UI → service (qui mappe vers l’API en snake_case)
    const payload = {
      name: name.trim(),
      color,
      description: description.trim() || "",
      features,
      isActive,
      isPopular, // => toApi => is_popular
      isTrial,
      trialDays: isTrial ? trialDays ?? 14 : null,
      monthlyPriceCfa: m, // => toApi => monthly_price_cfa
      yearlyPriceCfa: y, // => toApi => yearly_price_cfa
      gradientFrom,
      gradientTo,
    } as Partial<Plan>;

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

  // ---------- RENDER ----------
  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nom & Couleur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan-name">Nom</Label>
              <Input
                id="plan-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Essai Gratuit / Basic / Premium…"
              />
            </div>
            <div>
              <Label htmlFor="plan-color">Couleur (badge)</Label>
              <select
                id="plan-color"
                className="w-full p-2 border rounded-md"
                value={color}
                onChange={(e) => setColor(e.target.value as ColorFR)}
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="plan-description">Description</Label>
            <Input
              id="plan-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du plan…"
            />
          </div>

          {/* Features */}
          <div>
            <Label htmlFor="plan-features">Fonctionnalités (1 par ligne)</Label>
            <textarea
              id="plan-features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              rows={5}
              placeholder={
                "Ex:\n5 consultations en ligne\nAssistance par email/téléphone\n…"
              }
            />
          </div>

          {/* Dégradés (optionnel) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grad-from">Gradient From (Tailwind)</Label>
              <Input
                id="grad-from"
                value={gradientFrom}
                onChange={(e) => setGradientFrom(e.target.value)}
                placeholder="from-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="grad-to">Gradient To (Tailwind)</Label>
              <Input
                id="grad-to"
                value={gradientTo}
                onChange={(e) => setGradientTo(e.target.value)}
                placeholder="to-blue-600"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between border rounded-md p-2">
              <div>
                <Label className="block">Actif</Label>
                <p className="text-xs text-gray-500">Visible côté public</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between border rounded-md p-2">
              <div>
                <Label className="block">Populaire</Label>
                <p className="text-xs text-gray-500">
                  Badge “Le plus populaire”
                </p>
              </div>
              <Switch checked={isPopular} onCheckedChange={setIsPopular} />
            </div>
          </div>

          {/* Essai + Prix */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Plan d’essai</Label>
                <p className="text-xs text-gray-500">
                  Prix mensuel/annuel forcés à 0
                </p>
              </div>
              <Switch checked={isTrial} onCheckedChange={setIsTrial} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="trial-days">Jours d’essai</Label>
                <Input
                  id="trial-days"
                  type="number"
                  min={1}
                  max={60}
                  disabled={!isTrial}
                  value={trialDays ?? ""}
                  onChange={(e) =>
                    setTrialDays(
                      e.target.value === ""
                        ? null
                        : Math.max(0, parseInt(e.target.value, 10) || 0)
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="price-month">Prix mensuel (FCFA)</Label>
                <Input
                  id="price-month"
                  type="number"
                  min={0}
                  disabled={isTrial}
                  value={monthlyPriceCfa}
                  onChange={(e) =>
                    setMonthlyPriceCfa(
                      Math.max(0, parseInt(e.target.value || "0", 10))
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="price-year">Prix annuel (FCFA)</Label>
                <Input
                  id="price-year"
                  type="number"
                  min={0}
                  disabled={isTrial}
                  value={yearlyPriceCfa}
                  onChange={(e) =>
                    setYearlyPriceCfa(
                      Math.max(0, parseInt(e.target.value || "0", 10))
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
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
