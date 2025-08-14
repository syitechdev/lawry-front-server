
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, MapPin, Calculator } from "lucide-react";
import QuoteRequestForm from "./QuoteRequestForm";

interface OfferSectionProps {
  capital: string;
  companyType: string;
  location?: string;
}

const OfferSection = ({ capital, companyType, location }: OfferSectionProps) => {
  const [showOffers, setShowOffers] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const capitalAmount = parseInt(capital.replace(/\s/g, '').replace(/[^\d]/g, '')) || 0;

  useEffect(() => {
    if (capital && capitalAmount > 0) {
      const timer = setTimeout(() => {
        setShowOffers(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [capital, capitalAmount]);

  if (!showOffers || capitalAmount === 0) return null;

  const isStandardPackage = capitalAmount <= 1000000;
  const isPremiumPackage = capitalAmount >= 10000000;

  const standardServices = [
    "Statuts personnalisés",
    "DNSV (Déclaration Notariée de Souscription et de Versement)",
    "Bail de domiciliation",
    "DNC (Déclaration de Non Condamnation)",
    "RCCM (Registre du Commerce et du Crédit Mobilier)",
    "DFE (Déclaration Fiscale d'Existence)",
    "IDU (Identifiant Unique)"
  ];

  const paidOptions = [
    "Rattachement fiscal",
    "Code importateur",
    "Facture normalisée électronique"
  ];

  const getPrice = () => {
    if (isStandardPackage) {
      return location === "abidjan" ? "150 000 FCFA" : "120 000 FCFA";
    }
    return "Sur devis";
  };

  const getOfferTitle = () => {
    if (isStandardPackage) {
      return `Offre Standard - ${companyType.toUpperCase()}`;
    }
    return `Offre Premium - ${companyType.toUpperCase()}`;
  };

  const getOfferDescription = () => {
    if (isStandardPackage) {
      return "Pack complet pour création d'entreprise avec capital ≤ 1M FCFA";
    }
    return "Accompagnement personnalisé pour création d'entreprise avec capital ≥ 10M FCFA";
  };

  if (showQuoteForm) {
    return <QuoteRequestForm />;
  }

  return (
    <div className="mt-8 animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Offres Recommandées
        </h3>
        <p className="text-gray-600">
          Basées sur votre capital social de {parseInt(capital).toLocaleString()} FCFA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offre principale */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-red-100 animate-slide-in-right">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-900" />
                {getOfferTitle()}
              </CardTitle>
              {isStandardPackage && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Recommandé
                </Badge>
              )}
            </div>
            <CardDescription>{getOfferDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Services inclus
              </h4>
              <ul className="space-y-2">
                {standardServices.map((service, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                Options payantes
              </h4>
              <ul className="space-y-2">
                {paidOptions.map((option, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-blue-500 mr-2 flex-shrink-0" />
                    {option} <span className="text-xs text-gray-400 ml-2">(+frais)</span>
                  </li>
                ))}
              </ul>
            </div>

            {isStandardPackage && location && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Tarification par zone</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Abidjan:</span>
                    <span className="font-medium">150 000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intérieur du pays:</span>
                    <span className="font-medium">120 000 FCFA</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Prix:</span>
                <span className="text-2xl font-bold text-red-900">{getPrice()}</span>
              </div>
              
              {isStandardPackage ? (
                <Button className="w-full bg-red-900 hover:bg-red-800 transition-all duration-200 hover:scale-105">
                  Choisir cette offre
                </Button>
              ) : (
                <Button 
                  className="w-full bg-red-900 hover:bg-red-800 transition-all duration-200 hover:scale-105"
                  onClick={() => setShowQuoteForm(true)}
                >
                  Demander un devis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offre alternative */}
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              {isStandardPackage ? `Offre Premium - ${companyType.toUpperCase()}` : `Offre Standard - ${companyType.toUpperCase()}`}
            </CardTitle>
            <CardDescription>
              {isStandardPackage 
                ? "Pour les projets d'envergure nécessitant un accompagnement personnalisé"
                : "Pack essentiel pour création d'entreprise"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Services inclus
              </h4>
              <ul className="space-y-2">
                {standardServices.map((service, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    {service}
                  </li>
                ))}
                {!isStandardPackage && (
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    Accompagnement juridique personnalisé
                  </li>
                )}
              </ul>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Prix:</span>
                <span className="text-2xl font-bold text-gray-700">
                  {isStandardPackage ? "Sur devis" : (location === "abidjan" ? "150 000 FCFA" : "120 000 FCFA")}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all duration-200 hover:scale-105"
                onClick={() => setShowQuoteForm(true)}
              >
                {isStandardPackage ? "Demander un devis" : "Choisir cette offre"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfferSection;
