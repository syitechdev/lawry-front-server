// src/pages/Register.tsx
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
import { Eye, EyeOff, Scale, FileText, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { http } from "@/lib/http";

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const onChange =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return toast({
        variant: "warning",
        title: "Nom requis",
        description: "Veuillez saisir votre nom complet.",
      });
    }

    if (form.password !== form.confirmPassword) {
      return toast({
        variant: "warning",
        title: "Mot de passe",
        description: "Les mots de passe ne correspondent pas.",
      });
    }

    try {
      setIsLoading(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        password_confirmation: form.confirmPassword,
      };

      const { data } = await http.post("/auth/register", payload);

      if (data?.token) localStorage.setItem("auth_token", data.token);
      if (data?.user) localStorage.setItem("current_user", JSON.stringify(data.user));

      toast({
        title: "Inscription réussie",
        description: "Bienvenue dans votre espace client.",
      });

      navigate("/client", { replace: true });
    } catch (err: any) {
      const res = err?.response;
      const body: ApiError | undefined = res?.data;

      const emailMsg = body?.errors?.email?.[0];
      const phoneMsg = body?.errors?.phone?.[0];

      if (emailMsg?.toLowerCase().includes("déjà") || emailMsg?.toLowerCase().includes("existe") || emailMsg?.toLowerCase().includes("taken")) {
        toast({
          variant: "destructive",
          title: "Email déjà utilisé",
          description: emailMsg,
        });
      } else if (phoneMsg?.toLowerCase().includes("déjà") || phoneMsg?.toLowerCase().includes("existe") || phoneMsg?.toLowerCase().includes("taken")) {
        toast({
          variant: "destructive",
          title: "Numéro déjà utilisé",
          description: phoneMsg,
        });
      } else {
        const generic =
          body?.message ||
          emailMsg ||
          phoneMsg ||
          "Impossible de créer le compte pour le moment.";
        toast({
          variant: "destructive",
          title: "Erreur d’inscription",
          description: generic,
        });
      }
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
                  <h1 className="text-3xl font-bold text-gray-900">Lawry Conseils CI</h1>
                  <p className="text-red-800 font-medium">Excellence juridique</p>
                </div>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Rejoignez notre <span className="text-red-900">communauté</span>
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                Créez votre compte et accédez à nos services juridiques professionnels
                conçus pour accompagner votre réussite.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Documents personnalisés</h3>
                    <p className="text-sm text-gray-600">Contrats sur mesure</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Réponse rapide</h3>
                    <p className="text-sm text-gray-600">Service client réactif</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-red-100">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-red-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Conformité garantie</h3>
                    <p className="text-sm text-gray-600">Droit ivoirien respecté</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Register Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4 lg:hidden">
                  <div className="p-3 bg-red-900 rounded-2xl">
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900">Inscription</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Créez votre compte pour accéder à nos services juridiques
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <form className="space-y-5" onSubmit={onSubmit}>
                  {/* Nom complet */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Nom complet
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: YAO Koffi"
                      className="h-11 border-gray-300 focus:border-red-900 focus:ring-red-900"
                      value={form.name}
                      onChange={onChange("name")}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="h-11 border-gray-300 focus:border-red-900 focus:ring-red-900"
                      value={form.email}
                      onChange={onChange("email")}
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Téléphone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+225 01 23 45 67"
                      className="h-11 border-gray-300 focus:border-red-900 focus:ring-red-900"
                      value={form.phone}
                      onChange={onChange("phone")}
                      required
                    />
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choisissez un mot de passe"
                        className="h-11 pr-12 border-gray-300 focus:border-red-900 focus:ring-red-900"
                        value={form.password}
                        onChange={onChange("password")}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-900 transition-colors"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Masquer" : "Afficher"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmez votre mot de passe"
                        className="h-11 pr-12 border-gray-300 focus:border-red-900 focus:ring-red-900"
                        value={form.confirmPassword}
                        onChange={onChange("confirmPassword")}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-900 transition-colors"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Masquer" : "Afficher"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* CGU */}
                  <div className="flex items-start space-x-3 pt-2">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-red-900 focus:ring-red-900"
                      required
                    />
                    <label className="text-sm text-gray-600 leading-relaxed">
                      J'accepte les{" "}
                      <Link to="#" className="text-red-900 hover:text-red-800 font-medium hover:underline">
                        conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link to="#" className="text-red-900 hover:text-red-800 font-medium hover:underline">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-red-900 hover:bg-red-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Création du compte..." : "Créer mon compte"}
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-gray-600">
                      Déjà un compte ?{" "}
                      <Link to="/login" className="text-red-900 hover:text-red-800 font-semibold hover:underline">
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
