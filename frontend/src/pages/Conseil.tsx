import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Phone, Scale } from "lucide-react";
import Header from "@/components/Header";
import LegalConsultationForm, {
  ConsultationPreset,
} from "@/components/forms/LegalConsultationForm";
import { http } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

type PricingMode = "fixed" | "from" | "quote";

type VariantCard = {
  key: string;
  title: string;
  subtitle?: string;
  pricing_mode: PricingMode;
  price_amount?: number | null;
  currency?: string | null;
  features?: string[];
  cta?: string;
  active?: boolean;
  pill?: string; // si présent en base
  meta?: any; // fallback, au cas où “pill” soit dans meta
};

type RtResponse = {
  id: number;
  name: string;
  slug: string;
  currency?: string;
  config?: {
    variant_cards?: VariantCard[];
    order?: string[];
  };
};

const Conseil = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rt, setRt] = useState<RtResponse | null>(null);
  const [cards, setCards] = useState<VariantCard[]>([]);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [selectedPreset, setSelectedPreset] =
    useState<ConsultationPreset | null>(null);

  // Fetch “se-faire-conseiller”
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await http.get<RtResponse>(
        "/request-types/slug/se-faire-conseiller"
      );
      const cfg = data?.config || {};
      const all = (cfg.variant_cards || []).filter((c) => c.active !== false);
      const order =
        cfg.order && cfg.order.length ? cfg.order : all.map((c) => c.key);
      const ordered = order
        .map((k) => all.find((c) => c.key === k))
        .filter(Boolean) as VariantCard[];
      setRt(data);
      setCards(ordered);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          e?.response?.data?.message || "Impossible de charger les formules.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const priceText = (c: VariantCard) => {
    const curr = c.currency || rt?.currency || "XOF";
    const amount = Number(c.price_amount || 0).toLocaleString("fr-FR");
    if (c.pricing_mode === "quote" || !c.price_amount) return "Sur devis";
    return c.pricing_mode === "from"
      ? `À partir de ${amount} ${curr}`
      : `${amount} ${curr}`;
  };

  const pillText = (c: VariantCard) =>
    c.pill || (c.meta && typeof c.meta === "object" ? c.meta.pill : undefined);

  // Domaine d’expertise (vitrine simple, statique)
  const expertises = [
    "Droit des affaires",
    "Droit du travail",
    "Droit immobilier",
    "Droit fiscal",
    "Droit commercial",
    "Droit des contrats",
    "Droit des sociétés",
    "Propriété intellectuelle",
  ];

  if (showConsultationForm && selectedPreset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="outline"
              onClick={() => {
                setShowConsultationForm(false);
                setSelectedPreset(null);
              }}
              className="mb-6"
            >
              ← Retour aux formules
            </Button>
          </div>
          <LegalConsultationForm preset={selectedPreset} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Conseil Juridique Expert
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Obtenez des conseils juridiques personnalisés de nos experts pour
            sécuriser vos décisions
          </p>
          <Button
            size="lg"
            className="bg-white text-red-900 hover:bg-gray-100 text-lg px-8 py-3"
            onClick={() => {
              // S’il n’y a pas de cartes, on passe sur un preset “Sur devis”
              const first = cards[0];
              const curr = (first?.currency || rt?.currency || "XOF") as string;
              setSelectedPreset({
                key: first?.key || "consultation",
                label: first?.title || "Consultation",
                price:
                  first?.pricing_mode === "quote"
                    ? null
                    : first?.price_amount ?? null,
                currency: curr,
              });
              setShowConsultationForm(true);
            }}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Consultation gratuite
          </Button>
        </div>
      </section>

      {/* Cartes (formules) */}
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

          {loading ? (
            <div className="text-center text-gray-500">Chargement…</div>
          ) : cards.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucune formule active pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((c) => {
                const price =
                  c.pricing_mode === "quote" ? null : c.price_amount ?? null;
                const currency = c.currency || rt?.currency || "XOF";
                return (
                  <Card
                    key={c.key}
                    className="hover:shadow-xl transition-all duration-300 group hover:scale-105"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-red-900">
                          {c.title}
                        </CardTitle>
                        {pillText(c) && (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-900"
                          >
                            {pillText(c)}
                          </Badge>
                        )}
                      </div>
                      {c.subtitle && (
                        <CardDescription>{c.subtitle}</CardDescription>
                      )}
                      <div className="text-2xl font-bold text-gray-900">
                        {priceText(c)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {(c.features || []).map((f, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-gray-600"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full bg-red-900 hover:bg-red-800 group-hover:scale-105 transition-all duration-200"
                        onClick={() => {
                          const preset: ConsultationPreset = {
                            key: c.key, // *** variant_key ***
                            label: c.title,
                            price,
                            currency: currency as string,
                            // tu peux mapper counselType par clé si tu veux préremplir autrement
                            // counselType: c.key.includes("ecrite") ? "analyse_recommandations" : "avis_juridique",
                          };
                          setSelectedPreset(preset);
                          setShowConsultationForm(true);
                        }}
                      >
                        {c.cta || "Choisir cette formule"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Expertise (vitrine) */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos domaines d&apos;expertise
            </h2>
            <p className="text-lg text-gray-600">
              Une expertise complète dans tous les domaines du droit
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expertises.map((expertise, index) => (
              <Card
                key={index}
                className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-red-50"
              >
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
              <h3 className="font-semibold text-gray-900 mb-2">
                Décrivez votre situation
              </h3>
              <p className="text-gray-600">
                Expliquez-nous votre problématique juridique
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Sélectionnez un expert
              </h3>
              <p className="text-gray-600">
                Nous vous orientons vers le bon spécialiste
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Recevez vos conseils
              </h3>
              <p className="text-gray-600">
                Obtenez une réponse claire et actionnable
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Suivi personnalisé
              </h3>
              <p className="text-gray-600">
                Bénéficiez d'un accompagnement continu
              </p>
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
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-red-900"
              asChild
            >
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
