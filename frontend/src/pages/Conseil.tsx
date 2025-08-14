import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Mail, Clock, Scale, Users, CheckCircle, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useState } from "react";
import LegalConsultationForm from "@/components/forms/LegalConsultationForm";

const Conseil = () => {
  const [showConsultationForm, setShowConsultationForm] = useState(false);

  const services = [
    {
      title: "Consultation téléphonique",
      description: "Conseil juridique immédiat par téléphone",
      duration: "30 minutes",
      price: "25 000 FCFA",
      features: ["Réponse immédiate", "Expert dédié", "Suivi par email"]
    },
    {
      title: "Consultation écrite",
      description: "Analyse juridique détaillée par écrit",
      duration: "Sous 48h",
      price: "50 000 FCFA",
      features: ["Analyse approfondie", "Document officiel", "Recommandations"]
    },
    {
      title: "Accompagnement premium",
      description: "Suivi juridique complet sur plusieurs mois",
      duration: "3 mois",
      price: "150 000 FCFA",
      features: ["Conseiller dédié", "Consultations illimitées", "Veille juridique"]
    }
  ];

  const expertises = [
    "Droit des affaires",
    "Droit du travail", 
    "Droit immobilier",
    "Droit fiscal",
    "Droit commercial",
    "Droit des contrats",
    "Droit des sociétés",
    "Propriété intellectuelle"
  ];

  if (showConsultationForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button 
              variant="outline" 
              onClick={() => setShowConsultationForm(false)}
              className="mb-6"
            >
              ← Retour aux formules
            </Button>
          </div>
          <LegalConsultationForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Conseil Juridique Expert
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Obtenez des conseils juridiques personnalisés de nos experts pour sécuriser vos décisions
          </p>
          <Button 
            size="lg" 
            className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3"
            onClick={() => setShowConsultationForm(true)}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Consultation gratuite
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos formules de conseil
            </h2>
            <p className="text-lg text-gray-600">
              Choisissez la formule qui correspond à vos besoins
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 group hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-red-900">{service.title}</CardTitle>
                    <Badge variant="secondary" className="bg-red-100 text-red-900">
                      {service.duration}
                    </Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                  <div className="text-2xl font-bold text-gray-900">{service.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-red-900 hover:bg-red-800 group-hover:scale-105 transition-all duration-200"
                    onClick={() => setShowConsultationForm(true)}
                  >
                    Choisir cette formule
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos domaines d'expertise
            </h2>
            <p className="text-lg text-gray-600">
              Une expertise complète dans tous les domaines du droit
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expertises.map((expertise, index) => (
              <Card key={index} className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-red-50">
                <Scale className="h-8 w-8 text-red-900 mx-auto mb-2" />
                <p className="font-medium text-gray-900">{expertise}</p>
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
              Comment ça marche ?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Décrivez votre situation</h3>
              <p className="text-gray-600">Expliquez-nous votre problématique juridique</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sélectionnez un expert</h3>
              <p className="text-gray-600">Nous vous orientons vers le bon spécialiste</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Recevez vos conseils</h3>
              <p className="text-gray-600">Obtenez une réponse claire et actionnable</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Suivi personnalisé</h3>
              <p className="text-gray-600">Bénéficiez d'un accompagnement continu</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un conseil juridique ?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Nos experts sont à votre disposition pour vous accompagner
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3"
              onClick={() => setShowConsultationForm(true)}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Consultation immédiate
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-900" asChild>
              <Link to="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Nous appeler
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Conseil;
