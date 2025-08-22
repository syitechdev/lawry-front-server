import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Clock,
  Users,
  Shield,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const RedactionContrat = () => {
  const contractTypes = [
    {
      title: "Contrat de travail",
      description: "CDI, CDD, stage, freelance",
      price: "À partir de 75 000 FCFA",
      features: [
        "Clauses personnalisées",
        "Conforme au droit ivoirien",
        "Révision incluse",
      ],
    },
    {
      title: "Contrat commercial",
      description: "Vente, prestation, partenariat",
      price: "À partir de 100 000 FCFA",
      features: [
        "Conditions négociées",
        "Protection juridique",
        "Clauses spécifiques",
      ],
    },
    {
      title: "Contrat immobilier",
      description: "Bail, vente, gestion locative",
      price: "À partir de 125 000 FCFA",
      features: [
        "Conforme à la loi",
        "Clauses de protection",
        "Annexes incluses",
      ],
    },
    {
      title: "Contrat sur mesure",
      description: "Contrat spécifique à votre activité",
      price: "Sur devis",
      features: [
        "Entièrement personnalisé",
        "Expertise pointue",
        "Accompagnement dédié",
      ],
    },
  ];

  const advantages = [
    {
      icon: FileText,
      title: "Rédaction professionnelle",
      description: "Contrats rédigés par nos juristes experts",
    },
    {
      icon: Shield,
      title: "Protection maximale",
      description: "Clauses de protection adaptées à vos besoins",
    },
    {
      icon: Clock,
      title: "Livraison rapide",
      description: "Contrats livrés sous 48h à 5 jours ouvrables",
    },
    {
      icon: Users,
      title: "Accompagnement",
      description: "Support et conseils tout au long du processus",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Rédaction de Contrats
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Protégez vos intérêts avec des contrats sur mesure, rédigés par nos
            juristes experts
          </p>
          <Button
            size="lg"
            className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3"
            asChild
          >
            <Link to="/redaction-contrat/formulaire">
              <FileText className="mr-2 h-5 w-5" />
              Demander un devis
            </Link>
          </Button>
        </div>
      </section>

      {/* Contract Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Types de contrats
            </h2>
            <p className="text-lg text-gray-600">
              Nous rédigeons tous types de contrats selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contractTypes.map((contract, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 group hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-red-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {contract.title}
                    </CardTitle>
                  </div>
                  <CardDescription>{contract.description}</CardDescription>
                  <div className="text-2xl font-bold text-gray-900">
                    {contract.price}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {contract.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-red-900 hover:bg-red-800 group-hover:scale-105 transition-all duration-200"
                    asChild
                  >
                    <Link to="/redaction-contrat/formulaire">
                      Commander ce contrat
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir LAWRY ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <advantage.icon className="h-8 w-8 text-red-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Notre processus de rédaction
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              {
                step: 1,
                title: "Analyse des besoins",
                desc: "Discussion de vos besoins spécifiques",
              },
              {
                step: 2,
                title: "Rédaction",
                desc: "Rédaction par nos juristes experts",
              },
              {
                step: 3,
                title: "Révision",
                desc: "Relecture et ajustements nécessaires",
              },
              {
                step: 4,
                title: "Validation",
                desc: "Validation avec le client",
              },
              {
                step: 5,
                title: "Livraison",
                desc: "Livraison du contrat final",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-red-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'un contrat sur mesure ?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Nos juristes sont prêts à rédiger le contrat parfait pour vous
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3"
              asChild
            >
              <Link to="/redaction-contrat/formulaire">
                <FileText className="mr-2 h-5 w-5" />
                Commencer maintenant
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white hover:bg-white text-red-950"
              asChild
            >
              <Link to="/redaction-contrat/formulaire">
                Demander un devis gratuit
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RedactionContrat;
