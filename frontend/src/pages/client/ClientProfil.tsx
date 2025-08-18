import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";

type RoleName = "Admin" | "Client" | string;

type CurrentUser = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status?: string;
  services_count?: number;
  last_activity_at?: string;
  roles?: RoleName[];
  created_at?: string;
  updated_at?: string;
};

const ClientProfil = () => {
  const [authUser, setAuthUser] = useState<CurrentUser | null>(null);

  const readAuthFromStorage = () => {
    try {
      const rawUser = localStorage.getItem("current_user");
      if (rawUser) {
        setAuthUser(JSON.parse(rawUser));
      } else {
        setAuthUser(null);
      }
    } catch {
      setAuthUser(null);
    }
  };

  useEffect(() => {
    readAuthFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "current_user" || e.key === "auth_token") {
        readAuthFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Fallbacks d’affichage
  const displayName = authUser?.name ?? "Utilisateur";
  const displayEmail = authUser?.email ?? "user@email.com";
  const displayPhone = authUser?.phone ?? "—";
  const displayAddress = authUser?.address ?? "—";
  const displayCode = authUser?.code ?? "—";
  const status = authUser?.status ?? "—";

  const lastActivity = authUser?.last_activity_at
    ? new Date(authUser.last_activity_at)
    : null;
  const createdAt = authUser?.created_at ? new Date(authUser.created_at) : null;

  const lastActivityStr = lastActivity ? lastActivity.toLocaleString() : "—";
  const createdAtStr = createdAt ? createdAt.toLocaleDateString() : "—";

  const roleIsClient = (authUser?.roles || [])
    .map((r) => String(r).toLowerCase())
    .includes("client");
  // On laisse BackofficeSidebar auto-détecter le rôle via current_user (pas besoin de props)
  // Mais si tu veux forcer "client" : <BackofficeSidebar userRole="client" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
            <p className="text-red-100">
              Gérer vos informations personnelles et sécurité
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mon Profil & Sécurité</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h4 className="font-semibold mb-2">Informations personnelles</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Nom complet</label>
                  <p className="font-medium">{displayName}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{displayEmail}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Téléphone</label>
                  <p className="font-medium">{displayPhone}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Adresse</label>
                  <p className="font-medium">{displayAddress}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Code client</label>
                  <p className="font-medium">{displayCode}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div>
                    <label className="text-sm text-gray-600">Statut</label>
                    <div className="mt-1">
                      {status !== "—" ? (
                        <Badge
                          className={
                            status.toLowerCase() === "actif"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {status}
                        </Badge>
                      ) : (
                        <span className="font-medium">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">
                    Dernière activité
                  </label>
                  <p className="font-medium">{lastActivityStr}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Membre depuis</label>
                  <p className="font-medium">{createdAtStr}</p>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div>
              <h4 className="font-semibold mb-2">Sécurité</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // on branchera plus tard : soit modal, soit route dédiée
                    // Exemple de route : navigate("/client/profil/mot-de-passe")
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    // Placeholder pour activer 2FA plus tard
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Authentification 2FA
                </Button>
              </div>

              {!roleIsClient && (
                <p className="text-xs text-amber-700 mt-3">
                  ⚠️ Ce compte n’est pas marqué avec le rôle <b>Client</b> dans{" "}
                  <code>current_user.roles</code>.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfil;
