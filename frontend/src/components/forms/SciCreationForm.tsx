import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Upload, Building, Users, FileText, UserCheck, CheckCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

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
  lieuCreation: z.string().min(1, "Le lieu de création est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  duree: z.string().min(1, "La durée est requise"),
  capitalSocial: z.string().min(1, "Le capital social est requis"),
  objetSocial: z.string().min(1, "L'objet social est requis"),
  
  // Associés (array)
  associes: z.array(associeSchema).min(1, "Au moins un associé est requis"),
  
  // Gérance
  gerantNom: z.string().min(1, "Le nom du gérant est requis"),
  gerantAdresse: z.string().min(1, "L'adresse du gérant est requise"),
  gerantTelephone: z.string().min(1, "Le téléphone du gérant est requis"),
  gerantEmail: z.string().email("Email invalide"),
  
  // Compte utilisateur
  userNom: z.string().min(1, "Le nom est requis"),
  userPrenom: z.string().min(1, "Le prénom est requis"),
  userEmail: z.string().email("Email invalide"),
  userTelephone: z.string().min(1, "Le téléphone est requis"),
  userMotDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const SciCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      denominationSociale: "",
      siegeSocial: "",
      lieuCreation: "",
      telephone: "",
      email: "",
      duree: "",
      capitalSocial: "",
      objetSocial: "",
      associes: [
        {
          nom: "",
          nationalite: "",
          adresse: "",
          apport: "",
        }
      ],
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
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "associes"
  });

  const handleFileUpload = (fileType: string, files: FileList | null) => {
    if (files) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: Array.from(files)
      }));
      toast({
        title: "Fichier uploadé",
        description: `${files.length} fichier(s) uploadé(s) pour ${fileType}`,
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Données du formulaire SCI:", values);
    console.log("Fichiers uploadés:", uploadedFiles);
    
    toast({
      title: "Demande envoyée avec succès!",
      description: "Votre demande de création de SCI a été soumise. Nous vous contacterons sous 48h.",
    });
  };

  const addAssocie = () => {
    append({
      nom: "",
      nationalite: "",
      adresse: "",
      apport: "",
    });
  };

  const removeAssocie = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

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

  const documentTypes = [
    { key: "statuts", label: "Projet de statuts", required: true },
    { key: "domiciliation", label: "Justificatif de domiciliation", required: true },
    { key: "depot_fonds", label: "Attestation de dépôt des fonds", required: true },
    { key: "liste_associes", label: "Liste des associés", required: true },
    { key: "declaration_apports", label: "Déclaration des apports", required: true },
  ];

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
              <FormField
                control={form.control}
                name="lieuCreation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de création *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ville de création" {...field} />
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
                    <Input placeholder="Adresse complète du siège social" {...field} />
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
                      <Input placeholder="+33 1 23 45 67 89" {...field} />
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
                      <Input type="email" placeholder="contact@sci.com" {...field} />
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
                    <FormLabel>Durée de la société (en années) *</FormLabel>
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
                    <FormLabel>Capital Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="1000 €" {...field} />
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
                    <Textarea placeholder="Acquisition, gestion, administration..." {...field} />
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
                      {index === 0 && <span className="text-red-500 ml-1">*</span>}
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
                            <Input placeholder="Française" {...field} />
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
                            <Input placeholder="500 €" {...field} />
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
                    <Input placeholder="Adresse complète du gérant" {...field} />
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
                      <Input placeholder="+33 1 23 45 67 89" {...field} />
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
                      <Input type="email" placeholder="gerant@email.com" {...field} />
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
              Veuillez joindre les documents suivants pour votre dossier de création de SCI :
            </p>
            {documentTypes.map((doc) => (
              <Card key={doc.key} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium">
                      {doc.label}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
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
                Pour finaliser votre demande et suivre l'avancement de votre dossier
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
                      <Input type="email" placeholder="votre@email.com" {...field} />
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
                      <Input placeholder="+33 1 23 45 67 89" {...field} />
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
                    <Input type="password" placeholder="Minimum 6 caractères" {...field} />
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Création de votre SCI
          </h1>
          <p className="text-gray-600">
            Remplissez ce formulaire pour démarrer la création de votre Société Civile Immobilière
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-xs font-medium ${isActive ? 'text-red-600' : 'text-gray-500'}`}>
                      {step.title}
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 mr-2 text-red-600" })}
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>
                  {steps[currentStep - 1].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderStep()}
              </CardContent>
            </Card>

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
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
