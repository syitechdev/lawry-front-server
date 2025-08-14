
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Building, Users, FileText, CheckCircle, Copy, Upload, X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SasFormData {
  // Informations générales
  denominationSociale: string;
  siegeSocial: string;
  telephone: string;
  email: string;
  duree: string;
  capitalSocial: string;
  objetSocial: string;
  // Actionnaires
  actionnaires: Array<{
    nom: string;
    nationalite: string;
    adresse: string;
    nombreActions: string;
  }>;
  // Représentation légale
  president: {
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
  };
  // Modalités administratives
  modeDecision: 'assemblee' | 'consultation';
  organeGestion: 'president' | 'conseil';
  // Documents
  documents: Array<{
    name: string;
    file?: File;
    checked: boolean;
  }>;
}

interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const SasCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<UserRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState<SasFormData>({
    denominationSociale: '',
    siegeSocial: '',
    telephone: '',
    email: '',
    duree: '',
    capitalSocial: '',
    objetSocial: '',
    actionnaires: [{ nom: '', nationalite: '', adresse: '', nombreActions: '' }],
    president: { nom: '', adresse: '', telephone: '', email: '' },
    modeDecision: 'assemblee',
    organeGestion: 'president',
    documents: [
      { name: 'Projet de statuts', checked: false },
      { name: 'Déclaration des souscriptions et libérations', checked: false },
      { name: 'Liste des actionnaires', checked: false },
      { name: 'Justificatif de domiciliation', checked: false },
      { name: 'Attestation de dépôt des fonds', checked: false }
    ]
  });

  const totalSteps = 6;

  const generateCode = () => {
    const code = `SAS-${Date.now().toString().slice(-6)}`;
    setGeneratedCode(code);
    toast({
      title: "Code généré avec succès",
      description: `Votre code de demande : ${code}`,
    });
  };

  const addActionnaire = () => {
    if (formData.actionnaires.length < 5) {
      setFormData({
        ...formData,
        actionnaires: [...formData.actionnaires, { nom: '', nationalite: '', adresse: '', nombreActions: '' }]
      });
    }
  };

  const removeActionnaire = (index: number) => {
    if (formData.actionnaires.length > 1) {
      setFormData({
        ...formData,
        actionnaires: formData.actionnaires.filter((_, i) => i !== index)
      });
    }
  };

  const updateActionnaire = (index: number, field: string, value: string) => {
    const newActionnaires = [...formData.actionnaires];
    newActionnaires[index] = { ...newActionnaires[index], [field]: value };
    setFormData({ ...formData, actionnaires: newActionnaires });
  };

  const toggleDocument = (index: number) => {
    const newDocuments = [...formData.documents];
    newDocuments[index] = { ...newDocuments[index], checked: !newDocuments[index].checked };
    setFormData({ ...formData, documents: newDocuments });
  };

  const handleFileUpload = (index: number, file: File | null) => {
    const newDocuments = [...formData.documents];
    if (file) {
      newDocuments[index] = { ...newDocuments[index], file, checked: true };
      toast({
        title: "Fichier téléchargé",
        description: `${file.name} a été ajouté avec succès`,
      });
    } else {
      newDocuments[index] = { ...newDocuments[index], file: undefined };
    }
    setFormData({ ...formData, documents: newDocuments });
  };

  const handleRegistration = () => {
    if (registrationData.password !== registrationData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    // Simuler la création de compte
    setIsLoggedIn(true);
    setShowRegistrationModal(false);
    toast({
      title: "Compte créé avec succès",
      description: "Vous êtes maintenant connecté et pouvez soumettre votre demande",
    });
  };

  const handleSubmit = () => {
    if (!isLoggedIn) {
      setShowRegistrationModal(true);
      return;
    }

    toast({
      title: "Demande soumise",
      description: "Votre demande de création de SAS a été soumise avec succès.",
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Code copié",
      description: "Le code a été copié dans le presse-papiers",
    });
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Informations Générales sur la Société
              </CardTitle>
              <CardDescription>
                Renseignez les informations de base de votre SAS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="denominationSociale">Dénomination Sociale *</Label>
                <Input
                  id="denominationSociale"
                  value={formData.denominationSociale}
                  onChange={(e) => setFormData({ ...formData, denominationSociale: e.target.value })}
                  placeholder="Ex: INNOVATION TECH SAS"
                />
              </div>
              <div>
                <Label htmlFor="siegeSocial">Siège Social *</Label>
                <Input
                  id="siegeSocial"
                  value={formData.siegeSocial}
                  onChange={(e) => setFormData({ ...formData, siegeSocial: e.target.value })}
                  placeholder="Adresse complète du siège social"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@entreprise.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duree">Durée de la société (années) *</Label>
                  <Input
                    id="duree"
                    value={formData.duree}
                    onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                    placeholder="99"
                  />
                </div>
                <div>
                  <Label htmlFor="capitalSocial">Capital Social (€) *</Label>
                  <Input
                    id="capitalSocial"
                    value={formData.capitalSocial}
                    onChange={(e) => setFormData({ ...formData, capitalSocial: e.target.value })}
                    placeholder="1000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="objetSocial">Activité principale / Objet social *</Label>
                <Textarea
                  id="objetSocial"
                  value={formData.objetSocial}
                  onChange={(e) => setFormData({ ...formData, objetSocial: e.target.value })}
                  placeholder="Décrivez l'activité principale de votre société"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Actionnaires Fondateurs
              </CardTitle>
              <CardDescription>
                Ajoutez les informations des actionnaires fondateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.actionnaires.map((actionnaire, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Actionnaire {index + 1}</h3>
                    {formData.actionnaires.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeActionnaire(index)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom et Prénom *</Label>
                      <Input
                        value={actionnaire.nom}
                        onChange={(e) => updateActionnaire(index, 'nom', e.target.value)}
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <Label>Nationalité *</Label>
                      <Input
                        value={actionnaire.nationalite}
                        onChange={(e) => updateActionnaire(index, 'nationalite', e.target.value)}
                        placeholder="Française"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Adresse *</Label>
                    <Input
                      value={actionnaire.adresse}
                      onChange={(e) => updateActionnaire(index, 'adresse', e.target.value)}
                      placeholder="Adresse complète"
                    />
                  </div>
                  <div>
                    <Label>Nombre d'actions *</Label>
                    <Input
                      value={actionnaire.nombreActions}
                      onChange={(e) => updateActionnaire(index, 'nombreActions', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>
              ))}
              {formData.actionnaires.length < 5 && (
                <Button onClick={addActionnaire} variant="outline" className="w-full">
                  Ajouter un actionnaire
                </Button>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Représentation Légale
              </CardTitle>
              <CardDescription>
                Informations sur le président de la SAS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="presidentNom">Nom et Prénom du Président *</Label>
                <Input
                  id="presidentNom"
                  value={formData.president.nom}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    president: { ...formData.president, nom: e.target.value }
                  })}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="presidentAdresse">Adresse *</Label>
                <Input
                  id="presidentAdresse"
                  value={formData.president.adresse}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    president: { ...formData.president, adresse: e.target.value }
                  })}
                  placeholder="Adresse complète du président"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="presidentTelephone">Téléphone *</Label>
                  <Input
                    id="presidentTelephone"
                    value={formData.president.telephone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      president: { ...formData.president, telephone: e.target.value }
                    })}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label htmlFor="presidentEmail">Email *</Label>
                  <Input
                    id="presidentEmail"
                    type="email"
                    value={formData.president.email}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      president: { ...formData.president, email: e.target.value }
                    })}
                    placeholder="president@entreprise.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Modalités Administratives
              </CardTitle>
              <CardDescription>
                Définissez les modalités de fonctionnement de votre SAS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Mode de décision *</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assemblee"
                      checked={formData.modeDecision === 'assemblee'}
                      onCheckedChange={() => setFormData({ ...formData, modeDecision: 'assemblee' })}
                    />
                    <Label htmlFor="assemblee">Assemblée générale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consultation"
                      checked={formData.modeDecision === 'consultation'}
                      onCheckedChange={() => setFormData({ ...formData, modeDecision: 'consultation' })}
                    />
                    <Label htmlFor="consultation">Décision par consultation écrite</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-base font-medium">Organe de gestion *</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="president"
                      checked={formData.organeGestion === 'president'}
                      onCheckedChange={() => setFormData({ ...formData, organeGestion: 'president' })}
                    />
                    <Label htmlFor="president">Président seul</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="conseil"
                      checked={formData.organeGestion === 'conseil'}
                      onCheckedChange={() => setFormData({ ...formData, organeGestion: 'conseil' })}
                    />
                    <Label htmlFor="conseil">Conseil d'administration</Label>
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
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Documents à Joindre
              </CardTitle>
              <CardDescription>
                Téléchargez vos documents ou cochez ceux que vous souhaitez que nous préparions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {formData.documents.map((document, index) => (
                  <div key={document.name} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`doc-${index}`}
                          checked={document.checked}
                          onCheckedChange={() => toggleDocument(index)}
                        />
                        <Label htmlFor={`doc-${index}`} className="font-medium">
                          {document.name}
                        </Label>
                      </div>
                      {document.file && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">{document.file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileUpload(index, null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(index, file);
                            }
                          }}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
                      </div>
                      <span className="text-sm text-gray-500">ou</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDocument(index)}
                        className={document.checked && !document.file ? "bg-blue-50 border-blue-200" : ""}
                      >
                        {document.checked && !document.file ? "✓ À préparer" : "Nous préparons"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Information importante</h4>
                <p className="text-sm text-blue-700">
                  Vous pouvez télécharger vos documents maintenant ou demander à notre équipe de les préparer. 
                  Les formats acceptés : PDF, DOC, DOCX, JPG, PNG (max 10MB par fichier).
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Récapitulatif et Génération du Code
              </CardTitle>
              <CardDescription>
                Vérifiez vos informations et générez votre code de demande
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Informations de la société</h3>
                <p><strong>Dénomination:</strong> {formData.denominationSociale}</p>
                <p><strong>Siège social:</strong> {formData.siegeSocial}</p>
                <p><strong>Capital social:</strong> {formData.capitalSocial} €</p>
                <p><strong>Nombre d'actionnaires:</strong> {formData.actionnaires.length}</p>
                <p><strong>Président:</strong> {formData.president.nom}</p>
                <p><strong>Documents sélectionnés:</strong> {formData.documents.filter(doc => doc.checked).length}/5</p>
                <p><strong>Documents téléchargés:</strong> {formData.documents.filter(doc => doc.file).length}/5</p>
              </div>
              
              {generatedCode ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">Code de demande généré</h3>
                      <p className="text-2xl font-mono font-bold text-green-600">{generatedCode}</p>
                    </div>
                    <Button onClick={copyCode} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Conservez ce code précieusement. Il vous sera demandé pour suivre votre dossier.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Button onClick={generateCode} size="lg" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Générer le code de demande
                  </Button>
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Formulaire de Création de SAS</h1>
          <span className="text-sm text-gray-500">Étape {currentStep} sur {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form content */}
      {renderStep()}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        
        {currentStep < totalSteps ? (
          <Button onClick={nextStep}>
            Suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={!generatedCode}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Soumettre la demande
          </Button>
        )}
      </div>

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un compte</DialogTitle>
            <DialogDescription>
              Pour soumettre votre demande, vous devez créer un compte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={registrationData.firstName}
                  onChange={(e) => setRegistrationData({ ...registrationData, firstName: e.target.value })}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={registrationData.lastName}
                  onChange={(e) => setRegistrationData({ ...registrationData, lastName: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="regEmail">Email</Label>
              <Input
                id="regEmail"
                type="email"
                value={registrationData.email}
                onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <Label htmlFor="regPhone">Téléphone</Label>
              <Input
                id="regPhone"
                value={registrationData.phone}
                onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                placeholder="+225 XX XX XX XX"
              />
            </div>
            <div>
              <Label htmlFor="regPassword">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="regPassword"
                  type={showPassword ? "text" : "password"}
                  value={registrationData.password}
                  onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })}
                  placeholder="Choisissez un mot de passe"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="regConfirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="regConfirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={registrationData.confirmPassword}
                  onChange={(e) => setRegistrationData({ ...registrationData, confirmPassword: e.target.value })}
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleRegistration} className="w-full bg-red-900 hover:bg-red-800">
              Créer mon compte et soumettre
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SasCreationForm;
