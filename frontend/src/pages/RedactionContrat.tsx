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
import { FileText, CheckCircle, Clock, Users, Shield } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { http } from "@/lib/http";
import { useToast } from "@/hooks/use-toast";

type PricingMode = "fixed" | "from" | "quote";
type VariantCard = {
  key: string;
  title: string;
  subtitle?: string | null;
  pricing_mode: PricingMode;
  price_amount?: number | null;
  currency?: string | null;
  features?: string[];
  cta?: string;
  active?: boolean;
  pill?: string | null;
  meta?: any;
};

type RtResponse = {
  id: number;
  name: string;
  slug: string;
  currency?: string;
  config?: {
    variant_cards?: VariantCard[];
    order?: string[];
  } | null;
};

const RedactionContrat = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rt, setRt] = useState<RtResponse | null>(null);
  const [cards, setCards] = useState<VariantCard[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await http.get<RtResponse>(
          "/request-types/slug/rediger-contrat"
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
    })();
  }, []);

  const priceText = (c: VariantCard) => {
    const curr = c.currency || rt?.currency || "XOF";
    const n = Number(c.price_amount || 0);
    if (c.pricing_mode === "quote" || !n) return "Sur devis";
    const amount = n.toLocaleString("fr-FR");
    return c.pricing_mode === "from"
      ? `À partir de ${amount} ${curr}`
      : `${amount} ${curr}`;
  };

  const pillText = (c: VariantCard) =>
    c.pill || (c.meta && typeof c.meta === "object" ? c.meta.pill : undefined);

  // Avantages (vitrine) — inchangé
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

  const first = cards[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

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
            <Link
              to="/redaction-contrat/formulaire"
              state={
                first
                  ? { offer: { key: first.key, title: first.title } }
                  : undefined
              }
            >
              <FileText className="mr-2 h-5 w-5" />
              Demander un devis
            </Link>
          </Button>
        </div>
      </section>

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

          {loading ? (
            <div className="text-center text-gray-500">Chargement…</div>
          ) : cards.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucune formule active pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {cards.map((c) => (
                <Card
                  key={c.key}
                  className="hover:shadow-xl transition-all duration-300 group hover:scale-105"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-red-900 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        {c.title}
                      </CardTitle>
                      {pillText(c) && (
                        <Badge className="bg-red-100 text-red-900">
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
                      asChild
                    >
                      <Link
                        to={`/redaction-contrat/formulaire?offer=${encodeURIComponent(
                          c.key
                        )}&offer_name=${encodeURIComponent(c.title)}`}
                        state={{ offer: { key: c.key, title: c.title } }}
                      >
                        {c.cta || "Commander ce contrat"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Advantages (inchangé) */}
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
              <Link
                to="/redaction-contrat/formulaire"
                state={
                  first
                    ? { offer: { key: first.key, title: first.title } }
                    : undefined
                }
              >
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
              <Link
                to="/redaction-contrat/formulaire"
                state={
                  first
                    ? { offer: { key: first.key, title: first.title } }
                    : undefined
                }
              >
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
