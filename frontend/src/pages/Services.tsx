import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
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
  Award,
  TrendingUp,
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
  Gift,
} from "lucide-react";

import { plansFront } from "@/services/plansFront";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";
import { http } from "@/lib/http";
import SubscriptionForm from "@/components/forms/SubscriptionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const Services = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<number | null>(null);

  // Charger les plans depuis ton API
  useEffect(() => {
    plansFront.list().then((res) => {
      setPlans(res.items || []);
    });
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR").format(price);

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    const yearlyMonthly = yearly / 12;
    const discount = ((monthly - yearlyMonthly) / monthly) * 100;
    return Math.round(discount);
  };

  // Création souscription + redirection paiement
  const handleSubscribe = async (plan: any) => {
    try {
      setLoading(plan.id);

      // Créer la souscription via ton controller Laravel
      const { data: sub } = await http.post("/subscriptions", {
        plan_id: plan.id,
        period: isYearly ? "yearly" : "monthly",
        email: "client@example.com",
        name: "Jean Dupont",
      });

      // Init paiement
      const pay = await initPayment({
        type: "plan-subscription",
        id: plan.id,
        channel: "paiementpro",
        customer: {
          email: sub.user.email,
          firstName: sub.user.name,
          lastName: "",
          phone: "+2250700000000",
        },
      });

      if (pay?.action && pay?.fields) {
        autoPost(pay.action, pay.fields, "POST");
      }
    } catch (err: any) {
      alert(err.message || "Erreur pendant le paiement");
    } finally {
      setLoading(null);
    }
  };

  // --- tes données locales (inchangées) ---
  const mainServices = [
    {
      id: "creation-entreprise",
      title: "Création d'Entreprise",
      description:
        "Donnez une existence légale à votre activité avec un accompagnement complet.",
      icon: Building2,
      features: [
        "Choix de la structure juridique adaptée (SARL, SASU, etc.)",
        "Démarches administratives et documents officiels",
        "Planification fiscale pour optimiser les charges",
      ],
      gradient: "from-blue-500 to-blue-600",
      popular: true,
      link: "/creer-entreprise",
    },
    {
      id: "conseil-assistance",
      title: "Conseil et Assistance Juridique",
      description:
        "Accompagnement personnalisé pour toutes vos questions juridiques.",
      icon: MessageSquare,
      features: [
        "Analyse personnalisée et recommandations",
        "Mise en conformité réglementaire",
        "Représentation légale selon besoin",
      ],
      gradient: "from-green-500 to-green-600",
      popular: false,
      link: "/conseil",
    },
    {
      id: "redaction-contrats",
      title: "Rédaction de Contrats",
      description:
        "Accords juridiques solides pour sécuriser vos relations professionnelles.",
      icon: FileText,
      features: [
        "Contrats commerciaux",
        "Contrats de travail (CDI, CDD, etc.)",
        "Contrats spécifiques (mandat, partenariat, etc.)",
      ],
      gradient: "from-purple-500 to-purple-600",
      popular: false,
      link: "/redaction-contrat",
    },
  ];

  const additionalServices = [
    {
      title: "Audit Juridique",
      icon: Shield,
      description: "Évaluation approfondie pour vérifier la conformité",
      color: "text-red-600",
    },
    {
      title: "Formations",
      icon: GraduationCap,
      description: "Développement des compétences juridiques",
      color: "text-orange-600",
    },
    {
      title: "Gestion Comptable",
      icon: Calculator,
      description: "Optimisation financière et fiscale",
      color: "text-teal-600",
    },
    {
      title: "Gestion Immobilière",
      icon: Home,
      description: "Service complet de gestion locative",
      color: "text-indigo-600",
    },
    {
      title: "Gestion RH",
      icon: Users2,
      description: "Optimisation des procédures RH",
      color: "text-pink-600",
    },
    {
      title: "Recouvrement",
      icon: TrendingUp,
      description: "Accélération des encaissements",
      color: "text-yellow-600",
    },
  ];

  const punctualServices = [
    { name: "SARL", price: 300000, category: "CRÉATION DE SOCIÉTÉ" },
    {
      name: "Entreprise Individuelle",
      price: 150000,
      category: "CRÉATION DE SOCIÉTÉ",
    },
    { name: "SCOOP", price: 350000, category: "CRÉATION DE SOCIÉTÉ" },
    { name: "ONG", price: 400000, category: "CRÉATION DE SOCIÉTÉ" },
    { name: "SCI", price: "Sur devis", category: "CRÉATION DE SOCIÉTÉ" },
    { name: "SAS", price: "Sur devis", category: "CRÉATION DE SOCIÉTÉ" },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        {/* --- Hero Section --- */}
        {/* … ton Hero Section inchangé … */}

        {/* --- Main Services --- */}
        {/* … section mainServices inchangée … */}

        {/* --- Additional Services --- */}
        {/* … section additionalServices inchangée … */}

        {/* --- Subscription Plans Section --- */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-red-900 mr-3" />
                <h2 className="text-4xl font-bold text-gray-900">
                  Abonnements Juridiques LAWRY
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                Choisissez l'abonnement qui correspond à vos besoins juridiques
              </p>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <span className={!isYearly ? "text-red-900" : "text-gray-500"}>
                  Mensuel
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-red-900"
                />
                <span className={isYearly ? "text-red-900" : "text-gray-500"}>
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
  {plans.map((plan) => {
    const monthly = Number(plan.monthly_price_cfa || 0);
    const yearly = Number(plan.yearly_price_cfa || 0);
    const currentPrice = isYearly ? yearly : monthly;
    const displayPrice =
      isYearly && !plan.is_trial ? Math.round(yearly / 12) : monthly;
    const discount =
      isYearly && !plan.is_trial && monthly > 0
        ? getDiscountPercentage(monthly, yearly)
        : 0;

    return (
      <Card
        key={plan.id}
        className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white"
      >
        {/* badges */}
        {plan.is_popular ? (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold">
              <Award className="h-4 w-4 mr-1" /> Le plus populaire
            </Badge>
          </div>
        ) : null}

        {plan.is_trial ? (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold">
              <Gift className="h-4 w-4 mr-1" /> Essai Gratuit
            </Badge>
          </div>
        ) : null}

        {isYearly && discount > 0 && !plan.is_trial && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
              -{discount}%
            </Badge>
          </div>
        )}

        {/* contenu */}
        <div className="relative p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {plan.name}
            </h3>
            <div className="flex items-baseline justify-center mb-2">
              {plan.is_trial ? (
                <div className="text-center">
                  <span className="text-4xl font-bold text-green-600">
                    GRATUIT
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    {plan.trial_days} jours
                  </div>
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
            {isYearly && !plan.is_trial && (
              <div className="text-sm text-gray-500">
                Facturé {formatPrice(currentPrice)} FCFA / an
              </div>
            )}
            {!isYearly && !plan.is_trial && (
              <div className="text-sm text-gray-400">{plan.description}</div>
            )}
          </div>

          {/* features */}
          <ul className="space-y-4 mb-8">
            {plan.features.map((f: string, idx: number) => (
              <li
                key={idx}
                className="flex items-start text-sm text-gray-600"
              >
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                {f}
              </li>
            ))}
          </ul>

          {/* bouton qui ouvre le formulaire dans un modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className={`w-full ${
                  plan.is_popular
                    ? "bg-blue-600 hover:bg-blue-700"
                    : plan.is_trial
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-900 hover:bg-red-800"
                } py-3`}
              >
                <Zap className="mr-2 h-4 w-4" />
                {plan.is_trial ? "Commencer l'essai" : `Souscrire à ${plan.name}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Souscrire au plan {plan.name}</DialogTitle>
              </DialogHeader>
              <SubscriptionForm plan={plan} isYearly={isYearly} />
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    );
  })}
</div>

            <div className="mt-16">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Services Ponctuels
                </h3>
                <p className="text-lg text-gray-600">
                  Création de société - Tarifs fixes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {punctualServices.map((service, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-red-500"
                  >
                    <div className="text-center">
                      <div className="p-3 rounded-lg bg-red-50 inline-block mb-4">
                        <Building2 className="h-8 w-8 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        {service.name}
                      </h4>
                      <div className="text-2xl font-bold text-red-900 mb-2">
                        {typeof service.price === "number"
                          ? `${formatPrice(service.price)} FCFA`
                          : service.price}
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 text-xs"
                      >
                        {service.category}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- Services Ponctuels --- */}
        {/* … section ponctuelle inchangée … */}

        {/* --- CTA Section --- */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mr-4" />
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  Besoin d'un accompagnement personnalisé ?
                </h2>
                <p className="text-xl text-gray-300">
                  Contactez-nous dès aujourd'hui pour bénéficier d'une
                  consultation et découvrir comment Lawry peut vous accompagner
                  avec efficacité, discrétion et compétence.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button
                asChild
                size="lg"
                className="bg-red-900 hover:bg-red-800 text-lg px-8 py-3 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Link to="/conseil-gratuit">
                  <Phone className="mr-2 h-5 w-5" />
                  Consultation gratuite
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-200"
              >
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
