
import Header from "@/components/Header";
import EntrepriseIndividuelleCreationForm from "@/components/forms/EntrepriseIndividuelleCreationForm";

const EntrepriseIndividuelleCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <EntrepriseIndividuelleCreationForm />
      </div>
    </div>
  );
};

export default EntrepriseIndividuelleCreation;
