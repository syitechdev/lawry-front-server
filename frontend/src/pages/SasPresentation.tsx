
import LegalFormPresentation from "@/components/LegalFormPresentation";

const SasPresentation = () => {
  const sasData = {
    title: "SAS",
    description: "Société par Actions Simplifiée, offrant une grande flexibilité dans l'organisation et la gestion.",
    advantages: [
      "Grande flexibilité statutaire",
      "Responsabilité limitée aux apports",
      "Facilité d'entrée et de sortie des associés",
      "Possibilité de créer différentes catégories d'actions",
      "Régime social avantageux pour le président"
    ],
    minCapital: "Pas de capital minimum légal",
    responsability: "Responsabilité limitée aux apports",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "La SAS (Société par Actions Simplifiée) est une forme juridique très appréciée des entrepreneurs pour sa souplesse de fonctionnement. Elle permet une grande liberté dans la rédaction des statuts et l'organisation de la société, tout en offrant une protection patrimoniale optimale aux associés.",
    requirements: [
      "Minimum 1 associé (pas de maximum)",
      "Capital social librement fixé",
      "Statuts rédigés obligatoirement par écrit",
      "Désignation d'un président",
      "Domiciliation de la société",
      "Immatriculation au registre du commerce"
    ],
    process: [
      "Rédaction des statuts personnalisés",
      "Constitution du capital social",
      "Enregistrement et immatriculation officielle"
    ],
    faq: [
      {
        question: "Quelle est la différence entre SAS et SARL ?",
        answer: "La SAS offre plus de flexibilité dans les statuts et la gouvernance, tandis que la SARL a un cadre juridique plus strict mais plus simple à gérer."
      },
      {
        question: "Qui peut être président d'une SAS ?",
        answer: "Le président peut être une personne physique ou morale, associée ou non. Il représente la société et a les pouvoirs les plus étendus."
      },
      {
        question: "Comment fonctionne la prise de décision en SAS ?",
        answer: "Les modalités de prise de décision sont librement définies dans les statuts, offrant une grande souplesse d'organisation."
      },
      {
        question: "Peut-on créer une SAS avec un seul associé ?",
        answer: "Oui, on parle alors de SASU (Société par Actions Simplifiée Unipersonnelle). Le fonctionnement reste similaire à une SAS classique."
      },
      {
        question: "Quel est le régime fiscal d'une SAS ?",
        answer: "Par défaut, la SAS est soumise à l'impôt sur les sociétés. Sous certaines conditions, elle peut opter pour l'impôt sur le revenu."
      }
    ]
  };

  return <LegalFormPresentation formData={sasData} />;
};

export default SasPresentation;
