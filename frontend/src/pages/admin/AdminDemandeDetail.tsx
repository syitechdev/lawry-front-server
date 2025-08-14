import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, Download, MessageSquare, FileText, 
  Clock, CheckCircle, AlertCircle, Upload, Save, User, Edit,
  CreditCard, MapPin, Phone, Mail, Building, Calendar
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast } from "sonner";

const AdminDemandeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [nouveauStatut, setNouveauStatut] = useState("");
  const [enCharge, setEnCharge] = useState(false);
  const [messageDialog, setMessageDialog] = useState(false);
  
  const [demande, setDemande] = useState({
    id: "DEM001",
    client: "Jean Kouassi",
    service: "Création SAS",
    statut: "Reçu",
    progression: 10,
    date: "2024-01-15",
    juriste: null,
    prochainEtape: "Validation des informations",
    description: "Création d'une SAS pour une entreprise technologique avec capital de 50 000 FCFA",
    lu: true,
    urgence: "normale",
    // Informations détaillées du client
    informationsClient: {
      nom: "Jean Kouassi",
      email: "jean.kouassi@email.com",
      telephone: "+225 01 02 03 04 05",
      adresse: "Cocody, Abidjan, Côte d'Ivoire",
      dateInscription: "2024-01-10"
    },
    // Détails de la commande
    detailsCommande: {
      typeService: "Création SAS",
      nomEntreprise: "TechnoSAS CI",
      secteurActivite: "Technologies de l'information",
      capitalSocial: "50 000 FCFA",
      nombreAssocies: 2,
      adresseSiege: "Zone 4, Marcory, Abidjan",
      objetSocial: "Développement de solutions logicielles et services informatiques"
    },
    // Moyens de paiement
    paiement: {
      montant: "150 000 FCFA",
      methode: "Virement bancaire",
      statut: "Payé",
      dateTransaction: "2024-01-15",
      reference: "PAY-001-2024"
    },
    // Documents fournis
    documentsClient: [
      { nom: "CNI_Jean_Kouassi.pdf", taille: "1.2 MB", date: "2024-01-15", type: "Pièce d'identité" },
      { nom: "Justificatif_domicile.pdf", taille: "0.8 MB", date: "2024-01-15", type: "Justificatif de domicile" },
      { nom: "Projet_statuts.docx", taille: "2.1 MB", date: "2024-01-15", type: "Projet de statuts" }
    ],
    historique: [
      { date: "2024-01-15", action: "Demande créée", statut: "Reçu", auteur: "Client" }
    ],
    documents: [],
    messages: []
  });

  const prendreEnCharge = () => {
    setEnCharge(true);
    const nouveauJuriste = "Me Konan";
    
    setDemande(prev => ({
      ...prev,
      statut: "En cours",
      progression: 25,
      juriste: nouveauJuriste,
      prochainEtape: "Rédaction des statuts",
      historique: [
        ...prev.historique,
        {
          date: new Date().toISOString().split('T')[0],
          action: "Dossier pris en charge",
          statut: "En cours",
          auteur: nouveauJuriste
        }
      ]
    }));
    
    toast.success(`Demande prise en charge par ${nouveauJuriste}`);
  };

  const envoyerMessage = () => {
    if (!message.trim()) return;
    
    const nouveauMessage = {
      date: new Date().toISOString().split('T')[0],
      auteur: "Admin",
      message: message
    };
    
    setDemande(prev => ({
      ...prev,
      messages: [...prev.messages, nouveauMessage]
    }));
    
    setMessage("");
    setMessageDialog(false);
    toast.success("Message envoyé au client");
  };

  const changerStatut = () => {
    if (!nouveauStatut) return;
    
    const statutsDisponibles = [
      { value: "recu", label: "Reçu", progression: 10 },
      { value: "en-cours", label: "En cours", progression: 50 },
      { value: "en-attente", label: "En attente client", progression: 30 },
      { value: "revision", label: "En révision", progression: 75 },
      { value: "termine", label: "Terminé", progression: 100 }
    ];
  
    const statutObj = statutsDisponibles.find(s => s.value === nouveauStatut);
    if (!statutObj) return;
  
    const nouvelleProgression = statutObj.progression;
    
    setDemande(prev => ({
      ...prev,
      statut: statutObj.label,
      progression: nouvelleProgression,
      historique: [
        ...prev.historique,
        {
          date: new Date().toISOString().split('T')[0],
          action: `Statut changé vers "${statutObj.label}"`,
          statut: statutObj.label,
          auteur: "Admin"
        }
      ]
    }));
    
    setNouveauStatut("");
    toast.success("Statut mis à jour avec succès");
  };

  const getStatutBadge = (statut: string) => {
    const colors = {
      "Reçu": "bg-gray-100 text-gray-800",
      "En cours": "bg-blue-100 text-blue-800",
      "En attente client": "bg-yellow-100 text-yellow-800",
      "En révision": "bg-purple-100 text-purple-800",
      "Terminé": "bg-green-100 text-green-800"
    };
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (!enCharge) {
    // Vue initiale : Informations de la demande
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar userRole="admin" userName="Admin Lawry" userEmail="admin@lawry.ci" />
        
        <div className="ml-80 px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/demandes")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux demandes
            </Button>
            
            <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Détails de la demande</h1>
                  <p className="text-red-100">ID: {demande.id} • Service: {demande.service}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatutBadge(demande.statut)}>
                    {demande.statut}
                  </Badge>
                  {demande.urgence === "urgent" && (
                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Informations du client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations du client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{demande.informationsClient.nom}</p>
                          <p className="text-sm text-gray-500">Nom complet</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{demande.informationsClient.email}</p>
                          <p className="text-sm text-gray-500">Email</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{demande.informationsClient.telephone}</p>
                          <p className="text-sm text-gray-500">Téléphone</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{demande.informationsClient.adresse}</p>
                          <p className="text-sm text-gray-500">Adresse</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Détails de la commande */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Détails de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm text-gray-500">Type de service</p>
                        <p className="font-semibold">{demande.detailsCommande.typeService}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-500">Nom de l'entreprise</p>
                        <p className="font-semibold">{demande.detailsCommande.nomEntreprise}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-500">Secteur d'activité</p>
                        <p className="font-semibold">{demande.detailsCommande.secteurActivite}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-500">Capital social</p>
                        <p className="font-semibold">{demande.detailsCommande.capitalSocial}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-sm text-gray-500">Nombre d'associés</p>
                        <p className="font-semibold">{demande.detailsCommande.nombreAssocies}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-500">Adresse du siège</p>
                        <p className="font-semibold">{demande.detailsCommande.adresseSiege}</p>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-500">Objet social</p>
                        <p className="font-semibold">{demande.detailsCommande.objetSocial}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents fournis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents fournis par le client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {demande.documentsClient.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium">{doc.nom}</p>
                            <p className="text-sm text-gray-500">
                              {doc.type} • {doc.taille} • {doc.date}
                            </p>
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
            </div>

            <div className="space-y-6">
              {/* Informations de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Informations de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm text-gray-500">Montant</p>
                    <p className="font-semibold text-lg">{demande.paiement.montant}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Méthode</p>
                    <p className="font-semibold">{demande.paiement.methode}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Statut</p>
                    <Badge className="bg-green-100 text-green-800">
                      {demande.paiement.statut}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Référence</p>
                    <p className="font-mono text-sm">{demande.paiement.reference}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={prendreEnCharge}
                    className="w-full bg-red-900 hover:bg-red-800"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Prendre en charge la demande
                  </Button>
                  
                  <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Envoyer un message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Envoyer un message au client</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Votre message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button onClick={envoyerMessage} className="w-full">
                          Envoyer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Résumé de la demande */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Date de demande:</span>
                    <span>{demande.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Statut:</span>
                    <Badge className={getStatutBadge(demande.statut)}>
                      {demande.statut}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Paiement:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {demande.paiement.statut}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue de traitement (code existant simplifié)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="admin" userName="Admin Lawry" userEmail="admin@lawry.ci" />
      
      <div className="ml-80 px-8 py-8">
        
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setEnCharge(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux informations
          </Button>
          
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Traitement - {demande.service}</h1>
                <p className="text-red-100">ID: {demande.id} • Client: {demande.client}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatutBadge(demande.statut)}>
                  {demande.statut}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Gestion du statut */}
            <Card>
              <CardHeader>
                <CardTitle>Gestion du dossier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Changer le statut</label>
                    <Select value={nouveauStatut} onValueChange={setNouveauStatut}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recu">Reçu (10%)</SelectItem>
                        <SelectItem value="en-cours">En cours (50%)</SelectItem>
                        <SelectItem value="en-attente">En attente client (30%)</SelectItem>
                        <SelectItem value="revision">En révision (75%)</SelectItem>
                        <SelectItem value="termine">Terminé (100%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={changerStatut} disabled={!nouveauStatut}>
                      <Save className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progression actuelle</span>
                    <span>{demande.progression}%</span>
                  </div>
                  <Progress value={demande.progression} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Upload de documents */}
            <Card>
              <CardHeader>
                <CardTitle>Joindre des documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Glissez vos fichiers ici ou cliquez pour sélectionner</p>
                  <Input type="file" multiple className="mb-2" />
                  <Button variant="outline" size="sm">
                    Choisir les fichiers
                  </Button>
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
                <CardTitle>Communication avec le client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {demande.messages.map((msg, index) => (
                    <div key={index} className={`p-3 rounded-lg ${
                      msg.auteur === "Client" 
                        ? "bg-gray-50 mr-8" 
                        : "bg-red-50 ml-8"
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
                    placeholder="Répondre au client..."
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

          <div className="space-y-6">
            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle>Informations client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{demande.client}</p>
                      <p className="text-sm text-gray-500">Client Premium</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p><span className="font-medium">Email:</span> jean@email.com</p>
                    <p><span className="font-medium">Téléphone:</span> +225 01 02 03 04 05</p>
                    <p><span className="font-medium">Date d'inscription:</span> 2024-01-10</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents du dossier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demande.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">{doc.nom}</p>
                          <p className="text-xs text-gray-500">
                            {doc.taille} • {doc.date} • {doc.type}
                          </p>
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
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marquer comme terminé
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Réassigner le dossier
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Marquer comme urgent
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDemandeDetail;
