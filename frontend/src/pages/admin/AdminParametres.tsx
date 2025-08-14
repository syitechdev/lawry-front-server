
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BackofficeSidebar from "@/components/BackofficeSidebar";

const AdminParametres = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50">
      <BackofficeSidebar userRole="admin" userName="Admin Lawry" userEmail="admin@lawry.ci" />
      
      <div className="ml-80 px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-900 to-red-800 text-white rounded-2xl p-6 shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Paramètres & Sécurité</h1>
            <p className="text-red-100">Configuration système et gestion des accès</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Configuration système et gestion des accès à développer...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminParametres;
