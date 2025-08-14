
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, Plus, Trash2, Building, Users, FileText, UserCheck, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schéma de validation
const saSchema = z.object({
  // Informations générales
  denominationSociale: z.string().min(2, "La dénomination sociale est requise"),
  siegeSocial: z.string().min(10, "L'adresse du siège social est requise"),
  telephone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide"),
  dureeSociete: z.string().min(1, "La durée de la société est requise"),
  capitalSocial: z.string().min(1, "Le capital social est requis"),
  activitePrincipale: z.string().min(10, "L'activité principale est requise"),
  
  // Actionnaires
  actionnaires: z.array(z.object({
    nom: z.string().min(2, "Le nom est requis"),
    nationalite: z.string().min(2, "La nationalité est requise"),
    adresse: z.string().min(10, "L'adresse est requise"),
    nombreActions: z.string().min(1, "Le nombre d'actions est requis")
  })).min(2, "Au moins 2 actionnaires sont requis pour une SA"),
  
  // Gouvernance
  modeGouvernance: z.enum(["conseil_administration", "directoire"], {
    required_error: "Le mode de gouvernance est requis"
  }),
  presidentNom: z.string().min(2, "Le nom du président est requis"),
  presidentAdresse: z.string().min(10, "L'adresse du président est requise"),
  presidentTelephone: z.string().min(8, "Le téléphone du président est requis"),
  presidentEmail: z.string().email("Email invalide"),
  
  // Compte utilisateur
  motDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmerMotDePasse: z.string().min(6, "Confirmez le mot de passe")
}).refine((data) => data.motDePasse === data.confirmerMotDePasse, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmerMotDePasse"]
});

type SaFormData = z.infer<typeof saSchema>;

const SaCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const form = useForm<SaFormData>({
    resolver: zodResolver(saSchema),
    defaultValues: {
      actionnaires: [
        { nom: "", nationalite: "", adresse: "", nombreActions: "" },
        { nom: "", nationalite: "", adresse: "", nombreActions: "" }
      ]
    }
  });

  const { watch, setValue, getValues } = form;
  const actionnaires = watch("actionnaires");

  const addActionnaire = () => {
    const currentActionnaires = getValues("actionnaires");
    setValue("actionnaires", [...currentActionnaires, { nom: "", nationalite: "", adresse: "", nombreActions: "" }]);
  };

  const removeActionnaire = (index: number) => {
    const currentActionnaires = getValues("actionnaires");
    if (currentActionnaires.length > 2) {
      setValue("actionnaires", currentActionnaires.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [fileType]: file }));
    }
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

  const onSubmit = (data: SaFormData) => {
    console.log("Données du formulaire SA:", data);
    console.log("Fichiers téléchargés:", uploadedFiles);
    // Ici, vous pouvez traiter les données et les envoyer au serveur
  };

  const stepTitles = [
    "Informations générales",
    "Actionnaires fondateurs", 
    "Gouvernance",
    "Documents",
    "Création du compte"
  ];

  const stepIcons = [Building, Users, UserCheck, FileText, Mail];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-red-900">
              Création d'une SA - Société Anonyme
            </CardTitle>
            <div className="text-sm text-gray-500">
              Étape {currentStep} sur {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Navigation des étapes */}
      <div className="flex justify-between mb-8">
        {stepTitles.map((title, index) => {
          const StepIcon = stepIcons[index];
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          
          return (
            <div
              key={stepNumber}
              className={`flex flex-col items-center ${
                isActive ? 'text-red-900' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isActive ? 'bg-red-100 border-2 border-red-900' : 
                  isCompleted ? 'bg-green-100 border-2 border-green-600' : 
                  'bg-gray-100 border-2 border-gray-300'
                }`}
              >
                <StepIcon className="h-5 w-5" />
              </div>
              <span className="text-xs text-center font-medium">{title}</span>
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Étape 1: Informations générales */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="denominationSociale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dénomination Sociale *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de votre société" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                </div>

                <FormField
                  control={form.control}
                  name="siegeSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Siège Social *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Adresse complète du siège social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@entreprise.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dureeSociete"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée de la société (années) *</FormLabel>
                        <FormControl>
                          <Input placeholder="99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="capitalSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capital Social (FCFA) *</FormLabel>
                      <FormControl>
                        <Input placeholder="10 000 000 FCFA minimum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activitePrincipale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activité principale / Objet social *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Décrivez l'activité principale de votre société" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Étape 2: Actionnaires */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Actionnaires fondateurs
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addActionnaire}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {actionnaires.map((_, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Actionnaire {index + 1}</h4>
                      {actionnaires.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActionnaire(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`actionnaires.${index}.nom`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom et Prénom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom complet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`actionnaires.${index}.nationalite`}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name={`actionnaires.${index}.adresse`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Adresse complète" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`actionnaires.${index}.nombreActions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre d'actions *</FormLabel>
                            <FormControl>
                              <Input placeholder="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Étape 3: Gouvernance */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Conseil d'Administration ou Directoire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="modeGouvernance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode de gouvernance *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le mode de gouvernance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conseil_administration">Conseil d'Administration</SelectItem>
                          <SelectItem value="directoire">Directoire et Conseil de Surveillance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6">
                  <h4 className="font-semibold mb-4">
                    {watch("modeGouvernance") === "directoire" ? "Directeur Général" : "Président du Conseil"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="presidentNom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom et Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom complet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="presidentTelephone"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="presidentAdresse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Adresse complète" {...field} />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="president@entreprise.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 4: Documents */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Documents à joindre
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "statuts", label: "Projet de statuts", required: true },
                  { id: "souscriptions", label: "Déclaration des souscriptions et libérations", required: true },
                  { id: "actionnaires_liste", label: "Liste des actionnaires", required: true },
                  { id: "domiciliation", label: "Justificatif de domiciliation", required: true },
                  { id: "depot_fonds", label: "Attestation de dépôt des fonds", required: true }
                ].map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium">
                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                      </Label>
                      {uploadedFiles[doc.id] && (
                        <span className="text-green-600 text-sm">✓ Téléchargé</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) => handleFileUpload(e, doc.id)}
                        className="hidden"
                        id={`file-${doc.id}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                        className="flex items-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choisir un fichier
                      </Button>
                      {uploadedFiles[doc.id] && (
                        <span className="text-sm text-gray-600">
                          {uploadedFiles[doc.id].name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Étape 5: Création du compte */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Création de votre compte LAWRY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Créez votre compte pour suivre l'avancement de votre dossier et accéder à vos documents.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="motDePasse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Minimum 6 caractères" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmerMotDePasse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirmez votre mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-green-800 mb-2">Récapitulatif de votre commande</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Création d'une SA</span>
                      <span className="font-semibold">450 000 FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais d'accompagnement</span>
                      <span className="font-semibold">150 000 FCFA</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-green-800">
                      <span>Total</span>
                      <span>600 000 FCFA</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
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
              <Button type="button" onClick={nextStep} className="flex items-center bg-red-900 hover:bg-red-800">
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Créer ma SA
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SaCreationForm;
