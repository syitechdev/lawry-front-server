import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, FileText, Users, ShoppingCart,
  GraduationCap, Settings, LogOut, ChevronLeft,
  ChevronRight, Shield, Bell, User, CreditCard, Rss, Briefcase, Crown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

interface SidebarProps {
  userRole: "admin" | "client";
  userName?: string;
  userEmail?: string;
}

const BackofficeSidebar = ({
  userRole,
  userName = "Utilisateur",
  userEmail = "user@email.com",
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "Vous êtes maintenant déconnecté.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Déconnexion",
        description: "Votre session a été fermée.",
      });
    } finally {
      navigate("/login?expired=1", { replace: true });
    }
  };

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin", badge: null },
    { icon: FileText, label: "Demandes", path: "/admin/demandes", badge: "5" },
    { icon: Users, label: "Clients", path: "/admin/clients", badge: null },
    { icon: ShoppingCart, label: "Boutique", path: "/admin/boutique", badge: null },
    { icon: GraduationCap, label: "Formations", path: "/admin/formations", badge: null },
    { icon: Briefcase, label: "Nos Services", path: "/admin/services", badge: null },
    { icon: Crown, label: "Plans & Tarifs", path: "/admin/plans", badge: null },
    { icon: Rss, label: "Blog", path: "/admin/blog", badge: null },
    { icon: Settings, label: "Paramètres", path: "/admin/parametres", badge: null },
  ];

  const clientMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/client", badge: null },
    { icon: FileText, label: "Mes Commandes", path: "/client/commandes", badge: "2" },
    { icon: CreditCard, label: "Paiements", path: "/client/paiements", badge: null },
    { icon: ShoppingCart, label: "Boutique", path: "/client/boutique", badge: null },
    { icon: Crown, label: "Plans & Tarifs", path: "/client/plans", badge: null },
    { icon: User, label: "Profil", path: "/client/profil", badge: null },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : clientMenuItems;

  const isActiveLink = (path: string) => location.pathname === path;

  const themeColors =
    userRole === "admin"
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
                  {userRole === "admin" ? (
                    <Shield className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{userName}</p>
                  <p className="text-sm text-white/80 capitalize">
                    {userRole === "admin" ? "Administrateur" : "Client Premium"}
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
              <p>{userEmail}</p>
              <p className="mt-1">Connecté • {new Date().toLocaleTimeString()}</p>
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
                    {userRole === "admin" ? "5 dossiers urgents" : "2 nouveaux messages"}
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    {userRole === "admin"
                      ? "Nécessitent votre attention immédiate"
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
              const Icon = item.icon;
              const isActive = isActiveLink(item.path);

              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive ? themeColors.activeLink : themeColors.normalLink
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive ? "bg-white shadow-sm" : "group-hover:bg-red-100"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-red-800" : ""}`}
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
              Session active depuis {new Date().toLocaleTimeString()}
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
