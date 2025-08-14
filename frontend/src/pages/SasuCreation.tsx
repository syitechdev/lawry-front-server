
import React from 'react';
import Header from "@/components/Header";
import SasuCreationForm from "@/components/forms/SasuCreationForm";

const SasuCreation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Header />
      <div className="py-8">
        <SasuCreationForm />
      </div>
    </div>
  );
};

export default SasuCreation;
