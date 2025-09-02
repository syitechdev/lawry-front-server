import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BackofficeSidebar from "@/components/BackofficeSidebar";

const ClientPaiements = () => {
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
            <h1 className="text-3xl font-bold mb-2">Mes Paiements</h1>
            <p className="text-blue-100">
              Gestion de vos factures et paiements
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes Paiements et Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Facture #FAC001</p>
                    <p className="text-sm text-gray-600">
                      Création SAS - 15/01/2024
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">150 000 FCFA</p>
                    <Badge className="bg-green-100 text-green-800">Payé</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientPaiements;
