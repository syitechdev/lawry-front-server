import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CheckCircle, Building, Users, FileText, Sparkles, Zap } from "lucide-react";
import Header from "@/components/Header";
import PricingSection from "@/components/PricingSection";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LegalFormData {
  title: string;
  description: string;
  advantages: string[];
  minCapital: string;
  responsability: string;
  image: string;
  detailedDescription: string;
  requirements: string[];
  process: string[];
  faq: { question: string; answer: string; }[];
}

interface LegalFormPresentationProps {
  formData: LegalFormData;
}

const LegalFormPresentation = ({ formData }: LegalFormPresentationProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleStartCreation = () => {
    console.log(`Demande de redirection vers la section tarification pour ${formData.title}`);
    // Scroll vers la section de tarification au lieu de rediriger directement
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const legalForms = [
    { name: "SARL", path: "/creer-entreprise/sarl", description: "Société à Responsabilité Limitée" },
    { name: "SAS", path: "/creer-entreprise/sas", description: "Société par Actions Simplifiée" },
    { name: "SARLU", path: "/creer-entreprise/sarlu", description: "SARL Unipersonnelle" },
    { name: "SA", path: "/creer-entreprise/sa", description: "Société Anonyme" },
    { name: "SAU", path: "/creer-entreprise/sau", description: "Société Anonyme Unipersonnelle" },
    { name: "EURL", path: "/creer-entreprise/eurl", description: "Entreprise Unipersonnelle à Responsabilité Limitée" },
    { name: "SCI", path: "/creer-entreprise/sci", description: "Société Civile Immobilière" },
    { name: "Auto-entrepreneur", path: "/creer-entreprise/auto-entrepreneur", description: "Régime simplifié" },
    { name: "SCOOP", path: "/creer-entreprise/scoop", description: "Société Coopérative" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Créer une {formData.title}
              </h1>
              <p className="text-xl mb-8 text-red-100">
                {formData.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-red-900 hover:bg-yellow-400 hover:text-red-900 text-lg px-8 py-4 hover:scale-105 transition-all duration-300 shadow-2xl group relative overflow-hidden"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={handleStartCreation}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Sparkles className="mr-2 h-6 w-6 relative z-10 animate-pulse" />
                  <span className="relative z-10 font-bold">Commencer ma création</span>
                  <ArrowRight className="ml-2 h-6 w-6 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
              <div className="mt-6 flex items-center text-red-100">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                <span className="text-sm">Création rapide en 7-15 jours</span>
              </div>
            </div>
            <div className="relative">
              <img 
                src={formData.image} 
                alt={formData.title}
                className="w-full h-80 object-cover rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg" />
              <div className="absolute top-4 right-4 bg-yellow-400 text-red-900 px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                Populaire ⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CTA Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 rounded-full px-8 py-4 animate-pulse"
          onClick={handleStartCreation}
        >
          <Building className="mr-2 h-5 w-5" />
          <span className="font-bold">Créer maintenant</span>
        </Button>
      </div>

      {/* Presentation Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Présentation de la {formData.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {formData.detailedDescription}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Capital minimum</h3>
                    <p className="text-gray-600">{formData.minCapital}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-6 w-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Responsabilité</h3>
                    <p className="text-gray-600">{formData.responsability}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Card className="p-6 border-2 border-red-100 hover:border-red-200 transition-colors duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-gray-900 flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    Avantages principaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {formData.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-center hover:bg-green-50 p-2 rounded transition-colors duration-200">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/90 to-red-500/90"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-4xl md:text-5xl font-bold text-red-900 mb-6 animate-pulse">
              🚀 Prêt à démarrer votre {formData.title} ?
            </h2>
            <p className="text-xl text-red-800 mb-8 font-semibold">
              Plus de 1000 entrepreneurs nous ont fait confiance
            </p>
            <Button
              size="lg"
              className="bg-red-900 hover:bg-red-800 text-white text-2xl px-16 py-8 hover:scale-110 transition-all duration-300 shadow-2xl group relative overflow-hidden rounded-full"
              onClick={handleStartCreation}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              <Sparkles className="mr-3 h-8 w-8 animate-spin group-hover:animate-pulse relative z-10" />
              <span className="font-bold relative z-10">COMMENCER MAINTENANT</span>
              <ArrowRight className="ml-3 h-8 w-8 transform group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
            </Button>
            <p className="text-lg text-red-700 mt-6 font-medium">
              ⚡ Processus 100% en ligne • 🛡️ Sécurisé • 📞 Support inclus
            </p>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Conditions requises
            </h2>
            <p className="text-lg text-gray-600">
              Ce dont vous avez besoin pour créer votre {formData.title}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formData.requirements.map((requirement, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <FileText className="h-12 w-12 text-red-900 mx-auto mb-4" />
                <p className="text-gray-700">{requirement}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Processus de création
            </h2>
            <p className="text-lg text-gray-600">
              Les étapes pour créer votre {formData.title}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {formData.process.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-900">{index + 1}</span>
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Change Legal Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Voulez-vous changer de choix ?
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez les autres formes juridiques disponibles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalForms.map((form, index) => (
              <Card 
                key={index} 
                className={`p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                  formData.title === form.name ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => navigate(form.path)}
              >
                <div className="mb-4">
                  <Building className="h-12 w-12 text-red-900 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-900">{form.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                </div>
                <Button
                  className={`w-full ${
                    formData.title === form.name 
                      ? 'bg-red-900 text-white cursor-not-allowed' 
                      : 'bg-red-100 text-red-900 hover:bg-red-900 hover:text-white'
                  }`}
                  disabled={formData.title === form.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (formData.title !== form.name) {
                      navigate(form.path);
                    }
                  }}
                >
                  {formData.title === form.name ? 'Forme actuelle' : 'Découvrir'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing-section">
        <PricingSection formType={formData.title} />
      </div>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-lg text-gray-600">
              Tout ce que vous devez savoir sur la {formData.title}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {formData.faq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à créer votre {formData.title} ?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Commencez dès maintenant avec LAWRY
          </p>
          <Button 
            size="lg" 
            className="bg-white text-red-900 hover:bg-yellow-400 hover:text-red-900 text-lg px-12 py-6 hover:scale-105 transition-all duration-300 shadow-2xl group relative overflow-hidden"
            onClick={handleStartCreation}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ArrowRight className="mr-3 h-6 w-6 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
            <span className="relative z-10 font-bold">Commencer ma création</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LegalFormPresentation;
