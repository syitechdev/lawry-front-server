
import LegalFormPresentation from "@/components/LegalFormPresentation";

const SarluPresentation = () => {
  const sarluData = {
    title: "SARLU",
    description: "Société à Responsabilité Limitée Unipersonnelle, idéale pour les entrepreneurs individuels souhaitant limiter leur responsabilité.",
    advantages: [
      "Un seul associé requis",
      "Responsabilité limitée aux apports",
      "Patrimoine personnel protégé",
      "Crédibilité renforcée",
      "Gestion simplifiée",
      "Possibilité d'évolution vers SARL"
    ],
    minCapital: "1 000 000 FCFA minimum",
    responsability: "Responsabilité limitée aux apports",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop&crop=center",
    detailedDescription: "La SARLU (Société à Responsabilité Limitée Unipersonnelle) est une forme juridique adaptée aux entrepreneurs individuels qui souhaitent créer leur entreprise tout en bénéficiant de la protection de leur patrimoine personnel. Elle permet de séparer clairement le patrimoine de l'entreprise de celui de l'associé unique, offrant ainsi une sécurité juridique et financière optimale.",
    requirements: [
      "Pièce d'identité de l'associé unique",
      "Justificatif de domicile récent",
      "Attestation de domiciliation de l'entreprise",
      "Justificatif de dépôt du capital social",
      "Déclaration de non-condamnation",
      "Statuts de la société rédigés"
    ],
    process: [
      "Rédaction des statuts et constitution du dossier",
      "Dépôt du capital social en banque",
      "Dépôt du dossier au greffe du tribunal de commerce"
    ],
    faq: [
      {
        question: "Quelle est la différence entre une SARLU et une EURL ?",
        answer: "La SARLU est régie par le droit OHADA en Côte d'Ivoire, tandis que l'EURL est une forme française. La SARLU offre plus de flexibilité dans sa gestion et ses statuts."
      },
      {
        question: "Puis-je avoir des salariés dans ma SARLU ?",
        answer: "Oui, vous pouvez embaucher des salariés dans votre SARLU. L'associé unique peut également être salarié de sa propre société sous certaines conditions."
      },
      {
        question: "Comment puis-je faire évoluer ma SARLU en SARL ?",
        answer: "Vous pouvez transformer votre SARLU en SARL en accueillant de nouveaux associés. Cette opération nécessite une modification des statuts et un enregistrement au greffe."
      },
      {
        question: "Quel est le régime fiscal d'une SARLU ?",
        answer: "La SARLU est soumise à l'impôt sur les sociétés. L'associé unique peut opter sous certaines conditions pour l'impôt sur le revenu."
      },
      {
        question: "Combien de temps faut-il pour créer une SARLU ?",
        answer: "La création d'une SARLU prend généralement entre 7 à 15 jours ouvrables, selon la complétude du dossier et les délais administratifs."
      }
    ]
  };

  return <LegalFormPresentation formData={sarluData} />;
};

export default SarluPresentation;
