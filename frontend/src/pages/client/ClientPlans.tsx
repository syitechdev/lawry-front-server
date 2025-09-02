import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { http } from "@/lib/http";
import { Check, Clock, XCircle } from "lucide-react";

interface Subscription {
  id: number;
  period: "monthly" | "yearly";
  status: string;
  current_cycle_start: string | null;
  current_cycle_end: string | null;
  plan: {
    id: number;
    name: string;
    description?: string;
    monthly_price_cfa: number;
    yearly_price_cfa: number;
    trial_days?: number | null;
    is_trial?: boolean;
    features: string[];
    gradient?: string;
  };
}

const ClientPlans = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get("/client/subscriptions/my");
        setSubs(data?.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeCount = subs.filter((s) => s.status === "active").length;
  const expiredCount = subs.filter((s) => s.status === "expired").length;
  const pendingCount = subs.filter(
    (s) => s.status === "pending_payment"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="client"
        userName="Client Lawry"
        userEmail="client@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        {/* header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 shadow-xl relative">
            <h1 className="text-3xl font-bold mb-2">Mes Abonnements</h1>
            <p className="text-blue-100">
              Vos plans actifs, expirés ou en attente
            </p>
            <Button
              onClick={() => (window.location.href = "/services")}
              className="absolute top-6 right-6 bg-white text-blue-900 hover:bg-blue-100"
            >
              Choisir un autre plan
            </Button>
          </div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-t-4 border-transparent bg-white shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-green-400 to-green-600 rounded-t-lg" />
            <CardHeader>
              <CardTitle>Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-transparent bg-white shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-t-lg" />
            <CardHeader>
              <CardTitle>En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-transparent bg-white shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-red-400 to-red-600 rounded-t-lg" />
            <CardHeader>
              <CardTitle>Expirés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{expiredCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* abonnements */}
        {loading ? (
          <p>Chargement...</p>
        ) : subs.length === 0 ? (
          <p>Aucun abonnement trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {subs.map((sub) => {
              const plan = sub.plan;
              const start = sub.current_cycle_start
                ? new Date(sub.current_cycle_start).toLocaleDateString()
                : null;
              const end = sub.current_cycle_end
                ? new Date(sub.current_cycle_end).toLocaleDateString()
                : null;

              return (
                <Card key={sub.id} className="relative shadow-lg">
                  <div
                    className={`bg-gradient-to-r ${
                      plan.gradient || "from-gray-100 to-gray-200"
                    } p-6 rounded-t-lg`}
                  >
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white">
                        {plan.name}
                      </h2>
                      {plan.is_trial ? (
                        <p className="text-white/80">
                          {plan.trial_days ?? 14} jours
                        </p>
                      ) : (
                        <p className="text-white/80">
                          {sub.period === "monthly"
                            ? `${plan.monthly_price_cfa.toLocaleString()} FCFA / mois`
                            : `${plan.yearly_price_cfa.toLocaleString()} FCFA / an`}
                        </p>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {start && end && (
                      <p className="text-gray-600 mb-4">
                        {start} → {end}
                      </p>
                    )}

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {sub.status === "active" && (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Actif
                      </Button>
                    )}
                    {sub.status === "pending_payment" && (
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                        Valider mon plan
                      </Button>
                    )}
                    {sub.status === "expired" && (
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Renouveler
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Questions Fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Puis-je changer de plan à tout moment ?
              </h4>
              <p className="text-gray-600 text-sm">
                Oui, vous pouvez modifier votre plan à tout moment. Les
                changements prennent effet immédiatement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Y a-t-il des frais d'installation ?
              </h4>
              <p className="text-gray-600 text-sm">
                Non, aucun frais d'installation n'est requis. Vous payez
                uniquement votre abonnement mensuel.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Que se passe-t-il si je dépasse les limites de mon plan ?
              </h4>
              <p className="text-gray-600 text-sm">
                Nous vous préviendrons avant d'atteindre les limites et vous
                pourrez facilement passer à un plan supérieur.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Contact */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Besoin d'aide pour choisir ?
          </h3>
          <p className="text-gray-600 mb-4">
            Notre équipe est là pour vous conseiller
          </p>
          <Button variant="outline">Contacter un conseiller</Button>
        </div>
      </div>
    </div>
  );
};

export default ClientPlans;
