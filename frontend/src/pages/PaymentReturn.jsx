// src/pages/PaymentReturn.jsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, AlertTriangle, CreditCard } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPaymentStatus } from "@/services/paymentApi";

/** Mappe les codes PaiementPro visibles dans l’URL à un statut UX immédiat */
function mapResponseCodeToStatus(code) {
  switch (String(code ?? "").trim()) {
    case "0":
      return "succeeded";
    case "-1":
      return "failed";
    case "1001":
    case "1002":
    case "CANCEL":
      return "cancelled";
    default:
      return "checking";
  }
}

/** Extrait reference depuis ?reference | ?referenceNumber | ?returnContext */
function extractReferenceFromLocation() {
  const params = new URLSearchParams(window.location.search);

  const direct = params.get("reference") || params.get("referenceNumber");
  if (direct) return { reference: direct, urlParams: params };

  const ctx = params.get("returnContext");
  if (ctx) {
    try {
      const dec = decodeURIComponent(ctx);
      const inner = new URLSearchParams(dec);
      const ref = inner.get("reference") || "";
      return { reference: ref, urlParams: params };
    } catch {
      // ignore decode errors
    }
  }
  return { reference: "", urlParams: params };
}

/** Normalise les statuts renvoyés par /pay/return vers l’UX */
function normalizeBackendStatus(status) {
  const s = (status || "").toLowerCase();
  if (["succeeded", "failed", "cancelled", "expired"].includes(s)) return s;
  if (["ok", "success", "s_ok", "paid", "completed"].includes(s)) return "succeeded";
  if (["fail", "failed", "s_fail", "error"].includes(s)) return "failed";
  if (["cancel", "cancelled", "s_cancel"].includes(s)) return "cancelled";
  if (["expire", "expired", "s_expire"].includes(s)) return "expired";
  if (["pending", "initiated", "process"].includes(s)) return "checking";
  return s || "unknown";
}

export default function PaymentReturn() {
  const { reference, urlParams } = useMemo(extractReferenceFromLocation, []);
  const immediateHint = useMemo(
    () => mapResponseCodeToStatus(urlParams.get("responsecode") || urlParams.get("responseCode") || undefined),
    [urlParams]
  );

  const [status, setStatus] = useState(immediateHint);
  const [message, setMessage] = useState("");
  const [tries, setTries] = useState(0);
  const timerRef = useRef(null);

  // Poll avec petit backoff jusqu’à ce que le webhook ait mis à jour la base
  useEffect(() => {
    async function checkOnce() {
      try {
        const res = await getPaymentStatus(reference);
        const normalized = normalizeBackendStatus(res && res.status);
        setStatus(normalized);
        setMessage((res && res.message) || "");

        // Arrêt si statut terminal
        if (["succeeded", "failed", "cancelled", "expired", "unknown", "error"].includes(normalized)) {
          return;
        }

        const nextTry = tries + 1;
        setTries(nextTry);
        const delay = Math.min(1000 * nextTry, 6000); // 1s → 6s
        timerRef.current = setTimeout(checkOnce, delay);
      } catch (e) {
        setStatus("error");
        setMessage((e && e.message) || "Erreur pendant la vérification du paiement.");
      }
    }

    if (!reference) return;
    checkOnce();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const TitleIcon =
    status === "succeeded"
      ? CheckCircle
      : status === "failed"
      ? XCircle
      : status === "cancelled" || status === "expired"
      ? AlertTriangle
      : Clock;

  const title =
    {
      succeeded: "Paiement réussi",
      failed: "Paiement échoué",
      cancelled: "Paiement annulé",
      expired: "Session expirée",
      checking: "Vérification en cours…",
      error: "Erreur",
      unknown: "Statut inconnu",
    }[status] || "Paiement";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <Header />

      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding / Infos */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="p-3 bg-red-900 rounded-2xl">
                  <CreditCard className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Lawry Conseils CI</h1>
                  <p className="text-red-800 font-medium">Paiement sécurisé</p>
                </div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Résultat du <span className="text-red-900">paiement</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Nous confirmons votre transaction et mettons à jour votre espace client. En cas d’échec,
                vous pourrez réessayer.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Confirmation</h3>
                    <p className="text-sm text-gray-600">Quelques secondes pour la mise à jour</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Accès à vos services</h3>
                    <p className="text-sm text-gray-600">
                      Votre espace client sera débloqué après succès
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Result Card */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4 lg:hidden">
                  <div className="p-3 bg-red-900 rounded-2xl">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <TitleIcon
                    className={`h-6 w-6 ${
                      status === "succeeded"
                        ? "text-green-600"
                        : status === "failed"
                        ? "text-red-600"
                        : status === "cancelled" || status === "expired"
                        ? "text-amber-600"
                        : "text-gray-500"
                    }`}
                  />
                  <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
                </div>

                <CardDescription className="text-gray-600 text-base mt-2">
                  Référence : <span className="font-medium">{reference || "—"}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut</span>
                  <Badge
                    className={
                      status === "succeeded"
                        ? "bg-green-100 text-green-800"
                        : status === "failed"
                        ? "bg-red-100 text-red-800"
                        : status === "cancelled" || status === "expired"
                        ? "bg-amber-100 text-amber-800"
                        : status === "checking"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {title}
                  </Badge>
                </div>

                {message ? (
                  <p className="text-gray-700 leading-relaxed">{message}</p>
                ) : (
                  <p className="text-gray-500">
                    {status === "checking"
                      ? "Merci de patienter pendant la confirmation du paiement…"
                      : status === "succeeded"
                      ? "Votre paiement a été validé. Vous pouvez accéder à votre espace."
                      : status === "failed"
                      ? "Le paiement n’a pas abouti. Vous pouvez réessayer."
                      : status === "cancelled"
                      ? "Le paiement a été annulé par l’utilisateur."
                      : status === "expired"
                      ? "La session de paiement a expiré."
                      : "Statut indisponible."}
                  </p>
                )}

                {status === "succeeded" ? (
                  <Button asChild className="w-full h-11 bg-red-900 hover:bg-red-800 text-white font-semibold">
                    <Link to="/mes-formations">Voir ma formation</Link>
                  </Button>
                ) : ["failed", "expired", "cancelled"].includes(status) ? (
                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="w-1/2 h-11">
                      <Link to="/">Retour à l’accueil</Link>
                    </Button>
                    <Button asChild className="w-1/2 h-11 bg-red-900 hover:bg-red-800 text-white font-semibold">
                      <Link to="/formations">Réessayer</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2 text-sm text-gray-500">
                    Vérification… (tentative {tries})
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
