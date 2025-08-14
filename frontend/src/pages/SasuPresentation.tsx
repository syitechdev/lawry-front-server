
import React from 'react';
import LegalFormPresentation from '@/components/LegalFormPresentation';

const SasuPresentation = () => {
  const sasuData = {
    title: "SASU",
    description: "La Société par Actions Simplifiée Unipersonnelle (SASU) est une forme juridique adaptée aux entrepreneurs individuels souhaitant bénéficier d'une structure souple et d'une responsabilité limitée.",
    advantages: [
      "Responsabilité limitée au montant des apports",
      "Régime fiscal avantageux (IS ou IR)",
      "Flexibilité dans l'organisation",
      "Possibilité de s'associer ultérieurement",
      "Protection patrimoniale",
      "Crédibilité vis-à-vis des partenaires"
    ],
    minCapital: "1 euro minimum (recommandé : 1000€ à 10000€)",
    responsability: "Limitée aux apports",
    image: "/lovable-uploads/58eeab48-482f-4e0a-ba88-27030b1aab79.png",
    detailedDescription: "La SASU (Société par Actions Simplifiée Unipersonnelle) est la version unipersonnelle de la SAS. Elle permet à un entrepreneur unique de créer une société avec une grande liberté statutaire tout en bénéficiant d'une responsabilité limitée. La SASU est particulièrement adaptée aux projets innovants et aux activités nécessitant une crédibilité commerciale.",
    requirements: [
      "Un actionnaire unique (personne physique ou morale)",
      "Un président (peut être l'actionnaire unique)",
      "Capital social minimum de 1 euro",
      "Statuts rédigés et signés",
      "Justificatif de domiciliation",
      "Attestation de dépôt des fonds"
    ],
    process: [
      "Rédaction des statuts et définition du capital",
      "Dépôt du capital et domiciliation",
      "Publication d'une annonce légale",
      "Constitution du dossier d'immatriculation",
      "Dépôt au greffe du tribunal de commerce"
    ],
    faq: [
      {
        question: "Quelle est la différence entre SAS et SASU ?",
        answer: "La SASU est la version unipersonnelle de la SAS. Elle ne compte qu'un seul actionnaire, tandis que la SAS en compte au minimum deux."
      },
      {
        question: "Quel est le capital minimum pour créer une SASU ?",
        answer: "Le capital minimum légal est de 1 euro, mais il est recommandé d'avoir un capital entre 1000€ et 10000€ pour la crédibilité."
      },
      {
        question: "Le président de SASU peut-il être salarié ?",
        answer: "Oui, le président peut cumuler mandat social et contrat de travail sous certaines conditions, notamment l'existence de liens de subordination."
      },
      {
        question: "Comment est taxée une SASU ?",
        answer: "Par défaut, la SASU est soumise à l'impôt sur les sociétés (IS). L'actionnaire unique peut opter pour l'impôt sur le revenu (IR) pendant 5 ans maximum."
      },
      {
        question: "Peut-on transformer une SASU en SAS ?",
        answer: "Oui, il suffit d'accueillir de nouveaux actionnaires et de modifier les statuts en conséquence."
      }
    ]
  };

  return <LegalFormPresentation formData={sasuData} />;
};

export default SasuPresentation;
