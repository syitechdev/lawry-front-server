import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import BackofficeSidebar from "@/components/BackofficeSidebar";

const ClientBoutique = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar
        userRole="client"
        userName="Jean Kouassi"
        userEmail="jean@email.com"
      />

      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Boutique Juridique</h1>
            <p className="text-blue-100">Vos achats et modèles disponibles</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes Achats - Boutique Juridique</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Accédez à vos modèles et documents achetés
            </p>
            <Button className="bg-red-900 hover:bg-red-800" asChild>
              <Link to="/boutique">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Parcourir la boutique
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientBoutique;
