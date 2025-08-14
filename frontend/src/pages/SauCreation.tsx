
import Header from "@/components/Header";
import SauCreationForm from "@/components/forms/SauCreationForm";

const SauCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <SauCreationForm />
      </div>
    </div>
  );
};

export default SauCreation;
