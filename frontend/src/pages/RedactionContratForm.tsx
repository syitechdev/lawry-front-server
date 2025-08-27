import React, { useEffect, useMemo, useState, useRef } from "react";
import Header from "@/components/Header";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { http } from "@/lib/http";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  FileText,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  CreditCard,
  Calendar,
  Shield,
  Scale,
  Gavel,
  Lock,
  Copy,
  ExternalLink,
  BadgePercent,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

type PricingMode = "fixed" | "from" | "quote";
type VariantCard = {
  key: string;
  title: string;
  subtitle?: string | null;
  pill?: string | null;
  pricing_mode: PricingMode;
  price_amount?: number | null;
  currency?: string | null;
  features?: string[];
  cta?: string | null;
  active?: boolean;
  meta?: any;
};
type RtResponse = {
  id: number;
  name: string;
  slug: string;
  currency?: string | null;
  config?: {
    variant_cards?: VariantCard[];
    order?: string[];
  };
};

const formSchema = z.object({
  partie1Nom: z.string().min(2, "Le nom est requis"),
  partie1Adresse: z.string().min(5, "L'adresse est requise"),
  partie1Identification: z
    .string()
    .min(2, "Le numéro d'identification est requis"),
  partie1Representant: z.string().optional(),
  partie1Telephone: z.string().min(7, "Téléphone requis"),
  partie1Email: z.string().email("Email invalide"),
  objetContrat: z.string().min(10, "L'objet du contrat doit être décrit"),
  obligationsPartie1: z.string().min(10, "Obligations de la partie 1 requises"),
  obligationsPartie2: z.string().min(10, "Obligations de la partie 2 requises"),
  montant: z.string().min(1, "Le montant est requis"),
  modalitesPaiement: z.string().min(5, "Modalités de paiement requises"),
  penalitesRetard: z.string().optional(),
  dateDebut: z.string().min(1, "La date de début est requise"),
  dureeContrat: z.string().min(1, "La durée du contrat est requise"),
  conditionsResiliation: z
    .string()
    .min(5, "Les conditions de résiliation sont requises"),
  confidentialite: z.enum(["oui", "non"]),
  clausesConfidentialite: z.string().optional(),
  proprieteIntellectuelle: z.enum(["oui", "non"]),
  modalitesPI: z.string().optional(),
  garanties: z.string().min(5, "Les garanties sont requises"),
  responsabilite: z.string().optional(),
  droitApplicable: z.string().min(2, "Le droit applicable est requis"),
  reglementLitiges: z
    .array(z.string())
    .min(1, "Au moins un mode de règlement est requis"),
});
type FormData = z.infer<typeof formSchema>;

type SelectedOffer = {
  key: string;
  title: string;
  subtitle: string | null;
  pill: string | null;
  pricing_mode: PricingMode;
  price: number | null;
  currency: string | null;
  features: string[];
  cta: string | null;
};

const RedactionContratForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  const redirectedRef = useRef(false);

  const isAuthenticated =
    !!localStorage.getItem("auth_token") ||
    !!localStorage.getItem("access_token");

  const [rt, setRt] = useState<RtResponse | null>(null);
  const [cards, setCards] = useState<VariantCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  const stateOfferKey = (location.state as any)?.offer?.key as
    | string
    | undefined;
  const queryVariant = (search.get("variant") ||
    search.get("offer") ||
    undefined) as string | undefined;

  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer | null>(
    null
  );

  const [successOpen, setSuccessOpen] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [closeRedirect, setCloseRedirect] = useState<"home" | "orders" | null>(
    null
  );

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confidentialite: "non",
      proprieteIntellectuelle: "non",
      droitApplicable: "Droit ivoirien",
      reglementLitiges: [],
    },
    mode: "onTouched",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("current_user");
      if (!raw) return;
      const me = JSON.parse(raw || "{}");
      if (me?.name) form.setValue("partie1Nom", me.name);
      if (me?.address) form.setValue("partie1Adresse", me.address);
      if (me?.phone) form.setValue("partie1Telephone", me.phone);
      if (me?.email) form.setValue("partie1Email", me.email);
    } catch {}
  }, []);

  const cardToOffer = (c: VariantCard): SelectedOffer => ({
    key: c.key,
    title: c.title,
    subtitle: c.subtitle ?? null,
    pill: c.pill ?? null,
    pricing_mode: c.pricing_mode,
    price: typeof c.price_amount === "number" ? Number(c.price_amount) : null,
    currency: c.currency ?? null,
    features: Array.isArray(c.features) ? c.features : [],
    cta: c.cta ?? null,
  });

  useEffect(() => {
    (async () => {
      setLoadingCards(true);
      try {
        const { data } = await http.get<RtResponse>(
          "/request-types/slug/rediger-contrat"
        );
        const cfg = data?.config || {};
        const all = (cfg.variant_cards || []).filter((c) => c.active !== false);
        const order =
          cfg.order && cfg.order.length ? cfg.order : all.map((c) => c.key);
        const ordered = order
          .map((k) => all.find((c) => c.key === k))
          .filter(Boolean) as VariantCard[];
        setRt(data);
        setCards(ordered);

        let chosen: VariantCard | undefined;
        if (stateOfferKey)
          chosen = ordered.find((c) => c.key === stateOfferKey);
        if (!chosen && queryVariant)
          chosen = ordered.find((c) => c.key === queryVariant);
        if (!chosen) chosen = ordered[0];

        if (chosen) setSelectedOffer(cardToOffer(chosen));
      } catch (e: any) {
        toast.error(
          e?.response?.data?.message ||
            "Impossible de charger les offres. Vous pouvez tout de même soumettre."
        );
      } finally {
        setLoadingCards(false);
      }
    })();
  }, []);

  const steps = [
    { id: 1, title: "Identification", icon: FileText },
    { id: 2, title: "Objet du contrat", icon: FileText },
    { id: 3, title: "Obligations des parties", icon: FileCheck },
    { id: 4, title: "Conditions financières", icon: CreditCard },
    { id: 5, title: "Durée et résiliation", icon: Calendar },
    { id: 6, title: "Confidentialité", icon: Shield },
    { id: 7, title: "Garanties", icon: Scale },
    { id: 8, title: "Droit applicable", icon: Gavel },
  ];
  const [currentStep, setCurrentStep] = useState(1);

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: [
      "partie1Nom",
      "partie1Adresse",
      "partie1Identification",
      "partie1Representant",
      "partie1Telephone",
      "partie1Email",
    ],
    2: ["objetContrat"],
    3: ["obligationsPartie1", "obligationsPartie2"],
    4: ["montant", "modalitesPaiement", "penalitesRetard"],
    5: ["dateDebut", "dureeContrat", "conditionsResiliation"],
    6: [
      "confidentialite",
      "clausesConfidentialite",
      "proprieteIntellectuelle",
      "modalitesPI",
    ],
    7: ["garanties", "responsabilite"],
    8: ["droitApplicable", "reglementLitiges"],
  };

  const nextStep = async () => {
    const fields = stepFields[currentStep] || [];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) {
      toast.error("Champs manquants", {
        description: "Corrigez les erreurs avant de continuer.",
      });
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadedFiles((prev) => [...prev, ...files]);
    toast.success(`${files.length} document(s) ajouté(s).`);
  };
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("Document supprimé.");
  };

  const isSubmitting = form.formState.isSubmitting;

  const priceDisplay = useMemo(() => {
    if (!selectedOffer) return "—";
    const cur =
      (selectedOffer.currency || rt?.currency || "XOF") === "XOF"
        ? "FCFA"
        : selectedOffer.currency || rt?.currency || "";
    const amt = selectedOffer.price ?? null;

    switch (selectedOffer.pricing_mode) {
      case "fixed":
        return amt != null
          ? `${amt.toLocaleString("fr-FR")} ${cur}`
          : `— ${cur}`;
      case "from":
        return amt && amt > 0
          ? `À partir de ${amt.toLocaleString("fr-FR")} ${cur}`
          : "À partir de —";
      default:
        return "Sur devis";
    }
  }, [selectedOffer, rt?.currency]);

  const partie1EmailWatch = form.watch("partie1Email");
  const userEmailForReset = useMemo(() => {
    if (partie1EmailWatch) return partie1EmailWatch;
    try {
      const u = JSON.parse(localStorage.getItem("current_user") || "{}");
      return u?.email || "";
    } catch {
      return "";
    }
  }, [partie1EmailWatch]);

  const onSubmit = async (data: FormData) => {
    if (!selectedOffer?.key) {
      toast.error("Aucune offre sélectionnée", {
        description: "Choisissez un type de contrat.",
      });
      return;
    }

    const fixedPrice =
      selectedOffer.pricing_mode === "fixed" && selectedOffer.price != null
        ? Number(selectedOffer.price)
        : 0;
    const shouldPayNow = fixedPrice > 0;

    console.debug("[PAY] selectedOffer:", selectedOffer);
    console.debug(
      "[PAY] shouldPayNow:",
      shouldPayNow,
      "fixedPrice:",
      fixedPrice
    );

    try {
      const fd = new window.FormData();
      fd.append("type", "rediger-contrat");
      fd.append("variant_key", selectedOffer.key);

      const effectiveCurrency = selectedOffer.currency || rt?.currency || "XOF";
      fd.append("currency", effectiveCurrency);

      // --- champs ...
      fd.append("data[partie1Nom]", data.partie1Nom);
      fd.append("data[partie1Adresse]", data.partie1Adresse);
      fd.append("data[partie1Identification]", data.partie1Identification);
      if (data.partie1Representant)
        fd.append("data[partie1Representant]", data.partie1Representant);
      fd.append("data[partie1Telephone]", data.partie1Telephone);
      fd.append("data[partie1Email]", data.partie1Email);
      fd.append("data[objetContrat]", data.objetContrat);
      fd.append("data[obligationsPartie1]", data.obligationsPartie1);
      fd.append("data[obligationsPartie2]", data.obligationsPartie2);
      fd.append("data[montant]", data.montant);
      fd.append("data[modalitesPaiement]", data.modalitesPaiement);
      if (data.penalitesRetard)
        fd.append("data[penalitesRetard]", data.penalitesRetard);
      fd.append("data[dateDebut]", data.dateDebut);
      fd.append("data[dureeContrat]", data.dureeContrat);
      fd.append("data[conditionsResiliation]", data.conditionsResiliation);
      fd.append("data[confidentialite]", data.confidentialite);
      fd.append("data[proprieteIntellectuelle]", data.proprieteIntellectuelle);
      if (data.confidentialite === "oui" && data.clausesConfidentialite)
        fd.append("data[clausesConfidentialite]", data.clausesConfidentialite);
      if (data.proprieteIntellectuelle === "oui" && data.modalitesPI)
        fd.append("data[modalitesPI]", data.modalitesPI);
      fd.append("data[garanties]", data.garanties);
      if (data.responsabilite)
        fd.append("data[responsabilite]", data.responsabilite);
      fd.append("data[droitApplicable]", data.droitApplicable);
      (data.reglementLitiges || []).forEach((t, i) =>
        fd.append(`data[reglementLitiges][${i}]`, t)
      );

      // snapshot offre
      fd.append("data[selected_preset][key]", selectedOffer.key);
      fd.append("data[selected_preset][label]", selectedOffer.title);
      if (selectedOffer.subtitle)
        fd.append("data[selected_preset][subtitle]", selectedOffer.subtitle);
      if (selectedOffer.pill)
        fd.append("data[selected_preset][pill]", selectedOffer.pill);
      fd.append(
        "data[selected_preset][pricing_mode]",
        selectedOffer.pricing_mode
      );
      fd.append("data[selected_preset][currency]", effectiveCurrency);
      fd.append(
        "data[selected_preset][price]",
        selectedOffer.price == null ? "" : String(selectedOffer.price)
      );
      (selectedOffer.features || []).forEach((f, i) =>
        fd.append(`data[selected_preset][features][${i}]`, f)
      );
      if (selectedOffer.cta)
        fd.append("data[selected_preset][cta]", selectedOffer.cta);

      uploadedFiles.forEach((file) => fd.append("files[attachments][]", file));

      const { data: res } = await http.post("/demandes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdId = res?.id ?? res?.data?.id ?? res?.demande?.id ?? null;
      const createdRef =
        res?.ref ??
        res?.data?.ref ??
        res?.demande?.ref ??
        res?.demande?.data?.ref ??
        null;

      console.debug("[PAY] create /demandes res:", res);
      console.debug("[PAY] createdId:", createdId, "createdRef:", createdRef);

      // Protection anti-modal si on part en paiement
      redirectedRef.current = false;

      if (shouldPayNow && createdId) {
        const [first, ...rest] = (data.partie1Nom || "").trim().split(/\s+/);
        const customer = {
          email: data.partie1Email,
          firstName: first || "Client",
          lastName: rest.join(" ") || "Inconnu",
          phone: data.partie1Telephone,
        };

        try {
          const pay = await initPayment({
            type: "demande",
            id: createdId,
            customer,
            // channel: "CARD",
          });
          console.debug("[PAY] initPayment response:", pay);

          const action = pay?.action;
          const fields = pay?.fields || {};
          const method = (pay?.method as "POST" | "GET") || "POST";
          const redirectUrl =
            pay?.redirect_url ||
            pay?.redirectUrl ||
            pay?.url ||
            pay?.checkoutUrl ||
            pay?.payment_url;

          if (redirectUrl && typeof redirectUrl === "string") {
            redirectedRef.current = true;
            toast.info("Redirection vers le paiement…");
            window.location.assign(redirectUrl);
            return;
          }

          if (action && typeof action === "string") {
            redirectedRef.current = true;
            toast.info("Redirection vers le paiement…");
            autoPost(action, fields, method);
            return;
          }

          console.warn(
            "[PAY] Aucune clé utilisable pour rediriger (action/url manquants)."
          );
          toast.error("Paiement indisponible", {
            description:
              "Impossible de lancer la page de paiement. Réessayez depuis vos commandes.",
          });
        } catch (err: any) {
          console.error("[PAY] initPayment error:", err);
          toast.error("Paiement indisponible", {
            description:
              err?.message ||
              "Impossible de démarrer le paiement. Vous pourrez payer plus tard.",
          });
        }
      }

      if (!redirectedRef.current) {
        setSuccessRef(createdRef);
        setSuccessOpen(true);
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message || e?.message || "Erreur lors de l’envoi.";
      console.error("[PAY] submit error:", status, msg, e?.response?.data);

      if (status === 413 || /too large|exceeds|payload/i.test(String(msg))) {
        toast.error("Fichier trop volumineux", {
          description: "Réduisez la taille puis réessayez.",
        });
        return;
      }
      if (/does not exist|not readable/i.test(String(msg))) {
        toast.error("Fichier invalide", {
          description: "Retirez le fichier invalide puis réessayez.",
        });
        return;
      }
      if (status === 422) {
        toast.error("Formulaire incomplet", { description: msg });
        return;
      }
      toast.error("Envoi impossible", { description: msg });
    }
  };

  const stepsDef = [
    { id: 1, title: "Identification", icon: FileText },
    { id: 2, title: "Objet du contrat", icon: FileText },
    { id: 3, title: "Obligations des parties", icon: FileCheck },
    { id: 4, title: "Conditions financières", icon: CreditCard },
    { id: 5, title: "Durée et résiliation", icon: Calendar },
    { id: 6, title: "Confidentialité", icon: Shield },
    { id: 7, title: "Garanties", icon: Scale },
    { id: 8, title: "Droit applicable", icon: Gavel },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="partie1Nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom et Prénoms / Raison sociale</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: LAWRY SARL ou Jean Dupont"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partie1Identification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    N° d'identification (RCCM, NCC, CNI, Passeport)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: RCCM CI-ABJ-2024-B-123456"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partie1Representant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Représentant légal (si personne morale)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du représentant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partie1Telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+225 01 23 45 67 89" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partie1Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="partie1Adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adresse complète"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="objetContrat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet du contrat</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Décrivez clairement l'objet du contrat…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="obligationsPartie1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obligations de la Partie 1</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="obligationsPartie2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obligations de la Partie 2</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="montant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant ou tarif</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1 000 000 FCFA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="penalitesRetard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pénalités de retard (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2% par jour de retard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="modalitesPaiement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalités de paiement</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateDebut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dureeContrat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée du contrat</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 12 mois, indéterminée" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="conditionsResiliation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions de résiliation anticipée</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="confidentialite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Les informations échangées sont-elles confidentielles ?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="oui" id="conf-oui" />
                        <Label htmlFor="conf-oui">Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non" id="conf-non" />
                        <Label htmlFor="conf-non">Non</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("confidentialite") === "oui" && (
              <FormField
                control={form.control}
                name="clausesConfidentialite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clauses de confidentialité</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Décrivez les clauses…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="proprieteIntellectuelle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Transfert de droits de propriété intellectuelle ?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="oui" id="pi-oui" />
                        <Label htmlFor="pi-oui">Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non" id="pi-non" />
                        <Label htmlFor="pi-non">Non</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("proprieteIntellectuelle") === "oui" && (
              <FormField
                control={form.control}
                name="modalitesPI"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalités de transfert</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Précisez les modalités…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
      case 7:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="garanties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garanties offertes</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="responsabilite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Limitation de responsabilité (optionnel)
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="droitApplicable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Droit applicable</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le droit applicable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Droit ivoirien">
                        Droit ivoirien
                      </SelectItem>
                      <SelectItem value="Droit OHADA">Droit OHADA</SelectItem>
                      <SelectItem value="Droit français">
                        Droit français
                      </SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reglementLitiges"
              render={() => (
                <FormItem>
                  <FormLabel>Modes de règlement des litiges</FormLabel>
                  <div className="space-y-2">
                    {[
                      { id: "negociation", label: "Négociation amiable" },
                      { id: "mediation", label: "Médiation/Arbitrage" },
                      { id: "juridiction", label: "Juridictions compétentes" },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="reglementLitiges"
                        render={({ field }) => {
                          const checked = (field.value || []).includes(item.id);
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(ok) => {
                                    if (ok)
                                      field.onChange([
                                        ...(field.value ?? []),
                                        item.id,
                                      ]);
                                    else
                                      field.onChange(
                                        (field.value ?? []).filter(
                                          (v: string) => v !== item.id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="mt-2">
              <CardHeader>
                <CardTitle className="flex items-center text-red-900">
                  <Upload className="h-5 w-5 mr-2" />
                  Documents à joindre (optionnel)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">
                      Cliquez pour ajouter des documents
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PDF, DOC, DOCX, JPG, PNG (max 10MB/fichier)
                    </p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Documents joints :</h4>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Alert>
            <AlertTitle className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Vous n’êtes pas connecté
            </AlertTitle>
            <AlertDescription>
              Vous pouvez soumettre sans compte. Pour suivre plus facilement
              votre demande,{" "}
              <Link to="/login" className="underline font-medium">
                connectez-vous
              </Link>{" "}
              (ou créez un compte).
            </AlertDescription>
          </Alert>
        </div>
      )}

      {selectedOffer && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-900">
                <BadgePercent className="h-5 w-5 mr-2" />
                Offre sélectionnée
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500">Type de contrat</div>
                <div className="text-base font-medium">
                  {selectedOffer.title}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Tarif</div>
                <div className="text-base font-semibold">{priceDisplay}</div>
              </div>
              <Button asChild variant="outline">
                <Link to="/redaction-contrat">Changer d’offre</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-white shadow-sm py-4 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Formulaire de rédaction de contrat
            </h1>
            <div className="text-sm text-gray-600">
              Étape {currentStep} sur {steps.length}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-red-900 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center ${
                      isActive ? "text-red-900 font-medium" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-900">
                  {React.createElement(steps[currentStep - 1].icon, {
                    className: "h-6 w-6 mr-2",
                  })}
                  {steps[currentStep - 1].title}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderStep()}</CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-red-900 hover:bg-red-800 flex items-center"
                  disabled={isSubmitting}
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-red-900 hover:bg-red-800 flex items-center"
                  disabled={isSubmitting || loadingCards}
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <FileText className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Envoi en cours…" : "Soumettre la demande"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>

      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          if (!open) {
            form.reset();
            setUploadedFiles([]);
            setSuccessOpen(false);
            if (closeRedirect === "orders") {
              const url = successRef
                ? `/client/commandes?ref=${encodeURIComponent(successRef)}`
                : "/client/commandes";
              setCloseRedirect(null);
              navigate(url);
            } else {
              setCloseRedirect(null);
              navigate("/");
            }
          } else {
            setSuccessOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-ld">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 text-2xl" />
              Demande envoyée avec succès
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-700">
              Merci ! Votre demande a bien été enregistrée. Conservez votre
              numéro de suivi.
            </p>
            <div className="rounded-lg border bg-gray-50 p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Numéro de demande</p>
                <p className="font-mono text-lg">{successRef || "—"}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (successRef) {
                    navigator.clipboard
                      .writeText(successRef)
                      .then(() =>
                        toast.success("Copié !", {
                          description: "Numéro de demande copié.",
                        })
                      )
                      .catch(() => toast.success("Copié !"));
                  }
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Vous pouvez suivre l’avancement et échanger avec votre juriste
              depuis votre espace.
            </div>
          </div>

          {!isAuthenticated && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-2">
              <p className="text-sm text-yellow-900 font-semibold">
                Pas encore de compte ?
              </p>
              <p className="text-sm text-yellow-800">
                Un compte a été créé avec votre e-mail
                {userEmailForReset ? (
                  <>
                    {" "}
                    <strong> {userEmailForReset}</strong>
                  </>
                ) : (
                  " "
                )}
                . Pour accéder à votre espace, allez sur la page de connexion
                puis utilisez <strong>« Mot de passe oublié »</strong>.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link
                    to={`/forgot-password${
                      userEmailForReset
                        ? `?email=${encodeURIComponent(userEmailForReset)}`
                        : ""
                    }`}
                  >
                    Mot de passe oublié
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                form.reset();
                setUploadedFiles([]);
                setCloseRedirect("home");
                setSuccessOpen(false);
              }}
            >
              Fermer
            </Button>
            <Button
              className="bg-red-900 hover:bg-red-800"
              onClick={() => {
                setCloseRedirect("orders");
                setSuccessOpen(false);
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Suivre ma demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RedactionContratForm;
