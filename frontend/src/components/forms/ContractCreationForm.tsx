import React, { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight,
  Users,
  FileCheck,
  Scale,
  Shield,
  Clock,
  Gavel,
  Eye,
  Send,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from "./PaymentForm";

const contractTypes = [
  {
    id: "commercial",
    name: "Contrat commercial",
    price: 25000,
    description: "Contrat de vente, fourniture, prestation",
  },
  {
    id: "employment",
    name: "Contrat de travail",
    price: 15000,
    description: "CDI, CDD, contrat de stage",
  },
  {
    id: "partnership",
    name: "Contrat de partenariat",
    price: 30000,
    description: "Joint-venture, collaboration",
  },
  {
    id: "service",
    name: "Contrat de service",
    price: 20000,
    description: "Prestation de services, consulting",
  },
  {
    id: "rental",
    name: "Contrat de bail",
    price: 18000,
    description: "Location immobilière ou mobilière",
  },
  {
    id: "confidentiality",
    name: "Accord de confidentialité",
    price: 12000,
    description: "NDA, clause de non-divulgation",
  },
  {
    id: "custom",
    name: "Contrat personnalisé",
    price: 35000,
    description: "Contrat sur mesure selon vos besoins",
  },
];

const contractSchema = z.object({
  // Type de contrat
  contractType: z.string().min(1, "Type de contrat requis"),

  // Partie 1
  party1Type: z.enum(["physical", "legal"]),
  party1Name: z.string().min(1, "Nom requis"),
  party1Address: z.string().min(1, "Adresse requise"),
  party1Id: z.string().min(1, "Numéro d'identification requis"),
  party1Representative: z.string().optional(),
  party1Phone: z.string().min(1, "Téléphone requis"),
  party1Email: z.string().email("Email invalide"),

  // Partie 2
  party2Type: z.enum(["physical", "legal"]),
  party2Name: z.string().min(1, "Nom requis"),
  party2Address: z.string().min(1, "Adresse requise"),
  party2Id: z.string().min(1, "Numéro d'identification requis"),
  party2Representative: z.string().optional(),
  party2Phone: z.string().min(1, "Téléphone requis"),
  party2Email: z.string().email("Email invalide"),

  // Objet du contrat
  contractObject: z.string().min(1, "Objet du contrat requis"),

  // Obligations
  party1Obligations: z.string().min(1, "Obligations de la partie 1 requises"),
  party2Obligations: z.string().min(1, "Obligations de la partie 2 requises"),

  // Conditions financières
  amount: z.string().min(1, "Montant requis"),
  paymentTerms: z.string().min(1, "Modalités de paiement requises"),
  latePenalties: z.string().optional(),

  // Durée
  startDate: z.string().min(1, "Date de début requise"),
  duration: z.string().min(1, "Durée requise"),
  terminationConditions: z.string().optional(),

  // Confidentialité
  isConfidential: z.boolean(),
  confidentialityClause: z.string().optional(),
  ipTransfer: z.boolean(),
  ipTerms: z.string().optional(),

  // Garanties
  warranties: z.string().optional(),
  liabilityLimitation: z.string().optional(),

  // Droit applicable
  applicableLaw: z.string().min(1, "Droit applicable requis"),
  disputeResolution: z.array(z.string()).min(1, "Mode de règlement requis"),
});

type ContractFormData = z.infer<typeof contractSchema>;

const ContractCreationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      party1Type: "physical",
      party2Type: "physical",
      isConfidential: false,
      ipTransfer: false,
      disputeResolution: [],
    },
  });

  const steps = [
    { number: 1, title: "Type de contrat", icon: FileText },
    { number: 2, title: "Identification des parties", icon: Users },
    { number: 3, title: "Objet et obligations", icon: FileText },
    { number: 4, title: "Conditions financières", icon: Scale },
    { number: 5, title: "Durée et résiliation", icon: Clock },
    { number: 6, title: "Clauses spéciales", icon: Shield },
    { number: 7, title: "Droit applicable", icon: Gavel },
    { number: 8, title: "Documents joints", icon: Upload },
    { number: 9, title: "Prévisualisation", icon: Eye },
    { number: 10, title: "Paiement", icon: CreditCard },
  ];

  const selectedContractType = contractTypes.find(
    (type) => type.id === form.watch("contractType")
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ContractFormData) => {
    if (currentStep === 9) {
      // Go to payment step
      setCurrentStep(10);
      return;
    }

    setIsSubmitting(true);
    console.log("Données du contrat:", data);
    console.log("Fichiers joints:", uploadedFiles);
    console.log("Type de contrat sélectionné:", selectedContractType);

    try {
      // Simulation d'envoi
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Demande de rédaction de contrat envoyée avec succès",
        description:
          "Nos juristes examineront votre demande et vous contacteront sous 24h pour débuter la rédaction de votre contrat personnalisé.",
      });

      // Reset du formulaire
      form.reset();
      setUploadedFiles([]);
      setCurrentStep(1);
      setShowPayment(false);
    } catch (error) {
      toast({
        title: "Erreur lors de l'envoi",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreview = () => {
    const data = form.getValues();

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Aperçu du contrat à rédiger
            </CardTitle>
            <CardDescription>
              Vérifiez toutes les informations avant de procéder au paiement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type de contrat et tarif */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-lg text-red-900 mb-3">
                Type de contrat sélectionné
              </h4>
              {selectedContractType && (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-red-800">
                        {selectedContractType.name}
                      </p>
                      <p className="text-sm text-red-600">
                        {selectedContractType.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-900">
                        {selectedContractType.price.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-red-900">Partie 1</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Type:</strong>{" "}
                    {data.party1Type === "physical"
                      ? "Personne physique"
                      : "Personne morale"}
                  </p>
                  <p>
                    <strong>Nom:</strong> {data.party1Name || "Non renseigné"}
                  </p>
                  <p>
                    <strong>Adresse:</strong>{" "}
                    {data.party1Address || "Non renseigné"}
                  </p>
                  <p>
                    <strong>ID:</strong> {data.party1Id || "Non renseigné"}
                  </p>
                  {data.party1Representative && (
                    <p>
                      <strong>Représentant:</strong> {data.party1Representative}
                    </p>
                  )}
                  <p>
                    <strong>Téléphone:</strong>{" "}
                    {data.party1Phone || "Non renseigné"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {data.party1Email || "Non renseigné"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-red-900">Partie 2</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Type:</strong>{" "}
                    {data.party2Type === "physical"
                      ? "Personne physique"
                      : "Personne morale"}
                  </p>
                  <p>
                    <strong>Nom:</strong> {data.party2Name || "Non renseigné"}
                  </p>
                  <p>
                    <strong>Adresse:</strong>{" "}
                    {data.party2Address || "Non renseigné"}
                  </p>
                  <p>
                    <strong>ID:</strong> {data.party2Id || "Non renseigné"}
                  </p>
                  {data.party2Representative && (
                    <p>
                      <strong>Représentant:</strong> {data.party2Representative}
                    </p>
                  )}
                  <p>
                    <strong>Téléphone:</strong>{" "}
                    {data.party2Phone || "Non renseigné"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {data.party2Email || "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            {/* Objet et obligations */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-red-900">
                Objet du contrat
              </h4>
              <p className="text-sm bg-gray-50 p-3 rounded">
                {data.contractObject || "Non renseigné"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Obligations Partie 1</h5>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {data.party1Obligations || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Obligations Partie 2</h5>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {data.party2Obligations || "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            {/* Conditions financières */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-red-900">
                Conditions financières
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Montant:</strong> {data.amount || "Non renseigné"}
                </p>
                <p>
                  <strong>Modalités de paiement:</strong>{" "}
                  {data.paymentTerms || "Non renseigné"}
                </p>
                {data.latePenalties && (
                  <p className="col-span-2">
                    <strong>Pénalités de retard:</strong> {data.latePenalties}
                  </p>
                )}
              </div>
            </div>

            {/* Durée */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-red-900">
                Durée et résiliation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Date de début:</strong>{" "}
                  {data.startDate || "Non renseigné"}
                </p>
                <p>
                  <strong>Durée:</strong> {data.duration || "Non renseigné"}
                </p>
                {data.terminationConditions && (
                  <p className="col-span-2">
                    <strong>Conditions de résiliation:</strong>{" "}
                    {data.terminationConditions}
                  </p>
                )}
              </div>
            </div>

            {/* Clauses spéciales */}
            {(data.isConfidential ||
              data.ipTransfer ||
              data.warranties ||
              data.liabilityLimitation) && (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-red-900">
                  Clauses spéciales
                </h4>
                <div className="space-y-2 text-sm">
                  {data.isConfidential && (
                    <div>
                      <p>
                        <strong>Confidentialité:</strong> Oui
                      </p>
                      {data.confidentialityClause && (
                        <p className="bg-gray-50 p-2 rounded mt-1">
                          {data.confidentialityClause}
                        </p>
                      )}
                    </div>
                  )}
                  {data.ipTransfer && (
                    <div>
                      <p>
                        <strong>Transfert PI:</strong> Oui
                      </p>
                      {data.ipTerms && (
                        <p className="bg-gray-50 p-2 rounded mt-1">
                          {data.ipTerms}
                        </p>
                      )}
                    </div>
                  )}
                  {data.warranties && (
                    <p>
                      <strong>Garanties:</strong> {data.warranties}
                    </p>
                  )}
                  {data.liabilityLimitation && (
                    <p>
                      <strong>Limitation responsabilité:</strong>{" "}
                      {data.liabilityLimitation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Droit applicable */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-red-900">
                Droit applicable
              </h4>
              <div className="text-sm space-y-2">
                <p>
                  <strong>Droit applicable:</strong>{" "}
                  {data.applicableLaw === "ivorian"
                    ? "Droit ivoirien"
                    : data.applicableLaw === "ohada"
                    ? "Droit OHADA"
                    : "Autre"}
                </p>
                <p>
                  <strong>Règlement des litiges:</strong>{" "}
                  {data.disputeResolution
                    .map((mode) => {
                      switch (mode) {
                        case "negotiation":
                          return "Négociation amiable";
                        case "mediation":
                          return "Médiation/Arbitrage";
                        case "jurisdiction":
                          return "Juridictions compétentes";
                        default:
                          return mode;
                      }
                    })
                    .join(", ") || "Non renseigné"}
                </p>
              </div>
            </div>

            {/* Documents */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-red-900">
                  Documents joints
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span className="text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <FileCheck className="h-5 w-5 text-red-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-900">
                  Prêt à procéder au paiement ?
                </h4>
                <p className="text-sm text-red-700">
                  Procédez au paiement pour finaliser votre commande. Nos
                  juristes examineront votre demande et vous contacteront sous
                  24h pour débuter la rédaction de votre contrat personnalisé.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sélectionnez le type de contrat</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contractTypes.map((type) => (
                        <Card
                          key={type.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            field.value === type.id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => field.onChange(type.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h3 className="font-semibold">{type.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {type.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-red-900">
                                  {type.price.toLocaleString()} FCFA
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Partie 1</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="party1Type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
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
                            <SelectItem value="physical">
                              Personne physique
                            </SelectItem>
                            <SelectItem value="legal">
                              Personne morale
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="party1Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom et Prénoms / Raison sociale</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="party1Address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="party1Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro d'identification</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="RCCM, NCC, CNI, Passeport..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("party1Type") === "legal" && (
                    <FormField
                      control={form.control}
                      name="party1Representative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Représentant légal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="party1Phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="party1Email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Partie 2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="party2Type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
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
                            <SelectItem value="physical">
                              Personne physique
                            </SelectItem>
                            <SelectItem value="legal">
                              Personne morale
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="party2Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom et Prénoms / Raison sociale</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="party2Address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="party2Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro d'identification</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="RCCM, NCC, CNI, Passeport..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("party2Type") === "legal" && (
                    <FormField
                      control={form.control}
                      name="party2Representative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Représentant légal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="party2Phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="party2Email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="contractObject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet du contrat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez clairement l'objet du contrat (ex: Fourniture de services de consulting, Vente de marchandises, Contrat de travail, etc.)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="party1Obligations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obligations de la Partie 1</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détaillez les obligations de la première partie"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="party2Obligations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obligations de la Partie 2</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détaillez les obligations de la deuxième partie"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant ou tarif</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 500 000 FCFA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modalités de paiement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: 30% à la signature, 70% à la livraison"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="latePenalties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pénalités de retard (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: 1% par jour de retard"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée du contrat</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 12 mois, indéterminée"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="terminationConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conditions de résiliation anticipée</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Préavis de 30 jours, non-respect des obligations"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isConfidential"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Les informations échangées sont confidentielles
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("isConfidential") && (
                <FormField
                  control={form.control}
                  name="confidentialityClause"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clauses de confidentialité</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="ipTransfer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Transfert de droits de propriété intellectuelle
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("ipTransfer") && (
                <FormField
                  control={form.control}
                  name="ipTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalités de transfert</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="warranties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garanties offertes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liabilityLimitation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limitation de responsabilité</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="applicableLaw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Droit applicable</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ivorian">Droit ivoirien</SelectItem>
                      <SelectItem value="ohada">Droit OHADA</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disputeResolution"
              render={() => (
                <FormItem>
                  <FormLabel>Modes de règlement des litiges</FormLabel>
                  <div className="space-y-3">
                    {[
                      { value: "negotiation", label: "Négociation amiable" },
                      { value: "mediation", label: "Médiation/Arbitrage" },
                      {
                        value: "jurisdiction",
                        label: "Juridictions compétentes",
                      },
                    ].map((item) => (
                      <FormField
                        key={item.value}
                        control={form.control}
                        name="disputeResolution"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        item.value,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.value
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Documents à joindre
                </CardTitle>
                <CardDescription>
                  Joignez tous les documents utiles à la rédaction du contrat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Cliquez pour sélectionner des fichiers ou
                        glissez-déposez
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, DOC, DOCX, JPG, PNG (max 10MB par fichier)
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Fichiers sélectionnés:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 9:
        return renderPreview();

      case 10:
        return (
          <PaymentForm
            contractType={selectedContractType}
            onPaymentSuccess={onSubmit}
            contractData={form.getValues()}
          />
        );

      default:
        return null;
    }
  };

  const CurrentStepIcon = steps[currentStep - 1].icon;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => {
            const StepIcon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    currentStep >= step.number
                      ? "bg-red-900 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs text-center max-w-20 ${
                    currentStep >= step.number
                      ? "text-red-900 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrentStepIcon className="h-5 w-5" />
                Étape {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : currentStep === 9 ? (
              <Button
                type="submit"
                className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
              >
                Procéder au paiement
                <CreditCard className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-900 hover:bg-red-800 flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Traitement en cours..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Finaliser la commande
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContractCreationForm;
