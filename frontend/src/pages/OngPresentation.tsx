
import LegalFormPresentation from "@/components/LegalFormPresentation";

const OngPresentation = () => {
  const ongData = {
    title: "ONG",
    description: "Organisation Non Gouvernementale pour les activités à but non lucratif d'intérêt général.",
    advantages: [
      "Objectif social et humanitaire",
      "Exonérations fiscales importantes",
      "Accès aux financements internationaux",
      "Partenariats avec institutions publiques",
      "Reconnaissance internationale",
      "Impact social positif"
    ],
    minCapital: "Variable selon l'activité et les bailleurs",
    responsability: "Responsabilité des dirigeants selon les statuts",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "Une ONG (Organisation Non Gouvernementale) est une association privée à but non lucratif qui œuvre dans des domaines d'intérêt général tels que l'aide humanitaire, le développement, l'environnement, les droits humains. Elle jouit d'une indépendance vis-à-vis des pouvoirs publics et peut bénéficier de financements diversifiés.",
    requirements: [
      "Statuts conformes à la législation",
      "Conseil d'administration constitué",
      "Objet social d'intérêt général",
      "Budget prévisionnel",
      "Déclaration des dirigeants",
      "Justificatifs d'expérience dans le domaine"
    ],
    process: [
      "Définition de la mission et rédaction des statuts",
      "Constitution des organes dirigeants",
      "Déclaration officielle et obtention des agréments"
    ],
    faq: [
      {
        question: "Quelle est la différence entre ONG et association ?",
        answer: "L'ONG a généralement une dimension internationale et des activités d'intérêt général plus importantes. Elle peut bénéficier d'agréments spécifiques et de financements internationaux."
      },
      {
        question: "Comment obtenir des financements ?",
        answer: "Les ONG peuvent obtenir des financements auprès de bailleurs internationaux, de fondations, par des subventions publiques ou des dons privés."
      },
      {
        question: "Quelles sont les obligations de reporting ?",
        answer: "Les ONG doivent produire des rapports d'activité et financiers réguliers, particulièrement exigés par les bailleurs de fonds."
      },
      {
        question: "Peut-on exercer des activités économiques ?",
        answer: "Oui, mais de manière accessoire et liée à l'objet social. Les revenus doivent être réinvestis dans la mission sociale."
      },
      {
        question: "Comment dissoudre une ONG ?",
        answer: "La dissolution suit les modalités prévues dans les statuts et nécessite l'accord des organes dirigeants ainsi que la liquidation des biens."
      }
    ]
  };

  return <LegalFormPresentation formData={ongData} />;
};

export default OngPresentation;
