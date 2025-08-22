import React, { useMemo, useState } from "react";
import Header from "@/components/Header";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Users,
  FileCheck,
  CreditCard,
  Calendar,
  Shield,
  Scale,
  Gavel,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { submitContractRequest } from "@/services/redactionContrat";

const formSchema = z.object({
  // Partie 1
  partie1Nom: z.string().min(2, "Le nom est requis"),
  partie1Adresse: z.string().min(5, "L'adresse est requise"),
  partie1Identification: z
    .string()
    .min(2, "Le numéro d'identification est requis"),
  partie1Representant: z.string().optional(),
  partie1Coordonnees: z.string().min(10, "Les coordonnées sont requises"),

  // Partie 2
  partie2Nom: z.string().min(2, "Le nom est requis"),
  partie2Adresse: z.string().min(5, "L'adresse est requise"),
  partie2Identification: z
    .string()
    .min(2, "Le numéro d'identification est requis"),
  partie2Representant: z.string().optional(),
  partie2Coordonnees: z.string().min(10, "Les coordonnées sont requises"),

  // Objet du contrat
  objetContrat: z.string().min(10, "L'objet du contrat doit être décrit"),

  // Obligations
  obligationsPartie1: z
    .string()
    .min(10, "Les obligations de la partie 1 sont requises"),
  obligationsPartie2: z
    .string()
    .min(10, "Les obligations de la partie 2 sont requises"),

  // Conditions financières
  montant: z.string().min(1, "Le montant est requis"),
  modalitesPaiement: z
    .string()
    .min(5, "Les modalités de paiement sont requises"),
  penalitesRetard: z.string().optional(),

  // Durée et résiliation
  dateDebut: z.string().min(1, "La date de début est requise"),
  dureeContrat: z.string().min(1, "La durée du contrat est requise"),
  conditionsResiliation: z
    .string()
    .min(5, "Les conditions de résiliation sont requises"),

  // Confidentialité
  confidentialite: z.enum(["oui", "non"]),
  clausesConfidentialite: z.string().optional(),
  proprieteIntellectuelle: z.enum(["oui", "non"]),
  modalitesPI: z.string().optional(),

  // Garanties
  garanties: z.string().min(5, "Les garanties sont requises"),
  responsabilite: z.string().optional(),

  // Droit applicable
  droitApplicable: z.string().min(2, "Le droit applicable est requis"),
  reglementLitiges: z
    .array(z.string())
    .min(1, "Au moins un mode de règlement est requis"),
});

type FormData = z.infer<typeof formSchema>;

const RedactionContratForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();

  // Détection auth (remplace si tu as un vrai store)
  const isAuthenticated = !!localStorage.getItem("access_token");

  // Offre passée via state OU query
  const selectedOfferFromState = (location.state as any)?.offer;
  const selectedOffer = useMemo(() => {
    if (selectedOfferFromState) return selectedOfferFromState;
    const id = search.get("offer_id") || search.get("offer");
    const title = search.get("offer_name");
    return id || title ? { id, title, slug: search.get("offer") } : null;
  }, [location.state, search]);

  const [currentStep, setCurrentStep] = useState(1);
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

  const { isSubmitting } = form.formState;

  const steps = [
    { id: 1, title: "Identification des parties", icon: Users },
    { id: 2, title: "Objet du contrat", icon: FileText },
    { id: 3, title: "Obligations des parties", icon: FileCheck },
    { id: 4, title: "Conditions financières", icon: CreditCard },
    { id: 5, title: "Durée et résiliation", icon: Calendar },
    { id: 6, title: "Confidentialité", icon: Shield },
    { id: 7, title: "Garanties", icon: Scale },
    { id: 8, title: "Droit applicable", icon: Gavel },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    if (files.length) toast.success(`${files.length} document(s) ajouté(s)`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("Document supprimé");
  };

  const nextStep = async () => {
    // Valide la step courante avant de passer à la suivante
    const valid = await form.trigger();
    if (!valid) return;
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        // Ajouts méta côté backend si besoin
        selected_offer_id: selectedOffer?.id ?? null,
        selected_offer_slug: selectedOffer?.slug ?? null,
        selected_offer_title: selectedOffer?.title ?? null,
      };
      await submitContractRequest(payload, uploadedFiles, {
        id: selectedOffer?.id,
        title: selectedOffer?.title,
      });

      toast.success("Demande de contrat envoyée avec succès !");
      navigate("/", { replace: true });
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Erreur lors de l’envoi"
      );
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Partie 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-900">Partie 1</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    [
                      "partie1Nom",
                      "Nom et Prénoms / Raison sociale",
                      "Ex: LAWRY SARL ou Jean Dupont",
                      "text",
                    ],
                    [
                      "partie1Adresse",
                      "Adresse",
                      "Adresse complète",
                      "textarea",
                    ],
                    [
                      "partie1Identification",
                      "N° d'identification (RCCM, NCC, CNI, Passeport)",
                      "Ex: RCCM CI-ABJ-2024-B-123456",
                      "text",
                    ],
                    [
                      "partie1Representant",
                      "Représentant légal (si personne morale)",
                      "Nom du représentant",
                      "text",
                    ],
                    [
                      "partie1Coordonnees",
                      "Coordonnées (téléphone/email)",
                      "Ex: +225 01 23 45 67 89 / email@example.com",
                      "text",
                    ],
                  ].map(([name, label, placeholder, kind]) => (
                    <FormField
                      key={name as string}
                      control={form.control}
                      name={name as keyof FormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label as string}</FormLabel>
                          <FormControl>
                            {kind === "textarea" ? (
                              <Textarea
                                placeholder={placeholder as string}
                                disabled={!isAuthenticated || isSubmitting}
                                {...field}
                              />
                            ) : (
                              <Input
                                placeholder={placeholder as string}
                                disabled={!isAuthenticated || isSubmitting}
                                {...field}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Partie 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-900">Partie 2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    [
                      "partie2Nom",
                      "Nom et Prénoms / Raison sociale",
                      "Ex: ACME SA ou Marie Martin",
                      "text",
                    ],
                    [
                      "partie2Adresse",
                      "Adresse",
                      "Adresse complète",
                      "textarea",
                    ],
                    [
                      "partie2Identification",
                      "N° d'identification (RCCM, NCC, CNI, Passeport)",
                      "Ex: RCCM CI-ABJ-2024-B-654321",
                      "text",
                    ],
                    [
                      "partie2Representant",
                      "Représentant légal (si personne morale)",
                      "Nom du représentant",
                      "text",
                    ],
                    [
                      "partie2Coordonnees",
                      "Coordonnées (téléphone/email)",
                      "Ex: +225 01 23 45 67 89 / email@example.com",
                      "text",
                    ],
                  ].map(([name, label, placeholder, kind]) => (
                    <FormField
                      key={name as string}
                      control={form.control}
                      name={name as keyof FormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label as string}</FormLabel>
                          <FormControl>
                            {kind === "textarea" ? (
                              <Textarea
                                placeholder={placeholder as string}
                                disabled={!isAuthenticated || isSubmitting}
                                {...field}
                              />
                            ) : (
                              <Input
                                placeholder={placeholder as string}
                                disabled={!isAuthenticated || isSubmitting}
                                {...field}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
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
                      placeholder="Décrivez clairement l'objet du contrat…"
                      rows={6}
                      disabled={!isAuthenticated || isSubmitting}
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
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="obligationsPartie1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obligations de la Partie 1</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="…"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="obligationsPartie2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obligations de la Partie 2</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="…"
                      disabled={!isAuthenticated || isSubmitting}
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
            <FormField
              control={form.control}
              name="montant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant ou tarif</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 1 000 000 FCFA"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modalitesPaiement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modalités de paiement</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="…"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
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
                    <Input
                      placeholder="Ex: 2% par jour de retard"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="dateDebut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
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
                    <Input
                      placeholder="Ex: 12 mois, 2 ans, durée indéterminée"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conditionsResiliation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions de résiliation anticipée</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="…"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="oui"
                          id="conf-oui"
                          disabled={!isAuthenticated || isSubmitting}
                        />
                        <Label htmlFor="conf-oui">Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="non"
                          id="conf-non"
                          disabled={!isAuthenticated || isSubmitting}
                        />
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
                        disabled={!isAuthenticated || isSubmitting}
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
                    Des droits de propriété intellectuelle sont-ils transférés ?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="oui"
                          id="pi-oui"
                          disabled={!isAuthenticated || isSubmitting}
                        />
                        <Label htmlFor="pi-oui">Oui</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="non"
                          id="pi-non"
                          disabled={!isAuthenticated || isSubmitting}
                        />
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
                    <FormLabel>
                      Modalités de transfert de propriété intellectuelle
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Précisez les modalités…"
                        disabled={!isAuthenticated || isSubmitting}
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
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="garanties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garanties offertes par les parties</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="…"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsabilite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Limitation ou exclusion de responsabilité (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="…"
                      disabled={!isAuthenticated || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        disabled={!isAuthenticated || isSubmitting}
                      >
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
                          const checked = field.value?.includes(item.id);
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
                                  disabled={!isAuthenticated || isSubmitting}
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

            {/* Documents */}
            <Card className="mt-8">
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
                    disabled={!isAuthenticated || isSubmitting}
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
                          disabled={isSubmitting}
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

      {/* Alerte "non connecté" */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Alert>
            <AlertTitle className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Vous n’êtes pas connecté
            </AlertTitle>
            <AlertDescription>
              Connectez-vous pour soumettre le formulaire.{" "}
              <Link to="/login" className="underline font-medium">
                Se connecter
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Bandeau offre verrouillée si sélectionnée */}
      {selectedOffer && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-900">
                <Lock className="h-5 w-5 mr-2" />
                Offre sélectionnée
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="text-sm text-gray-500">Type de contrat</div>
                <div className="text-base font-medium">
                  {selectedOffer.title ||
                    selectedOffer.slug ||
                    selectedOffer.id}
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/redaction-contrat">Changer d’offre</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress + Steps */}
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

      {/* Form */}
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

            {/* Navigation */}
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
                  disabled={isSubmitting || !isAuthenticated}
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-red-900 hover:bg-red-800 flex items-center"
                  disabled={isSubmitting || !isAuthenticated}
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
    </div>
  );
};

export default RedactionContratForm;
