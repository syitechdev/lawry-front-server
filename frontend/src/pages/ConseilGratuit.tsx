import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Phone, Mail, Clock, Scale, Users } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { createConseil, type Urgency } from "@/services/conseils";

const benefits = [
  {
    icon: MessageSquare,
    title: "Consultation gratuite",
    description: "Premier échange sans engagement",
  },
  { icon: Clock, title: "Réponse rapide", description: "Sous 24h maximum" },
  {
    icon: Scale,
    title: "Expertise reconnue",
    description: "Juristes expérimentés",
  },
  {
    icon: Users,
    title: "Accompagnement personnalisé",
    description: "Conseils adaptés à votre situation",
  },
];

const domaines = [
  "Droit des affaires",
  "Création d'entreprise",
  "Droit du travail",
  "Droit immobilier",
  "Droit fiscal",
  "Droit commercial",
  "Droit des contrats",
  "Propriété intellectuelle",
  "Autre",
];

type Errors = Partial<
  Record<
    | "prenom"
    | "nom"
    | "email"
    | "domaine"
    | "situation"
    | "consent"
    | "telephone",
    string
  >
>;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const telOk = (v: string) =>
  v.trim() === "" || /^[+0-9\s.-]{6,20}$/.test(v.trim());

export default function ConseilGratuit() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [domaine, setDomaine] = useState("");
  const [situation, setSituation] = useState("");
  const [urgence, setUrgence] = useState<Urgency | "">("");
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const e: Errors = {};
    if (!prenom.trim()) e.prenom = "Le prénom est requis.";
    if (!nom.trim()) e.nom = "Le nom est requis.";
    if (!emailOk(email)) e.email = "Email invalide.";
    if (!domaine.trim()) e.domaine = "Sélectionnez un domaine.";
    if (situation.trim().length < 10)
      e.situation = "La description doit contenir au moins 10 caractères.";
    if (!telOk(telephone)) e.telephone = "Numéro invalide.";
    if (!consent) e.consent = "Vous devez accepter pour être recontacté.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const touch = (name: keyof Errors, ok: boolean, msg: string) =>
    setErrors((p) => {
      const n = { ...p };
      if (ok) delete n[name];
      else n[name] = msg;
      return n;
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createConseil({
        first_name: prenom.trim(),
        last_name: nom.trim(),
        email: email.trim(),
        phone: telephone.trim() || null,
        legal_domain: domaine,
        description: situation.trim(),
        urgency: urgence || null,
        consent: true,
      });
      toast({
        title: "Envoyé",
        description: "Votre demande a bien été envoyée. Réponse sous 24h.",
      });
      setPrenom("");
      setNom("");
      setEmail("");
      setTelephone("");
      setDomaine("");
      setSituation("");
      setUrgence("");
      setConsent(false);
      setErrors({});
    } catch (err: any) {
      const d = err?.response?.data;
      const msg =
        d?.message ||
        d?.detail ||
        d?.description ||
        d?.violations?.[0]?.message ||
        "Échec de l’envoi du formulaire";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />

      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Conseil Juridique Gratuit
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Obtenez un premier conseil juridique gratuit de nos experts pour
            éclairer vos décisions
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
            <p className="text-lg font-semibold">
              ✓ Sans engagement • ✓ Confidentiel • ✓ Réponse sous 24h
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre conseil gratuit ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <Card
                key={i}
                className="text-center p-6 hover:shadow-lg transition-shadow"
              >
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-8 w-8 text-red-900" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Décrivez votre situation
            </h2>
            <p className="text-lg text-gray-600">
              Remplissez le formulaire ci-dessous pour recevoir votre conseil
              gratuit
            </p>
          </div>

          <Card className="p-8">
            <form className="space-y-6" onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={prenom}
                    onChange={(e) => {
                      setPrenom(e.target.value);
                      touch(
                        "prenom",
                        !!e.target.value.trim(),
                        "Le prénom est requis."
                      );
                    }}
                    placeholder="Votre prénom"
                    className={`mt-1 ${errors.prenom ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.prenom && (
                    <p className="text-xs text-red-600 mt-1">{errors.prenom}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      touch(
                        "nom",
                        !!e.target.value.trim(),
                        "Le nom est requis."
                      );
                    }}
                    placeholder="Votre nom"
                    className={`mt-1 ${errors.nom ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-600 mt-1">{errors.nom}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      touch(
                        "email",
                        emailOk(e.target.value),
                        "Email invalide."
                      );
                    }}
                    placeholder="votre@email.com"
                    className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => {
                      setTelephone(e.target.value);
                      touch(
                        "telephone",
                        telOk(e.target.value),
                        "Numéro invalide."
                      );
                    }}
                    placeholder="+225 XX XX XX XX"
                    className={`mt-1 ${
                      errors.telephone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.telephone && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Domaine juridique *</Label>
                <Select
                  value={domaine}
                  onValueChange={(v) => {
                    setDomaine(v);
                    touch("domaine", !!v, "Sélectionnez un domaine.");
                  }}
                  required
                >
                  <SelectTrigger
                    className={`mt-1 ${errors.domaine ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Sélectionnez un domaine" />
                  </SelectTrigger>
                  <SelectContent>
                    {domaines.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.domaine && (
                  <p className="text-xs text-red-600 mt-1">{errors.domaine}</p>
                )}
              </div>

              <div>
                <Label htmlFor="situation">Décrivez votre situation *</Label>
                <Textarea
                  id="situation"
                  value={situation}
                  onChange={(e) => {
                    setSituation(e.target.value);
                    touch(
                      "situation",
                      e.target.value.trim().length >= 10,
                      "La description doit contenir au moins 10 caractères."
                    );
                  }}
                  placeholder="Expliquez-nous votre problématique juridique en détail..."
                  className={`mt-1 min-h-[120px] ${
                    errors.situation ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.situation && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.situation}
                  </p>
                )}
              </div>

              <div>
                <Label>Niveau d'urgence</Label>
                <Select
                  value={urgence}
                  onValueChange={(v) => setUrgence(v as Urgency)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionnez le niveau d'urgence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faible">
                      Faible - Pas d'urgence particulière
                    </SelectItem>
                    <SelectItem value="moyen">
                      Moyen - Réponse souhaitée rapidement
                    </SelectItem>
                    <SelectItem value="eleve">
                      Élevé - Situation urgente
                    </SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="consent"
                  className="mt-1"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    touch(
                      "consent",
                      e.target.checked,
                      "Vous devez accepter pour être recontacté."
                    );
                  }}
                  required
                />
                <Label htmlFor="consent" className="text-sm text-gray-600">
                  J'accepte que mes données soient utilisées pour me recontacter
                  dans le cadre de ma demande de conseil juridique *
                </Label>
              </div>
              {errors.consent && (
                <p className="text-xs text-red-600 -mt-3">{errors.consent}</p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-red-900 hover:bg-red-800 text-white"
                disabled={loading}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                {loading ? "Envoi en cours…" : "Envoyer ma demande"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça fonctionne ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card>
              <CardContent className="text-center p-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-900 font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Remplissez le formulaire
                </h3>
                <p className="text-gray-600 text-sm">
                  Décrivez votre situation juridique
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-900 font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Analyse par nos experts
                </h3>
                <p className="text-gray-600 text-sm">
                  Nos juristes étudient votre demande
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-900 font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Conseil personnalisé
                </h3>
                <p className="text-gray-600 text-sm">
                  Recevez votre conseil par email
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center p-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-900 font-bold text-xl">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Accompagnement suite
                </h3>
                <p className="text-gray-600 text-sm">
                  Possibilité de services complémentaires
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'une réponse immédiate ?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Contactez-nous directement par téléphone ou email
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <Phone className="h-8 w-8 mx-auto mb-4 text-white" />
              <h3 className="font-semibold mb-2">Téléphone</h3>
              <p className="text-red-100">+225 0101987580</p>
              <p className="text-red-100">+225 0709122074</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <Mail className="h-8 w-8 mx-auto mb-4 text-white" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-red-100">contact.lawryconsulting@gmail.com</p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <Clock className="h-8 w-8 mx-auto mb-4 text-white" />
              <h3 className="font-semibold mb-2">Horaires</h3>
              <p className="text-red-100">Lun-Ven: 8h-18h</p>
              <p className="text-red-100">Sam: 8h-12h</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
