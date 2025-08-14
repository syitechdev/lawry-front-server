import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, Users, Clock, CheckCircle, AlertCircle, 
  Star, TrendingUp, MessageSquare, Calendar, Shield, Download, Filter,
  Bot, Brain, Zap, Activity, Settings, BarChart3
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast } from "sonner";
import jsPDF from 'jspdf';

const AdminDashboard = () => {
  const [dateFilter, setDateFilter] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Données pour les graphiques
  const revenueData = [
    { mois: "Jan", revenus: 1200000, demandes: 15 },
    { mois: "Fév", revenus: 1850000, demandes: 23 },
    { mois: "Mar", revenus: 2100000, demandes: 28 },
    { mois: "Avr", revenus: 1750000, demandes: 21 },
    { mois: "Mai", revenus: 2450000, demandes: 31 },
    { mois: "Juin", revenus: 2200000, demandes: 27 }
  ];

  const servicesData = [
    { name: "Création SAS", value: 35, color: "#ef4444" },
    { name: "Création SARL", value: 25, color: "#f97316" },
    { name: "Contrats", value: 20, color: "#eab308" },
    { name: "Consultations", value: 15, color: "#22c55e" },
    { name: "Autres", value: 5, color: "#6366f1" }
  ];

  const performanceData = [
    { periode: "S1", satisfaction: 4.8, completions: 95, delais: 3.2 },
    { periode: "S2", satisfaction: 4.9, completions: 97, delais: 2.8 },
    { periode: "S3", satisfaction: 4.7, completions: 93, delais: 3.5 },
    { periode: "S4", satisfaction: 4.9, completions: 98, delais: 2.5 }
  ];

  // Données simulées pour l'admin
  const statistiques = {
    demandesTotal: 124,
    demandesEnCours: 23,
    demandesAttente: 8,
    demandesTerminees: 93,
    clientsActifs: 67,
    revenusTotal: "2 450 000 FCFA",
    satisfactionClient: 4.8
  };

  const demandesRecentes = [
    { 
      id: "DEM001", 
      client: "SARL TechCorp", 
      service: "Création SAS", 
      statut: "En cours", 
      progression: 75, 
      date: "2024-01-15",
      juriste: "Me Konan"
    },
    { 
      id: "DEM002", 
      client: "M. Jean Kouassi", 
      service: "Contrat commercial", 
      statut: "En attente", 
      progression: 25, 
      date: "2024-01-14",
      juriste: "Me Diabate"
    },
    { 
      id: "DEM003", 
      client: "Association Espoir", 
      service: "Création Association", 
      statut: "Terminé", 
      progression: 100, 
      date: "2024-01-13",
      juriste: "Me Touré"
    }
  ];

  const activitesRecentes = [
    { action: "Nouveau client inscrit", utilisateur: "Jean Kouassi", temps: "Il y a 2h" },
    { action: "Dossier SAS validé", utilisateur: "Me Konan", temps: "Il y a 3h" },
    { action: "Paiement reçu", utilisateur: "SARL TechCorp", temps: "Il y a 5h" },
    { action: "Contrat généré", utilisateur: "Me Diabate", temps: "Hier" }
  ];

  // Nouvelles données pour les statistiques IA
  const statistiquesIA = {
    utilisationsTotal: 2547,
    utilisationsAujourdhui: 89,
    tempsReponsesMoyen: "1.2s",
    tauxSatisfaction: 94.3,
    questionsResolues: 2184,
    escalationsHumaines: 363,
    economiesRealisees: "850 000 FCFA"
  };

  const donneesUtilisationIA = [
    { jour: "Lun", consultations: 45, resolutions: 39, escalations: 6 },
    { jour: "Mar", consultations: 52, resolutions: 47, escalations: 5 },
    { jour: "Mer", consultations: 38, resolutions: 34, escalations: 4 },
    { jour: "Jeu", consultations: 61, resolutions: 55, escalations: 6 },
    { jour: "Ven", consultations: 48, resolutions: 44, escalations: 4 },
    { jour: "Sam", consultations: 33, resolutions: 31, escalations: 2 },
    { jour: "Dim", consultations: 29, resolutions: 27, escalations: 2 }
  ];

  const categoriesIA = [
    { name: "Création d'entreprise", value: 40, color: "#ef4444" },
    { name: "Questions juridiques", value: 30, color: "#f97316" },
    { name: "Contrats", value: 20, color: "#eab308" },
    { name: "Procédures", value: 7, color: "#22c55e" },
    { name: "Autres", value: 3, color: "#6366f1" }
  ];

  const performanceIA = [
    { metrique: "Précision des réponses", valeur: 96.7, unite: "%" },
    { metrique: "Temps de réponse", valeur: 1.2, unite: "s" },
    { metrique: "Disponibilité", valeur: 99.8, unite: "%" },
    { metrique: "Taux de résolution", valeur: 85.7, unite: "%" }
  ];

  const getStatutBadge = (statut: string) => {
    const colors = {
      "En cours": "bg-blue-100 text-blue-800",
      "En attente": "bg-yellow-100 text-yellow-800",
      "Terminé": "bg-green-100 text-green-800"
    };
    return colors[statut as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleExportReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const periode = dateFilter === "custom" && startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : `${dateFilter} derniers jours`;
    
    // En-tête avec logo Lawry
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Ajout du logo Lawry (en utilisant l'image uploadée)
    try {
      const logoImg = new Image();
      logoImg.onload = function() {
        // Ajouter le logo à gauche de l'en-tête
        doc.addImage('/lovable-uploads/8ddd9075-95fd-4813-befd-8e6012ca6e9b.png', 'PNG', 20, 10, 30, 30);
        
        // Texte Lawry à côté du logo
        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("LAWRY", 60, 25);
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Cabinet Juridique Digital", 60, 35);
        
        // Date et période à droite
        doc.setFontSize(11);
        doc.text(`Généré le: ${currentDate}`, 140, 25);
        doc.text(`Période: ${periode}`, 140, 35);
        
        // Titre principal du rapport
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("RAPPORT DE PERFORMANCE", 20, 65);
        
        let yPos = 85;
        
        // Section Statistiques Générales
        doc.setFillColor(243, 244, 246);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("STATISTIQUES GÉNÉRALES", 20, yPos);
        
        yPos += 18;
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "normal");
        
        const stats = [
          [`Demandes en cours:`, `${statistiques.demandesEnCours}`],
          [`Demandes terminées:`, `${statistiques.demandesTerminees}`],
          [`Clients actifs:`, `${statistiques.clientsActifs}`],
          [`Revenus total:`, `${statistiques.revenusTotal}`],
          [`Satisfaction client:`, `${statistiques.satisfactionClient}/5`]
        ];
        
        stats.forEach(([label, value]) => {
          doc.text(label, 25, yPos);
          doc.setFont("helvetica", "bold");
          doc.text(value, 120, yPos);
          doc.setFont("helvetica", "normal");
          yPos += 10;
        });
        
        yPos += 15;
        
        // Section Indicateurs de Performance
        doc.setFillColor(243, 244, 246);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("INDICATEURS DE PERFORMANCE", 20, yPos);
        
        yPos += 18;
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "normal");
        
        const performance = [
          [`Taux de completion:`, `96%`],
          [`Délai moyen de traitement:`, `2.8 jours`],
          [`Score NPS:`, `+68`],
          [`Amélioration délais:`, `-15% vs mois dernier`]
        ];
        
        performance.forEach(([label, value]) => {
          doc.text(label, 25, yPos);
          doc.setFont("helvetica", "bold");
          doc.text(value, 120, yPos);
          doc.setFont("helvetica", "normal");
          yPos += 10;
        });
        
        yPos += 15;
        
        // Section Répartition des Services
        doc.setFillColor(243, 244, 246);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("RÉPARTITION DES SERVICES", 20, yPos);
        
        yPos += 18;
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "normal");
        
        servicesData.forEach((service) => {
          doc.text(`• ${service.name}:`, 25, yPos);
          doc.setFont("helvetica", "bold");
          doc.text(`${service.value}%`, 120, yPos);
          doc.setFont("helvetica", "normal");
          yPos += 10;
        });
        
        yPos += 15;
        
        // Section Évolution des Revenus
        doc.setFillColor(243, 244, 246);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
        doc.text("ÉVOLUTION DES REVENUS", 20, yPos);
        
        yPos += 18;
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "normal");
        
        revenueData.forEach((data) => {
          doc.text(`${data.mois}:`, 25, yPos);
          doc.setFont("helvetica", "bold");
          doc.text(`${data.revenus.toLocaleString()} FCFA`, 70, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(`(${data.demandes} demandes)`, 130, yPos);
          yPos += 10;
        });
        
        // Nouvelle page si nécessaire
        if (yPos > 240) {
          doc.addPage();
          yPos = 30;
        }
        
        yPos += 20;
        
        // Section Alertes avec fond coloré
        doc.setFillColor(255, 248, 220);
        doc.rect(15, yPos - 5, 180, 8, 'F');
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 83, 9);
        doc.text("ALERTES ET ACTIONS REQUISES", 20, yPos);
        
        yPos += 18;
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81);
        doc.setFont("helvetica", "normal");
        
        const alertes = [
          `• ${statistiques.demandesAttente} dossiers en attente de traitement`,
          `• 3 paiements en retard nécessitent un suivi`,
          `• 2 documents en attente de validation`,
          `• 5 rendez-vous programmés aujourd'hui`
        ];
        
        alertes.forEach((alerte) => {
          doc.text(alerte, 25, yPos);
          yPos += 10;
        });
        
        // Pied de page professionnel
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(9);
          doc.setTextColor(128, 128, 128);
          doc.text(`Page ${i}/${pageCount}`, 185, 285);
          doc.text("Rapport généré par Lawry - Cabinet Juridique Digital", 20, 285);
          doc.text("Confidentiel - Usage interne uniquement", 20, 290);
        }
        
        // Sauvegarde du PDF
        const fileName = `rapport_lawry_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        toast.success("Rapport PDF exporté avec succès avec le logo Lawry");
      };
      
      // Fallback si l'image ne charge pas
      logoImg.onerror = function() {
        // Version sans image, avec logo textuel stylisé
        doc.setFontSize(32);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("L", 25, 30);
        
        doc.setFontSize(28);
        doc.text("AWRY", 35, 30);
        
        // ... keep existing code (rest of PDF generation) the same ...
        
        const fileName = `rapport_lawry_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast.success("Rapport PDF exporté avec succès");
      };
      
      logoImg.src = '/lovable-uploads/8ddd9075-95fd-4813-befd-8e6012ca6e9b.png';
      
    } catch (error) {
      console.error('Erreur lors du chargement du logo:', error);
      toast.error("Erreur lors de l'export du rapport");
    }
  };

  const handleOptimiserIA = () => {
    toast.success("Optimisation de l'IA lancée avec succès");
  };

  const handleReinitialiserIA = () => {
    toast.info("Paramètres IA réinitialisés aux valeurs par défaut");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="admin" userName="Admin Lawry" userEmail="admin@lawry.ci" />
      
      <div className="ml-80 px-8 py-8">
        {/* En-tête avec filtres */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard Administrateur</h1>
                <p className="text-red-100">Analyse complète de vos performances et gestion IA</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="bg-white text-red-800 hover:bg-red-50"
                  onClick={handleExportReport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter Rapport
                </Button>
              </div>
            </div>
            
            {/* Filtres de période */}
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label className="text-red-100">Période</Label>
                <select 
                  className="mt-1 p-2 border rounded-md text-gray-900"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">3 derniers mois</option>
                  <option value="365">12 derniers mois</option>
                  <option value="custom">Période personnalisée</option>
                </select>
              </div>
              
              {dateFilter === "custom" && (
                <>
                  <div>
                    <Label className="text-red-100">Date début</Label>
                    <Input 
                      type="date" 
                      className="mt-1 text-gray-900"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-red-100">Date fin</Label>
                    <Input 
                      type="date" 
                      className="mt-1 text-gray-900"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section Statistiques IA */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bot className="h-6 w-6 mr-2 text-red-600" />
              Statistiques Lawry AI
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOptimiserIA}
                className="flex items-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                Optimiser IA
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReinitialiserIA}
                className="flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres IA
              </Button>
            </div>
          </div>

          {/* Cartes statistiques IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisations Total</CardTitle>
                <Bot className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistiquesIA.utilisationsTotal.toLocaleString()}</div>
                <p className="text-xs text-indigo-100">+{statistiquesIA.utilisationsAujourdhui} aujourd'hui</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Temps Réponse</CardTitle>
                <Zap className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistiquesIA.tempsReponsesMoyen}</div>
                <p className="text-xs text-cyan-100">Moyenne</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux Satisfaction</CardTitle>
                <Star className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistiquesIA.tauxSatisfaction}%</div>
                <p className="text-xs text-emerald-100">Très satisfaisant</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Économies</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistiquesIA.economiesRealisees}</div>
                <p className="text-xs text-amber-100">Ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Utilisation quotidienne IA */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                  Utilisation Quotidienne IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donneesUtilisationIA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="consultations" fill="#6366f1" name="Consultations" />
                    <Bar dataKey="resolutions" fill="#22c55e" name="Résolutions" />
                    <Bar dataKey="escalations" fill="#ef4444" name="Escalations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Catégories de questions IA */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Catégories de Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoriesIA}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoriesIA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métriques de performance IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {performanceIA.map((metrique, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800 text-sm">
                    <Brain className="h-4 w-4 mr-2" />
                    {metrique.metrique}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700 mb-2">
                      {metrique.valeur}{metrique.unite}
                    </div>
                    {metrique.unite === "%" && (
                      <Progress value={metrique.valeur} className="mt-3" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gestion et contrôles IA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuration IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Mode d'apprentissage</span>
                  <Badge className="bg-green-100 text-green-800">Actif</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Niveau de confiance</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Dernière mise à jour</span>
                  <span className="text-sm">Il y a 2h</span>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Modifier paramètres
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Performance Globale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">A+</div>
                  <p className="text-sm text-green-700">Score de performance</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Questions résolues:</span>
                    <span className="font-medium">{statistiquesIA.questionsResolues}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Escalations:</span>
                    <span className="font-medium">{statistiquesIA.escalationsHumaines}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <Brain className="h-5 w-5 mr-2" />
                  Actions IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleOptimiserIA}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Optimiser modèle
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter logs IA
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReinitialiserIA}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cartes de statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes En Cours</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistiques.demandesEnCours}</div>
              <p className="text-xs text-blue-100">+12% ce mois</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes Terminées</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistiques.demandesTerminees}</div>
              <p className="text-xs text-green-100">+8% ce mois</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistiques.clientsActifs}</div>
              <p className="text-xs text-purple-100">+15% ce mois</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistiques.revenusTotal}</div>
              <p className="text-xs text-orange-100">+22% ce mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques de performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Évolution des revenus */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Évolution des Revenus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, "Revenus"]} />
                  <Line type="monotone" dataKey="revenus" stroke="#ef4444" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition des services */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Répartition des Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={servicesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {servicesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Graphique des demandes par mois */}
        <div className="mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Nombre de Demandes par Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="demandes" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Indicateurs de performance avancés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                Taux de Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                <p className="text-sm text-green-700">Dossiers terminés dans les délais</p>
                <Progress value={96} className="mt-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Clock className="h-5 w-5 mr-2" />
                Délai Moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2.8</div>
                <p className="text-sm text-blue-700">Jours de traitement moyen</p>
                <div className="mt-3 text-xs text-blue-600">
                  -15% vs mois dernier
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Star className="h-5 w-5 mr-2" />
                Score NPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">+68</div>
                <p className="text-sm text-purple-700">Net Promoter Score</p>
                <div className="mt-3 text-xs text-purple-600">
                  Excellent niveau
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section principale avec deux colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Demandes récentes */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-red-700" />
                Demandes Récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demandesRecentes.map((demande) => (
                <div key={demande.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{demande.client}</h4>
                      <p className="text-sm text-gray-600">{demande.service} • {demande.id}</p>
                    </div>
                    <Badge className={getStatutBadge(demande.statut)}>
                      {demande.statut}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span>{demande.progression}%</span>
                    </div>
                    <Progress value={demande.progression} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Juriste: {demande.juriste}</span>
                    <span>{demande.date}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activités récentes */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-red-700" />
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activitesRecentes.map((activite, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activite.action}</p>
                    <p className="text-xs text-gray-600">{activite.utilisateur}</p>
                    <p className="text-xs text-gray-500">{activite.temps}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Section alertes et notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                Alertes Urgentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-yellow-700">• {statistiques.demandesAttente} dossiers en attente</p>
                <p className="text-sm text-yellow-700">• 3 paiements en retard</p>
                <p className="text-sm text-yellow-700">• 2 documents à valider</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Star className="h-5 w-5 mr-2" />
                Satisfaction Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {statistiques.satisfactionClient}/5
                </div>
                <p className="text-sm text-green-700">Moyenne des évaluations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Calendar className="h-5 w-5 mr-2" />
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-blue-700">• 5 rendez-vous prévus</p>
                <p className="text-sm text-blue-700">• 8 dossiers à traiter</p>
                <p className="text-sm text-blue-700">• 12 emails en attente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section d'aide */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Shield className="h-8 w-8 text-red-700 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Centre d'Administration</h3>
                <p className="text-red-700 mb-4">
                  Gérez efficacement votre cabinet juridique avec tous les outils nécessaires. 
                  Utilisez la barre de navigation à gauche pour accéder aux différentes sections.
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-red-600">
                  <span>• Gestion des demandes</span>
                  <span>• Suivi des clients</span>
                  <span>• Administration complète</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
