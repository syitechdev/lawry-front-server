
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast } from "sonner";

const ClientPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const plans = [
    {
      id: "plan1",
      nom: "Basique",
      prix: 15000,
      periode: "mois",
      description: "Idéal pour les particuliers et petites entreprises",
      fonctionnalites: [
        "Consultation juridique illimitée",
        "Création d'un type de société",
        "Support par email",
        "Suivi de dossier en ligne"
      ],
      populaire: false,
      couleur: "blue",
      avantages: [
        "Accès 24/7 à la plateforme",
        "Réponse sous 48h",
        "Documents de base inclus"
      ]
    },
    {
      id: "plan2", 
      nom: "Professionnel",
      prix: 35000,
      periode: "mois",
      description: "Pour les entreprises en croissance",
      fonctionnalites: [
        "Tout du plan Basique",
        "Création illimitée de sociétés",
        "Rédaction de contrats personnalisés",
        "Support téléphonique prioritaire",
        "Formation juridique incluse"
      ],
      populaire: true,
      couleur: "red",
      avantages: [
        "Juriste dédié",
        "Réponse sous 24h", 
        "Formation mensuelle gratuite",
        "Remise 20% sur les services"
      ]
    },
    {
      id: "plan3",
      nom: "Entreprise",
      prix: 75000,
      periode: "mois", 
      description: "Solution complète pour grandes entreprises",
      fonctionnalites: [
        "Tout du plan Professionnel",
        "Juriste dédié",
        "Audit juridique annuel",
        "Formation sur site",
        "Support 24/7"
      ],
      populaire: false,
      couleur: "purple",
      avantages: [
        "Équipe juridique dédiée",
        "Réponse immédiate",
        "Formations illimitées",
        "Audit annuel gratuit",
        "Remise 30% sur tous les services"
      ]
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    toast.success(`Plan ${plan?.nom} sélectionné - Redirection vers le paiement...`);
    // Ici on redirigerait vers la page de paiement
  };

  const getPlanBadgeColor = (couleur: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      red: "bg-red-100 text-red-800 border-red-200", 
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      green: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[couleur as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPlanGradient = (couleur: string) => {
    const gradients = {
      blue: "from-blue-50 to-blue-100",
      red: "from-red-50 to-red-100",
      purple: "from-purple-50 to-purple-100",
      green: "from-green-50 to-green-100"
    };
    return gradients[couleur as keyof typeof gradients] || "from-gray-50 to-gray-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="client" userName="Client Lawry" userEmail="client@lawry.ci" />
      
      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Choisissez Votre Plan</h1>
              <p className="text-red-100">Sélectionnez l'offre qui correspond le mieux à vos besoins</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.populaire 
                  ? 'ring-2 ring-red-500 shadow-lg scale-105' 
                  : 'hover:scale-102'
              } ${selectedPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.populaire && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                    <Crown className="h-4 w-4 mr-1" />
                    Le Plus Populaire
                  </Badge>
                </div>
              )}
              
              <div className={`bg-gradient-to-br ${getPlanGradient(plan.couleur)} p-6 rounded-t-lg`}>
                <div className="text-center">
                  <Badge className={`${getPlanBadgeColor(plan.couleur)} mb-4 px-3 py-1`}>
                    {plan.nom}
                  </Badge>
                  
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.prix.toLocaleString()} 
                    <span className="text-sm font-normal text-gray-600 ml-1">FCFA</span>
                  </div>
                  <div className="text-gray-600">par {plan.periode}</div>
                  
                  <p className="text-gray-700 text-sm mt-3 mb-4">{plan.description}</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    Fonctionnalités incluses
                  </h4>
                  <ul className="space-y-2">
                    {plan.fonctionnalites.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Avantages exclusifs</h4>
                  <ul className="space-y-2">
                    {plan.avantages.map((avantage, index) => (
                      <li key={index} className="flex items-start space-x-3 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{avantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full ${
                    plan.populaire 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  size="lg"
                >
                  {selectedPlan === plan.id ? 'Plan Sélectionné' : 'Choisir ce Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Questions Fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Puis-je changer de plan à tout moment ?</h4>
              <p className="text-gray-600 text-sm">Oui, vous pouvez modifier votre plan à tout moment. Les changements prennent effet immédiatement.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Y a-t-il des frais d'installation ?</h4>
              <p className="text-gray-600 text-sm">Non, aucun frais d'installation n'est requis. Vous payez uniquement votre abonnement mensuel.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Que se passe-t-il si je dépasse les limites de mon plan ?</h4>
              <p className="text-gray-600 text-sm">Nous vous préviendrons avant d'atteindre les limites et vous pourrez facilement passer à un plan supérieur.</p>
            </div>
          </CardContent>
        </Card>

        {/* Support Contact */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Besoin d'aide pour choisir ?</h3>
          <p className="text-gray-600 mb-4">Notre équipe est là pour vous conseiller</p>
          <Button variant="outline">
            Contacter un conseiller
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientPlans;
