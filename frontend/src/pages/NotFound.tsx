// src/pages/NotFound.tsx (ou .jsx)
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { useMemo } from "react";

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const badPath = useMemo(() => decodeURIComponent(pathname || ""), [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <Header />

      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Colonne gauche - Branding */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="p-3 bg-red-900 rounded-2xl">
                  <AlertTriangle className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Lawry Conseils CI
                  </h1>
                  <p className="text-red-800 font-medium">Page introuvable</p>
                </div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Oups… <span className="text-red-900">404</span>
              </h2>

              <p className="text-lg text-gray-600">
                La page demandée n’existe pas ou a été déplacée. Utilisez les
                boutons à droite pour revenir sur un chemin sûr.
              </p>
            </div>
          </div>

          {/* Colonne droite - Carte résultat */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3 lg:hidden">
                  <div className="p-3 bg-red-900 rounded-2xl">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Page précédente
                  </Button>

                  <Button
                    asChild
                    className="h-11 w-full bg-red-900 hover:bg-red-800 text-white font-semibold"
                  >
                    <Link to="/">
                      <Home className="h-4 w-4 mr-2" />
                      Retour à l’accueil
                    </Link>
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500">
                  Ou visitez&nbsp;
                  <Link
                    to="/formations"
                    className="text-red-900 underline underline-offset-4"
                  >
                    nos formations
                  </Link>
                  &nbsp;ou&nbsp;
                  <Link
                    to="/boutique"
                    className="text-red-900 underline underline-offset-4"
                  >
                    la boutique
                  </Link>
                  .
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
