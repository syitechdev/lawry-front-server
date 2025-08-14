
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Scale, Menu, X, ChevronDown, Download, Smartphone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'À propos', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Formation', href: '/formation' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-red-900" />
            <span className="text-base sm:text-xl font-bold text-gray-900 truncate">Lawry Conseils CI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-red-900 ${
                  location.pathname === item.href ? 'text-red-900' : 'text-gray-700'
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
            <Button asChild className="bg-red-900 hover:bg-red-800 text-xs px-3">
              <Link to="/chatbot">Assistant IA</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link to="/login">Connexion</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                    location.pathname === item.href ? 'text-red-900 bg-red-50' : 'text-gray-700'
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
                  <Link to="/chatbot?section=app-download" onClick={() => setIsMenuOpen(false)}>
                    <Smartphone className="h-4 w-4 mr-2" />
                    App Mobile
                  </Link>
                </Button>
                <Button asChild className="w-full bg-red-900 hover:bg-red-800 text-sm" size="sm">
                  <Link to="/chatbot" onClick={() => setIsMenuOpen(false)}>Assistant IA</Link>
                </Button>
                <Button variant="outline" asChild className="w-full text-sm" size="sm">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
