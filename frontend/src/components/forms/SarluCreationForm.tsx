import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  User,
  FileText,
  Upload,
  UserPlus,
  File,
  Check,
  X,
  BadgePercent,
  Lock,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { http } from "@/lib/http";
import { useFormAccessGuard } from "@/modules/demandes/useFormAccessGuard";
import { useFormAutofill } from "@/modules/demandes/useFormAutofill";
import DemandeSuccessModal from "@/modules/demandes/DemandeSuccessModal";

type PricingMode = "fixed" | "from" | "quote";

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
  associateName: z.string().min(1, "Nom et prénom requis"),
  associateNationality: z.string().min(1, "Nationalité requise"),
  associateAddress: z.string().min(1, "Adresse requise"),
  associateContribution: z.string().min(1, "Montant de l'apport requis"),
  managerName: z.string().min(1, "Nom et prénom du gérant requis"),
  managerAddress: z.string().min(1, "Adresse du gérant requise"),
  managerPhone: z.string().min(1, "Téléphone du gérant requis"),
  managerEmail: z.string().email("Email du gérant invalide"),
  userEmail: z.string().email("Email invalide").optional(),
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
    {
      headers: { Accept: "application/json" },
    }
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

const SarluCreationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const { toast } = useToast();
  const formTypeSigle = "SARLU";
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { requestDate: new Date().toISOString().split("T")[0] },
    mode: "onTouched",
  });

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
  }, []);

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

  const totalSteps = auth ? 5 : 6;
  const [currentStep, setCurrentStep] = useState(1);
  const progress = (currentStep / totalSteps) * 100;
  const isFinalStep = currentStep === totalSteps;

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
        return [
          "associateName",
          "associateNationality",
          "associateAddress",
          "associateContribution",
        ];
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
        return auth ? [] : ["userEmail"];
      default:
        return [];
    }
  };
  const getStepTitle = (step: number) => {
    const base = [
      "Informations de base",
      "Informations sur la société",
      "Associé unique",
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

  const isQuote = selectedOffer?.pricing_mode === "quote";
  const isFixed = selectedOffer?.pricing_mode === "fixed";
  const zoneValue = form.watch("creationLocation");

  const selectedAmount = useMemo<number | null>(() => {
    if (!resolved || isQuote) return null;
    if (zoneValue?.toLowerCase() === "abidjan")
      return resolved.price_amount_abidjan ?? null;
    if (
      zoneValue?.toLowerCase() === "intérieur" ||
      zoneValue?.toLowerCase() === "interieur" ||
      zoneValue === "interior"
    )
      return resolved.price_amount_interior ?? null;
    return null;
  }, [resolved, isQuote, zoneValue]);

  const selectedDisplay = useMemo<string>(() => {
    if (!resolved || isQuote) return "Sur devis";
    if (zoneValue?.toLowerCase() === "abidjan")
      return resolved.price_display_abidjan || "—";
    if (
      zoneValue?.toLowerCase() === "intérieur" ||
      zoneValue?.toLowerCase() === "interieur" ||
      zoneValue === "interior"
    )
      return resolved.price_display_interior || "—";
    return "—";
  }, [resolved, isQuote, zoneValue]);

  const documentTypes = [
    { key: "statuts", label: "Projet de statuts", required: true },
    {
      key: "souscription",
      label: "Déclaration de souscription et libération du capital",
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
      required: true,
    },
  ];

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

  const onSubmit = async (values: FormData) => {
    if (!selectedOffer?.key) {
      toast({
        variant: "destructive",
        title: "Aucune offre sélectionnée",
        description:
          "Retournez à la page des offres pour choisir une formule SARLU.",
      });
      return;
    }
    try {
      const fd = new FormData();
      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      fd.append("variant_key", `${formTypeSigle}:${selectedOffer.key}`);
      fd.append("data[requestDate]", values.requestDate);
      fd.append("data[creationLocation]", values.creationLocation);
      fd.append("data[companyName]", values.companyName);
      fd.append("data[headquarters]", values.headquarters);
      fd.append("data[phone]", values.phone);
      fd.append("data[email]", values.email);
      fd.append("data[duration]", values.duration);
      fd.append("data[capital]", values.capital);
      fd.append("data[activity]", values.activity);
      fd.append("data[associateName]", values.associateName);
      fd.append("data[associateNationality]", values.associateNationality);
      fd.append("data[associateAddress]", values.associateAddress);
      fd.append("data[associateContribution]", values.associateContribution);
      fd.append("data[managerName]", values.managerName);
      fd.append("data[managerAddress]", values.managerAddress);
      fd.append("data[managerPhone]", values.managerPhone);
      fd.append("data[managerEmail]", values.managerEmail);
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
        if (selectedAmount != null)
          fd.append(
            "data[selected_preset][selected_price]",
            String(selectedAmount)
          );
        if (selectedDisplay)
          fd.append("data[selected_preset][selected_display]", selectedDisplay);
        const currency = selectedOffer.currency || "XOF";
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
      Object.values(uploadedFiles).forEach((arr) =>
        (arr || []).forEach((f) => fd.append("files[attachments][]", f))
      );
      if (!auth && values.userEmail) fd.set("data[email]", values.userEmail);
      const { data: res } = await http.post("/demandes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const createdId: number | null = res?.demande?.id ?? res?.id ?? null;
      const ref: string | null = res?.demande?.ref ?? res?.ref ?? null;

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
              firstName: values.managerName?.split(" ")?.[0] || "Client",
              lastName:
                values.managerName?.split(" ")?.slice(1).join(" ") || "SARLU",
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
            "Vérifie que l’offre SARLU est active et transmise sous la forme SARLU:<clé>.",
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
              <Link to="/creer-entreprise/sarlu">Changer d’offre</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Création d'une SARLU
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
            {currentStep === 3 && <User className="h-5 w-5" />}
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
            <form
              onSubmit={
                isFinalStep
                  ? form.handleSubmit(onSubmit)
                  : (e) => e.preventDefault()
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  (e.target as HTMLElement).tagName !== "TEXTAREA"
                ) {
                  if (!isFinalStep) {
                    e.preventDefault();
                    nextStep();
                  }
                }
              }}
              className="space-y-6"
            >
              <fieldset disabled={blocked}>
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
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Associé unique
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Dans une SARLU, il n&apos;y a qu&apos;un seul associé
                        qui détient la totalité du capital social.
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="associateName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom et Prénom</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom complet de l'associé unique"
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
                        name="associateNationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationalité</FormLabel>
                            <FormControl>
                              <Input placeholder="Ivoirienne" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="associateContribution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant de l'apport (FCFA)</FormLabel>
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
                      name="associateAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Adresse complète de l'associé unique"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                      <p className="text-green-700 text-sm">
                        Le gérant peut être l&apos;associé unique lui-même ou
                        une tierce personne.
                      </p>
                    </div>
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
                  </div>
                )}
                {currentStep === 5 && (
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
                {!auth && currentStep === 6 && (
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
                    type="submit"
                    className="bg-red-900 hover:bg-red-800"
                    disabled={blocked}
                  >
                    Créer ma SARLU
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

export default SarluCreationForm;
