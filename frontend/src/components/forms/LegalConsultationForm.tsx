
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User, Building, FileText, Scale, Clock, Upload, 
  ChevronRight, ChevronLeft, CheckCircle, AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";

const consultationSchema = z.object({
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
  
  // Objet de la demande
  legalDomain: z.enum([
    "droit_affaires", "droit_fiscal", "droit_societes", "droit_travail",
    "droit_immobilier", "droit_famille", "droit_penal", "droit_contrats",
    "droit_nouvelles_technologies", "autre"
  ]),
  otherLegalDomain: z.string().optional(),
  counselType: z.enum([
    "redaction_verification", "analyse_recommandations", "gestion_litiges",
    "assistance_precontentieuse", "avis_juridique", "autre"
  ]),
  otherCounselType: z.string().optional(),
  
  // Description détaillée
  factDescription: z.string().min(10, "Description des faits requise (minimum 10 caractères)"),
  legalQuestions: z.string().min(5, "Questions juridiques requises"),
  involvedParties: z.string().optional(),
  
  // Documents
  hasDocuments: z.boolean(),
  documentTypes: z.array(z.string()).optional(),
  otherDocuments: z.string().optional(),
  
  // Délai
  responseDeadline: z.enum(["48h", "5_jours", "a_convenir"]),
  
  // Consentements
  dataConsent: z.boolean().refine(val => val === true, "Consentement requis"),
  digitalConsent: z.boolean(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

const LegalConsultationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationFormData | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      clientType: "particulier",
      legalDomain: "droit_affaires",
      counselType: "avis_juridique",
      responseDeadline: "5_jours",
      hasDocuments: false,
      dataConsent: false,
      digitalConsent: false,
      documentTypes: [],
    },
  });

  const steps = [
    {
      id: 1,
      title: "Informations Client",
      icon: User,
      description: "Vos informations personnelles"
    },
    {
      id: 2,
      title: "Objet de la Demande",
      icon: Scale,
      description: "Type de conseil juridique"
    },
    {
      id: 3,
      title: "Description Détaillée",
      icon: FileText,
      description: "Situation et questions"
    },
    {
      id: 4,
      title: "Documents & Délai",
      icon: Upload,
      description: "Pièces jointes et urgence"
    },
    {
      id: 5,
      title: "Consentements",
      icon: CheckCircle,
      description: "Acceptation des conditions"
    }
  ];

  const consultationPricing = {
    "48h": { name: "Consultation Urgente (48h)", price: 75000 },
    "5_jours": { name: "Consultation Standard (5 jours)", price: 50000 },
    "a_convenir": { name: "Consultation Complexe (à convenir)", price: 60000 }
  };

  const clientTypeOptions = [
    { value: "particulier", label: "Particulier" },
    { value: "entreprise", label: "Entreprise / Société" },
    { value: "association", label: "Association" },
    { value: "autre", label: "Autre" }
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
    { value: "droit_nouvelles_technologies", label: "Droit des nouvelles technologies" },
    { value: "autre", label: "Autre" }
  ];

  const counselTypeOptions = [
    { value: "redaction_verification", label: "Rédaction / Vérification de documents juridiques" },
    { value: "analyse_recommandations", label: "Analyse de situation et recommandations" },
    { value: "gestion_litiges", label: "Gestion de litiges / Contentieux" },
    { value: "assistance_precontentieuse", label: "Assistance précontentieuse" },
    { value: "avis_juridique", label: "Avis juridique sur une question spécifique" },
    { value: "autre", label: "Autre" }
  ];

  const documentTypeOptions = [
    "Contrats",
    "Correspondances (emails, lettres)",
    "Jugements ou décisions administratives",
    "Relevés financiers",
    "Autres documents pertinents"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Fichiers ajoutés",
      description: `${files.length} fichier(s) ajouté(s) avec succès`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: ConsultationFormData) => {
    console.log("Données de consultation:", data);
    console.log("Fichiers joints:", uploadedFiles);
    
    setConsultationData(data);
    setShowPayment(true);
    
    toast({
      title: "Formulaire validé !",
      description: "Procédez maintenant au paiement pour finaliser votre demande.",
    });
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log("Paiement réussi pour la consultation:", paymentData);
    
    toast({
      title: "Demande de consultation confirmée !",
      description: "Votre demande a été enregistrée. Vous recevrez une réponse dans les délais convenus.",
    });
    
    // Reset form
    form.reset();
    setCurrentStep(1);
    setShowPayment(false);
    setConsultationData(null);
    setUploadedFiles([]);
  };

  if (showPayment && consultationData) {
    const selectedPricing = consultationPricing[consultationData.responseDeadline];
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <PaymentForm
          contractType={{
            id: consultationData.responseDeadline,
            name: selectedPricing.name,
            price: selectedPricing.price,
            description: `Consultation juridique en ${consultationData.legalDomain.replace('_', ' ')}`
          }}
          onPaymentSuccess={handlePaymentSuccess}
          contractData={consultationData}
        />
      </div>
    );
  }

  const selectedClientType = form.watch("clientType");
  const selectedLegalDomain = form.watch("legalDomain");
  const selectedCounselType = form.watch("counselType");
  const hasDocuments = form.watch("hasDocuments");
  const selectedDocumentTypes = form.watch("documentTypes") || [];
  const selectedDeadline = form.watch("responseDeadline");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id 
                ? 'bg-red-900 border-red-900 text-white' 
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-red-900' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current step info */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-gray-600">
          {steps[currentStep - 1].description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: Informations Client */}
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
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          {clientTypeOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <Label htmlFor={option.value}>{option.label}</Label>
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
                        <FormLabel>Nom de l'entreprise</FormLabel>
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
                        <FormLabel>Précisez le type de client</FormLabel>
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

          {/* Step 2: Objet de la Demande */}
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {legalDomainOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                        <FormLabel>Précisez le domaine juridique</FormLabel>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {counselTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                        <FormLabel>Précisez la nature du conseil</FormLabel>
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

          {/* Step 3: Description Détaillée */}
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
                      <FormLabel>Veuillez décrire précisément les faits *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="min-h-[120px]"
                          placeholder="Décrivez en détail la situation qui nécessite un conseil juridique..."
                        />
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
                        <Textarea 
                          {...field} 
                          className="min-h-[100px]"
                          placeholder="Quelles sont vos questions juridiques précises ?"
                        />
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
                      <FormLabel>Parties impliquées (noms et fonctions)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="min-h-[80px]"
                          placeholder="Listez les personnes ou entités impliquées..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Documents & Délai */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents Annexes & Délai Souhaité
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
                        <FormLabel>
                          J'ai des documents à joindre à ma demande
                        </FormLabel>
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
                          <FormLabel>Types de documents (cochez les cases appropriées)</FormLabel>
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
                                            ? field.onChange([...field.value || [], type])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== type)
                                              )
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

                    {selectedDocumentTypes.includes("Autres documents pertinents") && (
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
                            PDF, DOC, DOCX, JPG, PNG (max 10MB par fichier)
                          </span>
                        </label>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label>Fichiers sélectionnés:</Label>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
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

                <Separator />

                <FormField
                  control={form.control}
                  name="responseDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Délai Souhaité pour la Réponse *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="48h" id="48h" />
                            <Label htmlFor="48h">48 heures (Urgent) - 75 000 FCFA</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5_jours" id="5_jours" />
                            <Label htmlFor="5_jours">5 jours ouvrés - 50 000 FCFA</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="a_convenir" id="a_convenir" />
                            <Label htmlFor="a_convenir">À convenir selon la complexité - 60 000 FCFA</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedDeadline && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">
                      Récapitulatif de votre choix:
                    </h4>
                    <p className="text-red-800">
                      {consultationPricing[selectedDeadline].name} - {consultationPricing[selectedDeadline].price.toLocaleString()} FCFA
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Consentements */}
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
                    Je certifie que les informations fournies sont exactes et autorise le cabinet LAWRY 
                    à traiter ces informations de manière confidentielle dans le cadre de ma demande juridique.
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
                          J'accepte que mes données personnelles soient conservées pour le traitement de ma demande.
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
                          Consentement pour la communication digitale (via Legal Tech)
                        </FormLabel>
                        <p className="text-sm text-gray-600">
                          J'accepte de recevoir des communications par voie électronique.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Confidentialité garantie</h4>
                      <p className="text-sm text-green-700">
                        Toutes vos informations sont protégées par le secret professionnel et traitées 
                        de manière strictement confidentielle.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Finaliser la Demande
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LegalConsultationForm;
