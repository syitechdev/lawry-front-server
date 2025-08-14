import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Building2, 
  Users2, 
  FileText, 
  MessageSquare, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Shield,
  Star,
  Zap,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  Home,
  Phone,
  Mail,
  Calculator,
  Scale,
  BookOpen,
  Handshake,
  AlertTriangle,
  Crown,
  Sparkles,
  Gift
} from "lucide-react";

const Services = () => {
  const [isYearly, setIsYearly] = useState(false);

  const mainServices = [
    {
      id: "creation-entreprise",
      title: "Création d'Entreprise",
      description: "Donnez une existence légale à votre activité avec un accompagnement complet.",
      icon: Building2,
      features: [
        "Choix de la structure juridique adaptée (SARL, SASU, etc.)",
        "Démarches administratives et documents officiels",
        "Planification fiscale pour optimiser les charges"
      ],
      gradient: "from-blue-500 to-blue-600",
      popular: true,
      link: "/creer-entreprise"
    },
    {
      id: "conseil-assistance",
      title: "Conseil et Assistance Juridique",
      description: "Accompagnement personnalisé pour toutes vos questions juridiques.",
      icon: MessageSquare,
      features: [
        "Analyse personnalisée et recommandations",
        "Mise en conformité réglementaire",
        "Représentation légale selon besoin"
      ],
      gradient: "from-green-500 to-green-600",
      popular: false,
      link: "/conseil"
    },
    {
      id: "redaction-contrats",
      title: "Rédaction de Contrats",
      description: "Accords juridiques solides pour sécuriser vos relations professionnelles.",
      icon: FileText,
      features: [
        "Contrats commerciaux",
        "Contrats de travail (CDI, CDD, etc.)",
        "Contrats spécifiques (mandat, partenariat, etc.)"
      ],
      gradient: "from-purple-500 to-purple-600",
      popular: false,
      link: "/redaction-contrat"
    }
  ];

  const additionalServices = [
    {
      title: "Audit Juridique",
      icon: Shield,
      description: "Évaluation approfondie pour vérifier la conformité",
      color: "text-red-600"
    },
    {
      title: "Formations",
      icon: GraduationCap,
      description: "Développement des compétences juridiques",
      color: "text-orange-600"
    },
    {
      title: "Gestion Comptable",
      icon: Calculator,
      description: "Optimisation financière et fiscale",
      color: "text-teal-600"
    },
    {
      title: "Gestion Immobilière",
      icon: Home,
      description: "Service complet de gestion locative",
      color: "text-indigo-600"
    },
    {
      title: "Gestion RH",
      icon: Users2,
      description: "Optimisation des procédures RH",
      color: "text-pink-600"
    },
    {
      title: "Recouvrement",
      icon: TrendingUp,
      description: "Accélération des encaissements",
      color: "text-yellow-600"
    }
  ];

  const subscriptionPlans = [
    {
      name: "Essai Gratuit",
      monthlyPrice: 0,
      yearlyPrice: 0,
      duration: "14 jours",
      features: [
        "5 consultations juridiques en ligne (25 min)",
        "Assistance par téléphone ou email"
      ],
      popular: false,
      gradient: "from-green-400 to-green-500",
      isTrial: true
    },
    {
      name: "Basic",
      monthlyPrice: 24999,
      yearlyPrice: 249990,
      features: [
        "Une consultation juridique par mois",
        "Assistance par téléphone ou email",
        "Réponse sous 48 heures ouvrables"
      ],
      popular: false,
      gradient: "from-gray-400 to-gray-500"
    },
    {
      name: "Premium",
      monthlyPrice: 49950,
      yearlyPrice: 499500,
      features: [
        "Trois consultations juridiques par mois",
        "Assistance prioritaire par téléphone ou email",
        "Réponse sous 24 heures",
        "Analyse succincte de documents juridiques"
      ],
      popular: true,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      name: "Business",
      monthlyPrice: 99000,
      yearlyPrice: 990000,
      features: [
        "Consultations juridiques illimitées",
        "Réponse prioritaire sous 12 heures",
        "Assistance à la rédaction de contrats simples",
        "Veille juridique personnalisée"
      ],
      popular: false,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      name: "Corporate",
      monthlyPrice: 299000,
      yearlyPrice: 2990000,
      features: [
        "Consultations juridiques illimitées et personnalisées",
        "Assistance à la rédaction de contrats complexes",
        "Gestion des contentieux légers",
        "Conseil stratégique sur des problématiques juridiques"
      ],
      popular: false,
      gradient: "from-red-500 to-red-600"
    }
  ];

  const punctualServices = [
    {
      name: "SARL",
      price: 300000,
      category: "CRÉATION DE SOCIÉTÉ"
    },
    {
      name: "Entreprise Individuelle",
      price: 150000,
      category: "CRÉATION DE SOCIÉTÉ"
    },
    {
      name: "SCOOP",
      price: 350000,
      category: "CRÉATION DE SOCIÉTÉ"
    },
    {
      name: "ONG",
      price: 400000,
      category: "CRÉATION DE SOCIÉTÉ"
    },
    {
      name: "SCI",
      price: "Sur devis",
      category: "CRÉATION DE SOCIÉTÉ"
    },
    {
      name: "SAS",
      price: "Sur devis",
      category: "CRÉATION DE SOCIÉTÉ"
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    const yearlyMonthly = yearly / 12;
    const discount = ((monthly - yearlyMonthly) / monthly) * 100;
    return Math.round(discount);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-red-900 to-red-800 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Badge variant="secondary" className="bg-white/20 text-white text-sm px-4 py-2 backdrop-blur-sm">
                  <Scale className="h-4 w-4 mr-2" />
                  Nos Services Juridiques – Lawry Conseils CI
                </Badge>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                Notre Expertise
                <span className="block text-red-200">à Votre Service</span>
              </h1>
              <p className="text-xl text-red-100 mb-8 max-w-4xl mx-auto animate-fade-in">
                Notre cabinet met à votre disposition un savoir-faire juridique de haut niveau, 
                alliant rigueur professionnelle et approche personnalisée, pour accompagner 
                efficacement particuliers et entreprises dans leurs démarches juridiques.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                <Button asChild size="lg" className="bg-white text-red-900 hover:bg-red-50 text-lg px-8 py-3 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Link to="/conseil-gratuit">
                    <Phone className="mr-2 h-5 w-5" />
                    Consultation gratuite
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-900 hover:scale-105 transition-all duration-200">
                  <Link to="/contact">
                    <Mail className="mr-2 h-5 w-5" />
                    Contactez-nous
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Services Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Services Principaux</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Trois piliers fondamentaux pour votre accompagnement juridique
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mainServices.map((service, index) => (
                <Card key={service.id} className={`relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 group hover:scale-105 animate-fade-in ${service.popular ? 'ring-2 ring-red-500' : ''}`}>
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-red-500 text-white px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Populaire
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative p-6">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${service.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <service.icon className="h-8 w-8" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{service.description}</p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full bg-red-900 hover:bg-red-800 group-hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg" asChild>
                      <Link to={service.link}>
                        <Handshake className="mr-2 h-4 w-4" />
                        En savoir plus
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Services Infographic */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Services Complémentaires</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une gamme étendue de services pour répondre à tous vos besoins juridiques
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => (
                <div key={index} className="group">
                  <Card className="p-6 h-full bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-red-500">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gray-100 group-hover:bg-red-50 transition-colors duration-200`}>
                        <service.icon className={`h-6 w-6 ${service.color} group-hover:text-red-600 transition-colors duration-200`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription Plans Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-red-900 mr-3" />
                <h2 className="text-4xl font-bold text-gray-900">Abonnements Juridiques LAWRY</h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                Choisissez l'abonnement qui correspond à vos besoins juridiques
              </p>
              
              {/* Pricing Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <span className={`text-sm font-medium ${!isYearly ? 'text-red-900' : 'text-gray-500'}`}>
                  Mensuel
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-red-900"
                />
                <span className={`text-sm font-medium ${isYearly ? 'text-red-900' : 'text-gray-500'}`}>
                  Annuel
                </span>
                {isYearly && (
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Jusqu'à 20% d'économie
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subscriptionPlans.map((plan, index) => {
                const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                const displayPrice = isYearly && !plan.isTrial ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
                const discount = isYearly && !plan.isTrial ? getDiscountPercentage(plan.monthlyPrice, plan.yearlyPrice / 12) : 0;
                
                return (
                  <Card key={plan.name} className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${plan.popular ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-white scale-105' : 'bg-white'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold">
                          <Award className="h-4 w-4 mr-1" />
                          Le plus populaire
                        </Badge>
                      </div>
                    )}

                    {plan.isTrial && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold">
                          <Gift className="h-4 w-4 mr-1" />
                          Essai Gratuit
                        </Badge>
                      </div>
                    )}
                    
                    {isYearly && discount > 0 && !plan.isTrial && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                          -{discount}%
                        </Badge>
                      </div>
                    )}
                    
                    <div className="relative p-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                        <div className="flex items-baseline justify-center mb-2">
                          {plan.isTrial ? (
                            <div className="text-center">
                              <span className="text-4xl font-bold text-green-600">GRATUIT</span>
                              <div className="text-sm text-gray-500 mt-1">{plan.duration}</div>
                            </div>
                          ) : (
                            <>
                              <span className="text-4xl font-bold text-red-900">
                                {formatPrice(displayPrice)}
                              </span>
                              <span className="text-gray-500 ml-2">FCFA / mois</span>
                            </>
                          )}
                        </div>
                        {isYearly && !plan.isTrial && (
                          <div className="text-sm text-gray-500">
                            Facturé {formatPrice(currentPrice)} FCFA / an
                          </div>
                        )}
                        {!isYearly && !plan.isTrial && (
                          <div className="text-sm text-gray-400">
                            Facturation mensuelle
                          </div>
                        )}
                      </div>

                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : plan.isTrial ? 'bg-green-600 hover:bg-green-700' : 'bg-red-900 hover:bg-red-800'} transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 py-3`}>
                        <Zap className="mr-2 h-4 w-4" />
                        {plan.isTrial ? 'Commencer l\'essai' : `Choisir ${plan.name}`}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Services Ponctuels Section */}
            <div className="mt-16">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Services Ponctuels</h3>
                <p className="text-lg text-gray-600">Création de société - Tarifs fixes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {punctualServices.map((service, index) => (
                  <Card key={index} className="p-6 bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-red-500">
                    <div className="text-center">
                      <div className="p-3 rounded-lg bg-red-50 inline-block mb-4">
                        <Building2 className="h-8 w-8 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{service.name}</h4>
                      <div className="text-2xl font-bold text-red-900 mb-2">
                        {typeof service.price === 'number' ? `${formatPrice(service.price)} FCFA` : service.price}
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                        {service.category}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="text-sm text-gray-500 mb-4">
                Toutes nos offres incluent un support client dédié et une garantie de satisfaction
              </p>
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Paiement sécurisé
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Résiliation à tout moment
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mr-4" />
              <div>
                <h2 className="text-4xl font-bold mb-2">Besoin d'un accompagnement personnalisé ?</h2>
                <p className="text-xl text-gray-300">
                  Contactez-nous dès aujourd'hui pour bénéficier d'une consultation et découvrir 
                  comment Lawry peut vous accompagner avec efficacité, discrétion et compétence.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="bg-red-900 hover:bg-red-800 text-lg px-8 py-3 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Link to="/conseil-gratuit">
                  <Phone className="mr-2 h-5 w-5" />
                  Consultation gratuite
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-200">
                <BookOpen className="mr-2 h-5 w-5" />
                Télécharger notre guide
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Services;
