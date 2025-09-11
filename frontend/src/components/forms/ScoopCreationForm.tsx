// src/pages/forms/ScoopCreationForm.tsx
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Trash2,
  FileText,
  Users,
  Building,
  User,
  Shield,
  Check,
  X,
} from "lucide-react";

const formTypeSigle = "SCOOP";
const MIN_MEMBERS = 1 as const;

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

const scoopSchema = z
  .object({
    dateCreation: z.string().min(1, "La date de création est requise"),
    // Remarque: on force Abidjan/Interior via Select → chaîne non vide suffit
    lieuCreation: z.string().min(1, "Le lieu de création est requis"),
    denominationSociale: z
      .string()
      .min(1, "La dénomination sociale est requise"),
    siegeSocial: z.string().min(1, "Le siège social est requis"),
    telephone: z.string().min(1, "Le téléphone est requis"),
    email: z.string().email("Email invalide"),
    duree: z.string().min(1, "La durée est requise"),
    capitalSocial: z.string().min(1, "Le capital social est requis"),
    secteurActivite: z.string().min(1, "Le secteur d'activité est requis"),
    // ⚠️ On détend la validation ici pour pouvoir avancer : min(1)
    membres: z
      .array(
        z.object({
          nom: z.string().min(1, "Nom requis"),
          nationalite: z.string().min(1, "Nationalité requise"),
          adresse: z.string().min(1, "Adresse requise"),
          apport: z.string().min(1, "Montant d'apport requis"),
        })
      )
      .min(1, "Ajoutez au moins un membre pour continuer"),
    president: z.string().min(1, "Le président est requis"),
    vicePresident: z.string().min(1, "Le vice-président est requis"),
    secretaire: z.string().min(1, "Le secrétaire est requis"),
    tresorier: z.string().min(1, "Le trésorier est requis"),
    statutsFile: z.any().optional(),
    listeMembresFile: z.any().optional(),
    justificatifFile: z.any().optional(),
    createAccount: z.boolean().default(false),
    motDePasse: z.string().optional(),
    confirmMotDePasse: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.createAccount)
        return !!data.motDePasse && data.motDePasse.length >= 6;
      return true;
    },
    {
      message: "Le mot de passe doit contenir au moins 6 caractères",
      path: ["motDePasse"],
    }
  )
  .refine(
    (data) => {
      if (data.createAccount) return data.motDePasse === data.confirmMotDePasse;
      return true;
    },
    {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmMotDePasse"],
    }
  );

type ScoopFormData = z.infer<typeof scoopSchema>;

const ScoopCreationForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  // Steps & files
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: File | null;
  }>({
    statutsFile: null,
    listeMembresFile: null,
    justificatifFile: null,
  });

  // --- OFFRE sélectionnée / résolue
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
        // silencieux
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Form
  const form = useForm<ScoopFormData>({
    resolver: zodResolver(scoopSchema),
    defaultValues: {
      dateCreation: new Date().toISOString().split("T")[0],
      // on met rien par défaut pour forcer le choix
      membres: [
        { nom: "", nationalite: "", adresse: "", apport: "" },
        { nom: "", nationalite: "", adresse: "", apport: "" },
      ],
      createAccount: false,
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "membres",
  });

  const addMembre = () =>
    append({ nom: "", nationalite: "", adresse: "", apport: "" });
  const removeMembre = (index: number) => {
    if (fields.length > 1) remove(index);
  };

  // --- Prix/zone
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

  // --- Steps navigation
  const nextStep = async () => {
    // Validation progressive : on évite de bloquer sur les 7 membres
    let fieldsToValidate: (keyof ScoopFormData)[] = [];
    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "dateCreation",
          "lieuCreation",
          "denominationSociale",
          "siegeSocial",
          "telephone",
          "email",
          "duree",
          "capitalSocial",
          "secteurActivite",
        ];
        break;
      case 2:
        // on n'impose pas 7 ici ; juste au moins 1 pour avancer
        fieldsToValidate = ["membres"];
        break;
      case 3:
        fieldsToValidate = [
          "president",
          "vicePresident",
          "secretaire",
          "tresorier",
        ];
        break;
      case 4:
        fieldsToValidate = []; // documents facultatifs
        break;
    }
    const ok = await form.trigger(fieldsToValidate, { shouldFocus: true });
    if (ok) setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  // --- Files
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Le fichier est trop volumineux (max 10MB).",
        variant: "destructive",
      });
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erreur",
        description: "Type de fichier non autorisé. Utilisez PDF, DOC ou DOCX.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles((prev) => ({ ...prev, [fieldName]: file }));
    form.setValue(fieldName as any, file);
    toast({ title: "Fichier ajouté", description: file.name });
  };

  const removeFile = (fieldName: string) => {
    setUploadedFiles((prev) => ({ ...prev, [fieldName]: null }));
    form.setValue(fieldName as any, null);
    toast({ title: "Fichier supprimé" });
  };

  // --- Submit + paiement (montant piloté par l'OFFRE + ZONE)
  const onSubmit = async (data: ScoopFormData) => {
    // verrou final : 7 membres minimum pour soumettre
    if ((fields?.length || 0) < MIN_MEMBERS) {
      toast({
        variant: "destructive",
        title: "Membres insuffisants",
        description: `Ajoutez au moins ${MIN_MEMBERS} membres fondateurs (actuellement ${fields.length}).`,
      });
      setCurrentStep(2);
      return;
    }

    try {
      const fd = new FormData();

      // Type + variant
      fd.append("type", "creer-entreprise");
      fd.append("data[enterprise_type_sigle]", formTypeSigle);
      if (selectedOffer?.key) {
        fd.append("variant_key", `${formTypeSigle}:${selectedOffer.key}`);
      }

      // Données principales
      fd.append("data[requestDate]", data.dateCreation);
      fd.append("data[creationLocation]", data.lieuCreation); // 'abidjan' | 'interior'
      fd.append("data[companyName]", data.denominationSociale);
      fd.append("data[headquarters]", data.siegeSocial);
      fd.append("data[phone]", data.telephone);
      fd.append("data[email]", data.email);
      fd.append("data[duration]", data.duree);
      fd.append("data[capital]", data.capitalSocial);
      fd.append("data[activity]", data.secteurActivite);

      // Membres
      (data.membres || []).forEach((m, i) => {
        fd.append(`data[members][${i}][name]`, m.nom);
        fd.append(`data[members][${i}][nationality]`, m.nationalite);
        fd.append(`data[members][${i}][address]`, m.adresse);
        fd.append(`data[members][${i}][contribution]`, m.apport);
      });

      // Conseil d'admin
      fd.append("data[president]", data.president);
      fd.append("data[vicePresident]", data.vicePresident);
      fd.append("data[secretary]", data.secretaire);
      fd.append("data[treasurer]", data.tresorier);

      // Trace selected_preset (zone + price)
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

      // Prix normalisé (toujours l’offre + zone)
      const currency = selectedOffer?.currency || "XOF";
      fd.append("currency", currency);
      if (!isQuote && selectedAmount && selectedAmount > 0) {
        fd.append("data[price][mode]", "fixed");
        fd.append("data[price][amount]", String(selectedAmount));
        fd.append("data[price][currency]", currency);

        // duplications pour robustesse backend
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
      if (uploadedFiles.statutsFile)
        fd.append("files[attachments][]", uploadedFiles.statutsFile);
      if (uploadedFiles.listeMembresFile)
        fd.append("files[attachments][]", uploadedFiles.listeMembresFile);
      if (uploadedFiles.justificatifFile)
        fd.append("files[attachments][]", uploadedFiles.justificatifFile);

      // Création
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
              email: data.email,
              firstName: (data.president || "Client").split(" ")[0] || "Client",
              lastName:
                (data.president || "").split(" ").slice(1).join(" ") || "SCOOP",
              phone: data.telephone,
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
          // si init paiement échoue, on continue vers succès
        }
      }

      // Succès (sans paiement immédiat)
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
            "Vérifiez le slug « creer-entreprise » et la configuration serveur.",
        });
      }
      toast({ variant: "destructive", title: "Erreur", description: msg });
    }
  };

  // --- UI helpers
  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Building className="h-5 w-5" />;
      case 2:
        return <Users className="h-5 w-5" />;
      case 3:
        return <User className="h-5 w-5" />;
      case 4:
        return <FileText className="h-5 w-5" />;
      case 5:
        return <Shield className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // --- Render Steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-6 w-6 text-red-900" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateCreation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de création</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Select Zone */}
                <FormField
                  control={form.control}
                  name="lieuCreation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone / Lieu de création</FormLabel>
                      {isQuote ? (
                        <FormControl>
                          <Input
                            placeholder="Ville (ex: Abidjan, Yamoussoukro...)"
                            {...field}
                          />
                        </FormControl>
                      ) : (
                        <Select
                          onValueChange={(v) => field.onChange(v)}
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
                          Le tarif dépend de la zone choisie.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="denominationSociale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dénomination Sociale</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la coopérative" {...field} />
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
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@scoop.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="duree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (années)</FormLabel>
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
                      <FormLabel>Capital Social (FCFA)</FormLabel>
                      <FormControl>
                        <Input placeholder="1 000 000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secteurActivite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteur d'activité</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Agriculture, Commerce..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-red-900" />
                Membres Fondateurs
                <span className="text-sm text-gray-500">
                  ({fields.length} / {MIN_MEMBERS} minimum)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Membre {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMembre(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`membres.${index}.nom`}
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
                    <FormField
                      control={form.control}
                      name={`membres.${index}.nationalite`}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`membres.${index}.adresse`}
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
                      name={`membres.${index}.apport`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant de l'apport (FCFA)</FormLabel>
                          <FormControl>
                            <Input placeholder="100 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMembre}
                className="w-full border-dashed border-2 hover:bg-red-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </Button>

              {fields.length < MIN_MEMBERS && (
                <p className="text-sm text-amber-600">
                  Il faudra <strong>au moins {MIN_MEMBERS}</strong> membres pour
                  pouvoir soumettre.
                </p>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-red-900" />
                Conseil d'Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="president"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Président</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du président" {...field} />
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
                        <Input placeholder="Nom du vice-président" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="secretaire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secrétaire</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du secrétaire" {...field} />
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
                      <FormLabel>Trésorier</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du trésorier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-red-900" />
                Documents à Joindre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statuts File */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">
                  Statuts de la SCOOP *
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, "statutsFile")}
                    className="flex-1"
                  />
                  {uploadedFiles.statutsFile && (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        {uploadedFiles.statutsFile.name}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile("statutsFile")}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>

              {/* Liste des membres */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">
                  Liste des membres *
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, "listeMembresFile")}
                    className="flex-1"
                  />
                  {uploadedFiles.listeMembresFile && (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        {uploadedFiles.listeMembresFile.name}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile("listeMembresFile")}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>

              {/* Justificatif de domiciliation */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">
                  Justificatif de domiciliation *
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, "justificatifFile")}
                    className="flex-1"
                  />
                  {uploadedFiles.justificatifFile && (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        {uploadedFiles.justificatifFile.name}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile("justificatifFile")}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-900" />
                Création de Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="createAccount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Créer un compte pour suivre ma demande
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("createAccount") && (
                <div className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="motDePasse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Au moins 6 caractères"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmMotDePasse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const zoneLabel =
    zoneValue === "abidjan"
      ? "Abidjan"
      : zoneValue === "interior"
      ? "Intérieur"
      : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* BLOC Offre sélectionnée */}
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
                <div className="text-base font-medium">{zoneLabel}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Tarif</div>
                <div className="text-base font-semibold">{selectedDisplay}</div>
              </div>
              <Button asChild variant="outline">
                <Link to="/creer-entreprise/scoop">Changer d’offre</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep === step
                      ? "bg-red-900 text-white"
                      : currentStep > step
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {getStepIcon(step)}
                </div>
                <span className="text-xs mt-2 text-center">
                  {step === 1 && "Informations"}
                  {step === 2 && "Membres"}
                  {step === 3 && "Administration"}
                  {step === 4 && "Documents"}
                  {step === 5 && "Compte"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-200 h-2 rounded-full">
            <div
              className="bg-red-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  disabled={fields.length < MIN_MEMBERS}
                  title={
                    fields.length < MIN_MEMBERS
                      ? `Ajoutez encore ${
                          MIN_MEMBERS - fields.length
                        } membre(s)`
                      : undefined
                  }
                >
                  Soumettre la demande
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ScoopCreationForm;
