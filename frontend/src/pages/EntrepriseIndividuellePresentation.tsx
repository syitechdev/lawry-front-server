
import LegalFormPresentation from "@/components/LegalFormPresentation";

const EntrepriseIndividuellePresentation = () => {
  const entrepriseIndividuelleData = {
    title: "Entreprise individuelle",
    description: "Structure simple pour exercer une activité commerciale, artisanale ou libérale en nom propre.",
    advantages: [
      "Simplicité de création et de gestion",
      "Aucun capital minimum requis",
      "Fiscalité avantageuse",
      "Démarches administratives réduites",
      "Contrôle total de l'activité",
      "Possibilité d'évolution vers société"
    ],
    minCapital: "Aucun capital minimum",
    responsability: "Responsabilité illimitée sur patrimoine personnel",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face",
    detailedDescription: "L'entreprise individuelle est la forme la plus simple d'exercer une activité économique en nom propre. Elle permet à une personne physique d'exercer une activité commerciale, artisanale ou libérale sans créer de personne morale distincte. L'entrepreneur et l'entreprise ne forment qu'une seule et même entité juridique.",
    requirements: [
      "Pièce d'identité du dirigeant",
      "Justificatif de domicile récent",
      "Attestation de domiciliation professionnelle",
      "Déclaration d'activité",
      "Certificat de non-condamnation",
      "Autorisation d'exercer si activité réglementée"
    ],
    process: [
      "Choix du nom commercial et vérification de disponibilité",
      "Constitution du dossier d'immatriculation",
      "Dépôt du dossier au Centre de Formalités des Entreprises"
    ],
    faq: [
      {
        question: "Quelle est la différence avec une société ?",
        answer: "L'entreprise individuelle n'a pas de personnalité juridique distincte. L'entrepreneur engage sa responsabilité personnelle illimitée, contrairement aux sociétés où la responsabilité est limitée aux apports."
      },
      {
        question: "Puis-je embaucher des salariés ?",
        answer: "Oui, une entreprise individuelle peut embaucher des salariés. L'entrepreneur devient alors employeur avec les obligations sociales correspondantes."
      },
      {
        question: "Comment protéger mon patrimoine personnel ?",
        answer: "Il existe des mécanismes de protection comme la déclaration d'insaisissabilité devant notaire pour protéger la résidence principale."
      },
      {
        question: "Quel régime fiscal s'applique ?",
        answer: "L'entrepreneur est imposé directement sur les bénéfices de l'entreprise selon le barème de l'impôt sur le revenu des personnes physiques."
      },
      {
        question: "Peut-on transformer une entreprise individuelle en société ?",
        answer: "Oui, il est possible de transformer une entreprise individuelle en société par un processus d'apport en société."
      }
    ]
  };

  return <LegalFormPresentation formData={entrepriseIndividuelleData} />;
};

export default EntrepriseIndividuellePresentation;
