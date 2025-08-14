
import LegalFormPresentation from "@/components/LegalFormPresentation";

const SciPresentation = () => {
  const sciData = {
    title: "SCI",
    description: "Société Civile Immobilière, dédiée à la gestion et à l'investissement immobilier.",
    advantages: [
      "Gestion facilitée du patrimoine immobilier",
      "Transmission progressive du patrimoine",
      "Fiscalité adaptée à l'immobilier",
      "Protection des biens immobiliers",
      "Souplesse dans la gestion familiale"
    ],
    minCapital: "Pas de capital minimum légal",
    responsability: "Responsabilité indéfinie et solidaire",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "La SCI (Société Civile Immobilière) est une société civile dont l'objet est limité à des opérations civiles immobilières. Elle permet de détenir, gérer et transmettre un patrimoine immobilier de manière optimisée, particulièrement adaptée aux projets familiaux ou d'investissement.",
    requirements: [
      "Minimum 2 associés",
      "Objet social exclusivement civil",
      "Statuts rédigés par écrit",
      "Capital social constitué d'apports",
      "Gérant désigné dans les statuts",
      "Immatriculation facultative mais recommandée"
    ],
    process: [
      "Définition de l'objet social et rédaction des statuts",
      "Constitution des apports immobiliers ou financiers",
      "Immatriculation et publication des annonces légales"
    ],
    faq: [
      {
        question: "Quels sont les avantages fiscaux d'une SCI ?",
        answer: "La SCI peut opter pour l'impôt sur les sociétés ou rester à l'impôt sur le revenu. Elle permet aussi une transmission progressive via les donations de parts."
      },
      {
        question: "Une SCI peut-elle faire de la location meublée ?",
        answer: "Non, la location meublée est considérée comme une activité commerciale incompatible avec l'objet civil d'une SCI."
      },
      {
        question: "Comment fonctionne la gérance d'une SCI ?",
        answer: "Le gérant est désigné dans les statuts et dispose des pouvoirs les plus étendus pour agir au nom de la société dans la limite de l'objet social."
      },
      {
        question: "Peut-on créer une SCI familiale ?",
        answer: "Oui, la SCI familiale est très courante pour gérer un patrimoine immobilier familial et faciliter sa transmission."
      },
      {
        question: "Quelles sont les obligations comptables d'une SCI ?",
        answer: "Une SCI doit tenir une comptabilité simplifiée et établir des comptes annuels si elle opte pour l'impôt sur les sociétés."
      }
    ]
  };

  return <LegalFormPresentation formData={sciData} />;
};

export default SciPresentation;
