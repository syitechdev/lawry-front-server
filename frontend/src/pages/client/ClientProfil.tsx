
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Settings } from "lucide-react";
import BackofficeSidebar from "@/components/BackofficeSidebar";

const ClientProfil = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="client" userName="Jean Kouassi" userEmail="jean@email.com" />
      
      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
            <p className="text-red-100">Gérer vos informations personnelles et sécurité</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mon Profil & Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Informations personnelles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Nom complet</label>
                  <p className="font-medium">Jean Kouassi</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">jean@email.com</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Sécurité</h4>
              <div className="space-y-2">
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Authentification 2FA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfil;
