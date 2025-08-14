
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const paymentSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  phone: z.string().min(1, "Téléphone requis"),
  paymentMethod: z.enum(["orange_money", "mtn_money", "wave", "bank_card"]),
  // Orange Money / MTN Money
  mobileNumber: z.string().optional(),
  // Bank Card
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  contractType: {
    id: string;
    name: string;
    price: number;
    description: string;
  } | undefined;
  onPaymentSuccess: (data: any) => void;
  contractData: any;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ contractType, onPaymentSuccess, contractData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "orange_money",
    },
  });

  const selectedPaymentMethod = form.watch("paymentMethod");

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      // Simulation du traitement du paiement
      console.log("Données de paiement:", data);
      console.log("Type de contrat:", contractType);
      console.log("Données du contrat:", contractData);
      
      // Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Paiement effectué avec succès !",
        description: "Votre commande de rédaction de contrat a été confirmée.",
      });
      
      onPaymentSuccess(data);
      
    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!contractType) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Aucun type de contrat sélectionné</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Récapitulatif de la commande */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <CheckCircle className="h-5 w-5" />
            Récapitulatif de votre commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-red-800">{contractType.name}</h3>
                <p className="text-sm text-red-600">{contractType.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-900">
                  {contractType.price.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-red-600">TTC</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-2 text-sm text-red-700">
              <Clock className="h-4 w-4" />
              <span>Livraison prévue sous 2 à 5 jours ouvrés</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informations de paiement
          </CardTitle>
          <CardDescription>
            Sécurisez votre paiement pour finaliser votre commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h4 className="font-semibold">Informations de facturation</h4>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="votre@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
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
                        <FormLabel>Nom</FormLabel>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+225 XX XX XX XX XX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Méthode de paiement */}
              <div className="space-y-4">
                <h4 className="font-semibold">Méthode de paiement</h4>
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choisissez votre méthode de paiement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="orange_money">Orange Money</SelectItem>
                          <SelectItem value="mtn_money">MTN Mobile Money</SelectItem>
                          <SelectItem value="wave">Wave</SelectItem>
                          <SelectItem value="bank_card">Carte bancaire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Champs spécifiques selon la méthode de paiement */}
                {(selectedPaymentMethod === "orange_money" || selectedPaymentMethod === "mtn_money" || selectedPaymentMethod === "wave") && (
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Numéro {selectedPaymentMethod === "orange_money" ? "Orange Money" : 
                                   selectedPaymentMethod === "mtn_money" ? "MTN Money" : "Wave"}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+225 XX XX XX XX XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedPaymentMethod === "bank_card" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cardholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom sur la carte</FormLabel>
                          <FormControl>
                            <Input placeholder="JEAN DUPONT" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de carte</FormLabel>
                          <FormControl>
                            <Input placeholder="1234 5678 9012 3456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d'expiration</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/AA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sécurité */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Paiement 100% sécurisé</p>
                  <p className="text-green-600">Vos données sont protégées par cryptage SSL</p>
                </div>
              </div>

              {/* Bouton de paiement */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-red-900 hover:bg-red-800 text-lg py-6"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Traitement en cours...
                  </div>
                ) : (
                  `Payer ${contractType.price.toLocaleString()} FCFA`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentForm;
