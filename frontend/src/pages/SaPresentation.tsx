
import LegalFormPresentation from "@/components/LegalFormPresentation";

const SaPresentation = () => {
  const saData = {
    title: "SA",
    description: "La Société Anonyme est la forme juridique idéale pour les grandes entreprises nécessitant plusieurs actionnaires et une structure de gouvernance solide.",
    advantages: [
      "Crédibilité maximale auprès des partenaires",
      "Facilité de financement et d'ouverture du capital",
      "Gouvernance structurée avec conseil d'administration",
      "Responsabilité limitée des actionnaires",
      "Possibilité d'introduction en bourse",
      "Transmission facile des actions"
    ],
    minCapital: "10 000 000 FCFA minimum",
    responsability: "Responsabilité limitée aux apports",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "La Société Anonyme (SA) est une société commerciale où le capital est divisé en actions et où les actionnaires ne sont responsables des dettes sociales qu'à concurrence de leurs apports. Elle est idéale pour les projets d'envergure nécessitant plusieurs actionnaires et une gouvernance structurée.",
    requirements: [
      "Au moins 2 actionnaires fondateurs",
      "Capital social minimum de 10 000 000 FCFA",
      "Statuts signés par tous les actionnaires",
      "Conseil d'administration ou directoire",
      "Commissaire aux comptes obligatoire",
      "Domiciliation de la société"
    ],
    process: [
      "Rédaction des statuts et constitution du dossier",
      "Dépôt du capital social en banque",
      "Enregistrement au CEPICI et obtention du RCCM",
      "Publication légale et obtention des documents officiels"
    ],
    faq: [
      {
        question: "Quelle est la différence entre SA et SARL ?",
        answer: "La SA nécessite un capital plus élevé (10M vs 1M FCFA), permet plus de flexibilité dans la gouvernance, et est mieux adaptée pour les grandes entreprises et la levée de fonds."
      },
      {
        question: "Combien d'actionnaires minimum pour une SA ?",
        answer: "Il faut au minimum 2 actionnaires pour créer une SA. Pour un actionnaire unique, optez plutôt pour une SAU."
      },
      {
        question: "Est-ce que la SA nécessite un commissaire aux comptes ?",
        answer: "Oui, la nomination d'un commissaire aux comptes est obligatoire pour toutes les SA, indépendamment de leur taille."
      },
      {
        question: "Peut-on changer le mode de gouvernance après création ?",
        answer: "Oui, il est possible de passer d'un conseil d'administration à un directoire (et vice versa) en modifiant les statuts."
      }
    ]
  };

  return <LegalFormPresentation formData={saData} />;
};

export default SaPresentation;
