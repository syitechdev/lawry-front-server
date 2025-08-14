
import Header from "@/components/Header";
import SarluCreationForm from "@/components/forms/SarluCreationForm";

const SarluCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <SarluCreationForm />
      </div>
    </div>
  );
};

export default SarluCreation;
