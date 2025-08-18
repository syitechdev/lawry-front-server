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
  Clock,
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
import { formations as formationsSvc } from "@/services/formations";

type ApiFormation = {
  id: number;
  title: string;
  description?: string | null;
  duration?: string | null;
  price_cfa?: number | null;
  price_type?: "fixed" | "quote" | null;
  level?: string | null;
  modules?: string[] | null;
  date?: string | null;
  active: boolean;
};

const PER_PAGE = 12;

function formatPrice(f: ApiFormation) {
  if (
    f.price_type === "quote" ||
    f.price_cfa === null ||
    typeof f.price_cfa === "undefined"
  ) {
    return "Sur devis";
  }
  return `${Number(f.price_cfa).toLocaleString()} FCFA`;
}

function formatDuration(d?: string | null) {
  return d && d.trim() ? d : "—";
}

function formatLevel(l?: string | null) {
  return l && l.trim() ? l : "—";
}

const Formation = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCustomTraining, setShowCustomTraining] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<{
    title: string;
    price: string;
    duration: string;
    level: string;
  } | null>(null);

  const [items, setItems] = useState<ApiFormation[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const handleFormationSelect = (formation: ApiFormation) => {
    setSelectedFormation({
      title: formation.title,
      price: formatPrice(formation),
      duration: formatDuration(formation.duration),
      level: formatLevel(formation.level),
    });
    setShowRegistrationForm(true);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await formationsSvc.listPublic({
          page,
          itemsPerPage: PER_PAGE,
        });
        const rows: ApiFormation[] = (res?.data ?? []).filter(
          (f: ApiFormation) => !!f.active
        );
        rows.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });
        setItems(rows);
        setTotal(res?.meta?.total ?? rows.length);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const pagesCount = useMemo(
    () => Math.max(1, Math.ceil(total / PER_PAGE)),
    [total]
  );

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

  if (showRegistrationForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <FormationRegistrationForm
          selectedFormation={selectedFormation}
          onBack={() => {
            setShowRegistrationForm(false);
            setSelectedFormation(null);
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
                              if (f) handleFormationSelect(f);
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
                  {[
                    {
                      t: "Contenu personnalisé",
                      d: "Formation adaptée à votre secteur d'activité et vos enjeux",
                    },
                    {
                      t: "Flexibilité totale",
                      d: "Dates, horaires et format selon vos contraintes",
                    },
                    {
                      t: "Formateurs experts",
                      d: "Juristes spécialisés dans votre domaine",
                    },
                    {
                      t: "Support continu",
                      d: "Accompagnement après la formation",
                    },
                  ].map((x, i) => (
                    <div key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{x.t}</h4>
                        <p className="text-sm text-gray-600">{x.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">Processus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Analyse des besoins",
                    "Proposition personnalisée",
                    "Validation et planification",
                    "Réalisation",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start">
                      <div className="bg-red-100 text-red-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{step}</h4>
                        <p className="text-sm text-gray-600">
                          {
                            [
                              "Évaluation de vos objectifs et contraintes",
                              "Devis détaillé et programme sur mesure",
                              "Finalisation des détails et calendrier",
                              "Formation et évaluation des résultats",
                            ][i]
                          }
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
                {[
                  {
                    h: "Secteur bancaire",
                    d: "Conformité réglementaire, lutte anti-blanchiment, protection des données",
                  },
                  {
                    h: "E-commerce",
                    d: "Droit du numérique, RGPD, conditions générales de vente",
                  },
                  {
                    h: "Immobilier",
                    d: "Droit immobilier, copropriété, gestion locative",
                  },
                ].map((b, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{b.h}</h4>
                    <p className="text-sm text-gray-600">{b.d}</p>
                  </div>
                ))}
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
                        title: "Formation sur mesure",
                        price: "Sur devis",
                        duration: "Variable",
                        level: "Personnalisé",
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
                    <Phone className="h-4 w-4 mr-2 text-red-900" /> +225 XX XX
                    XX XX XX
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-red-900" />{" "}
                    formation@lawry.ci
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-red-900" /> Abidjan,
                    Côte d'Ivoire
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-60 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-600">
              Aucune formation active pour le moment.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((formation) => (
                  <Card
                    key={formation.id}
                    className="hover:shadow-xl transition-all duration-300 group hover:scale-105"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-900"
                        >
                          {formatLevel(formation.level)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-red-900 text-red-900"
                        >
                          {formatDuration(formation.duration)}
                        </Badge>
                      </div>
                      <CardTitle className="text-red-900 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        {formation.title}
                      </CardTitle>
                      {formation.description && (
                        <CardDescription>
                          {formation.description}
                        </CardDescription>
                      )}
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(formation)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Modules inclus :
                        </h4>
                        {Array.isArray(formation.modules) &&
                        formation.modules.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {formation.modules.map((module, idx) => (
                              <div
                                key={idx}
                                className="flex items-center text-sm text-gray-600"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                {module}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">—</p>
                        )}
                      </div>
                      <Button
                        className="w-full bg-red-900 hover:bg-red-800 group-hover:scale-105 transition-all duration-200"
                        onClick={() => handleFormationSelect(formation)}
                      >
                        S'inscrire à cette formation
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pagesCount > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} / {pagesCount}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= pagesCount}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
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
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
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
