import { useEffect, useMemo, useState } from "react";
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
  BookOpen,
  Users,
  CheckCircle,
  Star,
  Award,
  Calendar,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Header from "@/components/Header";
import FormationRegistrationForm from "@/components/forms/FormationRegistrationForm";
import { http } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, isAuthenticated } from "@/services/auth";
import {
  checkAlreadyRegistered,
  listMyFormationIds,
} from "@/services/registrations";

type PublicFormation = {
  id: number;
  title: string;
  description?: string | null;
  duration?: string | null;
  level?: string | null;
  modules?: string[] | null;
  price_type?: "fixed" | "quote" | string | null;
  price_cfa?: number | null;
  date?: string | null;
  active: boolean;
  max_participants?: number | null;
  registrations_count?: number | null;
  available_seats?: number | null;
  type?: string | null;
};

const PER_PAGE = 12;

const formatPrice = (f: PublicFormation) => {
  if (f.price_type === "quote" || f.price_cfa == null || f.price_cfa <= 0)
    return "Sur devis";
  return `${(f.price_cfa || 0).toLocaleString()} FCFA`;
};

const numericPrice = (f: PublicFormation) => {
  if (f.price_type === "quote" || f.price_cfa == null) return 0;
  return Number(f.price_cfa) || 0;
};

const isFull = (f: PublicFormation) => {
  const max = f.max_participants ?? 0;
  const available =
    typeof f.available_seats === "number"
      ? f.available_seats
      : max > 0
      ? max - (f.registrations_count ?? 0)
      : Infinity;
  return available <= 0;
};

