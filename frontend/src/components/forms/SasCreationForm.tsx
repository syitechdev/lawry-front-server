import React, { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";
import { useFormAccessGuard } from "@/modules/demandes/useFormAccessGuard";
import { useFormAutofill } from "@/modules/demandes/useFormAutofill";
import DemandeSuccessModal from "@/modules/demandes/DemandeSuccessModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

import {
  ArrowLeft,
  ArrowRight,
  Building,
  Users,
  User,
  FileText,
  Upload,
  File,
  Check,
  X,
  BadgePercent,
  Lock,
  Settings,
} from "lucide-react";

// -----------------------------
// Types, helpers & pricing
// -----------------------------

type PricingMode = "fixed" | "from" | "quote";

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

async function initPaymentLocal({
  id,
  channel,
  customer,
  amount,
  currency,
}: {
  id: number | string;
  channel?: string;
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  amount: number;
  currency: string;
}) {
  const body: any = {
    ...(channel ? { channel } : {}),
    ...(customer?.email
      ? {
          customerEmail: customer.email,
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          customerPhoneNumber: customer.phone,
        }
      : {}),
    amount,
    currency,
  };
  const { data } = await http.post(
    `/pay/demande/${encodeURIComponent(id)}`,
    body,
    { headers: { Accept: "application/json" } }
  );
  return data;
}

function autoPostInline(
  action: string,
  fields: Record<string, any> = {},
  method: "POST" | "GET" = "POST"
) {
  const form = document.createElement("form");
  form.method = method;
  form.action = action;
  form.style.display = "none";
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v ?? "");
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

// -----------------------------
// Zod schema
// -----------------------------

const shareholderSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  nationality: z.string().min(1, "Nationalité requise"),
  address: z.string().min(1, "Adresse requise"),
  shares: z.string().min(1, "Nombre d'actions requis"),
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

  shareholders: z.array(shareholderSchema).min(1, "Au moins un actionnaire"),

  presidentName: z.string().min(1, "Nom et prénom du président requis"),
  presidentAddress: z.string().min(1, "Adresse du président requise"),
  presidentPhone: z.string().min(1, "Téléphone du président requis"),
  presidentEmail: z.string().email("Email du président invalide"),

  decisionMode: z.enum(["assemblee", "consultation"], {
    required_error: "Mode de décision requis",
  }),
  governance: z.enum(["president", "conseil"], {
    required_error: "Organe de gestion requis",
  }),

  userEmail: z.string().email("Email invalide").optional(),
});

export type FormDataSAS = z.infer<typeof formSchema>;

// -----------------------------
// Steps config (Méthode B)
// -----------------------------

type StepKey =
  | "base"
  | "company"
  | "shareholders"
  | "president"
  | "governance"
  | "documents"
  | "email";

const buildSteps = (isAuth: boolean) =>
  [
    { key: "base", title: "Informations de base" },
    { key: "company", title: "Société" },
    { key: "shareholders", title: "Actionnaires" },
    { key: "president", title: "Représentation légale" },
    { key: "governance", title: "Modalités administratives" },
    { key: "documents", title: "Documents à joindre" },
    ...(isAuth
      ? []
      : [{ key: "email" as const, title: "Votre email pour le suivi" }]),
  ] as { key: StepKey; title: string }[];

// -----------------------------
// Component
// -----------------------------

const SasCreationForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const { toast } = useToast();

  const formTypeSigle = "SAS";
  const { blocked, reason, auth } = useFormAccessGuard();
  const { apply } = useFormAutofill();

  const stateOffer = (location.state as any)?.offer as
    | SelectedOffer
    | undefined;
  const queryVariant =
    search.get("variant") || search.get("offer") || undefined;

  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer>(
    stateOffer ?? null
  );
  const [resolved, setResolved] = useState<BackendOffer | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [lastRef, setLastRef] = useState<string | null>(null);

  // Fetch offer if provided via state/query
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
      } catch {}
    })();
  }, []);

  const form = useForm<FormDataSAS>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestDate: new Date().toISOString().split("T")[0],
      creationLocation: "",
      companyName: "",
      headquarters: "",
      phone: "",
      email: "",
      duration: "",
      capital: "",
      activity: "",
      shareholders: [{ name: "", nationality: "", address: "", shares: "" }],
      presidentName: "",
      presidentAddress: "",
      presidentPhone: "",
      presidentEmail: "",
      decisionMode: "assemblee",
      governance: "president",
    },
    mode: "onTouched",
  });

  // Autofill convenience
  useEffect(() => {
    apply(form.setValue, {
      phone: "phone",
      email: "email",
      address: "headquarters",
    });
    try {
      const me = JSON.parse(localStorage.getItem("current_user") || "{}");
      if (me?.email)
        form.setValue("presidentEmail", me.email, { shouldDirty: false });
      if (me?.phone)
        form.setValue("presidentPhone", me.phone, { shouldDirty: false });
    } catch {}
  }, []);

  // Shareholders field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shareholders",
  });

  // Uploads map (by document key)
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

  // Steps (METHOD B)
  const steps = useMemo(() => buildSteps(!!auth), [auth]);
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState(1);
  const progress = (currentStep / totalSteps) * 100;
  const isFinalStep = currentStep === totalSteps;
  const currentKey = steps[currentStep - 1]?.key;
  const currentTitle = steps[currentStep - 1]?.title ?? "";

  // Pricing selection
  const isQuote = selectedOffer?.pricing_mode === "quote";
  const zoneValue = form.watch("creationLocation");

  const selectedAmount = useMemo<number | null>(() => {
    if (!resolved || isQuote) return null;
    const v = zoneValue?.toLowerCase();
    if (v === "abidjan") return resolved.price_amount_abidjan ?? null;
    if (v === "intérieur" || v === "interieur" || v === "interior")
      return resolved.price_amount_interior ?? null;
    return null;
  }, [resolved, isQuote, zoneValue]);

  const selectedDisplay = useMemo<string>(() => {
    if (!resolved || isQuote) return "Sur devis";
    const v = zoneValue?.toLowerCase();
    if (v === "abidjan") return resolved.price_display_abidjan || "—";
    if (v === "intérieur" || v === "interieur" || v === "interior")
      return resolved.price_display_interior || "—";
    return "—";
  }, [resolved, isQuote, zoneValue]);

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

  // Validation mapping per step key
  const getFieldsForStep = (key?: StepKey): (keyof FormDataSAS)[] => {
    switch (key) {
      case "base":
        return ["requestDate", "creationLocation"];
      case "company":
        return [
          "companyName",
          "headquarters",
          "phone",
          "email",
          "duration",
          "capital",
          "activity",
        ];
      case "shareholders":
        return ["shareholders"] as any;
      case "president":
        return [
          "presidentName",
          "presidentAddress",
          "presidentPhone",
          "presidentEmail",
        ];
      case "governance":
        return ["decisionMode", "governance"];
      case "documents":
        return [];
      case "email":
        return auth ? [] : ["userEmail"];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const ok = await form.trigger(getFieldsForStep(currentKey), {
      shouldFocus: true,
    });
    if (ok) setCurrentStep((s) => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // Documents list (sans "Liste des actionnaires")
  const documentTypes = [
    { key: "statuts", label: "Projet de statuts", required: true },
    {
      key: "souscriptions",
      label: "Déclaration des souscriptions et libérations",
      required: true,
    },
    {
      key: "domiciliation",
      label: "Justificatif de domiciliation",
      required: true,
    },
    {
      key: "depot_fonds",
      label: "Attestation de dépôt des fonds",
      required: false,
    },
  ];

  // -----------------------------
  // Submit
  // -----------------------------
  const onSubmit = async (values: FormDataSAS) => {
    if (!selectedOffer?.key) {
      toast({
        variant: "destructive",
        title: "Aucune offre sélectionnée",
        description:
          "Retournez à la page des offres pour choisir une formule SAS.",
      });
      return;
    }

    try {
      const fd = new FormData();
      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      fd.append("variant_key", `${formTypeSigle}:${selectedOffer.key}`);

      // Base
      fd.append("data[requestDate]", values.requestDate);
      fd.append("data[creationLocation]", values.creationLocation);

      // Société
      fd.append("data[companyName]", values.companyName);
      fd.append("data[headquarters]", values.headquarters);
      fd.append("data[phone]", values.phone);
      fd.append("data[email]", values.email);
      fd.append("data[duration]", values.duration);
      fd.append("data[capital]", values.capital);
      fd.append("data[activity]", values.activity);

      // Actionnaires
      values.shareholders.forEach((sh, i) => {
        fd.append(`data[shareholders][${i}][name]`, sh.name);
        fd.append(`data[shareholders][${i}][nationality]`, sh.nationality);
        fd.append(`data[shareholders][${i}][address]`, sh.address);
        fd.append(`data[shareholders][${i}][shares]`, sh.shares);
      });

      // Président
      fd.append("data[president][name]", values.presidentName);
      fd.append("data[president][address]", values.presidentAddress);
      fd.append("data[president][phone]", values.presidentPhone);
      fd.append("data[president][email]", values.presidentEmail);

      // Modalités
      fd.append("data[decisionMode]", values.decisionMode);
      fd.append("data[governance]", values.governance);

      // Offre & pricing
      fd.append("data[selected_preset][label]", selectedOffer.title);
      fd.append(
        "data[selected_preset][pricing_mode]",
        selectedOffer.pricing_mode
      );
      fd.append("data[selected_preset][currency]", selectedOffer.currency);

      const isQuoteLocal = selectedOffer.pricing_mode === "quote";
      const currency = selectedOffer.currency || "XOF";
      if (!isQuoteLocal) {
        const zone =
          values.creationLocation?.toLowerCase() === "abidjan"
            ? "abidjan"
            : "interior";
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
          fd.append("data[selected_preset][selected_display]", selectedDisplay);
        }
        // Hints de paiement
        fd.append("currency", currency);
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(selectedAmount ?? 0));
        fd.append("data[price][currency]", currency);
        fd.append("data[payment][amount]", String(selectedAmount ?? 0));
        fd.append("data[payment][currency]", currency);
        fd.append("data[amount]", String(selectedAmount ?? 0));
        fd.append("data[price_amount]", String(selectedAmount ?? 0));
        fd.append("data[total_amount]", String(selectedAmount ?? 0));
        fd.append("data[montant]", String(selectedAmount ?? 0));
        fd.append("data[paiement][amount]", String(selectedAmount ?? 0));
        fd.append("data[paiement][currency]", currency);
      } else {
        fd.append("data[selected_preset][selected_price]", "");
        fd.append("data[selected_preset][selected_display]", "Sur devis");
      }

      // Fichiers
      Object.values(uploadedFiles).forEach((arr) =>
        (arr || []).forEach((f) => fd.append("files[attachments][]", f))
      );

      // Email invité
      if (!auth && values.userEmail) fd.set("data[email]", values.userEmail);

      const { data: res } = await http.post("/demandes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdId: number | null = res?.demande?.id ?? res?.id ?? null;
      const ref: string | null = res?.demande?.ref ?? res?.ref ?? null;

      const isFixed = selectedOffer?.pricing_mode === "fixed";
      if (
        isFixed &&
        selectedAmount != null &&
        Number(selectedAmount) > 0 &&
        createdId
      ) {
        try {
          const pay = await initPaymentLocal({
            id: createdId,
            channel: "paiementpro",
            customer: {
              email: values.email,
              firstName: values.presidentName?.split(" ")?.[0] || "Client",
              lastName:
                values.presidentName?.split(" ")?.slice(1).join(" ") || "SAS",
              phone: values.phone,
            },
            amount: Number(selectedAmount),
            currency: selectedOffer?.currency || "XOF",
          });
          const redirectUrl =
            pay?.redirect_url ||
            pay?.redirect?.url ||
            pay?.url ||
            pay?.checkoutUrl ||
            pay?.payment_url;
          if (redirectUrl && typeof redirectUrl === "string") {
            window.location.assign(redirectUrl);
            return;
          }
          const action = pay?.action || pay?.redirect?.action;
          const fields = pay?.fields || pay?.redirect?.fields;
          const method = (
            pay?.method ||
            pay?.redirect?.method ||
            "POST"
          ).toUpperCase() as "POST" | "GET";
          if (action && typeof action === "string") {
            autoPostInline(action, fields || {}, method);
            return;
          }
          if (pay?.html) {
            document.open();
            document.write(String(pay.html));
            document.close();
            return;
          }
        } catch {}
      } else {
        setLastRef(ref || null);
        setModalOpen(true);
        return;
      }

      toast({
        title: "Demande soumise",
        description: ref
          ? `Votre demande (${ref}) a été enregistrée.`
          : "Votre demande a été enregistrée.",
      });
      form.reset();
      setUploadedFiles({});
      setCurrentStep(1);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Envoi impossible. Réessayez plus tard.";
      if (status === 422 && /variant/i.test(String(msg))) {
        toast({
          variant: "destructive",
          title: "Variante invalide",
          description:
            "Vérifie que l’offre SAS est active et transmise sous la forme SAS:<clé>.",
        });
        return;
      }
      if (status === 422 && /type/i.test(String(msg))) {
        toast({
          variant: "destructive",
          title: "Type de demande invalide",
          description:
            "Utilise le slug « creer-entreprise » et vérifie la configuration côté admin.",
        });
        return;
      }
      if (e?.code === "ADMIN_BLOCKED") {
        toast({
          variant: "destructive",
          title: "Action non autorisée",
          description:
            "Un compte administrateur ne peut pas déposer une demande.",
        });
        return;
      }
      toast({ variant: "destructive", title: "Erreur", description: msg });
    }
  };

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
              <BadgePercent className="h-5 w-5 mr-2" /> Offre sélectionnée
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">Formule</div>
              <div className="text-base font-medium">{selectedOffer.title}</div>
            </div>
            {priceBlock}
            <Button asChild variant="outline">
              <Link to="/creer-entreprise/sas">Changer d’offre</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Création d'une SAS
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
            {currentKey === "base" && <FileText className="h-5 w-5" />}
            {currentKey === "company" && <Building className="h-5 w-5" />}
            {currentKey === "shareholders" && <Users className="h-5 w-5" />}
            {currentKey === "president" && <User className="h-5 w-5" />}
            {currentKey === "governance" && <Settings className="h-5 w-5" />}
            {currentKey === "documents" && <Upload className="h-5 w-5" />}
            {currentKey === "email" && <User className="h-5 w-5" />}
            {currentTitle}
          </CardTitle>
          <CardDescription>
            Complétez les informations demandées pour cette étape
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              noValidate
              onSubmit={(e) => {
                // on neutralise toute soumission native
                e.preventDefault();
                e.stopPropagation();
              }}
              onKeyDownCapture={(e) => {
                const tag = (e.target as HTMLElement).tagName;
                if (e.key === "Enter" && tag !== "TEXTAREA") {
                  if (currentStep < totalSteps) {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }
                }
              }}
              onKeyDown={(e) => {
                const tag = (e.target as HTMLElement).tagName;
                if (e.key === "Enter" && tag !== "TEXTAREA") {
                  if (currentStep < totalSteps) {
                    e.preventDefault();
                    e.stopPropagation();
                    nextStep();
                  }
                }
              }}
              action="javascript:void(0)"
              onInvalid={(e) => {
                if (currentStep < totalSteps) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className="space-y-6"
            >
              <fieldset disabled={blocked}>
                {currentKey === "base" && (
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

                {currentKey === "company" && (
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

                {currentKey === "shareholders" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Actionnaires fondateurs
                      </h3>
                      {fields.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            append({
                              name: "",
                              nationality: "",
                              address: "",
                              shares: "",
                            })
                          }
                        >
                          Ajouter un actionnaire
                        </Button>
                      )}
                    </div>

                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            Actionnaire {index + 1}
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`shareholders.${index}.name` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom & Prénom</FormLabel>
                                <FormControl>
                                  <Input placeholder="Jean Dupont" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`shareholders.${index}.nationality` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nationalité</FormLabel>
                                <FormControl>
                                  <Input placeholder="Française" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`shareholders.${index}.address` as const}
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
                        <FormField
                          control={form.control}
                          name={`shareholders.${index}.shares` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre d'actions</FormLabel>
                              <FormControl>
                                <Input placeholder="100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {currentKey === "president" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="presidentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom et Prénom du Président</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom complet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="presidentAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse du Président</FormLabel>
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
                        name="presidentPhone"
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
                        name="presidentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="president@societe.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {currentKey === "governance" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-base font-semibold mb-2">
                        Mode de décision
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="decisionMode"
                          render={({ field }) => (
                            <Button
                              type="button"
                              variant={
                                field.value === "assemblee"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => field.onChange("assemblee")}
                            >
                              Assemblée générale
                            </Button>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="decisionMode"
                          render={({ field }) => (
                            <Button
                              type="button"
                              variant={
                                field.value === "consultation"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => field.onChange("consultation")}
                            >
                              Consultation écrite
                            </Button>
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold mb-2">
                        Organe de gestion
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="governance"
                          render={({ field }) => (
                            <Button
                              type="button"
                              variant={
                                field.value === "president"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => field.onChange("president")}
                            >
                              Président seul
                            </Button>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="governance"
                          render={({ field }) => (
                            <Button
                              type="button"
                              variant={
                                field.value === "conseil"
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => field.onChange("conseil")}
                            >
                              Conseil d'administration
                            </Button>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentKey === "documents" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Documents à Joindre
                      </h3>
                      <div className="space-y-4">
                        {documentTypes.map((docType) => (
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
                                  <span className="text-red-500 text-sm">
                                    *
                                  </span>
                                )}
                              </div>
                              {uploadedFiles[docType.key]?.length > 0 && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Check className="h-4 w-4" />
                                  <span className="text-sm">
                                    {uploadedFiles[docType.key].length}{" "}
                                    fichier(s)
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
                          <strong>Formats acceptés :</strong> PDF, DOC, DOCX,
                          JPG, JPEG, PNG
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentKey === "email" && !auth && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold">
                        Votre e-mail pour le suivi
                      </h3>
                      <p className="text-gray-600">
                        Nous créerons un compte automatiquement si vous n’en
                        avez pas. Vous pourrez définir un mot de passe ensuite.
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="userEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </fieldset>

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || blocked}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} disabled={blocked}>
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button" // <-- pas "submit"
                    onClick={form.handleSubmit(onSubmit)}
                    className="bg-red-900 hover:bg-red-800"
                    disabled={blocked}
                  >
                    Créer ma SAS
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <DemandeSuccessModal
        open={modalOpen}
        refCode={lastRef}
        userEmail={form.getValues("userEmail") || form.getValues("email")}
        isAuthenticated={!!auth}
        onOpenChange={setModalOpen}
        onCloseToHome={() => {
          setModalOpen(false);
          form.reset();
          navigate("/");
        }}
        onCloseToOrders={() => {
          setModalOpen(false);
          form.reset();
          navigate("/mes-demandes");
        }}
      />
    </div>
  );
};

export default SasCreationForm;
