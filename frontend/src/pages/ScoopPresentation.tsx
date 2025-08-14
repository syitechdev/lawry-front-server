
import LegalFormPresentation from "@/components/LegalFormPresentation";

const ScoopPresentation = () => {
  const scoopData = {
    title: "SCOOP",
    description: "Société Coopérative, basée sur la participation démocratique et l'économie sociale et solidaire.",
    advantages: [
      "Gestion démocratique (1 personne = 1 voix)",
      "Partage équitable des bénéfices",
      "Engagement social et solidaire",
      "Avantages fiscaux spécifiques",
      "Pérennité et transmission facilitée"
    ],
    minCapital: "Variable selon le type de coopérative",
    responsability: "Responsabilité limitée aux apports",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "La SCOOP (Société Coopérative) est une forme d'entreprise basée sur les principes de solidarité, de démocratie et d'équité. Elle réunit des personnes ayant des besoins communs et qui souhaitent prendre en main leur développement économique et social de manière démocratique.",
    requirements: [
      "Minimum 7 membres fondateurs",
      "Adhésion aux valeurs coopératives",
      "Statuts conformes aux principes coopératifs",
      "Capital social constitué de parts sociales",
      "Assemblée générale constitutive",
      "Enregistrement auprès des autorités compétentes"
    ],
    process: [
      "Formation du groupe et définition du projet coopératif",
      "Rédaction des statuts et constitution du capital",
      "Enregistrement officiel et lancement de l'activité"
    ],
    faq: [
      {
        question: "Quels sont les types de coopératives existants ?",
        answer: "Il existe plusieurs types : coopératives de consommateurs, de producteurs, de travailleurs, agricoles, de crédit, etc. Chacune répond à des besoins spécifiques."
      },
      {
        question: "Comment fonctionne la prise de décision en coopérative ?",
        answer: "Les décisions sont prises démocratiquement en assemblée générale selon le principe 'une personne = une voix', indépendamment du nombre de parts détenues."
      },
      {
        question: "Peut-on créer une coopérative avec moins de 7 membres ?",
        answer: "Non, le minimum légal est de 7 membres fondateurs pour constituer une coopérative, sauf dispositions particulières selon le type."
      },
      {
        question: "Comment sont partagés les bénéfices en coopérative ?",
        answer: "Les bénéfices sont partagés selon les règles définies dans les statuts, souvent proportionnellement à l'activité de chaque membre avec la coopérative."
      },
      {
        question: "Une coopérative peut-elle faire faillite ?",
        answer: "Oui, comme toute entreprise, mais les coopératives ont généralement une meilleure résistance aux crises grâce à leur modèle participatif et solidaire."
      }
    ]
  };

  return <LegalFormPresentation formData={scoopData} />;
};

export default ScoopPresentation;
