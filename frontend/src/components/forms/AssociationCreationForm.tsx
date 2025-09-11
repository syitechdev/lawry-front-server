// src/pages/forms/AssociationCreationForm.tsx
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

import Header from "@/components/Header";
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
import { Label } from "@/components/ui/label";
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
  X,
  BadgePercent,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

type PricingMode = "fixed" | "from" | "quote";
/** ⚠️ adapte ce sigle si besoin pour ton backend */
const formTypeSigle = "ASSO";

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

type SelectedOffer = {
  key: string;
  title: string;
  pricing_mode: PricingMode;
  price: number | null;
  currency: string;
} | null;

// ---------------- Validation
const fondateurSchema = z.object({
  nom: z.string().min(1, "Le nom du fondateur est requis"),
  nationalite: z.string().min(1, "La nationalité est requise"),
  adresse: z.string().min(1, "L'adresse est requise"),
});

const formSchema = z.object({
  // Informations générales
  dateCreation: z.string().min(1, "La date de création est requise"),
  /** Zone utilisée pour le tarif (Abidjan/Intérieur) */
  zone: z.enum(["abidjan", "interior"], {
    required_error: "Choisissez la zone (Abidjan / Intérieur)",
  }),
  lieuCreation: z.string().min(1, "Le lieu de création est requis"),
  nomAssociation: z.string().min(1, "Le nom de l'association est requis"),
  siegeSocial: z.string().min(1, "Le siège social est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  dureeAssociation: z.string().min(1, "La durée est requise"),
  objetPrincipal: z.string().min(1, "L'objet principal est requis"),
  domainesIntervention: z
    .string()
    .min(1, "Les domaines d'intervention sont requis"),

  // Membres fondateurs (array)
  fondateurs: z
    .array(fondateurSchema)
    .min(2, "Au moins deux fondateurs sont requis"),

  // Bureau/Conseil d'administration
  president: z.string().min(1, "Le nom du président est requis"),
  vicePresident: z.string().optional(),
  secretaireGeneral: z
    .string()
    .min(1, "Le nom du secrétaire général est requis"),
  tresorier: z.string().min(1, "Le nom du trésorier est requis"),

  // Compte utilisateur
  userNom: z.string().min(1, "Le nom est requis"),
  userPrenom: z.string().min(1, "Le prénom est requis"),
  userEmail: z.string().email("Email invalide"),
  userTelephone: z.string().min(1, "Le téléphone est requis"),
  userMotDePasse: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type FormData = z.infer<typeof formSchema>;

const AssociationCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  // ---------- Offre (via state ou ?offer / ?variant)
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

  // ---------- Form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateCreation: new Date().toISOString().split("T")[0],
      zone: undefined as any,
      lieuCreation: "",
      nomAssociation: "",
      siegeSocial: "",
      telephone: "",
      email: "",
      dureeAssociation: "",
      objetPrincipal: "",
      domainesIntervention: "",
      fondateurs: [
        { nom: "", nationalite: "", adresse: "" },
        { nom: "", nationalite: "", adresse: "" },
      ],
      president: "",
      vicePresident: "",
      secretaireGeneral: "",
      tresorier: "",
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
    name: "fondateurs",
  });

  // ---------- Tarifs par zone
  const zoneValue = form.watch("zone");
  const isQuote = selectedOffer?.pricing_mode === "quote";

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

  // ---------- Docs requis
  const documentTypes = [
    { key: "statuts", label: "Statuts de l'association", required: true },
    {
      key: "pv_assemblee",
      label: "Procès-verbal de l'Assemblée constitutive",
      required: true,
    },
    { key: "liste_membres", label: "Liste des membres", required: true },
    {
      key: "justificatif_domiciliation",
      label: "Justificatif de domiciliation",
      required: true,
    },
    { key: "plan_action", label: "Plan d'action annuel", required: true },
  ];

  const handleFileUpload = (fileType: string, files: FileList | null) => {
    if (!files?.length) return;
    setUploadedFiles((prev) => ({
      ...prev,
      [fileType]: Array.from(files),
    }));
    toast({
      title: "Fichier(s) ajouté(s)",
      description: `${files.length} fichier(s) pour ${fileType}`,
    });
  };

  // ---------- Validation step-by-step
  const fieldsForStep = (s: number): (keyof FormData)[] => {
    switch (s) {
      case 1:
        return [
          "dateCreation",
          "zone",
          "lieuCreation",
          "nomAssociation",
          "siegeSocial",
          "telephone",
          "email",
          "dureeAssociation",
          "objetPrincipal",
          "domainesIntervention",
        ];
      case 2:
        return ["fondateurs"];
      case 3:
        return ["president", "secretaireGeneral", "tresorier"];
      case 4:
        return []; // pas de champs requis par zod ici
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
    const ok = await form.trigger(fieldsForStep(currentStep), {
      shouldFocus: true,
    });
    if (ok) setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // ---------- Submit + paiement
  const onSubmit = async (values: FormData) => {
    try {
      const fd = new FormData();

      // Type + variante
      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      if (selectedOffer?.key)
        fd.append("variant_key", `${formTypeSigle}:${selectedOffer.key}`);

      // Données de base
      fd.append("data[requestDate]", values.dateCreation);
      fd.append("data[creationLocation]", values.zone); // pour la tarification
      fd.append("data[companyName]", values.nomAssociation);
      fd.append("data[headquarters]", values.siegeSocial);
      fd.append("data[phone]", values.telephone);
      fd.append("data[email]", values.email);
      fd.append("data[duration]", values.dureeAssociation);
      fd.append("data[activity]", values.objetPrincipal);
      fd.append(
        "data[fields][domainesIntervention]",
        values.domainesIntervention
      );
      fd.append("data[fields][lieuCreation]", values.lieuCreation);

      // Fondateurs
      (values.fondateurs || []).forEach((f, i) => {
        fd.append(`data[founders][${i}][name]`, f.nom);
        fd.append(`data[founders][${i}][nationality]`, f.nationalite);
        fd.append(`data[founders][${i}][address]`, f.adresse);
      });

      // Bureau
      fd.append("data[board][president]", values.president);
      if (values.vicePresident)
        fd.append("data[board][vicePresident]", values.vicePresident);
      fd.append("data[board][secretaryGeneral]", values.secretaireGeneral);
      fd.append("data[board][treasurer]", values.tresorier);

      // Sélection tarifaire (pour BO + paiement)
      const currency = selectedOffer?.currency || "XOF";
      if (selectedOffer) {
        fd.append("data[selected_preset][label]", selectedOffer.title);
        fd.append(
          "data[selected_preset][pricing_mode]",
          selectedOffer.pricing_mode
        );
        fd.append("data[selected_preset][currency]", currency);

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

      // Normalisation PRIX (compat paiement)
      fd.append("currency", currency);
      if (!isQuote && selectedAmount && selectedAmount > 0) {
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(selectedAmount));
        fd.append("data[price][currency]", currency);

        // duplications pour robustesse côté back
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

      // Création
      const { data: res } = await http.post("/demandes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdId: number | null = res?.demande?.id ?? res?.id ?? null;
      const ref: string | null = res?.demande?.ref ?? res?.ref ?? null;

      // Paiement
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
              firstName: values.userPrenom || "Client",
              lastName: values.userNom || "ASSO",
              phone: values.userTelephone || values.telephone,
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
          // si init paiement échoue, on continue en succès standard
        }
      }

      toast({
        title: "Demande envoyée",
        description: ref
          ? `Référence: ${ref}`
          : "Votre demande d'association a été enregistrée.",
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

  const addFondateur = () => {
    append({ nom: "", nationalite: "", adresse: "" });
  };

  const removeFondateur = (index: number) => {
    if (fields.length > 2) remove(index);
  };

  // ------------------ Rendu
  const steps = [
    {
      title: "Informations Générales",
      description: "Renseignements sur l'association",
      icon: Building,
    },
    {
      title: "Membres Fondateurs",
      description: "Informations des fondateurs",
      icon: Users,
    },
    {
      title: "Bureau",
      description: "Conseil d'administration",
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dateCreation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de la demande *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Zone = tarif */}
              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone (tarif) *</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={
                          field.value === "abidjan" ? "default" : "outline"
                        }
                        onClick={() => field.onChange("abidjan")}
                      >
                        Abidjan
                      </Button>
                      <Button
                        type="button"
                        variant={
                          field.value === "interior" ? "default" : "outline"
                        }
                        onClick={() => field.onChange("interior")}
                      >
                        Intérieur
                      </Button>
                    </div>
                    {!isQuote && !selectedAmount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Choisissez la zone pour déterminer le tarif appliqué.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lieuCreation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville de création *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ville (ex. Abidjan)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nomAssociation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'Association *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom complet de l'association"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        placeholder="contact@association.org"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dureeAssociation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée de l'Association *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Illimitée / nombre d'années"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objetPrincipal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet / But principal *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez l'objet principal..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domainesIntervention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domaine(s) d'intervention *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez les domaines d'intervention..."
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
              <h3 className="text-lg font-semibold text-red-900">
                Membres Fondateurs *
              </h3>
              <Button
                type="button"
                onClick={addFondateur}
                variant="outline"
                size="sm"
                className="flex items-center border-red-200 text-red-600 hover:bg-red-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un fondateur
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Fondateur {index + 1}{" "}
                      <span className="text-red-500">*</span>
                    </CardTitle>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => removeFondateur(index)}
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
                    name={`fondateurs.${index}.nom`}
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
                  <FormField
                    control={form.control}
                    name={`fondateurs.${index}.nationalite`}
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
                    name={`fondateurs.${index}.adresse`}
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
              name="president"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Président *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom et Prénom du Président"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vicePresident"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vice-Président</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom et Prénom du Vice-Président (optionnel)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secretaireGeneral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secrétaire Général *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom et Prénom du Secrétaire Général"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tresorier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trésorier *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nom et Prénom du Trésorier"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-gray-600 mb-6">
              Veuillez joindre les documents suivants pour votre dossier :
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
                <div className="flex items-center gap-2">
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

                  {uploadedFiles[doc.key]?.length ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setUploadedFiles((p) => {
                          const cp = { ...p };
                          delete cp[doc.key];
                          return cp;
                        })
                      }
                      className="text-red-600"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Retirer
                    </Button>
                  ) : null}
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
                      <Input placeholder="+225 XX XX XX XX" {...field} />
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

            {/* Récap commande */}
            {selectedOffer && (
              <div className="bg-green-50 p-4 rounded-lg mt-2">
                <h4 className="font-semibold text-green-800 mb-2">
                  Récapitulatif
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>
                      Création d’une association — {selectedOffer.title}
                    </span>
                    <span className="font-semibold">{selectedDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zone</span>
                    <span className="font-semibold">
                      {zoneValue === "abidjan"
                        ? "Abidjan"
                        : zoneValue === "interior"
                        ? "Intérieur"
                        : "—"}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Total</span>
                    <span>{selectedDisplay}</span>
                  </div>
                </div>
              </div>
            )}
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
        {/* Bandeau offre sélectionnée */}
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
                <Link to="/creer-entreprise/association">Changer d’offre</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* En-tête + Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Création de votre Association
            </h1>
            <span className="text-sm text-gray-500">
              Étape {currentStep} sur {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
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

            {/* Navigation */}
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

              {currentStep < totalSteps ? (
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

export default AssociationCreationForm;
