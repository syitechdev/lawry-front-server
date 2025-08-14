
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, MessageSquare, Download, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import BackofficeSidebar from "@/components/BackofficeSidebar";

const ClientCommandes = () => {
  const mesCommandes = [
    { 
      id: "CMD001", 
      service: "Création SAS", 
      statut: "En cours", 
      progression: 75, 
      date: "2024-01-15",
      juriste: "Me Konan",
      prochainEtape: "Validation des statuts"
    },
    { 
      id: "CMD002", 
      service: "Contrat commercial", 
      statut: "En attente", 
      progression: 25, 
      date: "2024-01-12",
      juriste: "Me Diabate",
      prochainEtape: "Documents manquants"
    },
    { 
      id: "CMD003", 
      service: "Formation juridique", 
      statut: "Terminé", 
      progression: 100, 
      date: "2024-01-10",
      juriste: "Me Touré",
      prochainEtape: "Évaluation"
    }
  ];

  const getStatutBadge = (statut: string) => {
    const colors = {
      "En cours": "bg-blue-100 text-blue-800",
      "En attente": "bg-yellow-100 text-yellow-800",
      "Terminé": "bg-green-100 text-green-800"
    };
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="client" userName="Jean Kouassi" userEmail="jean@email.com" />
      
      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Mes Commandes</h1>
            <p className="text-red-100">Suivi de vos demandes et dossiers juridiques</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Historique de mes Commandes</CardTitle>
              <Button className="bg-red-900 hover:bg-red-800" asChild>
                <Link to="/services">Nouvelle Demande</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mesCommandes.map((commande) => (
                <div key={commande.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{commande.service}</h4>
                      <p className="text-gray-600">Commande #{commande.id}</p>
                      <p className="text-sm text-gray-500">Commandé le {new Date(commande.date).toLocaleDateString()}</p>
                    </div>
                    <Badge className={getStatutBadge(commande.statut)}>
                      {commande.statut}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progression du dossier</span>
                      <span>{commande.progression}%</span>
                    </div>
                    <Progress value={commande.progression} className="h-3" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Juriste assigné</p>
                      <p className="font-medium">{commande.juriste}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prochaine étape</p>
                      <p className="font-medium">{commande.prochainEtape}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Voir le dossier
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Messagerie
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Documents
                    </Button>
                    {commande.statut === "Terminé" && (
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-1" />
                        Évaluer
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientCommandes;
