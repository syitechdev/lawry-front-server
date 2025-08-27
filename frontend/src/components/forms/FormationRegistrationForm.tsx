import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  CheckCircle,
  CreditCard,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";
import { getCurrentUser, isAuthenticated } from "@/services/auth";
import {
  checkAlreadyRegistered,
  createRegistration,
  markRegisteredLocal,
} from "@/services/registrations";

import { initPayment } from "@/services/paymentApi";
import { autoPost } from "@/utils/autoPost";

const formationRegistrationSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Téléphone requis"),
  profession: z.string().min(1, "Profession requise"),
  company: z.string().optional(),
  experience: z.enum(["debutant", "intermediaire", "avance"]),
  motivation: z.string().min(10, "Motivation requise (minimum 10 caractères)"),
  specificNeeds: z.string().optional(),
  sessionFormat: z.enum(["presentiel", "distanciel"]),
});

type FormationRegistrationData = z.infer<typeof formationRegistrationSchema>;

interface FormationRegistrationFormProps {
  selectedFormation?: {
    id: number;
    title: string;
    price: string;
    priceNumber: number;
    duration: string;
    level: string;
    type?: string;
    date?: string;
  } | null;
  onBack: () => void;
}

const FormationRegistrationForm: React.FC<FormationRegistrationFormProps> = ({
  selectedFormation,
  onBack,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormationRegistrationData | null>(
    null
  );
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = getCurrentUser();
  const userKey = user ? `${user.id}|${user.email}` : null;

  const computedDefaultSession = useMemo(() => {
    const t = (selectedFormation?.type || "").toLowerCase();
    if (t.includes("présentiel")) return "presentiel";
    if (t.includes("en ligne")) return "distanciel";
    return "presentiel";
  }, [selectedFormation?.type]);

  //Paiement
  const shouldPayNow = useMemo(
    () => (selectedFormation?.priceNumber ?? 0) > 0,
    [selectedFormation?.priceNumber]
  );

  const isHybrid = (selectedFormation?.type || "")
    .toLowerCase()
    .includes("hybride");

  const form = useForm<FormationRegistrationData>({
    resolver: zodResolver(formationRegistrationSchema),
    defaultValues: {
      sessionFormat: computedDefaultSession as any,
      experience: "debutant",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.setValue("sessionFormat", computedDefaultSession as any, {
      shouldValidate: true,
    });
  }, [computedDefaultSession]);

  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.name || "").trim().split(/\s+/);
      const last = rest.join(" ");
      if (first) form.setValue("firstName", first, { shouldValidate: true });
      if (last) form.setValue("lastName", last, { shouldValidate: true });
      if (user.email)
        form.setValue("email", user.email, { shouldValidate: true });
      if (user.phone)
        form.setValue("phone", user.phone, { shouldValidate: true });
    }
  }, []);

  const steps = [
    { number: 1, title: "Informations personnelles", icon: Users },
    { number: 2, title: "Formation et préférences", icon: BookOpen },
    { number: 3, title: "Finalisation", icon: CheckCircle },
  ];

  const stepRequiredFields: Record<
    number,
    Array<keyof FormationRegistrationData>
  > = {
    1: ["firstName", "lastName", "email", "phone", "profession", "experience"],
    2: ["sessionFormat"],
    3: ["motivation"],
  };

  const goNext = async () => {
    const fields = stepRequiredFields[currentStep] || [];
    const ok = await form.trigger(fields as any, { shouldFocus: true });
    if (ok) setCurrentStep((s) => s + 1);
  };

  const goPrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const onSubmit = async (data: FormationRegistrationData) => {
    if (!selectedFormation) {
      toast({
        title: "Erreur",
        description: "Aucune formation sélectionnée.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);

      // (Optionnel) Si connecté et pas Client, on bloque (tu l’avais déjà)
      if (isAuthenticated()) {
        const hasClientRole = (user?.roles || []).some(
          (r) => r.toLowerCase() === "client"
        );
        if (!hasClientRole) {
          toast({
            title: "Accès refusé",
            description:
              "Seuls les utilisateurs avec le rôle Client peuvent s'inscrire.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
      }

      // Laisse le back trancher pour les doublons/capacité.
      const payload = {
        formation_id: selectedFormation.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        profession: data.profession,
        company: data.company || null,
        experience: data.experience,
        session_format: data.sessionFormat,
        motivation: data.motivation,
        specific_needs: data.specificNeeds || null,
        source: "website",
      };

      await createRegistration(payload);

      // Marque local : si pas d'user, utilise la clé email
      const key =
        isAuthenticated() && user
          ? `${user.id}|${user.email}`
          : `email:${data.email.toLowerCase()}`;
      markRegisteredLocal(selectedFormation.id, key);

      // const isQuote =
      //   /devis/i.test(selectedFormation.price) ||
      //   selectedFormation.priceNumber <= 0;

      // toast({
      //   title: isQuote ? "Demande enregistrée" : "Inscription enregistrée",
      //   description: isQuote
      //     ? "Votre demande a été prise en compte."
      //     : "Votre inscription a été enregistrée.",
      // });
      const isQuote = !shouldPayNow;

      if (isQuote) {
        toast({
          title: "Demande enregistrée",
          description: "Votre demande a été prise en compte.",
        });
        onBack();
        return;
      }

      try {
        const customer = isAuthenticated()
          ? undefined
          : {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
            };

        const res = await initPayment({
          type: "formation",
          id: selectedFormation.id,
          customer,
        });

        autoPost(
          res.action,
          res.fields,
          (res.method as "GET" | "POST") || "GET"
        );
        return; // navigation vers PaiementPro
      } catch (e: any) {
        toast({
          title: "Paiement indisponible",
          description:
            e?.payload?.message ||
            e?.payload?.error ||
            e?.message ||
            "Impossible d'initier le paiement.",
          variant: "destructive",
        });
        // l’inscription est déjà enregistrée ; on reste sur la page pour réessayer
      }

      onBack();
    } catch (e: any) {
      const status = e?.response?.status;
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Une erreur est survenue lors de l'enregistrement.";

      if (status === 409) {
        // Doublon
        toast({
          title: "Déjà inscrit",
          description:
            "Vous êtes déjà inscrit à cette formation. Une seule inscription est autorisée.",
          variant: "destructive",
        });
      } else if (status === 422) {
        toast({
          title: "Inscription impossible",
          description: /capacit|complet|place/i.test(message)
            ? "Nombre de places atteint."
            : message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBlock = selectedFormation ? (
    <Card className="mb-8 border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-red-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              {selectedFormation.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {selectedFormation.level} • {selectedFormation.duration}
            </CardDescription>
            <div className="flex items-center text-sm text-gray-700 mt-2">
              <Calendar className="h-4 w-4 mr-2 text-red-900" />
              {selectedFormation.date
                ? new Date(selectedFormation.date).toLocaleDateString()
                : "Date à venir"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-900">
              {selectedFormation.price}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{selectedFormation.level}</Badge>
              <Badge variant="outline">{selectedFormation.duration}</Badge>
            </div>
            <div className="mt-2">
              <Badge className="bg-red-100 text-red-900">
                {selectedFormation.type || "—"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  ) : null;

  if (showPayment && selectedFormation && formData) {
    const formationType = {
      id: String(selectedFormation.id),
      name: selectedFormation.title,
      price: selectedFormation.priceNumber,
      description: "",
    };
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => setShowPayment(false)}
          className="mb-6"
        >
          ← Retour au formulaire
        </Button>
        <PaymentForm
          contractType={formationType}
          onPaymentSuccess={() => onBack()}
          contractData={formData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Retour aux formations
      </Button>

      {selectedBlock}

      <div className="flex items-center justify-center mb-8">
        {[
          { number: 1, title: "Informations personnelles", icon: Users },
          { number: 2, title: "Formation et préférences", icon: BookOpen },
          { number: 3, title: "Finalisation", icon: CheckCircle },
        ].map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? "bg-red-900 border-red-900 text-white"
                  : "bg-white border-gray-300 text-gray-500"
              }`}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <div className="ml-3 hidden sm:block">
              <p
                className={`text-sm font-medium ${
                  currentStep >= step.number ? "text-red-900" : "text-gray-500"
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < 2 && (
              <div
                className={`w-8 h-0.5 mx-4 ${
                  currentStep > step.number ? "bg-red-900" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscription à la formation</CardTitle>
          <CardDescription>
            Remplissez le formulaire pour vous inscrire à cette formation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+225 XX XX XX XX XX"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entreprise (optionnel)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau d'expérience *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="debutant">Débutant</SelectItem>
                            <SelectItem value="intermediaire">
                              Intermédiaire
                            </SelectItem>
                            <SelectItem value="avance">Avancé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Formation et préférences
                  </h3>
                  {!isHybrid && (
                    <div className="flex items-center gap-2">
                      <FormLabel>Format de session</FormLabel>
                      <Badge variant="secondary">
                        {form.watch("sessionFormat") === "presentiel"
                          ? "Présentiel"
                          : "En ligne"}
                      </Badge>
                    </div>
                  )}
                  {isHybrid && (
                    <FormField
                      control={form.control}
                      name="sessionFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Format de session préféré *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="presentiel">
                                Présentiel
                              </SelectItem>
                              <SelectItem value="distanciel">
                                En ligne
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Finalisation de l'inscription
                  </h3>
                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivation et objectifs *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Expliquez pourquoi cette formation vous intéresse et quels sont vos objectifs..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specificNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Besoins spécifiques (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Besoins particuliers, questions spécifiques à aborder"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Separator />
              <div className="flex justify-between">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={goPrev}>
                    Précédent
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="ml-auto bg-red-900 hover:bg-red-800"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="ml-auto bg-red-900 hover:bg-red-800"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Finaliser l'inscription
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormationRegistrationForm;
