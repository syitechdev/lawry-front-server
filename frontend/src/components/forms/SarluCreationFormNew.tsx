
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Upload, FileText, Building, User, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  // Informations Générales
  denominationSociale: z.string().min(1, "La dénomination sociale est requise"),
  siegeSocial: z.string().min(1, "Le siège social est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  duree: z.string().min(1, "La durée est requise"),
  capitalSocial: z.string().min(1, "Le capital social est requis"),
  activitePrincipale: z.string().min(1, "L'activité principale est requise"),
  
  // Associé Unique
  nomPrenomAssocie: z.string().min(1, "Le nom et prénom sont requis"),
  nationaliteAssocie: z.string().min(1, "La nationalité est requise"),
  adresseAssocie: z.string().min(1, "L'adresse est requise"),
  montantApport: z.string().min(1, "Le montant de l'apport est requis"),
  
  // Gérance
  nomPrenomGerant: z.string().min(1, "Le nom et prénom du gérant sont requis"),
  adresseGerant: z.string().min(1, "L'adresse du gérant est requise"),
  telephoneGerant: z.string().min(1, "Le téléphone du gérant est requis"),
  emailGerant: z.string().email("Email invalide"),

  // Compte utilisateur
  motDePasse: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmerMotDePasse: z.string().min(6, "Confirmation requise"),
}).refine((data) => data.motDePasse === data.confirmerMotDePasse, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmerMotDePasse"],
});

type FormData = z.infer<typeof formSchema>;

interface DocumentFile {
  name: string;
  file: File | null;
  uploaded: boolean;
}

