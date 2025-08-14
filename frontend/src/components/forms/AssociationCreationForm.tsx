
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Upload, Building, Users, FileText, UserCheck, CheckCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const fondateurSchema = z.object({
  nom: z.string().min(1, "Le nom du fondateur est requis"),
  nationalite: z.string().min(1, "La nationalité est requise"),
  adresse: z.string().min(1, "L'adresse est requise"),
});

const formSchema = z.object({
  // Informations générales
  dateCreation: z.string().min(1, "La date de création est requise"),
  lieuCreation: z.string().min(1, "Le lieu de création est requis"),
  nomAssociation: z.string().min(1, "Le nom de l'association est requis"),
  siegeSocial: z.string().min(1, "Le siège social est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  dureeAssociation: z.string().min(1, "La durée est requise"),
  objetPrincipal: z.string().min(1, "L'objet principal est requis"),
  domainesIntervention: z.string().min(1, "Les domaines d'intervention sont requis"),
  
  // Membres fondateurs (array)
  fondateurs: z.array(fondateurSchema).min(2, "Au moins deux fondateurs sont requis"),
  
  // Bureau/Conseil d'administration
  president: z.string().min(1, "Le nom du président est requis"),
  vicePresident: z.string().optional(),
  secretaireGeneral: z.string().min(1, "Le nom du secrétaire général est requis"),
  tresorier: z.string().min(1, "Le nom du trésorier est requis"),
  
  // Compte utilisateur
  userNom: z.string().min(1, "Le nom est requis"),
  userPrenom: z.string().min(1, "Le prénom est requis"),
  userEmail: z.string().email("Email invalide"),
  userTelephone: z.string().min(1, "Le téléphone est requis"),
  userMotDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const AssociationCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({});
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateCreation: new Date().toISOString().split('T')[0],
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
        { nom: "", nationalite: "", adresse: "" }
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
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fondateurs"
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
    console.log("Données du formulaire Association:", values);
    console.log("Fichiers uploadés:", uploadedFiles);
    
    toast({
      title: "Demande envoyée avec succès!",
      description: "Votre demande de création d'association a été soumise. Nous vous contacterons sous 48h.",
    });
  };

  const addFondateur = () => {
    append({ nom: "", nationalite: "", adresse: "" });
  };

  const removeFondateur = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

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

  const documentTypes = [
    { key: "statuts", label: "Statuts de l'association", required: true },
    { key: "pv_assemblee", label: "Procès-verbal de l'Assemblée constitutive", required: true },
    { key: "liste_membres", label: "Liste des membres", required: true },
    { key: "justificatif_domiciliation", label: "Justificatif de domiciliation", required: true },
    { key: "plan_action", label: "Plan d'action annuel", required: true },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="nomAssociation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'Association *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom complet de l'association" {...field} />
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
                      <Input type="email" placeholder="contact@association.org" {...field} />
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
                    <Input placeholder="Durée illimitée ou nombre d'années" {...field} />
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
                    <Textarea placeholder="Décrivez l'objet principal de l'association..." {...field} />
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
                    <Textarea placeholder="Décrivez les domaines d'intervention..." {...field} />
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
              <h3 className="text-lg font-semibold text-red-900">Membres Fondateurs *</h3>
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
                      Fondateur {index + 1}
                      <span className="text-red-500 ml-1">*</span>
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
                          <Input placeholder="Française" {...field} />
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
                    <Input placeholder="Nom et Prénom du Président" {...field} />
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
                    <Input placeholder="Nom et Prénom du Vice-Président (optionnel)" {...field} />
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
                    <Input placeholder="Nom et Prénom du Secrétaire Général" {...field} />
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
                    <Input placeholder="Nom et Prénom du Trésorier" {...field} />
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
              Veuillez joindre les documents suivants pour votre dossier de création d'association :
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
            Création de votre Association
          </h1>
          <p className="text-gray-600">
            Remplissez ce formulaire pour démarrer la création de votre Association
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

export default AssociationCreationForm;
