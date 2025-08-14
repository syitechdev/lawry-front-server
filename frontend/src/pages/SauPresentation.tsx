
import LegalFormPresentation from "@/components/LegalFormPresentation";

const SauPresentation = () => {
  const sauData = {
    title: "SAU",
    description: "La Société Anonyme Unipersonnelle offre le prestige d'une SA avec la simplicité d'avoir un seul actionnaire.",
    advantages: [
      "Un seul actionnaire nécessaire",
      "Prestige maximal d'une société anonyme",
      "Structure adaptée aux grandes entreprises individuelles",
      "Responsabilité limitée aux apports",
      "Possibilité d'évolution vers une SA classique",
      "Gouvernance simplifiée"
    ],
    minCapital: "10 000 000 FCFA minimum",
    responsability: "Responsabilité limitée aux apports",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "La Société Anonyme Unipersonnelle (SAU) est une forme particulière de société anonyme qui ne compte qu'un seul actionnaire. Elle combine les avantages du statut de SA (prestige, crédibilité) avec la simplicité de gestion d'une structure unipersonnelle.",
    requirements: [
      "Un seul actionnaire fondateur",
      "Capital social minimum de 10 000 000 FCFA",
      "Statuts signés par l'actionnaire unique",
      "Nomination d'un président ou directeur général",
      "Commissaire aux comptes obligatoire",
      "Domiciliation de la société"
    ],
    process: [
      "Rédaction des statuts unipersonnels",
      "Dépôt du capital social en banque",
      "Enregistrement au CEPICI et obtention du RCCM",
      "Publication légale et obtention des documents officiels"
    ],
    faq: [
      {
        question: "Quelle est la différence entre SAU et SASU ?",
        answer: "La SAU nécessite un capital plus élevé (10M FCFA vs 10M FCFA pour la SASU) et offre plus de prestige, tandis que la SASU offre plus de flexibilité statutaire."
      },
      {
        question: "Peut-on transformer une SAU en SA ?",
        answer: "Oui, il suffit d'accueillir de nouveaux actionnaires et de modifier les statuts pour transformer une SAU en SA classique."
      },
      {
        question: "L'actionnaire unique peut-il être dirigeant ?",
        answer: "Oui, l'actionnaire unique peut cumuler les fonctions d'actionnaire et de dirigeant (président ou directeur général)."
      },
      {
        question: "La SAU nécessite-t-elle un commissaire aux comptes ?",
        answer: "Oui, comme pour toutes les SA, la nomination d'un commissaire aux comptes est obligatoire."
      }
    ]
  };

  return <LegalFormPresentation formData={sauData} />;
};

export default SauPresentation;
