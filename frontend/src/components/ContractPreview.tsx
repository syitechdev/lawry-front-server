
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Download, CreditCard, FileText, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContractPreviewProps {
  contractData: any;
  contractType: string;
  onBack: () => void;
}

const ContractPreview = ({ contractData, contractType, onBack }: ContractPreviewProps) => {
  const [editMode, setEditMode] = useState<string | null>(null);
  const [modifiedSections, setModifiedSections] = useState<{[key: string]: string}>({});
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const generateContractContent = () => {
    switch (contractType) {
      case 'travail-cdi':
        return {
          title: 'CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE',
          sections: {
            parties: `ENTRE LES SOUSSIGNÉS :

La société ${contractData.entreprise}, société à responsabilité limitée au capital de ${contractData.capital} FCFA, dont le siège social est situé ${contractData.adresseEntreprise}, représentée par ${contractData.representant}, en qualité de représentant légal, ci-après dénommée "L'EMPLOYEUR".

ET

${contractData.nomSalarie}, né(e) le ${contractData.dateNaissance}, demeurant ${contractData.adresseSalarie}, ci-après dénommé(e) "LE SALARIÉ".`,

            objet: `ARTICLE 1 - OBJET DU CONTRAT

Le présent contrat a pour objet l'engagement de ${contractData.nomSalarie} en qualité de ${contractData.poste} à compter du ${contractData.dateDebut}.

Le salarié s'engage à exercer ses fonctions avec diligence et loyauté, dans le respect des directives de l'employeur et du règlement intérieur de l'entreprise.`,

            remuneration: `ARTICLE 2 - RÉMUNÉRATION

La rémunération mensuelle brute du salarié est fixée à ${contractData.salaire} FCFA.

Cette rémunération sera versée mensuellement, au plus tard le dernier jour ouvrable de chaque mois, par virement bancaire.

Elle pourra faire l'objet de révision selon les performances du salarié et les résultats de l'entreprise.`,

            duree: `ARTICLE 3 - DURÉE DU CONTRAT

Le présent contrat est conclu pour une durée indéterminée.

Il prendra effet le ${contractData.dateDebut}.

Une période d'essai de trois (3) mois est prévue, renouvelable une fois pour la même durée.`,

            obligations: `ARTICLE 4 - OBLIGATIONS DU SALARIÉ

Le salarié s'engage à :
- Respecter les horaires de travail fixés par l'entreprise
- Exécuter consciencieusement les tâches qui lui sont confiées
- Respecter la confidentialité des informations de l'entreprise
- Se conformer au règlement intérieur
- Faire preuve de loyauté envers l'employeur`,

            fin: `ARTICLE 5 - FIN DU CONTRAT

Le présent contrat peut prendre fin :
- Par démission du salarié avec respect d'un préavis
- Par licenciement conformément à la législation en vigueur
- Par accord mutuel des parties
- Pour tout motif prévu par le Code du Travail

Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR')}

En deux exemplaires originaux.

L'EMPLOYEUR                    LE SALARIÉ
${contractData.representant}    ${contractData.nomSalarie}`
          }
        };

      case 'nda':
        return {
          title: 'ACCORD DE CONFIDENTIALITÉ (NDA)',
          sections: {
            parties: `ENTRE LES SOUSSIGNÉS :

${contractData.partie1}, ci-après dénommée "LA PREMIÈRE PARTIE".

ET

${contractData.partie2}, ci-après dénommée "LA SECONDE PARTIE".`,

            objet: `ARTICLE 1 - OBJET

Le présent accord a pour objet de définir les conditions dans lesquelles les parties s'engagent à préserver la confidentialité des informations échangées dans le cadre de :

${contractData.objet}`,

            confidentialite: `ARTICLE 2 - INFORMATIONS CONFIDENTIELLES

Sont considérées comme confidentielles toutes informations, données, documents, savoir-faire, techniques, commerciales ou autres, sous quelque forme que ce soit, communiquées par l'une des parties à l'autre.

Ces informations ne pourront être divulguées à des tiers sans accord écrit préalable.`,

            duree: `ARTICLE 3 - DURÉE

Le présent accord prend effet à la date de sa signature et demeure valable pour une durée de ${contractData.duree}.

L'obligation de confidentialité survit à l'expiration ou à la résiliation du présent accord.`,

            sanctions: `ARTICLE 4 - SANCTIONS

Toute violation du présent accord de confidentialité entraînera la responsabilité de la partie défaillante et l'obligera à réparer le préjudice causé.`
          }
        };

      default:
        return {
          title: 'CONTRAT',
          sections: {
            contenu: contractData.details || 'Contenu du contrat à définir.'
          }
        };
    }
  };

  const contract = generateContractContent();

  const handleSectionEdit = (sectionKey: string, newContent: string) => {
    setModifiedSections(prev => ({
      ...prev,
      [sectionKey]: newContent
    }));
  };

  const getSectionContent = (sectionKey: string, originalContent: string) => {
    return modifiedSections[sectionKey] || originalContent;
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulation du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Paiement réussi !",
        description: "Votre contrat va être généré et téléchargé automatiquement.",
      });
      
      // Simulation de téléchargement
      setTimeout(() => {
        const blob = new Blob([generateFullContractText()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrat_${contractType}_${new Date().getTime()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        setShowPayment(false);
        toast({
          title: "Téléchargement terminé !",
          description: "Votre contrat a été téléchargé avec succès.",
        });
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du paiement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFullContractText = () => {
    let fullText = `${contract.title}\n\n`;
    
    Object.entries(contract.sections).forEach(([key, content]) => {
      const finalContent = getSectionContent(key, content);
      fullText += `${finalContent}\n\n`;
    });
    
    return fullText;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          ← Retour au formulaire
        </Button>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-blue-200 text-blue-800">
            <Eye className="h-3 w-3 mr-1" />
            Prévisualisation
          </Badge>
          {Object.keys(modifiedSections).length > 0 && (
            <Badge variant="outline" className="border-orange-200 text-orange-800">
              {Object.keys(modifiedSections).length} modification(s)
            </Badge>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-red-900">
            {contract.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(contract.sections).map(([sectionKey, sectionContent]) => (
            <div key={sectionKey} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(editMode === sectionKey ? null : sectionKey)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {editMode === sectionKey ? 'Annuler' : 'Modifier'}
                </Button>
              </div>

              {editMode === sectionKey ? (
                <div className="space-y-3">
                  <Textarea
                    value={getSectionContent(sectionKey, sectionContent)}
                    onChange={(e) => handleSectionEdit(sectionKey, e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditMode(null);
                        toast({
                          title: "Modifications sauvegardées",
                          description: "Cette section a été modifiée avec succès.",
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const { [sectionKey]: removed, ...rest } = modifiedSections;
                        setModifiedSections(rest);
                        setEditMode(null);
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`p-4 border rounded-lg whitespace-pre-line text-sm bg-gray-50 ${
                    modifiedSections[sectionKey] ? 'border-orange-300 bg-orange-50' : ''
                  }`}
                >
                  {getSectionContent(sectionKey, sectionContent)}
                </div>
              )}
              
              {sectionKey !== Object.keys(contract.sections)[Object.keys(contract.sections).length - 1] && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-red-900 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Télécharger votre contrat
            </h3>
            <p className="text-gray-700 mb-6">
              Pour télécharger ce contrat en format PDF ou Word, un paiement unique de <strong>5 000 FCFA</strong> est requis.
            </p>
            
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
              <DialogTrigger asChild>
                <Button className="bg-red-900 hover:bg-red-800" size="lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payer et télécharger - 5 000 FCFA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Paiement sécurisé</DialogTitle>
                  <DialogDescription>
                    Effectuez le paiement pour télécharger votre contrat
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Contrat personnalisé</span>
                      <span className="font-semibold">5 000 FCFA</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="cardNumber">Numéro de carte</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData(prev => ({...prev, cardNumber: e.target.value}))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiryDate">Date d'expiration</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/AA"
                          value={paymentData.expiryDate}
                          onChange={(e) => setPaymentData(prev => ({...prev, expiryDate: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData(prev => ({...prev, cvv: e.target.value}))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Nom sur la carte</Label>
                      <Input
                        id="cardName"
                        placeholder="JEAN DUPONT"
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData(prev => ({...prev, cardName: e.target.value}))}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                    className="w-full bg-red-900 hover:bg-red-800"
                  >
                    {isProcessing ? 'Traitement en cours...' : 'Payer 5 000 FCFA'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractPreview;
