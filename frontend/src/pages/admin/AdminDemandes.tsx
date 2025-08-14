import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, MessageSquare, UserCheck, Filter, Download } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast } from "sonner";

const AdminDemandes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);

  const [demandesData, setDemandesData] = useState([
    { 
      id: "DEM001", 
      client: "Jean Kouassi", 
      service: "Création SAS", 
      statut: "En cours", 
      assigneA: "Me Konan", 
      date: "2024-01-15", 
      urgence: "normale",
      lu: false
    },
    { 
      id: "DEM002", 
      client: "Marie Diabate", 
      service: "Contrat commercial", 
      statut: "En attente", 
      assigneA: "Me Diabate", 
      date: "2024-01-14", 
      urgence: "urgent",
      lu: true
    },
    { 
      id: "DEM003", 
      client: "Paul Kone", 
      service: "Formation juridique", 
      statut: "Traité", 
      assigneA: "Me Touré", 
      date: "2024-01-13", 
      urgence: "normale",
      lu: true
    },
    { 
      id: "DEM004", 
      client: "Aya Touré", 
      service: "Consultation", 
      statut: "En cours", 
      assigneA: "Me Konan", 
      date: "2024-01-12", 
      urgence: "urgent",
      lu: false
    },
  ]);

  const getStatutBadge = (statut: string) => {
    const colors = {
      "En cours": "bg-blue-100 text-blue-800",
      "En attente": "bg-yellow-100 text-yellow-800",
      "Traité": "bg-green-100 text-green-800",
      "Urgent": "bg-red-100 text-red-800"
    };
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredDemandes = demandesData.filter(demande =>
    demande.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const voirDetails = (id: string) => {
    // Marquer comme lu
    setDemandesData(prev => 
      prev.map(demande => 
        demande.id === id ? { ...demande, lu: true } : demande
      )
    );
    navigate(`/admin/demande/${id}`);
  };

  const assignerDemande = (id: string) => {
    const juristes = ["Me Konan", "Me Diabate", "Me Touré", "Me Bamba"];
    const nouveauJuriste = juristes[Math.floor(Math.random() * juristes.length)];
    
    setDemandesData(prev =>
      prev.map(demande =>
        demande.id === id ? { ...demande, assigneA: nouveauJuriste } : demande
      )
    );
    
    toast.success(`Demande ${id} assignée à ${nouveauJuriste}`);
  };

  const ouvrirMessages = (id: string) => {
    navigate(`/admin/demande/${id}#messages`);
  };

  const modifierDemande = (id: string) => {
    navigate(`/admin/demande/${id}#traitement`);
  };

  const exporterDonnees = () => {
    const csvContent = [
      ["ID", "Client", "Service", "Statut", "Assigné à", "Date"].join(","),
      ...filteredDemandes.map(d => 
        [d.id, d.client, d.service, d.statut, d.assigneA, d.date].join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "demandes.csv";
    a.click();
    toast.success("Données exportées avec succès");
  };

  const demandesNonLues = demandesData.filter(d => !d.lu).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="admin" userName="Admin Lawry" userEmail="admin@lawry.ci" />
      
      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Gestion des Demandes</h1>
                <p className="text-red-100">Suivi et traitement des demandes clients</p>
              </div>
              {demandesNonLues > 0 && (
                <div className="bg-white/20 rounded-full px-4 py-2">
                  <span className="text-white font-bold">{demandesNonLues} non lues</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des Demandes</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input 
                  placeholder="Rechercher..." 
                  className="w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={exporterDonnees}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID Demande</th>
                    <th className="text-left p-3">Client</th>
                    <th className="text-left p-3">Service</th>
                    <th className="text-left p-3">Statut</th>
                    <th className="text-left p-3">Assigné à</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemandes.map((demande) => (
                    <tr 
                      key={demande.id} 
                      className={`border-b hover:bg-gray-50 ${!demande.lu ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">{demande.id}</span>
                          {!demande.lu && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{demande.client}</td>
                      <td className="p-3">{demande.service}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatutBadge(demande.statut)}>
                            {demande.statut}
                          </Badge>
                          {demande.urgence === "urgent" && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{demande.assigneA}</td>
                      <td className="p-3">{new Date(demande.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Voir détails"
                            onClick={() => voirDetails(demande.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Assigner"
                            onClick={() => assignerDemande(demande.id)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Messages"
                            onClick={() => ouvrirMessages(demande.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Modifier"
                            onClick={() => modifierDemande(demande.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredDemandes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune demande trouvée
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDemandes;
