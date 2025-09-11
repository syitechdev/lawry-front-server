import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Users,
  MessageSquare,
  FileText,
  Scale,
  Briefcase,
  Home,
  TrendingUp,
  UserCheck,
  BookOpen,
  DollarSign,
  User,
  LogIn,
  Building2,
  Users2,
  GraduationCap,
  PlusCircle,
  HelpCircle,
  Globe,
  ChevronDown,
  Search,
  Bot,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import DossierSearchForm from "@/components/DossierSearchForm";

const Index = () => {
  const location = useLocation();
  const [params] = useSearchParams();

  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("FR");
  const [dossierNumber, setDossierNumber] = useState("");
  const carouselApiRef = useRef<any>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      navigate(`/suivi-dossier/${encodeURIComponent(ref)}`, { replace: true });
    }
  }, [params, navigate]);

  const heroSlides = [
    {
      title: "Créer votre entreprise",
      description: "Accompagnement complet pour la création de votre société",
      cta: "Créer une entreprise",
      route: "/creer-entreprise",
      icon: PlusCircle,
      gradient: "from-red-900 to-red-800",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&crop=center",
    },
    {
      title: "Se faire conseiller",
      description: "Conseil juridique personnalisé par nos experts",
      cta: "Se faire conseiller",
      route: "/conseil",
      icon: HelpCircle,
      gradient: "from-slate-800 to-slate-700",
      image:
        "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=800&h=400&fit=crop&crop=center",
    },
    {
      title: "Rédiger un contrat",
      description: "Rédaction professionnelle de tous types de contrats",
      cta: "Rédiger un contrat",
      route: "/redaction-contrat",
      icon: FileText,
      gradient: "from-gray-800 to-gray-700",
      image:
        "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop&crop=center",
    },
    {
      title: "Se former",
      description: "Formations juridiques pour entreprises et particuliers",
      cta: "Se former",
      route: "/formation",
      icon: BookOpen,
      gradient: "from-red-900 to-red-800",
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop&crop=center",
    },
  ];

  // Auto-scroll effect for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselApiRef.current) {
        carouselApiRef.current.scrollNext();
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      title: "Création de société",
      description:
        "Accompagnement complet pour la création de votre entreprise",
      icon: Briefcase,
      features: [
        "Formulaires personnalisés",
        "Suivi juridique",
        "Pièces jointes sécurisées",
      ],
      price: "À partir de 299€",
    },
    {
      title: "Gestion comptable et fiscale",
      description: "Optimisation fiscale et gestion comptable externalisée",
      icon: TrendingUp,
      features: [
        "Devis personnalisé",
        "Suivi déclarations",
        "Archivage sécurisé",
      ],
      price: "Sur devis",
    },
    {
      title: "Gestion immobilière",
      description: "Assistance complète pour vos projets immobiliers",
      icon: Home,
      features: ["Contrats de bail", "Gestion litiges", "Conseil juridique"],
      price: "À partir de 150€",
    },
    {
      title: "Gestion RH",
      description: "Solutions RH complètes pour votre entreprise",
      icon: UserCheck,
      features: [
        "Modèles de contrats",
        "Procédures internes",
        "Formation équipes",
      ],
      price: "À partir de 199€",
    },
    {
      title: "Conseil juridique",
      description: "Assistance et conseil juridique personnalisé",
      icon: Scale,
      features: ["Consultation écrite", "Chat avec juriste", "Prise de RDV"],
      price: "À partir de 99€",
    },
    {
      title: "Rédaction de contrats",
      description: "Rédaction professionnelle de tous types de contrats",
      icon: FileText,
      features: [
        "Générateur intelligent",
        "Personnalisation IA",
        "Révision juriste",
      ],
      price: "À partir de 199€",
    },
  ];

  const workflow = [
    {
      step: 1,
      title: "Choix du service",
      description: "Sélectionnez le service juridique adapté",
    },
    {
      step: 2,
      title: "Formulaire",
      description: "Remplissez le formulaire et joignez vos documents",
    },
    {
      step: 3,
      title: "Compte client",
      description: "Création de votre espace sécurisé",
    },
    {
      step: 4,
      title: "Paiement",
      description: "Paiement sécurisé en ligne",
    },
    {
      step: 5,
      title: "Traitement",
      description: "Nos juristes traitent votre dossier",
    },
    {
      step: 6,
      title: "Livraison",
      description: "Téléchargement de vos documents",
    },
  ];

  const advantages = [
    {
      icon: Clock,
      title: "24h/24 - 7j/7",
      description: "Accès à nos services à tout moment",
    },
    {
      icon: DollarSign,
      title: "Tarifs transparents",
      description: "Prix compétitifs et sans surprise",
    },
    {
      icon: Shield,
      title: "Sécurité garantie",
      description: "Données protégées et confidentielles",
    },
    {
      icon: Users,
      title: "Experts qualifiés",
      description: "Juristes expérimentés à votre service",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      <section className="relative  py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Conseils & Assistance
              <span className="text-red-900 block bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">
                Juridique Simplifiés
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
              Offrez aux PME et particuliers un accès facilité aux services
              juridiques à moindre coût, rapide et sans déplacement. 100% en
              ligne, disponible 24h/24.
            </p>
          </div>
          <Carousel
            className="w-full max-w-4xl mx-auto mb-12"
            setApi={(api) => {
              carouselApiRef.current = api;
            }}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden">
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`}
                        ></div>
                      </div>

                      <div className="relative text-white p-8 text-center">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                          <slide.icon className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">
                          {slide.title}
                        </h2>
                        <p className="text-lg mb-6 text-white/90">
                          {slide.description}
                        </p>
                        <Button
                          size="lg"
                          variant="outline"
                          className="bg-white/20 border-white text-white hover:bg-white hover:text-gray-900"
                          asChild
                        >
                          <Link to={slide.route}>
                            {slide.cta}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <DossierSearchForm
            onSubmit={(ref) =>
              navigate(`/suivi-dossier/${encodeURIComponent(ref)}`)
            }
            placeholder="Saisir une référence (DEM-...)"
          />
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button
              size="lg"
              className="bg-red-900 hover:bg-red-800 text-lg px-8 py-3 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              asChild
            >
              <Link to="/services">
                Découvrir nos services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-red-900 text-red-900 hover:bg-red-900 hover:text-white hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link to="/conseil-gratuit">
                <MessageSquare className="mr-2 h-5 w-5" />
                Conseil gratuit
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir LAWRY ?
            </h2>
            <p className="text-lg text-gray-600">
              Une approche moderne du conseil juridique
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-gradient-to-br from-red-100 to-red-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300 shadow-lg">
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

      {/* Qui sommes-nous Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Qui sommes-nous ?
            </h2>
            <p className="text-lg text-gray-600">
              Votre partenaire juridique de confiance
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                <p className="text-lg mb-6">
                  Créé en 2020, <strong className="text-red-900">LAWRY</strong>{" "}
                  est un cabinet de Conseil & Assistance Juridique fondé par{" "}
                  <strong>Mlle CHERIF Laurie Noëlla</strong>, dédié à
                  l'accompagnement des entrepreneurs, entreprises et
                  particuliers.
                </p>
                <p className="mb-6">
                  Nous proposons des solutions juridiques innovantes, adaptées
                  aux besoins spécifiques de chaque client. Bien plus qu'un
                  simple cabinet de conseil, LAWRY se positionne comme un
                  véritable partenaire stratégique, engagé à sécuriser vos
                  projets et à garantir la conformité de vos activités aux
                  exigences légales.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Scale className="h-8 w-8 text-red-900" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Expertise</h3>
                    <p className="text-sm text-gray-600">
                      Conseil juridique de qualité
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-red-900" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Accompagnement
                    </h3>
                    <p className="text-sm text-gray-600">Suivi personnalisé</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-red-900" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Conformité</h3>
                    <p className="text-sm text-gray-600">
                      Respect des exigences légales
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600">
              Un processus simple et efficace en 6 étapes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workflow.map((item, index) => (
              <div
                key={index}
                className="relative hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-red-900 to-red-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-full w-full">
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
              <p className="text-xl mb-6 text-red-100">
                Démocratiser l'accès au conseil juridique en offrant des
                services de qualité, accessibles et innovants pour tous.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Expertise juridique reconnue</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Innovation technologique</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Transparence et confiance</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <p className="text-red-100">📞 +225 0101987580</p>
                <p className="text-red-100">📞 +225 0709122074</p>
                <p className="text-red-100">
                  📧 contact.lawryconsulting@gmail.com
                </p>
                <p className="text-red-100">
                  📍 Abidjan Cocody Faya rond point de la cité sir, appartement
                  A7
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez des milliers d'entreprises qui font confiance à LAWRY
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-red-900 hover:bg-red-800 text-lg px-8 py-3 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              asChild
            >
              <Link to="/conseil-gratuit">
                <MessageSquare className="mr-2 h-5 w-5" />
                Consultation gratuite
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white hover:bg-white hover:scale-105 transition-all duration-200 text-red-950"
              asChild
            >
              <Link to="/boutique">Découvrir nos tarifs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* LAWRY AI Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 animate-pulse relative overflow-hidden"
          title="LAWRY AI - Assistant juridique intelligent"
          asChild
        >
          <Link to="/chatbot">
            <Bot className="h-7 w-7" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full"></div>
          </Link>
        </Button>
      </div>

      {/* Footer */}
      {/* <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/lovable-uploads/58eeab48-482f-4e0a-ba88-27030b1aab79.png"
                  alt="LAWRY Logo"
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-600">
                Votre partenaire juridique de confiance pour tous vos besoins
                légaux.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link
                    to="/creer-entreprise"
                    className="hover:text-red-900 transition-colors"
                  >
                    Création de société
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-red-900 transition-colors"
                  >
                    Gestion comptable
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-red-900 transition-colors"
                  >
                    Gestion immobilière
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-red-900 transition-colors"
                  >
                    Gestion RH
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Ressources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link
                    to="/blog"
                    className="hover:text-red-900 transition-colors"
                  >
                    Blog juridique
                  </Link>
                </li>
                <li>
                  <Link
                    to="/formation"
                    className="hover:text-red-900 transition-colors"
                  >
                    Formations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-red-900 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-red-900 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <p className="text-gray-600 mb-2">
                📧 contact.lawryconsulting@gmail.com
              </p>
              <p className="text-gray-600 mb-2">📞 +225 0101987580</p>
              <p className="text-gray-600 mb-2">📞 +225 0709122074</p>
              <p className="text-gray-600">📍 Abidjan Cocody Faya</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>
              &copy; 2024 LAWRY. Tous droits réservés. Plateforme LegalTech
              innovante.
            </p>
          </div>
        </div>
      </footer> */}
      <Footer />
    </div>
  );
};

export default Index;
