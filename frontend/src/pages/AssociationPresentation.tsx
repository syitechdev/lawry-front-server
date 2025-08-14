
import LegalFormPresentation from "@/components/LegalFormPresentation";

const AssociationPresentation = () => {
  const associationData = {
    title: "Association",
    description: "Structure à but non lucratif pour des activités d'intérêt général ou d'intérêt commun.",
    advantages: [
      "But non lucratif",
      "Gestion démocratique",
      "Avantages fiscaux",
      "Liberté d'organisation",
      "Mobilisation citoyenne",
      "Souplesse de fonctionnement"
    ],
    minCapital: "Aucun capital requis",
    responsability: "Responsabilité des dirigeants limitée",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop&crop=center",
    detailedDescription: "L'association est un groupement de personnes réunies de manière permanente dans un but autre que de partager des bénéfices. Elle peut avoir des objectifs très variés : culturels, sportifs, éducatifs, caritatifs, etc. C'est une forme juridique souple qui favorise l'engagement citoyen et la vie sociale.",
    requirements: [
      "Minimum 3 membres fondateurs",
      "Statuts rédigés et signés",
      "Procès-verbal d'assemblée constitutive",
      "Liste des membres du bureau",
      "Déclaration des dirigeants",
      "Siège social défini"
    ],
    process: [
      "Rédaction des statuts et assemblée constitutive",
      "Élection du bureau et des organes dirigeants",
      "Déclaration officielle et publication au journal officiel"
    ],
    faq: [
      {
        question: "Une association peut-elle faire des bénéfices ?",
        answer: "Oui, mais ils doivent être réinvestis dans l'objet social et ne peuvent pas être distribués aux membres."
      },
      {
        question: "Quelles sont les obligations comptables ?",
        answer: "Les associations doivent tenir une comptabilité simplifiée. Pour les plus importantes, une comptabilité plus détaillée peut être exigée."
      },
      {
        question: "Comment modifier les statuts ?",
        answer: "La modification des statuts nécessite une assemblée générale extraordinaire avec les conditions de quorum et de majorité prévues dans les statuts."
      },
      {
        question: "Une association peut-elle employer des salariés ?",
        answer: "Oui, une association peut embaucher des salariés et devient alors soumise au droit du travail comme tout employeur."
      },
      {
        question: "Comment dissoudre une association ?",
        answer: "La dissolution volontaire se fait en assemblée générale. En cas de dissolution, les biens sont dévolus conformément aux statuts."
      }
    ]
  };

  return <LegalFormPresentation formData={associationData} />;
};

export default AssociationPresentation;
