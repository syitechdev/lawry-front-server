import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  FileText, 
  Users, 
  Building, 
  GraduationCap, 
  Scale, 
  Shield, 
  PenTool,
  BookOpen,
  Bot,
  ChevronRight,
  Send,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Zap,
  Clock,
  Star,
  Mail,
  Phone,
  MapPin,
  Bell,
  QrCode,
  Smartphone
} from "lucide-react";
import Header from "@/components/Header";
import ContractForm from "@/components/ContractForm";
import LegalLearningModal from "@/components/LegalLearningModal";
import CompanyDossierGenerator from "@/components/CompanyDossierGenerator";
import FormationQuoteRequest from "@/components/FormationQuoteRequest";
import ContractPreview from "@/components/ContractPreview";
import { useToast } from "@/hooks/use-toast";

const ChatBot = () => {
  const [activeSection, setActiveSection] = useState('');
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [showContractForm, setShowContractForm] = useState(false);
  const [selectedContractType, setSelectedContractType] = useState(null);
  const [showCompanyGenerator, setShowCompanyGenerator] = useState(false);
  const [selectedCompanyType, setSelectedCompanyType] = useState(null);
  const { toast } = useToast();
  const [showFormationQuote, setShowFormationQuote] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<any>(null);

  const legalKnowledge = [
    {
      category: "Droit des Sociétés",
      title: "Les différents types de sociétés en Côte d'Ivoire",
      content: "Explication des SARL, SAS, SCI, etc. Leurs avantages et inconvénients.",
      keywords: ["SARL", "SAS", "SCI", "Entreprise Individuelle", "Capital Social"]
    },
    {
      category: "Droit du Travail",
      title: "Le contrat de travail à durée indéterminée (CDI)",
      content: "Les clauses essentielles, la période d'essai, la rupture du contrat.",
      keywords: ["CDI", "Période d'essai", "Rupture", "Préavis", "Licenciement"]
    },
    {
      category: "Droit Commercial",
      title: "L'accord de confidentialité (NDA)",
      content: "Pourquoi signer un NDA ? Les informations protégées, la durée de l'accord.",
      keywords: ["NDA", "Confidentialité", "Informations sensibles", "Divulgation", "Sanctions"]
    },
    {
      category: "Droit Immobilier",
      title: "Le bail commercial",
      content: "Les obligations du bailleur et du locataire, le renouvellement du bail, le loyer.",
      keywords: ["Bail commercial", "Loyer", "Renouvellement", "Obligations", "Dépôt de garantie"]
    }
  ];

  const contractTypes = [
    {
      type: "travail-cdi",
      name: "Contrat de travail CDI",
      description: "Embauchez un salarié en CDI en toute conformité",
      usage: "Pour toute embauche à durée indéterminée"
    },
    {
      type: "nda",
      name: "Accord de confidentialité (NDA)",
      description: "Protégez vos informations sensibles avec un accord de confidentialité",
      usage: "Avant d'échanger des informations confidentielles"
    },
    {
      type: "bail-commercial",
      name: "Bail commercial",
      description: "Louez un local commercial en toute sécurité juridique",
      usage: "Pour la location d'un local commercial"
    },
    {
      type: "prestation-service",
      name: "Contrat de prestation de service",
      description: "Encadrez vos relations avec vos prestataires",
      usage: "Pour toute prestation de service ponctuelle ou régulière"
    }
  ];

  const companyTypes = [
    {
      type: "sarl",
      name: "SARL",
      description: "Société à Responsabilité Limitée"
    },
    {
      type: "sas",
      name: "SAS",
      description: "Société par Actions Simplifiée"
    },
    {
      type: "sci",
      name: "SCI",
      description: "Société Civile Immobilière"
    }
  ];

  const generateBotResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    // Réponses pour la création d'entreprise
    if (message.includes('sarl') || message.includes('créer une sarl')) {
      return "Pour créer une SARL en Côte d'Ivoire, vous devez : 1) Avoir un capital minimum de 1.000.000 FCFA, 2) Rédiger les statuts, 3) Faire un dépôt de capital dans une banque, 4) Publier un avis dans un journal d'annonces légales, 5) Déposer le dossier au CEPICI. Je peux vous générer le dossier complet gratuitement dans la section 'Création d'entreprise'.";
    }
    
    if (message.includes('sas') || message.includes('société par actions')) {
      return "La SAS (Société par Actions Simplifiée) offre plus de flexibilité que la SARL. Capital minimum : 1.000.000 FCFA. Elle permet une grande liberté dans l'organisation et la gouvernance. Idéale pour les startups et entreprises innovantes. Voulez-vous que je génère votre dossier de création ?";
    }
    
    if (message.includes('sci') || message.includes('société civile immobilière')) {
      return "La SCI est parfaite pour la gestion de biens immobiliers. Capital minimum : 100.000 FCFA. Elle permet de faciliter la transmission du patrimoine immobilier et d'optimiser la gestion locative. Je peux vous aider à créer votre SCI.";
    }
    
    // Réponses pour le droit du travail
    if (message.includes('contrat de travail') || message.includes('cdi') || message.includes('embauche')) {
      return "Un contrat de travail CDI doit contenir : l'identité des parties, la fonction du salarié, la rémunération, le lieu de travail, la durée de la période d'essai. La période d'essai maximum est de 6 mois pour les cadres, 3 mois pour les agents de maîtrise, 1 mois pour les ouvriers. Je peux générer votre contrat CDI personnalisé.";
    }
    
    if (message.includes('licenciement') || message.includes('rupture')) {
      return "Le licenciement doit être motivé (faute, insuffisance professionnelle, motif économique). Le préavis varie selon l'ancienneté : 1 mois (moins de 5 ans), 2 mois (plus de 5 ans). L'indemnité de licenciement est due sauf en cas de faute lourde.";
    }
    
    // Réponses pour le droit commercial  
    if (message.includes('nda') || message.includes('confidentialité')) {
      return "Un accord de confidentialité (NDA) protège vos informations sensibles. Il doit définir : les informations confidentielles, les obligations des parties, la durée de l'accord, les sanctions en cas de violation. Je peux générer votre NDA personnalisé.";
    }
    
    if (message.includes('bail commercial')) {
      return "Un bail commercial a une durée minimum de 9 ans. Le loyer peut être révisé tous les 3 ans selon l'indice des prix. Le locataire a un droit au renouvellement. Je peux rédiger votre bail commercial sur mesure.";
    }
    
    // Réponses sur les obligations d'employeur
    if (message.includes('obligations') && message.includes('employeur')) {
      return "Les principales obligations de l'employeur : payer le salaire, respecter la durée légale du travail (40h/semaine), assurer la sécurité, respecter les congés payés (2,5 jours par mois), déclarer les salariés à la CNPS, respecter le SMIG (60.000 FCFA).";
    }
    
    // Réponses générales
    if (message.includes('aide') || message.includes('bonjour') || message.includes('salut')) {
      return "Bonjour ! Je suis votre assistant juridique virtuel. Je peux vous aider avec : la création d'entreprise (SARL, SAS, SCI), la rédaction de contrats, le droit du travail, le droit commercial. Posez-moi votre question juridique !";
    }
    
    if (message.includes('prix') || message.includes('coût') || message.includes('tarif')) {
      return "Nos services : Création d'entreprise (dossier complet) : GRATUIT, Génération de contrats : 5.000 FCFA par contrat, Formation juridique : Sur devis, Consultation personnalisée : Contactez-nous au 07 09 12 20 74.";
    }
    
    // Réponse par défaut plus utile
    return "Je comprends votre question juridique. Pour vous donner une réponse précise, pourriez-vous me préciser votre domaine d'intérêt : création d'entreprise, droit du travail, contrats commerciaux, ou autre ? Vous pouvez aussi explorer nos sections spécialisées ci-dessus.";
  };

  const sendMessage = () => {
    if (inputValue.trim() !== '') {
      const userMessage = inputValue;
      setMessages([...messages, { text: userMessage, sender: "user" }]);
      setInputValue('');

      // Générer une réponse intelligente basée sur la question
      setTimeout(() => {
        const botResponse = generateBotResponse(userMessage);
        setMessages(prevMessages => [...prevMessages, { text: botResponse, sender: "bot" }]);
      }, 1000);
    }
  };

  const handleContractGeneration = (contractData: any) => {
    console.log('Génération du contrat:', contractData);
    setGeneratedContract(contractData);
    setShowContractPreview(true);
    setActiveSection('');
    
    toast({
      title: "Contrat généré !",
      description: "Votre contrat a été généré avec succès. Vous pouvez maintenant le prévisualiser et le modifier.",
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  if (showFormationQuote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <FormationQuoteRequest onBack={() => setShowFormationQuote(false)} />
      </div>
    );
  }

  if (showContractPreview && generatedContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <Header />
        <ContractPreview
          contractData={generatedContract}
          contractType={generatedContract.type}
          onBack={() => {
            setShowContractPreview(false);
            setGeneratedContract(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      {/* Hero Section - Amélioré pour mobile */}
      <section className="pt-20 pb-8 sm:pt-24 sm:pb-12 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Assistant Juridique Virtuel
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto text-red-100 px-2">
            Obtenez des réponses à vos questions juridiques, générez des documents et créez votre entreprise en toute simplicité
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Button 
              size="sm"
              className="bg-white text-red-900 hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
              onClick={() => setActiveSection('chat')}
            >
              <Bot className="mr-2 h-4 w-4" />
              Démarrer une conversation
            </Button>
            <Button 
              size="sm"
              variant="outline" 
              className="border-white hover:bg-white text-red-900 text-sm sm:text-base w-full sm:w-auto"
              onClick={() => setActiveSection('app-download')}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger l'application
            </Button>
          </div>
        </div>
      </section>

      {/* Menu principal - Amélioré pour mobile */}
      {!activeSection && (
        <section className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="hover:shadow-xl transition-all duration-300 group cursor-pointer border-blue-200 hover:border-blue-400" onClick={() => setActiveSection('chat')}>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="border-blue-200 text-blue-800 text-xs">IA</Badge>
                  </div>
                  <CardTitle className="text-blue-900 text-base sm:text-lg">Chat juridique</CardTitle>
                  <CardDescription className="text-sm">
                    Posez vos questions et obtenez des réponses instantanées
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />Conseils personnalisés</li>
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />Informations juridiques</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 group cursor-pointer border-green-200 hover:border-green-400" onClick={() => setActiveSection('creation-entreprise')}>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <Building className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="border-green-200 text-green-800 text-xs">Gratuit</Badge>
                  </div>
                  <CardTitle className="text-green-900 text-base sm:text-lg">Création d'entreprise</CardTitle>
                  <CardDescription className="text-sm">
                    Générez votre dossier de création d'entreprise en quelques clics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />SARL, SAS, SCI</li>
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />Dossier complet</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-xl transition-all duration-300 group cursor-pointer border-purple-200 hover:border-purple-400" onClick={() => setActiveSection('formation')}>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="border-purple-200 text-purple-800 text-xs">Nouveau</Badge>
                  </div>
                  <CardTitle className="text-purple-900 text-base sm:text-lg">Formation</CardTitle>
                  <CardDescription className="text-sm">
                    Formations juridiques interactives avec évaluation et certification
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-purple-600 flex-shrink-0" />Apprentissage interactif</li>
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-purple-600 flex-shrink-0" />Quiz de validation</li>
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-purple-600 flex-shrink-0" />Demande de devis formation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 group cursor-pointer border-red-200 hover:border-red-400" onClick={() => setActiveSection('contrats')}>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="border-red-200 text-red-800 text-xs">Payant</Badge>
                  </div>
                  <CardTitle className="text-red-900 text-base sm:text-lg">Génération de Contrats</CardTitle>
                  <CardDescription className="text-sm">
                    Créez vos contrats personnalisés en quelques minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-red-600 flex-shrink-0" />CDI, NDA, Bail commercial</li>
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-red-600 flex-shrink-0" />Aperçu et modification</li>
                    <li className="flex items-center"><ChevronRight className="h-3 w-3 mr-2 text-red-600 flex-shrink-0" />Téléchargement PDF/Word</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Section Chat - Améliorée pour mobile */}
      {activeSection === 'chat' && (
        <section className="py-8 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Chat juridique</h2>
              <Button variant="outline" onClick={() => setActiveSection('')} className="text-sm w-full sm:w-auto">
                ← Retour au menu
              </Button>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                        message.sender === 'user' 
                          ? 'bg-red-900 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Posez votre question juridique..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-sm sm:text-base"
              />
              <Button onClick={sendMessage} className="bg-red-900 hover:bg-red-800 text-sm sm:text-base w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">Suggestions de questions :</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Comment créer une SARL en Côte d'Ivoire ?",
                  "Quelles sont les obligations d'un employeur ?",
                  "Comment rédiger un contrat de bail commercial ?",
                  "Quelle est la différence entre SARL et SAS ?"
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto p-3 text-xs sm:text-sm text-blue-700 border-blue-200 hover:bg-blue-100 w-full"
                    onClick={() => {
                      setInputValue(suggestion);
                      sendMessage();
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Télécharger l'application - Améliorée pour mobile */}
      {activeSection === 'app-download' && (
        <section className="py-8 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Télécharger l'application LAWRY</h2>
              <Button variant="outline" onClick={() => setActiveSection('')} className="text-sm w-full sm:w-auto">
                ← Retour au menu
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Application Mobile */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center text-red-900 text-base sm:text-lg">
                      <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      Application Mobile LAWRY
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Accédez à tous vos services juridiques depuis votre smartphone
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm sm:text-base">Fonctionnalités disponibles :</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                        <li className="flex items-center"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Chat juridique 24/7</li>
                        <li className="flex items-center"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Génération de contrats</li>
                        <li className="flex items-center"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Création d'entreprise</li>
                        <li className="flex items-center"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Formations juridiques</li>
                        <li className="flex items-center"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Notifications push</li>
                        <li className="flex items-center"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Mode hors ligne</li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <Button className="bg-black text-white hover:bg-gray-800 text-sm w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger sur App Store
                      </Button>
                      <Button className="bg-green-600 text-white hover:bg-green-700 text-sm w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger sur Google Play
                      </Button>
                    </div>

                    {/* QR Code section - Améliorée pour mobile */}
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg text-center">
                      <h4 className="font-semibold mb-4 flex items-center justify-center text-sm sm:text-base">
                        <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Téléchargement rapide
                      </h4>
                      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
                        <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 flex items-center justify-center text-white text-xs text-center">
                            QR CODE
                            <br />
                            LAWRY APP
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 max-w-xs text-center">
                          <p className="font-medium mb-2">Scannez ce code QR avec votre téléphone</p>
                          <p>Ouvrez l'appareil photo de votre téléphone et pointez-le vers le code QR pour télécharger directement l'application.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Phone Mockup - Amélioré pour mobile */}
              <div className="lg:col-span-1">
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-center text-red-900 text-base sm:text-lg">Aperçu de l'application</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center p-4 sm:p-6">
                    <div className="relative">
                      {/* Phone frame */}
                      <div className="w-48 h-96 sm:w-64 sm:h-[500px] bg-black rounded-[2rem] sm:rounded-[3rem] p-1 sm:p-2 shadow-2xl">
                        <div className="w-full h-full bg-white rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden relative">
                          {/* Status bar */}
                          <div className="bg-red-900 text-white p-2 text-xs flex justify-between items-center">
                            <span>9:41</span>
                            <span>LAWRY</span>
                            <span>100%</span>
                          </div>
                          
                          {/* App content mockup */}
                          <div className="p-3 sm:p-4 h-full bg-gradient-to-br from-slate-50 to-red-50">
                            <div className="text-center mb-4 sm:mb-6">
                              <h3 className="text-sm sm:text-lg font-bold text-red-900 mb-1 sm:mb-2">Assistant Juridique</h3>
                              <p className="text-xs text-gray-600">Votre expert juridique de poche</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-blue-100">
                                <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 mb-1 sm:mb-2" />
                                <div className="text-xs font-medium">Chat</div>
                              </div>
                              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-green-100">
                                <Building className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 mb-1 sm:mb-2" />
                                <div className="text-xs font-medium">Entreprise</div>
                              </div>
                              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-purple-100">
                                <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 mb-1 sm:mb-2" />
                                <div className="text-xs font-medium">Formation</div>
                              </div>
                              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-red-100">
                                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 mb-1 sm:mb-2" />
                                <div className="text-xs font-medium">Contrats</div>
                              </div>
                            </div>
                            
                            <div className="bg-white p-2 sm:p-3 rounded-lg">
                              <div className="text-xs text-gray-500 mb-1">Assistant IA</div>
                              <div className="text-xs bg-gray-100 p-2 rounded">
                                Bonjour ! Comment puis-je vous aider avec vos questions juridiques aujourd'hui ?
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="mt-6 sm:mt-8 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">
                    Application en cours de développement
                  </h3>
                  <p className="text-sm sm:text-base text-yellow-700 mb-4">
                    Notre application mobile est actuellement en phase de développement. 
                    Inscrivez-vous pour être notifié dès sa sortie !
                  </p>
                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <Input 
                      placeholder="Votre adresse email" 
                      className="flex-1 text-sm"
                    />
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Me notifier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Section Création d'entreprise - Améliorée pour mobile */}
      {activeSection === 'creation-entreprise' && (
        <section className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Création d'entreprise</h2>
              <Button variant="outline" onClick={() => setActiveSection('')} className="text-sm w-full sm:w-auto">
                ← Retour au menu
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {companyTypes.map((company, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center text-green-900 text-base sm:text-lg">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {company.name}
                    </CardTitle>
                    <CardDescription className="text-sm">{company.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        Générez votre dossier de création d'entreprise gratuitement
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedCompanyType(company.type);
                          setShowCompanyGenerator(true);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-sm"
                      >
                        Générer le dossier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Formation - Améliorée pour mobile */}
      {activeSection === 'formation' && (
        <section className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Formation Juridique</h2>
              <Button variant="outline" onClick={() => setActiveSection('')} className="text-sm w-full sm:w-auto">
                ← Retour au menu
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center text-purple-900 text-base sm:text-lg">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Formation interactive
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Apprenez le droit des affaires avec nos modules interactifs
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {legalKnowledge.map((item, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto p-3 sm:p-4 text-left w-full"
                        onClick={() => {
                          setSelectedKnowledge(item);
                          setShowLearningModal(true);
                        }}
                      >
                        <div>
                          <div className="font-semibold text-sm">{item.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center text-green-900 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Formation sur mesure
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Demandez un devis pour une formation personnalisée pour votre équipe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="text-sm text-gray-600">
                    <p className="mb-3">Nos formations sur mesure incluent :</p>
                    <ul className="space-y-1">
                      <li className="flex items-center text-xs sm:text-sm"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Contenu adapté à votre secteur</li>
                      <li className="flex items-center text-xs sm:text-sm"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Formateurs experts</li>
                      <li className="flex items-center text-xs sm:text-sm"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Formats flexibles</li>
                      <li className="flex items-center text-xs sm:text-sm"><CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0" />Certification</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => setShowFormationQuote(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Demander un devis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Section Contrats - Améliorée pour mobile */}
      {activeSection === 'contrats' && (
        <section className="py-8 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Génération de Contrats</h2>
              <Button variant="outline" onClick={() => setActiveSection('')} className="text-sm w-full sm:w-auto">
                ← Retour au menu
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {contractTypes.map((contract, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-blue-200">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center text-blue-900 text-base sm:text-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      {contract.name}
                    </CardTitle>
                    <CardDescription className="text-sm">{contract.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <strong>Utilisation :</strong> {contract.usage}
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedContractType(contract.type);
                          setShowContractForm(true);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                      >
                        Créer ce contrat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section FAQ - Améliorée pour mobile */}
      {activeSection === 'faq' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">FAQ</h2>
              <Button variant="outline" onClick={() => setActiveSection('')}>
                ← Retour au menu
              </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
              <TabsList>
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="contrats">Contrats</TabsTrigger>
                <TabsTrigger value="entreprises">Entreprises</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Qu'est-ce que Lawry ?</div>
                  <p className="text-gray-600">Lawry est un assistant juridique virtuel qui vous aide à résoudre vos problèmes juridiques.</p>

                  <div className="text-lg font-semibold">Comment puis-je vous contacter ?</div>
                  <p className="text-gray-600">Vous pouvez nous contacter par email à contact@lawry.ci ou par téléphone au 07 09 12 20 74.</p>
                </div>
              </TabsContent>
              <TabsContent value="contrats">
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Comment générer un contrat ?</div>
                  <p className="text-gray-600">Sélectionnez le type de contrat souhaité, remplissez les informations demandées et générez votre contrat.</p>

                  <div className="text-lg font-semibold">Puis-je modifier un contrat généré ?</div>
                  <p className="text-gray-600">Oui, vous pouvez modifier le contrat généré avant de le télécharger.</p>
                </div>
              </TabsContent>
              <TabsContent value="entreprises">
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Comment créer mon entreprise ?</div>
                  <p className="text-gray-600">Sélectionnez le type d'entreprise que vous souhaitez créer et suivez les instructions.</p>

                  <div className="text-lg font-semibold">Quels sont les types d'entreprises disponibles ?</div>
                  <p className="text-gray-600">Nous proposons la création de SARL, SAS et SCI.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}

      {/* Modals et composants */}
      {showLearningModal && selectedKnowledge && (
        <LegalLearningModal
          knowledge={selectedKnowledge}
          isOpen={showLearningModal}
          onClose={() => {
            setShowLearningModal(false);
            setSelectedKnowledge(null);
          }}
        />
      )}

      {showContractForm && selectedContractType && (
        <Dialog open={showContractForm} onOpenChange={setShowContractForm}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Génération de contrat</DialogTitle>
              <DialogDescription>
                Remplissez les informations nécessaires pour générer votre contrat personnalisé
              </DialogDescription>
            </DialogHeader>
            <ContractForm
              contractType={selectedContractType}
              onGenerate={handleContractGeneration}
            />
          </DialogContent>
        </Dialog>
      )}

      {showCompanyGenerator && selectedCompanyType && (
        <CompanyDossierGenerator
          companyType={selectedCompanyType}
          onClose={() => {
            setShowCompanyGenerator(false);
            setSelectedCompanyType(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatBot;
