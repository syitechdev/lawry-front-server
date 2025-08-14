
import Header from "@/components/Header";
import SarlCreationForm from "@/components/forms/SarlCreationForm";

const SarlCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <SarlCreationForm />
      </div>
    </div>
  );
};

export default SarlCreation;
