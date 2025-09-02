import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http";
import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface SubscriptionFormProps {
  plan: any;
  isYearly: boolean;
}

const SubscriptionForm = ({ plan, isYearly }: SubscriptionFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const { data: res } = await http.post("/subscriptions", {
        plan_id: plan.id,
        period: isYearly ? "yearly" : "monthly",
        email,
        name: `${firstName} ${lastName}`,
      });

      const createdId = res?.subscription?.id ?? res?.id ?? null;

      if (plan.is_trial || Number(plan.monthly_price_cfa) === 0) {
        setSuccess(true);
        return;
      }

      if (createdId) {
        const pay = await initPayment({
          type: "subscription",
          id: createdId,
          channel: "paiementpro",
          customer: {
            email,
            firstName,
            lastName,
            phone,
          },
        });

        if (pay?.action && pay?.fields?.sessionid) {
          autoPost(pay.action, pay.fields, pay.method || "POST");
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'abonnement";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="text"
            placeholder="Votre prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Votre nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="tel"
            placeholder="Votre téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-900 hover:bg-red-800"
          >
            {loading
              ? "Chargement..."
              : plan.is_trial
              ? "Activer l'essai gratuit"
              : `Souscrire au plan ${plan.name}`}
          </Button>
        </form>
      ) : (
        <Dialog open={success} onOpenChange={setSuccess}>
          <DialogContent className="max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center text-green-600 text-xl font-bold">
                <CheckCircle className="h-6 w-6 mr-2" />
                Félicitations !
              </DialogTitle>
            </DialogHeader>

            <p className="mt-2 text-gray-700">
              Votre essai gratuit de {plan.trial_days ?? 14} jours a bien été
              activé.
              <br />
              Pour accéder à vos services, connectez-vous à votre espace client.
              <br />
              Si vous avez oublié votre mot de passe, utilisez la fonction de
              récupération avec la même adresse email que celle utilisée lors de
              l’inscription.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-red-900 hover:bg-red-800 w-full sm:w-auto"
              >
                <a href="/login">Se connecter</a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href="/forgot-password">Modifier le mot de passe</a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SubscriptionForm;
