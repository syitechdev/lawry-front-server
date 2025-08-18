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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Scale, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";
import type { AxiosError } from "axios";

type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string; roles?: string[] };
};

type ErrorPayload = { message?: string; detail?: string };

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired") === "1") {
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter.",
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [location.search, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await http.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("current_user", JSON.stringify(data.user));

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${data.user.name}`,
        duration: 3000,
      });

      const roles = data.user.roles ?? [];
      navigate(roles.includes("Admin") ? "/admin" : "/client", {
        replace: true,
      });
    } catch (error) {
      const err = error as AxiosError<ErrorPayload>;
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Email ou mot de passe incorrect";

      toast({
        title: "Attention",
        description: msg,
        variant: "warning",
        duration: 4500,
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
          {/* Left side - Branding */}
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
                Bienvenue dans votre{" "}
                <span className="text-red-900">espace client</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Accédez à tous vos documents juridiques, suivez vos dossiers et
                bénéficiez de nos conseils personnalisés.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Sécurisé et confidentiel
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vos données sont protégées
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Users className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Support dédié
                    </h3>
                    <p className="text-sm text-gray-600">
                      Nos experts vous accompagnent
                    </p>
                  </div>
                </div>
              </div>

              {/* Infos démo */}
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-red-100">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Comptes de démonstration :
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-blue-600">Admin :</span>
                    <span className="text-gray-600">
                      admin@lawry.ci / admin123
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-green-600">Client :</span>
                    <span className="text-gray-600">
                      client@lawry.ci / client123
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4 lg:hidden">
                  <div className="p-3 bg-red-900 rounded-2xl">
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Connexion
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Accédez à votre espace client pour gérer vos documents et
                  services
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
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
                      className="h-12 border-gray-300 focus:border-red-900 focus:ring-red-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 font-medium"
                    >
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        className="h-12 pr-12 border-gray-300 focus:border-red-900 focus:ring-red-900"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-900 transition-colors"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-red-900 focus:ring-red-900"
                      />
                      <span>Se souvenir de moi</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-red-900 hover:text-red-800 font-medium hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-red-900 hover:bg-red-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Pas encore de compte ?{" "}
                    <Link
                      to="/register"
                      className="text-red-900 hover:text-red-800 font-semibold hover:underline"
                    >
                      Créer un compte
                    </Link>
                  </p>
                </div>

                {/* Mobile - Infos de connexion */}
                <div className="lg:hidden p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                    Comptes de test :
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-medium text-blue-600">Admin :</span>
                      <span className="text-gray-600 ml-1">
                        admin@lawry.ci / admin123
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">
                        Client :
                      </span>
                      <span className="text-gray-600 ml-1">
                        client@lawry.ci / client123
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
