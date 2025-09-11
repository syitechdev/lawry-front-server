// src/pages/forms/SciCreationForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Building,
  Users,
  FileText,
  UserCheck,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";

type PricingMode = "fixed" | "from" | "quote";
const formTypeSigle = "SCI";

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

const associeSchema = z.object({
  nom: z.string().min(1, "Le nom de l'associé est requis"),
  nationalite: z.string().min(1, "La nationalité est requise"),
  adresse: z.string().min(1, "L'adresse est requise"),
  apport: z.string().min(1, "Le montant de l'apport est requis"),
});

const formSchema = z.object({
  // Informations générales
  denominationSociale: z.string().min(1, "La dénomination sociale est requise"),
  siegeSocial: z.string().min(1, "Le siège social est requis"),
  // on force un choix pour le pricing (abidjan/interior)
  lieuCreation: z.string().min(1, "Le lieu de création est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  duree: z.string().min(1, "La durée est requise"),
  capitalSocial: z.string().min(1, "Le capital social est requis"),
  objetSocial: z.string().min(1, "L'objet social est requis"),

  // Associés
  associes: z.array(associeSchema).min(1, "Au moins un associé est requis"),

  // Gérance
  gerantNom: z.string().min(1, "Le nom du gérant est requis"),
  gerantAdresse: z.string().min(1, "L'adresse du gérant est requise"),
  gerantTelephone: z.string().min(1, "Le téléphone du gérant est requis"),
  gerantEmail: z.string().email("Email invalide"),

  // Compte utilisateur (facultatif pour paiement)
  userNom: z.string().min(1, "Le nom est requis"),
  userPrenom: z.string().min(1, "Le prénom est requis"),
  userEmail: z.string().email("Email invalide"),
  userTelephone: z.string().min(1, "Le téléphone est requis"),
  userMotDePasse: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type FormData = z.infer<typeof formSchema>;

const SciCreationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );

  // -------- OFFRE (state | query)
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

  // -------- FORM
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      denominationSociale: "",
      siegeSocial: "",
      lieuCreation: "", // on attend 'abidjan' | 'interior'
      telephone: "",
      email: "",
      duree: "",
      capitalSocial: "",
      objetSocial: "",
      associes: [{ nom: "", nationalite: "", adresse: "", apport: "" }],
      gerantNom: "",
      gerantAdresse: "",
      gerantTelephone: "",
      gerantEmail: "",
      userNom: "",
      userPrenom: "",
      userEmail: "",
      userTelephone: "",
      userMotDePasse: "",
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "associes",
  });

  const addAssocie = () =>
    append({ nom: "", nationalite: "", adresse: "", apport: "" });
  const removeAssocie = (index: number) => {
    if (fields.length > 1) remove(index);
  };

  // -------- PRIX / ZONE
  const isQuote = selectedOffer?.pricing_mode === "quote";
  const zoneValue = form.watch("lieuCreation"); // 'abidjan' | 'interior'

  const selectedAmount = useMemo<number | null>(() => {
    if (!resolved || isQuote) return null;
    const v = String(zoneValue || "");
    if (v === "abidjan") return resolved.price_amount_abidjan ?? null;
    if (v === "interior") return resolved.price_amount_interior ?? null;
    return null;
  }, [resolved, isQuote, zoneValue]);

  const selectedDisplay = useMemo<string>(() => {
    if (!resolved || isQuote) return "Sur devis";
    const v = String(zoneValue || "");
    if (v === "abidjan") return resolved.price_display_abidjan || "—";
    if (v === "interior") return resolved.price_display_interior || "—";
    return "—";
  }, [resolved, isQuote, zoneValue]);

  // -------- FILES
  const documentTypes = [
    { key: "statuts", label: "Projet de statuts", required: true },
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
    { key: "liste_associes", label: "Liste des associés", required: true },
    {
      key: "declaration_apports",
      label: "Déclaration des apports",
      required: true,
    },
  ];

  const handleFileUpload = (fileType: string, files: FileList | null) => {
    if (!files?.length) return;
    setUploadedFiles((prev) => ({ ...prev, [fileType]: Array.from(files) }));
    toast({
      title: "Fichier(s) ajouté(s)",
      description: `${files.length} fichier(s) pour ${fileType}`,
    });
  };

  // -------- STEPS & VALIDATION PROGRESSIVE
  const steps = [
    {
      title: "Informations Générales",
      description: "Renseignements sur la SCI",
      icon: Building,
    },
    {
      title: "Associés",
      description: "Informations des associés",
      icon: Users,
    },
    {
      title: "Gérance",
      description: "Informations du gérant",
      icon: UserCheck,
    },
    {
      title: "Documents",
      description: "Joindre les documents",
      icon: FileText,
    },
    {
      title: "Compte Utilisateur",
      description: "Créer votre compte",
      icon: CheckCircle,
    },
  ];

  const getFieldsForStep = (s: number): (keyof FormData)[] => {
    switch (s) {
      case 1:
        return [
          "denominationSociale",
          "siegeSocial",
          "lieuCreation",
          "telephone",
          "email",
          "duree",
          "capitalSocial",
          "objetSocial",
        ];
      case 2:
        return ["associes"];
      case 3:
        return ["gerantNom", "gerantAdresse", "gerantTelephone", "gerantEmail"];
      case 4:
        return []; // pièces non bloquantes
      case 5:
        return [
          "userNom",
          "userPrenom",
          "userEmail",
          "userTelephone",
          "userMotDePasse",
        ];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const ok = await form.trigger(getFieldsForStep(currentStep), {
      shouldFocus: true,
    });
    if (ok) setCurrentStep((s) => Math.min(s + 1, steps.length));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // -------- SUBMIT + PAIEMENT
  const onSubmit = async (values: FormData) => {
    try {
      const fd = new FormData();

      // Type + variant
      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      if (selectedOffer?.key) {
        fd.append("variant_key", `${formTypeSigle}:${selectedOffer.key}`);
      }

      // Données principales
      fd.append("data[companyName]", values.denominationSociale);
      fd.append("data[headquarters]", values.siegeSocial);
      fd.append("data[creationLocation]", values.lieuCreation); // 'abidjan' | 'interior'
      fd.append("data[phone]", values.telephone);
      fd.append("data[email]", values.email);
      fd.append("data[duration]", values.duree);
      fd.append("data[capital]", values.capitalSocial);
      fd.append("data[activity]", values.objetSocial);

      // Associés
      (values.associes || []).forEach((a, i) => {
        fd.append(`data[associates][${i}][name]`, a.nom);
        fd.append(`data[associates][${i}][nationality]`, a.nationalite);
        fd.append(`data[associates][${i}][address]`, a.adresse);
        fd.append(`data[associates][${i}][contribution]`, a.apport);
      });

      // Gérance
      fd.append("data[managerName]", values.gerantNom);
      fd.append("data[managerAddress]", values.gerantAdresse);
      fd.append("data[managerPhone]", values.gerantTelephone);
      fd.append("data[managerEmail]", values.gerantEmail);

      // selected_preset (trace + zone + prix)
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
          const zone = zoneValue === "abidjan" ? "abidjan" : "interior";
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

      // Normalisation PRIX (toujours depuis l’offre + zone)
      const currency = selectedOffer?.currency || "XOF";
      fd.append("currency", currency);
      if (!isQuote && selectedAmount && selectedAmount > 0) {
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(selectedAmount));
        fd.append("data[price][currency]", currency);

        // doublons robustesse
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
                (values.gerantNom || "Client").split(" ")[0] || "Client",
              lastName:
                (values.gerantNom || "").split(" ").slice(1).join(" ") || "SCI",
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
          // si init paiement échoue, on continue le flow
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

  // -------- UI
  const getStepIcon = (step: number) => {
    const Icon = steps[step - 1]?.icon || Building;
    return <Icon className="h-5 w-5" />;
  };
  const zoneLabel =
    zoneValue === "abidjan"
      ? "Abidjan"
      : zoneValue === "interior"
      ? "Intérieur"
      : "—";

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="denominationSociale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dénomination Sociale *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la SCI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sélecteur de zone pour piloter le tarif */}
              <FormField
                control={form.control}
                name="lieuCreation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone / Lieu de création *</FormLabel>
                    {isQuote ? (
                      <FormControl>
                        <Input
                          placeholder="Ville (Abidjan, Yamoussoukro…)"
                          {...field}
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
                          <SelectItem value="interior">Intérieur</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {!isQuote && (
                      <p className="text-xs text-gray-500 mt-1">
                        Le tarif affiché dépend de la zone choisie.
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
                    <Input
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
                      <Input placeholder="+225 xx xx xx xx" {...field} />
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
                        placeholder="contact@sci.com"
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
                name="duree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (années) *</FormLabel>
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
                      <Input placeholder="1 000 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="objetSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet social *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Acquisition, gestion, administration…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-900">Associés *</h3>
              <Button
                type="button"
                onClick={addAssocie}
                variant="outline"
                size="sm"
                className="flex items-center border-red-200 text-red-600 hover:bg-red-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un associé
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Associé {index + 1}
                      {index === 0 && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeAssocie(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`associes.${index}.nom`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom et Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`associes.${index}.nationalite`}
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
                    <FormField
                      control={form.control}
                      name={`associes.${index}.apport`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant de l'apport *</FormLabel>
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
                    name={`associes.${index}.adresse`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse complète" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="gerantNom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom et Prénom du Gérant *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom Prénom du gérant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gerantAdresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Adresse complète du gérant"
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
                name="gerantTelephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+225 xx xx xx xx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gerantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
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
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-gray-600 mb-6">
              Veuillez joindre les documents suivants pour votre dossier de
              création de SCI :
            </p>
            {documentTypes.map((doc) => (
              <Card key={doc.key} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium">
                      {doc.label}
                      {doc.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                  </div>
                  {uploadedFiles[doc.key] && (
                    <span className="text-green-600 text-sm">
                      ✓ {uploadedFiles[doc.key].length} fichier(s)
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(doc.key, e.target.files)}
                    className="hidden"
                    id={`file-${doc.key}`}
                  />
                  <label
                    htmlFor={`file-${doc.key}`}
                    className="flex items-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir fichier(s)
                  </label>
                </div>
              </Card>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Créer votre compte LAWRY
              </h3>
              <p className="text-gray-600">
                Pour finaliser votre demande et suivre l'avancement de votre
                dossier
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userNom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPrenom"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userEmail"
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
              <FormField
                control={form.control}
                name="userTelephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+225 xx xx xx xx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="userMotDePasse"
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* BLOC Offre sélectionnée (si une offre est passée) */}
        {selectedOffer && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-red-900">
                Offre sélectionnée
              </CardTitle>
              <CardDescription>
                Le montant dépend de la zone choisie ci-dessous.
              </CardDescription>
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
                <Link to="/creer-entreprise/sci">Changer d’offre</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {getStepIcon(index + 1)}
                  </div>
                  <div className="text-center mt-2">
                    <p
                      className={`text-xs font-medium ${
                        isActive ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {steps[index].title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
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

              <CardContent className="space-y-6">{renderStep()}</CardContent>
            </Card>

            <div className="flex justify-between mt-8">
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
                  className="flex items-center bg-red-600 hover:bg-red-700"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Soumettre la demande
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SciCreationForm;
