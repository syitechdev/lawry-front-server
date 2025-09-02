// src/pages/forms/SarlCreationForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import * as z from "zod";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Users,
  FileText,
  Upload,
  UserPlus,
  Plus,
  X,
  File,
  Check,
  BadgePercent,
  Lock,
} from "lucide-react";

import { http } from "@/lib/http";
import { useFormAccessGuard } from "@/modules/demandes/useFormAccessGuard";
import { useFormAutofill } from "@/modules/demandes/useFormAutofill";
import DemandeSuccessModal from "@/modules/demandes/DemandeSuccessModal";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

type PricingMode = "fixed" | "from" | "quote";

const associateSchema = z.object({
  name: z.string().min(1, "Nom et prénom requis"),
  nationality: z.string().min(1, "Nationalité requise"),
  address: z.string().min(1, "Adresse requise"),
  contribution: z.string().min(1, "Montant de l'apport requis"),
});

const formSchema = z.object({
  requestDate: z.string().min(1, "Date requise"),
  creationLocation: z.string().min(1, "Lieu de création requis"),
  companyName: z.string().min(1, "Dénomination sociale requise"),
  headquarters: z.string().min(1, "Siège social requis"),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  duration: z.string().min(1, "Durée requise"),
  capital: z.string().min(1, "Capital social requis"),
  activity: z.string().min(1, "Activité principale requise"),
  associates: z.array(associateSchema).min(1, "Au moins un associé requis"),
  managerName: z.string().min(1, "Nom et prénom du gérant requis"),
  managerAddress: z.string().min(1, "Adresse du gérant requise"),
  managerPhone: z.string().min(1, "Téléphone du gérant requis"),
  managerEmail: z.string().email("Email du gérant invalide"),
  decisionMode: z.enum(["assembly", "unanimous"]),
  managementOrgan: z.enum(["single", "college"]),

  // on laisse ces champs optionnels pour compat si tu les réutilises ailleurs
  userFirstName: z.string().min(1).optional(),
  userLastName: z.string().min(1).optional(),
  userEmail: z.string().email("Email invalide").optional(),
  userPassword: z.string().min(6).optional(),
});

type FormData = z.infer<typeof formSchema>;
type SelectedOffer = {
  key: string;
  title: string;
  pricing_mode: PricingMode;
  price: number | null;
  currency: string;
} | null;

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

const SarlCreationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const { toast } = useToast();

  const formTypeSigle = "SARL";

  const { blocked, reason, auth } = useFormAccessGuard();
  const { apply } = useFormAutofill();

  // ---- SUCCESS MODAL state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successRefCode, setSuccessRefCode] = useState<string | null>(null);

  const stateOffer = (location.state as any)?.offer as
    | SelectedOffer
    | undefined;
  const queryVariant =
    search.get("variant") || search.get("offer") || undefined;

  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer>(
    stateOffer ?? null
  );
  const [resolved, setResolved] = useState<BackendOffer | null>(null);

  // Récupère l’offre côté backend
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
        // silencieux
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestDate: new Date().toISOString().split("T")[0],
      decisionMode: "assembly",
      managementOrgan: "single",
      associates: [
        { name: "", nationality: "", address: "", contribution: "" },
      ],
    },
    mode: "onTouched",
  });

  // Pré-remplissage user si connecté
  useEffect(() => {
    apply(form.setValue, {
      phone: "phone",
      email: "email",
      address: "headquarters",
    });
    try {
      const me = JSON.parse(localStorage.getItem("current_user") || "{}");
      if (me?.email)
        form.setValue("managerEmail", me.email, { shouldDirty: false });
      if (me?.phone)
        form.setValue("managerPhone", me.phone, { shouldDirty: false });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Fichiers
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>(
    {}
  );
  const handleFileUpload = (documentType: string, files: FileList | null) => {
    if (!files?.length) return;
    const arr = Array.from(files);
    setUploadedFiles((prev) => ({
      ...prev,
      [documentType]: [...(prev[documentType] || []), ...arr],
    }));
    toast({
      title: "Fichier(s) ajouté(s)",
      description: `${arr.length} fichier(s) pour ${documentType}`,
    });
  };
  const removeFile = (documentType: string, fileIndex: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [documentType]:
        prev[documentType]?.filter((_, i) => i !== fileIndex) || [],
    }));
  };

  // ----- Steps
  const totalSteps = auth ? 5 : 6; // on garde 6 pas connecté (dernière étape informative, sans champ)
  const [currentStep, setCurrentStep] = useState(1);
  const progress = (currentStep / totalSteps) * 100;

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["requestDate", "creationLocation"];
      case 2:
        return [
          "companyName",
          "headquarters",
          "phone",
          "email",
          "duration",
          "capital",
          "activity",
        ];
      case 3:
        return ["associates"];
      case 4:
        return [
          "managerName",
          "managerAddress",
          "managerPhone",
          "managerEmail",
        ];
      case 5:
        return [];
      case 6:
        return []; // <- plus de champ à valider ici
      default:
        return [];
    }
  };
  const getStepTitle = (step: number) => {
    const base = [
      "Informations de base",
      "Informations sur la société",
      "Associés",
      "Gérance",
      "Documents à joindre",
    ];
    return auth
      ? base[step - 1]
      : [...base, "Votre email pour le suivi"][step - 1];
  };
  const nextStep = async () => {
    const ok = await form.trigger(getFieldsForStep(currentStep), {
      shouldFocus: true,
    });
    if (ok) setCurrentStep((s) => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // ----- Zone/prix
  const isQuote = selectedOffer?.pricing_mode === "quote";
  const zoneValue = form.watch("creationLocation");

  const selectedAmount = useMemo<number | null>(() => {
    if (!resolved || isQuote) return null;
    if (zoneValue?.toLowerCase() === "abidjan") {
      return resolved.price_amount_abidjan ?? null;
    }
    if (
      zoneValue?.toLowerCase() === "intérieur" ||
      zoneValue?.toLowerCase() === "interieur" ||
      zoneValue === "interior"
    ) {
      return resolved.price_amount_interior ?? null;
    }
    return null;
  }, [resolved, isQuote, zoneValue]);

  const selectedDisplay = useMemo<string>(() => {
    if (!resolved || isQuote) return "Sur devis";
    if (zoneValue?.toLowerCase() === "abidjan") {
      return resolved.price_display_abidjan || "—";
    }
    if (
      zoneValue?.toLowerCase() === "intérieur" ||
      zoneValue?.toLowerCase() === "interieur" ||
      zoneValue === "interior"
    ) {
      return resolved.price_display_interior || "—";
    }
    return "—";
  }, [resolved, isQuote, zoneValue]);

  // ----- Submit + paiement
  const onSubmit = async (values: FormData) => {
    try {
      const fd = new FormData();

      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      if (selectedOffer?.key)
        fd.append("variant_key", `${formTypeSigle}:${selectedOffer.key}`);

      // Données de base
      fd.append("data[requestDate]", values.requestDate);
      fd.append("data[creationLocation]", values.creationLocation);

      fd.append("data[companyName]", values.companyName);
      fd.append("data[headquarters]", values.headquarters);
      fd.append("data[phone]", values.phone);

      // on utilise l'email saisi à l'étape 2
      const finalEmail = values.email;
      fd.append("data[email]", finalEmail);

      fd.append("data[duration]", values.duration);
      fd.append("data[capital]", values.capital);
      fd.append("data[activity]", values.activity);

      (values.associates || []).forEach((a, i) => {
        fd.append(`data[associates][${i}][name]`, a.name);
        fd.append(`data[associates][${i}][nationality]`, a.nationality);
        fd.append(`data[associates][${i}][address]`, a.address);
        fd.append(`data[associates][${i}][contribution]`, a.contribution);
      });

      fd.append("data[managerName]", values.managerName);
      fd.append("data[managerAddress]", values.managerAddress);
      fd.append("data[managerPhone]", values.managerPhone);
      fd.append("data[managerEmail]", values.managerEmail);

      fd.append("data[decisionMode]", values.decisionMode);
      fd.append("data[managementOrgan]", values.managementOrgan);

      // Sélection tarifaire (pour BO + paiement)
      if (selectedOffer) {
        fd.append("data[selected_preset][label]", selectedOffer.title);
        fd.append(
          "data[selected_preset][pricing_mode]",
          selectedOffer.pricing_mode
        );
        fd.append("data[selected_preset][currency]", selectedOffer.currency);

        if (!isQuote) {
          const zone =
            zoneValue?.toLowerCase() === "abidjan" ? "abidjan" : "interior";
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

      // >>> Normalisation PRIX pour payableAmountXof
      const currency = selectedOffer?.currency || "XOF";
      fd.append("currency", currency); // top-level
      if (!isQuote && selectedAmount && selectedAmount > 0) {
        // structure standard
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(selectedAmount));
        fd.append("data[price][currency]", currency);

        // duplications pour robustesse
        fd.append("data[amount]", String(selectedAmount));
        fd.append("data[price_amount]", String(selectedAmount));
        fd.append("data[total_amount]", String(selectedAmount));
        fd.append("data[montant]", String(selectedAmount));
        fd.append("data[payment][amount]", String(selectedAmount));
        fd.append("data[payment][currency]", currency);
        fd.append("data[paiement][amount]", String(selectedAmount));
        fd.append("data[paiement][currency]", currency);
      }

      // Fichiers (sans “Liste des associés”)
      Object.values(uploadedFiles).forEach((arr) =>
        (arr || []).forEach((f) => fd.append("files[attachments][]", f))
      );

      // Création de la demande
      const { data: res } = await http.post("/demandes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdId: number | null = res?.demande?.id ?? res?.id ?? null;
      const ref: string | null = res?.demande?.ref ?? res?.ref ?? null;

      // MAJ user local
      const updated = res?.updated_user;
      if (updated) {
        try {
          const prev = localStorage.getItem("current_user");
          const prevObj = prev ? JSON.parse(prev) : {};
          localStorage.setItem(
            "current_user",
            JSON.stringify({ ...prevObj, ...updated })
          );
        } catch {}
      }

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
              email: finalEmail,
              firstName: values.managerName?.split(" ")[0] || "Client",
              lastName:
                values.managerName?.split(" ").slice(1).join(" ") || "SARL",
              phone: values.managerPhone,
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
        } catch (err: any) {
          // si init paiement échoue, on montre quand même le modal standard
        }
      }

      // Afficher le modal de succès (paiement ultérieur possible)
      setSuccessRefCode(ref);
      setSuccessOpen(true);
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
            "Utilisez le slug existant (ex: « creer-entreprise ») ou créez d’abord le type dans l’admin.",
        });
      }
      if (e?.code === "ADMIN_BLOCKED") {
        return toast({
          variant: "destructive",
          title: "Action non autorisée",
          description:
            "Un compte administrateur ne peut pas déposer une demande.",
        });
      }
      toast({ variant: "destructive", title: "Erreur", description: msg });
    }
  };

  // Champs associés
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "associates",
  });
  const addAssociate = () =>
    append({ name: "", nationality: "", address: "", contribution: "" });
  const removeAssociate = (index: number) => {
    if (fields.length > 1) remove(index);
  };

  // Prix (bandeau)
  const priceBlock = useMemo(() => {
    if (!resolved) return null;
    return (
      <div className="flex flex-col md:flex-row md:items-center md:gap-8">
        <div className="text-sm text-gray-500">Tarifs</div>
        <div className="flex flex-col md:flex-row md:gap-6">
          <div className="text-base">
            <span className="text-gray-600 mr-2">Abidjan:</span>
            <span className="font-semibold">
              {resolved.price_display_abidjan || "—"}
            </span>
          </div>
          <div className="text-base">
            <span className="text-gray-600 mr-2">Intérieur:</span>
            <span className="font-semibold">
              {resolved.price_display_interior || "—"}
            </span>
          </div>
          {selectedOffer?.pricing_mode !== "quote" && (
            <div className="text-base">
              <span className="text-gray-600 mr-2">Sélection:</span>
              <span className="font-semibold">{selectedDisplay}</span>
            </div>
          )}
        </div>
      </div>
    );
  }, [resolved, selectedOffer?.pricing_mode, selectedDisplay]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {blocked && (
        <div className="mb-6">
          <Alert>
            <AlertTitle className="flex items-center">
              <Lock className="h-4 w-4 mr-2" /> Accès restreint
            </AlertTitle>
            <AlertDescription>{reason}</AlertDescription>
          </Alert>
        </div>
      )}

      {selectedOffer && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-red-900">
              <BadgePercent className="h-5 w-5 mr-2" />
              Offre sélectionnée
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">Formule</div>
              <div className="text-base font-medium">{selectedOffer.title}</div>
            </div>
            {priceBlock}
            <Button asChild variant="outline">
              <Link to="/creer-entreprise/sarl">Changer d’offre</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Création d'une SARL
          </h1>
          <span className="text-sm text-gray-500">
            Étape {currentStep} sur {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <FileText className="h-5 w-5" />}
            {currentStep === 2 && <Building className="h-5 w-5" />}
            {currentStep === 3 && <Users className="h-5 w-5" />}
            {currentStep === 4 && <UserPlus className="h-5 w-5" />}
            {currentStep === 5 && <Upload className="h-5 w-5" />}
            {!auth && currentStep === 6 && <UserPlus className="h-5 w-5" />}
            {getStepTitle(currentStep)}
          </CardTitle>
          <CardDescription>
            Complétez les informations demandées pour cette étape
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            {/* Empêche ENTER de soumettre avant la dernière étape */}
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
              <fieldset disabled={blocked}>
                {/* Étape 1 */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="requestDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de la demande</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="creationLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu de création</FormLabel>
                          {selectedOffer?.pricing_mode === "quote" ? (
                            <FormControl>
                              <Input
                                placeholder="Ville où sera créée la société"
                                {...field}
                              />
                            </FormControl>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Button
                                type="button"
                                variant={
                                  field.value?.toLowerCase() === "abidjan"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => field.onChange("abidjan")}
                              >
                                Abidjan
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  field.value?.toLowerCase() === "intérieur" ||
                                  field.value?.toLowerCase() === "interieur" ||
                                  field.value === "interior"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => field.onChange("interior")}
                              >
                                Intérieur
                              </Button>
                            </div>
                          )}
                          {!isQuote && !selectedAmount && (
                            <p className="text-xs text-gray-500 mt-1">
                              Choisissez une zone pour déterminer le tarif
                              appliqué.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Étape 2 */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dénomination Sociale</FormLabel>
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
                    <FormField
                      control={form.control}
                      name="headquarters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Siège Social</FormLabel>
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
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
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
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="contact@societe.com"
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
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Durée de la société (en années)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="99"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="capital"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capital Social (FCFA)</FormLabel>
                            <FormControl>
                              <Input placeholder="1 000 000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="activity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Activité principale / Objet social
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
                  </div>
                )}

                {/* Étape 3 */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Associés de la société
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addAssociate}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Ajouter un associé
                      </Button>
                    </div>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="border rounded-lg p-4 relative"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold">
                            Associé {index + 1}
                          </h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAssociate(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`associates.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom et Prénom</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nom complet" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`associates.${index}.nationality`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nationalité</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ivoirienne"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`associates.${index}.contribution`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Montant de l'apport (FCFA)
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="500 000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name={`associates.${index}.address`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adresse</FormLabel>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Étape 4 */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="managerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom et Prénom du Gérant</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom complet du gérant"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="managerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse du Gérant</FormLabel>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="managerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone du Gérant</FormLabel>
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
                      <FormField
                        control={form.control}
                        name="managerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email du Gérant</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="gerant@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="decisionMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mode de décision</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="assembly"
                                    id="assembly"
                                  />
                                  <Label htmlFor="assembly">
                                    Assemblée des associés
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="unanimous"
                                    id="unanimous"
                                  />
                                  <Label htmlFor="unanimous">
                                    Décision unanime des associés
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="managementOrgan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organe de gestion</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="single" id="single" />
                                  <Label htmlFor="single">Gérant unique</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="college"
                                    id="college"
                                  />
                                  <Label htmlFor="college">
                                    Collège de gérance
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Étape 5 */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Documents à Joindre
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "statuts",
                          label: "Projet de statuts",
                          required: true,
                        },
                        {
                          key: "souscriptions",
                          label: "Déclaration des souscriptions et libérations",
                          required: true,
                        },
                        // SUPPRIMÉ: { key: "associes", label: "Liste des associés", required: true },
                        {
                          key: "domiciliation",
                          label: "Justificatif de domiciliation",
                          required: true,
                        },
                        {
                          key: "depot_fonds",
                          label: "Attestation de dépôt des fonds",
                          required: true,
                        },
                      ].map((docType) => (
                        <div
                          key={docType.key}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">
                                {docType.label}
                              </span>
                              {docType.required && (
                                <span className="text-red-500 text-sm">*</span>
                              )}
                            </div>
                            {uploadedFiles[docType.key]?.length > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-sm">
                                  {uploadedFiles[docType.key].length} fichier(s)
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                handleFileUpload(docType.key, e.target.files)
                              }
                              className="cursor-pointer"
                            />

                            {uploadedFiles[docType.key]?.length ? (
                              <div className="space-y-1 mt-2">
                                {uploadedFiles[docType.key].map(
                                  (file, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                                    >
                                      <span className="truncate">
                                        {file.name}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeFile(docType.key, index)
                                        }
                                        className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Formats acceptés :</strong> PDF, DOC, DOCX, JPG,
                        JPEG, PNG
                      </p>
                      <p className="text-sm text-blue-800 mt-1">
                        Vous pouvez joindre plusieurs fichiers pour chaque type
                        de document.
                      </p>
                    </div>
                  </div>
                )}

                {/* Étape 6 (non connecté) : message simple, SANS champ email */}
                {!auth && currentStep === 6 && (
                  <div className="space-y-4 text-center">
                    <h3 className="text-lg font-semibold">
                      Coordonnées de suivi
                    </h3>
                    <p className="text-gray-600">
                      Nous utiliserons l’email saisi à l’étape 2 pour créer ou
                      associer votre espace client automatiquement.
                    </p>
                  </div>
                )}
              </fieldset>

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || blocked}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} disabled={blocked}>
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-red-900 hover:bg-red-800"
                    disabled={blocked}
                  >
                    Créer ma SARL
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Modal succès */}
      <DemandeSuccessModal
        open={successOpen}
        refCode={successRefCode}
        userEmail={(form.getValues("email") as string) || null}
        isAuthenticated={!!auth}
        onOpenChange={(open) => {
          if (!open) {
            form.reset();
            setSuccessOpen(false);
            navigate("/", { replace: true });
          } else {
            setSuccessOpen(true);
          }
        }}
        onCloseToHome={() => {
          form.reset();
          setSuccessOpen(false);
          navigate("/", { replace: true });
        }}
        onCloseToOrders={() => {
          form.reset();
          setSuccessOpen(false);
          const url = successRefCode
            ? `/client/commandes?ref=${encodeURIComponent(successRefCode)}`
            : "/client/commandes";
          navigate(url, { replace: true });
        }}
      />
    </div>
  );
};

export default SarlCreationForm;
