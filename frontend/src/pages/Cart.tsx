
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base px-4">
              Découvrez nos produits juridiques et ajoutez-les à votre panier.
            </p>
            <Button className="bg-red-900 hover:bg-red-800 text-sm px-6" asChild>
              <Link to="/boutique">
                Parcourir la boutique
              </Link>
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Mon Panier
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {items.length} produit{items.length > 1 ? 's' : ''} dans votre panier
            </p>
          </div>
          <Button variant="outline" className="text-sm w-full sm:w-auto" asChild>
            <Link to="/boutique">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuer mes achats
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden mx-auto sm:mx-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{item.category}</p>
                      <p className="font-bold text-red-900 mt-1 text-sm sm:text-base">
                        {item.price} FCFA
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 w-8 h-8 p-0 mx-auto sm:mx-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center sm:justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Vider le panier
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                      <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                      <span className="whitespace-nowrap">
                        {formatPrice(parseInt(item.price.replace(/[^0-9]/g, '')) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Total</span>
                    <span className="text-red-900">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-red-900 hover:bg-red-800 text-sm">
                  Procéder au paiement
                </Button>

                <div className="text-center text-xs sm:text-sm text-gray-600">
                  <p>Paiement sécurisé</p>
                  <p>Livraison par email sous 24h</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
