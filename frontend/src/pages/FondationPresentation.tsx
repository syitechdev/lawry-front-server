
import LegalFormPresentation from "@/components/LegalFormPresentation";

const FondationPresentation = () => {
  const fondationData = {
    title: "Fondation",
    description: "Structure dédiée à la réalisation d'une œuvre d'intérêt général à partir d'un patrimoine affecté.",
    advantages: [
      "Pérennité de la mission",
      "Œuvre d'intérêt général",
      "Avantages fiscaux importants",
      "Reconnaissance officielle",
      "Indépendance de gestion",
      "Impact social durable"
    ],
    minCapital: "Dotation initiale substantielle requise",
    responsability: "Responsabilité des administrateurs",
    image: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "La fondation est constituée par l'affectation irrévocable de biens, droits ou ressources à la réalisation d'une œuvre d'intérêt général et à but non lucratif. Elle dispose de la personnalité morale et jouit d'une grande autonomie pour accomplir sa mission définie par le fondateur.",
    requirements: [
      "Dotation initiale substantielle",
      "Statuts définissant la mission",
      "Conseil d'administration constitué",
      "Projet détaillé de l'œuvre",
      "Budget prévisionnel pluriannuel",
      "Autorisation administrative"
    ],
    process: [
      "Constitution de la dotation et définition de l'œuvre",
      "Rédaction des statuts et constitution des organes",
      "Demande d'autorisation et reconnaissance d'utilité publique"
    ],
    faq: [
      {
        question: "Quelle est la différence avec une association ?",
        answer: "La fondation repose sur l'affectation d'un patrimoine alors que l'association repose sur l'adhésion de personnes. La fondation a une vocation plus pérenne."
      },
      {
        question: "Quel montant minimum pour la dotation ?",
        answer: "Il n'y a pas de montant légal minimum, mais la dotation doit être suffisante pour assurer durablement la réalisation de l'œuvre prévue."
      },
      {
        question: "Comment sont nommés les administrateurs ?",
        answer: "Les modalités de nomination sont définies dans les statuts, souvent par cooptation ou désignation par le fondateur pour les premiers administrateurs."
      },
      {
        question: "Une fondation peut-elle exercer des activités économiques ?",
        answer: "Oui, dans la mesure où ces activités concourent à la réalisation de l'œuvre d'intérêt général et que les bénéfices y sont affectés."
      },
      {
        question: "Comment contrôler l'utilisation des fonds ?",
        answer: "Les fondations sont soumises à un contrôle administratif et doivent produire des comptes annuels et des rapports d'activité détaillés."
      }
    ]
  };

  return <LegalFormPresentation formData={fondationData} />;
};

export default FondationPresentation;
