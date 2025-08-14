
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, CheckCircle, Building, Users, FileText, Sparkles } from "lucide-react";
import Header from "@/components/Header";

const formSchema = z.object({
  // Informations générales
  nomFondation: z.string().min(2, "Le nom de la fondation est requis"),
  siegeSocial: z.string().min(5, "L'adresse du siège social est requise"),
  telephone: z.string().min(10, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide"),
  duree: z.string().min(1, "La durée est requise"),
  missionPrincipale: z.string().min(10, "La mission principale est requise"),
  domainesIntervention: z.array(z.string()).min(1, "Sélectionnez au moins un domaine"),
  autreDomaine: z.string().optional(),

  // Fondateurs
  fondateurs: z.array(z.object({
    nom: z.string().min(2, "Le nom est requis"),
    nationalite: z.string().min(2, "La nationalité est requise"),
    adresse: z.string().min(5, "L'adresse est requise")
  })).min(1, "Au moins un fondateur est requis"),

  // Conseil d'administration
  president: z.string().min(2, "Le nom du président est requis"),
  membres: z.array(z.string()).min(1, "Au moins un membre est requis"),

  // Création de compte
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmationMotDePasse: z.string()
}).refine((data) => data.motDePasse === data.confirmationMotDePasse, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmationMotDePasse"],
});

type FormData = z.infer<typeof formSchema>;

const FondationCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<File[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [nouveauMembre, setNouveauMembre] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomFondation: "",
      siegeSocial: "",
      telephone: "",
      email: "",
      duree: "",
      missionPrincipale: "",
      domainesIntervention: [],
      autreDomaine: "",
      fondateurs: [{ nom: "", nationalite: "", adresse: "" }],
      president: "",
      membres: [],
      motDePasse: "",
      confirmationMotDePasse: ""
    },
  });

  const domainesOptions = [
    { id: "education", label: "Éducation" },
    { id: "sante", label: "Santé" },
    { id: "culture", label: "Culture" },
    { id: "environnement", label: "Environnement" },
    { id: "autre", label: "Autre" }
  ];

  const steps = [
    { number: 1, title: "Informations générales", icon: Building },
    { number: 2, title: "Mission & Domaines", icon: Sparkles },
    { number: 3, title: "Fondateurs", icon: Users },
    { number: 4, title: "Administration", icon: Users },
    { number: 5, title: "Documents & Compte", icon: FileText }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setDocuments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const ajouterFondateur = () => {
    const fondateurs = form.getValues("fondateurs");
    form.setValue("fondateurs", [...fondateurs, { nom: "", nationalite: "", adresse: "" }]);
  };

  const supprimerFondateur = (index: number) => {
    const fondateurs = form.getValues("fondateurs");
    if (fondateurs.length > 1) {
      form.setValue("fondateurs", fondateurs.filter((_, i) => i !== index));
    }
  };

  const ajouterMembre = () => {
    if (nouveauMembre.trim()) {
      const membres = form.getValues("membres");
      form.setValue("membres", [...membres, nouveauMembre.trim()]);
      setNouveauMembre("");
    }
  };

  const supprimerMembre = (index: number) => {
    const membres = form.getValues("membres");
    form.setValue("membres", membres.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["nomFondation", "siegeSocial", "telephone", "email", "duree"];
      case 2:
        return ["missionPrincipale", "domainesIntervention"];
      case 3:
        return ["fondateurs"];
      case 4:
        return ["president", "membres"];
      case 5:
        return ["motDePasse", "confirmationMotDePasse"];
      default:
        return [];
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("Données du formulaire:", data);
    console.log("Documents:", documents);
    setShowSuccessDialog(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building className="h-16 w-16 text-red-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Informations Générales</h2>
              <p className="text-gray-600">Renseignez les informations de base de votre fondation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nomFondation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la Fondation *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fondation pour l'Education" {...field} />
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
                      <Input placeholder="Adresse complète du siège" {...field} />
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
                      <Input type="email" placeholder="contact@fondation.fr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée de la Fondation *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la durée" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="indeterminee">Durée indéterminée</SelectItem>
                        <SelectItem value="10-ans">10 ans</SelectItem>
                        <SelectItem value="20-ans">20 ans</SelectItem>
                        <SelectItem value="50-ans">50 ans</SelectItem>
                        <SelectItem value="99-ans">99 ans</SelectItem>
                      </SelectContent>
                    </Select>
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
            <div className="text-center mb-8">
              <Sparkles className="h-16 w-16 text-red-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Mission & Domaines d'Intervention</h2>
              <p className="text-gray-600">Définissez la mission et les domaines d'action de votre fondation</p>
            </div>

            <FormField
              control={form.control}
              name="missionPrincipale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Principale *</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Décrivez la mission principale de votre fondation..."
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
              render={() => (
                <FormItem>
                  <FormLabel>Domaines d'Intervention *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {domainesOptions.map((domaine) => (
                      <FormField
                        key={domaine.id}
                        control={form.control}
                        name="domainesIntervention"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(domaine.id)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), domaine.id]
                                    : (field.value || []).filter((value) => value !== domaine.id);
                                  field.onChange(updatedValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {domaine.label}
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

            {form.watch("domainesIntervention")?.includes("autre") && (
              <FormField
                control={form.control}
                name="autreDomaine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Précisez le domaine</FormLabel>
                    <FormControl>
                      <Input placeholder="Décrivez le domaine spécifique" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="h-16 w-16 text-red-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Fondateurs</h2>
              <p className="text-gray-600">Informations sur les fondateurs de la fondation</p>
            </div>

            {form.watch("fondateurs").map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Fondateur {index + 1}</h3>
                  {form.watch("fondateurs").length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => supprimerFondateur(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`fondateurs.${index}.nom`}
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
                    name={`fondateurs.${index}.nationalite`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationalité *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Française" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`fondateurs.${index}.adresse`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse complète" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={ajouterFondateur}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un fondateur
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="h-16 w-16 text-red-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Conseil d'Administration</h2>
              <p className="text-gray-600">Composition du conseil d'administration</p>
            </div>

            <FormField
              control={form.control}
              name="president"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Président *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom complet du président" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Membres du Conseil *</FormLabel>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Nom d'un membre"
                  value={nouveauMembre}
                  onChange={(e) => setNouveauMembre(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      ajouterMembre();
                    }
                  }}
                />
                <Button type="button" onClick={ajouterMembre}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {form.watch("membres").length > 0 && (
                <div className="space-y-2">
                  {form.watch("membres").map((membre, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span>{membre}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => supprimerMembre(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {form.formState.errors.membres && (
                <p className="text-sm text-red-600">{form.formState.errors.membres.message}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="h-16 w-16 text-red-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Documents & Création de Compte</h2>
              <p className="text-gray-600">Joignez vos documents et créez votre compte</p>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Documents requis</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Glissez vos documents ici ou cliquez pour sélectionner</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('document-upload')?.click()}
                  >
                    Sélectionner des fichiers
                  </Button>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Documents joints :</h4>
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-sm">{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Création de votre compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="motDePasse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="8 caractères minimum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmationMotDePasse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmation du mot de passe *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Répétez le mot de passe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                      currentStep >= step.number
                        ? "bg-red-900 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-xs text-center font-medium text-gray-600 max-w-20">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t">
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

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-red-900 hover:bg-red-800 flex items-center"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finaliser la création
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              Demande envoyée !
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              Votre demande de création de fondation a été envoyée avec succès. 
              Nous vous contacterons sous 48h pour la suite du processus.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Parfait !
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FondationCreationForm;
