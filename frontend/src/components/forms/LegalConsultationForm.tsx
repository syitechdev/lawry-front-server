import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useNavigate } from "react-router-dom";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import {
  User,
  FileText,
  Scale,
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  BadgePercent,
  Copy,
  ExternalLink,
  Loader2, // loader spinner
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

export type ConsultationPreset = {
  key: string; // variant_key
  label: string; // libellé
  price?: number | null; // montant ou null (sur devis)
  currency?: string; // XOF...
  counselType?:
    | "redaction_verification"
    | "analyse_recommandations"
    | "gestion_litiges"
    | "assistance_precontentieuse"
    | "avis_juridique"
    | "autre";
};

const schema = z
  .object({
    // Informations client
    firstName: z.string().min(1, "Prénom requis"),
    lastName: z.string().min(1, "Nom requis"),
    profession: z.string().min(1, "Profession requise"),
    nationality: z.string().min(1, "Nationalité requise"),
    clientType: z.enum(["particulier", "entreprise", "association", "autre"]),
    companyName: z.string().optional(),
    otherClientType: z.string().optional(),
    phone: z.string().min(1, "Téléphone requis"),
    email: z.string().email("Email invalide"),

    // Objet
    legalDomain: z.enum([
      "droit_affaires",
      "droit_fiscal",
      "droit_societes",
      "droit_travail",
      "droit_immobilier",
      "droit_famille",
      "droit_penal",
      "droit_contrats",
      "droit_nouvelles_technologies",
      "autre",
    ]),
    otherLegalDomain: z.string().optional(),
    counselType: z.enum([
      "redaction_verification",
      "analyse_recommandations",
      "gestion_litiges",
      "assistance_precontentieuse",
      "avis_juridique",
      "autre",
    ]),
    otherCounselType: z.string().optional(),

    // Description
    factDescription: z
      .string()
      .min(10, "Description des faits requise (min 10 caractères)"),
    legalQuestions: z.string().min(5, "Questions juridiques requises"),
    involvedParties: z.string().optional(),

    // Docs
    hasDocuments: z.boolean(),
    documentTypes: z.array(z.string()).optional(),
    otherDocuments: z.string().optional(),

    // Consentements
    dataConsent: z.boolean().refine((v) => v === true, "Consentement requis"),
    digitalConsent: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.clientType === "entreprise" && !val.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Le nom de l'entreprise est requis",
      });
    }
    if (val.clientType === "autre" && !val.otherClientType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherClientType"],
        message: "Veuillez préciser le type de client",
      });
    }
    if (val.legalDomain === "autre" && !val.otherLegalDomain) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherLegalDomain"],
        message: "Veuillez préciser le domaine",
      });
    }
    if (val.counselType === "autre" && !val.otherCounselType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["otherCounselType"],
        message: "Veuillez préciser la nature du conseil",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

type Props = { preset: ConsultationPreset };

const LegalConsultationForm: React.FC<Props> = ({ preset }) => {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  const navigate = useNavigate();

  const [successOpen, setSuccessOpen] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  // NEW: loader & redirection cible quand le modal se ferme
  const [submitting, setSubmitting] = useState(false);
  const [closeRedirect, setCloseRedirect] = useState<"home" | "orders" | null>(
    null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientType: "particulier",
      legalDomain: "droit_affaires",
      counselType: preset.counselType ?? "avis_juridique",
      hasDocuments: false,
      dataConsent: false,
      digitalConsent: false,
      documentTypes: [],
    },
    mode: "onChange",
  });

  const isLoggedIn = !!localStorage.getItem("auth_token");
  const userEmailForReset =
    form.getValues("email") ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem("current_user") || "{}");
        return u?.email || "";
      } catch {
        return "";
      }
    })();

  useEffect(() => {
    if (preset.counselType) form.setValue("counselType", preset.counselType);
  }, [preset.counselType]);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("current_user");
        if (raw) {
          const me = JSON.parse(raw);
          const name: string = me.name ?? "";
          const [fn, ...rest] = name.split(" ");
          const ln = rest.join(" ");
          if (fn) form.setValue("firstName", fn);
          if (ln) form.setValue("lastName", ln);
          if (me.email) form.setValue("email", me.email);
          if (me.phone) form.setValue("phone", me.phone);
          if (me.profession) form.setValue("profession", me.profession);
          if (me.nationality) form.setValue("nationality", me.nationality);
        }
      } catch {
        // Ignore
      }
    })();
  }, []);

  const steps = [
    {
      id: 1,
      title: "Informations Client",
      icon: User,
      description: "Vos informations personnelles",
    },
    {
      id: 2,
      title: "Objet de la Demande",
      icon: Scale,
      description: "Type de conseil juridique",
    },
    {
      id: 3,
      title: "Description Détaillée",
      icon: FileText,
      description: "Situation et questions",
    },
    {
      id: 4,
      title: "Documents",
      icon: Upload,
      description: "Pièces jointes (facultatif)",
    },
    {
      id: 5,
      title: "Consentements",
      icon: CheckCircle,
      description: "Acceptation des conditions",
    },
  ];

  const stepFields: Record<number, (keyof FormValues)[]> = {
    1: [
      "firstName",
      "lastName",
      "profession",
      "nationality",
      "clientType",
      "companyName",
      "otherClientType",
      "phone",
      "email",
    ],
    2: ["legalDomain", "otherLegalDomain", "counselType", "otherCounselType"],
    3: ["factDescription", "legalQuestions", "involvedParties"],
    4: ["hasDocuments", "documentTypes", "otherDocuments"],
    5: ["dataConsent", "digitalConsent"],
  };

  const nextStep = async () => {
    const ok = await form.trigger(stepFields[currentStep], {
      shouldFocus: true,
    });
    if (!ok) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Corrigez les erreurs avant de continuer.",
      });
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    toast({
      title: "Fichiers ajoutés",
      description: `${files.length} fichier(s)`,
    });
  };
  const removeFile = (i: number) =>
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i));
  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      const fd = new window.FormData();
      fd.append("type", "se-faire-conseiller");
      if (preset?.key) fd.append("variant_key", preset.key);
      fd.append("urgent", "false");

      // Infos client
      fd.append("data[firstName]", data.firstName);
      fd.append("data[lastName]", data.lastName);
      fd.append("data[profession]", data.profession ?? "");
      fd.append("data[nationality]", data.nationality ?? "");
      fd.append("data[clientType]", data.clientType);
      if (data.companyName) fd.append("data[companyName]", data.companyName);
      if (data.otherClientType)
        fd.append("data[otherClientType]", data.otherClientType);
      fd.append("data[phone]", data.phone);
      fd.append("data[email]", data.email);

      // Objet
      fd.append("data[legalDomain]", data.legalDomain);
      fd.append("data[counselType]", data.counselType);
      if (data.otherLegalDomain)
        fd.append("data[otherLegalDomain]", data.otherLegalDomain);
      if (data.otherCounselType)
        fd.append("data[otherCounselType]", data.otherCounselType);

      // Description
      fd.append("data[factDescription]", data.factDescription);
      fd.append("data[legalQuestions]", data.legalQuestions);
      if (data.involvedParties)
        fd.append("data[involvedParties]", data.involvedParties);

      // Docs
      fd.append("data[hasDocuments]", String(!!data.hasDocuments));
      (data.documentTypes ?? []).forEach((t, i) =>
        fd.append(`data[documentTypes][${i}]`, t)
      );
      if (data.otherDocuments)
        fd.append("data[otherDocuments]", data.otherDocuments);

      // Consentements
      fd.append("data[dataConsent]", String(!!data.dataConsent));
      fd.append("data[digitalConsent]", String(!!data.digitalConsent));

      // --- FORMULE / PRIX : écrire partout où le back peut regarder ---
      if (preset?.label)
        fd.append("data[selected_preset][label]", preset.label);
      const currency = preset?.currency || "XOF";
      const numericAmount = Number(preset?.price ?? 0);
      const amountInt = Number.isFinite(numericAmount)
        ? Math.round(numericAmount)
        : 0;

      // Toujours poser currency au top-level si tu l’utilises côté back
      fd.append("currency", currency);

      if (amountInt > 0) {
        // "price" normalisé
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(amountInt));
        fd.append("data[price][currency]", currency);

        // Snapshot lisible en BO
        fd.append("data[selected_preset][price]", String(amountInt));
        fd.append("data[selected_preset][currency]", currency);

        // CLÉS REDONDANTES pour satisfaire payableAmountXof (quel que soit son implémentation)
        fd.append("data[amount]", String(amountInt));
        fd.append("data[price_amount]", String(amountInt));
        fd.append("data[total_amount]", String(amountInt));
        fd.append("data[montant]", String(amountInt)); // FR
        fd.append("data[payment][amount]", String(amountInt));
        fd.append("data[payment][currency]", currency);
        fd.append("data[paiement][amount]", String(amountInt)); // FR
        fd.append("data[paiement][currency]", currency);
      } else {
        // Sur devis
        fd.append("data[selected_preset][price]", "");
        fd.append("data[selected_preset][currency]", currency);
      }

      // Fichiers
      uploadedFiles.forEach((file) => fd.append("files[attachments][]", file));

      // Création
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

      // Paiement immédiat seulement si prix > 0 (le back lira le montant depuis la demande)
      if (amountInt > 0 && createdId) {
        try {
          const payInit = await http.post(
            `/pay/demande/${encodeURIComponent(createdId)}`,
            {
              // on peut renvoyer le client (facultatif)
              customerEmail: data.email,
              customerFirstName: data.firstName || "Client",
              customerLastName: data.lastName || "Inconnu",
              customerPhoneNumber: data.phone,
            },
            { headers: { Accept: "application/json" } }
          );
          const pay = payInit.data;

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
          // Si init paiement échoue, on montre le modal standard (paiement plus tard)
        }
      }

      // Succès (sans redirection paiement)
      setSuccessRef(ref);
      setSuccessOpen(true);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Veuillez vérifier le formulaire.";
      toast({
        variant: "destructive",
        title: "Envoi impossible",
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clientTypeOptions = [
    { value: "particulier", label: "Particulier" },
    { value: "entreprise", label: "Entreprise / Société" },
    { value: "association", label: "Association" },
    { value: "autre", label: "Autre" },
  ];
  const legalDomainOptions = [
    { value: "droit_affaires", label: "Droit des affaires" },
    { value: "droit_fiscal", label: "Droit fiscal" },
    { value: "droit_societes", label: "Droit des sociétés" },
    { value: "droit_travail", label: "Droit du travail" },
    { value: "droit_immobilier", label: "Droit immobilier" },
    { value: "droit_famille", label: "Droit de la famille" },
    { value: "droit_penal", label: "Droit pénal" },
    { value: "droit_contrats", label: "Droit des contrats" },
    {
      value: "droit_nouvelles_technologies",
      label: "Droit des nouvelles technologies",
    },
    { value: "autre", label: "Autre" },
  ];
  const counselTypeOptions = [
    {
      value: "redaction_verification",
      label: "Rédaction / Vérification de documents juridiques",
    },
    {
      value: "analyse_recommandations",
      label: "Analyse de situation et recommandations",
    },
    { value: "gestion_litiges", label: "Gestion de litiges / Contentieux" },
    {
      value: "assistance_precontentieuse",
      label: "Assistance précontentieuse",
    },
    {
      value: "avis_juridique",
      label: "Avis juridique sur une question spécifique",
    },
    { value: "autre", label: "Autre" },
  ];
  const documentTypeOptions = [
    "Contrats",
    "Correspondances (emails, lettres)",
    "Jugements ou décisions administratives",
    "Relevés financiers",
    "Autres documents pertinents",
  ];

  const selectedClientType = form.watch("clientType");
  const selectedLegalDomain = form.watch("legalDomain");
  const selectedCounselType = form.watch("counselType");
  const hasDocuments = form.watch("hasDocuments");
  const selectedDocumentTypes = form.watch("documentTypes") || [];

  const priceDisplay = useMemo(() => {
    if (!preset?.price) return "Sur devis";
    const n = Number(preset.price);
    if (!Number.isFinite(n)) return "Sur devis";
    return `${n.toLocaleString("fr-FR")} ${preset.currency ?? "XOF"}`;
  }, [preset]);

  if (showPayment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <PaymentForm
          contractType={{
            id: preset.key,
            name: preset.label,
            price: preset.price ?? 0,
            description: "Consultation juridique",
          }}
          onPaymentSuccess={() => {
            toast({
              title: "Paiement confirmé",
              description: "Votre demande sera traitée.",
            });
            form.reset();
            setUploadedFiles([]);
            setCurrentStep(1);
            setShowPayment(false);
          }}
          contractData={{ demande_ref: createdRef }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Bandeau formule */}
      <div className="rounded-2xl border bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <BadgePercent className="h-5 w-5 text-red-800" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Formule choisie</div>
            <div className="text-lg font-semibold text-gray-900">
              {preset.label}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Montant</div>
          <div className="text-xl font-extrabold text-red-900">
            {priceDisplay}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? "bg-red-900 border-red-900 text-white"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-red-900" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Titre étape */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Étape 1 */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Générales du Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession *</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de client *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          {clientTypeOptions.map((o) => (
                            <div
                              key={o.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem value={o.value} id={o.value} />
                              <Label htmlFor={o.value}>{o.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedClientType === "entreprise" && (
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'entreprise *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {selectedClientType === "autre" && (
                  <FormField
                    control={form.control}
                    name="otherClientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Précisez le type de client *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+225 XX XX XX XX XX" {...field} />
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
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 2 */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Objet de la Demande Juridique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="legalDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de Droit Concerné *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {legalDomainOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedLegalDomain === "autre" && (
                  <FormField
                    control={form.control}
                    name="otherLegalDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Précisez le domaine *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="counselType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nature du Conseil *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {counselTypeOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedCounselType === "autre" && (
                  <FormField
                    control={form.control}
                    name="otherCounselType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Précisez la nature du conseil *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Étape 3 */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description Détaillée de la Situation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="factDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Décrivez précisément les faits *</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[120px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legalQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Questions juridiques spécifiques *</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="involvedParties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Parties impliquées (noms et fonctions)
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Étape 4 */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents Annexes (optionnel)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="hasDocuments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>J'ai des documents à joindre</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                {hasDocuments && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="documentTypes"
                      render={() => (
                        <FormItem>
                          <FormLabel>Types de documents (cochez)</FormLabel>
                          <div className="grid grid-cols-1 gap-3">
                            {documentTypeOptions.map((type) => (
                              <FormField
                                key={type}
                                control={form.control}
                                name="documentTypes"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                type,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (v: string) => v !== type
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {type}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                    {selectedDocumentTypes.includes(
                      "Autres documents pertinents"
                    ) && (
                      <FormField
                        control={form.control}
                        name="otherDocuments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Précisez les autres documents</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <div className="space-y-4">
                      <Label>Joindre les documents</Label>
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
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Cliquez pour sélectionner des fichiers
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, DOC, DOCX, JPG, PNG (max 10MB/fichier)
                          </span>
                        </label>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label>Fichiers sélectionnés :</Label>
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm">{file.name}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                Supprimer
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Étape 5 */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Consentement et Confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Je certifie que les informations fournies sont exactes et
                    autorise le cabinet LAWRY à traiter ces informations de
                    manière confidentielle.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="dataConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Consentement pour la conservation des données *
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          J'accepte que mes données personnelles soient
                          conservées pour le traitement de ma demande.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="digitalConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Consentement pour la communication digitale
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          J'accepte de recevoir des communications par voie
                          électronique.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">
                        Confidentialité garantie
                      </h4>
                      <p className="text-sm text-green-700">
                        Vos informations sont protégées par le secret
                        professionnel.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || submitting}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={submitting}
                className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>Finaliser la Demande</>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* SUCCESS MODAL */}
      <Dialog
        open={successOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessOpen(false);
            form.reset();
            setUploadedFiles([]);
            navigate("/", { replace: true });
          } else {
            setSuccessOpen(true);
          }

          if (!open) {
            if (closeRedirect === "orders") {
              const url = successRef
                ? `/client/commandes?ref=${encodeURIComponent(successRef)}`
                : "/client/commandes";
              setCloseRedirect(null);
              navigate(url);
            } else {
              setCloseRedirect(null);
              navigate("/"); // accueil
            }
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
                    navigator.clipboard.writeText(successRef);
                    toast({
                      title: "Copié !",
                      description: "Numéro de demande copié.",
                    });
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
          {!isLoggedIn && (
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
                puis utilisez
                <strong> « Mot de passe oublié »</strong> avec votre adresse
                e-mail pour définir un mot de passe.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" asChild>
                  <a href="/login">Se connecter</a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={`/forgot-password${
                      userEmailForReset
                        ? `?email=${encodeURIComponent(userEmailForReset)}`
                        : ""
                    }`}
                  >
                    Mot de passe oublié
                  </a>
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

export default LegalConsultationForm;
