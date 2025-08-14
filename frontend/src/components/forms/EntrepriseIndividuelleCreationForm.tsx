import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, Check, User, Building, FileText, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const formSchema = z.object({
  // Informations sur l'Entrepreneur
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  nationality: z.string().min(2, 'La nationalité est requise'),
  personalAddress: z.string().min(5, 'L\'adresse personnelle est requise'),
  phone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres'),
  email: z.string().email('Email invalide'),
  
  // Informations sur l'Entreprise
  commercialName: z.string().optional(),
  businessAddress: z.string().min(5, 'L\'adresse du siège est requise'),
  mainActivity: z.string().min(5, 'L\'activité principale est requise'),
  investedCapital: z.string().optional(),
  exerciseDuration: z.string().min(1, 'La durée d\'exercice est requise'),
  
  // Création de compte
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'La confirmation est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const EntrepriseIndividuelleCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nationality: '',
      personalAddress: '',
      phone: '',
      email: '',
      commercialName: '',
      businessAddress: '',
      mainActivity: '',
      investedCapital: '',
      exerciseDuration: '',
      password: '',
      confirmPassword: '',
    },
  });

  const steps = [
    {
      id: 1,
      title: "Informations sur l'Entrepreneur",
      description: "Vos informations personnelles",
      icon: User,
      fields: ['firstName', 'lastName', 'nationality', 'personalAddress', 'phone', 'email']
    },
    {
      id: 2,
      title: "Informations sur l'Entreprise",
      description: "Détails de votre entreprise individuelle",
      icon: Building,
      fields: ['commercialName', 'businessAddress', 'mainActivity', 'investedCapital', 'exerciseDuration']
    },
    {
      id: 3,
      title: "Documents Requis",
      description: "Joindre les documents nécessaires",
      icon: FileText,
      fields: []
    },
    {
      id: 4,
      title: "Création de Compte",
      description: "Créer votre compte LAWRY",
      icon: UserPlus,
      fields: ['password', 'confirmPassword']
    }
  ];

  const handleFileUpload = (fileType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [fileType]: file }));
      toast({
        title: "Document ajouté",
        description: `${file.name} a été ajouté avec succès.`,
      });
    }
  };

  const nextStep = async () => {
    const currentStepFields = steps[currentStep - 1].fields;
    const isValid = await form.trigger(currentStepFields as any);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: FormData) => {
    console.log('Données du formulaire EI:', data);
    console.log('Documents uploadés:', uploadedFiles);
    
    toast({
      title: "Demande de création soumise !",
      description: "Votre demande de création d'entreprise individuelle a été envoyée. Nous vous contacterons sous 48h.",
    });
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Création d'Entreprise Individuelle
            </h1>
            <Progress value={progress} className="w-full h-3" />
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div key={step.id} className={`flex items-center ${
                  step.id <= currentStep ? 'text-red-600' : 'text-gray-400'
                }`}>
                  <step.icon className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nom de famille" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="firstName"
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
                      
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationalité *</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nationalité" {...field} />
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
                              <Input placeholder="Votre numéro de téléphone" {...field} />
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
                              <Input type="email" placeholder="votre@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="personalAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse personnelle *</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Votre adresse complète" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="commercialName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dénomination commerciale (optionnel)</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom commercial si différent" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="businessAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse du siège *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Adresse complète du siège social" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mainActivity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activité principale *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Décrivez votre activité principale" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="investedCapital"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capital investi (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="Montant du capital investi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="exerciseDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Durée d'exercice souhaitée *</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 12 mois" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          { key: 'identity', label: 'Copie de la pièce d\'identité de l\'entrepreneur', required: true },
                          { key: 'domiciliation', label: 'Justificatif de domiciliation', required: true },
                          { key: 'declaration', label: 'Déclaration sur l\'honneur d\'exercice en nom propre', required: true }
                        ].map((doc) => (
                          <Card key={doc.key} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {doc.label} {doc.required && <span className="text-red-500">*</span>}
                                </h3>
                                {uploadedFiles[doc.key] && (
                                  <p className="text-sm text-green-600 flex items-center mt-1">
                                    <Check className="h-4 w-4 mr-1" />
                                    {uploadedFiles[doc.key].name}
                                  </p>
                                )}
                              </div>
                              <div>
                                <input
                                  type="file"
                                  id={`file-${doc.key}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileUpload(doc.key, e)}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById(`file-${doc.key}`)?.click()}
                                  className="flex items-center"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {uploadedFiles[doc.key] ? 'Modifier' : 'Choisir'}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Créer votre compte LAWRY
                        </h3>
                        <p className="text-gray-600">
                          Un compte sera créé avec l'email : <strong>{form.watch('email')}</strong>
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="password"
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
                          name="confirmPassword"
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
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
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

                {currentStep < steps.length ? (
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
                    <Check className="h-4 w-4 mr-2" />
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

export default EntrepriseIndividuelleCreationForm;
