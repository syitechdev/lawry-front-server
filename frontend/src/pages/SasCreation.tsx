
import React from 'react';
import Header from "@/components/Header";
import SasCreationForm from "@/components/forms/SasCreationForm";

const SasCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <SasCreationForm />
      </div>
    </div>
  );
};

export default SasCreation;
