import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, AlertTriangle, CreditCard } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { http } from "@/lib/http";

function mapResponseCodeToStatus(code) {
  const c = String(code ?? "").trim().toUpperCase();
  if (c === "0") return "succeeded";
  if (c === "-1") return "failed";
  if (c === "CANCEL") return "cancelled";
  if (c === "EXPIRED") return "expired";
  if (c === "1001" || c === "1002") return "failed";
  return "checking";
}

function normalizeBackendStatus(status) {
  const s = (status || "").toLowerCase();
  if (["succeeded", "failed", "cancelled", "expired"].includes(s)) return s;
  if (["ok", "success", "paid", "completed"].includes(s)) return "succeeded";
  if (["fail", "failed", "error"].includes(s)) return "failed";
  if (["cancel", "cancelled"].includes(s)) return "cancelled";
  if (["expire", "expired"].includes(s)) return "expired";
  if (["pending", "initiated", "processing", "process"].includes(s)) return "checking";
  return s || "unknown";
}

function qp() {
  try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); }
}
function cleanRef(ref) { return String(ref || "").split("?")[0].split("&")[0]; }

function buildParams() {
  const q = qp();
  const reference =
    cleanRef(q.get("reference")) ||
    cleanRef(q.get("referenceNumber")) ||
    "";
  const params = {
    ...(reference ? { reference } : {}),
    ...(q.get("referenceNumber") ? { referenceNumber: q.get("referenceNumber") } : {}),
    ...(q.get("sessionId") ? { sessionId: q.get("sessionId") } : {}),
    ...(q.get("sessionid") ? { sessionid: q.get("sessionid") } : {}),
    ...(q.get("responsecode") ? { responsecode: q.get("responsecode") } : {}),
    ...(q.get("message") ? { message: q.get("message") } : {}),
  };
  return { params, reference, q };
}

export default function PaymentReturn() {
  const { params, reference, q } = useMemo(buildParams, []);
  const urlCode = q.get("responsecode") || q.get("responseCode") || "";
  const urlHint = useMemo(() => mapResponseCodeToStatus(urlCode), [urlCode]);
  const urlIsTerminal = ["succeeded", "failed", "cancelled", "expired"].includes(urlHint);

  const [status, setStatus] = useState(urlHint);
  const [message, setMessage] = useState(q.get("message") || "");
  const [tries, setTries] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let aborted = false;

    async function callReturn(singleShot = false, nextTry = 0) {
      try {
        const { data } = await http.get(`/pay/return`, {
          params,
          headers: { Accept: "application/json" },
        });
        if (aborted) return;

        const normalized = normalizeBackendStatus(data?.status);

        if (urlIsTerminal) {
          setStatus(urlHint);
          if (data?.message) setMessage(data.message);
          return;
        }

        setStatus(normalized);
        setMessage(data?.message || "");

        if (["succeeded", "failed", "cancelled", "expired", "error"].includes(normalized)) {
          return;
        }

        const n = nextTry + 1;
        setTries(n);
        if (n >= 25) {
          setStatus("unknown");
          return;
        }
        const delay = Math.min(1000 * n, 6000);
        timerRef.current = setTimeout(() => callReturn(false, n), delay);
      } catch (e) {
        if (aborted) return;
        const httpStatus = e?.response?.status;
        if (httpStatus === 404) {
          if (urlIsTerminal) {
            setStatus(urlHint);
            return;
          }
          const n = nextTry + 1;
          setTries(n);
          if (n >= 25) {
            setStatus("unknown");
            return;
          }
          const delay = Math.min(1000 * n, 6000);
          timerRef.current = setTimeout(() => callReturn(false, n), delay);
          return;
        }
        setStatus("error");
        setMessage(e?.response?.data?.message || e?.message || "Erreur pendant la vérification du paiement.");
      }
    }

    if (urlIsTerminal) {
      setStatus(urlHint);
      callReturn(true, 0);
      return () => { aborted = true; if (timerRef.current) clearTimeout(timerRef.current); };
    }

    callReturn(false, 0);
    return () => { aborted = true; if (timerRef.current) clearTimeout(timerRef.current); };
  }, [params, urlHint, urlIsTerminal]);

  const TitleIcon =
    status === "succeeded" ? CheckCircle :
    status === "failed" ? XCircle :
    status === "cancelled" || status === "expired" ? AlertTriangle :
    Clock;

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
                Nous confirmons votre transaction et mettons à jour votre espace client.
              </p>
            </div>
          </div>

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
                      status === "succeeded" ? "text-green-600" :
                      status === "failed" ? "text-red-600" :
                      status === "cancelled" || status === "expired" ? "text-amber-600" :
                      "text-gray-500"
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
                      status === "succeeded" ? "bg-green-100 text-green-800" :
                      status === "failed" ? "bg-red-100 text-red-800" :
                      status === "cancelled" || status === "expired" ? "bg-amber-100 text-amber-800" :
                      status === "checking" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }
                  >
                    {title}
                  </Badge>
                </div>

                {status === "succeeded" ? (
                  <Button asChild className="w-full h-11 bg-red-900 hover:bg-red-800 text-white font-semibold">
                    <Link to="/login">Acceder à mon espace</Link>
                  </Button>
                ) : ["failed", "expired", "cancelled"].includes(status) ? (
                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="w-1/2 h-11">
                      <Link to="/">Retour à l’accueil</Link>
                    </Button>
                    
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2 text-sm text-gray-500">
                    Vérification…{tries ? ` (tentative ${tries})` : ""}
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
