// src/pages/DossierTracking.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import Header from "@/components/Header";
import { Link, useNavigate, useParams } from "react-router-dom";
import DossierSearchForm from "@/components/DossierSearchForm";
import Footer from "@/components/Footer";
import { trackDemande, type TrackingResponse } from "@/services/tracking";

type TrackingStep = TrackingResponse["steps"][number];

export default function DossierTracking() {
  const { ref } = useParams<{ ref?: string }>();
  const navigate = useNavigate();

  const [searchResult, setSearchResult] = useState<TrackingResponse | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Lance la recherche automatiquement quand on arrive avec /suivi-dossier/:ref
  useEffect(() => {
    if (!ref) return;
    (async () => {
      setIsSearching(true);
      setHasSearched(false);
      setSearchResult(null);
      try {
        const result = await trackDemande(ref);
        setSearchResult(result);
      } catch (e) {
        console.error("Erreur de tracking", e);
        setSearchResult(null);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    })();
  }, [ref]);

  // Soumission depuis le formulaire : on pousse l’URL, le useEffect ci-dessus fera la requête
  const handleSubmitFromForm = (inputRef: string) => {
    const val = inputRef.trim();
    if (!val) return;
    navigate(`/suivi-dossier/${encodeURIComponent(val)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "current":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const fmt = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "-";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Suivi de dossier
            </h1>
            <p className="text-lg text-gray-600">
              Suivez l'état d'avancement de votre dossier en temps réel
            </p>
          </div>

          <DossierSearchForm
            onSubmit={handleSubmitFromForm}
            loading={isSearching}
            autoFocus
          />

          {/* Résultat */}
          {searchResult && (
            <div className="space-y-6">
              {/* Info dossier */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-red-900 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Dossier {searchResult.number}
                      </CardTitle>
                      <CardDescription>{searchResult.type}</CardDescription>
                    </div>
                    <Badge
                      className={
                        searchResult.status === "termine"
                          ? "bg-green-100 text-green-800"
                          : searchResult.status === "annule"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {searchResult.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        <strong>Client:</strong>{" "}
                        {searchResult.client_hint ?? "-"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        <strong>Créé le:</strong>{" "}
                        {fmt(searchResult.dates?.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        <strong>Fin estimée:</strong>{" "}
                        {fmt(searchResult.dates?.estimated_completion)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progression</span>
                      <span className="text-sm text-gray-600">
                        {searchResult.progress}%
                      </span>
                    </div>
                    <Progress value={searchResult.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-900">Suivi détaillé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {searchResult.steps.map(
                      (step: TrackingStep, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4"
                        >
                          <div
                            className={`w-4 h-4 rounded-full ${getStatusColor(
                              step.status
                            )}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium ${
                                  step.status === "completed"
                                    ? "text-green-700"
                                    : step.status === "current"
                                    ? "text-blue-700"
                                    : "text-gray-500"
                                }`}
                              >
                                {step.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(step.status)}
                                {step.date && (
                                  <span className="text-sm text-gray-600">
                                    {fmt(step.date)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cas not found */}
          {hasSearched && !isSearching && !searchResult && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Dossier non trouvé
                </h3>
                <p className="text-red-700 mb-4">
                  Aucun dossier ne correspond au numéro saisi.
                </p>
                <p className="text-sm text-red-600">
                  Vérifiez le numéro ou contactez notre support si le problème
                  persiste.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
