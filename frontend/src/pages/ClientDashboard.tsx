import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Download, MessageSquare, Star, Eye,
  Bell, ShoppingCart, CreditCard, User, Circle, Smartphone
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { Link, useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const navigate = useNavigate();
  
  // État pour gérer les notifications lues/non lues
  const [mesCommandes, setMesCommandes] = useState([
    { 
      id: "CMD001", 
      service: "Création SAS", 
      statut: "En cours", 
      progression: 75, 
      date: "2024-01-15",
      juriste: "Me Konan",
      prochainEtape: "Validation des statuts",
      lu: false,
      nouveauMessage: true
    },
    { 
      id: "CMD002", 
      service: "Contrat commercial", 
      statut: "En attente", 
      progression: 25, 
      date: "2024-01-12",
      juriste: "Me Diabate",
      prochainEtape: "Documents manquants",
      lu: true,
      nouveauMessage: false
    },
    { 
      id: "CMD003", 
      service: "Formation juridique", 
      statut: "Terminé", 
      progression: 100, 
      date: "2024-01-10",
      juriste: "Me Touré",
      prochainEtape: "Évaluation",
      lu: true,
      nouveauMessage: false
    }
  ]);

  const documentsDisponibles = [
    { nom: "Statuts_SAS_Brouillon.pdf", taille: "2.4 MB", date: "2024-01-15" },
    { nom: "Contrat_Commercial_V1.pdf", taille: "1.8 MB", date: "2024-01-12" },
    { nom: "Certificate_Formation.pdf", taille: "0.9 MB", date: "2024-01-10" }
  ];

  const notificationsNonLues = mesCommandes.filter(cmd => !cmd.lu || cmd.nouveauMessage).length;
  const demandesEnCours = mesCommandes.filter(cmd => cmd.statut !== "Terminé").length;

  const [notifications] = useState([
    { message: "Votre dossier SAS a été mis à jour", date: "Il y a 2h", type: "info", lu: false },
    { message: "Document prêt à télécharger", date: "Il y a 5h", type: "success", lu: false },
    { message: "Paiement en attente", date: "Hier", type: "warning", lu: true }
  ]);

  const getStatutBadge = (statut: string) => {
    const colors = {
      "En cours": "bg-blue-100 text-blue-800",
      "En attente": "bg-yellow-100 text-yellow-800",
      "Terminé": "bg-green-100 text-green-800",
      "Payé": "bg-green-100 text-green-800"
    };
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const ouvrirDemande = (commandeId: string) => {
    setMesCommandes(prev => 
      prev.map(cmd => 
        cmd.id === commandeId 
          ? { ...cmd, lu: true, nouveauMessage: false }
          : cmd
      )
    );
    navigate(`/client/demande/${commandeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="client" userName="Jean Kouassi" userEmail="jean@email.com" />
      
      <div className="lg:ml-80 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* En-tête du Dashboard Client */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl lg:rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mon Espace Client</h1>
                <p className="text-red-100 text-sm sm:text-base">Gérez vos demandes et suivez vos dossiers juridiques</p>
              </div>
              <div className="text-center lg:text-right space-y-2">
                <p className="text-lg sm:text-xl font-bold">Bienvenue Jean</p>
                <p className="text-red-200 text-sm">Client Premium</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
                  asChild
                >
                  <Link to="/chatbot?section=app-download">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Télécharger l'app
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes En Cours</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demandesEnCours}</div>
              <p className="text-xs text-blue-100">
                {mesCommandes.filter(cmd => cmd.statut === "En attente").length} en attente de documents
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Prêts</CardTitle>
              <Download className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentsDisponibles.length}</div>
              <p className="text-xs text-green-100">À télécharger</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <MessageSquare className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationsNonLues}</div>
              <p className="text-xs text-yellow-100">Non lues</p>
            </CardContent>
          </Card>
        </div>

        {/* Section principale avec deux colonnes */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 lg:mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Mes Demandes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mesCommandes.map((commande) => (
                <div 
                  key={commande.id} 
                  className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
                    !commande.lu || commande.nouveauMessage 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => ouvrirDemande(commande.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                      {(!commande.lu || commande.nouveauMessage) && (
                        <Circle className="h-2 w-2 text-red-500 fill-current mt-2 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{commande.service}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">ID: {commande.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0 ml-2">
                      <Badge className={`${getStatutBadge(commande.statut)} text-xs`}>
                        {commande.statut}
                      </Badge>
                      {commande.nouveauMessage && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span>Progression</span>
                      <span>{commande.progression}%</span>
                    </div>
                    <Progress value={commande.progression} className="h-2" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3 space-y-1">
                    <p>Juriste: {commande.juriste}</p>
                    <p className="truncate">Prochaine étape: {commande.prochainEtape}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={(e) => {
                      e.stopPropagation();
                      ouvrirDemande(commande.id);
                    }}>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Voir détails
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Notifications Récentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notif, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    !notif.lu ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {!notif.lu && <Circle className="h-2 w-2 text-red-500 fill-current" />}
                    <Bell className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.lu ? 'font-medium' : ''} break-words`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500">{notif.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Documents Disponibles */}
        <Card className="shadow-lg mb-6 lg:mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Documents Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentsDisponibles.map((doc, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{doc.nom}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{doc.taille} • {doc.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto flex-shrink-0">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides - avec bouton app mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <ShoppingCart className="h-6 sm:h-8 w-6 sm:w-8 text-red-700 mx-auto mb-3" />
              <h3 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Boutique</h3>
              <p className="text-xs sm:text-sm text-red-700 mb-4">Modèles et documents juridiques</p>
              <Button className="bg-red-900 hover:bg-red-800 w-full text-xs sm:text-sm" asChild>
                <Link to="/client/boutique">Parcourir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <CreditCard className="h-6 sm:h-8 w-6 sm:w-8 text-blue-700 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Paiements</h3>
              <p className="text-xs sm:text-sm text-blue-700 mb-4">Gérez vos factures</p>
              <Button variant="outline" className="border-blue-700 text-blue-700 w-full text-xs sm:text-sm" asChild>
                <Link to="/client/paiements">Voir</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-green-700 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Mon Profil</h3>
              <p className="text-xs sm:text-sm text-green-700 mb-4">Informations personnelles</p>
              <Button variant="outline" className="border-green-700 text-green-700 w-full text-xs sm:text-sm" asChild>
                <Link to="/client/profil">Modifier</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <Smartphone className="h-6 sm:h-8 w-6 sm:w-8 text-purple-700 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">App Mobile</h3>
              <p className="text-xs sm:text-sm text-purple-700 mb-4">Téléchargez l'application</p>
              <Button className="bg-purple-700 hover:bg-purple-800 w-full text-xs sm:text-sm" asChild>
                <Link to="/chatbot?section=app-download">Télécharger</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Section d'aide */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Besoin d'aide ?</h3>
            <p className="text-red-700 mb-4 text-sm sm:text-base">Notre équipe est là pour vous accompagner dans vos démarches juridiques</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button className="bg-red-900 hover:bg-red-800 w-full sm:w-auto text-xs sm:text-sm" asChild>
                <Link to="/chatbot">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Lawry AI
                </Link>
              </Button>
              <Button variant="outline" className="border-red-900 text-red-900 hover:bg-red-50 w-full sm:w-auto text-xs sm:text-sm" asChild>
                <Link to="/contact">
                  Contacter un conseiller
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
