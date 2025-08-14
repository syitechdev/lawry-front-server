
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";

const formationRegistrationSchema = z.object({
  // Informations personnelles
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Téléphone requis"),
  
  // Informations professionnelles
  profession: z.string().min(1, "Profession requise"),
  company: z.string().optional(),
  experience: z.enum(["debutant", "intermediaire", "avance"]),
  
  // Formation sélectionnée
  selectedFormation: z.string().min(1, "Formation requise"),
  
  // Informations complémentaires
  motivation: z.string().min(10, "Motivation requise (minimum 10 caractères)"),
  specificNeeds: z.string().optional(),
  
  // Préférences
  sessionFormat: z.enum(["presentiel", "distanciel", "mixte"]),
  preferredDates: z.string().optional(),
});

type FormationRegistrationData = z.infer<typeof formationRegistrationSchema>;

interface FormationRegistrationFormProps {
  selectedFormation?: {
    title: string;
    price: string;
    duration: string;
    level: string;
  } | null;
  onBack: () => void;
}

const FormationRegistrationForm: React.FC<FormationRegistrationFormProps> = ({ 
  selectedFormation, 
  onBack 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormationRegistrationData | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const formations = [
    {
      id: "droit-affaires",
      title: "Droit des affaires pour entrepreneurs",
      price: "250 000 FCFA",
      priceNumber: 250000,
      duration: "3 jours",
      level: "Débutant",
      description: "Formation complète sur les aspects juridiques de l'entrepreneuriat"
    },
    {
      id: "gestion-rh",
      title: "Gestion juridique RH",
      price: "180 000 FCFA",
      priceNumber: 180000,
      duration: "2 jours",
      level: "Intermédiaire",
      description: "Maîtrisez le droit du travail et la gestion des ressources humaines"
    },
    {
      id: "conformite",
      title: "Conformité et réglementation",
      price: "120 000 FCFA",
      priceNumber: 120000,
      duration: "1 jour",
      level: "Tous niveaux",
      description: "Comprendre et appliquer les réglementations en vigueur"
    },
    {
      id: "sur-mesure",
      title: "Formation sur mesure",
      price: "Sur devis",
      priceNumber: 0,
      duration: "Variable",
      level: "Personnalisé",
      description: "Formation personnalisée selon vos besoins spécifiques"
    }
  ];

  const form = useForm<FormationRegistrationData>({
    resolver: zodResolver(formationRegistrationSchema),
    defaultValues: {
      selectedFormation: selectedFormation?.title || "",
      sessionFormat: "presentiel",
      experience: "debutant",
    },
  });

  const selectedFormationData = formations.find(f => 
    f.title === form.watch("selectedFormation") || 
    f.title === selectedFormation?.title
  );

  const onSubmit = async (data: FormationRegistrationData) => {
    try {
      console.log("Données d'inscription:", data);
      setFormData(data);
      
      if (selectedFormationData?.id === "sur-mesure") {
        toast({
          title: "Demande envoyée !",
          description: "Nous vous contacterons sous 24h pour établir un devis personnalisé.",
        });
        onBack();
      } else {
        setShowPayment(true);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: "Inscription confirmée !",
      description: "Votre inscription à la formation a été validée. Vous recevrez un email de confirmation.",
    });
    onBack();
  };

  if (showPayment && selectedFormationData && formData) {
    const formationType = {
      id: selectedFormationData.id,
      name: selectedFormationData.title,
      price: selectedFormationData.priceNumber,
      description: selectedFormationData.description,
    };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="outline" 
          onClick={() => setShowPayment(false)}
          className="mb-6"
        >
          ← Retour au formulaire
        </Button>
        <PaymentForm
          contractType={formationType}
          onPaymentSuccess={handlePaymentSuccess}
          contractData={formData}
        />
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Informations personnelles", icon: Users },
    { number: 2, title: "Formation et préférences", icon: BookOpen },
    { number: 3, title: "Finalisation", icon: CheckCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-6"
      >
        ← Retour aux formations
      </Button>

      {/* Formation sélectionnée */}
      {selectedFormationData && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-red-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {selectedFormationData.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {selectedFormationData.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-900">
                  {selectedFormationData.price}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{selectedFormationData.level}</Badge>
                  <Badge variant="outline">{selectedFormationData.duration}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-red-900 border-red-900 text-white' 
                : 'bg-white border-gray-300 text-gray-500'
            }`}>
              <step.icon className="h-5 w-5" />
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-red-900' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-red-900' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscription à la formation</CardTitle>
          <CardDescription>
            Remplissez le formulaire pour vous inscrire à cette formation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Étape 1: Informations personnelles */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
                  
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
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entreprise (optionnel)</FormLabel>
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
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau d'expérience *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="debutant">Débutant</SelectItem>
                            <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                            <SelectItem value="avance">Avancé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Étape 2: Formation et préférences */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Formation et préférences</h3>
                  
                  <FormField
                    control={form.control}
                    name="selectedFormation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formation choisie *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {formations.map((formation) => (
                              <SelectItem key={formation.id} value={formation.title}>
                                {formation.title} - {formation.price}
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
                    name="sessionFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format de session préféré *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="presentiel">Présentiel</SelectItem>
                            <SelectItem value="distanciel">Distanciel</SelectItem>
                            <SelectItem value="mixte">Mixte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dates préférées (optionnel)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Semaine du 15 janvier, ou tous les mercredis"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Étape 3: Finalisation */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Finalisation de l'inscription</h3>
                  
                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivation et objectifs *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Expliquez pourquoi cette formation vous intéresse et quels sont vos objectifs..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specificNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Besoins spécifiques (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Avez-vous des besoins particuliers, des questions spécifiques à aborder ?"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation */}
              <Separator />
              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Précédent
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="ml-auto bg-red-900 hover:bg-red-800"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="ml-auto bg-red-900 hover:bg-red-800"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Finaliser l'inscription
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

export default FormationRegistrationForm;