const SarluCreationFormNew = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<DocumentFile[]>([
    { name: "Projet de statuts", file: null, uploaded: false },
    { name: "Déclaration de souscription et libération du capital", file: null, uploaded: false },
    { name: "Justificatif de domiciliation", file: null, uploaded: false },
    { name: "Attestation de dépôt des fonds", file: null, uploaded: false },
  ]);
  
  const { toast } = useToast();
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const handleFileUpload = (index: number, file: File | null) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      file,
      uploaded: !!file,
    };
    setDocuments(updatedDocuments);
    
    if (file) {
      toast({
        title: "Document ajouté",
        description: `${file.name} a été ajouté avec succès`,
      });
    }
  };

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['denominationSociale', 'siegeSocial', 'telephone', 'email', 'duree', 'capitalSocial', 'activitePrincipale'];
        break;
      case 2:
        fieldsToValidate = ['nomPrenomAssocie', 'nationaliteAssocie', 'adresseAssocie', 'montantApport'];
        break;
      case 3:
        fieldsToValidate = ['nomPrenomGerant', 'adresseGerant', 'telephoneGerant', 'emailGerant'];
        break;
      case 4:
        return true; // Documents step - no form validation needed
      case 5:
        fieldsToValidate = ['motDePasse', 'confirmerMotDePasse'];
        break;
    }
    
    return await trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    console.log('Documents:', documents);
    
    toast({
      title: "Demande soumise avec succès!",
      description: "Votre demande de création de SARLU a été envoyée. Vous recevrez une confirmation par email.",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <Building className="h-6 w-6 text-red-900 mr-2" />
              <h3 className="text-xl font-semibold">Informations Générales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="denominationSociale">Dénomination Sociale *</Label>
                <Input
                  id="denominationSociale"
                  {...register('denominationSociale')}
                  placeholder="Nom de votre société"
                />
                {errors.denominationSociale && (
                  <p className="text-red-500 text-sm mt-1">{errors.denominationSociale.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="siegeSocial">Siège Social *</Label>
                <Input
                  id="siegeSocial"
                  {...register('siegeSocial')}
                  placeholder="Adresse du siège social"
                />
                {errors.siegeSocial && (
                  <p className="text-red-500 text-sm mt-1">{errors.siegeSocial.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  {...register('telephone')}
                  placeholder="+225 XX XX XX XX XX"
                />
                {errors.telephone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="contact@entreprise.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="duree">Durée de la société (en années) *</Label>
                <Input
                  id="duree"
                  {...register('duree')}
                  placeholder="99"
                />
                {errors.duree && (
                  <p className="text-red-500 text-sm mt-1">{errors.duree.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="capitalSocial">Capital Social (FCFA) *</Label>
                <Input
                  id="capitalSocial"
                  {...register('capitalSocial')}
                  placeholder="1 000 000"
                />
                {errors.capitalSocial && (
                  <p className="text-red-500 text-sm mt-1">{errors.capitalSocial.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="activitePrincipale">Activité principale / Objet social *</Label>
              <Textarea
                id="activitePrincipale"
                {...register('activitePrincipale')}
                placeholder="Décrivez l'activité principale de votre société"
                rows={3}
              />
              {errors.activitePrincipale && (
                <p className="text-red-500 text-sm mt-1">{errors.activitePrincipale.message}</p>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-red-900 mr-2" />
              <h3 className="text-xl font-semibold">Associé Unique</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomPrenomAssocie">Nom et Prénom *</Label>
                <Input
                  id="nomPrenomAssocie"
                  {...register('nomPrenomAssocie')}
                  placeholder="Nom et prénom de l'associé"
                />
                {errors.nomPrenomAssocie && (
                  <p className="text-red-500 text-sm mt-1">{errors.nomPrenomAssocie.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="nationaliteAssocie">Nationalité *</Label>
                <Input
                  id="nationaliteAssocie"
                  {...register('nationaliteAssocie')}
                  placeholder="Nationalité"
                />
                {errors.nationaliteAssocie && (
                  <p className="text-red-500 text-sm mt-1">{errors.nationaliteAssocie.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="adresseAssocie">Adresse *</Label>
              <Textarea
                id="adresseAssocie"
                {...register('adresseAssocie')}
                placeholder="Adresse complète de l'associé"
                rows={2}
              />
              {errors.adresseAssocie && (
                <p className="text-red-500 text-sm mt-1">{errors.adresseAssocie.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="montantApport">Montant de l'apport (FCFA) *</Label>
              <Input
                id="montantApport"
                {...register('montantApport')}
                placeholder="1 000 000"
              />
              {errors.montantApport && (
                <p className="text-red-500 text-sm mt-1">{errors.montantApport.message}</p>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-red-900 mr-2" />
              <h3 className="text-xl font-semibold">Gérance</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomPrenomGerant">Nom et Prénom du Gérant *</Label>
                <Input
                  id="nomPrenomGerant"
                  {...register('nomPrenomGerant')}
                  placeholder="Nom et prénom du gérant"
                />
                {errors.nomPrenomGerant && (
                  <p className="text-red-500 text-sm mt-1">{errors.nomPrenomGerant.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="telephoneGerant">Téléphone *</Label>
                <Input
                  id="telephoneGerant"
                  {...register('telephoneGerant')}
                  placeholder="+225 XX XX XX XX XX"
                />
                {errors.telephoneGerant && (
                  <p className="text-red-500 text-sm mt-1">{errors.telephoneGerant.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="adresseGerant">Adresse du Gérant *</Label>
              <Textarea
                id="adresseGerant"
                {...register('adresseGerant')}
                placeholder="Adresse complète du gérant"
                rows={2}
              />
              {errors.adresseGerant && (
                <p className="text-red-500 text-sm mt-1">{errors.adresseGerant.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="emailGerant">Email du Gérant *</Label>
              <Input
                id="emailGerant"
                type="email"
                {...register('emailGerant')}
                placeholder="gerant@email.com"
              />
              {errors.emailGerant && (
                <p className="text-red-500 text-sm mt-1">{errors.emailGerant.message}</p>
              )}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-red-900 mr-2" />
              <h3 className="text-xl font-semibold">Documents à Joindre</h3>
            </div>
            
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-3" />
                      <span className="font-medium">{doc.name}</span>
                      {doc.uploaded && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        id={`file-${index}`}
                        className="hidden"
                        onChange={(e) => handleFileUpload(index, e.target.files?.[0] || null)}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <Button
                        type="button"
                        variant={doc.uploaded ? "outline" : "default"}
                        size="sm"
                        onClick={() => document.getElementById(`file-${index}`)?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {doc.uploaded ? 'Remplacer' : 'Joindre'}
                      </Button>
                    </div>
                  </div>
                  {doc.file && (
                    <p className="text-sm text-gray-600 mt-2">
                      Fichier sélectionné: {doc.file.name}
                    </p>
                  )}
                </Card>
              ))}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Vous pouvez joindre vos documents maintenant ou les télécharger plus tard depuis votre espace client.
              </p>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <User className="h-6 w-6 text-red-900 mr-2" />
              <h3 className="text-xl font-semibold">Création de votre compte</h3>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                Un compte sera créé avec l'email: <strong>{getValues('email')}</strong>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="motDePasse">Mot de passe *</Label>
                <Input
                  id="motDePasse"
                  type="password"
                  {...register('motDePasse')}
                  placeholder="Minimum 6 caractères"
                />
                {errors.motDePasse && (
                  <p className="text-red-500 text-sm mt-1">{errors.motDePasse.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="confirmerMotDePasse">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmerMotDePasse"
                  type="password"
                  {...register('confirmerMotDePasse')}
                  placeholder="Confirmez votre mot de passe"
                />
                {errors.confirmerMotDePasse && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmerMotDePasse.message}</p>
                )}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Récapitulatif de votre demande</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Société:</strong> {getValues('denominationSociale')}</p>
                <p><strong>Capital:</strong> {getValues('capitalSocial')} FCFA</p>
                <p><strong>Associé:</strong> {getValues('nomPrenomAssocie')}</p>
                <p><strong>Gérant:</strong> {getValues('nomPrenomGerant')}</p>
                <p><strong>Documents joints:</strong> {documents.filter(d => d.uploaded).length} / {documents.length}</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-red-900">
                Création d'une SARLU
              </CardTitle>
              <CardDescription>
                Société à Responsabilité Limitée Unipersonnelle
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Étape {currentStep} sur {totalSteps}
              </p>
              <p className="text-xs text-gray-500">
                Date: {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}
            
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-red-900 hover:bg-red-800"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Soumettre la demande
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SarluCreationFormNew;
