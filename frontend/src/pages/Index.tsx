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
import { useState, useEffect, useRef } from "react";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("FR");
  const [dossierNumber, setDossierNumber] = useState("");
  const carouselApiRef = useRef<any>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleDossierTracking = () => {
    if (dossierNumber.trim()) {
      navigate(`/suivi-dossier?numero=${dossierNumber}`);
    }
  };

  // Hero carousel items with illustration images
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
      {/* Navigation */}
      {/* <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/58eeab48-482f-4e0a-ba88-27030b1aab79.png"
                alt="LAWRY Logo"
                className="h-10 w-auto"
              />
              <Badge
                variant="secondary"
                className="text-xs bg-red-100 text-red-900"
              >
                LegalTech
              </Badge>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-red-900 transition-colors">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{selectedLanguage}</span>
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <DropdownMenuItem
                    onClick={() => setSelectedLanguage("FR")}
                    className="hover:bg-red-50 hover:text-red-900 cursor-pointer"
                  >
                    🇫🇷 Français
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedLanguage("EN")}
                    className="hover:bg-red-50 hover:text-red-900 cursor-pointer"
                  >
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedLanguage("ES")}
                    className="hover:bg-red-50 hover:text-red-900 cursor-pointer"
                  >
                    🇪🇸 Español
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/"
                className={`transition-colors pb-1 ${
                  isActive("/")
                    ? "text-red-900 font-semibold border-b-2 border-red-900"
                    : "text-gray-700 hover:text-red-900"
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/about"
                className={`transition-colors pb-1 ${
                  isActive("/about")
                    ? "text-red-900 font-semibold border-b-2 border-red-900"
                    : "text-gray-700 hover:text-red-900"
                }`}
              >
                À propos
              </Link>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/services">
                      <NavigationMenuTrigger className="text-gray-700 hover:text-red-900 font-normal bg-transparent">
                        Nos Services
                      </NavigationMenuTrigger>
                    </Link>
                    <NavigationMenuContent className="bg-white border shadow-lg z-50">
                      <div className="flex w-[800px] p-4">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                            <Building2 className="h-5 w-5 mr-2" />
                            Création d'entreprise
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to="/creer-entreprise/fondation"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une fondation
                            </Link>
                            <Link
                              to="/creer-entreprise/association"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une association
                            </Link>
                            <Link
                              to="/creer-entreprise/entreprise-individuelle"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Entreprise individuelle
                            </Link>
                            <Link
                              to="/creer-entreprise/sci"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une SCI
                            </Link>
                            <Link
                              to="/creer-entreprise/sas"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une SAS
                            </Link>
                            <Link
                              to="/creer-entreprise/sasu"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une SASU
                            </Link>
                            <Link
                              to="/creer-entreprise/scoop"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une SCOOP
                            </Link>
                            <Link
                              to="/creer-entreprise/sarl"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une SARL
                            </Link>
                            <Link
                              to="/creer-entreprise/ong"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une ONG
                            </Link>
                            <Link
                              to="/creer-entreprise/sarlu"
                              className="block p-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors"
                            >
                              Création d'une SARLU
                            </Link>
                          </div>
                        </div>

                        <div className="flex-1 pl-4 border-l border-gray-200">
                          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                            <Users2 className="h-5 w-5 mr-2" />
                            Autres prestations
                          </h3>
                          <div className="space-y-2">
                            <Link
                              to="/redaction-contrat"
                              className="block p-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors border border-gray-100"
                            >
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Rédaction de contrat
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Contrats sur mesure
                              </p>
                            </Link>
                            <Link
                              to="/conseil"
                              className="block p-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors border border-gray-100"
                            >
                              <div className="flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Conseils et assistance
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Support juridique personnalisé
                              </p>
                            </Link>
                            <Link
                              to="/formation"
                              className="block p-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 rounded transition-colors border border-gray-100"
                            >
                              <div className="flex items-center">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Formations
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Formation juridique pour entreprises
                              </p>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Link
                to="/blog"
                className={`transition-colors pb-1 ${
                  isActive("/blog")
                    ? "text-red-900 font-semibold border-b-2 border-red-900"
                    : "text-gray-700 hover:text-red-900"
                }`}
              >
                Blog
              </Link>
              <Link
                to="/boutique"
                className={`transition-colors pb-1 ${
                  isActive("/boutique")
                    ? "text-red-900 font-semibold border-b-2 border-red-900"
                    : "text-gray-700 hover:text-red-900"
                }`}
              >
                Boutique
              </Link>
              <Link
                to="/contact"
                className={`transition-colors pb-1 ${
                  isActive("/contact")
                    ? "text-red-900 font-semibold border-b-2 border-red-900"
                    : "text-gray-700 hover:text-red-900"
                }`}
              >
                Contact
              </Link>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-900 text-red-900 hover:bg-red-900 hover:text-white"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Connexion
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  asChild
                >
                  <Link to="/chatbot">
                    <Bot className="h-4 w-4 mr-2" />
                    Lawry AI
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav> */}

      <section className="relative mt-20 py-20 overflow-hidden">
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

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto mb-8 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Suivi de dossier
            </h3>
            <div className="flex gap-4">
              <Input
                placeholder="Entrez votre numéro de dossier"
                value={dossierNumber}
                onChange={(e) => setDossierNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleDossierTracking}
                className="bg-red-900 hover:bg-red-800 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Suivre
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Suivez l'état d'avancement de votre dossier en temps réel
            </p>
          </div>

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
      <footer className="bg-gray-100 py-12">
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
      </footer>
    </div>
  );
};

export default Index;
