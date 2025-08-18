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
import { BookOpen, Users, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formations as formationsSvc } from "@/services/formations";
//import { auth } from "@/services/auth";
import { registrations } from "@/services/registrations";

const formationRegistrationSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Téléphone requis"),
  profession: z.string().min(1, "Profession requise"),
  company: z.string().optional().nullable(),
  experience: z.enum(["debutant", "intermediaire", "avance"]),
  selectedFormations: z
    .array(z.number())
    .min(1, "Choisissez au moins une formation"),
  motivation: z.string().min(10, "Motivation requise (minimum 10 caractères)"),
  specificNeeds: z.string().optional().nullable(),
  sessionFormat: z.enum(["presentiel", "distanciel", "mixte"]),
  preferredDates: z.string().optional().nullable(),
});

type FormationRegistrationData = z.infer<typeof formationRegistrationSchema>;

interface FormationRegistrationFormProps {
  selectedFormation?: {
    title: string;
    price: string;
    duration: string;
    level: string;
  } | null;
  onBack: () => void;
}

type ApiFormation = {
  id: number;
  title: string;
  description?: string | null;
  duration?: string | null;
  price_cfa?: number | null;
  price_type?: "fixed" | "quote" | null;
  level?: string | null;
  active: boolean;
};

function priceLabel(f: ApiFormation) {
  if (f.price_type === "quote" || !f.price_cfa) return "Sur devis";
  return `${Number(f.price_cfa).toLocaleString()} FCFA`;
}

const FormationRegistrationForm: React.FC<FormationRegistrationFormProps> = ({
  selectedFormation,
  onBack,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [me, setMe] = useState<null | { id: number }>(null);
  const [catalog, setCatalog] = useState<ApiFormation[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const form = useForm<FormationRegistrationData>({
    resolver: zodResolver(formationRegistrationSchema),
    defaultValues: {
      selectedFormations: [],
      sessionFormat: "presentiel",
      experience: "debutant",
    },
  });

  useEffect(() => {
    const boot = async () => {
      try {
        const m = await auth.me();
        if (m) {
          setMe({ id: m.id });
          form.reset({
            ...form.getValues(),
            firstName: m.first_name ?? "",
            lastName: m.last_name ?? "",
            email: m.email ?? "",
            phone: m.phone ?? "",
            profession: m.profession ?? "",
            company: m.company ?? "",
          });
        }
      } catch {}
      try {
        setLoadingCatalog(true);
        const res = await formationsSvc.listPublic({
          page: 1,
          itemsPerPage: 100,
          active: 1,
          order: { date: "desc" },
        });
        const items: ApiFormation[] = (res?.data ?? []).filter(
          (f: ApiFormation) => !!f.active
        );
        items.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        setCatalog(items);
        if (selectedFormation?.title) {
          const match = items.find((f) => f.title === selectedFormation.title);
          if (match) {
            form.setValue("selectedFormations", [match.id], {
              shouldValidate: true,
            });
          }
        }
      } finally {
        setLoadingCatalog(false);
      }
    };
    boot();
  }, []);

  const totalPayable = useMemo(() => {
    const ids = form.watch("selectedFormations");
    const picked = catalog.filter((f) => ids.includes(f.id));
    return picked.reduce((acc, f) => {
      if (f.price_type === "fixed" && f.price_cfa && f.price_cfa > 0)
        return acc + f.price_cfa;
      return acc;
    }, 0);
  }, [catalog, form.watch("selectedFormations")]);

  const steps = [
    { number: 1, title: "Informations personnelles", icon: Users },
    { number: 2, title: "Formation et préférences", icon: BookOpen },
    { number: 3, title: "Finalisation", icon: CheckCircle },
  ];

  const onSubmit = async (data: FormationRegistrationData) => {
    try {
      const ids = data.selectedFormations;
      if (!ids.length) {
        toast({
          title: "Formation manquante",
          description: "Choisissez au moins une formation.",
          variant: "destructive",
        });
        return;
      }
      const payload = {
        user_id: me?.id,
        guest: me
          ? undefined
          : {
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              phone: data.phone,
              profession: data.profession,
              company: data.company ?? null,
            },
        formations: ids,
        preferences: {
          session_format: data.sessionFormat,
          preferred_dates: data.preferredDates ?? null,
          motivation: data.motivation,
          specific_needs: data.specificNeeds ?? null,
        },
        total_price: totalPayable,
        payment_required: totalPayable > 0,
      };
      await registrations.create(payload);
      toast({
        title: "Demande enregistrée",
        description:
          totalPayable > 0
            ? "Votre inscription est enregistrée. Le paiement sera finalisé plus tard."
            : "Votre inscription est confirmée.",
      });
      onBack();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description:
          e?.response?.data?.message ||
          "Impossible d'enregistrer l'inscription.",
        variant: "destructive",
      });
    }
  };

  const selectedFormationData = useMemo(() => {
    if (!selectedFormation?.title) return null;
    const f = catalog.find((x) => x.title === selectedFormation.title);
    if (!f) return null;
    return {
      title: f.title,
      price: priceLabel(f),
      duration: f.duration ?? "—",
      level: f.level ?? "—",
      description: f.description ?? "",
    };
  }, [catalog, selectedFormation?.title]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Retour aux formations
      </Button>

      {selectedFormationData && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-red-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {selectedFormationData.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {selectedFormationData.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-900">
                  {selectedFormationData.price}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    {selectedFormationData.level}
                  </Badge>
                  <Badge variant="outline">
                    {selectedFormationData.duration}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
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
            {index < steps.length - 1 && (
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
            Remplissez le formulaire pour vous inscrire
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

                  <FormField
                    control={form.control}
                    name="selectedFormations"
                    render={() => (
                      <FormItem>
                        <FormLabel>Choisissez vos formations *</FormLabel>
                        <div className="space-y-2">
                          {loadingCatalog ? (
                            <div className="text-sm text-gray-500">
                              Chargement…
                            </div>
                          ) : catalog.length === 0 ? (
                            <div className="text-sm text-gray-500">
                              Aucune formation disponible
                            </div>
                          ) : (
                            catalog.map((f) => {
                              const checked = form
                                .watch("selectedFormations")
                                .includes(f.id);
                              return (
                                <label
                                  key={f.id}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const cur =
                                          form.getValues("selectedFormations");
                                        const next = e.target.checked
                                          ? [...cur, f.id]
                                          : cur.filter((x) => x !== f.id);
                                        form.setValue(
                                          "selectedFormations",
                                          next,
                                          { shouldValidate: true }
                                        );
                                      }}
                                    />
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {f.title}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {f.level ?? "—"} • {f.duration ?? "—"}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    {priceLabel(f)}
                                  </Badge>
                                </label>
                              );
                            })
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              Distanciel
                            </SelectItem>
                            <SelectItem value="mixte">Mixte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dates préférées (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Semaine du 15 janvier, ou tous les mercredis"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Finalisation de l'inscription
                  </h3>

                  <div className="rounded-lg border p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        Total à régler
                      </div>
                      <div className="text-lg font-semibold">
                        {totalPayable > 0
                          ? `${totalPayable.toLocaleString()} FCFA`
                          : "—"}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Si le montant est supérieur à 0, votre inscription est
                      enregistrée et le paiement sera finalisé plus tard.
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivation et objectifs *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Expliquez pourquoi cette formation vous intéresse et vos objectifs…"
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
                            placeholder="Avez-vous des besoins particuliers, des questions spécifiques ?"
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Précédent
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="ml-auto bg-red-900 hover:bg-red-800"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
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
