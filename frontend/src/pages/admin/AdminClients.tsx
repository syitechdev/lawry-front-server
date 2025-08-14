import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Edit,
  UserPlus,
  Filter,
  Download,
  Trash2,
} from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";
// ❌ ne pas utiliser sonner ici
// import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { users, type User } from "@/services/users";
import type { ListParams } from "@/services/crud";

const statusBadge = (statut?: string) => {
  const map: Record<string, string> = {
    Actif: "bg-green-100 text-green-800",
    VIP: "bg-purple-100 text-purple-800",
    Inactif: "bg-gray-100 text-gray-800",
  };
  return map[statut || "Inactif"] || "bg-gray-100 text-gray-800";
};

type EditableUser = Pick<
  User,
  "name" | "email" | "phone" | "address" | "status"
> & {
  password?: string;
  password_confirmation?: string;
  role?: "Client" | "Admin";
};

function firstRole(u?: User): "Client" | "Admin" | undefined {
  const r = (u?.roles || [])[0];
  if (r === "Admin" || r === "Client") return r;
  return undefined;
}

const AdminClients = () => {
  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingClient, setViewingClient] = useState<User | null>(null);
  const [editingClient, setEditingClient] = useState<User | null>(null);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);

  // shadcn toast
  const { toast } = useToast();
  const success = (description: string, title = "Succès") =>
    toast({ title, description });
  const errorToast = (description: string, title = "Erreur") =>
    toast({ title, description, variant: "destructive" });

  // Data
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Forms
  const [newUser, setNewUser] = useState<EditableUser>({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Actif",
    password: "",
    password_confirmation: "",
    role: "Client",
  });

  const [editForm, setEditForm] = useState<EditableUser>({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Actif",
    password: "",
    password_confirmation: "",
    role: "Client",
  });

  // Password visibility
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showNewPwd2, setShowNewPwd2] = useState(false);
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [showEditPwd2, setShowEditPwd2] = useState(false);

  // Load
  const load = async () => {
    setLoading(true);
    try {
      const params: ListParams = {
        sort: { created_at: "desc" },
        filters: { role: "Client" }, // facultatif; on filtre déjà côté client
      };
      const res = await users.list(params);
      setItems(res.member);
    } catch (e: any) {
      console.error(e);
      errorToast("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const clientsOnly = useMemo(() => {
    return items.filter((u) => (u.roles || []).includes("Client"));
  }, [items]);

  const filtered = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    const base = clientsOnly;
    if (!t) return base;
    return base.filter((u) => {
      const code = (u.code || String(u.id)).toLowerCase();
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return code.includes(t) || name.includes(t) || email.includes(t);
    });
  }, [clientsOnly, searchTerm]);

  // Actions
  const onView = (u: User) => setViewingClient(u);

  const onEditOpen = (u: User) => {
    setEditingClient(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      address: u.address || "",
      status: (u.status as any) || "Actif",
      password: "",
      password_confirmation: "",
      role: firstRole(u) || "Client",
    });
    setShowEditPwd(false);
    setShowEditPwd2(false);
  };

  const onEditSave = async () => {
    if (!editingClient) return;

    if (
      editForm.password &&
      editForm.password !== editForm.password_confirmation
    ) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const original = editingClient;
    const payload: any = {};

    const trimOrUndefined = (v?: string | null) => {
      const t = (v ?? "").trim();
      return t === "" ? undefined : t;
    };
    const trimOrNull = (v?: string | null) => {
      const t = (v ?? "").trim();
      return t === "" ? null : t;
    };
    const changed = (a: any, b: any) =>
      JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);

    if (changed(editForm.name, original.name))
      payload.name = trimOrUndefined(editForm.name);
    if (changed(editForm.email, original.email))
      payload.email = trimOrUndefined(editForm.email);
    if (changed(editForm.status, original.status))
      payload.status = editForm.status;

    // ✅ envoyer phone/address même si vidés (null)
    if (changed(editForm.phone, original.phone))
      payload.phone = trimOrNull(editForm.phone);
    if (changed(editForm.address, original.address))
      payload.address = trimOrNull(editForm.address);

    if ((editForm.password || "").trim().length) {
      payload.password = editForm.password;
      payload.password_confirmation = editForm.password_confirmation;
    }

    try {
      if (Object.keys(payload).length === 0) {
        toast({ title: "Info", description: "Aucun changement détecté." });
        return;
      }

      await users.update(original.id, payload);

      // rôle si changé
      const newRole = (editForm.role ?? "Client") as "Client" | "Admin";
      const originalRole =
        ((original.roles || [])[0] as "Client" | "Admin") ?? "Client";
      if (newRole !== originalRole) {
        await users.setRole(original.id, newRole);
      }

      toast({ title: "Succès", description: "Client modifié avec succès" });
      setEditingClient(null);
      await load();
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.errors?.phone?.[0] ||
        e?.response?.data?.errors?.email?.[0] ||
        e?.response?.data?.message ||
        "Erreur lors de la modification";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    }
  };

  const onDelete = async (u: User) => {
    if (!confirm(`Supprimer ${u.name} ?`)) return;
    try {
      await users.remove(u.id);
      success("Client supprimé avec succès");
      await load();
    } catch (e: any) {
      console.error(e);
      errorToast(e?.response?.data?.message || "Suppression impossible");
    }
  };

  const onNewOpen = () => {
    setNewUser({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "Actif",
      password: "",
      password_confirmation: "",
      role: "Client",
    });
    setShowNewPwd(false);
    setShowNewPwd2(false);
    setIsNewClientDialogOpen(true);
  };

  const onNewCreate = async () => {
    if (
      newUser.password &&
      newUser.password !== newUser.password_confirmation
    ) {
      errorToast("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      const payload: any = {
        name: newUser.name,
        email: newUser.email,
        status: newUser.status as any,
        role: newUser.role || "Client",
        // ✅ toujours envoyer phone et address (string ou null)
        phone: (newUser.phone || "").trim() || null,
        address: (newUser.address || "").trim() || null,
      };

      if ((newUser.password || "").trim().length) {
        payload.password = newUser.password;
        payload.password_confirmation = newUser.password_confirmation;
      }

      const created = await users.create(payload);

      // si "Admin" choisi
      const targetRole = (newUser.role ?? "Client") as "Client" | "Admin";
      if (targetRole !== "Client") {
        await users.setRole(created.id, targetRole);
      }

      success("Nouveau client créé avec succès");
      setIsNewClientDialogOpen(false);
      await load();
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.email?.[0] ||
        e?.response?.data?.errors?.phone?.[0] ||
        "Création impossible";
      errorToast(msg);
    }
  };

  const exportCsv = () => {
    const rows = [
      [
        "Code/ID",
        "Nom",
        "Email",
        "Téléphone",
        "Statut",
        "Rôle",
        "Services",
        "Dernière activité",
        "Inscription",
      ],
      ...filtered.map((u) => [
        u.code || u.id,
        u.name || "",
        u.email || "",
        u.phone || "",
        u.status || "",
        (u.roles || [])[0] || "Client",
        u.services_count ?? 0,
        u.last_activity_at
          ? new Date(u.last_activity_at).toLocaleDateString()
          : "",
        u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success("Liste des clients exportée");
  };

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
            <h1 className="text-3xl font-bold mb-2">Gestion des Clients</h1>
            <p className="text-red-100">
              Base de données clients et suivi commercial
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {clientsOnly.filter((u) => u.status === "Actif").length}
              </div>
              <p className="text-sm text-blue-100">Clients Actifs</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {clientsOnly.filter((u) => u.status === "VIP").length}
              </div>
              <p className="text-sm text-purple-100">Clients VIP</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{clientsOnly.length}</div>
              <p className="text-sm text-green-100">Total clients</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-2xl font-bold">—</div>
              <p className="text-sm text-orange-100">Satisfaction (à venir)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Liste des Clients</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Rechercher (code, nom, email)…"
                  className="w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" className="w-full sm:w-auto" disabled>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={exportCsv}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button
                  className="bg-red-900 hover:bg-red-800 w-full sm:w-auto"
                  onClick={onNewOpen}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nouveau Client
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Nom</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Téléphone</th>
                    <th className="text-left p-3">Statut</th>
                    {/* <th className="text-left p-3">Services</th> */}
                    <th className="text-left p-3">Dernière activité</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td className="p-4 text-center" colSpan={9}>
                        Chargement…
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    filtered.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">
                          {u.code || u.id}
                        </td>
                        <td className="p-3 font-medium">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.phone || "—"}</td>
                        <td className="p-3">
                          <Badge className={statusBadge(u.status)}>
                            {u.status || "Inactif"}
                          </Badge>
                        </td>
                        {/* <td className="p-3">{u.services_count ?? 0}</td> */}
                        <td className="p-3">
                          {u.last_activity_at
                            ? new Date(u.last_activity_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Voir"
                              onClick={() => onView(u)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Modifier"
                              onClick={() => onEditOpen(u)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Supprimer"
                              onClick={() => onDelete(u)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun client trouvé
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View */}
      {viewingClient && (
        <Dialog
          open={!!viewingClient}
          onOpenChange={() => setViewingClient(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Profil Client — {viewingClient.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID Client</Label>
                  <p className="font-mono">
                    {viewingClient.code || viewingClient.id}
                  </p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className={statusBadge(viewingClient.status)}>
                    {viewingClient.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom complet</Label>
                  <p>{viewingClient.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p>{viewingClient.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Téléphone</Label>
                  <p>{viewingClient.phone || "—"}</p>
                </div>
                <div>
                  <Label>Adresse</Label>
                  <p>{viewingClient.address || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date d'inscription</Label>
                  <p>
                    {viewingClient.created_at
                      ? new Date(viewingClient.created_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label>Dernière activité</Label>
                  <p>
                    {viewingClient.last_activity_at
                      ? new Date(
                          viewingClient.last_activity_at
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Services utilisés</Label>
                  <p className="font-bold text-blue-600">
                    {viewingClient.services_count ?? 0}
                  </p>
                </div>
                <div>
                  <Label>Rôle</Label>
                  <p>{(viewingClient.roles || [])[0] || "Client"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit */}
      {editingClient && (
        <Dialog
          open={!!editingClient}
          onOpenChange={() => setEditingClient(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le Client</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nom">Nom complet</Label>
                  <Input
                    id="edit-nom"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-telephone">Téléphone</Label>
                  <Input
                    id="edit-telephone"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-statut">Statut</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    id="edit-statut"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        status: e.target.value as any,
                      }))
                    }
                  >
                    <option value="Actif">Actif</option>
                    <option value="VIP">VIP</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Rôle</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    id="edit-role"
                    value={editForm.role || "Client"}
                    onChange={(e) =>
                      setEditForm((s) => ({
                        ...s,
                        role: e.target.value as "Client" | "Admin",
                      }))
                    }
                  >
                    <option value="Client">Client</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  {/* ✅ fix: htmlFor vers edit-address */}
                  <Label htmlFor="edit-address">Adresse</Label>
                  <Input
                    id="edit-address"
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, address: e.target.value }))
                    }
                  />
                </div>
                <div />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showEditPwd ? "text" : "password"}
                      placeholder="Laisser vide pour ne pas changer"
                      value={editForm.password || ""}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, password: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                      onClick={() => setShowEditPwd((v) => !v)}
                      aria-label={showEditPwd ? "Masquer" : "Afficher"}
                    >
                      {showEditPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-password-confirm">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-password-confirm"
                      type={showEditPwd2 ? "text" : "password"}
                      value={editForm.password_confirmation || ""}
                      onChange={(e) =>
                        setEditForm((s) => ({
                          ...s,
                          password_confirmation: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                      onClick={() => setShowEditPwd2((v) => !v)}
                      aria-label={showEditPwd2 ? "Masquer" : "Afficher"}
                    >
                      {showEditPwd2 ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 -mt-2">
                Si vous laissez vide, le mot de passe actuel est conservé.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingClient(null)}>
                Annuler
              </Button>
              <Button
                className="bg-red-900 hover:bg-red-800"
                onClick={onEditSave}
              >
                Sauvegarder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New */}
      <Dialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Client</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-nom">Nom complet</Label>
                <Input
                  id="new-nom"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((s) => ({ ...s, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-telephone">Téléphone</Label>
                <Input
                  id="new-telephone"
                  value={newUser.phone || ""}
                  onChange={(e) =>
                    setNewUser((s) => ({ ...s, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="new-statut">Statut</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  id="new-statut"
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser((s) => ({ ...s, status: e.target.value as any }))
                  }
                >
                  <option value="Actif">Actif</option>
                  <option value="VIP">VIP</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-role">Rôle</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  id="new-role"
                  value={newUser.role || "Client"}
                  onChange={(e) =>
                    setNewUser((s) => ({
                      ...s,
                      role: e.target.value as "Client" | "Admin",
                    }))
                  }
                >
                  <option value="Client">Client</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <Label htmlFor="new-address">Adresse</Label>
                <Input
                  id="new-address"
                  value={newUser.address}
                  onChange={(e) =>
                    setNewUser((s) => ({ ...s, address: e.target.value }))
                  }
                />
              </div>
              <div />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPwd ? "text" : "password"}
                    placeholder="Au moins 8 caractères (optionnel)"
                    value={newUser.password || ""}
                    onChange={(e) =>
                      setNewUser((s) => ({ ...s, password: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                    onClick={() => setShowNewPwd((v) => !v)}
                    aria-label={showNewPwd ? "Masquer" : "Afficher"}
                  >
                    {showNewPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="new-password-confirm">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="new-password-confirm"
                    type={showNewPwd2 ? "text" : "password"}
                    value={newUser.password_confirmation || ""}
                    onChange={(e) =>
                      setNewUser((s) => ({
                        ...s,
                        password_confirmation: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                    onClick={() => setShowNewPwd2((v) => !v)}
                    aria-label={showNewPwd2 ? "Masquer" : "Afficher"}
                  >
                    {showNewPwd2 ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-2">
              Laisser vide pour générer automatiquement un mot de passe côté
              serveur.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsNewClientDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-red-900 hover:bg-red-800"
              onClick={onNewCreate}
            >
              Créer le Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClients;
