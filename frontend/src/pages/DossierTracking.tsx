
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Search, FileText, Clock, CheckCircle, AlertCircle, Calendar, User } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";

const DossierTracking = () => {
  const [dossierNumber, setDossierNumber] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Simulation de données de dossier
  const mockDossierData = {
    "DOS001": {
      number: "DOS001",
      type: "Création SARL",
      client: "Jean Dupont",
      dateCreation: "15/01/2024",
      status: "En cours",
      progress: 75,
      steps: [
        { name: "Dossier reçu", status: "completed", date: "15/01/2024" },
        { name: "Documents vérifiés", status: "completed", date: "16/01/2024" },
        { name: "Rédaction des statuts", status: "completed", date: "18/01/2024" },
        { name: "Dépôt au greffe", status: "current", date: "20/01/2024" },
        { name: "Immatriculation", status: "pending", date: "" },
        { name: "Livraison finale", status: "pending", date: "" }
      ],
      documents: [
        { name: "Statuts provisoires", date: "18/01/2024", status: "Disponible" },
        { name: "Justificatifs", date: "16/01/2024", status: "Disponible" }
      ],
      estimatedCompletion: "25/01/2024"
    },
    "DOS002": {
      number: "DOS002",
      type: "Contrat de travail",
      client: "Marie Martin",
      dateCreation: "10/01/2024",
      status: "Terminé",
      progress: 100,
      steps: [
        { name: "Dossier reçu", status: "completed", date: "10/01/2024" },
        { name: "Analyse des besoins", status: "completed", date: "11/01/2024" },
        { name: "Rédaction du contrat", status: "completed", date: "12/01/2024" },
        { name: "Révision juridique", status: "completed", date: "13/01/2024" },
        { name: "Livraison finale", status: "completed", date: "14/01/2024" }
      ],
      documents: [
        { name: "Contrat de travail CDI", date: "14/01/2024", status: "Disponible" },
        { name: "Avenant spécifique", date: "14/01/2024", status: "Disponible" }
      ],
      estimatedCompletion: "14/01/2024"
    }
  };

  const handleSearch = () => {
    if (!dossierNumber.trim()) return;
    
    setIsSearching(true);
    setHasSearched(false);
    
    // Simulation d'une recherche
    setTimeout(() => {
      const result = mockDossierData[dossierNumber.toUpperCase() as keyof typeof mockDossierData];
      setSearchResult(result || null);
      setIsSearching(false);
      setHasSearched(true);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "current": return "bg-blue-500";
      case "pending": return "bg-gray-300";
      default: return "bg-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "current": return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Suivi de dossier
          </h1>
          <p className="text-lg text-gray-600">
            Suivez l'état d'avancement de votre dossier en temps réel
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-red-900">Rechercher votre dossier</CardTitle>
            <CardDescription>
              Entrez votre numéro de dossier pour consulter son état d'avancement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Ex: DOS001, DOS002..."
                value={dossierNumber}
                onChange={(e) => setDossierNumber(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !dossierNumber.trim()}
                className="bg-red-900 hover:bg-red-800"
              >
                {isSearching ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Le numéro de dossier vous a été communiqué par email lors de la création de votre dossier.
            </p>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-6">
            {/* Dossier Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-red-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Dossier {searchResult.number}
                    </CardTitle>
                    <CardDescription>{searchResult.type}</CardDescription>
                  </div>
                  <Badge 
                    variant={searchResult.status === "Terminé" ? "secondary" : "outline"}
                    className={searchResult.status === "Terminé" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                  >
                    {searchResult.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm"><strong>Client:</strong> {searchResult.client}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm"><strong>Créé le:</strong> {searchResult.dateCreation}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm"><strong>Fin estimée:</strong> {searchResult.estimatedCompletion}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-gray-600">{searchResult.progress}%</span>
                  </div>
                  <Progress value={searchResult.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">Suivi détaillé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResult.steps.map((step: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(step.status)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${step.status === 'completed' ? 'text-green-700' : step.status === 'current' ? 'text-blue-700' : 'text-gray-500'}`}>
                            {step.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(step.status)}
                            {step.date && (
                              <span className="text-sm text-gray-600">{step.date}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-900">Documents disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchResult.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-gray-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.date}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {hasSearched && searchResult === null && !isSearching && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Dossier non trouvé
              </h3>
              <p className="text-red-700 mb-4">
                Aucun dossier ne correspond au numéro "{dossierNumber}".
              </p>
              <p className="text-sm text-red-600">
                Vérifiez le numéro ou contactez notre support si le problème persiste.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Besoin d'aide ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-2">Exemples de numéros de dossier :</p>
                <ul className="space-y-1">
                  <li>• DOS001 (Création SARL)</li>
                  <li>• DOS002 (Contrat de travail)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Contact support :</p>
                <p>📧 support@lawry.ci</p>
                <p>📞 +225 0101987580</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DossierTracking;
