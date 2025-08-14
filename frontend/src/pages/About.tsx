import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Scale, Users, Eye, Target, Award, Calendar, UserCheck, MessageSquare, User, LogIn, Briefcase, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const About = () => {
  const [counters, setCounters] = useState({
    experience: 0,
    clients: 0,
    awards: 0,
    satisfaction: 0
  });

  const stats = [
    { label: "Years of Experience", value: 25, suffix: "+", key: "experience" },
    { label: "Active Clients", value: 2.5, suffix: "k", key: "clients" },
    { label: "Awards Winning", value: 56, suffix: "", key: "awards" },
    { label: "Satisfied Clients", value: 100, suffix: "%", key: "satisfaction" }
  ];

  useEffect(() => {
    const animateCounters = () => {
      stats.forEach((stat) => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const increment = end / (duration / 50);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCounters(prev => ({ ...prev, [stat.key]: end }));
            clearInterval(timer);
          } else {
            setCounters(prev => ({ ...prev, [stat.key]: start }));
          }
        }, 50);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/lovable-uploads/58eeab48-482f-4e0a-ba88-27030b1aab79.png" alt="LAWRY Logo" className="h-10 w-auto" />
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-900">LegalTech</Badge>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-red-900 transition-colors">Accueil</Link>
              <Link to="/about" className="text-red-900 font-semibold border-b-2 border-red-900 pb-1">À propos</Link>
              <Link to="/services" className="text-gray-700 hover:text-red-900 transition-colors">Nos Services</Link>
              <Link to="/blog" className="text-gray-700 hover:text-red-900 transition-colors">Blog</Link>
              <Link to="/boutique" className="text-gray-700 hover:text-red-900 transition-colors">Boutique</Link>
              <Link to="/contact" className="text-gray-700 hover:text-red-900 transition-colors">Contact</Link>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-red-900 text-red-900 hover:bg-red-900 hover:text-white">
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </Button>
                <Button size="sm" className="bg-red-900 hover:bg-red-800 text-white">
                  <User className="h-4 w-4 mr-2" />
                  Inscription
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              À Propos de
              <span className="block text-red-200">LAWRY</span>
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Découvrez l'histoire, la mission et l'expertise qui font de LAWRY 
              votre partenaire juridique de confiance.
            </p>
          </div>
        </div>
      </section>

      {/* Biographie de la Fondatrice */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Biographie de la Fondatrice</h2>
              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  <strong className="text-red-900">Laurie Noëlla Chérif</strong>, passionnée du droit au service des PME et animée par une vision claire : rendre le droit accessible et compréhensible pour les entrepreneurs, s'est imposée comme une figure clé du secteur juridique en Côte d'Ivoire. Avec une passion inébranlable pour le droit des affaires, elle a fondé LAWRY Cabinet de Conseil & Assistance Juridique, dédié à l'accompagnement personnalisé des petites et moyennes entreprises ainsi que des particuliers.
                </p>
                <p>
                  Son expérience en cabinet d'avocats lui a permis de constater les défis majeurs auxquels les entrepreneurs sont confrontés en l'absence d'un accompagnement juridique adapté. Déterminée à changer les choses, Laurie a créé des solutions sur mesure pour soutenir la croissance et assurer la pérennité des entreprises locales.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-red-900 mr-2" />
                    <span className="font-semibold">Expert Juridique</span>
                  </div>
                  <div className="flex items-center">
                    <Scale className="h-5 w-5 text-red-900 mr-2" />
                    <span className="font-semibold">Spécialiste PME</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src="/lovable-uploads/6bc4a70d-b425-44c4-94e3-e3ae6a71d5fb.png" 
                    alt="Laurie Noëlla Chérif - Fondatrice de LAWRY"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-red-900 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">25+</div>
                    <div className="text-sm">Années d'expérience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats-section" className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Chiffres Clés</h2>
            <p className="text-lg text-gray-600">L'excellence mesurée par nos résultats</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-8 text-center bg-white shadow-lg hover:shadow-xl transition-shadow border-0">
                <div className="text-4xl font-bold text-red-900 mb-2">
                  {stat.key === 'clients' ? 
                    `${counters[stat.key].toFixed(1)}${stat.suffix}` : 
                    `${Math.round(counters[stat.key])}${stat.suffix}`
                  }
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-red-900" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                Démocratiser l'accès au conseil juridique en offrant des services de qualité, 
                accessibles et innovants pour tous. Nous croyons que chaque entreprise et chaque 
                particulier mérite un accompagnement juridique professionnel, sans contraintes 
                géographiques ou temporelles.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Accessibilité financière pour tous</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Innovation technologique au service du droit</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Transparence et communication claire</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Nos Valeurs Fondamentales</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-2 mr-4 mt-1">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Excellence Juridique</h4>
                    <p className="text-red-200 text-sm">Expertise reconnue et mise à jour constante</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-2 mr-4 mt-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Proximité Client</h4>
                    <p className="text-red-200 text-sm">Accompagnement personnalisé et humain</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full p-2 mr-4 mt-1">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Innovation</h4>
                    <p className="text-red-200 text-sm">Technologie au service de l'efficacité</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notre Vision */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye className="h-8 w-8 text-red-900" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre Vision</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Devenir un acteur incontournable du conseil et de l'assistance juridique sur mesure, en Afrique et à l'international, grâce à une approche moderne, accessible et axée sur les besoins de nos clients.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Calendar className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2025-2027</h3>
              <p className="text-gray-600">Extension africaine avec des partenariats stratégiques</p>
            </Card>
            <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Users className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Croissance</h3>
              <p className="text-gray-600">Objectif de 10 000 clients actifs d'ici 3 ans</p>
            </Card>
            <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <Award className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">Développement d'IA juridique avancée</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Notre Expertise */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Notre Expertise</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Depuis notre création, nous intervenons dans les domaines suivants :
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow">
              <Briefcase className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Droit des affaires</h3>
              <p className="text-gray-600">
                Pour accompagner la création et la gestion des entreprises.
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow">
              <Scale className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Droit commercial</h3>
              <p className="text-gray-600">
                Pour sécuriser vos transactions et contrats.
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Droit des entreprises</h3>
              <p className="text-gray-600">
                Pour optimiser la gouvernance et la conformité.
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow">
              <Globe className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Droit numérique</h3>
              <p className="text-gray-600">
                Pour répondre aux défis juridiques des technologies et des données.
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow">
              <UserCheck className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Droit de la famille</h3>
              <p className="text-gray-600">
                Pour offrir des solutions humaines et adaptées aux questions familiales.
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-red-900 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Propriété intellectuelle</h3>
              <p className="text-gray-600">
                Pour protéger vos créations et innovations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à nous faire confiance ?</h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Rejoignez les milliers de clients qui ont choisi LAWRY pour leurs besoins juridiques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-900 hover:bg-red-50 text-lg px-8 py-3" asChild>
              <Link to="/conseil-gratuit">
                <MessageSquare className="mr-2 h-5 w-5" />
                Consultation gratuite
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-900" asChild>
              <Link to="/services">
                Découvrir nos services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Floating ChatBot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className="bg-red-900 hover:bg-red-800 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          title="ChatBot - Assistance en ligne"
          asChild
        >
          <Link to="/chatbot">
            <MessageSquare className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/lovable-uploads/58eeab48-482f-4e0a-ba88-27030b1aab79.png" alt="LAWRY Logo" className="h-8 w-auto" />
              </div>
              <p className="text-gray-600">
                Votre partenaire juridique de confiance pour tous vos besoins légaux.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/services/creation-societe" className="hover:text-red-900">Création de société</Link></li>
                <li><Link to="/services/gestion-comptable" className="hover:text-red-900">Gestion comptable</Link></li>
                <li><Link to="/services/immobilier" className="hover:text-red-900">Gestion immobilière</Link></li>
                <li><Link to="/services/rh" className="hover:text-red-900">Gestion RH</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Ressources</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/blog" className="hover:text-red-900">Blog juridique</Link></li>
                <li><Link to="/formations" className="hover:text-red-900">Formations</Link></li>
                <li><Link to="/faq" className="hover:text-red-900">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-red-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
              <p className="text-gray-600 mb-2">📧 contact@lawry.fr</p>
              <p className="text-gray-600 mb-2">📞 +33 1 23 45 67 89</p>
              <p className="text-gray-600">⏰ Lun-Ven 9h-18h</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 LAWRY. Tous droits réservés. Plateforme LegalTech innovante.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
