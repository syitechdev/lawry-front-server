import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Building, Users, FileText, Upload, UserPlus, Plus, X, File, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OfferSection from "./OfferSection";

const associateSchema = z.object({
  name: z.string().min(1, "Nom et prénom requis"),
  nationality: z.string().min(1, "Nationalité requise"),
  address: z.string().min(1, "Adresse requise"),
  contribution: z.string().min(1, "Montant de l'apport requis"),
});

const formSchema = z.object({
  // Informations générales
  requestDate: z.string().min(1, "Date requise"),
  creationLocation: z.string().min(1, "Lieu de création requis"),
  companyName: z.string().min(1, "Dénomination sociale requise"),
  headquarters: z.string().min(1, "Siège social requis"),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  duration: z.string().min(1, "Durée requise"),
  capital: z.string().min(1, "Capital social requis"),
  activity: z.string().min(1, "Activité principale requise"),
  
  // Associés
  associates: z.array(associateSchema).min(1, "Au moins un associé requis"),
  
  // Gérance
  managerName: z.string().min(1, "Nom et prénom du gérant requis"),
  managerAddress: z.string().min(1, "Adresse du gérant requise"),
  managerPhone: z.string().min(1, "Téléphone du gérant requis"),
  managerEmail: z.string().email("Email du gérant invalide"),
  
  // Modalités
  decisionMode: z.enum(["assembly", "unanimous"]),
  managementOrgan: z.enum(["single", "college"]),
  
  // Compte utilisateur
  userFirstName: z.string().min(1, "Prénom requis"),
  userLastName: z.string().min(1, "Nom requis"),
  userEmail: z.string().email("Email invalide"),
  userPassword: z.string().min(6, "Mot de passe d'au moins 6 caractères"),
});

type FormData = z.infer<typeof formSchema>;

const SarlCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const totalSteps = 6;
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestDate: new Date().toISOString().split('T')[0],
      decisionMode: "assembly",
      managementOrgan: "single",
      associates: [{ name: "", nationality: "", address: "", contribution: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "associates",
  });

  // Watch capital and location for dynamic offers
  const watchedCapital = form.watch("capital");
  const watchedLocation = form.watch("creationLocation");

  const handleFileUpload = (documentType: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: [...(prev[documentType] || []), ...fileArray]
      }));
      toast({
        title: "Fichier(s) ajouté(s)",
        description: `${fileArray.length} fichier(s) ajouté(s) pour ${documentType}`,
      });
    }
  };

  const removeFile = (documentType: string, fileIndex: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: prev[documentType]?.filter((_, index) => index !== fileIndex) || []
    }));
  };

  const onSubmit = (data: FormData) => {
    console.log("Formulaire SARL soumis:", data);
    console.log("Fichiers uploadés:", uploadedFiles);
    toast({
      title: "Demande de création SARL envoyée",
      description: "Nous traiterons votre demande dans les plus brefs délais.",
    });
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["requestDate", "creationLocation"];
      case 2:
        return ["companyName", "headquarters", "phone", "email", "duration", "capital", "activity"];
      case 3:
        return ["associates"];
      case 4:
        return ["managerName", "managerAddress", "managerPhone", "managerEmail"];
      case 5:
        return [];
      case 6:
        return ["userFirstName", "userLastName", "userEmail", "userPassword"];
      default:
        return [];
    }
  };

  const getStepTitle = (step: number) => {
    const titles = [
      "Informations de base",
      "Informations sur la société",
      "Associés",
      "Gérance",
      "Documents à joindre",
      "Création de votre compte"
    ];
    return titles[step - 1];
  };

  const progress = (currentStep / totalSteps) * 100;

  const documentTypes = [
    { key: "statuts", label: "Projet de statuts", required: true },
    { key: "souscriptions", label: "Déclaration des souscriptions et libérations", required: true },
    { key: "associes", label: "Liste des associés", required: true },
    { key: "domiciliation", label: "Justificatif de domiciliation", required: true },
    { key: "depot_fonds", label: "Attestation de dépôt des fonds", required: true }
  ];

  const addAssociate = () => {
    append({ name: "", nationality: "", address: "", contribution: "" });
  };

  const removeAssociate = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Création d'une SARL</h1>
          <span className="text-sm text-gray-500">Étape {currentStep} sur {totalSteps}</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <FileText className="h-5 w-5" />}
            {currentStep === 2 && <Building className="h-5 w-5" />}
            {currentStep === 3 && <Users className="h-5 w-5" />}
            {currentStep === 4 && <UserPlus className="h-5 w-5" />}
            {currentStep === 5 && <Upload className="h-5 w-5" />}
            {currentStep === 6 && <UserPlus className="h-5 w-5" />}
            {getStepTitle(currentStep)}
          </CardTitle>
          <CardDescription>
            Complétez les informations demandées pour cette étape
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Étape 1: Informations de base */}
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
                        <FormControl>
                          <Input placeholder="Ville où sera créée la société" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Étape 2: Informations générales sur la société */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dénomination Sociale</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de votre société" {...field} />
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
                          <Textarea placeholder="Adresse complète du siège social" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@societe.com" {...field} />
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
                          <FormLabel>Durée de la société (en années)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="99" {...field} />
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
                        <FormLabel>Activité principale / Objet social</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Décrivez l'activité principale de votre société" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Section d'offres dynamiques */}
                  {watchedCapital && (
                    <OfferSection 
                      capital={watchedCapital} 
                      companyType="SARL" 
                      location={watchedLocation}
                    />
                  )}
                </div>
              )}

              {/* Étape 3: Associés */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Associés de la société</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAssociate}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un associé
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 relative">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold">Associé {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAssociate(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`associates.${index}.name`}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`associates.${index}.nationality`}
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
                            name={`associates.${index}.contribution`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Montant de l'apport (FCFA)</FormLabel>
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
                          name={`associates.${index}.address`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Adresse complète" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Étape 4: Gérance */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom et Prénom du Gérant</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom complet du gérant" {...field} />
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
                          <Textarea placeholder="Adresse complète" {...field} />
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
                            <Input placeholder="+225 XX XX XX XX" {...field} />
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
                            <Input type="email" placeholder="gerant@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Étape 5: Documents à joindre */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Modalités de Fonctionnement</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="decisionMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mode de décision</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="assembly" id="assembly" />
                                  <Label htmlFor="assembly">Assemblée des associés</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="unanimous" id="unanimous" />
                                  <Label htmlFor="unanimous">Décision unanime des associés</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="managementOrgan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organe de gestion</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="single" id="single" />
                                  <Label htmlFor="single">Gérant unique</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="college" id="college" />
                                  <Label htmlFor="college">Collège de gérance</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Documents à Joindre</h3>
                    <div className="space-y-4">
                      {documentTypes.map((docType) => (
                        <div key={docType.key} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{docType.label}</span>
                              {docType.required && <span className="text-red-500 text-sm">*</span>}
                            </div>
                            {uploadedFiles[docType.key]?.length > 0 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" />
                                <span className="text-sm">{uploadedFiles[docType.key].length} fichier(s)</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(docType.key, e.target.files)}
                              className="cursor-pointer"
                            />
                            
                            {uploadedFiles[docType.key] && uploadedFiles[docType.key].length > 0 && (
                              <div className="space-y-1 mt-2">
                                {uploadedFiles[docType.key].map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                    <span className="truncate">{file.name}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(docType.key, index)}
                                      className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Formats acceptés :</strong> PDF, DOC, DOCX, JPG, JPEG, PNG
                      </p>
                      <p className="text-sm text-blue-800 mt-1">
                        Vous pouvez joindre plusieurs fichiers pour chaque type de document.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 6: Création de compte */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Créez votre compte LAWRY</h3>
                    <p className="text-gray-600">Pour suivre votre demande et accéder à nos services</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="userLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Minimum 6 caractères" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" className="bg-red-900 hover:bg-red-800">
                    Créer ma SARL
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SarlCreationForm;
