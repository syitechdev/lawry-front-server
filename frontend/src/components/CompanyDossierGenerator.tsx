
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, FileText, Clock, Euro } from "lucide-react";

interface CompanyDossierGeneratorProps {
  companyType: string;
  onClose: () => void;
}

const CompanyDossierGenerator = ({ companyType, onClose }: CompanyDossierGeneratorProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const companyData = {
    'sarl': {
      name: 'SARL',
      fullName: 'Société à Responsabilité Limitée',
      cost: '299 000 FCFA',
      duration: '5-7 jours',
      documents: [
        'Statuts de la SARL',
        'Procès-verbal de l\'assemblée constitutive',
        'Déclaration de souscription et versement',
        'Attestation de dépôt de capital',
        'Formulaire de demande d\'immatriculation',
        'Déclaration fiscale d\'existence'
      ]
    },
    'sas': {
      name: 'SAS',
      fullName: 'Société par Actions Simplifiée',
      cost: '350 000 FCFA',
      duration: '5-7 jours',
      documents: [
        'Statuts de la SAS',
        'Procès-verbal de nomination du président',
        'Déclaration de souscription et versement',
        'Attestation de dépôt de capital',
        'Formulaire de demande d\'immatriculation',
        'Déclaration fiscale d\'existence'
      ]
    },
    'sci': {
      name: 'SCI',
      fullName: 'Société Civile Immobilière',
      cost: '250 000 FCFA',
      duration: '3-5 jours',
      documents: [
        'Statuts de la SCI',
        'Procès-verbal de l\'assemblée constitutive',
        'Liste des associés',
        'Attestation de gérance',
        'Formulaire de demande d\'immatriculation',
        'Déclaration fiscale d\'existence'
      ]
    }
  };

  const data = companyData[companyType as keyof typeof companyData];

  const steps = [
    'Préparation des documents',
    'Rédaction des statuts',
    'Génération des formulaires',
    'Compilation du dossier',
    'Vérification finale'
  ];

  const generateDossier = async () => {
    setIsGenerating(true);
    
    for (let i = 0; i <= steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep(i);
      setProgress((i / steps.length) * 100);
    }
    
    setIsCompleted(true);
    setIsGenerating(false);
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-red-900" />
              Générateur de dossier - {data.name}
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{data.fullName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Euro className="h-4 w-4 mr-2 text-green-600" />
                <span>Coût: {data.cost}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                <span>Délai: {data.duration}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Documents inclus dans le dossier :</h4>
            <div className="grid grid-cols-1 gap-2">
              {data.documents.map((doc, index) => (
                <div key={index} className="flex items-center p-2 bg-white border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                  <span className="text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Génération en cours...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-gray-600">
                {currentStep < steps.length ? `Étape: ${steps[currentStep]}` : 'Finalisation...'}
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800 mb-2">Dossier généré avec succès !</h3>
              <p className="text-green-700 text-sm mb-4">
                Votre dossier complet de création de {data.name} est prêt.
              </p>
              <div className="flex gap-2 justify-center">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le dossier
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
              </div>
            </div>
          )}

          {!isGenerating && !isCompleted && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={generateDossier} className="bg-red-900 hover:bg-red-800">
                <FileText className="h-4 w-4 mr-2" />
                Générer le dossier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDossierGenerator;
