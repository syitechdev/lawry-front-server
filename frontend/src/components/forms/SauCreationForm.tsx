// src/pages/forms/SauCreationForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Header from "@/components/Header";
import { http } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Building,
  User,
  UserCheck,
  FileText,
  Mail,
} from "lucide-react";

type PricingMode = "fixed" | "from" | "quote";
const formTypeSigle = "SAU";

// -------- Offre côté backend
type BackendOffer = {
  key: string;
  title: string;
  pricing_mode: PricingMode;
  currency: string;
  price_display_abidjan: string;
  price_display_interior: string;
  price_amount_abidjan?: number | null;
  price_amount_interior?: number | null;
};

// -------- Offre sélectionnée (front)
type SelectedOffer = {
  key: string;
  title: string;
  pricing_mode: PricingMode;
  price: number | null;
  currency: string;
} | null;

// -------- Schéma de validation
const sauSchema = z
  .object({
    // Informations générales
    denominationSociale: z
      .string()
      .min(2, "La dénomination sociale est requise"),
    siegeSocial: z.string().min(10, "L'adresse du siège social est requise"),
    telephone: z.string().min(8, "Le numéro de téléphone est requis"),
    email: z.string().email("Email invalide"),
    dureeSociete: z.string().min(1, "La durée de la société est requise"),
    capitalSocial: z.string().min(1, "Le capital social est requis"),
    activitePrincipale: z.string().min(10, "L'activité principale est requise"),
    // Zone tarifaire (★ nouveau)
    zone: z.enum(["abidjan", "interior"], {
      required_error: "Choisissez la zone (Abidjan / Intérieur)",
    }),

    // Actionnaire unique
    actionnaireNom: z.string().min(2, "Le nom est requis"),
    actionnaireNationalite: z.string().min(2, "La nationalité est requise"),
    actionnaireAdresse: z.string().min(10, "L'adresse est requise"),
    nombreActions: z.string().min(1, "Le nombre d'actions est requis"),

    // Gouvernance
    modeGouvernance: z.enum(["conseil_administration", "directoire"], {
      required_error: "Le mode de gouvernance est requis",
    }),
    presidentNom: z.string().min(2, "Le nom du président est requis"),
    presidentAdresse: z.string().min(10, "L'adresse du président est requise"),
    presidentTelephone: z
      .string()
      .min(8, "Le téléphone du président est requis"),
    presidentEmail: z.string().email("Email invalide"),

    // Compte utilisateur
    motDePasse: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmerMotDePasse: z.string().min(6, "Confirmez le mot de passe"),
  })
  .refine((data) => data.motDePasse === data.confirmerMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmerMotDePasse"],
  });

type SauFormData = z.infer<typeof sauSchema>;

const SauCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>(
    {}
  );
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  // -------- Offre (state | query)
  const stateOffer = (location.state as any)?.offer as
    | SelectedOffer
    | undefined;
  const queryVariant =
    search.get("variant") || search.get("offer") || undefined;

  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer>(
    stateOffer ?? null
  );
  const [resolved, setResolved] = useState<BackendOffer | null>(null);

  useEffect(() => {
    const wantedKey = stateOffer?.key || queryVariant;
    if (!wantedKey) return;
    (async () => {
      try {
        const { data } = await http.get(
          `/enterprise-types/${encodeURIComponent(formTypeSigle)}/offers`
        );
        const arr: BackendOffer[] = data?.offers || data?.items || [];
        const found = arr.find((o) => o.key === wantedKey);
        if (found) {
          setResolved(found);
          setSelectedOffer({
            key: found.key,
            title: found.title,
            pricing_mode: found.pricing_mode,
            price:
              found.pricing_mode === "quote"
                ? null
                : found.price_amount_abidjan ??
                  found.price_amount_interior ??
                  null,
            currency: found.currency || "XOF",
          });
        }
      } catch {
        /* silencieux */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Form
  const form = useForm<SauFormData>({
    resolver: zodResolver(sauSchema),
    defaultValues: {
      denominationSociale: "",
      siegeSocial: "",
      telephone: "",
      email: "",
      dureeSociete: "",
      capitalSocial: "",
      activitePrincipale: "",
      zone: undefined as any, // sélectionnée via Select

      actionnaireNom: "",
      actionnaireNationalite: "",
      actionnaireAdresse: "",
      nombreActions: "",

      modeGouvernance: undefined as any,
      presidentNom: "",
      presidentAdresse: "",
      presidentTelephone: "",
      presidentEmail: "",

      motDePasse: "",
      confirmerMotDePasse: "",
    },
    mode: "onTouched",
  });

  const zoneValue = form.watch("zone");
  const isQuote = selectedOffer?.pricing_mode === "quote";

  // -------- Prix dépendant de la zone
  const selectedAmount = useMemo<number | null>(() => {
    if (!resolved || isQuote) return null;
    if (zoneValue === "abidjan") return resolved.price_amount_abidjan ?? null;
    if (zoneValue === "interior") return resolved.price_amount_interior ?? null;
    return null;
  }, [resolved, isQuote, zoneValue]);

  const selectedDisplay = useMemo<string>(() => {
    if (!resolved || isQuote) return "Sur devis";
    if (zoneValue === "abidjan") return resolved.price_display_abidjan || "—";
    if (zoneValue === "interior") return resolved.price_display_interior || "—";
    return "—";
  }, [resolved, isQuote, zoneValue]);

  // -------- Fichiers
  const docList = [
    { id: "statuts", label: "Projet de statuts", required: true },
    {
      id: "souscriptions",
      label: "Déclaration des souscriptions et libérations",
      required: true,
    },
    {
      id: "domiciliation",
      label: "Justificatif de domiciliation",
      required: true,
    },
    {
      id: "depot_fonds",
      label: "Attestation de dépôt des fonds",
      required: true,
    },
  ];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadedFiles((p) => ({ ...p, [key]: Array.from(files) }));
  };

  // -------- Validation progressive
  const fieldsForStep = (s: number): (keyof SauFormData)[] => {
    switch (s) {
      case 1:
        return [
          "denominationSociale",
          "siegeSocial",
          "telephone",
          "email",
          "dureeSociete",
          "capitalSocial",
          "activitePrincipale",
          "zone",
        ];
      case 2:
        return [
          "actionnaireNom",
          "actionnaireNationalite",
          "actionnaireAdresse",
          "nombreActions",
        ];
      case 3:
        return [
          "modeGouvernance",
          "presidentNom",
          "presidentAdresse",
          "presidentTelephone",
          "presidentEmail",
        ];
      case 4:
        return []; // documents non bloquants
      case 5:
        return ["motDePasse", "confirmerMotDePasse"];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const ok = await form.trigger(fieldsForStep(currentStep), {
      shouldFocus: true,
    });
    if (ok) setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // -------- Submit + paiement
  const onSubmit = async (values: SauFormData) => {
    try {
      const fd = new FormData();

      // Type & variante
      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      if (selectedOffer?.key) {
        fd.append("variant_key", `${formTypeSigle}:${selectedOffer.key}`);
      }

      // Données générales
      fd.append("data[companyName]", values.denominationSociale);
      fd.append("data[headquarters]", values.siegeSocial);
      fd.append("data[creationLocation]", values.zone); // 'abidjan' | 'interior'
      fd.append("data[phone]", values.telephone);
      fd.append("data[email]", values.email);
      fd.append("data[duration]", values.dureeSociete);
      fd.append("data[capital]", values.capitalSocial);
      fd.append("data[activity]", values.activitePrincipale);

      // Actionnaire
      fd.append("data[shareholder][name]", values.actionnaireNom);
      fd.append(
        "data[shareholder][nationality]",
        values.actionnaireNationalite
      );
      fd.append("data[shareholder][address]", values.actionnaireAdresse);
      fd.append("data[shareholder][shares]", values.nombreActions);

      // Gouvernance
      fd.append("data[governance][mode]", values.modeGouvernance);
      fd.append("data[governance][presidentName]", values.presidentNom);
      fd.append("data[governance][presidentAddress]", values.presidentAdresse);
      fd.append("data[governance][presidentPhone]", values.presidentTelephone);
      fd.append("data[governance][presidentEmail]", values.presidentEmail);

      // Trace de l’offre + zone + prix (strictement depuis l’offre)
      if (selectedOffer) {
        fd.append("data[selected_preset][label]", selectedOffer.title);
        fd.append(
          "data[selected_preset][pricing_mode]",
          selectedOffer.pricing_mode
        );
        fd.append(
          "data[selected_preset][currency]",
          selectedOffer.currency || "XOF"
        );

        if (!isQuote) {
          const zone = values.zone === "abidjan" ? "abidjan" : "interior";
          fd.append("data[selected_preset][zone]", zone);

          if (resolved) {
            fd.append(
              "data[selected_preset][abidjan_display]",
              resolved.price_display_abidjan || ""
            );
            fd.append(
              "data[selected_preset][interior_display]",
              resolved.price_display_interior || ""
            );
          }
          if (selectedAmount != null) {
            fd.append(
              "data[selected_preset][selected_price]",
              String(selectedAmount)
            );
          }
          if (selectedDisplay) {
            fd.append(
              "data[selected_preset][selected_display]",
              selectedDisplay
            );
          }
        } else {
          fd.append("data[selected_preset][selected_price]", "");
          fd.append("data[selected_preset][selected_display]", "Sur devis");
        }
      }

      // Normalisation prix → le paiement se basera sur CE montant (pas un champ saisi)
      const currency = selectedOffer?.currency || "XOF";
      fd.append("currency", currency);
      if (!isQuote && selectedAmount && selectedAmount > 0) {
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(selectedAmount));
        fd.append("data[price][currency]", currency);

        // duplications pour compat backend
        fd.append("data[amount]", String(selectedAmount));
        fd.append("data[price_amount]", String(selectedAmount));
        fd.append("data[total_amount]", String(selectedAmount));
        fd.append("data[montant]", String(selectedAmount));
        fd.append("data[payment][amount]", String(selectedAmount));
        fd.append("data[payment][currency]", currency);
        fd.append("data[paiement][amount]", String(selectedAmount));
        fd.append("data[paiement][currency]", currency);
      }

      // Fichiers
      Object.values(uploadedFiles).forEach((arr) =>
        (arr || []).forEach((f) => fd.append("files[attachments][]", f))
      );

      // Création de la demande
      const { data: res } = await http.post("/demandes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdId: number | null = res?.demande?.id ?? res?.id ?? null;
      const ref: string | null = res?.demande?.ref ?? res?.ref ?? null;

      // Paiement direct si montant > 0
      const shouldPayNow =
        !isQuote &&
        !!selectedAmount &&
        Number(selectedAmount) > 0 &&
        !!createdId;

      if (shouldPayNow) {
        try {
          const pay = await initPayment({
            type: "demande",
            id: createdId!,
            customer: {
              email: values.email,
              firstName:
                (values.presidentNom || "Client").split(" ")[0] || "Client",
              lastName:
                (values.presidentNom || "").split(" ").slice(1).join(" ") ||
                "SAU",
              phone: values.telephone,
            },
          });

          const redirectUrl =
            pay?.redirect_url ||
            pay?.redirectUrl ||
            pay?.url ||
            pay?.checkoutUrl ||
            pay?.payment_url;

          if (redirectUrl && typeof redirectUrl === "string") {
            window.location.assign(redirectUrl);
            return;
          }

          const action = pay?.action;
          const fields = pay?.fields || {};
          const method = (pay?.method as "POST" | "GET") || "POST";
          if (action && typeof action === "string") {
            autoPost(action, fields, method);
            return;
          }
        } catch {
          // si init paiement échoue, on affiche quand même la réussite basique
        }
      }

      // Succès (sans redirection paiement)
      toast({
        title: "Demande envoyée",
        description: ref
          ? `Référence: ${ref}`
          : "Votre demande a été enregistrée.",
      });
      const url = ref
        ? `/client/commandes?ref=${encodeURIComponent(ref)}`
        : "/client/commandes";
      navigate(url);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Envoi impossible. Réessayez plus tard.";
      if (status === 422 && /type/i.test(String(msg))) {
        return toast({
          variant: "destructive",
          title: "Type de demande invalide",
          description:
            "Vérifiez le slug « creer-entreprise » et la configuration côté serveur.",
        });
      }
      toast({ variant: "destructive", title: "Erreur", description: msg });
    }
  };

  const stepTitles = [
    "Informations générales",
    "Actionnaire unique",
    "Gouvernance",
    "Documents",
    "Création du compte",
  ];
  const stepIcons = [Building, User, UserCheck, FileText, Mail];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      <div className="max-w-4xl mx-auto p-6">
        {/* Bloc Offre sélectionnée */}
        {selectedOffer && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-red-900">
                Offre sélectionnée
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500">Formule</div>
                <div className="text-base font-medium">
                  {selectedOffer.title}
                </div>
              </div>
              <div className="text-left md:text-center">
                <div className="text-sm text-gray-500">Zone</div>
                <div className="text-base font-medium">
                  {zoneValue === "abidjan"
                    ? "Abidjan"
                    : zoneValue === "interior"
                    ? "Intérieur"
                    : "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Tarif</div>
                <div className="text-base font-semibold">{selectedDisplay}</div>
              </div>
              <Button asChild variant="outline">
                <Link to="/creer-entreprise/sau">Changer d’offre</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* En-tête & Progress */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-red-900">
                Création d'une SAU - Société Anonyme Unipersonnelle
              </CardTitle>
              <div className="text-sm text-gray-500">
                Étape {currentStep} sur {totalSteps}
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Steps nav visuelle */}
        <div className="flex justify-between mb-8">
          {stepTitles.map((title, index) => {
            const StepIcon = stepIcons[index];
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;

            return (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${
                  isActive
                    ? "text-red-900"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive
                      ? "bg-red-100 border-2 border-red-900"
                      : isCompleted
                      ? "bg-green-100 border-2 border-green-600"
                      : "bg-gray-100 border-2 border-gray-300"
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className="text-xs text-center font-medium">{title}</span>
              </div>
            );
          })}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.target as HTMLElement)?.tagName !== "TEXTAREA"
              ) {
                e.preventDefault();
                if (currentStep < totalSteps) nextStep();
              }
            }}
            className="space-y-6"
          >
            {/* Étape 1: Informations générales */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="denominationSociale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dénomination Sociale *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom de votre société"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Zone tarifaire (sélecteur Abidjan / Intérieur) */}
                    <FormField
                      control={form.control}
                      name="zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone / Lieu de création *</FormLabel>
                          {isQuote ? (
                            <FormControl>
                              <Input
                                placeholder="Ville (ex: Abidjan, …)"
                                {...(field as any)}
                              />
                            </FormControl>
                          ) : (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez la zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="abidjan">Abidjan</SelectItem>
                                <SelectItem value="interior">
                                  Intérieur
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {!isQuote && (
                            <p className="text-xs text-gray-500 mt-1">
                              Le tarif appliqué dépend de la zone choisie.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="siegeSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Siège Social *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Adresse complète du siège social"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+225 XX XX XX XX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contact@entreprise.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dureeSociete"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée de la société (années) *</FormLabel>
                          <FormControl>
                            <Input placeholder="99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capitalSocial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capital Social (FCFA) *</FormLabel>
                          <FormControl>
                            <Input placeholder="10 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="activitePrincipale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Activité principale / Objet social *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez l'activité principale de votre société"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Étape 2: Actionnaire unique */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Actionnaire unique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="actionnaireNom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom et Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom complet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="actionnaireNationalite"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationalité *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ivoirienne" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="actionnaireAdresse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Adresse complète"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nombreActions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre d'actions *</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Étape 3: Gouvernance */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5" />
                    Conseil d'Administration ou Directoire
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="modeGouvernance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode de gouvernance *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez le mode de gouvernance" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conseil_administration">
                              Conseil d'Administration
                            </SelectItem>
                            <SelectItem value="directoire">
                              Directoire et Conseil de Surveillance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">
                      {form.watch("modeGouvernance") === "directoire"
                        ? "Directeur Général"
                        : "Président du Conseil"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="presidentNom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom et Prénom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom complet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="presidentTelephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+225 XX XX XX XX"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="presidentAdresse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Adresse complète"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="presidentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="president@entreprise.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Étape 4: Documents */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Documents à joindre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {docList.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">
                          {doc.label}{" "}
                          {doc.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        {uploadedFiles[doc.id]?.length ? (
                          <span className="text-green-600 text-sm">
                            ✓ {uploadedFiles[doc.id].length} fichier(s)
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, doc.id)}
                          className="hidden"
                          id={`file-${doc.id}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById(`file-${doc.id}`)?.click()
                          }
                          className="flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choisir un fichier
                        </Button>
                        {uploadedFiles[doc.id]?.[0] && (
                          <span className="text-sm text-gray-600 truncate max-w-xs">
                            {uploadedFiles[doc.id][0].name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Étape 5: Création du compte */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Création de votre compte LAWRY
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Créez votre compte pour suivre l'avancement de votre dossier
                    et accéder à vos documents.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="motDePasse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe *</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Minimum 6 caractères"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmerMotDePasse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe *</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirmez votre mot de passe"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg mt-6">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Récapitulatif
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Création d'une SAU</span>
                        <span className="font-semibold">{selectedDisplay}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-green-800">
                        <span>Total</span>
                        <span>{selectedDisplay}</span>
                      </div>
                      {!zoneValue && !isQuote && (
                        <p className="text-xs text-red-600 mt-2">
                          Sélectionnez une zone à l’étape 1 pour voir le tarif
                          exact.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center bg-red-900 hover:bg-red-800"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Créer ma SAU
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SauCreationForm;
