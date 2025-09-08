import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart as BuyIcon, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { listPublicBoutiques, BoutiqueItem } from "@/services/boutiques";
import BuyModal from "@/components/modals/BuyModal";
import { listPublicCategories, type CategoryItem } from "@/services/categories";

const Boutique = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BoutiqueItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [selected, setSelected] = useState<BoutiqueItem | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const fetchItems = async (p = 1, cat: number | null = selectedCat) => {
    setLoading(true);
    try {
      const res = await listPublicBoutiques({
        page: p,
        per_page: 12,
        category_id: cat ?? undefined,
      });
      setItems(res.data);
      setPage(res.current_page);
      setLastPage(res.last_page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
    //
    (async () => {
      try {
        const cats = await listPublicCategories();
        setCategories(cats);
      } catch {}
    })();
  }, []);

  const applyFilter = (catId: number | null) => {
    setSelectedCat(catId);
    fetchItems(1, catId);
  };

  const openBuy = (product: BoutiqueItem) => {
    setSelected(product);
    setBuyOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Boutique Juridique
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Découvrez nos produits et services juridiques pour accompagner votre
            entreprise et vos projets personnels.
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center mb-6 sm:mb-8 px-2 sm:px-0">
          {/* Boutons catégories scrollables */}
          <div className="flex overflow-x-auto gap-2 sm:gap-4 pb-2 scrollbar-hide">
            <Button
              variant={selectedCat === null ? "default" : "outline"}
              className="flex-shrink-0 text-xs sm:text-sm"
              onClick={() => applyFilter(null)}
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Tous
            </Button>

            {categories.map((c) => (
              <Button
                key={c.id}
                variant={selectedCat === c.id ? "default" : "outline"}
                className="flex-shrink-0 text-xs sm:text-sm"
                onClick={() => applyFilter(c.id)}
              >
                {c.name}
              </Button>
            ))}
          </div>

          {/* <Button
            className="bg-red-900 hover:bg-red-800 text-sm w-full sm:w-auto"
            asChild
          >
            <Link to="/cart">
              <BuyIcon className="mr-2 h-4 w-4" />
              Voir le panier
            </Link>
          </Button> */}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-80 bg-gray-200 rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
            {items.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={
                      product.image_url ||
                      "https://placehold.co/600x600?text=Boutique"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {product.category_name ?? product.code}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {(product.rating || 4.8).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 text-base sm:text-lg">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg sm:text-2xl font-bold text-red-900">
                      {product.price_cfa.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-red-900 hover:bg-red-800 text-sm"
                      onClick={() => openBuy(product)}
                    >
                      <BuyIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Acheter
                    </Button>
                    {/* <Button
                      variant="outline"
                      className="w-full text-sm"
                      asChild
                    >
                      <Link to={`/produits/${product.id}`}>En savoir plus</Link>
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination simple */}
        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => fetchItems(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-sm">
              Page {page} / {lastPage}
            </span>
            <Button
              variant="outline"
              disabled={page >= lastPage}
              onClick={() => fetchItems(page + 1)}
            >
              Suivant
            </Button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 sm:mt-16 bg-red-900 rounded-lg p-6 sm:p-8 text-center text-white mx-2 sm:mx-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Besoin d'un service personnalisé ?
          </h2>
          <p className="mb-6 text-sm sm:text-base">
            Nos experts sont à votre disposition pour créer des documents sur
            mesure.
          </p>
          <Button
            className="bg-white text-red-900 hover:bg-gray-100 text-sm px-6"
            asChild
          >
            <Link to="/contact">Demander un devis</Link>
          </Button>
        </div>
      </main>

      {/* Modal d'achat */}
      <BuyModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        product={
          selected
            ? {
                id: selected.id,
                name: selected.name,
                price_cfa: selected.price_cfa,
              }
            : null
        }
      />

      <Footer />
    </div>
  );
};

export default Boutique;
