
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, FileText, Users, Building, User, Shield, Check, X } from "lucide-react";
import Header from "@/components/Header";

const scoopSchema = z.object({
  dateCreation: z.string().min(1, "La date de création est requise"),
  lieuCreation: z.string().min(1, "Le lieu de création est requis"),
  denominationSociale: z.string().min(1, "La dénomination sociale est requise"),
  siegeSocial: z.string().min(1, "Le siège social est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  duree: z.string().min(1, "La durée est requise"),
  capitalSocial: z.string().min(1, "Le capital social est requis"),
  secteurActivite: z.string().min(1, "Le secteur d'activité est requis"),
  membres: z.array(z.object({
    nom: z.string().min(1, "Le nom est requis"),
    nationalite: z.string().min(1, "La nationalité est requise"),
    adresse: z.string().min(1, "L'adresse est requise"),
    apport: z.string().min(1, "Le montant de l'apport est requis"),
  })).min(7, "Minimum 7 membres requis pour une SCOOP"),
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
}).refine((data) => {
  if (data.createAccount) {
    return data.motDePasse && data.motDePasse.length >= 6;
  }
  return true;
}, {
  message: "Le mot de passe doit contenir au moins 6 caractères",
  path: ["motDePasse"],
}).refine((data) => {
  if (data.createAccount) {
    return data.motDePasse === data.confirmMotDePasse;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmMotDePasse"],
});

type ScoopFormData = z.infer<typeof scoopSchema>;

const ScoopCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File | null}>({
    statutsFile: null,
    listeMembresFile: null,
    justificatifFile: null,
  });
  const { toast } = useToast();

  const form = useForm<ScoopFormData>({
    resolver: zodResolver(scoopSchema),
    defaultValues: {
      membres: [
        { nom: "", nationalite: "", adresse: "", apport: "" },
        { nom: "", nationalite: "", adresse: "", apport: "" },
      ],
      createAccount: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "membres",
  });

  const addMembre = () => {
    append({ nom: "", nationalite: "", adresse: "", apport: "" });
  };

  const removeMembre = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ScoopFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["dateCreation", "lieuCreation", "denominationSociale", "siegeSocial", "telephone", "email", "duree", "capitalSocial", "secteurActivite"];
        break;
      case 2:
        fieldsToValidate = ["membres"];
        break;
      case 3:
        fieldsToValidate = ["president", "vicePresident", "secretaire", "tresorier"];
        break;
      case 4:
        // Documents step - no validation required
        break;
    }

    const isStepValid = await form.trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = (data: ScoopFormData) => {
    console.log("Données SCOOP:", data);
    console.log("Fichiers joints:", uploadedFiles);
    toast({
      title: "Formulaire soumis avec succès!",
      description: "Votre demande de création de SCOOP a été enregistrée.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "Le fichier est trop volumineux (max 10MB).",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erreur",
          description: "Type de fichier non autorisé. Utilisez PDF, DOC ou DOCX.",
          variant: "destructive",
        });
        return;
      }

      setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
      form.setValue(fieldName as any, file);
      toast({
        title: "Fichier ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    }
  };

  const removeFile = (fieldName: string) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: null }));
    form.setValue(fieldName as any, null);
    toast({
      title: "Fichier supprimé",
      description: "Le fichier a été retiré.",
    });
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Building className="h-5 w-5" />;
      case 2: return <Users className="h-5 w-5" />;
      case 3: return <User className="h-5 w-5" />;
      case 4: return <FileText className="h-5 w-5" />;
      case 5: return <Shield className="h-5 w-5" />;
      default: return null;
    }
  };

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
                <FormField
                  control={form.control}
                  name="lieuCreation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lieu de création</FormLabel>
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
                      <Textarea placeholder="Adresse complète du siège social" {...field} />
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
                        <Input placeholder="+237 xxx xxx xxx" {...field} />
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
                        <Input type="email" placeholder="contact@scoop.com" {...field} />
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
                      <FormLabel>Durée (en années)</FormLabel>
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
                        <Input placeholder="Agriculture, Commerce..." {...field} />
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
                <span className="text-sm text-gray-500">({fields.length} membres - minimum 7 requis)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Membre {index + 1}</h4>
                    {fields.length > 2 && (
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
                            <Input placeholder="Camerounaise" {...field} />
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
                            <Textarea placeholder="Adresse complète" {...field} />
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
                <Label className="text-lg font-medium">Statuts de la SCOOP *</Label>
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
                <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
              </div>

              {/* Liste des membres */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">Liste des membres *</Label>
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
                <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
              </div>

              {/* Justificatif de domiciliation */}
              <div className="space-y-3">
                <Label className="text-lg font-medium">Justificatif de domiciliation *</Label>
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
                <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Conseils pour vos documents</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Assurez-vous que tous les documents sont lisibles</li>
                      <li>• Les statuts doivent être signés par tous les membres fondateurs</li>
                      <li>• La liste des membres doit inclure leurs informations complètes</li>
                    </ul>
                  </div>
                </div>
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
                      <FormLabel>Créer un compte pour suivre ma demande</FormLabel>
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
                          <Input type="password" placeholder="Au moins 6 caractères" {...field} />
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
                          <Input type="password" placeholder="Confirmer le mot de passe" {...field} />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep === step 
                    ? 'bg-red-900 text-white' 
                    : currentStep > step 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
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

            {/* Navigation Buttons */}
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
