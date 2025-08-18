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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";
import { Scale, FileText, Clock, CheckCircle, Mail } from "lucide-react";

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await http.post("/auth/forgot-password", { email: email.trim() });
      toast({
        title: "Lien envoyé ✉️",
        description:
          "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });
      navigate("/login");
    } catch (err: any) {
      const body: ApiError | undefined = err?.response?.data;
      toast({
        variant: "destructive",
        title: "Impossible d’envoyer le lien",
        description: body?.message || "Email introuvable.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <Header />

      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding (même que Register) */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="p-3 bg-red-900 rounded-2xl">
                  <Scale className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Lawry Conseils CI
                  </h1>
                  <p className="text-red-800 font-medium">
                    Excellence juridique
                  </p>
                </div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Mot de passe <span className="text-red-900">oublié</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Saisissez votre adresse email. Nous vous enverrons un lien pour
                réinitialiser votre mot de passe.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Procédure sécurisée
                    </h3>
                    <p className="text-sm text-gray-600">
                      Lien unique et temporaire
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Rapide</h3>
                    <p className="text-sm text-gray-600">En quelques minutes</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Simple</h3>
                    <p className="text-sm text-gray-600">
                      Suivez le lien reçu par email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4 lg:hidden">
                  <div className="p-3 bg-red-900 rounded-2xl">
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Mot de passe oublié
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Entrez votre email pour recevoir le lien de réinitialisation
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form className="space-y-5" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700 font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="h-11 border-gray-300 focus:border-red-900 focus:ring-red-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-red-900 hover:bg-red-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Envoi..."
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer le lien
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-gray-600">
                      Vous vous souvenez de votre mot de passe ?{" "}
                      <Link
                        to="/login"
                        className="text-red-900 hover:text-red-800 font-semibold hover:underline"
                      >
                        Se connecter
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
