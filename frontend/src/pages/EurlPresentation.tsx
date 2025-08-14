
import LegalFormPresentation from "@/components/LegalFormPresentation";

const EurlPresentation = () => {
  const eurlData = {
    title: "EURL",
    description: "Entreprise Unipersonnelle à Responsabilité Limitée, version individuelle de la SARL.",
    advantages: [
      "Responsabilité limitée aux apports",
      "Patrimoine personnel protégé",
      "Gestion simplifiée avec un seul associé",
      "Possibilité d'évolution vers SARL",
      "Régime fiscal avantageux"
    ],
    minCapital: "1 000 000 FCFA minimum",
    responsability: "Responsabilité limitée aux apports",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "L'EURL (Entreprise Unipersonnelle à Responsabilité Limitée) est la forme juridique idéale pour l'entrepreneur qui souhaite créer seul sa société tout en bénéficiant d'une protection de son patrimoine personnel. Elle fonctionne comme une SARL mais avec un seul associé.",
    requirements: [
      "Un seul associé unique",
      "Capital social minimum de 1 000 000 FCFA",
      "Statuts rédigés et signés",
      "Justificatif de domiciliation",
      "Pièce d'identité de l'associé unique",
      "Déclaration de non-condamnation"
    ],
    process: [
      "Rédaction des statuts de l'EURL",
      "Dépôt du capital social en banque",
      "Enregistrement et immatriculation officielle"
    ],
    faq: [
      {
        question: "Quelle est la différence entre EURL et auto-entrepreneur ?",
        answer: "L'EURL offre une protection patrimoniale et permet de déduire les charges, contrairement au statut d'auto-entrepreneur qui est plus simple mais moins protecteur."
      },
      {
        question: "Peut-on transformer une EURL en SARL ?",
        answer: "Oui, il suffit d'accueillir un ou plusieurs nouveaux associés. La transformation se fait par modification des statuts."
      },
      {
        question: "Qui dirige une EURL ?",
        answer: "L'EURL est dirigée par un gérant, qui peut être l'associé unique lui-même ou une personne extérieure."
      },
      {
        question: "Quel est le régime social du gérant d'EURL ?",
        answer: "Si le gérant est l'associé unique, il relève du régime des travailleurs non-salariés. S'il est tiers, il relève du régime général."
      },
      {
        question: "Comment fonctionne la prise de décision en EURL ?",
        answer: "L'associé unique prend toutes les décisions. Il doit néanmoins respecter certaines formalités pour les décisions importantes."
      }
    ]
  };

  return <LegalFormPresentation formData={eurlData} />;
};

export default EurlPresentation;
