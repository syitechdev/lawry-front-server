// src/pages/admin/AdminServices.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { toast, Toaster } from "sonner";
import { Service, servicesApi } from "@/services/services";

const AdminServices = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- form création (contrôlé) ----
  const [cNom, setCNom] = useState("");
  const [cPrix, setCPrix] = useState<number | "">("");
  const [cDescription, setCDescription] = useState("");
  const [cDuree, setCDuree] = useState("");
  const [cStatut, setCStatut] = useState<"Actif" | "Inactif">("Actif");
  const [cDocs, setCDocs] = useState("");

  const stats = useMemo(() => {
    const actifs = servicesData.filter((s) => s.statut === "Actif").length;
    const commandes = servicesData.reduce((sum, s) => sum + s.commandes, 0);
    const noteMoy =
      servicesData.length > 0
        ? (
            servicesData.reduce(
              (sum, s) => sum + (Number.isFinite(s.note) ? s.note : 0),
              0
            ) / servicesData.length
          ).toFixed(1)
        : "0.0";
    const ca = servicesData.reduce(
      (sum, s) => sum + (Number.isFinite(s.prix) ? s.prix : 0) * s.commandes,
      0
    );
    return { actifs, commandes, noteMoy, ca };
  }, [servicesData]);

  const load = async () => {
    try {
      setLoading(true);
      const { items } = await servicesApi.list();
      setServicesData(items);
    } catch (e: any) {
      toast.error(e.message || "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatutBadge = (statut: string) =>
    statut === "Actif"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  const toggleServiceStatus = async (id: number) => {
    const current = servicesData.find((s) => s.id === id);
    if (!current) return;
    const next = current.statut === "Actif" ? "Inactif" : "Actif";
    // Optimistic UI
    setServicesData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, statut: next } : s))
    );
    try {
      await servicesApi.setActive(id, next === "Actif");
      toast.success("Statut du service modifié");
    } catch (e: any) {
      // revert si erreur
      setServicesData((prev) =>
        prev.map((s) => (s.id === id ? { ...s, statut: current.statut } : s))
      );
      toast.error(e.message || "Échec de la mise à jour du statut");
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Supprimer ce service ?")) return;
    try {
      await servicesApi.remove(id);
      setServicesData((prev) => prev.filter((s) => s.id !== id));
      toast.success("Service supprimé avec succès");
    } catch (e: any) {
      toast.error(e.message || "Suppression impossible");
    }
  };

  const handleViewService = (service: Service) => setViewingService(service);
  const handleEditService = (service: Service) =>
    setEditingService({ ...service });

  const resetCreateForm = () => {
    setCNom("");
    setCPrix("");
    setCDescription("");
    setCDuree("");
    setCStatut("Actif");
    setCDocs("");
  };

  const createService = async () => {
    try {
      if (!cNom.trim() || cPrix === "" || Number(cPrix) <= 0) {
        toast.error("Nom et prix sont requis");
        return;
      }
      const payload: Partial<Service> = {
        nom: cNom.trim(),
        prix: Number(cPrix), // sera sérialisé en string côté services.ts
        description: cDescription.trim(),
        duree: cDuree.trim(),
        statut: cStatut,
        documents: cDocs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        commandes: 0,
        note: 0,
      };
      const created = await servicesApi.create(payload);
      setServicesData((prev) => [created, ...prev]);
      toast.success("Service créé avec succès");
      setIsDialogOpen(false);
      resetCreateForm();
    } catch (e: any) {
      toast.error(e.message || "Création impossible");
    }
  };

  const saveEdit = async () => {
    if (!editingService) return;
    try {
      const patch: Partial<Service> = {
        nom: editingService.nom,
        prix: Number(editingService.prix),
        description: editingService.description,
        duree: editingService.duree,
        statut: editingService.statut,
        documents: editingService.documents,
      };
      const updated = await servicesApi.update(editingService.id, patch);
      setServicesData((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      toast.success("Service modifié avec succès");
      setEditingService(null);
    } catch (e: any) {
      toast.error(e.message || "Mise à jour impossible");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar
          userRole="admin"
          userName="Admin Lawry"
          userEmail="admin@lawry.ci"
        />
        <div className="ml-80 px-8 py-8 text-gray-600">Chargement...</div>

        {/* Toaster (une seule fois sur la page si tu n'as pas d'App.tsx global) */}
        <Toaster richColors closeButton position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="admin"
        userName="Admin Lawry"
        userEmail="admin@lawry.ci"
      />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Gestion des Services</h1>
            <p className="text-red-100">
              Créer et gérer l'offre de services juridiques
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.actifs}</div>
              <p className="text-sm text-blue-100">Services Actifs</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.commandes}</div>
              <p className="text-sm text-green-100">Commandes ce mois</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.noteMoy}/5</div>
              <p className="text-sm text-yellow-100">Note moyenne</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {(stats.ca / 1_000_000).toFixed(1)}M
              </div>
              <p className="text-sm text-purple-100">CA mensuel (FCFA)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Catalogue des Services</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-900 hover:bg-red-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer un Nouveau Service</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nom">Nom du service</Label>
                        <Input
                          id="nom"
                          placeholder="Ex: Création SAS"
                          value={cNom}
                          onChange={(e) => setCNom(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="prix">Prix (FCFA)</Label>
                        <Input
                          id="prix"
                          type="number"
                          placeholder="150000"
                          value={cPrix}
                          onChange={(e) =>
                            setCPrix(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Description détaillée du service..."
                        value={cDescription}
                        onChange={(e) => setCDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duree">Durée</Label>
                        <Input
                          id="duree"
                          placeholder="7-10 jours"
                          value={cDuree}
                          onChange={(e) => setCDuree(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="statut">Statut</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          id="statut"
                          value={cStatut}
                          onChange={(e) =>
                            setCStatut(e.target.value as "Actif" | "Inactif")
                          }
                        >
                          <option value="Actif">Actif</option>
                          <option value="Inactif">Inactif</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="documents">
                        Documents fournis (séparés par des virgules)
                      </Label>
                      <Input
                        id="documents"
                        placeholder="Statuts, PV d'assemblée, Attestation RCCM"
                        value={cDocs}
                        onChange={(e) => setCDocs(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-red-900 hover:bg-red-800"
                      onClick={createService}
                    >
                      Créer le Service
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesData.map((service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.nom}</CardTitle>
                        <p className="text-sm font-mono text-gray-500">
                          {service.code ?? `#${service.id}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatutBadge(service.statut)}>
                          {service.statut}
                        </Badge>
                        <Switch
                          checked={service.statut === "Actif"}
                          onCheckedChange={() =>
                            toggleServiceStatus(service.id)
                          }
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Prix</p>
                        <p className="font-bold text-lg text-red-800">
                          {Number(service.prix).toLocaleString()} FCFA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Durée</p>
                        <p className="font-medium">{service.duree}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Commandes</p>
                        <p className="font-bold text-blue-600">
                          {service.commandes}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Note</p>
                        <p className="font-bold text-yellow-600">
                          ⭐ {service.note}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Documents fournis:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {service.documents.map((doc, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewService(service)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteService(service.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      {viewingService && (
        <Dialog
          open={!!viewingService}
          onOpenChange={() => setViewingService(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Détails du Service - {viewingService.nom}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID Service</Label>
                  <p className="font-mono">
                    {viewingService.code ?? `#${viewingService.id}`}
                  </p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={getStatutBadge(viewingService.statut)}>
                    {viewingService.statut}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p>{viewingService.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Prix</Label>
                  <p className="font-bold text-red-800">
                    {Number(viewingService.prix).toLocaleString()} FCFA
                  </p>
                </div>
                <div>
                  <Label>Durée</Label>
                  <p>{viewingService.duree}</p>
                </div>
                <div>
                  <Label>Note</Label>
                  <p>⭐ {viewingService.note}/5</p>
                </div>
              </div>
              <div>
                <Label>Documents fournis</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {viewingService.documents.map((doc, i) => (
                    <Badge key={i} variant="secondary">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Statistiques</Label>
                <p>
                  Nombre de commandes:{" "}
                  <span className="font-bold">{viewingService.commandes}</span>
                </p>
                <p>
                  CA généré:{" "}
                  <span className="font-bold">
                    {(
                      Number(viewingService.prix) * viewingService.commandes
                    ).toLocaleString()}{" "}
                    FCFA
                  </span>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editingService && (
        <Dialog
          open={!!editingService}
          onOpenChange={() => setEditingService(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le Service</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nom">Nom du service</Label>
                  <Input
                    id="edit-nom"
                    value={editingService.nom}
                    onChange={(e) =>
                      setEditingService((s) =>
                        s ? { ...s, nom: e.target.value } : s
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prix">Prix (FCFA)</Label>
                  <Input
                    id="edit-prix"
                    type="number"
                    value={editingService.prix}
                    onChange={(e) =>
                      setEditingService((s) =>
                        s
                          ? {
                              ...s,
                              prix:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            }
                          : s
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService((s) =>
                      s ? { ...s, description: e.target.value } : s
                    )
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-duree">Durée</Label>
                  <Input
                    id="edit-duree"
                    value={editingService.duree}
                    onChange={(e) =>
                      setEditingService((s) =>
                        s ? { ...s, duree: e.target.value } : s
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-statut">Statut</Label>
                  <select
                    id="edit-statut"
                    className="w-full p-2 border rounded-md"
                    value={editingService.statut}
                    onChange={(e) =>
                      setEditingService((s) =>
                        s
                          ? {
                              ...s,
                              statut: e.target.value as "Actif" | "Inactif",
                            }
                          : s
                      )
                    }
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-documents">
                  Documents fournis (séparés par des virgules)
                </Label>
                <Input
                  id="edit-documents"
                  value={editingService.documents.join(", ")}
                  onChange={(e) =>
                    setEditingService((s) =>
                      s
                        ? {
                            ...s,
                            documents: e.target.value
                              .split(",")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          }
                        : s
                    )
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingService(null)}>
                Annuler
              </Button>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={saveEdit}
              >
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Toaster (monte-le ici si tu n'as pas de App.tsx global) */}
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
};

export default AdminServices;
