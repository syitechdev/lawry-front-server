import { useEffect, useState, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingCart,
  GraduationCap,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shield,
  Bell,
  User,
  CreditCard,
  Rss,
  Briefcase,
  Crown,
  Crop,
  Tags,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";
import { http } from "@/lib/http";
import { can, isSuperAdmin } from "@/lib/rbac";

type RoleName = "Admin" | "Client" | string;

interface CurrentUser {
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
}

interface SidebarProps {
  userRole?: "admin" | "client";
  userName?: string;
  userEmail?: string;
}

interface RequestType {
  id: number;
  name: string;
  slug: string;
  unread_count?: number;
}

type MenuItem = {
  icon: any;
  label: string;
  path: string;
  badge: string | null;
  permission?: string | string[];
  mode?: "any" | "all";
};

const BackofficeSidebar = ({
  userRole,
  userName = "Utilisateur",
  userEmail = "user@email.com",
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<CurrentUser | null>(null);

  const readAuthFromStorage = () => {
    try {
      const token = localStorage.getItem("auth_token");
      const rawUser = localStorage.getItem("current_user");
      setAuthToken(token);
      setAuthUser(rawUser ? JSON.parse(rawUser) : null);
    } catch {
      setAuthUser(null);
    }
  };

  useEffect(() => {
    readAuthFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "current_user")
        readAuthFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const detectedRole: "admin" | "client" = (() => {
    const roles = (authUser?.roles || []).map((r) => String(r).toLowerCase());
    if (
      roles.includes("admin") ||
      roles.includes("super admin") ||
      roles.includes("administrator")
    ) {
      return "admin";
    }
    return "client";
  })();
  const role: "admin" | "client" = userRole ?? detectedRole;

  const displayName = authUser?.name ?? userName;
  const displayEmail = authUser?.email ?? userEmail;
  const displayRoleLabel = role === "admin" ? "Administrateur" : "Client";
  const lastActivityStr = (
    authUser?.last_activity_at
      ? new Date(authUser.last_activity_at)
      : new Date()
  ).toLocaleTimeString();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous êtes maintenant déconnecté.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Déconnexion",
        description: "Votre session a été fermée.",
      });
    } finally {
      navigate("/login?expired=1", { replace: true });
    }
  };

  // ----------------- DYNAMIQUES -----------------
  const [unreadRegs, setUnreadRegs] = useState<number | null>(null);
  const [unreadDemandes, setUnreadDemandes] = useState<number | null>(null);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);

  const fetchUnreadRegistrationsCount = async () => {
    if (role !== "admin") return;
    try {
      const { data } = await http.get("/admin/registrations/unread-count");
      const c = Number(data?.count ?? 0);
      setUnreadRegs(c > 0 ? c : null);
    } catch {
      setUnreadRegs(null);
    }
  };

  const fetchUnreadDemandesCount = async () => {
    if (role !== "admin") return;
    try {
      const { data } = await http.get("/admin/demandes/unread-count");
      const c = Number(data?.unread ?? 0);
      setUnreadDemandes(c > 0 ? c : null);
    } catch {
      setUnreadDemandes(null);
    }
  };

  const fetchRequestTypes = async () => {
    if (role !== "admin") return;
    try {
      const { data } = await http.get("/admin/request-types");
      const list: RequestType[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];
      setRequestTypes(
        list
          .filter((t) => t?.slug && t?.name)
          .map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            unread_count: t.unread_count,
          }))
      );
    } catch {
      setRequestTypes([]);
    }
  };

  useEffect(() => {
    fetchUnreadRegistrationsCount();
    fetchUnreadDemandesCount();
    fetchRequestTypes();
  }, [location.pathname, role, authToken]);

  useEffect(() => {
    const shouldOpen =
      location.pathname.startsWith("/admin/demandes") ||
      location.pathname.startsWith("/admin/types/");
    setOpenDemandes(shouldOpen);
  }, [location.pathname]);

  const adminMenuItems: MenuItem[] = useMemo(
    () => [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/admin",
        badge: null,
      },
      {
        icon: FileText,
        label: "Demandes",
        path: "/admin/demandes",
        badge:
          unreadDemandes !== null && unreadDemandes > 0
            ? String(unreadDemandes)
            : null,
      },
      { icon: Users, label: "Clients", path: "/admin/clients", badge: null },
      {
        icon: ShoppingCart,
        label: "Boutique",
        path: "/admin/boutique",
        badge: null,
      },
      {
        icon: GraduationCap,
        label: "Formations",
        path: "/admin/formations",
        badge: null,
      },
      {
        icon: FileText,
        label: "Formation users",
        path: "/admin/inscriptions",
        badge:
          unreadRegs !== null && unreadRegs > 0 ? String(unreadRegs) : null,
      },
      {
        icon: Briefcase,
        label: "Nos Services",
        path: "/admin/services",
        badge: null,
      },
      {
        icon: Crown,
        label: "Plans & Tarifs",
        path: "/admin/plans",
        badge: null,
      },
      { icon: Rss, label: "Blog", path: "/admin/blog", badge: null },
      {
        icon: Crop,
        label: "Catégories",
        path: "/admin/categories",
        badge: null,
      },
      { icon: Tags, label: "Types", path: "/admin/types", badge: null },
      // ⬇️ Paramètres visible si Admin OU permission rbac.manage
      {
        icon: Settings,
        label: "Paramètres",
        path: "/admin/parametres",
        badge: null,
        permission: "rbac.manage",
      },
    ],
    [unreadRegs, unreadDemandes]
  );

  const clientMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/client", badge: null },
    {
      icon: FileText,
      label: "Mes Commandes",
      path: "/client/commandes",
      badge: "2",
    },
    {
      icon: CreditCard,
      label: "Paiements",
      path: "/client/paiements",
      badge: null,
    },
    {
      icon: ShoppingCart,
      label: "Boutique",
      path: "/client/boutique",
      badge: null,
    },
    {
      icon: Crown,
      label: "Plans & Tarifs",
      path: "/client/plans",
      badge: null,
    },
    { icon: User, label: "Profil", path: "/client/profil", badge: null },
  ];

  const menuItems = role === "admin" ? adminMenuItems : clientMenuItems;

  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter((it) =>
        it.permission
          ? isSuperAdmin() ||
            can(it.permission as string | string[], it.mode || "any")
          : true
      ),
    [menuItems]
  );

  const isActiveLink = (path: string) => location.pathname === path;

  const [openTypes, setOpenTypes] = useState<boolean>(
    () =>
      location.pathname.startsWith("/admin/types-entreprise") ||
      location.pathname === "/admin/types"
  );

  const [openDemandes, setOpenDemandes] = useState<boolean>(
    () =>
      location.pathname.startsWith("/admin/demandes") ||
      location.pathname.startsWith("/admin/types/")
  );

  const themeColors =
    role === "admin"
      ? {
          primary: "bg-gradient-to-br from-red-900 via-red-800 to-red-900",
          secondary: "bg-red-100 text-red-800 border-red-200",
          accent: "bg-red-50 text-red-900",
          hover: "hover:bg-red-100",
          activeLink:
            "bg-gradient-to-r from-red-100 to-red-50 text-red-900 border-r-4 border-red-800 shadow-sm",
          normalLink: "text-gray-700 hover:bg-red-50 hover:text-red-800",
        }
      : {
          primary: "bg-gradient-to-br from-red-700 via-red-600 to-red-700",
          secondary: "bg-red-100 text-red-700 border-red-200",
          accent: "bg-red-50 text-red-800",
          hover: "hover:bg-red-50",
          activeLink:
            "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-r-4 border-red-600 shadow-sm",
          normalLink: "text-gray-700 hover:bg-red-50 hover:text-red-700",
        };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? "w-20" : "w-80"
      }`}
    >
      {/* Header */}
      <div
        className={`p-6 ${themeColors.primary} text-white relative overflow-hidden flex-shrink-0`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  {role === "admin" ? (
                    <Shield className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{displayName}</p>
                  <p className="text-sm text-white/80 capitalize">
                    {displayRoleLabel}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:bg-white/20 p-2 rounded-full"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {!isCollapsed && (
            <div className="mt-4 text-sm text-white/70">
              <p>{displayEmail}</p>
              <p className="mt-1">Connecté • {lastActivityStr}</p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {!isCollapsed && (
        <div className="p-4 flex-shrink-0">
          <Card className={`${themeColors.secondary} border-2`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-full">
                  <Bell className="h-4 w-4 text-red-800" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {role === "admin"
                      ? "Dossiers à traiter"
                      : "2 nouveaux messages"}
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    {role === "admin"
                      ? "Surveillez aussi les nouvelles inscriptions"
                      : "De votre juriste conseil"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Menu */}
      <ScrollArea className="flex-1 px-4">
        <nav className="pb-4">
          <div className="space-y-2">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon as any;

              // "Demandes" (sous-menu)
              if (role === "admin" && item.label === "Demandes") {
                const activeParent =
                  location.pathname.startsWith("/admin/demandes") ||
                  location.pathname.startsWith("/admin/types/");

                const parentBadge = item.badge;

                return (
                  <div key={`demandes-${index}`} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCollapsed) setIsCollapsed(false);
                        setOpenDemandes((v) => !v);
                      }}
                      className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        activeParent
                          ? themeColors.activeLink
                          : themeColors.normalLink
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          activeParent
                            ? "bg-white shadow-sm"
                            : "group-hover:bg-red-100"
                        }`}
                      >
                        <FileText
                          className={`h-5 w-5 ${
                            activeParent ? "text-red-800" : ""
                          }`}
                        />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="font-semibold text-sm ml-3">
                            Demandes
                          </span>
                          <div className="ml-auto flex items-center gap-2">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                openDemandes ? "rotate-180" : ""
                              }`}
                            />
                            {parentBadge && (
                              <Badge
                                variant="secondary"
                                className="bg-red-800 text-white text-xs px-2"
                              >
                                {parentBadge}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </button>

                    {!isCollapsed && openDemandes && (
                      <div className="ml-12 mt-1 space-y-1">
                        <Link
                          to="/admin/demandes"
                          className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            location.pathname === "/admin/demandes"
                              ? "bg-red-50 text-red-800"
                              : "text-gray-700 hover:bg-red-50 hover:text-red-800"
                          }`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Liste demandes</span>
                          {parentBadge && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-red-800 text-white text-[10px] px-1.5"
                            >
                              {parentBadge}
                            </Badge>
                          )}
                        </Link>

                        {requestTypes.map((t) => {
                          const derivedSlug = (t.slug || t.name || "")
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/\p{Diacritic}/gu, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "");

                          const href = `/admin/types/${encodeURIComponent(
                            derivedSlug
                          )}`;

                          return (
                            <NavLink
                              key={derivedSlug}
                              to={href}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? "bg-red-50 text-red-800"
                                    : "text-gray-700 hover:bg-red-50 hover:text-red-800"
                                }`
                              }
                            >
                              <Tags className="h-4 w-4 mr-2" />
                              <span className="truncate">{t.name}</span>

                              {typeof t.unread_count === "number" &&
                                t.unread_count > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-auto bg-red-800 text-white text-[10px] px-1.5"
                                  >
                                    {t.unread_count}
                                  </Badge>
                                )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // "Types" (sous-menu)
              if (role === "admin" && item.label === "Types") {
                const activeParent =
                  location.pathname.startsWith("/admin/types-entreprise") ||
                  location.pathname === "/admin/types";

                return (
                  <div key={`types-${index}`} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCollapsed) setIsCollapsed(false);
                        setOpenTypes((v) => !v);
                      }}
                      className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        activeParent
                          ? themeColors.activeLink
                          : themeColors.normalLink
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          activeParent
                            ? "bg-white shadow-sm"
                            : "group-hover:bg-red-100"
                        }`}
                      >
                        <Tags
                          className={`h-5 w-5 ${
                            activeParent ? "text-red-800" : ""
                          }`}
                        />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="font-semibold text-sm">
                            Entreprise
                          </span>
                          <ChevronDown
                            className={`h-4 flex-1 w-4 transition-transform ${
                              openTypes ? "rotate-180" : ""
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {!isCollapsed && openTypes && (
                      <div className="ml-12 mt-1 space-y-1">
                        <Link
                          to="/admin/types-entreprise"
                          className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            location.pathname.startsWith(
                              "/admin/types-entreprise"
                            )
                              ? "bg-red-50 text-red-800"
                              : "text-gray-700 hover:bg-red-50 hover:text-red-800"
                          }`}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          <span>Types d’entreprise</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              // Liens standards
              const active = isActiveLink(item.path);
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active ? themeColors.activeLink : themeColors.normalLink
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      active ? "bg-white shadow-sm" : "group-hover:bg-red-100"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${active ? "text-red-800" : ""}`}
                    />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="font-semibold text-sm flex-1">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-red-800 text-white text-xs px-2"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        {!isCollapsed && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Connexion sécurisée
              </span>
              <Shield className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-500">
              Session active depuis {lastActivityStr}
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={`w-full ${themeColors.hover} text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 transition-all duration-200`}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isCollapsed && <span className="font-medium">Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
};

export default BackofficeSidebar;
