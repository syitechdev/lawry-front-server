
import Header from "@/components/Header";
import SarluCreationFormNew from "@/components/forms/SarluCreationFormNew";

const SarluCreationNew = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <SarluCreationFormNew />
      </div>
    </div>
  );
};

export default SarluCreationNew;
