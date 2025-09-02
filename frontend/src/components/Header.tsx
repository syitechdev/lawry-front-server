import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Menu,
  X,
  Smartphone,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

type RoleName = "Admin" | "Client" | string;
type CurrentUser = {
  id: number;
  roles?: RoleName[];
  name?: string;
  email?: string;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<CurrentUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effet scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lecture auth + sync storage
  const readAuth = () => {
    try {
      setAuthToken(localStorage.getItem("auth_token"));
      const raw = localStorage.getItem("current_user");
      setAuthUser(raw ? JSON.parse(raw) : null);
    } catch {
      setAuthUser(null);
    }
  };
  useEffect(() => {
    readAuth();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "current_user") readAuth();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAuthenticated = !!authToken && !!authUser?.id;
  const roles = (authUser?.roles || []).map((r) => String(r).toLowerCase());
  const isAdmin =
    roles.includes("admin") ||
    roles.includes("administrator") ||
    roles.includes("super admin");
  const dashboardPath = isAdmin ? "/admin" : "/client";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await logout(); // suppose efface le token côté API/session
    } catch {
      // on continue, on force le clean côté client
    } finally {
      // Sécurise aussi côté client
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_user");
      setAuthToken(null);
      setAuthUser(null);

      toast({
        title: "Déconnexion",
        description: "Votre session a été fermée.",
      });

      navigate("/login?expired=1", { replace: true });
      setIsLoggingOut(false);
    }
  };

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "À propos", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Formation", href: "/formation" },
    { name: "Boutique", href: "/boutique" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {/* <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-red-900" />
            <span className="text-base sm:text-xl font-bold text-gray-900 truncate">
              Lawry Conseils CI
            </span> */}
            <img
              src="/lovable-uploads/58eeab48-482f-4e0a-ba88-27030b1aab79.png"
              alt="LAWRY Logo"
              className="h-11 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-red-900 ${
                  location.pathname === item.href
                    ? "text-red-900"
                    : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50 text-xs"
              asChild
            >
              <Link to="/chatbot?section=app-download">
                <Smartphone className="h-3 w-3 mr-1" />
                App Mobile
              </Link>
            </Button>
            <Button
              asChild
              className="bg-red-900 hover:bg-red-800 text-xs px-3"
            >
              <Link to="/chatbot">Assistant IA</Link>
            </Button>

            {/* Connexion / Menu utilisateur (desktop) */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    title={authUser?.name || "Mon espace"}
                    aria-label="Mon espace"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={dashboardPath} className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Tableau de bord
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    className="text-red-700 focus:text-red-800"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link to="/login">Connexion</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-sm font-medium transition-colors hover:text-red-900 hover:bg-red-50 rounded-md ${
                    location.pathname === item.href
                      ? "text-red-900 bg-red-50"
                      : "text-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="px-3 py-2 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-200 text-red-700 hover:bg-red-50 text-sm"
                  asChild
                >
                  <Link
                    to="/chatbot?section=app-download"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    App Mobile
                  </Link>
                </Button>

                <Button
                  asChild
                  className="w-full bg-red-900 hover:bg-red-800 text-sm"
                  size="sm"
                >
                  <Link to="/chatbot" onClick={() => setIsMenuOpen(false)}>
                    Assistant IA
                  </Link>
                </Button>

                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full text-sm"
                      size="sm"
                    >
                      <Link
                        to={dashboardPath}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Mon espace
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      size="sm"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    asChild
                    className="w-full text-sm"
                    size="sm"
                  >
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
