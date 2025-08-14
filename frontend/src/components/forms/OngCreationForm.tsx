
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, FileText, Users, Building, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const formSchema = z.object({
  // Informations Générales
  nomOng: z.string().min(2, "Le nom de l'ONG est requis"),
  siegeSocial: z.string().min(5, "L'adresse du siège social est requise"),
  telephone: z.string().min(8, "Le numéro de téléphone est requis"),
  email: z.string().email("Email invalide"),
  duree: z.string().min(1, "La durée est requise"),
  missionPrincipale: z.string().min(10, "La mission principale est requise"),
  domainesIntervention: z.array(z.string()).min(1, "Au moins un domaine d'intervention est requis"),
  autreDomaine: z.string().optional(),
  
  // Fondateurs
  fondateur1Nom: z.string().min(2, "Le nom du fondateur 1 est requis"),
  fondateur1Nationalite: z.string().min(2, "La nationalité du fondateur 1 est requise"),
  fondateur1Adresse: z.string().min(5, "L'adresse du fondateur 1 est requise"),
  
  fondateur2Nom: z.string().optional(),
  fondateur2Nationalite: z.string().optional(),
  fondateur2Adresse: z.string().optional(),
  
  // Conseil d'Administration
  membre1Nom: z.string().optional(),
  membre1Fonction: z.string().optional(),
  membre2Nom: z.string().optional(),
  membre2Fonction: z.string().optional(),
  
  // Documents
  documents: z.array(z.any()).optional(),
  
  // Compte utilisateur
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmMotDePasse: z.string().min(8, "La confirmation du mot de passe est requise"),
}).refine((data) => data.motDePasse === data.confirmMotDePasse, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmMotDePasse"],
});

type FormData = z.infer<typeof formSchema>;

const OngCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const totalSteps = 5;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomOng: "",
      siegeSocial: "",
      telephone: "",
      email: "",
      duree: "",
      missionPrincipale: "",
      domainesIntervention: [],
      autreDomaine: "",
      fondateur1Nom: "",
      fondateur1Nationalite: "",
      fondateur1Adresse: "",
      fondateur2Nom: "",
      fondateur2Nationalite: "",
      fondateur2Adresse: "",
      membre1Nom: "",
      membre1Fonction: "",
      membre2Nom: "",
      membre2Fonction: "",
      motDePasse: "",
      confirmMotDePasse: "",
    },
  });

  const domainesOptions = [
    { id: "education", label: "Éducation" },
    { id: "sante", label: "Santé" },
    { id: "environnement", label: "Environnement" },
    { id: "droits", label: "Droits de l'Homme" },
    { id: "autre", label: "Autre" },
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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Données du formulaire ONG:", data);
    console.log("Fichiers uploadés:", uploadedFiles);
    
    toast({
      title: "Demande de création d'ONG soumise !",
      description: "Nous avons reçu votre demande. Vous recevrez un email de confirmation sous peu.",
    });
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Informations Générales";
      case 2: return "Mission et Domaines";
      case 3: return "Fondateurs";
      case 4: return "Conseil d'Administration";
      case 5: return "Documents et Finalisation";
      default: return "";
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return <Building className="h-6 w-6" />;
      case 2: return <FileText className="h-6 w-6" />;
      case 3: return <Users className="h-6 w-6" />;
      case 4: return <Users className="h-6 w-6" />;
      case 5: return <Upload className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-900 to-red-800 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStepIcon()}
                <div>
                  <CardTitle className="text-2xl">Création d'une ONG</CardTitle>
                  <CardDescription className="text-red-100">
                    Étape {currentStep} sur {totalSteps}: {getStepTitle()}
                  </CardDescription>
                </div>
              </div>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="mt-4" />
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Étape 1: Informations Générales */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nomOng"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'ONG *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom de votre ONG" {...field} />
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
                              <Input type="email" placeholder="contact@ong.com" {...field} />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      
                      <FormField
                        control={form.control}
                        name="duree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée (en années) *</FormLabel>
                            <FormControl>
                              <Input placeholder="99 (indéterminée)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Étape 2: Mission et Domaines */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="missionPrincipale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mission Principale *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez la mission principale de votre ONG"
                              className="min-h-[120px]"
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
                          <div className="grid grid-cols-2 gap-4">
                            {domainesOptions.map((domaine) => (
                              <FormField
                                key={domaine.id}
                                control={form.control}
                                name="domainesIntervention"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={domaine.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(domaine.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, domaine.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== domaine.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {domaine.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
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
                              <Input placeholder="Autre domaine d'intervention" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                {/* Étape 3: Fondateurs */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold mb-4 text-red-900">Fondateur 1 *</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fondateur1Nom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom et Prénom *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom et prénom complets" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fondateur1Nationalite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nationalité *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nationalité" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="fondateur1Adresse"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Adresse *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Adresse complète" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-900">Fondateur 2 (optionnel)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fondateur2Nom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom et Prénom</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom et prénom complets" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fondateur2Nationalite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nationalité</FormLabel>
                              <FormControl>
                                <Input placeholder="Nationalité" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="fondateur2Adresse"
                        render={({ field }) => (
                          <FormItem className="mt-4">
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
                )}

                {/* Étape 4: Conseil d'Administration */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <p className="text-gray-600">
                        Renseignez les membres du conseil d'administration (optionnel)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="membre1Nom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Membre 1 - Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom du membre 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="membre1Fonction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Membre 1 - Fonction</FormLabel>
                            <FormControl>
                              <Input placeholder="Fonction du membre 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="membre2Nom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Membre 2 - Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom du membre 2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="membre2Fonction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Membre 2 - Fonction</FormLabel>
                            <FormControl>
                              <Input placeholder="Fonction du membre 2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Étape 5: Documents et Finalisation */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        Documents requis
                      </h3>
                      <p className="text-gray-600">
                        Veuillez joindre les documents suivants :
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {[
                        "Statuts de l'ONG",
                        "Procès-verbal de l'Assemblée constitutive",
                        "Liste des membres fondateurs",
                        "Justificatif de domiciliation",
                        "Plan d'actions et missions"
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <FileText className="h-5 w-5 text-red-900" />
                          <span className="text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Glissez-déposez vos fichiers ici
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        ou cliquez pour sélectionner
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Sélectionner les fichiers
                      </Button>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Fichiers sélectionnés :</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-red-900 mb-4">
                        Création de votre compte
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="motDePasse"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mot de passe *</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Minimum 8 caractères" {...field} />
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
                              <FormLabel>Confirmer le mot de passe *</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Répétez le mot de passe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
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
                      Soumettre la demande
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OngCreationForm;
