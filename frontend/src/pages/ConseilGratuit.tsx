
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Phone, Mail, Clock, CheckCircle, Scale, Users, FileText } from "lucide-react";
import Header from "@/components/Header";

const ConseilGratuit = () => {
  const benefits = [
    {
      icon: MessageSquare,
      title: "Consultation gratuite",
      description: "Premier échange sans engagement"
    },
    {
      icon: Clock,
      title: "Réponse rapide",
      description: "Sous 24h maximum"
    },
    {
      icon: Scale,
      title: "Expertise reconnue",
      description: "Juristes expérimentés"
    },
    {
      icon: Users,
      title: "Accompagnement personnalisé",
      description: "Conseils adaptés à votre situation"
    }
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
    "Autre"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Conseil Juridique Gratuit
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Obtenez un premier conseil juridique gratuit de nos experts pour éclairer vos décisions
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
            <p className="text-lg font-semibold">
              ✓ Sans engagement • ✓ Confidentiel • ✓ Réponse sous 24h
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre conseil gratuit ?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-red-900" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Décrivez votre situation
            </h2>
            <p className="text-lg text-gray-600">
              Remplissez le formulaire ci-dessous pour recevoir votre conseil gratuit
            </p>
          </div>
          
          <Card className="p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input id="prenom" placeholder="Votre prénom" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" placeholder="Votre nom" className="mt-1" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" placeholder="+225 XX XX XX XX" className="mt-1" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="domaine">Domaine juridique *</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionnez un domaine" />
                  </SelectTrigger>
                  <SelectContent>
                    {domaines.map((domaine, index) => (
                      <SelectItem key={index} value={domaine.toLowerCase().replace(/\s+/g, '-')}>
                        {domaine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="situation">Décrivez votre situation *</Label>
                <Textarea 
                  id="situation" 
                  placeholder="Expliquez-nous votre problématique juridique en détail..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
              
              <div>
                <Label htmlFor="urgence">Niveau d'urgence</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionnez le niveau d'urgence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faible">Faible - Pas d'urgence particulière</SelectItem>
                    <SelectItem value="moyen">Moyen - Réponse souhaitée rapidement</SelectItem>
                    <SelectItem value="eleve">Élevé - Situation urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-start space-x-2">
                <input type="checkbox" id="consent" className="mt-1" />
                <Label htmlFor="consent" className="text-sm text-gray-600">
                  J'accepte que mes données soient utilisées pour me recontacter dans le cadre de ma demande de conseil juridique *
                </Label>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-red-900 hover:bg-red-800 text-white"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Envoyer ma demande
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça fonctionne ?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Remplissez le formulaire</h3>
              <p className="text-gray-600 text-sm">Décrivez votre situation juridique</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analyse par nos experts</h3>
              <p className="text-gray-600 text-sm">Nos juristes étudient votre demande</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Conseil personnalisé</h3>
              <p className="text-gray-600 text-sm">Recevez votre conseil par email</p>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-900 font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Accompagnement suite</h3>
              <p className="text-gray-600 text-sm">Possibilité de services complémentaires</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Besoin d'une réponse immédiate ?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Contactez-nous directement par téléphone ou email
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
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
};

export default ConseilGratuit;
