
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PricingSectionProps {
  formType: string;
}

const PricingSection = ({ formType }: PricingSectionProps) => {
  const navigate = useNavigate();
  
  // Déterminer si c'est une forme à but non lucratif
  const isNonProfit = ["ONG", "Association", "Fondation", "SCOOP"].includes(formType);
  
  // Éléments inclus pour les sociétés commerciales
  const commercialIncludes = [
    "Dossier complet (Statuts, DNSV, Contrat de bail, DNC…)",
    "Validation par un formaliste",
    "Formalité au CEPICI ou au GREFFE",
    "Obtention du RCCM, de la DFE et du certificat IDU"
  ];

  // Options avec prix pour les sociétés commerciales
  const commercialOptions = [
    { name: "Rattachement fiscal", price: "79 000 FCFA" },
    { name: "Code importateur", price: "50 000 FCFA" },
    { name: "Facture normalisée", price: "à partir de 75 000 FCFA" }
  ];

  // Éléments inclus pour les organisations à but non lucratif
  const nonProfitIncludes = [
    "Rédaction des statuts",
    "Rédaction du PV de constitution",
    "Élaboration de la liste de présence",
    "Rédaction de la lettre de demande d'agrément",
    "Préparation du récépissé de dépôt"
  ];

  const handleChooseBasic = () => {
    console.log(`Choix du tarif basique pour ${formType}`);
    // Rediriger vers le formulaire de création spécifique
    if (formType === "SAS") {
      navigate("/creer-entreprise/sas/formulaire");
    } else if (formType === "SASU") {
      navigate("/creer-entreprise/sasu/formulaire");
    } else if (formType === "SARL") {
      navigate("/creer-entreprise/sarl/formulaire");
    } else if (formType === "SARLU") {
      navigate("/creer-entreprise/sarlu/nouveau-formulaire");
    } else if (formType === "SA") {
      navigate("/creer-entreprise/sa/formulaire");
    } else if (formType === "SAU") {
      navigate("/creer-entreprise/sau/formulaire");
    } else if (formType === "SCI") {
      navigate("/creer-entreprise/sci/formulaire");
    } else if (formType === "Entreprise individuelle") {
      navigate("/creer-entreprise/entreprise-individuelle/formulaire");
    } else if (formType === "Fondation") {
      navigate("/creer-entreprise/fondation/formulaire");
    } else if (formType === "ONG") {
      navigate("/creer-entreprise/ong/formulaire");
    } else if (formType === "Association") {
      navigate("/creer-entreprise/association/formulaire");
    } else if (formType === "SCOOP") {
      navigate("/creer-entreprise/scoop/formulaire");
    }
  };

  const handleRequestQuote = () => {
    console.log(`Demande de devis pour ${formType}`);
    // Rediriger vers le formulaire pour les devis aussi
    handleChooseBasic();
  };

  if (isNonProfit) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden shadow-xl">
            {/* Bandeau supérieur */}
            <div className="bg-red-900 text-white text-center py-4">
              <h3 className="text-xl font-bold">{formType} en Côte d'Ivoire</h3>
            </div>
            
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-red-900 mb-4">
                Tarif basique
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Éléments inclus :</h4>
                <ul className="space-y-3">
                  {nonProfitIncludes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="text-4xl font-bold text-red-900 mb-2">199 000 FCFA</div>
                  <div className="text-gray-600">pour l'intérieur</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-900 mb-2">179 000 FCFA</div>
                  <div className="text-gray-600">pour Abidjan</div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg"
                  className="bg-red-900 hover:bg-red-800 text-white px-12 py-4 text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  onClick={handleChooseBasic}
                >
                  Choisir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Tarification pour les sociétés commerciales
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nos tarifs pour votre {formType}
          </h2>
          <p className="text-lg text-gray-600">
            Choisissez l'option qui correspond à votre projet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne 1: Capital ≤ 1 Million FCFA */}
          <Card className="relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-900 to-red-700"></div>
            
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Tarif basique
              </CardTitle>
              <CardDescription className="text-red-900 font-semibold">
                Capital inférieur ou égal à 1 Million FCFA
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 pb-8">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Éléments inclus :</h4>
                <ul className="space-y-3">
                  {commercialIncludes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Options avec prix :</h4>
                <ul className="space-y-2">
                  {commercialOptions.map((option, index) => (
                    <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">{option.name}</span>
                      <span className="font-semibold text-red-900">{option.price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mb-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-red-900 mb-1">399 000 FCFA</div>
                  <div className="text-gray-600">pour l'intérieur</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-900 mb-1">330 000 FCFA</div>
                  <div className="text-gray-600">pour Abidjan</div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg"
                  className="w-full bg-red-900 hover:bg-red-800 text-white py-4 text-lg font-semibold hover:shadow-xl hover:shadow-red-900/25 hover:scale-105 transition-all duration-300"
                  onClick={handleChooseBasic}
                >
                  Choisir
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Colonne 2: Capital ≥ 10 Millions FCFA */}
          <Card className="relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-red-900">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 to-red-900"></div>
            
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Sur devis
              </CardTitle>
              <CardDescription className="text-red-900 font-semibold">
                Capital supérieur ou égal à 10 Millions FCFA
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 pb-8">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Éléments inclus :</h4>
                <ul className="space-y-3">
                  {commercialIncludes.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Options avec prix :</h4>
                <ul className="space-y-2">
                  {commercialOptions.map((option, index) => (
                    <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">{option.name}</span>
                      <span className="font-semibold text-red-900">{option.price}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-red-900 mb-2">
                  Tarif sur devis personnalisé
                </div>
                <div className="text-gray-600">
                  Contactez-nous pour une étude personnalisée
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg"
                  className="w-full bg-red-900 hover:bg-red-800 text-white py-4 text-lg font-semibold hover:shadow-xl hover:shadow-red-900/25 hover:scale-105 transition-all duration-300"
                  onClick={handleRequestQuote}
                >
                  Demander un devis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
