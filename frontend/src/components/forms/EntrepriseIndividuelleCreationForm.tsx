import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
  Upload,
  Check,
  User,
  Building,
  FileText,
  UserPlus,
  BadgePercent,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { http } from "@/lib/http";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

type PricingMode = "fixed" | "from" | "quote";

type BackendOffer = {
  key: string;
  title: string;
  pricing_mode: PricingMode;
  currency: string;
  price_display_abidjan?: string;
  price_display_interior?: string;
  price_amount_abidjan?: number | null;
  price_amount_interior?: number | null;
};

type SelectedOffer = {
  key: string;
  title: string;
  pricing_mode: PricingMode;
  currency: string;
} | null;

const formSchema = z
  .object({
    // Infos Entrepreneur
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    nationality: z.string().min(2, "La nationalité est requise"),
    personalAddress: z.string().min(5, "L'adresse personnelle est requise"),
    phone: z
      .string()
      .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
    email: z.string().email("Email invalide"),

    // Infos Entreprise
    commercialName: z.string().optional(),
    businessAddress: z.string().min(5, "L'adresse du siège est requise"),
    mainActivity: z.string().min(5, "L'activité principale est requise"),
    investedCapital: z.string().optional(),
    exerciseDuration: z.string().min(1, "La durée d'exercice est requise"),

    // Création de compte
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string().min(8, "La confirmation est requise"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

const EntrepriseIndividuelleCreationForm = () => {
  const { toast } = useToast();

  // ---- steps
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    {
      id: 1,
      title: "Informations sur l'Entrepreneur",
      description: "Vos informations personnelles",
      icon: User,
      fields: [
        "firstName",
        "lastName",
        "nationality",
        "personalAddress",
        "phone",
        "email",
      ],
    },
    {
      id: 2,
      title: "Informations sur l'Entreprise",
      description: "Détails de votre entreprise individuelle",
      icon: Building,
      fields: [
        "commercialName",
        "businessAddress",
        "mainActivity",
        "investedCapital",
        "exerciseDuration",
      ],
    },
    {
      id: 3,
      title: "Documents Requis",
      description: "Joindre les documents nécessaires",
      icon: FileText,
      fields: [],
    },
    {
      id: 4,
      title: "Création de Compte",
      description: "Créer votre compte LAWRY",
      icon: UserPlus,
      fields: ["password", "confirmPassword"],
    },
  ];
  const progress = (currentStep / steps.length) * 100;

  // ---- upload
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>(
    {}
  );
  const handleFileUpload = (
    fileType: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [fileType]: file }));
      toast({
        title: "Document ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    }
  };

  // ---- offre EI
  const formTypeSigle = "ENTREPRISE INDIVIDUELLE";
  const [resolved, setResolved] = useState<BackendOffer | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer>(null);
  const [variantKey, setVariantKey] = useState<string | null>(null); // <-- indispensable pour éviter l'erreur
  const [zone, setZone] = useState<"abidjan" | "interior" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get(
          `/enterprise-types/${encodeURIComponent(formTypeSigle)}/offers`
        );
        const arr: BackendOffer[] = data?.offers || data?.items || [];
        const found = arr?.[0];
        if (found) {
          setResolved(found);
          setSelectedOffer({
            key: found.key,
            title: found.title,
            pricing_mode: found.pricing_mode,
            currency: found.currency || "XOF",
          });
          // construit le variant_key attendu par le back
          setVariantKey(`${formTypeSigle}:${found.key}`);
          // zone par défaut si tarif non devis
          if (found.pricing_mode !== "quote") setZone("abidjan");
        } else {
          setResolved(null);
          setSelectedOffer(null);
          setVariantKey(null);
        }
      } catch {
        setResolved(null);
        setSelectedOffer(null);
        setVariantKey(null);
      }
    })();
  }, []);

  const selectedAmount = useMemo<number | null>(() => {
    if (!resolved || resolved.pricing_mode === "quote" || !zone) return null;
    if (zone === "abidjan") return resolved.price_amount_abidjan ?? null;
    return resolved.price_amount_interior ?? null;
  }, [resolved, zone]);

  const selectedDisplay = useMemo<string>(() => {
    if (!resolved || resolved.pricing_mode === "quote" || !zone)
      return "Sur devis";
    return zone === "abidjan"
      ? resolved.price_display_abidjan || "—"
      : resolved.price_display_interior || "—";
  }, [resolved, zone]);

  // ---- form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nationality: "",
      personalAddress: "",
      phone: "",
      email: "",
      commercialName: "",
      businessAddress: "",
      mainActivity: "",
      investedCapital: "",
      exerciseDuration: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const nextStep = async () => {
    const currentStepFields = steps[currentStep - 1].fields;
    const ok = await form.trigger(currentStepFields as any);
    if (ok) setCurrentStep((s) => Math.min(s + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // ---- submit + paiement
  const onSubmit = async (data: FormData) => {
    try {
      if (!variantKey) {
        toast({
          variant: "destructive",
          title: "Offre indisponible",
          description:
            "Impossible de déterminer la formule. Réessayez dans un instant.",
        });
        return;
      }

      const fd = new FormData();

      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      fd.append("variant_key", variantKey);

      // Entrepreneur
      fd.append("data[firstName]", data.firstName);
      fd.append("data[lastName]", data.lastName);
      fd.append("data[nationality]", data.nationality);
      fd.append("data[personalAddress]", data.personalAddress);
      fd.append("data[phone]", data.phone);
      fd.append("data[email]", data.email);

      // Entreprise
      if (data.commercialName)
        fd.append("data[commercialName]", data.commercialName);
      fd.append("data[businessAddress]", data.businessAddress);
      fd.append("data[mainActivity]", data.mainActivity);
      if (data.investedCapital)
        fd.append("data[investedCapital]", data.investedCapital);
      fd.append("data[exerciseDuration]", data.exerciseDuration);

      // Création de compte (si ignoré côté back, pas grave)
      fd.append("data[account][password]", data.password);

      // Snapshot offre
      if (selectedOffer) {
        fd.append("data[selected_preset][label]", selectedOffer.title);
        fd.append(
          "data[selected_preset][pricing_mode]",
          selectedOffer.pricing_mode
        );
        fd.append("data[selected_preset][currency]", selectedOffer.currency);
        fd.append("data[selected_preset][variant_key]", variantKey);
        if (selectedOffer.pricing_mode !== "quote" && zone) {
          fd.append("data[selected_preset][zone]", zone);
          if (resolved?.price_display_abidjan)
            fd.append(
              "data[selected_preset][abidjan_display]",
              resolved.price_display_abidjan
            );
          if (resolved?.price_display_interior)
            fd.append(
              "data[selected_preset][interior_display]",
              resolved.price_display_interior
            );
          if (selectedAmount != null)
            fd.append(
              "data[selected_preset][selected_price]",
              String(selectedAmount)
            );
          if (selectedDisplay)
            fd.append(
              "data[selected_preset][selected_display]",
              selectedDisplay
            );
        } else {
          fd.append("data[selected_preset][selected_price]", "");
          fd.append("data[selected_preset][selected_display]", "Sur devis");
        }
      }

      // Normalisation prix (pour payableAmountXof)
      const currency = selectedOffer?.currency || "XOF";
      fd.append("currency", currency);
      if (
        selectedOffer?.pricing_mode !== "quote" &&
        selectedAmount != null &&
        Number(selectedAmount) > 0
      ) {
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(selectedAmount));
        fd.append("data[price][currency]", currency);

        // redondances défensives
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
      Object.entries(uploadedFiles).forEach(([k, f]) => {
        if (f) fd.append("files[attachments][]", f, f.name);
      });

      // Création
      const { data: res } = await http.post("/demandes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdId: number | null = res?.demande?.id ?? res?.id ?? null;
      const ref: string | null = res?.demande?.ref ?? res?.ref ?? null;

      // Paiement si montant > 0
      const shouldPayNow =
        selectedOffer?.pricing_mode !== "quote" &&
        !!selectedAmount &&
        Number(selectedAmount) > 0 &&
        !!createdId;

      if (shouldPayNow && createdId) {
        try {
          const pay = await initPayment({
            type: "demande",
            id: createdId,
            customer: {
              email: data.email,
              firstName: data.firstName || "Client",
              lastName: data.lastName || "EI",
              phone: data.phone,
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
          // si l'init paiement échoue, on continue le flow standard
        }
      }

      // Succès standard
      toast({
        title: "Demande soumise",
        description: ref
          ? `Votre demande (${ref}) a été enregistrée.`
          : "Votre demande a été enregistrée.",
      });

      // reset
      form.reset();
      setUploadedFiles({});
      setCurrentStep(1);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Envoi impossible. Réessayez plus tard.";
      toast({ variant: "destructive", title: "Erreur", description: msg });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Résumé de l’offre sélectionnée */}
          {selectedOffer && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-red-900">
                  <BadgePercent className="h-5 w-5 mr-2" />
                  Offre sélectionnée — {selectedOffer.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Récapitulatif de la formule choisie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-800">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <span className="text-gray-500">Variant key :</span>{" "}
                    <span className="font-medium">{variantKey || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Mode :</span>{" "}
                    <span className="font-medium">
                      {selectedOffer.pricing_mode}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Devise :</span>{" "}
                    <span className="font-medium">
                      {selectedOffer.currency || "XOF"}
                    </span>
                  </div>
                </div>
                {resolved?.pricing_mode !== "quote" ? (
                  <>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-gray-500">Zone :</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={zone === "abidjan" ? "default" : "outline"}
                          onClick={() => setZone("abidjan")}
                          size="sm"
                        >
                          Abidjan
                        </Button>
                        <Button
                          type="button"
                          variant={zone === "interior" ? "default" : "outline"}
                          onClick={() => setZone("interior")}
                          size="sm"
                        >
                          Intérieur
                        </Button>
                      </div>
                      <div className="ml-auto flex items-center gap-2 text-gray-700">
                        <Info className="h-4 w-4" />
                        <span>
                          Tarif sélection : <strong>{selectedDisplay}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <div>
                        <span className="text-gray-500">Tarif Abidjan :</span>{" "}
                        <span className="font-medium">
                          {resolved?.price_display_abidjan || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tarif Intérieur :</span>{" "}
                        <span className="font-medium">
                          {resolved?.price_display_interior || "—"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-700">
                    Cette offre est <strong>sur devis</strong>.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Création d&apos;Entreprise Individuelle
            </h1>
            <Progress value={progress} className="w-full h-3" />
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    step.id <= currentStep ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  <step.icon className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              onKeyDown={(e) => {
                // pas de submit intempestif sur Enter
                if (
                  e.key === "Enter" &&
                  (e.target as HTMLElement)?.tagName !== "TEXTAREA"
                ) {
                  e.preventDefault();
                  if (currentStep < steps.length) nextStep();
                }
              }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {React.createElement(steps[currentStep - 1].icon, {
                      className: "h-6 w-6 mr-2 text-red-600",
                    })}
                    {steps[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription>
                    {steps[currentStep - 1].description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Votre nom de famille"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre prénom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationalité *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Votre nationalité"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Votre numéro de téléphone"
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
                            <FormLabel>Email *</FormLabel>
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
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="personalAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse personnelle *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Votre adresse complète"
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

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="commercialName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Dénomination commerciale (optionnel)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nom commercial si différent"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="businessAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse du siège *</FormLabel>
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
                      <FormField
                        control={form.control}
                        name="mainActivity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activité principale *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez votre activité principale"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="investedCapital"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capital investi (optionnel)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Montant du capital investi"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="exerciseDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Durée d'exercice souhaitée *
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 12 mois" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Choix de zone si non devis */}
                      {resolved?.pricing_mode !== "quote" && (
                        <div className="flex flex-wrap gap-2 items-center">
                          <Button
                            type="button"
                            variant={zone === "abidjan" ? "default" : "outline"}
                            onClick={() => setZone("abidjan")}
                          >
                            Abidjan
                          </Button>
                          <Button
                            type="button"
                            variant={
                              zone === "interior" ? "default" : "outline"
                            }
                            onClick={() => setZone("interior")}
                          >
                            Intérieur
                          </Button>
                          <div className="ml-auto text-sm text-gray-700">
                            Tarif sélection : <strong>{selectedDisplay}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          {
                            key: "identity",
                            label:
                              "Copie de la pièce d'identité de l'entrepreneur",
                            required: true,
                          },
                          {
                            key: "domiciliation",
                            label: "Justificatif de domiciliation",
                            required: true,
                          },
                          {
                            key: "declaration",
                            label:
                              "Déclaration sur l'honneur d'exercice en nom propre",
                            required: true,
                          },
                        ].map((doc) => (
                          <Card key={doc.key} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {doc.label}{" "}
                                  {doc.required && (
                                    <span className="text-red-500">*</span>
                                  )}
                                </h3>
                                {uploadedFiles[doc.key] && (
                                  <p className="text-sm text-green-600 flex items-center mt-1">
                                    <Check className="h-4 w-4 mr-1" />
                                    {uploadedFiles[doc.key].name}
                                  </p>
                                )}
                              </div>
                              <div>
                                <input
                                  type="file"
                                  id={`file-${doc.key}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileUpload(doc.key, e)}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    document
                                      .getElementById(`file-${doc.key}`)
                                      ?.click()
                                  }
                                  className="flex items-center"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {uploadedFiles[doc.key]
                                    ? "Modifier"
                                    : "Choisir"}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Créer votre compte LAWRY
                        </h3>
                        <p className="text-gray-600">
                          Un compte sera créé avec l&apos;email :{" "}
                          <strong>{form.watch("email")}</strong>
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mot de passe *</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Minimum 8 caractères"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirmPassword"
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
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
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

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-red-900 hover:bg-red-800 flex items-center"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 flex items-center"
                    disabled={!variantKey} // sécurité : bloque si l’offre n’est pas encore chargée
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Soumettre la demande
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EntrepriseIndividuelleCreationForm;
