import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BackofficeSidebar from "@/components/BackofficeSidebar";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  listRoles,
  listPermissionGroups,
  createRole,
  renameRole,
  deleteRole,
  syncRolePermissions,
  type RbacRole,
  type PermissionGroup,
} from "@/services/rbac";
import { can, isSuperAdmin } from "@/lib/rbac";
import {
  Shield,
  KeyRound,
  Plus,
  Save,
  Copy,
  Edit2,
  Trash2,
  Search,
  Lock,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const AdminParametres = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  // Accès : Admin ou rbac.manage
  const allowed = isSuperAdmin() || can("rbac.manage");

  // Sélections & filtres
  const [searchRole, setSearchRole] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [permFilter, setPermFilter] = useState("");

  // Chargement des données
  const rolesQ = useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: listRoles,
    enabled: allowed,
  });
  const permsQ = useQuery({
    queryKey: ["rbac", "permissions"],
    queryFn: listPermissionGroups,
    enabled: allowed,
  });

  // Rôle sélectionné
  const selectedRole: RbacRole | null = useMemo(() => {
    const list = rolesQ.data || [];
    const found = list.find((r) => r.id === selectedRoleId) || null;
    return found || (list.length ? list[0] : null);
  }, [rolesQ.data, selectedRoleId]);

  // Init sélection au premier load
  useEffect(() => {
    if (!selectedRoleId && rolesQ.data?.length) {
      setSelectedRoleId(rolesQ.data[0].id);
    }
  }, [rolesQ.data, selectedRoleId]);

  // Permissions cochées (local)
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);

  // Hydrate à chaque changement de rôle
  useEffect(() => {
    if (!selectedRole) return;
    const initial = new Set(selectedRole.permissions || []);
    setChecked(initial);
    setDirty(false);
  }, [selectedRole?.id]);

  // Mutations
  const createM = useMutation({
    mutationFn: (p: { name: string; clone_from?: number | null }) =>
      createRole(p),
    onSuccess: (role) => {
      toast({
        title: "Rôle créé",
        description: `« ${role.name} » a été créé.`,
      });
      qc.invalidateQueries({ queryKey: ["rbac", "roles"] });
      setSelectedRoleId(role.id);
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: "Création impossible",
        description: e?.response?.data?.message ?? "Erreur serveur",
      }),
  });

  const renameM = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      renameRole(id, name),
    onSuccess: (role) => {
      toast({
        title: "Rôle renommé",
        description: `Nouveau nom : « ${role.name} ».`,
      });
      qc.invalidateQueries({ queryKey: ["rbac", "roles"] });
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: "Renommage impossible",
        description: e?.response?.data?.message ?? "Erreur serveur",
      }),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      toast({ title: "Rôle supprimé" });
      qc.invalidateQueries({ queryKey: ["rbac", "roles"] });
      setSelectedRoleId(null);
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: "Suppression impossible",
        description: e?.response?.data?.message ?? "Erreur serveur",
      }),
  });

  const syncM = useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      syncRolePermissions(id, permissions),
    onSuccess: ({ permissions }) => {
      toast({
        title: "Permissions enregistrées",
        description: `${permissions.length} droits appliqués.`,
      });
      qc.invalidateQueries({ queryKey: ["rbac", "roles"] });
      setDirty(false);
    },
    onError: (e: any) =>
      toast({
        variant: "destructive",
        title: "Enregistrement impossible",
        description: e?.response?.data?.message ?? "Erreur serveur",
      }),
  });

  // UI helpers
  const toggle = (perm: string, on: boolean) => {
    setChecked((prev) => {
      const n = new Set(prev);
      if (on) n.add(perm);
      else n.delete(perm);
      return n;
    });
    setDirty(true);
  };

  const setAll = (perms: string[], on: boolean) => {
    setChecked((prev) => {
      const n = new Set(prev);
      perms.forEach((p) => (on ? n.add(p) : n.delete(p)));
      return n;
    });
    setDirty(true);
  };

  const filteredRoles = useMemo(() => {
    const q = searchRole.trim().toLowerCase();
    const list = rolesQ.data || [];
    if (!q) return list;
    return list.filter((r) => r.name.toLowerCase().includes(q));
  }, [rolesQ.data, searchRole]);

  const filteredGroups = useMemo(() => {
    const groups = permsQ.data || [];
    const q = permFilter.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.action.toLowerCase().includes(q) ||
            it.label.toLowerCase().includes(q) ||
            g.label.toLowerCase().includes(q) ||
            g.group.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [permsQ.data, permFilter]);

  const isSystemRole = (r?: RbacRole | null) =>
    !!r?.is_system ||
    ["admin", "client"].includes((r?.name || "").toLowerCase());

  // Accès refusé
  if (!allowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
        <BackofficeSidebar userRole="admin" />
        <div className="ml-80 px-8 py-8">
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
              <h1 className="text-3xl font-bold mb-2">Paramètres & Sécurité</h1>
              <p className="text-red-100">Accès refusé</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Autorisation manquante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Vous devez avoir le rôle Admin ou la permission{" "}
                <code>rbac.manage</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const reload = () => {
    qc.invalidateQueries({ queryKey: ["rbac", "roles"] });
    qc.invalidateQueries({ queryKey: ["rbac", "permissions"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="admin" />
      <div className="ml-80 px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Paramètres & Sécurité</h1>
              <p className="text-red-100">Gestion des rôles & permissions</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/15 text-white border border-white/20">
                RBAC
              </Badge>
              <Button
                variant="outline"
                onClick={reload}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger
              </Button>
            </div>
          </div>
        </div>

        {/* Erreurs API globales */}
        {(rolesQ.isError || permsQ.isError) && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Impossible de charger {rolesQ.isError ? "les rôles" : ""}
              {rolesQ.isError && permsQ.isError ? " et " : ""}
              {permsQ.isError ? "les permissions" : ""}. Vérifie les routes RBAC
              et les tables Spatie.
            </p>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Colonne rôles */}
          <div className="col-span-12 xl:col-span-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rôles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Barre d’actions */}
                <div className="flex gap-2 items-center mb-4">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                    <Input
                      placeholder="Rechercher un rôle…"
                      className="pl-9"
                      value={searchRole}
                      onChange={(e) => setSearchRole(e.target.value)}
                    />
                  </div>

                  {/* Nouveau rôle */}
                  <NewRoleButton
                    roles={rolesQ.data || []}
                    onCreate={(name, cloneFrom) =>
                      createM.mutate({ name, clone_from: cloneFrom })
                    }
                    loading={createM.isPending}
                  />
                </div>

                {/* Liste */}
                <div className="space-y-2">
                  {(filteredRoles || []).map((r) => {
                    const active = r.id === selectedRole?.id;
                    return (
                      <div
                        key={r.id}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                          active
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <button
                          onClick={() => setSelectedRoleId(r.id)}
                          className="text-left flex items-center gap-2 flex-1"
                        >
                          <span className="font-medium">{r.name}</span>
                          {isSystemRole(r) && (
                            <Badge variant="secondary" className="text-xs">
                              Système
                            </Badge>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Renommer */}
                          <RenameRoleButton
                            role={r}
                            disabled={r.name.toLowerCase() === "admin"} // tu peux enlever si tu veux renommer Admin
                            onRename={(name) =>
                              renameM.mutate({ id: r.id, name })
                            }
                            loading={renameM.isPending}
                          />
                          {/* Dupliquer */}
                          <DuplicateRoleButton
                            role={r}
                            onDuplicate={() =>
                              createM.mutate({
                                name: `${r.name} (copie)`,
                                clone_from: r.id,
                              })
                            }
                            loading={createM.isPending}
                          />
                          {/* Supprimer */}
                          <DeleteRoleButton
                            role={r}
                            disabled={isSystemRole(r)}
                            onDelete={() => deleteM.mutate(r.id)}
                            loading={deleteM.isPending}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {rolesQ.isLoading && (
                    <p className="text-sm text-gray-500">
                      Chargement des rôles…
                    </p>
                  )}
                  {!rolesQ.isLoading && (filteredRoles || []).length === 0 && (
                    <p className="text-sm text-gray-500">Aucun rôle</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne permissions */}
          <div className="col-span-12 xl:col-span-8">
            <Card className="shadow-md">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  {selectedRole
                    ? `Permissions : ${selectedRole.name}`
                    : "Permissions"}
                </CardTitle>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                    <Input
                      placeholder="Rechercher une permission…"
                      className="pl-9 w-72"
                      value={permFilter}
                      onChange={(e) => setPermFilter(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setAll(
                        (permsQ.data || []).flatMap((g) =>
                          g.items.map((i) => i.name)
                        ),
                        true
                      )
                    }
                    disabled={!selectedRole}
                  >
                    Tout cocher
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setAll(
                        (permsQ.data || []).flatMap((g) =>
                          g.items.map((i) => i.name)
                        ),
                        false
                      )
                    }
                    disabled={!selectedRole}
                  >
                    Tout décocher
                  </Button>
                  <Button
                    onClick={() =>
                      selectedRole &&
                      syncM.mutate({
                        id: selectedRole.id,
                        permissions: Array.from(checked),
                      })
                    }
                    disabled={!dirty || !selectedRole}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Note admin (pure info, pas bloquante) */}
                {selectedRole?.name.toLowerCase() === "admin" && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm">
                      Le rôle <strong>Admin</strong> est super-utilisateur, mais
                      vous pouvez quand même ajuster ses permissions si
                      nécessaire.
                    </p>
                  </div>
                )}

                {permsQ.isLoading && (
                  <p className="text-sm text-gray-500">
                    Chargement des permissions…
                  </p>
                )}

                {!permsQ.isLoading && filteredGroups.length === 0 && (
                  <p className="text-sm text-gray-500">Aucune permission.</p>
                )}

                <Accordion type="multiple" className="w-full">
                  {filteredGroups.map((group) => {
                    const names = group.items.map((it) => it.name);
                    const allOn = names.every((n) => checked.has(n));
                    return (
                      <AccordionItem key={group.group} value={group.group}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{group.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {group.items.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="mb-3 flex items-center gap-2">
                            <Switch
                              checked={allOn}
                              onCheckedChange={(v) => setAll(names, !!v)}
                              disabled={!selectedRole}
                            />
                            <span className="text-sm text-gray-600">
                              Tout {allOn ? "désactiver" : "activer"} pour{" "}
                              {group.label}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-2">
                            {group.items.map((it) => {
                              const on = checked.has(it.name);
                              return (
                                <label
                                  key={it.name}
                                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                    on
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-200 bg-white"
                                  }`}
                                  title={it.name}
                                >
                                  <div>
                                    <div className="font-medium">
                                      {it.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {it.name}
                                    </div>
                                  </div>
                                  <Switch
                                    checked={on}
                                    onCheckedChange={(v) =>
                                      toggle(it.name, !!v)
                                    }
                                    disabled={!selectedRole}
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Sous-composants UI (CRUD rôles) */

function NewRoleButton({
  roles,
  onCreate,
  loading,
}: {
  roles: RbacRole[];
  onCreate: (name: string, clone_from?: number | null) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cloneId, setCloneId] = useState<number | "">("");

  const valid = name.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Nouveau rôle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau rôle</DialogTitle>
          <DialogDescription>
            Créer un rôle et (optionnel) cloner les permissions d’un rôle
            existant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Nom</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Manager"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Cloner depuis</label>
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={cloneId}
              onChange={(e) =>
                setCloneId(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">— Aucun —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (!valid || loading) return;
              onCreate(name.trim(), cloneId === "" ? undefined : cloneId);
              setOpen(false);
              setName("");
              setCloneId("");
            }}
            disabled={!valid || loading}
          >
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenameRoleButton({
  role,
  onRename,
  loading,
  disabled,
}: {
  role: RbacRole;
  onRename: (name: string) => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(role.name);

  useEffect(() => setName(role.name), [role.name]);

  const valid = name.trim().length >= 2 && name.trim() !== role.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled} title="Renommer">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renommer le rôle</DialogTitle>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <DialogFooter>
          <Button
            onClick={() => {
              if (!valid || loading) return;
              onRename(name.trim());
              setOpen(false);
            }}
            disabled={!valid || loading}
          >
            Renommer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DuplicateRoleButton({
  role,
  onDuplicate,
  loading,
}: {
  role: RbacRole;
  onDuplicate: () => void;
  loading?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onDuplicate}
      disabled={loading}
      title="Dupliquer"
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}

function DeleteRoleButton({
  role,
  onDelete,
  loading,
  disabled,
}: {
  role: RbacRole;
  onDelete: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled} title="Supprimer">
          <Trash2 className="h-4 w-4 text-red-700" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Supprimer « {role.name} » ?</AlertDialogTitle>
        <AlertDialogDescription>
          Cette action est irréversible. Les utilisateurs perdront les
          permissions associées à ce rôle.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-700 hover:bg-red-800"
            onClick={onDelete}
            disabled={loading}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AdminParametres;
