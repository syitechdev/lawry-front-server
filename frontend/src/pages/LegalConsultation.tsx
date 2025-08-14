
import Header from "@/components/Header";
import LegalConsultationForm from "@/components/forms/LegalConsultationForm";
import { Scale, FileText, Clock, Users, Shield, CheckCircle } from "lucide-react";

const LegalConsultation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-red-900 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Consultation Juridique Personnalisée
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-red-100">
            Obtenez des conseils juridiques experts adaptés à votre situation avec nos juristes qualifiés
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
            {[
              { icon: Scale, title: "Expertise", desc: "Conseils de juristes qualifiés" },
              { icon: FileText, title: "Personnalisé", desc: "Analyse de votre situation" },
              { icon: Shield, title: "Confidentiel", desc: "Secret professionnel garanti" },
              { icon: Clock, title: "Rapide", desc: "Réponse sous 48h à 5 jours" },
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

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Services de Consultation
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Des conseils juridiques dans tous les domaines du droit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Droit des Affaires",
                description: "Conseil en création d'entreprise, contrats commerciaux, fusions-acquisitions",
                price: "À partir de 50 000 FCFA"
              },
              {
                title: "Droit du Travail",
                description: "Licenciements, contrats de travail, conflits employeur-employé",
                price: "À partir de 50 000 FCFA"
              },
              {
                title: "Droit Immobilier",
                description: "Transactions immobilières, baux, copropriété, urbanisme",
                price: "À partir de 50 000 FCFA"
              },
              {
                title: "Droit de la Famille",
                description: "Divorce, succession, adoption, protection des mineurs",
                price: "À partir de 50 000 FCFA"
              },
              {
                title: "Droit Fiscal",
                description: "Optimisation fiscale, contrôles fiscaux, contentieux fiscal",
                price: "À partir de 50 000 FCFA"
              },
              {
                title: "Droit des Contrats",
                description: "Rédaction, analyse et négociation de contrats",
                price: "À partir de 50 000 FCFA"
              }
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <p className="text-red-900 font-semibold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <LegalConsultationForm />
      </section>

      {/* Guarantees Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Garanties
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Confidentialité Absolue",
                description: "Toutes vos informations sont protégées par le secret professionnel"
              },
              {
                icon: CheckCircle,
                title: "Qualité Garantie",
                description: "Conseils fournis par des juristes expérimentés et qualifiés"
              },
              {
                icon: Users,
                title: "Suivi Personnalisé",
                description: "Un interlocuteur dédié pour votre dossier"
              }
            ].map((guarantee, index) => (
              <div key={index} className="text-center p-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <guarantee.icon className="h-8 w-8 text-red-900" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">{guarantee.title}</h3>
                <p className="text-gray-600">{guarantee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalConsultation;
