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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ArrowRight,
  Building,
  CheckCircle,
  Phone,
  FileText,
  Users,
  Scale,
  MessageSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useEffect, useRef } from "react";
import SocietyModificationForm from "@/components/forms/SocietyModificationForm";
import Footer from "@/components/Footer";

const CreerEntreprise = () => {
  const carouselApiRef = useRef<any>(null);
  const navigate = useNavigate();

  const legalForms = [
    {
      title: "Entreprise individuelle",
      description:
        "Structure simple pour exercer une activité commerciale, artisanale ou libérale en nom propre.",
      advantages: [
        "Simplicité de création",
        "Fiscalité avantageuse",
        "Gestion simplifiée",
      ],
      minCapital: "Aucun capital minimum",
      responsability: "Responsabilité illimitée",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
      route: "entreprise-individuelle",
    },
    {
      title: "SARL",
      description:
        "Société à Responsabilité Limitée, forme juridique la plus répandue pour les PME.",
      advantages: [
        "Responsabilité limitée",
        "Souplesse de gestion",
        "Crédibilité renforcée",
      ],
      minCapital: "1 000 000 FCFA minimum",
      responsability: "Responsabilité limitée aux apports",
      image:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop&crop=center",
      route: "sarl",
    },
    {
      title: "SARLU",
      description:
        "Société à Responsabilité Limitée Unipersonnelle, SARL à associé unique.",
      advantages: [
        "Un seul associé",
        "Responsabilité limitée",
        "Patrimoine protégé",
      ],
      minCapital: "1 000 000 FCFA minimum",
      responsability: "Responsabilité limitée aux apports",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=center",
      route: "sarlu",
    },
    {
      title: "SAS",
      description:
        "Société par Actions Simplifiée, structure flexible pour les projets d'envergure.",
      advantages: [
        "Grande liberté statutaire",
        "Facilité de cession",
        "Statut social du dirigeant",
      ],
      minCapital: "10 000 000 FCFA minimum",
      responsability: "Responsabilité limitée aux apports",
      image:
        "https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=400&h=300&fit=crop&crop=center",
      route: "sas",
    },
    {
      title: "SASU",
      description:
        "Société par Actions Simplifiée Unipersonnelle, SAS à actionnaire unique.",
      advantages: [
        "Un seul actionnaire",
        "Flexibilité maximale",
        "Protection du patrimoine",
      ],
      minCapital: "10 000 000 FCFA minimum",
      responsability: "Responsabilité limitée aux apports",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
      route: "sasu",
    },
    {
      title: "SA",
      description:
        "Société Anonyme pour les grandes entreprises nécessitant plusieurs actionnaires.",
      advantages: [
        "Crédibilité maximale",
        "Facilité de financement",
        "Gouvernance structurée",
      ],
      minCapital: "10 000 000 FCFA minimum",
      responsability: "Responsabilité limitée aux apports",
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&crop=center",
      route: "sa",
    },
    {
      title: "SAU",
      description: "Société Anonyme Unipersonnelle, SA à actionnaire unique.",
      advantages: [
        "Un seul actionnaire",
        "Structure de grande entreprise",
        "Prestige maximal",
      ],
      minCapital: "10 000 000 FCFA minimum",
      responsability: "Responsabilité limitée aux apports",
      image:
        "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=300&fit=crop&crop=center",
      route: "sau",
    },
    {
      title: "ONG",
      description:
        "Organisation Non Gouvernementale pour les activités à but non lucratif.",
      advantages: [
        "Objectif social",
        "Exonérations fiscales",
        "Financement international",
      ],
      minCapital: "Variable selon l'activité",
      responsability: "Responsabilité des dirigeants",
      image:
        "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop&crop=center",
      route: "ong",
    },
    {
      title: "SCI",
      description:
        "Société Civile Immobilière pour la gestion de biens immobiliers.",
      advantages: [
        "Gestion collective",
        "Transmission facilitée",
        "Optimisation fiscale",
      ],
      minCapital: "Variable",
      responsability: "Responsabilité indéfinie des associés",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&crop=center",
      route: "sci",
    },
    {
      title: "Association",
      description:
        "Structure à but non lucratif pour des activités d'intérêt général.",
      advantages: [
        "But non lucratif",
        "Gestion démocratique",
        "Avantages fiscaux",
      ],
      minCapital: "Aucun capital",
      responsability: "Responsabilité des dirigeants",
      image:
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=300&fit=crop&crop=center",
      route: "association",
    },
    {
      title: "Fondation",
      description:
        "Structure dédiée à la réalisation d'une œuvre d'intérêt général.",
      advantages: [
        "Pérennité",
        "Mission d'intérêt général",
        "Avantages fiscaux",
      ],
      minCapital: "Dotation initiale requise",
      responsability: "Responsabilité des administrateurs",
      image:
        "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400&h=300&fit=crop&crop=center",
      route: "fondation",
    },
    {
      title: "SCOOP",
      description:
        "Société Coopérative basée sur les principes de solidarité et d'entraide.",
      advantages: ["Gestion démocratique", "Partage équitable", "Solidarité"],
      minCapital: "Variable selon l'activité",
      responsability: "Responsabilité limitée",
      image:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop&crop=center",
      route: "scoop",
    },
  ];

  const faqItems = [
    {
      question: "Combien de temps faut-il pour créer une entreprise ?",
      answer:
        "En moyenne, il faut entre 7 à 15 jours ouvrables pour créer une entreprise en Côte d'Ivoire, selon le type de structure choisie et la complétude du dossier.",
    },
    {
      question: "Quels sont les documents nécessaires ?",
      answer:
        "Les documents requis incluent : pièce d'identité du dirigeant, justificatif de domicile, attestation de domiciliation, statuts signés, procès-verbal de nomination des dirigeants.",
    },
    {
      question: "Peut-on créer une entreprise avec un associé étranger ?",
      answer:
        "Oui, il est possible d'avoir des associés étrangers dans une entreprise en Côte d'Ivoire. Certaines formalités supplémentaires peuvent être requises.",
    },
    {
      question: "Quelles sont les obligations comptables ?",
      answer:
        "Toutes les entreprises doivent tenir une comptabilité selon le système OHADA. Les micro-entreprises peuvent opter pour une comptabilité simplifiée.",
    },
    {
      question: "Comment choisir le régime fiscal ?",
      answer:
        "Le choix du régime fiscal dépend du chiffre d'affaires prévisionnel et du type d'activité. Nous vous accompagnons dans cette décision stratégique.",
    },
  ];

  const handleCreateClick = (route: string) => {
    // Redirection vers les pages de présentation plutôt que directement vers les formulaires
    navigate(`/creer-entreprise/${route}`);
  };

  const handleTypeClick = (route: string) => {
    navigate(`/creer-entreprise/${route}`);
  };

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselApiRef.current) {
        carouselApiRef.current.scrollNext();
      }
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Créer votre entreprise en Côte d'Ivoire
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            LAWRY est la solution la plus simple et la plus rapide pour créer
            une entreprise ou une organisation en Côte d'Ivoire
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
            <p className="text-lg mb-4">
              Vous ne savez pas quelle structure choisir?
            </p>
            <p className="text-xl font-semibold">
              Appelez-nous au +225 0101987580
            </p>
          </div>
        </div>
      </section>

      {/* Legal Forms Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choisissez votre forme juridique
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez les différentes structures d'entreprise disponibles
            </p>
          </div>

          <Carousel
            className="w-full max-w-5xl mx-auto"
            setApi={(api) => {
              carouselApiRef.current = api;
            }}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {legalForms.map((form, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={form.image}
                        alt={form.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg">
                          {form.title}
                        </h3>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardDescription className="text-sm">
                        {form.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Avantages :
                          </h4>
                          <ul className="space-y-1">
                            {form.advantages.map((advantage, idx) => (
                              <li
                                key={idx}
                                className="flex items-center text-sm text-gray-600"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            <strong>Capital minimum :</strong> {form.minCapital}
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            <strong>Responsabilité :</strong>{" "}
                            {form.responsability}
                          </p>
                          <Button
                            className="w-full bg-red-900 hover:bg-red-800 text-white"
                            size="sm"
                            onClick={() => handleCreateClick(form.route)}
                          >
                            Découvrir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Company Types Grid */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choisissez votre type de société
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
            {legalForms.map((form, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all duration-200 hover:scale-105 group relative overflow-hidden"
                onClick={() => handleTypeClick(form.route)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="relative z-10 font-semibold">
                  {form.title}
                </span>
                <ArrowRight className="ml-2 h-4 w-4 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200 relative z-10" />
              </Button>
            ))}
          </div>

          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Répondez à un questionnaire
              </h3>
              <p className="text-gray-600">
                Notre logiciel crée un document personnalisé en fonction de vos
                réponses
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                LAWRY gère pour vous
              </h3>
              <p className="text-gray-600">
                Toutes les formalités de création de votre entreprise
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-red-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Votre entreprise est créée
              </h3>
              <p className="text-gray-600">
                Recevez tous vos documents officiels et commencez votre activité
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Society Modification Section */}
      <SocietyModificationForm />

      {/* Information Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ce qu'il faut savoir sur la création d'entreprise
            </h2>
          </div>

          <div className="prose max-w-4xl mx-auto text-gray-600 leading-relaxed">
            <p className="text-lg mb-6">
              À l'instar de la majorité des pays de l'OHADA dont elle est
              membre, la Côte d'Ivoire a mis en place des stratégies qui
              concourent à la sécurisation et à l'attractivité de
              l'environnement des affaires afin d'inciter à l'entrepreneuriat et
              d'attirer les investisseurs.
            </p>
            <p className="mb-6">
              Le processus de création d'entreprise en Côte d'Ivoire s'est
              considérablement simplifié grâce aux réformes entreprises par le
              gouvernement. Le Centre de Facilitation des Formalités (CEPICI)
              constitue le guichet unique pour toutes les démarches
              administratives.
            </p>
            <p>
              Avec LAWRY, bénéficiez d'un accompagnement personnalisé et d'une
              expertise juridique reconnue pour créer votre entreprise dans les
              meilleures conditions.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions Fréquemment Posées
            </h2>
            <p className="text-lg text-gray-600">
              Trouvez les réponses aux questions les plus courantes
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à créer votre entreprise ?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Commencez dès maintenant avec LAWRY
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Building className="mr-2 h-5 w-5" />
              Créer mon entreprise
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-900 hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link to="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreerEntreprise;
