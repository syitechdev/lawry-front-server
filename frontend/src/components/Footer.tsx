import {
  Scale,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              <span className="text-lg sm:text-xl font-bold">
                Lawry Conseils CI
              </span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md text-sm sm:text-base">
              Votre partenaire de confiance pour tous vos besoins juridiques.
              Expertise, professionnalisme et accompagnement personnalisé.
            </p>

            {/* Bouton App Mobile */}
            {/* <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs sm:text-sm w-full sm:w-auto"
                asChild
              >
                <Link to="/chatbot?section=app-download">
                  <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Télécharger l'app mobile
                </Link>
              </Button>
            </div> */}

            <div className="flex justify-center sm:justify-start space-x-4">
              <a
                href="https://www.facebook.com/lawryconsulting"
                target="_blank"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>

              <a
                href="https://www.linkedin.com/company/lawry-conseil-assistance-juridique/"
                target="_blank"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-300 text-sm">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                <span>+225 0101987580</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-300 text-sm">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                <span>contact.lawryconsulting@gmail.com</span>
              </div>
              <div className="flex items-start justify-center sm:justify-start space-x-2 text-gray-300 text-sm">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mt-1" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-300 text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                <span>Lun-Ven: 8h-18h</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Liens rapides
            </h3>
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-gray-300 hover:text-red-500 transition-colors text-sm"
              >
                Accueil
              </Link>
              <Link
                to="/about"
                className="block text-gray-300 hover:text-red-500 transition-colors text-sm"
              >
                À propos
              </Link>
              <Link
                to="/services"
                className="block text-gray-300 hover:text-red-500 transition-colors text-sm"
              >
                Nos Services
              </Link>
              <Link
                to="/chatbot"
                className="block text-gray-300 hover:text-red-500 transition-colors text-sm"
              >
                Assistant IA
              </Link>
              <Link
                to="/chatbot?section=app-download"
                className="block text-gray-300 hover:text-red-500 transition-colors text-sm"
              >
                App Mobile
              </Link>
              <Link
                to="/blog"
                className="block text-gray-300 hover:text-red-500 transition-colors text-sm"
              >
                Blog
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            © 2024 Lawry Conseils CI. Tous droits réservés.
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-center">
            <a
              href="/politique-de-confidentialite"
              className="text-gray-400 hover:text-red-500 text-xs sm:text-sm transition-colors"
            >
              Mentions légales
            </a>
            <a
              href="/politique-de-confidentialite"
              className="text-gray-400 hover:text-red-500 text-xs sm:text-sm transition-colors"
            >
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
