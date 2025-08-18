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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Scale,
  FileText,
  Clock,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const email = sp.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const canSubmit = useMemo(
    () =>
      Boolean(token && email && password.length >= 8 && password === confirm),
    [token, email, password, confirm]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsLoading(true);
      await http.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      toast({
        title: "Mot de passe réinitialisé",
        description: "Vous pouvez maintenant vous connecter.",
      });
      navigate("/login");
    } catch (err: any) {
      const body: ApiError | undefined = err?.response?.data;
      toast({
        variant: "destructive",
        title: "Échec de la réinitialisation",
        description: body?.message || "Lien invalide ou expiré.",
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
                Réinitialisation <span className="text-red-900">sécurisée</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Choisissez un nouveau mot de passe pour votre compte.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Confidentialité
                    </h3>
                    <p className="text-sm text-gray-600">
                      Protection de vos données
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Lien vérifié
                    </h3>
                    <p className="text-sm text-gray-600">Jeton unique requis</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Efficace</h3>
                    <p className="text-sm text-gray-600">
                      En quelques instants
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
                  Réinitialiser le mot de passe
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Email&nbsp;:{" "}
                  <span className="font-medium">{email || "—"}</span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form className="space-y-5" onSubmit={onSubmit}>
                  {/* Nouveau mot de passe */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 font-medium"
                    >
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Au moins 8 caractères"
                        className="h-11 pr-12 border-gray-300 focus:border-red-900 focus:ring-red-900"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-900 transition-colors"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Masquer" : "Afficher"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm"
                      className="text-gray-700 font-medium"
                    >
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Retapez le mot de passe"
                        className="h-11 pr-12 border-gray-300 focus:border-red-900 focus:ring-red-900"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-900 transition-colors"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword ? "Masquer" : "Afficher"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {confirm && confirm !== password && (
                      <p className="text-xs text-red-600 mt-1">
                        Les mots de passe ne correspondent pas.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-red-900 hover:bg-red-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!canSubmit || isLoading}
                  >
                    {isLoading ? "Validation..." : "Réinitialiser"}
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-gray-600">
                      Retour à{" "}
                      <Link
                        to="/login"
                        className="text-red-900 hover:text-red-800 font-semibold hover:underline"
                      >
                        la connexion
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
