import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTypeOffers, formatFCFA } from "@/hooks/useTypeOffers";
import { buildFormUrl, normalizeSigle } from "@/constants/formRoutes";

type Props = { formType?: string }; // compat

const NON_PROFIT_SIGLES = ["ONG", "ASSOCIATION", "FONDATION", "SCOOP"];

export default function PricingSection(props: Props) {
  const params = useParams();
  const navigate = useNavigate();

  const typeSigle = props.formType || params.typeSigle || "";
  const typeKey = normalizeSigle(typeSigle);
  const isNonProfit = NON_PROFIT_SIGLES.includes(typeKey);

  const { basic, quote, loading, error } = useTypeOffers(typeSigle);

  const goBasic = () => navigate(buildFormUrl(typeSigle, basic?.key));
  const goQuote = () =>
    navigate(buildFormUrl(typeSigle, quote?.key || basic?.key));

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">Chargement…</div>
      </section>
    );
  }
  if (error) {
    //
  }
  if (!basic && !quote) {
    return (
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          Aucune offre disponible pour ce type pour le moment.
        </div>
      </section>
    );
  }

  // *** Cas Non-profit : 1 seule carte ***
  if (isNonProfit) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden shadow-xl">
            <div className="bg-red-900 text-white text-center py-4">
              <h3 className="text-xl font-bold">
                {typeSigle} en Côte d'Ivoire
              </h3>
            </div>

            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-red-900 mb-4">
                {basic?.title || "Tarif basique"}
              </CardTitle>
              {basic?.subtitle && (
                <CardDescription className="text-red-900 font-semibold">
                  {basic.subtitle}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Éléments inclus :
                </h4>
                <ul className="space-y-3">
                  {(basic?.features ?? []).map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="text-4xl font-bold text-red-900 mb-2">
                    {formatFCFA(basic?.priceInterior)}
                  </div>
                  <div className="text-gray-600">pour l'intérieur</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-900 mb-2">
                    {formatFCFA(basic?.priceAbidjan)}
                  </div>
                  <div className="text-gray-600">pour Abidjan</div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-red-900 hover:bg-red-800 text-white px-12 py-4 text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  onClick={goBasic}
                >
                  {basic?.cta || "Choisir"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // *** Cas sociétés commerciales : 2 colonnes (basic + quote si présent) ***
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nos tarifs pour votre {typeSigle}
          </h2>
          <p className="text-lg text-gray-600">
            Choisissez l'option qui correspond à votre projet
          </p>
        </div>

        <div
          className={`grid grid-cols-1 ${quote ? "lg:grid-cols-2" : ""} gap-8`}
        >
          {/* Colonne 1: Basic */}
          {basic && (
            <Card className="relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-900 to-red-700"></div>

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {basic.title}
                </CardTitle>
                {basic.subtitle && (
                  <CardDescription className="text-red-900 font-semibold">
                    {basic.subtitle}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Éléments inclus :
                  </h4>
                  <ul className="space-y-3">
                    {basic.features.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!!basic.options.length && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Options avec prix :
                    </h4>
                    <ul className="space-y-2">
                      {basic.options.map((op, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100"
                        >
                          <span className="text-gray-700">{op.name}</span>
                          <span className="font-semibold text-red-900">
                            {op.price || "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-red-900 mb-1">
                      {formatFCFA(basic.priceInterior)}
                    </div>
                    <div className="text-gray-600">pour l'intérieur</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-900 mb-1">
                      {formatFCFA(basic.priceAbidjan)}
                    </div>
                    <div className="text-gray-600">pour Abidjan</div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="w-full bg-red-900 hover:bg-red-800 text-white py-4 text-lg font-semibold hover:shadow-xl hover:shadow-red-900/25 hover:scale-105 transition-all duration-300"
                    onClick={goBasic}
                  >
                    {basic?.cta || "Choisir"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Colonne 2: Quote */}
          {quote && (
            <Card className="relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-red-900">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 to-red-900"></div>

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {quote.title}
                </CardTitle>
                {quote.subtitle && (
                  <CardDescription className="text-red-900 font-semibold">
                    {quote.subtitle}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Éléments inclus :
                  </h4>
                  <ul className="space-y-3">
                    {(quote.features.length
                      ? quote.features
                      : basic?.features || []
                    ).map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!!quote.options.length && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Options avec prix :
                    </h4>
                    <ul className="space-y-2">
                      {quote.options.map((op, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100"
                        >
                          <span className="text-gray-700">{op.name}</span>
                          <span className="font-semibold text-red-900">
                            {op.price || "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-red-900 mb-2">
                    Tarif sur devis personnalisé
                  </div>
                  <div className="text-gray-600">
                    Contactez-nous pour une étude personnalisée
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="w-full bg-red-900 hover:bg-red-800 text-white py-4 text-lg font-semibold hover:shadow-xl hover:shadow-red-900/25 hover:scale-105 transition-all duration-300"
                    onClick={goQuote}
                  >
                    {quote?.cta || "Demander un devis"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
