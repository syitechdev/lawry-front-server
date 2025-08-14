
import Header from "@/components/Header";
import ContractCreationForm from "@/components/forms/ContractCreationForm";
import { FileText, Shield, Clock, Users } from "lucide-react";

const ContractCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Rédaction de Contrat Personnalisé
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Créez votre contrat sur mesure en 7 étapes simples avec l'aide de nos juristes experts
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            {[
              { icon: Users, title: "Identification", desc: "Des parties au contrat" },
              { icon: FileText, title: "Obligations", desc: "Définition claire des engagements" },
              { icon: Shield, title: "Protection", desc: "Clauses de sécurité juridique" },
              { icon: Clock, title: "Rapidité", desc: "Livraison sous 48h à 5 jours" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-red-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <ContractCreationForm />
      </section>
    </div>
  );
};

export default ContractCreation;