const Formation = () => {
  const { toast } = useToast();

  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCustomTraining, setShowCustomTraining] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<{
    id: number;
    title: string;
    price: string;
    priceNumber: number;
    duration: string;
    level: string;
    type?: string;
    date?: string;
  } | null>(null);

  const [items, setItems] = useState<PublicFormation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mineIds, setMineIds] = useState<number[]>([]);

  const user = getCurrentUser();
  const userKey = user ? `${user.id}|${user.email}` : null;

  const loadFormations = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params: any = {
        active: 1,
        page: pageNum,
        per_page: PER_PAGE,
        sort: "date",
        order: "desc",
      };
      const { data: payload } = await http.get("/public/formations", {
        params,
      });
      const list: PublicFormation[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.["hydra:member"])
        ? payload["hydra:member"]
        : Array.isArray(payload)
        ? payload
        : [];
      const total =
        payload?.meta?.total ??
        payload?.total ??
        payload?.["hydra:totalItems"] ??
        list.length;
      setItems(pageNum === 1 ? list : (prev) => [...prev, ...list]);
      setHasMore(pageNum * PER_PAGE < Number(total));
      setPage(pageNum);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les formations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const seatsLeft = (f: any) => {
    const max = Number(f?.max_participants ?? 0);
    if (f?.remaining_seats != null) return Number(f.remaining_seats);
    const taken = Number(
      f?.registrations_count ?? f?.booked ?? f?.enrolled ?? 0
    );
    if (!Number.isFinite(max) || max <= 0) return null;
    return max - taken;
  };
  const isFormationFull = (f: any) => {
    const left = seatsLeft(f);
    const max = Number(f?.max_participants ?? 0);
    return Number.isFinite(left) && max > 0 && (left as number) <= 0;
  };

  useEffect(() => {
    loadFormations(1);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setMineIds([]);
      return;
    }
    listMyFormationIds()
      .then((ids) => setMineIds(ids))
      .catch(() => setMineIds([]));
  }, [isAuthenticated()]);

  const alreadyRegistered = (f: PublicFormation) => {
    if (!isAuthenticated()) return false;
    if (mineIds.includes(f.id)) return true;
    return false;
  };

  const trySelectFormation = async (formation: PublicFormation) => {
    if (isFull(formation)) return;
    if (isAuthenticated()) {
      const hasClientRole = (user?.roles || []).some(
        (r) => r.toLowerCase() === "client"
      );
      if (!hasClientRole) {
        toast({
          title: "Accès refusé",
          description:
            "Seuls les utilisateurs avec le rôle Client peuvent s'inscrire.",
          variant: "destructive",
        });
        return;
      }
      const dup = await checkAlreadyRegistered(formation.id, userKey);
      if (dup) {
        toast({
          title: "Déjà inscrit",
          description: "Vous êtes déjà inscrit à cette formation.",
          variant: "destructive",
        });
        return;
      }
    }
    setSelectedFormation({
      id: formation.id,
      title: formation.title,
      price: formatPrice(formation),
      priceNumber: numericPrice(formation),
      duration: formation.duration || "—",
      level: formation.level || "Tous niveaux",
      type: formation.type || undefined,
      date: formation.date || undefined,
    });
    setShowRegistrationForm(true);
  };

  const scheduleData = [
    {
      month: "Janvier 2024",
      sessions: [
        {
          title: "Droit des affaires pour entrepreneurs",
          dates: "15-17 janvier",
          format: "Présentiel",
          places: "8/12",
          status: "Disponible",
        },
        {
          title: "Gestion juridique RH",
          dates: "22-23 janvier",
          format: "Distanciel",
          places: "5/12",
          status: "Disponible",
        },
        {
          title: "Conformité et réglementation",
          dates: "29 janvier",
          format: "Présentiel",
          places: "12/12",
          status: "Complet",
        },
      ],
    },
    {
      month: "Février 2024",
      sessions: [
        {
          title: "Droit des affaires pour entrepreneurs",
          dates: "12-14 février",
          format: "Présentiel",
          places: "3/12",
          status: "Disponible",
        },
        {
          title: "Gestion juridique RH",
          dates: "19-20 février",
          format: "Mixte",
          places: "7/12",
          status: "Disponible",
        },
        {
          title: "Conformité et réglementation",
          dates: "26 février",
          format: "Distanciel",
          places: "9/12",
          status: "Disponible",
        },
      ],
    },
    {
      month: "Mars 2024",
      sessions: [
        {
          title: "Droit des affaires pour entrepreneurs",
          dates: "11-13 mars",
          format: "Distanciel",
          places: "6/12",
          status: "Disponible",
        },
        {
          title: "Gestion juridique RH",
          dates: "18-19 mars",
          format: "Présentiel",
          places: "4/12",
          status: "Disponible",
        },
        {
          title: "Conformité et réglementation",
          dates: "25 mars",
          format: "Présentiel",
          places: "10/12",
          status: "Disponible",
        },
      ],
    },
  ];

  const advantages = [
    {
      icon: Award,
      title: "Formateurs experts",
      description: "Juristes praticiens avec une solide expérience terrain",
    },
    {
      icon: Users,
      title: "Groupes restreints",
      description: "Maximum 12 participants pour un apprentissage optimal",
    },
    {
      icon: Calendar,
      title: "Flexibilité",
      description: "Formations en présentiel, distanciel ou sur site",
    },
    {
      icon: CheckCircle,
      title: "Certification",
      description: "Attestation de formation délivrée à l'issue",
    },
  ];

  if (showRegistrationForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <FormationRegistrationForm
          selectedFormation={selectedFormation}
          onBack={() => {
            setShowRegistrationForm(false);
            setSelectedFormation(null);
            if (isAuthenticated())
              listMyFormationIds()
                .then((ids) => setMineIds(ids))
                .catch(() => {});
          }}
        />
      </div>
    );
  }

  if (showSchedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="outline"
            onClick={() => setShowSchedule(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux formations
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Planning des formations
            </h1>
            <p className="text-lg text-gray-600">
              Consultez les prochaines sessions disponibles et réservez votre
              place
            </p>
          </div>
          {scheduleData.map((monthData, index) => (
            <Card key={index} className="mb-8">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {monthData.month}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthData.sessions.map((session, sessionIndex) => (
                    <div
                      key={sessionIndex}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {session.dates}
                          </div>
                          <Badge variant="outline">{session.format}</Badge>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {session.places} places
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            session.status === "Disponible"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            session.status === "Disponible"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {session.status}
                        </Badge>
                        {session.status === "Disponible" && (
                          <Button
                            size="sm"
                            className="bg-red-900 hover:bg-red-800"
                            onClick={() => {
                              const f = items.find(
                                (x) => x.title === session.title
                              );
                              if (f) trySelectFormation(f);
                            }}
                          >
                            Réserver
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="mt-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">
                Besoin d'une session personnalisée ?
              </h3>
              <p className="text-gray-700 mb-4">
                Nous organisons également des formations sur mesure pour votre
                équipe ou votre entreprise.
              </p>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={() => {
                  setShowSchedule(false);
                  setShowCustomTraining(true);
                }}
              >
                Demander une formation sur mesure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showCustomTraining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="outline"
            onClick={() => setShowCustomTraining(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux formations
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Formation sur mesure
            </h1>
            <p className="text-lg text-gray-600">
              Concevons ensemble une formation adaptée à vos besoins spécifiques
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">Nos avantages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Contenu personnalisé</h4>
                      <p className="text-sm text-gray-600">
                        Formation adaptée à votre secteur d'activité et vos
                        enjeux
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Flexibilité totale</h4>
                      <p className="text-sm text-gray-600">
                        Dates, horaires et format selon vos contraintes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Formateurs experts</h4>
                      <p className="text-sm text-gray-600">
                        Juristes spécialisés dans votre domaine
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Support continu</h4>
                      <p className="text-sm text-gray-600">
                        Accompagnement après la formation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">Processus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="flex items-start">
                      <div className="bg-red-100 text-red-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                        {n}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {n === 1
                            ? "Analyse des besoins"
                            : n === 2
                            ? "Proposition personnalisée"
                            : n === 3
                            ? "Validation et planification"
                            : "Réalisation"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {n === 1
                            ? "Évaluation de vos objectifs et contraintes"
                            : n === 2
                            ? "Devis détaillé et programme sur mesure"
                            : n === 3
                            ? "Finalisation des détails et calendrier"
                            : "Formation et évaluation des résultats"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-red-900">
                Exemples de formations sur mesure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Secteur bancaire</h4>
                  <p className="text-sm text-gray-600">
                    Conformité réglementaire, lutte anti-blanchiment, protection
                    des données
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">E-commerce</h4>
                  <p className="text-sm text-gray-600">
                    Droit du numérique, RGPD, conditions générales de vente
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Immobilier</h4>
                  <p className="text-sm text-gray-600">
                    Droit immobilier, copropriété, gestion locative
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-red-900">Demander un devis</CardTitle>
              <CardDescription>
                Contactez-nous pour discuter de votre projet de formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Button
                    className="w-full bg-red-900 hover:bg-red-800 mb-4"
                    onClick={() => {
                      setSelectedFormation({
                        id: 0,
                        title: "Formation sur mesure",
                        price: "Sur devis",
                        priceNumber: 0,
                        duration: "Variable",
                        level: "Personnalisé",
                        type: "Hybride",
                        date: undefined,
                      });
                      setShowCustomTraining(false);
                      setShowRegistrationForm(true);
                    }}
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Remplir le formulaire de demande
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    Formulaire détaillé pour analyser vos besoins
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">
                    Ou contactez-nous directement :
                  </h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-red-900" />
                    +225 0101987580
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-red-900" />
                    +225 0709122074
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-red-900" />
                    contact.lawryconsulting@gmail.com
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-red-900" />
                    Abidjan, Côte d'Ivoire
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Formations Juridiques
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Développez vos compétences juridiques avec nos formations pratiques
            animées par des experts
          </p>
          <Button
            size="lg"
            className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3"
            onClick={() => setShowSchedule(true)}
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Voir le catalogue
          </Button>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos formations
            </h2>
            <p className="text-lg text-gray-600">
              Formations pratiques adaptées aux professionnels et entreprises
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((formation) => {
              const full = isFull(formation);
              const dup = alreadyRegistered(formation);
              return (
                <Card
                  key={formation.id}
                  className={[
                    "transition-all duration-300 group hover:scale-105",
                    "hover:shadow-xl",
                    isFull(formation) ? "opacity-60 grayscale" : "", // <- griser si complet
                  ].join(" ")}
                  aria-disabled={isFull(formation)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-900"
                      >
                        {formation.level || "Tous niveaux"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-red-900 text-red-900"
                      >
                        {formation.duration || "—"}
                      </Badge>
                    </div>

                    <CardTitle className="text-red-900 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {formation.title}
                    </CardTitle>

                    <CardDescription>{formation.description}</CardDescription>

                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(formation)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Modules inclus :
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(formation.modules ?? []).map((module, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {module}
                          </div>
                        ))}
                        {(formation.modules ?? []).length === 0 && (
                          <div className="flex items-center text-sm text-gray-500">
                            —
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-red-900 hover:bg-red-800 group-hover:scale-105 transition-all duration-200 disabled:opacity-60"
                      disabled={
                        isFull(formation) || alreadyRegistered(formation)
                      }
                      onClick={() => trySelectFormation(formation)}
                    >
                      {isFull(formation)
                        ? "Nombre de places atteint"
                        : alreadyRegistered(formation)
                        ? "Déjà inscrit"
                        : "S'inscrire à cette formation"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => loadFormations(page - 1)}
            >
              ← Précédent
            </Button>
            <Button
              variant="outline"
              disabled={!hasMore || loading}
              onClick={() => loadFormations(page + 1)}
            >
              Suivant →
            </Button>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir nos formations ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "Formateurs experts",
                description:
                  "Juristes praticiens avec une solide expérience terrain",
              },
              {
                icon: Users,
                title: "Groupes restreints",
                description:
                  "Maximum 12 participants pour un apprentissage optimal",
              },
              {
                icon: Calendar,
                title: "Flexibilité",
                description: "Formations en présentiel, distanciel ou sur site",
              },
              {
                icon: CheckCircle,
                title: "Certification",
                description: "Attestation de formation délivrée à l'issue",
              },
            ].map((adv, i) => (
              <div
                key={i}
                className="text-center group hover:scale-105 transition-transform duration-200"
              >
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <adv.icon className="h-8 w-8 text-red-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {adv.title}
                </h3>
                <p className="text-gray-600">{adv.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Témoignages
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Koné",
                role: "Directrice RH",
                content:
                  "Formation très pratique qui m'a permis de mieux gérer les aspects juridiques RH dans mon entreprise.",
                rating: 5,
              },
              {
                name: "Jean-Baptiste Traoré",
                role: "Entrepreneur",
                content:
                  "Excellente formation sur le droit des affaires. Les formateurs sont compétents et pédagogues.",
                rating: 5,
              },
              {
                name: "Fatou Diabaté",
                role: "Juriste d'entreprise",
                content:
                  "Mise à jour parfaite de mes connaissances. Je recommande vivement ces formations.",
                rating: 5,
              },
            ].map((t, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à développer vos compétences ?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Rejoignez nos prochaines sessions de formation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3"
              onClick={() => setShowSchedule(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Voir le planning
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white hover:bg-white text-red-900"
              onClick={() => setShowCustomTraining(true)}
            >
              Formation sur mesure
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Formation;
