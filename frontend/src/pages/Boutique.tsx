
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const Boutique = () => {
  const { addToCart } = useCart();

  const products = [
    {
      id: 1,
      name: "Pack Création d'Entreprise",
      description: "Tous les documents nécessaires pour créer votre entreprise en Côte d'Ivoire",
      price: "50,000",
      rating: 4.8,
      category: "Création d'entreprise",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
      serviceLink: "/creer-entreprise"
    },
    {
      id: 2,
      name: "Modèles de Contrats de Travail",
      description: "CDD, CDI, contrats de stage - Tous conformes au droit ivoirien",
      price: "25,000",
      rating: 4.9,
      category: "Droit du travail",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&h=300&fit=crop",
      serviceLink: "/redaction-contrat"
    },
    {
      id: 3,
      name: "Pack Immobilier",
      description: "Contrats de bail, promesses de vente, états des lieux",
      price: "35,000",
      rating: 4.7,
      category: "Droit immobilier",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&h=300&fit=crop",
      serviceLink: "/services"
    }
  ];

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category
    });
    toast.success(`${product.name} ajouté au panier !`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Boutique Juridique
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Découvrez nos produits et services juridiques pour accompagner 
            votre entreprise et vos projets personnels.
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center mb-6 sm:mb-8 px-2 sm:px-0">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Button variant="outline" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Tous les produits</span>
            </Button>
            <Button variant="outline" className="text-xs sm:text-sm">Création d'entreprise</Button>
            <Button variant="outline" className="text-xs sm:text-sm">Droit du travail</Button>
            <Button variant="outline" className="text-xs sm:text-sm hidden sm:inline-flex">Droit immobilier</Button>
            <Button variant="outline" className="text-xs sm:text-sm hidden sm:inline-flex">Droit commercial</Button>
          </div>
          
          <Button className="bg-red-900 hover:bg-red-800 text-sm w-full sm:w-auto" asChild>
            <Link to="/cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Voir le panier
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm text-gray-600">{product.rating}</span>
                  </div>
                </div>
                <CardTitle className="line-clamp-2 text-base sm:text-lg">{product.name}</CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg sm:text-2xl font-bold text-red-900">
                    {product.price} FCFA
                  </span>
                </div>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-red-900 hover:bg-red-800 text-sm"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Ajouter au panier
                  </Button>
                  <Button variant="outline" className="w-full text-sm" asChild>
                    <Link to={product.serviceLink}>
                      En savoir plus
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 bg-red-900 rounded-lg p-6 sm:p-8 text-center text-white mx-2 sm:mx-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Besoin d'un service personnalisé ?
          </h2>
          <p className="mb-6 text-sm sm:text-base">
            Nos experts sont à votre disposition pour créer des documents sur mesure.
          </p>
          <Button className="bg-white text-red-900 hover:bg-gray-100 text-sm px-6" asChild>
            <Link to="/contact">Demander un devis</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Boutique;
