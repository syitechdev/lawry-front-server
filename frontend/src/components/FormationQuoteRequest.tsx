import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ArrowLeft, Send, Users, Clock, Target, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormationQuoteRequestProps {
  onBack: () => void;
}

const FormationQuoteRequest = ({ onBack }: FormationQuoteRequestProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    sector: '',
    companySize: '',
    formationType: '',
    participants: '',
    duration: '',
    location: '',
    budget: '',
    objectives: '',
    specificNeeds: '',
    preferredDates: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulation de l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "Demande envoyée !",
        description: "Nous vous contacterons dans les 24 heures pour discuter de votre projet de formation.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Demande de devis envoyée !
            </h2>
            <p className="text-green-700 mb-6">
              Merci pour votre intérêt. Notre équipe va analyser votre demande et vous contactera dans les 24 heures pour discuter de votre projet de formation personnalisée.
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Prochaines étapes :</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Analyse de vos besoins par notre équipe pédagogique</li>
                <li>• Appel de validation dans les 24h</li>
                <li>• Envoi du devis personnalisé sous 48h</li>
                <li>• Planification de la formation selon vos disponibilités</li>
              </ul>
            </div>
            <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
              Retour au menu principal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Badge variant="outline" className="border-purple-200 text-purple-800">
          Étape {step}/3
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl text-purple-900">
            Demande de devis formation personnalisée
          </CardTitle>
          <div className="flex justify-center space-x-8 mt-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`flex items-center ${num <= step ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  num <= step ? 'border-purple-600 bg-purple-100' : 'border-gray-300'
                }`}>
                  {num}
                </div>
                <span className="ml-2 text-sm">
                  {num === 1 && 'Entreprise'}
                  {num === 2 && 'Formation'}
                  {num === 3 && 'Détails'}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Informations sur votre entreprise
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Ex: SARL Exemple"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactName">Nom du contact *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email professionnel *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@entreprise.ci"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="07 XX XX XX XX"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sector">Secteur d'activité</Label>
                  <Select onValueChange={(value) => handleInputChange('sector', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commerce">Commerce</SelectItem>
                      <SelectItem value="industrie">Industrie</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="btp">BTP</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="technologie">Technologie</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="companySize">Taille de l'entreprise</Label>
                  <Select onValueChange={(value) => handleInputChange('companySize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nombre d'employés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 employés</SelectItem>
                      <SelectItem value="6-20">6-20 employés</SelectItem>
                      <SelectItem value="21-50">21-50 employés</SelectItem>
                      <SelectItem value="51-100">51-100 employés</SelectItem>
                      <SelectItem value="100+">Plus de 100 employés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Détails de la formation souhaitée
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formationType">Type de formation *</Label>
                  <Select onValueChange={(value) => handleInputChange('formationType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="droit-societes">Droit des sociétés</SelectItem>
                      <SelectItem value="droit-travail">Droit du travail</SelectItem>
                      <SelectItem value="droit-commercial">Droit commercial</SelectItem>
                      <SelectItem value="droit-immobilier">Droit immobilier</SelectItem>
                      <SelectItem value="compliance">Conformité réglementaire</SelectItem>
                      <SelectItem value="creation-entreprise">Création d'entreprise</SelectItem>
                      <SelectItem value="personnalisee">Formation personnalisée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="participants">Nombre de participants</Label>
                  <Select onValueChange={(value) => handleInputChange('participants', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Combien de personnes ?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 personnes</SelectItem>
                      <SelectItem value="6-15">6-15 personnes</SelectItem>
                      <SelectItem value="16-30">16-30 personnes</SelectItem>
                      <SelectItem value="30+">Plus de 30 personnes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Durée souhaitée</Label>
                  <Select onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durée de formation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demi-journee">Demi-journée (4h)</SelectItem>
                      <SelectItem value="journee">1 journée (8h)</SelectItem>
                      <SelectItem value="2-jours">2 jours</SelectItem>
                      <SelectItem value="3-jours">3 jours</SelectItem>
                      <SelectItem value="semaine">1 semaine</SelectItem>
                      <SelectItem value="sur-mesure">Sur mesure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Mode de formation</Label>
                  <Select onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Où se déroulera la formation ?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presentiel-lawry">Présentiel chez LAWRY</SelectItem>
                      <SelectItem value="presentiel-entreprise">Présentiel dans votre entreprise</SelectItem>
                      <SelectItem value="distanciel">Formation à distance</SelectItem>
                      <SelectItem value="hybride">Hybride (présentiel + distanciel)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="objectives">Objectifs de formation</Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange('objectives', e.target.value)}
                  placeholder="Décrivez les objectifs que vous souhaitez atteindre avec cette formation..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                Finalisation de votre demande
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget indicatif</Label>
                  <Select onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Votre budget approximatif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50k-100k">50 000 - 100 000 FCFA</SelectItem>
                      <SelectItem value="100k-250k">100 000 - 250 000 FCFA</SelectItem>
                      <SelectItem value="250k-500k">250 000 - 500 000 FCFA</SelectItem>
                      <SelectItem value="500k-1M">500 000 - 1 000 000 FCFA</SelectItem>
                      <SelectItem value="1M+">Plus de 1 000 000 FCFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="preferredDates">Dates préférées</Label>
                  <Input
                    id="preferredDates"
                    value={formData.preferredDates}
                    onChange={(e) => handleInputChange('preferredDates', e.target.value)}
                    placeholder="Ex: Semaine du 15-19 janvier"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="specificNeeds">Besoins spécifiques</Label>
                <Textarea
                  id="specificNeeds"
                  value={formData.specificNeeds}
                  onChange={(e) => handleInputChange('specificNeeds', e.target.value)}
                  placeholder="Mentionnez tout besoin particulier : supports, certifications, suivi post-formation..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Précédent
              </Button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
                  Suivant
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormationQuoteRequest;
