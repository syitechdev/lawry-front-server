
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Download, MessageSquare, FileText, 
  Clock, CheckCircle, AlertCircle, Upload
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast } from "sonner";

const ClientDemandeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  
  // Données simulées - en réalité viendrait d'une API
  const [demande, setDemande] = useState({
    id: "CMD001",
    service: "Création SAS",
    statut: "En cours",
    progression: 75,
    date: "2024-01-15",
    juriste: "Me Konan",
    prochainEtape: "Validation des statuts",
    description: "Création d'une SAS pour une entreprise technologique avec capital de 50 000 FCFA",
    lu: false,
    historique: [
      { date: "2024-01-15", action: "Demande créée", statut: "Reçu", auteur: "Client" },
      { date: "2024-01-16", action: "Dossier assigné", statut: "En cours", auteur: "Me Konan" },
      { date: "2024-01-18", action: "Documents reçus", statut: "En cours", auteur: "Me Konan" },
      { date: "2024-01-20", action: "Statuts rédigés", statut: "En cours", auteur: "Me Konan" }
    ],
    documents: [
      { nom: "Statuts_SAS_V1.pdf", taille: "2.1 MB", date: "2024-01-18", type: "reçu" },
      { nom: "Statuts_SAS_V2.pdf", taille: "2.4 MB", date: "2024-01-20", type: "envoyé" }
    ],
    messages: [
      { date: "2024-01-16", auteur: "Me Konan", message: "Bonjour, j'ai bien reçu votre demande. Pouvez-vous me fournir une copie de votre pièce d'identité ?" },
      { date: "2024-01-17", auteur: "Client", message: "Bonjour, voici les documents demandés." },
      { date: "2024-01-20", auteur: "Me Konan", message: "Merci. J'ai préparé une première version des statuts. Merci de les vérifier." }
    ]
  });

  useEffect(() => {
    // Marquer comme lu
    if (!demande.lu) {
      setDemande(prev => ({ ...prev, lu: true }));
      // Ici on appellerait l'API pour marquer comme lu
    }
  }, [demande.lu]);

  const getStatutBadge = (statut: string) => {
    const colors = {
      "Reçu": "bg-gray-100 text-gray-800",
      "En cours": "bg-blue-100 text-blue-800",
      "En attente": "bg-yellow-100 text-yellow-800",
      "Terminé": "bg-green-100 text-green-800"
    };
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const envoyerMessage = () => {
    if (!message.trim()) return;
    
    const nouveauMessage = {
      date: new Date().toISOString().split('T')[0],
      auteur: "Client",
      message: message
    };
    
    setDemande(prev => ({
      ...prev,
      messages: [...prev.messages, nouveauMessage]
    }));
    
    setMessage("");
    toast.success("Message envoyé");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="client" userName="Jean Kouassi" userEmail="jean@email.com" />
      
      <div className="ml-80 px-8 py-8">
        {/* En-tête avec retour */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/client")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
          
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{demande.service}</h1>
                <p className="text-red-100">ID: {demande.id} • Juriste: {demande.juriste}</p>
              </div>
              <Badge className={getStatutBadge(demande.statut)}>
                {demande.statut}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Détails de la demande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p>{demande.description}</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progression</span>
                    <span>{demande.progression}%</span>
                  </div>
                  <Progress value={demande.progression} className="h-3" />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Prochaine étape</p>
                  <p className="font-medium">{demande.prochainEtape}</p>
                </div>
              </CardContent>
            </Card>

            {/* Historique */}
            <Card>
              <CardHeader>
                <CardTitle>Historique du dossier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demande.historique.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{item.action}</p>
                          <span className="text-xs text-gray-500">{item.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">Par {item.auteur}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {demande.messages.map((msg, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      msg.auteur === "Client" 
                        ? "bg-red-50 ml-8" 
                        : "bg-gray-50 mr-8"
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{msg.auteur}</span>
                        <span className="text-xs text-gray-500">{msg.date}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <Textarea
                    placeholder="Tapez votre message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mb-2"
                  />
                  <Button onClick={envoyerMessage} className="bg-red-900 hover:bg-red-800">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demande.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">{doc.nom}</p>
                          <p className="text-xs text-gray-500">{doc.taille} • {doc.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Joindre un document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le juriste
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Signaler un problème
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDemandeDetail;
