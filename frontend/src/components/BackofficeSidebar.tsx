import { useEffect, useMemo, useState } from "react";
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
  BookCheck,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";
import {
  listRequestTypes,
  getUnreadDemandesCount,
  getUnreadRegistrationsCount,
  AdminRequestType,
} from "@/services/adminRequestTypes";
import {
  dedupeBySlug,
  sortTypes,
  labelForRequestType,
  pathForRequestType,
} from "@/services/requestTypeRegistry";
import { getContactStats } from "@/services/contacts";
import { http } from "@/lib/http"; // <-- pour stats Conseil Gratuit

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
  const [unreadContacts, setUnreadContacts] = useState<number | null>(null);
  const [unreadConseils, setUnreadConseils] = useState<number | null>(null); // <-- NEW

  // --- Auth local
  const [authUser, setAuthUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("current_user");
      setAuthUser(rawUser ? JSON.parse(rawUser) : null);
    } catch {
      setAuthUser(null);
    }
  }, []);

  const role: "admin" | "client" =
    userRole ??
    (() => {
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

  const [unreadRegs, setUnreadRegs] = useState<number | null>(null);
  const [unreadDemandes, setUnreadDemandes] = useState<number | null>(null);
  const [requestTypes, setRequestTypes] = useState<AdminRequestType[]>([]);

  const loadCounters = async () => {
    if (role !== "admin") return;
    try {
      const [reg, dem] = await Promise.all([
        getUnreadRegistrationsCount().catch(() => null),
        getUnreadDemandesCount().catch(() => null),
      ]);
      setUnreadRegs(reg && reg > 0 ? reg : null);
      setUnreadDemandes(dem && dem > 0 ? dem : null);
    } catch {
      setUnreadRegs(null);
      setUnreadDemandes(null);
    }
  };

  const loadRequestTypes = async () => {
    if (role !== "admin") return;
    try {
      const list = await listRequestTypes();
      setRequestTypes(list);
    } catch {
      setRequestTypes([]);
    }
  };

  // Charger stats Contacts + Conseil Gratuit
  const loadContactLikeStats = async () => {
    if (role !== "admin") return;
    try {
      const [cStats, cgStats] = await Promise.all([
        getContactStats().catch(() => ({ unread: 0 })),
        http
          .get("/admin/conseils-gratuits/stats")
          .then((r) => r.data)
          .catch(() => ({ unread: 0 })),
      ]);
      setUnreadContacts(
        typeof cStats?.unread === "number" && cStats.unread > 0
          ? cStats.unread
          : null
      );
      setUnreadConseils(
        typeof cgStats?.unread === "number" && cgStats.unread > 0
          ? cgStats.unread
          : null
      );
    } catch {
      setUnreadContacts(null);
      setUnreadConseils(null);
    }
  };

  useEffect(() => {
    loadCounters();
    loadRequestTypes();
    loadContactLikeStats();
  }, [location.pathname, role]);

  const requestTypeLinks = useMemo(() => {
    const clean = dedupeBySlug(requestTypes);
    return sortTypes(clean);
  }, [requestTypes]);

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

  const [openContactsGroup, setOpenContactsGroup] = useState<boolean>( // <-- NEW
    () =>
      location.pathname.startsWith("/admin/contacts") ||
      location.pathname.startsWith("/admin/newsletter") ||
      location.pathname.startsWith("/admin/conseils-gratuits")
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bo_sidebar_open");
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v?.dem === "boolean") setOpenDemandes(v.dem);
        if (typeof v?.typ === "boolean") setOpenTypes(v.typ);
        if (typeof v?.cnt === "boolean") setOpenContactsGroup(v.cnt); // <-- NEW
      }
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "bo_sidebar_open",
      JSON.stringify({
        dem: openDemandes,
        typ: openTypes,
        cnt: openContactsGroup,
      })
    );
  }, [openDemandes, openTypes, openContactsGroup]);
  const themeColors =
    role === "admin"
      ? {
          primary: "bg-gradient-to-br from-red-900 via-red-800 to-red-900",
          secondary: "bg-red-100 text-red-800 border-red-200",
          hover: "hover:bg-red-100",
          activeLink:
            "bg-gradient-to-r from-red-100 to-red-50 text-red-900 border-r-4 border-red-800 shadow-sm",
          normalLink: "text-gray-700 hover:bg-red-50 hover:text-red-800",
        }
      : {
          primary: "bg-gradient-to-br from-blue-900 to-blue-800",
          secondary: "bg-blue-100 text-blue-800 border-blue-200",
          hover: "hover:bg-blue-50",
          activeLink:
            "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-r-4 border-blue-600 shadow-sm",
          normalLink: "text-gray-700 hover:bg-blue-50 hover:text-blue-800",
        };

  // --- Somme badge parent Contacts = unreadContacts + unreadConseils
  const contactsParentBadge = useMemo(() => {
    const a = unreadContacts ?? 0;
    const b = unreadConseils ?? 0;
    const sum = a + b;
    return sum > 0 ? String(sum) : null;
  }, [unreadContacts, unreadConseils]);

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

      {
        icon: BookCheck,
        label: "Contacts",
        path: "#", // le parent n’a pas de page dédiée
        badge: contactsParentBadge,
      },

      {
        icon: Settings,
        label: "Paramètres",
        path: "/admin/parametres",
        badge: null,
      },
    ],
    [unreadRegs, unreadDemandes, contactsParentBadge]
  );

  const clientMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/client", badge: null },
    {
      icon: FileText,
      label: "Mes Commandes",
      path: "/client/commandes",
      badge: null,
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

  const isActiveLink = (path: string) => location.pathname === path;

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
            {menuItems.map((item, index) => {
              // Groupe "Demandes"
              if (role === "admin" && item.label === "Demandes") {
                const activeParent =
                  location.pathname.startsWith("/admin/demandes") ||
                  location.pathname.startsWith("/admin/types/");
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
                        className={`p-2 rounded-lg ${
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
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="bg-red-800 text-white text-xs px-2"
                              >
                                {item.badge}
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
                          {item.badge && (
                            <Badge className="ml-auto bg-red-800 text-white text-[10px] px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>

                        {/* Liens par type (pinnés + triés) */}
                        {requestTypeLinks.map((t) => {
                          const href = pathForRequestType(t);
                          const label = labelForRequestType(t);
                          return (
                            <NavLink
                              key={t.slug}
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
                              <span className="truncate">{label}</span>
                              {typeof t.unread_count === "number" &&
                                t.unread_count > 0 && (
                                  <Badge className="ml-auto bg-red-800 text-white text-[10px] px-1.5">
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

              // Groupe "Contacts" (parent + enfants)
              if (role === "admin" && item.label === "Contacts") {
                const activeParent =
                  location.pathname.startsWith("/admin/contacts") ||
                  location.pathname.startsWith("/admin/newsletter") ||
                  location.pathname.startsWith("/admin/conseils-gratuits");

                return (
                  <div key={`contacts-${index}`} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCollapsed) setIsCollapsed(false);
                        setOpenContactsGroup((v) => !v);
                      }}
                      className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                        activeParent
                          ? themeColors.activeLink
                          : themeColors.normalLink
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
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
                          <span className="font-semibold text-sm ml-3">
                            Contacts
                          </span>
                          <div className="ml-auto flex items-center gap-2">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                openContactsGroup ? "rotate-180" : ""
                              }`}
                            />
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="bg-red-800 text-white text-xs px-2"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </button>

                    {!isCollapsed && openContactsGroup && (
                      <div className="ml-12 mt-1 space-y-1">
                        {/* Enfant: Contacts */}
                        <NavLink
                          to="/admin/contacts"
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-red-50 text-red-800"
                                : "text-gray-700 hover:bg-red-50 hover:text-red-800"
                            }`
                          }
                        >
                          <BookCheck className="h-4 w-4 mr-2" />
                          <span>Contacts</span>
                          {unreadContacts !== null && unreadContacts > 0 && (
                            <Badge className="ml-auto bg-red-800 text-white text-[10px] px-1.5">
                              {unreadContacts}
                            </Badge>
                          )}
                        </NavLink>

                        <NavLink
                          to="/admin/conseils-gratuits"
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-red-50 text-red-800"
                                : "text-gray-700 hover:bg-red-50 hover:text-red-800"
                            }`
                          }
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          <span>Conseil Gratuit</span>
                          {unreadConseils !== null && unreadConseils > 0 && (
                            <Badge className="ml-auto bg-red-800 text-white text-[10px] px-1.5">
                              {unreadConseils}
                            </Badge>
                          )}
                        </NavLink>

                        <NavLink
                          to="/admin/newsletter"
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-red-50 text-red-800"
                                : "text-gray-700 hover:bg-red-50 hover:text-red-800"
                            }`
                          }
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          <span>Newsletter</span>
                        </NavLink>
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
                    className={`p-2 rounded-lg ${
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
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
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
