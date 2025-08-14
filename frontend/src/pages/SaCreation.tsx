
import Header from "@/components/Header";
import SaCreationForm from "@/components/forms/SaCreationForm";

const SaCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <SaCreationForm />
      </div>
    </div>
  );
};

export default SaCreation;
