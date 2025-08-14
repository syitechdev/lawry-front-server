
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const modificationSchema = z.object({
  requestDate: z.string().min(1, "Date de demande requise"),
  rccmNumber: z.string().min(1, "Numéro RCCM requis"),
  companyName: z.string().min(1, "Raison sociale requise"),
  legalForm: z.string().min(1, "Forme juridique requise"),
  address: z.string().min(1, "Adresse requise"),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  currentCapital: z.string().min(1, "Capital social actuel requis"),
  legalRepresentative: z.string().min(1, "Représentant légal requis"),
  position: z.string().min(1, "Fonction requise"),
  modificationReasons: z.array(z.string()).min(1, "Au moins un motif requis"),
  otherReason: z.string().optional(),
  modificationDescription: z.string().min(1, "Description requise"),
  newCompanyName: z.string().optional(),
  newAddress: z.string().optional(),
  newCapital: z.string().optional(),
  newBusinessObject: z.string().optional(),
  statutoryChanges: z.string().optional(),
  additionalInfo: z.string().optional(),
  signatureName: z.string().min(1, "Nom et prénom requis"),
  signaturePosition: z.string().min(1, "Fonction requise"),
  signatureDate: z.string().min(1, "Date requise"),
});

type ModificationFormData = z.infer<typeof modificationSchema>;

const SocietyModificationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const { toast } = useToast();

  const form = useForm<ModificationFormData>({
    resolver: zodResolver(modificationSchema),
    defaultValues: {
      requestDate: new Date().toISOString().split('T')[0],
      signatureDate: new Date().toISOString().split('T')[0],
      modificationReasons: [],
    },
  });

  const totalSteps = 6;

  const modificationReasonOptions = [
    { id: "denomination", label: "Modification de la dénomination sociale" },
    { id: "object", label: "Modification de l'objet social" },
    { id: "address", label: "Transfert du siège social" },
    { id: "capital", label: "Modification du capital social" },
    { id: "form", label: "Changement de forme juridique" },
    { id: "management", label: "Nomination ou révocation de dirigeants" },
    { id: "merger", label: "Fusion ou scission" },
    { id: "statutes", label: "Modification des statuts" },
    { id: "other", label: "Autre (précisez)" },
  ];

  const documentTypes = [
    { id: "modifiedStatutes", label: "Copie des statuts modifiés" },
    { id: "assemblyMinutes", label: "Procès-verbal de l'assemblée générale extraordinaire" },
    { id: "addressProof", label: "Justificatif de l'adresse du nouveau siège" },
    { id: "capitalAttestation", label: "Attestation de souscription et libération du capital" },
    { id: "identityDocs", label: "Pièces d'identité des nouveaux dirigeants" },
    { id: "declaration", label: "Déclaration sur l'honneur des nouveaux dirigeants" },
    { id: "other", label: "Autres documents" },
  ];

  const legalForms = [
    "Entreprise individuelle", "SARL", "SARLU", "SAS", "SASU", 
    "SA", "SAU", "ONG", "SCI", "Association", "Fondation", "SCOOP"
  ];

  const handleFileUpload = (documentType: string, file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: "Le fichier ne peut pas dépasser 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));

    toast({
      title: "Succès",
      description: `Document "${file.name}" téléchargé avec succès`,
    });
  };

  const removeFile = (documentType: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[documentType];
      return newFiles;
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ModificationFormData) => {
    console.log("Données du formulaire:", data);
    console.log("Fichiers téléchargés:", uploadedFiles);
    
    toast({
      title: "Demande de modification soumise",
      description: "Votre demande de modification de société a été envoyée avec succès.",
    });
    
    setIsOpen(false);
    setCurrentStep(1);
    form.reset();
    setUploadedFiles({});
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Informations de base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="rccmNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'immatriculation (RCCM)</FormLabel>
                    <FormControl>
                      <Input placeholder="CI-ABJ-XXXX-XXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Informations Générales de la Société
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison sociale</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalForm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forme juridique</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la forme juridique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {legalForms.map((form) => (
                          <SelectItem key={form} value={form}>
                            {form}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Adresse du siège social</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCapital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capital social actuel</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="legalRepresentative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Représentant légal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fonction</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Motif de la Demande de Modification
            </h3>
            <FormField
              control={form.control}
              name="modificationReasons"
              render={() => (
                <FormItem>
                  <FormLabel>Sélectionnez les motifs de modification :</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modificationReasonOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="modificationReasons"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option.id])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== option.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("modificationReasons")?.includes("other") && (
              <FormField
                control={form.control}
                name="otherReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Précisez l'autre motif :</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Détails de la Modification Demandée
            </h3>
            <FormField
              control={form.control}
              name="modificationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description précise de la modification</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="newCompanyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouvelle dénomination sociale (si applicable)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newCapital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau capital social (si applicable)</FormLabel>
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
              name="newAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouvelle adresse du siège social (si applicable)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newBusinessObject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouvel objet social (si applicable)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statutoryChanges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Changements statutaires (précisez)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Documents à Joindre
            </h3>
            <div className="space-y-4">
              {documentTypes.map((docType) => (
                <Card key={docType.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{docType.label}</h4>
                      {uploadedFiles[docType.id] ? (
                        <div className="flex items-center mt-2 text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">{uploadedFiles[docType.id].name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(docType.id)}
                            className="ml-2 text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">Aucun fichier sélectionné</p>
                      )}
                    </div>
                    <div className="ml-4">
                      <input
                        type="file"
                        id={`file-${docType.id}`}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(docType.id, file);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`file-${docType.id}`)?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadedFiles[docType.id] ? 'Remplacer' : 'Choisir'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Formats acceptés :</p>
                  <p>PDF, DOC, DOCX, JPG, JPEG, PNG (taille max: 10MB par fichier)</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Informations Complémentaires et Signature
            </h3>
            
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informations complémentaires (le cas échéant)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-4">Engagement et Signature</h4>
              <p className="text-sm text-gray-700 mb-4">
                Je soussigné(e), représentant légal de la société, certifie l'exactitude des informations 
                fournies dans ce formulaire et m'engage à respecter les dispositions légales relatives 
                à la modification de société.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="signatureName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom et prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="signaturePosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonction</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="signatureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Modification de Société
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Vous avez déjà une société et souhaitez la modifier ? 
            Utilisez notre formulaire de demande de modification.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-900 hover:bg-gray-100 text-lg px-8 py-3 hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={() => setIsOpen(true)}
          >
            <FileText className="mr-2 h-5 w-5" />
            Demander une modification
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b z-10 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Formulaire de Demande de Modification de Société
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setCurrentStep(1);
                form.reset();
                setUploadedFiles({});
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex justify-between mt-4">
            <p className="text-sm text-gray-600">Étape {currentStep} sur {totalSteps}</p>
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded ${
                    i + 1 <= currentStep ? 'bg-blue-900' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} className="bg-blue-900 hover:bg-blue-800">
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
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

export default SocietyModificationForm;
